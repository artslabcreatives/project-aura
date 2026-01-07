import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Task, User } from "@/types/task";
import { userStages, Stage } from "@/types/stage";
import { Project } from "@/types/project";
import { Department } from "@/types/department";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskDialog } from "@/components/TaskDialog";
import { TaskFilters } from "@/components/TaskFilters";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { TaskListView } from "@/components/TaskListView";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { userService } from "@/services/userService";
import { departmentService } from "@/services/departmentService";
import { attachmentService } from "@/services/attachmentService";

// Define the three fixed stages for the /tasks page
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
	const [departments, setDepartments] = useState<Department[]>([]); // Add departments state
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProject, setSelectedProject] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [selectedAssignee, setSelectedAssignee] = useState("all");
	const [selectedTag, setSelectedTag] = useState("all");
	const { toast } = useToast();
	const [view, setView] = useState<"kanban" | "list">("kanban");

	// Load all tasks and projects from API
	useEffect(() => {
		const loadData = async () => {
			try {
				const projectsData = await projectService.getAll();
				setAllProjects(projectsData);
				const tasksData = await taskService.getAll();
				setAllTasks(tasksData);
				const usersData = await userService.getAll();
				console.log('🔍 LOADED TEAM MEMBERS:', usersData);
				console.log('🔍 First member example:', usersData[0]);
				setTeamMembers(usersData);
				const departmentsData = await departmentService.getAll();
				setDepartments(departmentsData);
			} catch (error) {
				console.error('Error loading data:', error);
				toast({
					title: 'Error',
					description: 'Failed to load data. Please try again.',
					variant: 'destructive',
				});
			}
		};
		loadData();
	}, []);

	// Save tasks to API whenever they change
	useEffect(() => {
		// No longer needed - tasks are saved via API calls
	}, [allTasks]);

	// Set selected project from URL parameter (by ID)
	useEffect(() => {
		if (numericProjectId && allProjects.length > 0) {
			const proj = allProjects.find(p => p.id === numericProjectId);
			setSelectedProject(proj ? proj.name : "all");
		} else {
			setSelectedProject("all");
		}
	}, [numericProjectId, allProjects]);

	const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
		try {
			const task = allTasks.find(t => t.id === taskId);
			if (!task) return;

			// Handle virtual stage updates from KanbanBoard
			const finalUpdates = { ...updates };

			// If the update comes from the Kanban board columns (which are "pending", "in-progress", "complete")
			if (updates.projectStage && ['pending', 'in-progress', 'complete'].includes(updates.projectStage)) {
				const targetColumn = updates.projectStage;
				finalUpdates.userStatus = targetColumn as any;

				// Try to map to a real project stage if task belongs to a project
				const project = allProjects.find(p => p.name === task.project);
				if (project) {
					let mappedStage;
					if (targetColumn === 'pending') {
						mappedStage = project.stages.find(s => s.title.toLowerCase().trim() === 'pending');
					} else if (targetColumn === 'complete') {
						mappedStage = project.stages.find(s => ['completed', 'complete'].includes(s.title.toLowerCase().trim()));
					} else if (targetColumn === 'in-progress') {
						// Map to the first available custom stage (not system, not archive)
						const systemTitles = ['suggested', 'suggested task', 'pending', 'complete', 'completed', 'archive'];
						// Find first stage that is NOT in systemTitles
						mappedStage = project.stages.find(s => !systemTitles.includes(s.title.toLowerCase().trim()));
					}

					if (mappedStage) {
						finalUpdates.projectStage = mappedStage.id;
					} else {
						// If suitable project stage not found, we cannot update projectStage to a virtual ID
						delete finalUpdates.projectStage;
						// But we still updated userStatus, so it might disappear from view if categorization relies purely on projectStage?
						// My categorization fallback uses userStatus, so it should be fine.
					}
				} else {
					// Task has no project, simply remove the virtual projectStage ID
					delete finalUpdates.projectStage;
				}
			}

			const updatedTask = { ...task, ...finalUpdates };

			// Check if user just completed the task
			if (finalUpdates.userStatus === "complete" && task.userStatus !== "complete") {
				// Add "Specific Stage" tag
				const reviewingTag = "Specific Stage";
				const currentTags = updatedTask.tags || [];
				if (!currentTags.includes(reviewingTag)) {
					updatedTask.tags = [...currentTags, reviewingTag];
				}

				// Mark as in review and set completion time
				updatedTask.isInSpecificStage = true;
				updatedTask.completedAt = new Date().toISOString();

				// Move to Specific stage on project side
				const taskProject = allProjects.find((p: Project) => p.id === (task.projectId ?? -1)) || allProjects.find((p: Project) => p.name === task.project);
				if (taskProject) {
					const reviewStage = taskProject.stages.find((s: Stage) => s.title === "Specific Stage");
					if (reviewStage) {
						updatedTask.projectStage = reviewStage.id;
					}
				}
			}

			// Update via API
			await taskService.update(taskId, updatedTask);

			// Update local state
			setAllTasks((prev) =>
				prev.map((t) => (t.id === taskId ? updatedTask : t))
			);

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

	const handleTaskSave = async (taskData: Omit<Task, "id" | "createdAt">, pendingFiles?: File[], pendingLinks?: { name: string; url: string }[]) => {
		try {
			console.log('=== HANDLE TASK SAVE DEBUG ===');
			console.log('Raw taskData:', taskData);
			console.log('All projects:', allProjects);
			console.log('Team members:', teamMembers);

			// Map project name to ID and assignee name to ID
			const projectId = allProjects.find(p => p.name === taskData.project)?.id;
			const assigneeIdRaw = teamMembers.find(m => m.name === taskData.assignee)?.id;
			const assigneeId = assigneeIdRaw ? parseInt(assigneeIdRaw, 10) : undefined;
			const projectStageId = taskData.projectStage ? parseInt(taskData.projectStage) : undefined;

			console.log('Found projectId:', projectId);
			console.log('Found assigneeId:', assigneeId);
			console.log('Found projectStageId:', projectStageId);

			// Create clean payload with only the fields we want to send
			const { project, assignee, projectStage, ...cleanTaskData } = taskData;
			const payload = {
				...cleanTaskData,
				projectId,
				assigneeId,
				projectStageId,
			};

			console.log('Final payload:', payload);
			console.log('Payload keys:', Object.keys(payload));
			console.log('Payload.projectId:', payload.projectId);
			console.log('Payload.assigneeId:', payload.assigneeId);
			console.log('Payload.projectStageId:', payload.projectStageId);

			if (editingTask) {
				// Update existing task
				await taskService.update(editingTask.id, payload);
				setAllTasks((prev) =>
					prev.map((task) =>
						task.id === editingTask.id ? {
							...task,
							...taskData,
							projectId,
							assigneeId,
							projectStage: projectStageId ? String(projectStageId) : undefined,
						} : task
					)
				);
				toast({
					title: "Task updated",
					description: "The task has been updated successfully.",
				});
			} else {
				// Create new task
				const newTask = await taskService.create({
					...payload,
					userStatus: "pending", // New tasks start as pending
				});

				// Upload pending files after task creation
				if (pendingFiles && pendingFiles.length > 0) {
					try {
						const uploadedAttachments = await attachmentService.uploadFiles(newTask.id, pendingFiles);
						newTask.attachments = [...(newTask.attachments || []), ...uploadedAttachments];
					} catch (uploadError) {
						console.error('Failed to upload attachments:', uploadError);
						toast({ title: 'Warning', description: 'Task created but some attachments failed to upload.', variant: 'destructive' });
					}
				}

				// Add pending links after task creation
				if (pendingLinks && pendingLinks.length > 0) {
					try {
						for (const link of pendingLinks) {
							const uploadedLink = await attachmentService.addLink(newTask.id, link.name, link.url);
							newTask.attachments = [...(newTask.attachments || []), uploadedLink];
						}
					} catch (linkError) {
						console.error('Failed to add links:', linkError);
						toast({ title: 'Warning', description: 'Task created but some links failed to add.', variant: 'destructive' });
					}
				}

				setAllTasks((prev) => [...prev, newTask]);
				toast({
					title: "Task created",
					description: "The task has been created successfully.",
				});
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
			toast({
				title: "Task deleted",
				description: "The task has been deleted successfully.",
			});
		} catch (error) {
			console.error("Error deleting task:", error);
			toast({
				title: "Error",
				description: "Failed to delete task. Please try again.",
				variant: "destructive",
			});
		}
	};

	// Categorize all tasks into the three fixed stages
	const allCategorizedTasks = useMemo(() => {
		let tasksToProcess = allTasks;

		// Filter tasks by department for team-lead
		if (currentUser?.role === "team-lead") {
			// Get team members from current user's department
			const departmentMembers = teamMembers
				.filter(member => member.department === currentUser.department)
				.map(member => member.name);

			// Special permission: Digital Department can see Design Department tasks too
			const currentDept = departments.find(d => d.id === currentUser.department);
			const isDigitalDept = currentDept?.name.toLowerCase() === "digital";

			// If Digital dept, also include Design dept members
			let allAllowedMembers = departmentMembers;
			if (isDigitalDept) {
				const designDept = departments.find(d => d.name.toLowerCase() === "design");
				if (designDept) {
					const designMembers = teamMembers
						.filter(member => member.department === designDept.id)
						.map(member => member.name);
					allAllowedMembers = [...departmentMembers, ...designMembers];
				}
			}

			// Filter tasks assigned to department members or projects in their department
			tasksToProcess = allTasks.filter(task => {
				// Include if task is assigned to someone in their department (or Design if Digital)
				const isAssignedToDepartment = allAllowedMembers.includes(task.assignee);

				// Include if task's project belongs to their department
				const taskProject = allProjects.find(p => p.id === (task.projectId ?? -1)) || allProjects.find(p => p.name === task.project);
				const isProjectInDepartment = taskProject?.department?.id === currentUser.department;

				// Special permission: Include Design department projects for Digital dept
				const isDesignProject = isDigitalDept && taskProject?.department?.name.toLowerCase() === "design";

				return isAssignedToDepartment || isProjectInDepartment || isDesignProject;
			});
		}

		return tasksToProcess.map(task => {
			let fixedStageId: string | null = null;

			const project = allProjects.find(p => p.name === task.project);
			const stage = project?.stages.find(s => s.id === task.projectStage);

			if (stage) {
				// Strict mapping based on project stage title
				const title = stage.title.toLowerCase().trim();

				if (title === 'pending') {
					fixedStageId = 'pending';
				} else if (title === 'completed' || title === 'complete') {
					fixedStageId = 'complete';
				} else if (title.includes('suggested') || title === 'archive') {
					// Suggested and Archive stages are hidden from this view
					fixedStageId = null;
				} else {
					// All custom middle stages go to "In Progress"
					fixedStageId = 'in-progress';
				}
			} else {
				// Fallback for tasks without project context
				if (task.userStatus === "complete") {
					fixedStageId = "complete";
				} else if (task.userStatus === "pending") {
					fixedStageId = "pending";
				} else {
					fixedStageId = "in-progress";
				}
			}

			return { ...task, fixedStageId };
		}).filter(t => t.fixedStageId !== null) as (Task & { fixedStageId: string })[];
	}, [allTasks, allProjects, currentUser, teamMembers]);

	const filteredTasks = useMemo(() => {
		let tasksToFilter = allCategorizedTasks;

		// Apply project filter
		if (selectedProject !== "all") {
			tasksToFilter = tasksToFilter.filter(task => task.project === selectedProject);
		}

		// Apply assignee filter
		if (selectedAssignee !== "all") {
			tasksToFilter = tasksToFilter.filter(task => task.assignee === selectedAssignee);
		}

		// Apply tag filter
		if (selectedTag !== "all") {
			tasksToFilter = tasksToFilter.filter(task =>
				task.tags && task.tags.includes(selectedTag)
			);
		}

		// Apply search query filter
		tasksToFilter = tasksToFilter.filter(task =>
			task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			task.description.toLowerCase().includes(searchQuery.toLowerCase())
		);

		// Apply status filter based on the fixed stages
		if (selectedStatus !== "all") {
			tasksToFilter = tasksToFilter.filter(task => task.fixedStageId === selectedStatus);
		}

		return tasksToFilter;
	}, [allCategorizedTasks, selectedProject, selectedAssignee, selectedTag, searchQuery, selectedStatus, currentUser]);

	// Prepare tasks for KanbanBoard based on the fixed stages
	const tasksForKanban = useMemo(() => {
		// filteredTasks already have the fixedStageId, so we just need to ensure
		// the projectStage property is set to fixedStageId for KanbanBoard to group correctly.
		return filteredTasks.map(task => ({
			...task,
			projectStage: task.fixedStageId, // KanbanBoard uses projectStage for grouping
		}));
	}, [filteredTasks]);

	const tasksForList = useMemo(() => {
		return filteredTasks.map(task => ({
			...task,
			projectStage: task.fixedStageId,
		}));
	}, [filteredTasks]);

	// Clean up any stray debug fragments
	// (fix accidental 'consol' text)

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
						onValueChange={(value) => {
							if (value) setView(value as "kanban" | "list");
						}}
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
				availableProjects={allProjects.map(p => p.name)}
				availableStatuses={fixedKanbanStages} // Always use fixed stages for filter
				teamMembers={teamMembers}
				allTasks={allTasks}
			/>

			<div className="flex-1 overflow-auto">
				{view === "kanban" ? (
					<KanbanBoard
						tasks={tasksForKanban}
						stages={fixedKanbanStages}
						useProjectStages={true} // Always use project stages logic for KanbanBoard
						onTaskUpdate={handleTaskUpdate}
						onTaskEdit={handleTaskEdit}
						onTaskDelete={handleTaskDelete}
						canManageTasks={currentUser?.role !== "user"}
					/>
				) : (
					<TaskListView
						tasks={tasksForList}
						stages={fixedKanbanStages}
						onTaskEdit={handleTaskEdit}
						onTaskDelete={handleTaskDelete}
						onTaskUpdate={handleTaskUpdate}
						teamMembers={teamMembers}
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
				availableProjects={allProjects.map(p => p.name)}
				availableStatuses={userStages} // TaskDialog still uses userStages for task status
				useProjectStages={false} // TaskDialog should not use project stages for task status
				teamMembers={teamMembers}
				departments={departments}
				allTasks={allTasks}
			/>
		</div>
	);
}