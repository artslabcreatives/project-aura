import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useEffect, useState } from "react";
import { Project } from "@/types/project";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Task, User, UserStatus, TaskPriority } from "@/types/task";
import { StageDialog } from "@/components/StageDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Stage } from "@/types/stage";
import { TaskDialog } from "@/components/TaskDialog";
import { StageManagement } from "@/components/StageManagement";
import { Department } from "@/types/department";
import { HistoryDialog } from "@/components/HistoryDialog";
import { useHistory } from "@/hooks/use-history";
import { useUser } from "@/hooks/use-user";
import { TaskListView } from "@/components/TaskListView";
import { ReviewTaskDialog } from "@/components/ReviewTaskDialog";
import { useToast } from "@/hooks/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSidebar } from "@/components/ui/sidebar";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { userService } from "@/services/userService";
import { departmentService } from "@/services/departmentService";
import { attachmentService } from "@/services/attachmentService";
import { stageService } from "@/services/stageService";
import { AddSubtaskDialog } from "@/components/AddSubtaskDialog";
import { echo } from "@/services/echoService";


import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectKanbanFixed() {
	const { projectId } = useParams<{ projectId: string }>();
	const [project, setProject] = useState<Project | null>(null);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		const fetchProject = async () => {
			setLoading(true);
			try {
				if (!projectId) { setProject(null); return; }
				const allProjects = await projectService.getAll();
				let found = null;
				// Check if ID (all digits)
				if (/^\d+$/.test(projectId)) {
					found = allProjects.find(p => String(p.id) === projectId);
				} else {
					// Check by name or slug
					const decoded = decodeURIComponent(projectId);
					found = allProjects.find(p => p.name === decoded);
					if (!found) {
						const slug = projectId.toLowerCase();
						found = allProjects.find(p => p.name.toLowerCase().replace(/\s+/g, '-') === slug);
					}
				}
				setProject(found || null);
			} catch (e) {
				console.error(e);
				toast({ title: "Error", description: "Failed to load project", variant: "destructive" });
			} finally {
				setLoading(false);
			}
		};
		fetchProject();
	}, [projectId]);

	if (loading) {
		return (
			<div className="flex flex-col h-full bg-background">
				{/* Header Skeleton */}
				<div className="flex-shrink-0 border-b bg-background z-10 px-6 py-5">
					<div className="flex flex-col sm:flex-row flex-wrap items-start justify-between gap-4 mb-4">
						<div className="space-y-2">
							<Skeleton className="h-8 w-64" />
							<Skeleton className="h-4 w-96" />
						</div>
						<div className="flex items-center gap-3">
							<Skeleton className="h-9 w-24" />
							<Skeleton className="h-9 w-32" />
							<Skeleton className="h-9 w-28" />
						</div>
					</div>
					<div className="flex justify-start">
						<Skeleton className="h-9 w-32" />
					</div>
				</div>

				{/* Board Skeleton */}
				<div className="flex-1 overflow-hidden">
					<div className="h-full overflow-auto p-6 pb-10 bg-muted/5">
						<div className="flex h-full gap-6">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="flex-shrink-0 w-80 flex flex-col gap-4">
									<Skeleton className="h-12 w-full rounded-lg" />
									<div className="space-y-4">
										{[1, 2, 3].map((j) => (
											<div key={j} className="p-4 rounded-lg border bg-card space-y-3">
												<div className="flex justify-between">
													<Skeleton className="h-4 w-20" />
													<Skeleton className="h-4 w-4 rounded-full" />
												</div>
												<Skeleton className="h-4 w-full" />
												<Skeleton className="h-4 w-3/4" />
												<div className="flex items-center justify-between pt-2">
													<Skeleton className="h-6 w-6 rounded-full" />
													<Skeleton className="h-5 w-16" />
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}
	if (!project) return <div className="flex items-center justify-center h-screen">Project not found</div>;

	return <ProjectBoardContent key={project.id} project={project} />;
}



function ProjectBoardContent({ project: initialProject }: { project: Project }) {
	const numericProjectId = initialProject.id ? parseInt(String(initialProject.id), 10) : undefined;
	const [project, setProject] = useState<Project>(initialProject);
	const [searchParams, setSearchParams] = useSearchParams();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [allTasks, setAllTasks] = useState<Task[]>([]);
	const [teamMembers, setTeamMembers] = useState<User[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
	const [isStageManagementOpen, setIsStageManagementOpen] = useState(false);
	const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
	const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
	const [isReviewTaskDialogOpen, setIsReviewTaskDialogOpen] = useState(false);
	const [reviewTask, setReviewTask] = useState<Task | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [editingStage, setEditingStage] = useState<Stage | null>(null);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [preselectedStageId, setPreselectedStageId] = useState<string | undefined>(undefined);
	const { history, addHistoryEntry } = useHistory(numericProjectId ? String(numericProjectId) : undefined);
	const { currentUser } = useUser();
	const { toast } = useToast();
	const [view, setView] = useState<"kanban" | "list">("kanban");
	const navigate = useNavigate();
	const { open } = useSidebar();

	// Subtask Dialog State
	const [isAddSubtaskDialogOpen, setIsAddSubtaskDialogOpen] = useState(false);
	const [parentTaskForSubtask, setParentTaskForSubtask] = useState<Task | null>(null);

	const handleAddSubtask = (parentTask: Task) => {
		setParentTaskForSubtask(parentTask);
		setIsAddSubtaskDialogOpen(true);
	};

	useEffect(() => {
		const loadData = async (isBackground = false) => {
			if (!numericProjectId) return;
			if (!isBackground) setIsLoading(true);
			try {
				// Optimization: Fetch independent initial data in parallel
				const [currentProject, departmentsData] = await Promise.all([
					projectService.getById(String(numericProjectId)),
					departmentService.getAll()
				]);

				if (!currentProject) { setProject(null); if (!isBackground) setIsLoading(false); return; }

				if (currentUser?.role === 'team-lead') {
					const hasMatchingDepartment = currentProject.department?.id === currentUser.department;
					const currentDept = departmentsData.find(d => d.id === currentUser.department);
					const isDigitalDept = currentDept?.name.toLowerCase() === 'digital';
					const isDesignProject = currentProject.department?.name.toLowerCase() === 'design';
					const hasSpecialPermission = isDigitalDept && isDesignProject;
					if (!hasMatchingDepartment && !hasSpecialPermission) { setProject(null); if (!isBackground) setIsLoading(false); return; }
				}
				setProject(currentProject);
				setDepartments(departmentsData);

				// Optimization: Fetch tasks and users in parallel
				// Removed global taskService.getAll()
				const [tasksData, usersData] = await Promise.all([
					taskService.getAll({ projectId: String(currentProject.id) }),
					userService.getAll()
				]);

				const projectTasks = tasksData.filter(t => t.projectId === currentProject.id);
				setTasks(projectTasks);
				setAllTasks(projectTasks); // Optimization: Use project tasks instead of full global fetch
				setTeamMembers(usersData);

				// Deep link handling
				const taskIdParam = searchParams.get('task');
				if (taskIdParam && projectTasks.length > 0) {
					const foundTask = projectTasks.find(t => String(t.id) === taskIdParam);
					if (foundTask) {
						if (currentUser?.role === 'user') {
							// For normal users, redirect to their specific stage view if assigned
							const isAssigned = foundTask.assignee === currentUser.name ||
								(foundTask.assignedUsers && foundTask.assignedUsers.some(u => String(u.id) === String(currentUser.id)));

							if (isAssigned) {
								navigate(`/user-project/${currentProject.id}/stage/${foundTask.projectStage}?task=${foundTask.id}`);
							} else {
								toast({
									title: "Access Denied",
									description: "You do not have permission to view this task.",
									variant: "destructive"
								});
							}
						} else {
							// Admin/TeamLead: Scroll to task on this board
							setTimeout(() => {
								const taskElement = document.getElementById(`task-${foundTask.id}`);
								if (taskElement) {
									taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
									taskElement.classList.add('ring-2', 'ring-primary', 'shadow-lg');
									setTimeout(() => {
										taskElement.classList.remove('ring-2', 'ring-primary', 'shadow-lg');
									}, 3000);
								}
							}, 500);
						}

						// Clear param only if we stayed on this page (Admin/TeamLead or Access Denied)
						if (currentUser?.role !== 'user' || foundTask.assignee !== currentUser.name) {
							searchParams.delete('task');
							setSearchParams(searchParams);
						}
					}
				}
			} catch (e) {
				console.error(e);
				toast({ title: 'Error', description: 'Failed to load project data.', variant: 'destructive' });
			} finally {
				if (!isBackground) setIsLoading(false);
			}
		};

		loadData();

		// Real-time Updates
		if (numericProjectId) {
			console.log(`Subscribing to project.${numericProjectId}`);
			const channel = echo.private(`project.${numericProjectId}`);
			channel.listen('TaskUpdated', (e: any) => {
				console.log('Kanban Real-time task update received:', e);
				loadData(true);
			});

			channel.listen('ProjectUpdated', (e: any) => {
				console.log('Kanban Real-time project update received:', e);
				if (e.project) {
					// We can either update state directly or reload. Reload is safer for side-effects.
					loadData(true);
					// Also update the project state immediately if simple property change
					setProject(prev => ({ ...prev, ...e.project }));
				} else {
					loadData(true);
				}
			});

			// Listen for local project state changes (from sidebar actions)
			const handleLocalProjectStateChange = (e: Event) => {
				const customEvent = e as CustomEvent;
				if (customEvent.detail && String(customEvent.detail.projectId) === String(numericProjectId)) {
					console.log('Kanban Local project state change received:', customEvent.detail);
					setProject(prev => ({ ...prev, isArchived: customEvent.detail.isArchived }));
				}
			};
			window.addEventListener('project-state-changed', handleLocalProjectStateChange);

			return () => {
				console.log(`Unsubscribing from project.${numericProjectId}`);
				echo.leave(`project.${numericProjectId}`);
				window.removeEventListener('project-state-changed', handleLocalProjectStateChange);
			};
		}
	}, [numericProjectId, currentUser]);

	const updateProjectInStorage = async (updatedProject: Project) => {
		try {
			if (!updatedProject.id) return;
			await projectService.update(String(updatedProject.id), updatedProject);
			setProject(updatedProject);
			toast({ title: 'Project updated', description: 'Project updated successfully.' });
		} catch (e) {
			console.error(e);
			toast({ title: 'Error', description: 'Failed to update project.', variant: 'destructive' });
		}
	};

	const handleAddTaskToStage = (stageId: string) => {
		setEditingTask(null);
		setPreselectedStageId(stageId);
		setIsTaskDialogOpen(true);
	};

	const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
		if (!currentUser || !project) return;
		const taskToUpdate = tasks.find(t => t.id === taskId); if (!taskToUpdate) return;
		try {
			console.log('[KANBAN] Incoming task update', { taskId, updates });
			if (updates.userStatus === 'complete' && !updates.projectStage) {
				const currentStage = project.stages.find(s => s.id === taskToUpdate.projectStage);
				if (currentStage) {
					let targetStageId: string | undefined;
					if (currentStage.linkedReviewStageId) {
						targetStageId = currentStage.linkedReviewStageId;
					} else {
						const ordered = [...project.stages].sort((a, b) => a.order - b.order);
						const idx = ordered.findIndex(s => s.id === currentStage.id);
						if (idx >= 0 && idx < ordered.length - 1) targetStageId = ordered[idx + 1].id;
					}
					if (targetStageId) {
						const targetStage = project.stages.find(s => s.id === targetStageId);
						updates.projectStage = targetStageId;
						if (targetStage?.isReviewStage) {
							updates.previousStage = currentStage.id;
							updates.originalAssignee = taskToUpdate.assignee;
							updates.assignee = taskToUpdate.assignee;
							updates.isInSpecificStage = true;
						}
						if (!targetStage?.isReviewStage) {
							updates.userStatus = 'pending';
						}
						console.log('[KANBAN] Auto transition after complete', { from: currentStage.id, to: targetStageId, review: !!targetStage?.isReviewStage });
					}
				}
			}
			if (updates.projectStage && updates.projectStage !== taskToUpdate.projectStage) {
				if (!('assignee' in updates)) {
					const targetStage = project.stages.find(s => s.id === updates.projectStage);
					if (targetStage?.mainResponsibleId) {
						const mr = teamMembers.find(m => m.id === targetStage.mainResponsibleId);
						updates.assignee = mr ? mr.name : '';
					} else updates.assignee = '';
				}
				if (!('userStatus' in updates)) updates.userStatus = 'pending';
				const sorted = [...project.stages].sort((a, b) => a.order - b.order);
				const last = sorted[sorted.length - 1];
				const currentTags = taskToUpdate.tags || [];
				if (updates.projectStage === last.id) {
					if (!currentTags.includes('Completed')) updates.tags = [...currentTags, 'Completed'];
				} else if (currentTags.includes('Completed')) {
					updates.tags = currentTags.filter(t => t !== 'Completed');
				}
				addHistoryEntry({ action: 'UPDATE_TASK_STATUS', entityId: taskId, entityType: 'task', projectId: String(project.id), userId: currentUser.id, details: { from: taskToUpdate.projectStage, to: updates.projectStage } });
			}
			if (updates.assignee && updates.assignee !== taskToUpdate.assignee) {
				addHistoryEntry({ action: 'UPDATE_TASK_ASSIGNEE', entityId: taskId, entityType: 'task', projectId: String(project.id), userId: currentUser.id, details: { from: taskToUpdate.assignee, to: updates.assignee } });
			}
			const assigneeId = updates.assignee ? teamMembers.find(m => m.name === updates.assignee)?.id : undefined;
			const projectStageId = updates.projectStage ? parseInt(String(updates.projectStage), 10) : undefined; // Ensure it's a number
			// Remove startStageId from updates (string) to avoid type conflict, and convert to number
			const { startStageId: startStageIdStr, ...cleanUpdates } = updates;
			const startStageId = startStageIdStr ? parseInt(String(startStageIdStr), 10) : undefined;

			await taskService.update(taskId, {
				...cleanUpdates,
				assigneeId: assigneeId ? parseInt(String(assigneeId), 10) : undefined,
				projectStageId,
				startStageId,
			});
			console.log('[KANBAN] Applied update', { taskId, assigneeId, projectStageId });
			setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
		} catch (e) { console.error(e); toast({ title: 'Error', description: 'Failed to update task.', variant: 'destructive' }); }
	};

	const handleSaveTask = async (task: Omit<Task, 'id' | 'createdAt'> & { assigneeId?: string; assigneeIds?: string[] }, pendingFiles?: File[], pendingLinks?: { name: string; url: string }[]) => {
		if (!currentUser || !project) return;
		try {
			// Extract assignee IDs and convert to numbers
			const assigneeId = task.assigneeId ? parseInt(task.assigneeId) : undefined;
			const assigneeIds = task.assigneeIds?.map(id => parseInt(id)) || [];

			const projectStageId = task.projectStage ? parseInt(task.projectStage) : undefined;

			// startStageId needs to be extracted and converted to number, removing string version from payload
			const { project: projectName, assignee, projectStage, startStageId: startStageIdStr, ...cleanTask } = task;
			const startStageId = startStageIdStr ? parseInt(startStageIdStr, 10) : undefined;

			const taskPayload = {
				...cleanTask,
				projectId: project.id,
				assigneeId,
				assigneeIds,
				projectStageId,
				startStageId,
			};

			if (editingTask) {
				await taskService.update(editingTask.id, taskPayload);
				// Update local state - convert back to strings/objects if needed or just reload?
				// Reloading or partial update. For simple update we just spread.

				// Fetch updated tasks to ensure correct state?
				// Or use the response from update if available (taskService.update returns Task).
				const updatedTask = await taskService.update(editingTask.id, taskPayload);
				setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
				addHistoryEntry({ action: 'UPDATE_TASK', entityId: editingTask.id, entityType: 'task', projectId: String(project.id), userId: currentUser.id, details: { from: editingTask, to: { ...editingTask, ...task } } });
				toast({ title: 'Task updated', description: 'Task updated successfully.' });
			} else {
				const newTask = await taskService.create(taskPayload);

				if (pendingFiles && pendingFiles.length > 0) {
					try {
						const uploadedAttachments = await attachmentService.uploadFiles(newTask.id, pendingFiles);
						newTask.attachments = [...(newTask.attachments || []), ...uploadedAttachments];
					} catch (uploadError) {
						console.error('Failed to upload attachments:', uploadError);
						toast({ title: 'Warning', description: 'Task created but some attachments failed to upload.', variant: 'destructive' });
					}
				}

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

				setTasks([...tasks, newTask]);
				addHistoryEntry({ action: 'CREATE_TASK', entityId: newTask.id, entityType: 'task', projectId: String(project.id), userId: currentUser.id, details: { title: newTask.title } });
				toast({ title: 'Task created', description: 'Task created successfully.' });
				setIsTaskDialogOpen(false); setEditingTask(null);
			}
		} catch (e) { console.error(e); toast({ title: 'Error', description: 'Failed to save task.', variant: 'destructive' }); }
	};

	const handleTaskEdit = (task: Task) => { setEditingTask(task); setIsTaskDialogOpen(true); };
	const handleTaskDelete = async (taskId: string) => {
		if (!currentUser || !project) return;
		try {
			const taskToDelete = tasks.find(t => t.id === taskId);
			if (taskToDelete) addHistoryEntry({ action: 'DELETE_TASK', entityId: taskId, entityType: 'task', projectId: String(project.id), userId: currentUser.id, details: { title: taskToDelete.title } });
			await taskService.delete(taskId);
			setTasks(tasks.filter(t => t.id !== taskId));
			toast({ title: 'Task deleted', description: 'Task deleted successfully.' });
		} catch (e) { console.error(e); toast({ title: 'Error', description: 'Failed to delete task.', variant: 'destructive' }); }
	};

	const handleAddStage = () => { setEditingStage(null); setIsStageDialogOpen(true); };
	const handleEditStage = (stage: Stage) => { setEditingStage(stage); setIsStageDialogOpen(true); };
	const handleDeleteStage = async (stageId: string) => {
		if (!project || !currentUser) return;
		const stageToDelete = project.stages.find(s => s.id === stageId);

		try {
			await stageService.delete(stageId);
			if (stageToDelete) {
				addHistoryEntry({
					action: 'DELETE_STAGE',
					entityId: stageId,
					entityType: 'stage',
					projectId: String(project.id),
					userId: currentUser.id,
					details: { title: stageToDelete.title }
				});
			}
			const updatedStages = project.stages.filter(s => s.id !== stageId);
			setProject({ ...project, stages: updatedStages });
			toast({ title: 'Stage deleted', description: 'Stage deleted successfully.' });
		} catch (error: any) {
			console.error('Error deleting stage:', error);
			const msg = error.response?.data?.message || error.message || 'Failed to delete stage.';
			toast({ title: 'Error', description: msg, variant: 'destructive' });
		}
	};
	const handleSaveStage = async (stage: Omit<Stage, 'order'>) => {
		if (!project || !currentUser) return;
		try {
			if (editingStage) {
				const updatedStage = await stageService.update(editingStage.id, stage);
				const updatedStages = project.stages.map(s => s.id === editingStage.id ? { ...s, ...updatedStage } : s);
				setProject({ ...project, stages: updatedStages });
				addHistoryEntry({ action: 'UPDATE_STAGE', entityId: editingStage.id, entityType: 'stage', projectId: String(project.id), userId: currentUser.id, details: { from: editingStage, to: { ...editingStage, ...stage } } });
				toast({ title: 'Stage updated', description: 'Stage updated successfully.' });
			} else {
				const nonArchiveStages = project.stages.filter(s => s.title.toLowerCase().trim() !== 'archive');
				const maxNonArchiveOrder = nonArchiveStages.length > 0
					? Math.max(...nonArchiveStages.map(s => s.order))
					: 1;
				const newOrder = maxNonArchiveOrder + 1;

				const newStage = await stageService.create({
					...stage,
					order: newOrder,
					project_id: project.id,
				} as any);

				const updatedStages = [...project.stages, newStage];
				setProject({ ...project, stages: updatedStages });
				addHistoryEntry({ action: 'CREATE_STAGE', entityId: newStage.id, entityType: 'stage', projectId: String(project.id), userId: currentUser.id, details: { title: newStage.title } });
				toast({ title: 'Stage created', description: 'Stage created successfully.' });
			}
			setIsStageDialogOpen(false);
			setEditingStage(null);
		} catch (error) {
			console.error('Error saving stage:', error);
			toast({ title: 'Error', description: 'Failed to save stage.', variant: 'destructive' });
		}
	};

	const handleReorderStages = async (newOrderedStages: Stage[]) => {
		if (!project) return;

		// Update local state with new orders
		const updatedStages = newOrderedStages.map((s, index) => ({
			...s,
			order: index
		}));

		setProject({ ...project, stages: updatedStages });

		try {
			await Promise.all(updatedStages.map(stage =>
				api.put(`/stages/${stage.id}`, { order: stage.order })
			));
			toast({ title: 'Success', description: 'Stage order updated.' });
		} catch (e) {
			console.error("Failed to reorder stages", e);
			toast({ title: 'Error', description: 'Failed to save stage order.', variant: 'destructive' });
		}
	};

	const handleApproveTask = (taskId: string, targetStageId: string, comment?: string) => {
		if (!project || !currentUser) return;
		const task = tasks.find(t => t.id === taskId); if (!task) return;
		handleTaskUpdate(taskId, { projectStage: targetStageId, isInSpecificStage: false, previousStage: undefined, originalAssignee: undefined, revisionComment: undefined });
		if (comment) addHistoryEntry({ action: 'UPDATE_TASK_STATUS', entityId: taskId, entityType: 'task', projectId: String(project.id), userId: currentUser.id, details: { action: 'approved', comment, targetStage: project.stages.find(s => s.id === targetStageId)?.title || targetStageId } });
		toast({ title: 'Task approved', description: `Task moved to ${project.stages.find(s => s.id === targetStageId)?.title || 'selected stage'}.` });
		setIsReviewTaskDialogOpen(false); setReviewTask(null);
	};

	const handleRequestRevision = (taskId: string, targetStageId: string, comment: string) => {
		if (!project || !currentUser) return;
		const task = tasks.find(t => t.id === taskId); if (!task) return;
		const originalAssignee = task.originalAssignee || task.assignee;
		if (!originalAssignee) { toast({ title: 'Error', description: 'Could not find the task assignee.', variant: 'destructive' }); return; }
		const newRevision = { id: Date.now().toString(), comment, requestedBy: currentUser.name, requestedAt: new Date().toISOString() };
		const updatedRevisionHistory = [...(task.revisionHistory || []), newRevision];
		const updatedTags = task.tags ? [...task.tags] : []; if (!updatedTags.includes('Redo')) updatedTags.push('Redo');
		handleTaskUpdate(taskId, { projectStage: targetStageId, assignee: originalAssignee, userStatus: 'pending', isInSpecificStage: false, revisionComment: comment, revisionHistory: updatedRevisionHistory, tags: updatedTags, previousStage: undefined, originalAssignee: undefined });
		toast({ title: 'Revision requested', description: `Task sent to ${project.stages.find(s => s.id === targetStageId)?.title || 'selected stage'} for ${originalAssignee} with Redo tag.` });
		setIsReviewTaskDialogOpen(false); setReviewTask(null);
	};

	if (isLoading) {
		return (
			<div className="flex flex-col h-full bg-background">
				{/* Header Skeleton */}
				<div className="flex-shrink-0 border-b bg-background z-10 px-6 py-5">
					<div className="flex flex-col sm:flex-row flex-wrap items-start justify-between gap-4 mb-4">
						<div className="space-y-2">
							<Skeleton className="h-8 w-64" />
							<Skeleton className="h-4 w-96" />
						</div>
						<div className="flex items-center gap-3">
							<Skeleton className="h-9 w-24" />
							<Skeleton className="h-9 w-32" />
							<Skeleton className="h-9 w-28" />
						</div>
					</div>
					<div className="flex justify-start">
						<Skeleton className="h-9 w-32" />
					</div>
				</div>

				{/* Board Skeleton */}
				<div className="flex-1 overflow-hidden">
					<div className="h-full overflow-auto p-6 pb-10 bg-muted/5">
						<div className="flex h-full gap-6">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="flex-shrink-0 w-80 flex flex-col gap-4">
									<Skeleton className="h-12 w-full rounded-lg" />
									<div className="space-y-4">
										{[1, 2, 3].map((j) => (
											<div key={j} className="p-4 rounded-lg border bg-card space-y-3">
												<div className="flex justify-between">
													<Skeleton className="h-4 w-20" />
													<Skeleton className="h-4 w-4 rounded-full" />
												</div>
												<Skeleton className="h-4 w-full" />
												<Skeleton className="h-4 w-3/4" />
												<div className="flex items-center justify-between pt-2">
													<Skeleton className="h-6 w-6 rounded-full" />
													<Skeleton className="h-5 w-16" />
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}
	if (!project) return <div className="flex items-center justify-center h-screen">Project not found</div>;

	const handleSaveSubtask = async (subtaskData: {
		title: string;
		description: string;
		assignee: string;
		assigneeId?: string;
		dueDate: string;
		userStatus: UserStatus;
		priority: TaskPriority;
		startDate?: string;
		tags?: string[];
		pendingFiles?: File[];
		pendingLinks?: { name: string; url: string }[];
	}) => {
		if (!project || !parentTaskForSubtask || !currentUser) return;
		try {
			// Use provided ID or find by name if not provided
			const assigneeId = subtaskData.assigneeId
				? subtaskData.assigneeId
				: (subtaskData.assignee ? teamMembers.find(m => m.name === subtaskData.assignee)?.id : undefined);

			const newTask = await taskService.create({
				title: subtaskData.title,
				description: subtaskData.description,
				projectId: project.id,
				assigneeId: assigneeId ? parseInt(assigneeId) : undefined,
				dueDate: subtaskData.dueDate,
				userStatus: subtaskData.userStatus,
				projectStageId: parentTaskForSubtask.projectStage ? parseInt(parentTaskForSubtask.projectStage) : undefined,
				priority: subtaskData.priority,
				parentId: parentTaskForSubtask.id,
				startDate: subtaskData.startDate,
				tags: subtaskData.tags,
			} as any);

			// Handle Attachments
			if (subtaskData.pendingFiles && subtaskData.pendingFiles.length > 0) {
				await attachmentService.uploadFiles(newTask.id, subtaskData.pendingFiles);
			}

			if (subtaskData.pendingLinks && subtaskData.pendingLinks.length > 0) {
				for (const link of subtaskData.pendingLinks) {
					await attachmentService.addLink(newTask.id, link.name, link.url);
				}
			}

			toast({ title: "Subtask added", description: "Subtask created successfully." });

			// Refresh tasks
			const tasksData = await taskService.getAll({ projectId: String(project.id) });
			setTasks(tasksData.filter(t => t.projectId === project.id));

		} catch (error) {
			console.error("Failed to add subtask", error);
			toast({ title: "Error", description: "Failed to create subtask.", variant: "destructive" });
		}
	};

	const sortedStages = [...project.stages].sort((a, b) => {
		const getPriority = (s: Stage) => {
			const t = s.title.toLowerCase().trim();
			if (t === 'suggested' || t === 'suggested task') return 0;
			if (t === 'pending') return 1;
			if (t === 'completed' || t === 'complete') return 998;
			if (t === 'archive') return 999;
			return 10;
		};
		const pA = getPriority(a);
		const pB = getPriority(b);
		if (pA !== pB) return pA - pB;
		return a.order - b.order;
	});

	// Filter out subtasks from the main board view so they don't appear as duplicate cards
	// Only show top-level tasks (where parentId is null/undefined)
	const topLevelTasks = tasks.filter(t => !t.parentId);

	return (
		<div className="flex flex-col h-full bg-background">
			{/* FIXED HEADER */}
			<header className={`flex-shrink-0 border-b bg-background z-10 px-6 py-5 shadow-sm transition-[padding] duration-200 ${open ? "pr-12" : ""}`}>
				<div className="w-full">
					<div className="flex flex-col sm:flex-row flex-wrap items-start justify-between gap-4 mb-4">
						<div>
							<h1 className="text-3xl font-bold flex items-center gap-3">
								{project.name}
								{project.isArchived && (
									<Badge variant="secondary" className="text-xs font-normal">
										Archived
									</Badge>
								)}
							</h1>
							<div
								className="text-muted-foreground mt-1 prose prose-sm dark:prose-invert max-w-none"
								dangerouslySetInnerHTML={{
									__html: (() => {
										const txt = document.createElement("textarea");
										let val = project.description || '';
										let lastVal = '';
										let limit = 0;
										while (val !== lastVal && limit < 5) {
											lastVal = val;
											txt.innerHTML = val;
											val = txt.value;
											limit++;
										}
										return val;
									})()
								}}
							/>
						</div>
						<div className="flex items-center gap-3">
							{(currentUser?.role === 'admin' || currentUser?.role === 'team-lead' || currentUser?.role === 'account-manager') && (
								<>
									<Button variant="outline" onClick={() => setIsHistoryDialogOpen(true)}>
										View History
									</Button>
									{!project.isArchived && (
										<>
											{(currentUser?.role === 'admin' || currentUser?.role === 'team-lead') && (
												<Button variant="outline" onClick={() => setIsStageManagementOpen(true)}>
													Manage Stages
												</Button>
											)}
											<Button onClick={() => { setEditingTask(null); setIsTaskDialogOpen(true); }}>
												<Plus className="mr-2 h-4 w-4" /> Add Task
											</Button>
										</>
									)}
								</>
							)}
						</div>
					</div>

					<div className="flex justify-start">
						<ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as 'kanban' | 'list')}>
							<ToggleGroupItem value="kanban" aria-label="Kanban view">
								<LayoutGrid className="h-4 w-4 mr-2" />
								Kanban
							</ToggleGroupItem>
							<ToggleGroupItem value="list" aria-label="List view">
								<List className="h-4 w-4 mr-2" />
								List
							</ToggleGroupItem>
						</ToggleGroup>
					</div>
				</div>
			</header>

			{/* SCROLLABLE CONTENT AREA */}
			<main className="flex-1 overflow-hidden">
				<div className="h-full overflow-auto p-6 pb-10 bg-muted/5">
					<div className="w-full">
						{view === 'kanban' ? (
							<KanbanBoard
								tasks={topLevelTasks}
								stages={sortedStages}
								onTaskUpdate={!project.isArchived ? handleTaskUpdate : undefined}
								onTaskEdit={!project.isArchived ? handleTaskEdit : undefined}
								onTaskDelete={!project.isArchived ? handleTaskDelete : undefined}
								useProjectStages
								canManageTasks={currentUser?.role !== 'user' && !project.isArchived}
								canDragTasks={currentUser?.role !== 'user' && currentUser?.role !== 'account-manager' && !project.isArchived}
								disableColumnScroll={true}
								onTaskReview={!project.isArchived ? (task) => { setReviewTask(task); setIsReviewTaskDialogOpen(true); } : undefined}
								onAddTaskToStage={!project.isArchived ? handleAddTaskToStage : undefined}
								projectId={String(project.id)}
								onAddSubtask={!project.isArchived ? handleAddSubtask : undefined}
							/>
						) : (
							<TaskListView
								tasks={topLevelTasks}
								stages={sortedStages}
								onTaskEdit={!project.isArchived ? handleTaskEdit : undefined}
								onTaskDelete={!project.isArchived ? handleTaskDelete : undefined}
								onTaskUpdate={!project.isArchived ? handleTaskUpdate : undefined}
								teamMembers={teamMembers}
								canManage={currentUser?.role !== 'user' && !project.isArchived}
								onTaskReview={!project.isArchived ? (task) => { setReviewTask(task); setIsReviewTaskDialogOpen(true); } : undefined}
								showReviewButton={(currentUser?.role === 'admin' || currentUser?.role === 'team-lead') && !project.isArchived}
							/>
						)}
					</div>
				</div>
			</main>

			{/* DIALOGS */}
			<HistoryDialog
				open={isHistoryDialogOpen}
				onOpenChange={setIsHistoryDialogOpen}
				history={history}
				teamMembers={teamMembers}
				stages={sortedStages}
			/>
			<TaskDialog
				open={isTaskDialogOpen}
				onOpenChange={(open) => {
					setIsTaskDialogOpen(open);
					if (!open) {
						setPreselectedStageId(undefined);
						setEditingTask(null);
					}
				}}
				onSave={handleSaveTask}
				editTask={editingTask}
				availableStatuses={sortedStages}
				useProjectStages
				availableProjects={[project.name]}
				allProjects={[project]}
				teamMembers={teamMembers}
				departments={departments}
				allTasks={allTasks}
				initialStageId={preselectedStageId}
				isStageLocked={!!preselectedStageId}
				currentUser={currentUser}
				fixedDepartmentId={project.department?.id}
			/>
			<StageManagement
				open={isStageManagementOpen}
				onOpenChange={setIsStageManagementOpen}
				stages={sortedStages}
				onAddStage={handleAddStage}
				onEditStage={handleEditStage}
				onDeleteStage={handleDeleteStage}
				onReorderStages={handleReorderStages}
			/>
			<StageDialog
				open={isStageDialogOpen}
				onOpenChange={setIsStageDialogOpen}
				onSave={handleSaveStage}
				existingStages={sortedStages}
				editStage={editingStage}
				teamMembers={teamMembers}
			/>
			<ReviewTaskDialog
				open={isReviewTaskDialogOpen}
				onOpenChange={setIsReviewTaskDialogOpen}
				task={reviewTask}
				stages={sortedStages}
				onApprove={handleApproveTask}
				onRequestRevision={handleRequestRevision}
			/>
			<AddSubtaskDialog
				open={isAddSubtaskDialogOpen}
				onOpenChange={setIsAddSubtaskDialogOpen}
				onSave={handleSaveSubtask}
				teamMembers={teamMembers}
				parentTaskTitle={parentTaskForSubtask?.title || "Task"}
				departments={departments}
				currentUser={currentUser}
			/>
		</div>
	);
}