import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Project } from "@/types/project";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Task, User, SuggestedTask } from "@/types/task";
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
import { SuggestedTaskCard } from "@/components/SuggestedTaskCard";

import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectKanban() {
	const { projectId } = useParams<{ projectId: string }>();
	const numericProjectId = projectId ? parseInt(projectId, 10) : undefined;
	const [project, setProject] = useState<Project | null>(null);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
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
	const { history, addHistoryEntry, loading: historyLoading } = useHistory(numericProjectId ? String(numericProjectId) : undefined);
	const { currentUser } = useUser();
	const { toast } = useToast();
	const [view, setView] = useState<"kanban" | "list">("kanban");

	const [searchParams, setSearchParams] = useSearchParams();

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
			}, 1000);
		}
	}, [tasks, searchParams]);

	useEffect(() => {
		const loadData = async () => {
			if (!numericProjectId) return;
			setIsLoading(true);
			try {
				// Optimization: Fetch independent initial data in parallel
				const [currentProject, departmentsData] = await Promise.all([
					projectService.getById(String(numericProjectId)),
					departmentService.getAll()
				]);

				if (!currentProject) {
					setProject(null);
					setIsLoading(false);
					return;
				}

				if (currentUser?.role === 'team-lead') {
					const hasMatchingDepartment = String(currentProject.department?.id) === String(currentUser.department);
					const currentDept = departmentsData.find(d => String(d.id) === String(currentUser.department));
					const isDigitalDept = currentDept?.name.toLowerCase() === 'digital';
					const isDesignProject = currentProject.department?.name.toLowerCase() === 'design';
					const hasSpecialPermission = isDigitalDept && isDesignProject;
					const isCollaborator = currentProject.collaborators?.some(c => String(c.id) === String(currentUser.id));

					if (!hasMatchingDepartment && !hasSpecialPermission && !isCollaborator) {
						setProject(null);
						setIsLoading(false);
						return;
					}
				}
				setProject(currentProject);
				setDepartments(departmentsData);

				// Optimization: Fetch remaining data in parallel
				// REMOVED: const allTasksData = await taskService.getAll(); <- This was fetching ALL tasks in system, causing slowness.
				const [tasksData, suggestedTasksData, usersData] = await Promise.all([
					taskService.getAll({ projectId: String(currentProject.id) }),
					projectService.getSuggestedTasks(String(currentProject.id)),
					userService.getAll()
				]);

				const projectTasks = tasksData.filter(t => t.projectId === currentProject.id);
				setTasks(projectTasks);
				setSuggestedTasks(suggestedTasksData);
				// We use project tasks for allTasks to avoid the massive global fetch. 
				// This means the "task count" in assignee dropdown will reflect project-load, not global-load, which is acceptable for performance.
				setAllTasks(projectTasks);
				// Filter out deactivated users
				const activeUsers = usersData.filter(user => user.is_active !== false); // Handle undefined as active just in case, or explicitly true
				setTeamMembers(activeUsers);

			} catch (error) {
				console.error('Error loading project data:', error);
				toast({
					title: 'Error',
					description: 'Failed to load project data. Please try again.',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
			}
		};
		loadData();
	}, [numericProjectId, currentUser]);

	const updateProjectInStorage = async (updatedProject: Project) => {
		try {
			if (!updatedProject.id) return;
			await projectService.update(String(updatedProject.id), updatedProject);
			setProject(updatedProject);
			toast({
				title: "Project updated",
				description: "Project has been updated successfully.",
			});
		} catch (error) {
			console.error("Error updating project:", error);
			toast({
				title: "Error",
				description: "Failed to update project. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
		if (!currentUser || !project) return;
		const taskToUpdate = tasks.find(task => task.id === taskId);
		if (!taskToUpdate) return;
		try {
			// Auto transition when marking complete without explicit projectStage
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
				// Only auto-assign if assignee is NOT explicitly provided in updates
				if (!('assignee' in updates)) {
					const targetStage = project.stages.find(s => s.id === updates.projectStage);

					// Check if we are reverting to previous stage (rejection)
					// The backend handles this, but the frontend might override it if we set assignee here.
					// If we are moving back to previous stage, we should ideally NOT set assignee here and let backend handle it.
					// But we don't have easy access to 'previousStage' ID here unless it's in the task object.

					// If the backend observer is working, it will override whatever we send here IF we send the ID.
					// But we are sending the NAME here.

					// Let's try to be smarter.
					// If the target stage is the previous stage of the task, we should try to restore original assignee.
					if (taskToUpdate.previousStage && updates.projectStage === taskToUpdate.previousStage && taskToUpdate.originalAssignee) {
						updates.assignee = taskToUpdate.originalAssignee;
					} else if (targetStage?.mainResponsibleId) {
						const mainResponsible = teamMembers.find(m => m.id === targetStage.mainResponsibleId);
						updates.assignee = mainResponsible ? mainResponsible.name : "";
					} else {
						updates.assignee = "";
					}
				}
				if (!('userStatus' in updates)) updates.userStatus = "pending";
				const sortedStages = [...project.stages].sort((a, b) => a.order - b.order);
				const lastStage = sortedStages[sortedStages.length - 1];
				if (updates.projectStage === lastStage.id) {
					const currentTags = taskToUpdate.tags || [];
					if (!currentTags.includes("Completed")) updates.tags = [...currentTags, "Completed"];
				} else {
					const currentTags = taskToUpdate.tags || [];
					if (currentTags.includes("Completed")) updates.tags = currentTags.filter(tag => tag !== "Completed");
				}
				addHistoryEntry({
					action: 'UPDATE_TASK_STATUS',
					entityId: taskId,
					entityType: 'task',
					projectId: String(project.id),
					userId: currentUser.id,
					details: { from: taskToUpdate.projectStage, to: updates.projectStage },
				});
			}
			if (updates.assignee && updates.assignee !== taskToUpdate.assignee) {
				addHistoryEntry({
					action: 'UPDATE_TASK_ASSIGNEE',
					entityId: taskId,
					entityType: 'task',
					projectId: String(project.id),
					userId: currentUser.id,
					details: { from: taskToUpdate.assignee, to: updates.assignee },
				});
			}
			// Prepare updates for backend
			// We need to convert assignee name to ID if it's present
			const backendUpdates = { ...updates };
			if (updates.assignee) {
				const assigneeUser = teamMembers.find(u => u.name === updates.assignee);
				if (assigneeUser) {
					// @ts-ignore - adding assigneeId to updates for service
					backendUpdates.assigneeId = parseInt(assigneeUser.id);
				}
			}

			await taskService.update(taskId, backendUpdates as any);

			// For local state, we keep using the name
			setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
		} catch (error) {
			console.error("Error updating task:", error);
			toast({ title: "Error", description: "Failed to update task.", variant: "destructive" });
		}
	};

	const handleAddSuggestedTask = async (suggestedTaskId: string, stageId: string) => {
		if (!currentUser || !project) return;
		const suggestedTask = suggestedTasks.find(t => t.id === suggestedTaskId);
		if (!suggestedTask) return;

		try {
			const newTaskData: Omit<Task, "id" | "createdAt"> = {
				title: suggestedTask.title,
				description: suggestedTask.description,
				project: project.name,
				projectId: project.id,
				assignee: "",
				dueDate: new Date().toISOString(),
				userStatus: "pending",
				projectStage: stageId,
				priority: "medium",
				tags: ["AI Suggestion"],
			};

			const newTask = await taskService.create(newTaskData as any);
			setTasks([...tasks, newTask]);
			setSuggestedTasks(suggestedTasks.filter(t => t.id !== suggestedTaskId));

			addHistoryEntry({
				action: 'CREATE_TASK',
				entityId: newTask.id,
				entityType: 'task',
				projectId: String(project.id),
				userId: currentUser.id,
				details: { title: newTask.title, source: 'AI Suggestion' },
			});

			toast({ title: "Task created", description: "Suggested task added to board." });
		} catch (error) {
			console.error("Error adding suggested task:", error);
			toast({ title: "Error", description: "Failed to add suggested task.", variant: "destructive" });
		}
	};

	const handleSaveTask = async (task: Omit<Task, "id" | "createdAt">, pendingFiles?: File[], pendingLinks?: { name: string; url: string }[]) => {
		if (!currentUser || !project) return;
		try {
			if (editingTask) {
				const updatedTask = await taskService.update(editingTask.id, task as any);
				setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t));
				addHistoryEntry({
					action: 'UPDATE_TASK', entityId: editingTask.id, entityType: 'task', projectId: String(project.id), userId: currentUser.id,
					details: { from: editingTask, to: { ...editingTask, ...task } },
				});
				toast({ title: "Task updated", description: "Task updated successfully." });
			} else {
				const newTask = await taskService.create({ ...task, projectId: project.id } as any);

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

				setTasks([...tasks, newTask]);
				addHistoryEntry({
					action: 'CREATE_TASK', entityId: newTask.id, entityType: 'task', projectId: String(project.id), userId: currentUser.id,
					details: { title: newTask.title },
				});
				toast({ title: "Task created", description: "Task created successfully." });
			}
			setIsTaskDialogOpen(false);
			setEditingTask(null);
		} catch (error) {
			console.error("Error saving task:", error);
			toast({ title: "Error", description: "Failed to save task.", variant: "destructive" });
		}
	};

	const handleTaskEdit = (task: Task) => {
		setEditingTask(task);
		setIsTaskDialogOpen(true);
	};

	const handleTaskDelete = async (taskId: string) => {
		if (!currentUser || !project) return;
		try {
			const taskToDelete = tasks.find(t => t.id === taskId);
			if (taskToDelete) {
				addHistoryEntry({ action: 'DELETE_TASK', entityId: taskId, entityType: 'task', projectId: String(project.id), userId: currentUser.id, details: { title: taskToDelete.title } });
			}
			await taskService.delete(taskId);
			setTasks(tasks.filter(t => t.id !== taskId));
			toast({ title: "Task deleted", description: "Task deleted successfully." });
		} catch (error) {
			console.error("Error deleting task:", error);
			toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" });
		}
	};

	const handleAddStage = () => { setEditingStage(null); setIsStageDialogOpen(true); };
	const handleEditStage = (stage: Stage) => { setEditingStage(stage); setIsStageDialogOpen(true); };
	const handleDeleteStage = async (stageId: string) => {
		if (!project || !currentUser) return;
		const stageToDelete = project.stages.find(s => s.id === stageId);
		try {
			await stageService.delete(stageId);
			if (stageToDelete) {
				addHistoryEntry({ action: 'DELETE_STAGE', entityId: stageId, entityType: 'stage', projectId: String(project.id), userId: currentUser.id, details: { title: stageToDelete.title } });
			}
			const updatedStages = project.stages.filter(s => s.id !== stageId);
			setProject({ ...project, stages: updatedStages });
			toast({ title: "Stage deleted", description: "Stage deleted successfully." });
		} catch (error: any) {
			console.error("Error deleting stage:", error);
			const msg = error.response?.data?.message || error.message || "Failed to delete stage.";
			toast({ title: "Error", description: msg, variant: "destructive" });
		}
	};

	const handleSaveStage = async (stage: Omit<Stage, "order">) => {
		if (!project || !currentUser) return;
		try {
			if (editingStage) {
				const updatedStage = await stageService.update(editingStage.id, stage);
				const updatedStages = project.stages.map(s => s.id === editingStage.id ? { ...s, ...updatedStage } : s);
				setProject({ ...project, stages: updatedStages });
				addHistoryEntry({ action: 'UPDATE_STAGE', entityId: editingStage.id, entityType: 'stage', projectId: String(project.id), userId: currentUser.id, details: { from: editingStage, to: { ...editingStage, ...stage } } });
				toast({ title: "Stage updated", description: "Stage updated successfully." });
			} else {
				// Calculate order: after all stages except Archive
				// Ensure Suggested Task (0) and Pending (1) are respected.
				// New stages should start from index 2 or higher.
				const otherStages = project.stages.filter(s => s.title !== 'Archive');
				const maxOrder = Math.max(...otherStages.map(s => s.order), 1); // Start at least after Pending (1)
				const newOrder = maxOrder + 1;

				if (!project.id) {
					throw new Error("Project ID is missing");
				}

				const newStage = await stageService.create({
					...stage,
					order: newOrder,
					projectId: project.id
				} as any);

				// If we have an Archive stage, ensure it stays at the end (though 999 should be enough)
				// But if we want to be super safe, we could check if newOrder >= 999 and shift Archive.
				// For now, assuming 999 is high enough.

				const updatedStages = [...project.stages, newStage];
				setProject({ ...project, stages: updatedStages });
				addHistoryEntry({ action: 'CREATE_STAGE', entityId: newStage.id, entityType: 'stage', projectId: String(project.id), userId: currentUser.id, details: { title: newStage.title } });
				toast({ title: "Stage created", description: "Stage created successfully." });
			}
			setIsStageDialogOpen(false);
			setEditingStage(null);
		} catch (error) {
			console.error("Error saving stage:", error);
			toast({ title: "Error", description: "Failed to save stage.", variant: "destructive" });
		}
	};

	const handleApproveTask = (taskId: string, targetStageId: string, comment?: string) => {
		if (!project || !currentUser) return;
		const task = tasks.find(t => t.id === taskId);
		if (!task) return;
		handleTaskUpdate(taskId, { projectStage: targetStageId, isInSpecificStage: false, previousStage: undefined, originalAssignee: undefined, revisionComment: undefined });
		if (comment) {
			addHistoryEntry({ action: 'UPDATE_TASK_STATUS', entityId: taskId, entityType: 'task', projectId: String(project.id), userId: currentUser.id, details: { action: 'approved', comment, targetStage: project.stages.find(s => s.id === targetStageId)?.title || targetStageId } });
		}
		toast({ title: 'Task approved', description: `Task moved to ${project.stages.find(s => s.id === targetStageId)?.title || 'selected stage'}.` });
		setIsReviewTaskDialogOpen(false);
		setReviewTask(null);
	};

	const handleRequestRevision = (taskId: string, targetStageId: string, comment: string) => {
		if (!project || !currentUser) return;
		const task = tasks.find(t => t.id === taskId);
		if (!task) return;
		const originalAssignee = task.originalAssignee || task.assignee;
		if (!originalAssignee) { toast({ title: 'Error', description: 'Could not find the task assignee.', variant: 'destructive' }); return; }
		const newRevision = { id: Date.now().toString(), comment, requestedBy: currentUser.name, requestedAt: new Date().toISOString() };
		const updatedRevisionHistory = [...(task.revisionHistory || []), newRevision];
		const updatedTags = task.tags ? [...task.tags] : [];
		if (!updatedTags.includes('Redo')) updatedTags.push('Redo');

		// We do NOT set assignee here, we let the backend observer handle it based on previousStage/originalAssignee
		// But wait, the backend observer only restores if we are moving back to previous_stage_id
		// Here we are explicitly setting projectStage to targetStageId.

		// If we want the backend to handle it, we should just update the stage.
		// However, the frontend code here tries to be smart and set the assignee.
		// The issue is that 'originalAssignee' here is a NAME string, but the backend expects an ID if we were to send it.
		// But we shouldn't send the assignee name at all if we want the backend to restore it from the ID.

		// Let's try to find the ID of the original assignee
		const originalAssigneeName = task.originalAssignee || task.assignee;
		const originalAssigneeUser = teamMembers.find(u => u.name === originalAssigneeName);

		// If we found the user, we can send the ID. 
		// But actually, since we implemented the backend observer to restore the assignee when moving back to previous stage,
		// we might not need to send assignee at all IF targetStageId == task.previousStage

		// However, to be safe and explicit (and since the frontend logic seems to want to control it),
		// let's send the assignee ID if we have it.

		const updates: any = {
			projectStage: targetStageId,
			userStatus: 'pending',
			isInSpecificStage: false,
			revisionComment: comment,
			revisionHistory: updatedRevisionHistory,
			tags: updatedTags,
			previousStage: undefined,
			originalAssignee: undefined
		};

		if (originalAssigneeUser) {
			// We need to send the ID, but the Task interface uses 'assignee' as string name.
			// The handleTaskUpdate function in this file (ProjectKanban.tsx) likely maps it.
			// Let's check handleTaskUpdate in this file.
			updates.assignee = originalAssigneeName;
		}

		handleTaskUpdate(taskId, updates);
		toast({ title: 'Revision requested', description: `Task sent to ${project.stages.find(s => s.id === targetStageId)?.title || 'selected stage'} for ${originalAssignee} with Redo tag.` });
		setIsReviewTaskDialogOpen(false);
		setReviewTask(null);
	};

	if (isLoading) {
		return (
			<div className="flex flex-col h-screen overflow-hidden">
				<div className="flex-shrink-0 border-b p-4 space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-2">
							<Skeleton className="h-8 w-64" />
							<Skeleton className="h-4 w-96" />
						</div>
						<div className="flex gap-2">
							<Skeleton className="h-9 w-24" />
							<Skeleton className="h-9 w-32" />
							<Skeleton className="h-9 w-24" />
						</div>
					</div>
				</div>
				<div className="flex-1 overflow-auto p-4">
					<div className="flex gap-4">
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
		);
	}
	if (!project) return <div className="flex items-center justify-center h-screen">Project not found</div>;

	return (
		<div className="flex flex-col h-screen overflow-hidden">
			<div className="flex-shrink-0 border-b p-4 space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">{project.name}</h1>
						<div
							className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
							dangerouslySetInnerHTML={{
								__html: (() => {
									const txt = document.createElement("textarea");
									let val = project.description || '';
									let lastVal = '';
									let limit = 0;
									// Recursively decode until stable or limit reached
									// We use a limit to prevent infinite loops if something weird happens
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
					<div className="flex gap-2">
						{(currentUser?.role === 'admin' || currentUser?.role === 'team-lead' || currentUser?.role === 'account-manager') && (
							<>
								<Button variant="outline" onClick={() => setIsHistoryDialogOpen(true)}>View History</Button>
								{(currentUser?.role === 'admin' || currentUser?.role === 'team-lead') && (
									<Button variant="outline" onClick={() => setIsStageManagementOpen(true)}>Manage Stages</Button>
								)}
								<Button onClick={() => { setEditingTask(null); setIsTaskDialogOpen(true); }}>
									<Plus className="mr-2 h-4 w-4" /> Add Task
								</Button>
							</>
						)}
					</div>
				</div>
				<div className="flex items-center justify-between">
					<ToggleGroup type="single" value={view} onValueChange={v => v && setView(v as 'kanban' | 'list')}>
						<ToggleGroupItem value="kanban" aria-label="Kanban view"><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
						<ToggleGroupItem value="list" aria-label="List view"><List className="h-4 w-4" /></ToggleGroupItem>
					</ToggleGroup>
				</div>
			</div>
			<div className="flex-1 overflow-auto p-4">
				{suggestedTasks.length > 0 && (
					<div className="mb-6">
						<h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
							<span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
							Suggested Tasks ({suggestedTasks.length})
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
							{suggestedTasks.map((task) => (
								<SuggestedTaskCard
									key={task.id}
									task={task}
									targetStages={project.stages}
									onAdd={handleAddSuggestedTask}
								/>
							))}
						</div>
					</div>
				)}
				{view === 'kanban' ? (
					<KanbanBoard
						tasks={tasks}
						stages={[...project.stages].sort((a, b) => {
							const getPriority = (s: Stage) => {
								const t = s.title.toLowerCase().trim();
								if (t === 'suggested') return 0;
								if (t === 'pending') return 1;
								if (t === 'archive') return 999;
								return 10;
							};
							const pA = getPriority(a);
							const pB = getPriority(b);
							if (pA !== pB) return pA - pB;
							return a.order - b.order;
						})}
						onTaskUpdate={handleTaskUpdate}
						onTaskEdit={handleTaskEdit}
						onTaskDelete={handleTaskDelete}
						useProjectStages
						canManageTasks={currentUser?.role !== 'user'}
						canDragTasks={currentUser?.role !== 'user'}
						onTaskReview={task => { setReviewTask(task); setIsReviewTaskDialogOpen(true); }}
						disableBacklogRenaming={currentUser?.role === 'user'}
					/>
				) : (
					<TaskListView
						tasks={tasks}
						stages={[...project.stages].sort((a, b) => {
							const getPriority = (s: Stage) => {
								const t = s.title.toLowerCase().trim();
								if (t === 'suggested') return 0;
								if (t === 'pending') return 1;
								if (t === 'archive') return 999;
								return 10;
							};
							const pA = getPriority(a);
							const pB = getPriority(b);
							if (pA !== pB) return pA - pB;
							return a.order - b.order;
						})}
						onTaskEdit={handleTaskEdit}
						onTaskDelete={handleTaskDelete}
						onTaskUpdate={handleTaskUpdate}
						teamMembers={teamMembers}
						canManage={currentUser?.role !== 'user'}
						onTaskReview={task => { setReviewTask(task); setIsReviewTaskDialogOpen(true); }}
						showReviewButton={currentUser?.role === 'admin' || currentUser?.role === 'team-lead'}
					/>
				)}
			</div>
			<HistoryDialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen} history={history} teamMembers={teamMembers} stages={project.stages} loading={historyLoading} />
			<TaskDialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen} onSave={handleSaveTask} editTask={editingTask} availableStatuses={project.stages} useProjectStages availableProjects={[project.name]} allProjects={[project]} teamMembers={teamMembers} departments={departments} allTasks={allTasks} />
			<StageManagement open={isStageManagementOpen} onOpenChange={setIsStageManagementOpen} stages={project.stages} onAddStage={handleAddStage} onEditStage={handleEditStage} onDeleteStage={handleDeleteStage} />
			<StageDialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen} onSave={handleSaveStage} existingStages={project.stages} editStage={editingStage} teamMembers={teamMembers} />
			<ReviewTaskDialog open={isReviewTaskDialogOpen} onOpenChange={setIsReviewTaskDialogOpen} task={reviewTask} stages={project.stages} onApprove={handleApproveTask} onRequestRevision={handleRequestRevision} />
		</div>
	);
}
