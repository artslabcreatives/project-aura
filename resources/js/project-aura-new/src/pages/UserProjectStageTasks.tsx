import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Task, User } from "@/types/task";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Stage } from "@/types/stage";
import { Project } from "@/types/project";
import { useUser } from "@/hooks/use-user";
import { useHistory } from "@/hooks/use-history";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, MessageSquare, X } from "lucide-react";
import { UserStageDialog } from "@/components/UserStageDialog";
import { StageManagement } from "@/components/StageManagement";
import { useToast } from "@/hooks/use-toast";
import { TaskDialog } from "@/components/TaskDialog";
import { Department } from "@/types/department";
import { TaskListView } from "@/components/TaskListView";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { userService } from "@/services/userService";
import { departmentService } from "@/services/departmentService";
import { attachmentService } from "@/services/attachmentService";
import { api } from "@/services/api";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

const getDefaultUserTaskStages = (): Stage[] => [
	{ id: "pending", title: "Pending", color: "bg-status-todo", order: 0, type: "user" },
	{ id: "complete", title: "Complete", color: "bg-status-done", order: 999, type: "user" },
];

export default function UserProjectStageTasks() {
	const { projectId, stageId } = useParams<{ projectId: string; stageId: string }>();
	const numericProjectId = projectId ? parseInt(projectId, 10) : null;
	const { currentUser } = useUser();
	const { toast } = useToast();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [allTasks, setAllTasks] = useState<Task[]>([]);
	const [project, setProject] = useState<Project | null>(null);
	const [stage, setStage] = useState<Stage | null>(null);
	const [userStages, setUserStages] = useState<Stage[]>(getDefaultUserTaskStages());
	const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
	const [editingStage, setEditingStage] = useState<Stage | null>(null);
	const [isStageManagementOpen, setIsStageManagementOpen] = useState(false);
	const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [teamMembers, setTeamMembers] = useState<User[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [view, setView] = useState<"kanban" | "list">("kanban");
	const [searchParams, setSearchParams] = useSearchParams();
	const [loading, setLoading] = useState(true);
	const [showChat, setShowChat] = useState(false);

	const fetchUserStages = async () => {
		if (!currentUser) return;
		try {
			const { data } = await api.get('/stages', { params: { type: 'user', project_id: numericProjectId, context_stage_id: stageId } });
			const customStages: Stage[] = data.map((s: any) => ({
				id: String(s.id),
				title: s.title,
				color: s.color,
				order: s.order,
				type: 'user',
				isReviewStage: s.is_review_stage
			}));

			const defaultStages = getDefaultUserTaskStages();
			const pending = defaultStages.find(s => s.id === 'pending')!;
			const complete = defaultStages.find(s => s.id === 'complete')!;

			customStages.sort((a, b) => a.order - b.order);

			setUserStages([pending, ...customStages, complete]);
		} catch (e) {
			console.error("Failed to load user stages", e);
			setUserStages(getDefaultUserTaskStages());
		}
	};

	useEffect(() => {
		fetchUserStages();
	}, [currentUser, numericProjectId, stageId]);

	useEffect(() => {
		const taskIdParam = searchParams.get('task');
		if (taskIdParam && tasks.length > 0) {
			// Delay slightly to ensure rendering
			setTimeout(() => {
				const taskElement = document.getElementById(`task-${taskIdParam}`);
				if (taskElement) {
					taskElement.scrollIntoView({ behavior: "smooth", block: "center" });
					taskElement.classList.add("ring-2", "ring-primary", "shadow-lg");
					setTimeout(() => {
						taskElement.classList.remove("ring-2", "ring-primary", "shadow-lg");
					}, 3000);

					// Clear param
					searchParams.delete('task');
					setSearchParams(searchParams);
				}
			}, 500);
		}
	}, [tasks, searchParams]);

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			try {
				const [usersData, departmentsData] = await Promise.all([
					userService.getAll(),
					departmentService.getAll(),
				]);
				setTeamMembers(usersData);
				setDepartments(departmentsData);

				if (!numericProjectId || !stageId) return;

				const proj = await projectService.getById(projectId || "");
				setProject(proj || null);
				const projStage = proj?.stages.find(s => String(s.id) === String(stageId)) || null;
				setStage(projStage);

				const tasksData = await taskService.getAll({ projectId: projectId });
				setAllTasks(tasksData);
				const filtered = tasksData.filter(t => {
					const isAssigned =
						t.assignee === (currentUser?.name || "") ||
						(t.assignedUsers && t.assignedUsers.some(u => String(u.id) === String(currentUser?.id)));

					// Check individual status
					const myAssignment = t.assignedUsers?.find(u => String(u.id) === String(currentUser?.id));
					const isMyPartComplete = myAssignment?.status === 'complete';

					return String(t.projectId) === String(projectId) &&
						String(t.projectStage) === String(stageId) &&
						isAssigned &&
						t.userStatus !== 'complete' &&
						!isMyPartComplete;
				});
				setTasks(filtered);
			} catch (error) {
				console.error("Error loading user stage tasks:", error);
				toast({
					title: "Error",
					description: "Failed to load data. Please refresh.",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [projectId, stageId, currentUser]);

	const updateTasksInStorage = (updatedTask: Task) => {
		// No localStorage persistence per requirements
		// This function is now a no-op
	};

	const { history, addHistoryEntry } = useHistory(projectId ? String(projectId) : undefined);

	// ... existing handleTaskUpdate ...
	const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
		const taskToUpdate = tasks.find(t => t.id === taskId);

		// Record history for user actions
		if (taskToUpdate && projectId && currentUser) {
			// Check for "Started" (Pending -> anything else not complete)
			if (updates.userStatus && taskToUpdate.userStatus === 'pending' && updates.userStatus !== 'pending' && updates.userStatus !== 'complete') {
				addHistoryEntry({
					action: 'USER_START_TASK',
					entityId: taskId,
					entityType: 'task',
					projectId: projectId,
					userId: currentUser.id,
					details: { title: taskToUpdate.title },
				});
			}
			// Check for "Completed"
			if (updates.userStatus === 'complete' && taskToUpdate.userStatus !== 'complete') {
				addHistoryEntry({
					action: 'USER_COMPLETE_TASK',
					entityId: taskId,
					entityType: 'task',
					projectId: projectId,
					userId: currentUser.id,
					details: { title: taskToUpdate.title },
				});
			}
		}

		// Update local state immediately for responsive UI
		setTasks(prevTasks =>
			prevTasks.map(task =>
				task.id === taskId ? { ...task, ...updates } : task
			)
		);

		// If task is completed, remove it from view after 10 seconds
		if (updates.userStatus === "complete") {
			console.log(`Task ${taskId} marked as complete, scheduling removal in 10s`);
			setTimeout(() => {
				setTasks(currentTasks => {
					const task = currentTasks.find(t => String(t.id) === String(taskId));
					console.log(`[UserProjectStageTasks] Checking task ${taskId} for removal. Found: ${!!task}, Status: ${task?.userStatus}`);
					// Only remove if it's still complete (user didn't move it back)
					if (task && task.userStatus === "complete") {
						console.log(`Removing completed task ${taskId} from view`);
						return currentTasks.filter(t => String(t.id) !== String(taskId));
					}
					return currentTasks;
				});
			}, 10000);
		}

		// Persist to backend - the backend observer will handle automatic stage progression
		try {
			const task = tasks.find(t => t.id === taskId);
			const projectId = task?.projectId || (project ? project.id : undefined);
			const assigneeName = updates.assignee;
			const assigneeId = assigneeName ? teamMembers.find(m => m.name === assigneeName)?.id : undefined;
			const projectStageId = updates.projectStage ? parseInt(String(updates.projectStage), 10) : undefined;

			// Build payload mapping to service expectations
			if (projectId) {
				void taskService.update(taskId, {
					projectId,
					assigneeId: assigneeId ? parseInt(String(assigneeId), 10) : undefined,
					projectStageId,
					userStatus: updates.userStatus,
					previousStage: updates.previousStage,
					revisionComment: updates.revisionComment,
					isInSpecificStage: updates.isInSpecificStage,
				});
			}
		} catch (e) {
			console.error('Failed to persist task update', e);
		}
	};

	const handleSaveTask = async (taskData: Omit<Task, "id" | "createdAt">, pendingFiles?: File[], pendingLinks?: { name: string; url: string }[]) => {
		if (editingTask) {
			await taskService.update(editingTask.id, taskData as any);
			const updatedTask = { ...editingTask, ...taskData };
			setTasks((prev) => prev.map((task) => (task.id === editingTask.id ? updatedTask : task)));
			toast({
				title: "Task updated",
				description: "The task has been updated successfully.",
			});
		}
		setIsTaskDialogOpen(false);
		setEditingTask(null);
	};

	const handleTaskEdit = (task: Task) => {
		setEditingTask(task);
		setIsTaskDialogOpen(true);
	};

	const handleTaskDelete = async (taskId: string) => {
		setTasks((prev) => prev.filter((task) => task.id !== taskId));
		await taskService.delete(taskId);

		toast({
			title: "Task deleted",
			description: "The task has been deleted successfully.",
		});
	};

	const handleSaveStage = async (newStage: Stage) => {
		if (!currentUser) return;

		try {
			if (editingStage) {
				// Update existing stage
				await api.put(`/stages/${editingStage.id}`, {
					title: newStage.title,
					color: newStage.color,
					order: editingStage.order,
				});
				toast({
					title: "Stage updated",
					description: `"${newStage.title}" has been updated.`,
				});
			} else {
				// Create new stage
				// Get current custom stages to determine order
				const customStages = userStages.filter(s => s.id !== 'pending' && s.id !== 'complete');
				const maxOrder = customStages.length > 0 ? Math.max(...customStages.map(s => s.order)) : 0;

				await api.post('/stages', {
					title: newStage.title,
					color: newStage.color,
					order: maxOrder + 1,
					type: 'user',
					is_review_stage: false,
					project_id: numericProjectId,
					context_stage_id: stageId
				});
				toast({
					title: "Stage created",
					description: `"${newStage.title}" has been added to your workflow.`,
				});
			}
			setEditingStage(null);
			fetchUserStages();
		} catch (error) {
			console.error("Failed to save stage:", error);
			toast({
				title: "Error",
				description: "Failed to save stage.",
				variant: "destructive",
			});
		}
	};

	const handleEditStage = (stage: Stage) => {
		setEditingStage(stage);
		setIsStageDialogOpen(true);
	};

	const handleDeleteStage = async (stageIdToDelete: string) => {
		if (!currentUser) return;

		const stageToDelete = userStages.find(s => s.id === stageIdToDelete);
		if (!stageToDelete) return;

		// Check if stage has tasks
		const stageTasks = tasks.filter(task => task.userStatus === stageIdToDelete);
		if (stageTasks.length > 0) {
			toast({
				title: "Cannot delete stage",
				description: `"${stageToDelete.title}" has ${stageTasks.length} task(s). Move them first.`,
				variant: "destructive",
			});
			return;
		}

		try {
			await api.delete(`/stages/${stageIdToDelete}`);
			toast({
				title: "Stage deleted",
				description: `"${stageToDelete.title}" has been removed.`,
			});
			fetchUserStages();
		} catch (error) {
			console.error("Failed to delete stage:", error);
			toast({
				title: "Error",
				description: "Failed to delete stage.",
				variant: "destructive",
			});
		}
	};

	const handleDialogClose = (open: boolean) => {
		setIsStageDialogOpen(open);
		if (!open) {
			setEditingStage(null);
		}
	};

	const tasksForListView = useMemo(() => {
		return tasks.map(task => ({
			...task,
			projectStage: task.userStatus,
		}));
	}, [tasks]);

	const handleTaskCompleteWithDetails = async (taskId: string, stageId: string, data: { comment?: string; links: string[]; files: File[] }) => {
		try {
			// Optimistic update
			setTasks(prev => prev.map(t => t.id === taskId ? { ...t, userStatus: 'complete' } : t));

			// Record history
			const task = tasks.find(t => t.id === taskId);
			if (task && projectId && currentUser) {
				addHistoryEntry({
					action: 'USER_COMPLETE_TASK',
					entityId: taskId,
					entityType: 'task',
					projectId: projectId,
					userId: currentUser.id,
					details: { title: task.title },
				});
			}

			// Backend call
			await taskService.complete(taskId, {
				status: 'complete',
				comment: data.comment,
				links: data.links,
				files: data.files
			});

			toast({
				title: "Task completed",
				description: "Task marked as complete with details.",
			});

			// Remove from view logic (same as update)
			setTimeout(() => {
				setTasks(currentTasks => {
					const task = currentTasks.find(t => String(t.id) === String(taskId));
					if (task && task.userStatus === "complete") {
						return currentTasks.filter(t => String(t.id) !== String(taskId));
					}
					return currentTasks;
				});
			}, 10000);

		} catch (error) {
			console.error("Error completing task:", error);
			toast({
				title: "Error",
				description: "Failed to complete task.",
				variant: "destructive",
			});
		}
	};

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<Skeleton className="h-8 w-64" />
						<Skeleton className="h-4 w-96" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-9 w-24" />
						<Skeleton className="h-9 w-32" />
					</div>
				</div>

				<div className="flex gap-4 overflow-hidden">
					<div className="flex-shrink-0 w-80 flex flex-col gap-4">
						<Skeleton className="h-12 w-full rounded-lg" />
						<div className="space-y-4">
							{[1, 2, 3].map((i) => (
								<div key={i} className="p-4 rounded-lg border bg-card space-y-3">
									<div className="flex justify-between">
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-4 w-4 rounded-full" />
									</div>
									<Skeleton className="h-4 w-full" />
									<div className="flex items-center justify-between pt-2">
										<Skeleton className="h-6 w-6 rounded-full" />
										<Skeleton className="h-5 w-16" />
									</div>
								</div>
							))}
						</div>
					</div>
					<div className="flex-shrink-0 w-80 flex flex-col gap-4">
						<Skeleton className="h-12 w-full rounded-lg" />
						<div className="space-y-4">
							{[1].map((i) => (
								<div key={i} className="p-4 rounded-lg border bg-card space-y-3">
									<div className="flex justify-between">
										<Skeleton className="h-4 w-20" />
										<Skeleton className="h-4 w-4 rounded-full" />
									</div>
									<Skeleton className="h-4 w-full" />
									<div className="flex items-center justify-between pt-2">
										<Skeleton className="h-6 w-6 rounded-full" />
										<Skeleton className="h-5 w-16" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!project || !stage) {
		return <div>Project or Stage not found.</div>;
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">
						{project.name} - {stage.title}
					</h1>
					<p className="text-muted-foreground">
						Tasks assigned to {currentUser?.name} in this stage.
					</p>
				</div>
				<div className="flex items-center gap-2">
					{!showChat && (
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
					)}
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span>
									<Button
										onClick={() => setShowChat(!showChat)}
										variant={showChat ? "default" : "outline"}
										disabled={!project?.mattermostChannelId}
									>
										{showChat ? (
											<>
												<X className="h-4 w-4 mr-2" />
												Close Chat
											</>
										) : (
											<>
												<MessageSquare className="h-4 w-4 mr-2" />
												Chat
											</>
										)}
									</Button>
								</span>
							</TooltipTrigger>
							{!project?.mattermostChannelId && (
								<TooltipContent>
									<p>Please select or create a Mattermost channel for this project</p>
								</TooltipContent>
							)}
						</Tooltip>
					</TooltipProvider>
					{!showChat && (
						<>
							<Button onClick={() => setIsStageManagementOpen(true)} variant="outline">
								Manage Stages
							</Button>
							<Button onClick={() => { setEditingStage(null); setIsStageDialogOpen(true); }} size="sm">
								<Plus className="h-4 w-4 mr-2" />
								Add Stage
							</Button>
						</>
					)}
				</div>
			</div>

			{showChat ? (
				<div className="w-full h-[calc(100vh-12rem)] border rounded-lg overflow-hidden">
					<iframe
						src={`https://collab.artslabcreatives.com/artslab-creatives/channels/${project?.mattermostChannelId}`}
						className="w-full h-full"
						title="Chat"
						allow="microphone; camera"
					/>
				</div>
			) : (
				<div className="overflow-x-auto">
					{view === "kanban" ? (
						<KanbanBoard
							tasks={tasks}
							stages={userStages}
							onTaskUpdate={handleTaskUpdate}
							onTaskEdit={handleTaskEdit}
							onTaskDelete={handleTaskDelete}
							useProjectStages={false}
							canManageStages={false}
							canManageTasks={false}
							canDragTasks={true}
							projectId={projectId}
							onTaskComplete={handleTaskCompleteWithDetails}
							disableBacklogRenaming={true}
							useSubtasksGrouping={true}
							allTasks={allTasks}
						/>
					) : (
						<TaskListView
							tasks={tasksForListView}
							stages={userStages}
							onTaskEdit={handleTaskEdit}
							onTaskDelete={handleTaskDelete}
							onTaskUpdate={handleTaskUpdate}
							teamMembers={teamMembers}
							showAssigneeColumn={false}
							canManage={false}
							canUpdateStage={true}
						/>
					)}
				</div>
			)}

			<StageManagement
				open={isStageManagementOpen}
				onOpenChange={setIsStageManagementOpen}
				stages={userStages.filter(s => s.id !== 'pending' && s.id !== 'complete')}
				onAddStage={() => {
					setIsStageManagementOpen(false);
					setEditingStage(null);
					setIsStageDialogOpen(true);
				}}
				onEditStage={(stage) => {
					setIsStageManagementOpen(false);
					handleEditStage(stage);
				}}
				onDeleteStage={handleDeleteStage}
			/>

			<UserStageDialog
				open={isStageDialogOpen}
				onOpenChange={handleDialogClose}
				onSave={handleSaveStage}
				existingStages={userStages}
				editStage={editingStage}
			/>

			<TaskDialog
				open={isTaskDialogOpen}
				onOpenChange={(open) => {
					setIsTaskDialogOpen(open);
					if (!open) setEditingTask(null);
				}}
				onSave={handleSaveTask}
				editTask={editingTask}
				availableProjects={[project.name]}
				availableStatuses={userStages}
				useProjectStages={false}
				teamMembers={teamMembers}
				departments={departments}
				allTasks={allTasks}
				currentUser={currentUser}
				fixedDepartmentId={project.department?.id}
				disableBacklogRenaming={true}
			/>
		</div>
	);
}
