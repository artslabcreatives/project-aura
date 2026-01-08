import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useEffect, useState } from "react";
import { Project } from "@/types/project";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Task, User, UserStatus } from "@/types/task";
import { StageDialog } from "@/components/StageDialog";
import { Button } from "@/components/ui/button";
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
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { userService } from "@/services/userService";
import { departmentService } from "@/services/departmentService";
import { attachmentService } from "@/services/attachmentService";
import { stageService } from "@/services/stageService";
import { AddSubtaskDialog } from "@/components/AddSubtaskDialog";

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

	if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
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

	// Subtask Dialog State
	const [isAddSubtaskDialogOpen, setIsAddSubtaskDialogOpen] = useState(false);
	const [parentTaskForSubtask, setParentTaskForSubtask] = useState<Task | null>(null);

	const handleAddSubtask = (parentTask: Task) => {
		setParentTaskForSubtask(parentTask);
		setIsAddSubtaskDialogOpen(true);
	};

	useEffect(() => {
		const loadData = async () => {
			if (!numericProjectId) return;
			setIsLoading(true);
			try {
				const currentProject = await projectService.getById(String(numericProjectId));
				if (!currentProject) { setProject(null); setIsLoading(false); return; }
				const departmentsData = await departmentService.getAll();
				if (currentUser?.role === 'team-lead') {
					const hasMatchingDepartment = currentProject.department?.id === currentUser.department;
					const currentDept = departmentsData.find(d => d.id === currentUser.department);
					const isDigitalDept = currentDept?.name.toLowerCase() === 'digital';
					const isDesignProject = currentProject.department?.name.toLowerCase() === 'design';
					const hasSpecialPermission = isDigitalDept && isDesignProject;
					if (!hasMatchingDepartment && !hasSpecialPermission) { setProject(null); setIsLoading(false); return; }
				}
				setProject(currentProject);
				const tasksData = await taskService.getAll({ projectId: String(currentProject.id) });
				const projectTasks = tasksData.filter(t => t.projectId === currentProject.id);
				setTasks(projectTasks);
				setAllTasks(await taskService.getAll());
				setTeamMembers(await userService.getAll());
				setDepartments(departmentsData);

				// Deep link handling
				const taskIdParam = searchParams.get('task');
				if (taskIdParam && projectTasks.length > 0) {
					const foundTask = projectTasks.find(t => String(t.id) === taskIdParam);
					if (foundTask) {
						if (currentUser?.role === 'user') {
							// For normal users, redirect to their specific stage view if assigned
							if (foundTask.assignee === currentUser.name) {
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
			} finally { setIsLoading(false); }
		};
		loadData();
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
			const projectStageId = updates.projectStage ? parseInt(String(updates.projectStage), 10) : undefined;
			await taskService.update(taskId, {
				...updates,
				assigneeId: assigneeId ? parseInt(String(assigneeId), 10) : undefined,
				projectStageId,
			});
			console.log('[KANBAN] Applied update', { taskId, assigneeId, projectStageId });
			setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
		} catch (e) { console.error(e); toast({ title: 'Error', description: 'Failed to update task.', variant: 'destructive' }); }
	};

	const handleSaveTask = async (task: Omit<Task, 'id' | 'createdAt'>, pendingFiles?: File[], pendingLinks?: { name: string; url: string }[]) => {
		if (!currentUser || !project) return;
		try {
			const assigneeId = task.assignee ? teamMembers.find(m => m.name === task.assignee)?.id : undefined;
			const projectStageId = task.projectStage ? parseInt(task.projectStage) : undefined;

			const { project: projectName, assignee, projectStage, ...cleanTask } = task;
			const taskPayload = {
				...cleanTask,
				projectId: project.id,
				assigneeId: assigneeId ? parseInt(assigneeId) : undefined,
				projectStageId,
			};

			if (editingTask) {
				await taskService.update(editingTask.id, taskPayload);
				setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...task, projectId: project.id, assigneeId } : t));
				addHistoryEntry({ action: 'UPDATE_TASK', entityId: editingTask.id, entityType: 'task', projectId: String(project.id), userId: currentUser.id, details: { from: editingTask, to: { ...editingTask, ...task } } });
				toast({ title: 'Task updated', description: 'Task updated successfully.' });
			} else {
				const newTask = await taskService.create(taskPayload as any);

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
	const handleDeleteStage = (stageId: string) => {
		if (!project || !currentUser) return;
		const stageToDelete = project.stages.find(s => s.id === stageId);
		if (stageToDelete) addHistoryEntry({ action: 'DELETE_STAGE', entityId: stageId, entityType: 'stage', projectId: String(project.id), userId: currentUser.id, details: { title: stageToDelete.title } });
		const updatedStages = project.stages.filter(s => s.id !== stageId);
		updateProjectInStorage({ ...project, stages: updatedStages });
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

	if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
	if (!project) return <div className="flex items-center justify-center h-screen">Project not found</div>;

	const handleSaveSubtask = async (subtaskData: { title: string; description: string; assignee: string; dueDate: string; userStatus: UserStatus }) => {
		if (!project || !parentTaskForSubtask || !currentUser) return;
		try {
			const assigneeId = subtaskData.assignee ? teamMembers.find(m => m.name === subtaskData.assignee)?.id : undefined;

			await taskService.create({
				title: subtaskData.title,
				description: subtaskData.description,
				projectId: project.id,
				assigneeId: assigneeId ? parseInt(assigneeId) : undefined,
				dueDate: subtaskData.dueDate,
				userStatus: subtaskData.userStatus,
				projectStageId: parentTaskForSubtask.projectStage ? parseInt(parentTaskForSubtask.projectStage) : undefined,
				priority: 'medium', // Default
				parentId: parentTaskForSubtask.id,
			} as any);

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
			<header className="flex-shrink-0 border-b bg-background z-10 px-6 py-5 shadow-sm mr-12">
				<div className="max-w-6xl mx-auto w-full">
					<div className="flex flex-col sm:flex-row flex-wrap items-start justify-between gap-4 mb-4">
						<div>
							<h1 className="text-3xl font-bold">{project.name}</h1>
							<p className="text-muted-foreground mt-1">{project.description}</p>
						</div>
						<div className="flex items-center gap-3 mr-6">
							{(currentUser?.role === 'admin' || currentUser?.role === 'team-lead') && (
								<>
									<Button variant="outline" onClick={() => setIsHistoryDialogOpen(true)}>
										View History
									</Button>
									<Button variant="outline" onClick={() => setIsStageManagementOpen(true)}>
										Manage Stages
									</Button>
									<Button onClick={() => { setEditingTask(null); setIsTaskDialogOpen(true); }}>
										<Plus className="mr-2 h-4 w-4" /> Add Task
									</Button>
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
					<div className="max-w-7xl mx-auto">
						{view === 'kanban' ? (
							<KanbanBoard
								tasks={topLevelTasks}
								stages={sortedStages}
								onTaskUpdate={handleTaskUpdate}
								onTaskEdit={handleTaskEdit}
								onTaskDelete={handleTaskDelete}
								useProjectStages
								canManageTasks={currentUser?.role !== 'user'}
								canDragTasks={currentUser?.role !== 'user'}
								disableColumnScroll={true}
								onTaskReview={(task) => { setReviewTask(task); setIsReviewTaskDialogOpen(true); }}
								onAddTaskToStage={handleAddTaskToStage}
								projectId={String(project.id)}
								onAddSubtask={handleAddSubtask}
							/>
						) : (
							<TaskListView
								tasks={topLevelTasks}
								stages={sortedStages}
								onTaskEdit={handleTaskEdit}
								onTaskDelete={handleTaskDelete}
								onTaskUpdate={handleTaskUpdate}
								teamMembers={teamMembers}
								canManage={currentUser?.role !== 'user'}
								onTaskReview={(task) => { setReviewTask(task); setIsReviewTaskDialogOpen(true); }}
								showReviewButton={currentUser?.role === 'admin' || currentUser?.role === 'team-lead'}
							/>
						)}
					</div>
				</div>
			</main>

			{/* DIALOGS */}
			<HistoryDialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen} history={history} teamMembers={teamMembers} />
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
				teamMembers={teamMembers}
				departments={departments}
				allTasks={allTasks}
				initialStageId={preselectedStageId}
				isStageLocked={!!preselectedStageId}
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
				parentTaskTitle={parentTaskForSubtask?.title || ''}
			/>
		</div>
	);
}