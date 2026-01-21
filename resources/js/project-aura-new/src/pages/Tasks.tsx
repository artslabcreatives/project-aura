import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Task, User, UserStatus } from "@/types/task";
import { userStages, Stage } from "@/types/stage";
import { Project } from "@/types/project";
import { Department } from "@/types/department";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskDialog } from "../components/TaskDialog";
import { TaskFilters } from "@/components/TaskFilters";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { TaskListView } from "@/components/TaskListView";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { userService } from "@/services/userService";
import { departmentService } from "@/services/departmentService";
import { attachmentService } from "@/services/attachmentService";

// ✅ API payload type that avoids conflicts with Task.startStageId (string)
type TaskApiPayload = Omit<
	Partial<Task>,
	"project" | "assignee" | "projectStage" | "startStageId" | "assignedUsers"
> & {
	projectId?: number;
	assigneeId?: number;
	assigneeIds?: number[];
	projectStageId?: number;
	startStageId?: number; // ✅ numeric for API
	originalAssigneeId?: number;
};

const fixedKanbanStages: Stage[] = [
	{ id: "pending", title: "Pending", color: "bg-status-todo", order: 0, type: "user" },
	{ id: "in-progress", title: "In Progress", color: "bg-status-progress", order: 1, type: "user" },
	{ id: "complete", title: "Completed", color: "bg-status-done", order: 2, type: "user" },
];

export default function Tasks() {
	const { projectId } = useParams<{ projectId?: string }>();
	const numericProjectId = projectId ? parseInt(projectId, 10) : null;
	const { currentUser } = useUser();

	const [allTasks, setAllTasks] = useState<Task[]>([]);
	const [allProjects, setAllProjects] = useState<Project[]>([]);
	const [teamMembers, setTeamMembers] = useState<User[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProject, setSelectedProject] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [selectedAssignee, setSelectedAssignee] = useState("all");
	const [selectedTag, setSelectedTag] = useState("all");
	const [selectedDateFilter, setSelectedDateFilter] = useState("this-week");
	const { toast } = useToast();
	const [view, setView] = useState<"kanban" | "list">("kanban");

	useEffect(() => {
		const loadData = async () => {
			try {
				const projectsData = await projectService.getAll();
				setAllProjects(projectsData);

				const tasksData = await taskService.getAll();
				setAllTasks(tasksData);

				const usersData = await userService.getAll();
				setTeamMembers(usersData);

				const departmentsData = await departmentService.getAll();
				setDepartments(departmentsData);
			} catch (error) {
				console.error("Error loading data:", error);
				toast({
					title: "Error",
					description: "Failed to load data. Please try again.",
					variant: "destructive",
				});
			}
		};

		loadData();
	}, []);

	useEffect(() => {
		if (numericProjectId && allProjects.length > 0) {
			const proj = allProjects.find((p) => p.id === numericProjectId);
			setSelectedProject(proj ? proj.name : "all");
		} else {
			setSelectedProject("all");
		}
	}, [numericProjectId, allProjects]);

	const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
		try {
			const task = allTasks.find((t) => t.id === taskId);
			if (!task) return;

			const finalUpdates: Partial<Task> = { ...updates };

			if (
				updates.projectStage &&
				["pending", "in-progress", "complete"].includes(updates.projectStage)
			) {
				const targetColumn = updates.projectStage;
				finalUpdates.userStatus = targetColumn as UserStatus;

				const project = allProjects.find((p) => p.name === task.project);
				if (project) {
					let mappedStage: Stage | undefined;

					if (targetColumn === "pending") {
						mappedStage = project.stages.find(
							(s) => s.title.toLowerCase().trim() === "pending"
						);
					} else if (targetColumn === "complete") {
						mappedStage = project.stages.find((s) =>
							["completed", "complete"].includes(s.title.toLowerCase().trim())
						);
					} else if (targetColumn === "in-progress") {
						const systemTitles = [
							"suggested",
							"suggested task",
							"pending",
							"complete",
							"completed",
							"archive",
						];
						mappedStage = project.stages.find(
							(s) => !systemTitles.includes(s.title.toLowerCase().trim())
						);
					}

					if (mappedStage) {
						finalUpdates.projectStage = mappedStage.id;
					} else {
						delete finalUpdates.projectStage;
					}
				} else {
					delete finalUpdates.projectStage;
				}
			}

			const updatedTask: Task = { ...task, ...finalUpdates };

			if (finalUpdates.userStatus === "complete" && task.userStatus !== "complete") {
				const reviewingTag = "Specific Stage";
				const currentTags = updatedTask.tags || [];
				if (!currentTags.includes(reviewingTag)) {
					updatedTask.tags = [...currentTags, reviewingTag];
				}

				updatedTask.isInSpecificStage = true;
				updatedTask.completedAt = new Date().toISOString();

				const taskProject =
					allProjects.find((p) => p.id === (task.projectId ?? -1)) ||
					allProjects.find((p) => p.name === task.project);

				if (taskProject) {
					const reviewStage = taskProject.stages.find(
						(s) => s.title === "Specific Stage"
					);
					if (reviewStage) {
						updatedTask.projectStage = reviewStage.id;
					}
				}
			}

			// ✅ Build API payload WITHOUT Task.startStageId (string)
			const {
				project,
				assignee,
				projectStage,
				startStageId: startStageIdStr,
				assignedUsers,
				...cleanUpdates
			} = updatedTask;

			const updatePayload: TaskApiPayload = {
				...cleanUpdates,
				projectId: updatedTask.projectId,
				assigneeId: updatedTask.assignee
					? parseInt(teamMembers.find((m) => m.name === updatedTask.assignee)?.id || "0", 10)
					: undefined,
				projectStageId: updatedTask.projectStage
					? parseInt(String(updatedTask.projectStage), 10)
					: undefined,
				startStageId: startStageIdStr ? parseInt(String(startStageIdStr), 10) : undefined,
			};

			await taskService.update(taskId, updatePayload);

			setAllTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

			toast({
				title: "Task updated",
				description: "The task has been updated successfully.",
			});
		} catch (error) {
			console.error("Error updating task:", error);
			toast({
				title: "Error",
				description: "Failed to update task. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleTaskSave = async (
		taskData: Omit<Task, "id" | "createdAt">,
		pendingFiles?: File[],
		pendingLinks?: { name: string; url: string }[]
	) => {
		try {
			const projectId = allProjects.find((p) => p.name === taskData.project)?.id;

			const assigneeIdRaw = teamMembers.find((m) => m.name === taskData.assignee)?.id;
			const assigneeId = assigneeIdRaw ? parseInt(assigneeIdRaw, 10) : undefined;

			const projectStageId = taskData.projectStage
				? parseInt(String(taskData.projectStage), 10)
				: undefined;

			const startStageId = taskData.startStageId
				? parseInt(String(taskData.startStageId), 10)
				: undefined;

			const {
				project,
				assignee,
				projectStage,
				startStageId: _startStageIdStr,
				assignedUsers,
				...cleanTaskData
			} = taskData;

			const payload = {
				...cleanTaskData,
				projectId,
				assigneeId,
				projectStageId,
				startStageId,
			};

			if (editingTask) {
				await taskService.update(editingTask.id, payload);

				setAllTasks((prev) =>
					prev.map((task) =>
						task.id === editingTask.id
							? {
								...task,
								...cleanTaskData,
								projectId,
								projectStage: projectStageId ? String(projectStageId) : undefined,
								startStageId: startStageId ? String(startStageId) : undefined, // keep Task type happy
							}
							: task
					)
				);

				toast({ title: "Task updated", description: "The task has been updated successfully." });
			} else {
				const newTask = await taskService.create({
					...payload,
					userStatus: "pending",
				});

				if (pendingFiles?.length) {
					try {
						const uploadedAttachments = await attachmentService.uploadFiles(
							newTask.id,
							pendingFiles
						);
						newTask.attachments = [...(newTask.attachments || []), ...uploadedAttachments];
					} catch (uploadError) {
						console.error("Failed to upload attachments:", uploadError);
						toast({
							title: "Warning",
							description: "Task created but some attachments failed to upload.",
							variant: "destructive",
						});
					}
				}

				if (pendingLinks?.length) {
					try {
						for (const link of pendingLinks) {
							const uploadedLink = await attachmentService.addLink(
								newTask.id,
								link.name,
								link.url
							);
							newTask.attachments = [...(newTask.attachments || []), uploadedLink];
						}
					} catch (linkError) {
						console.error("Failed to add links:", linkError);
						toast({
							title: "Warning",
							description: "Task created but some links failed to add.",
							variant: "destructive",
						});
					}
				}

				setAllTasks((prev) => [...prev, newTask]);
				toast({ title: "Task created", description: "The task has been created successfully." });
			}

			setEditingTask(null);
		} catch (error) {
			console.error("Error saving task:", error);
			toast({
				title: "Error",
				description: "Failed to save task. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleTaskEdit = (task: Task) => {
		setEditingTask(task);
		setIsDialogOpen(true);
	};

	const handleTaskDelete = async (taskId: string) => {
		try {
			await taskService.delete(taskId);
			setAllTasks((prev) => prev.filter((task) => task.id !== taskId));
			toast({ title: "Task deleted", description: "The task has been deleted successfully." });
		} catch (error) {
			console.error("Error deleting task:", error);
			toast({
				title: "Error",
				description: "Failed to delete task. Please try again.",
				variant: "destructive",
			});
		}
	};

	const allCategorizedTasks = useMemo(() => {
		let tasksToProcess = allTasks;

		if (currentUser?.role === "team-lead") {
			const departmentMembers = teamMembers
				.filter((member) => member.department === currentUser.department)
				.map((member) => member.name);

			const currentDept = departments.find((d) => d.id === currentUser.department);
			const isDigitalDept = currentDept?.name.toLowerCase() === "digital";

			let allAllowedMembers = departmentMembers;
			if (isDigitalDept) {
				const designDept = departments.find((d) => d.name.toLowerCase() === "design");
				if (designDept) {
					const designMembers = teamMembers
						.filter((member) => member.department === designDept.id)
						.map((member) => member.name);
					allAllowedMembers = [...departmentMembers, ...designMembers];
				}
			}

			tasksToProcess = allTasks.filter((task) => {
				const isAssignedToDepartment = allAllowedMembers.includes(task.assignee);

				const taskProject =
					allProjects.find((p) => p.id === (task.projectId ?? -1)) ||
					allProjects.find((p) => p.name === task.project);

				const isProjectInDepartment = taskProject?.department?.id === currentUser.department;
				const isDesignProject =
					isDigitalDept && taskProject?.department?.name.toLowerCase() === "design";

				return isAssignedToDepartment || isProjectInDepartment || isDesignProject;
			});
		}

		return tasksToProcess
			.map((task) => {
				let fixedStageId: string | null = null;

				const project = allProjects.find((p) => p.name === task.project);
				const stage = project?.stages.find((s) => s.id === task.projectStage);

				if (stage) {
					const title = stage.title.toLowerCase().trim();
					if (title === "pending") fixedStageId = "pending";
					else if (title === "completed" || title === "complete") fixedStageId = "complete";
					else if (title.includes("suggested") || title === "archive") fixedStageId = null;
					else fixedStageId = "in-progress";
				} else {
					if (task.userStatus === "complete") fixedStageId = "complete";
					else if (task.userStatus === "pending") fixedStageId = "pending";
					else fixedStageId = "in-progress";
				}

				return { ...task, fixedStageId };
			})
			.filter((t) => t.fixedStageId !== null) as (Task & { fixedStageId: string })[];
	}, [allTasks, allProjects, currentUser, teamMembers, departments]);

	const filteredTasks = useMemo(() => {
		let tasksToFilter = allCategorizedTasks;

		if (selectedProject !== "all") {
			tasksToFilter = tasksToFilter.filter((task) => task.project === selectedProject);
		}

		if (selectedAssignee !== "all") {
			tasksToFilter = tasksToFilter.filter((task) => task.assignee === selectedAssignee);
		}

		if (selectedTag !== "all") {
			tasksToFilter = tasksToFilter.filter((task) => task.tags && task.tags.includes(selectedTag));
		}

		tasksToFilter = tasksToFilter.filter(
			(task) =>
				task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				task.description.toLowerCase().includes(searchQuery.toLowerCase())
		);

		if (selectedStatus !== "all") {
			tasksToFilter = tasksToFilter.filter((task) => task.fixedStageId === selectedStatus);
		}

		if (selectedDateFilter !== "all") {
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			tasksToFilter = tasksToFilter.filter((task) => {
				if (!task.dueDate) return false;
				const dueDate = new Date(task.dueDate);
				dueDate.setHours(0, 0, 0, 0);

				if (selectedDateFilter === "today") {
					return dueDate.getTime() === today.getTime();
				} else if (selectedDateFilter === "tomorrow") {
					const tomorrow = new Date(today);
					tomorrow.setDate(tomorrow.getDate() + 1);
					return dueDate.getTime() === tomorrow.getTime();
				} else if (selectedDateFilter === "this-week") {
					const startOfWeek = new Date(today);
					startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
					const endOfWeek = new Date(startOfWeek);
					endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
					return dueDate >= startOfWeek && dueDate <= endOfWeek;
				} else if (selectedDateFilter === "this-month") {
					return (
						dueDate.getMonth() === today.getMonth() &&
						dueDate.getFullYear() === today.getFullYear()
					);
				}
				return true;
			});
		}

		return tasksToFilter;
	}, [allCategorizedTasks, selectedProject, selectedAssignee, selectedTag, searchQuery, selectedStatus, selectedDateFilter]);

	const tasksForKanban = useMemo(() => {
		return filteredTasks.map((task) => ({
			...task,
			projectStage: task.fixedStageId,
		}));
	}, [filteredTasks]);

	const tasksForList = useMemo(() => {
		return filteredTasks.map((task) => ({
			...task,
			projectStage: task.fixedStageId,
		}));
	}, [filteredTasks]);

	return (
		<div className="space-y-6 h-full flex flex-col">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{selectedProject !== "all" ? selectedProject : "All Tasks"}
					</h1>
					<p className="text-muted-foreground mt-1">
						{selectedProject !== "all"
							? `Manage tasks for ${selectedProject} project`
							: "Manage and organize your tasks"}
					</p>
				</div>

				<div className="flex items-center gap-2">
					<ToggleGroup
						type="single"
						value={view}
						onValueChange={(value) => value && setView(value as "kanban" | "list")}
					>
						<ToggleGroupItem value="kanban" aria-label="Kanban view">
							<LayoutGrid className="h-4 w-4" />
						</ToggleGroupItem>
						<ToggleGroupItem value="list" aria-label="List view">
							<List className="h-4 w-4" />
						</ToggleGroupItem>
					</ToggleGroup>

					<Button
						onClick={() => {
							setEditingTask(null);
							setIsDialogOpen(true);
						}}
						className="gap-2"
					>
						<Plus className="h-4 w-4" />
						New Task
					</Button>
				</div>
			</div>

			<TaskFilters
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				selectedProject={selectedProject}
				onProjectChange={setSelectedProject}
				selectedStatus={selectedStatus}
				onStatusChange={setSelectedStatus}
				selectedAssignee={selectedAssignee}
				onAssigneeChange={setSelectedAssignee}
				selectedTag={selectedTag}
				onTagChange={setSelectedTag}
				availableProjects={allProjects}
				availableStatuses={fixedKanbanStages}
				teamMembers={teamMembers}
				departments={departments}
				allTasks={allTasks}
				selectedDateFilter={selectedDateFilter}
				onDateFilterChange={setSelectedDateFilter}
			/>

			<div className="flex-1 overflow-auto">
				{view === "kanban" ? (
					<KanbanBoard
						tasks={tasksForKanban}
						stages={fixedKanbanStages}
						useProjectStages={true}
						onTaskUpdate={handleTaskUpdate}
						onTaskEdit={handleTaskEdit}
						onTaskDelete={handleTaskDelete}
						canManageTasks={currentUser?.role !== "user"}
						canDragTasks={false}
						disableBacklogRenaming={true}
					/>
				) : (
					<TaskListView
						tasks={tasksForList}
						stages={fixedKanbanStages}
						onTaskEdit={handleTaskEdit}
						onTaskDelete={handleTaskDelete}
						onTaskUpdate={handleTaskUpdate}
						teamMembers={teamMembers}
						departments={departments}
						canManage={currentUser?.role !== "user"}
						showProjectColumn={true}
					/>
				)}
			</div>

			<TaskDialog
				open={isDialogOpen}
				onOpenChange={(open) => {
					setIsDialogOpen(open);
					if (!open) setEditingTask(null);
				}}
				onSave={handleTaskSave}
				editTask={editingTask}
				availableProjects={allProjects.map((p) => p.name)}
				allProjects={allProjects}
				availableStatuses={userStages}
				useProjectStages={false}
				teamMembers={teamMembers}
				departments={departments}
				allTasks={allTasks}
				currentUser={currentUser}
				fixedDepartmentId={allProjects.find((p) => p.name === selectedProject)?.department?.id}
			/>
		</div>
	);
}