import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useEffect, useState, useCallback, useRef } from "react";
import { Project } from "@/types/project";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Task, User, UserStatus, TaskPriority } from "@/types/task";
import { StageDialog } from "@/components/StageDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, LayoutGrid, List, Lock, Calendar, Info, FileText, DollarSign, Sparkles, ChevronDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { POSelectDialog } from "@/components/POSelectDialog";
import { POViewDialog } from "@/components/POViewDialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
	Select, 
	SelectContent, 
	SelectItem, 
	SelectTrigger, 
	SelectValue 
} from "@/components/ui/select";
import { InvoiceUploadDialog } from "@/components/InvoiceUploadDialog";
import { ImportTasksDialog } from "@/components/ImportTasksDialog";
import { ImportTasksReviewDialog, ImportedTask } from "@/components/ImportTasksReviewDialog";
import { ProjectReportsTab } from "@/components/ProjectReportsTab";
import { ProjectFinanceTab } from "@/components/ProjectFinanceTab";
import { 
	Dialog, 
	DialogContent, 
	DialogHeader, 
	DialogTitle, 
	DialogDescription 
} from "@/components/ui/dialog";

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
	const { toast } = useToast(); // Move toast here
	const [tasks, setTasks] = useState<Task[]>([]);
	const [allTasks, setAllTasks] = useState<Task[]>([]);
	const [teamMembers, setTeamMembers] = useState<User[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
	const [isStageManagementOpen, setIsStageManagementOpen] = useState(false);
	const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
	const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
	const [isReviewTaskDialogOpen, setIsReviewTaskDialogOpen] = useState(false);
	const [isPOSelectOpen, setIsPOSelectOpen] = useState(false);
	const [isPOViewOpen, setIsPOViewOpen] = useState(false);
	const [isInvoiceUploadOpen, setIsInvoiceUploadOpen] = useState(false);
	const [isReportsOpen, setIsReportsOpen] = useState(false);
	const [isFinanceOpen, setIsFinanceOpen] = useState(false);
	const [isImportTasksOpen, setIsImportTasksOpen] = useState(false);
	const [isImportReviewOpen, setIsImportReviewOpen] = useState(false);
	const [importedTasks, setImportedTasks] = useState<ImportedTask[]>([]);
	const importPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const openImportReview = useCallback((tasks: ImportedTask[]) => {
		// Clear any running poll — Echo or poll, whichever fires first wins
		if (importPollRef.current) {
			clearInterval(importPollRef.current);
			importPollRef.current = null;
		}
		setImportedTasks(tasks);
		setIsImportReviewOpen(true);
	}, []);

	const startImportPolling = useCallback((importId: string) => {
		if (importPollRef.current) clearInterval(importPollRef.current);

		importPollRef.current = setInterval(async () => {
			try {
				const res = await api.get(`/projects/${numericProjectId}/task-import/${importId}`);
				if (res.data?.status === 'ready' && Array.isArray(res.data.tasks)) {
					if (res.data.tasks.length > 0) {
						openImportReview(res.data.tasks);
					} else {
						clearInterval(importPollRef.current!);
						importPollRef.current = null;
						toast({ title: 'Import complete', description: 'No tasks were extracted from the document.', variant: 'destructive' });
					}
				}
			} catch {
				// silent — keep polling
			}
		}, 4000);

		// Stop polling after 10 minutes regardless
		setTimeout(() => {
			if (importPollRef.current) {
				clearInterval(importPollRef.current);
				importPollRef.current = null;
			}
		}, 10 * 60 * 1000);
	}, [numericProjectId, openImportReview, toast]);

	const navigate = useNavigate();
	const { open } = useSidebar();
	const { currentUser, activeRole } = useUser();
	const { history, addHistoryEntry } = useHistory(numericProjectId ? String(numericProjectId) : undefined);

	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
	const [reviewTask, setReviewTask] = useState<Task | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [editingStage, setEditingStage] = useState<Stage | null>(null);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [preselectedStageId, setPreselectedStageId] = useState<string | undefined>(undefined);
	const [view, setView] = useState<"kanban" | "list">("kanban");

	// Subtask Dialog State
	const [isAddSubtaskDialogOpen, setIsAddSubtaskDialogOpen] = useState(false);
	const [parentTaskForSubtask, setParentTaskForSubtask] = useState<Task | null>(null);

	const handleAddSubtask = (parentTask: Task) => {
		setParentTaskForSubtask(parentTask);
		setIsAddSubtaskDialogOpen(true);
	};

	const loadData = useCallback(async (isBackground = false) => {
		if (!numericProjectId) return;
		if (!isBackground) setIsLoading(true);
		try {
			// Optimization: Fetch independent initial data in parallel
			const [currentProject, departmentsData] = await Promise.all([
				projectService.getById(String(numericProjectId)),
				departmentService.getAll()
			]);

			if (!currentProject) { setProject(null); if (!isBackground) setIsLoading(false); return; }

			if (activeRole === 'team-lead' || activeRole === 'user' || activeRole === 'account-manager') {
				const hasMatchingDepartment = String(currentProject.department?.id) === String(currentUser.department);
				const currentDept = departmentsData.find(d => String(d.id) === String(currentUser.department));
				const isDigitalDept = currentDept?.name.toLowerCase() === 'digital';
				const isDesignProject = currentProject.department?.name.toLowerCase() === 'design';
				const hasSpecialPermission = isDigitalDept && isDesignProject;
				const isCollaborator = currentProject.collaborators?.some(c => String(c.id) === String(currentUser.id));
				
				// Staff and AM should be able to see their own projects and their department projects
				if (!hasMatchingDepartment && !hasSpecialPermission && !isCollaborator) { 
					setProject(null); 
					if (!isBackground) setIsLoading(false); 
					return; 
				}
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
					if (activeRole === 'user') {
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
					if (activeRole !== 'user' || foundTask.assignee !== currentUser.name) {
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
	}, [numericProjectId, currentUser, searchParams, setSearchParams, navigate, toast]);

	useEffect(() => {
		loadData();

		// Real-time Updates
		if (numericProjectId && echo) {
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

			channel.listen('TaskImportReady', (e: any) => {
				console.log('[TaskImportReady] raw event:', JSON.stringify(e, null, 2));
				if (Array.isArray(e.tasks) && e.tasks.length > 0) {
					openImportReview(e.tasks);
				} else {
					if (importPollRef.current) { clearInterval(importPollRef.current); importPollRef.current = null; }
					toast({ title: 'Import complete', description: 'No tasks were extracted from the document.', variant: 'destructive' });
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
	}, [numericProjectId, currentUser, loadData]);

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

	const isDigitalMarketing = project.department?.name === "Digital Marketing";
	const isCampaignReportApproved = !isDigitalMarketing || project.campaign_report_status === "approved";

	const handleStatusChange = async (newStatus: string) => {
		if (newStatus === "completed" && (activeRole === "hr" || activeRole === "admin")) {
			if (!isCampaignReportApproved) {
				toast({
					title: "Report Required",
					description: "A campaign report must be uploaded and approved before completing a Digital Marketing project.",
					variant: "destructive",
				});
				return;
			}
			setIsInvoiceUploadOpen(true);
			return;
		}

		setIsUpdatingStatus(true);
		try {
			const updatedProject = await projectService.update(String(project.id), {
				status: newStatus,
			});
			
			setProject(updatedProject);
			
			// Log project status change history
			addHistoryEntry({
				action: 'UPDATE_PROJECT',
				entityId: String(project.id),
				entityType: 'project',
				projectId: String(project.id),
				userId: currentUser?.id || '',
				details: {
					from: project.status,
					to: newStatus
				}
			});

			toast({
				title: "Status Updated",
				description: `Project status changed to ${newStatus}.`,
			});
		} catch (error) {
			console.error("Failed to update status:", error);
			toast({
				title: "Error",
				description: "Failed to update project status. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	// Determine if task creation is allowed (mirrors backend allowsTaskCreation())
	const hasPO = !!project.poDocumentUrl || !!project.poNumber;
	const hasActiveGracePeriod = !!project.gracePeriodExpiresAt && new Date(project.gracePeriodExpiresAt) >= new Date();
	const hasActiveProvisionalPO = !!project.provisionalPoNumber && !!project.provisionalPoExpiresAt && new Date(project.provisionalPoExpiresAt) >= new Date();
	const isProjectActive = !project.isArchived && project.status !== 'completed';
	const isProjectBlocked = project.status === 'blocked' || project.status === 'on-hold';
	const isPORequired = isProjectActive && !project.isInternalProject && project.isLockedByPo && !hasPO && !hasActiveGracePeriod && !hasActiveProvisionalPO;
	const canCreateTasks = isProjectActive && (project.isInternalProject || !project.isLockedByPo || hasPO || hasActiveGracePeriod || hasActiveProvisionalPO);

	const handleAddTaskToStage = (stageId: string) => {
		if (!canCreateTasks) {
			if (project.isArchived) {
				toast({ title: 'Project Archived', description: 'Cannot add tasks to an archived project.', variant: 'destructive' });
			} else if (project.status === 'completed') {
				toast({ title: 'Project Completed', description: 'Cannot add tasks to a completed project.', variant: 'destructive' });
			} else {
				toast({ title: 'PO Required', description: 'This project requires a Purchase Order (PO) before tasks can be created. Please upload a PO or request a grace period.', variant: 'destructive' });
			}
			return;
		}
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
				if (!('assignee' in updates) && !taskToUpdate.isAssigneeLocked) {
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

			const savedTask = await taskService.update(taskId, {
				...cleanUpdates,
				assigneeId: assigneeId ? parseInt(String(assigneeId), 10) : undefined,
				projectStageId,
				startStageId,
			});
			console.log('[KANBAN] Applied update', { taskId, assigneeId, projectStageId });
			// Helper to update a task recursively in a list (handling subtasks)
			const updateTaskInList = (list: Task[]): Task[] => {
				return list.map(t => {
					if (t.id === taskId) return savedTask;
					if (t.subtasks && t.subtasks.length > 0) {
						return { ...t, subtasks: updateTaskInList(t.subtasks) };
					}
					return t;
				});
			};

			setTasks(prev => updateTaskInList(prev));
			setAllTasks(prev => updateTaskInList(prev));
		} catch (e) { console.error(e); toast({ title: 'Error', description: 'Failed to update task.', variant: 'destructive' }); }
	};

	const handleSaveTask = async (task: Omit<Task, 'id' | 'createdAt'> & { assigneeId?: string; assigneeIds?: string[] }, pendingFiles?: File[], pendingLinks?: { name: string; url: string }[]) => {
		if (!currentUser || !project) return;
		if (!editingTask && !canCreateTasks) {
			toast({ title: 'PO Required', description: 'This project requires a Purchase Order (PO) before tasks can be created.', variant: 'destructive' });
			return;
		}
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
				const updatedTask = await taskService.update(editingTask.id, taskPayload);
				// Helper to update a task recursively in a list (handling subtasks)
				const updateTaskInList = (list: Task[]): Task[] => {
					return list.map(t => {
						if (t.id === editingTask.id) return updatedTask;
						if (t.subtasks && t.subtasks.length > 0) {
							return { ...t, subtasks: updateTaskInList(t.subtasks) };
						}
						return t;
					});
				};

				setTasks(prev => updateTaskInList(prev));
				setAllTasks(prev => updateTaskInList(prev));
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

	const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const handleTaskEdit = (task: Task) => { setEditingTask(task); setIsTaskDialogOpen(true); };

	const handleTaskDelete = (taskId: string) => {
		const task = tasks.find(t => t.id === taskId);
		if (task) {
			setTaskToDelete(task);
			setIsDeleteDialogOpen(true);
		}
	};

	const confirmDeleteTask = async () => {
		if (!taskToDelete || !project || !currentUser) return;
		try {
			addHistoryEntry({ action: 'DELETE_TASK', entityId: taskToDelete.id, entityType: 'task', projectId: String(project.id), userId: currentUser.id, details: { title: taskToDelete.title } });
			await taskService.delete(taskToDelete.id);
			setTasks(tasks.filter(t => t.id !== taskToDelete.id));
			toast({ title: 'Task deleted', description: 'Task deleted successfully.' });
		} catch (e) {
			console.error(e);
			toast({ title: 'Error', description: 'Failed to delete task.', variant: 'destructive' });
		} finally {
			setIsDeleteDialogOpen(false);
			setTaskToDelete(null);
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
		if (!canCreateTasks) {
			toast({ title: 'PO Required', description: 'This project requires a Purchase Order (PO) before tasks can be created.', variant: 'destructive' });
			return;
		}
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
								{project.status === 'on-hold' && (
									<Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider bg-orange-500 hover:bg-orange-600 border-none px-2 h-5">
										Blocked
									</Badge>
								)}
								{project.isInternalProject ? (
									<Badge
										variant="outline"
										className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border-blue-200 px-2 h-5 flex items-center gap-1"
									>
										<Info className="h-3 w-3" /> Internal Project
									</Badge>
								) : project.isLockedByPo ? (
									<div className="flex items-center gap-2">
										<Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider bg-red-500 hover:bg-red-600 border-none px-2 h-5 flex items-center gap-1">
											<Lock className="h-3 w-3" /> Awaiting PO
										</Badge>
										{(activeRole === 'admin' || activeRole === 'hr') && (
											<Button 
												variant="outline" 
												size="sm" 
												className="h-5 text-[10px] px-2 py-0 border-red-500 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
												onClick={() => setIsPOSelectOpen(true)}
											>
												Select PO
											</Button>
										)}
									</div>
								) : project.poDocumentUrl ? (
									<div className="flex items-center gap-2">
										<Button 
											variant="outline" 
											size="sm" 
											className="h-5 text-[10px] px-2 py-0 border-green-600 text-green-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
											onClick={() => setIsPOViewOpen(true)}
										>
											View PO
										</Button>
									</div>
								) : null}
								{project.isArchived && (
									<Badge variant="secondary" className="text-xs font-normal">
										Archived
									</Badge>
								)}
								{(activeRole === 'admin' || activeRole === 'team-lead' || activeRole === 'hr') && (
									<div className="flex items-center gap-1.5 ml-3">
										<Select
											disabled={isUpdatingStatus}
											value={project.status || "active"}
											onValueChange={handleStatusChange}
										>
											<SelectTrigger className="h-7 w-[120px] text-[10px] uppercase font-bold tracking-tight bg-muted/30 border-muted-foreground/20">
												<SelectValue placeholder="Status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="active" className="text-[10px] uppercase font-bold">Active</SelectItem>
												<SelectItem value="on-hold" className="text-[10px] uppercase font-bold">On Hold</SelectItem>
												<SelectItem value="blocked" className="text-[10px] uppercase font-bold">Blocked</SelectItem>
												{(activeRole === 'admin' || activeRole === 'hr') && (
													<SelectItem value="completed" className="text-[10px] uppercase font-bold">Completed</SelectItem>
												)}
											</SelectContent>
										</Select>
									</div>
								)}
							</h1>
							<div className="flex items-center gap-4 mt-1 text-muted-foreground">
								<div
									className="prose prose-sm dark:prose-invert max-w-none line-clamp-1"
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
								{project.deadline && (
									<div className="flex items-center gap-1.5 text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">
										<Calendar className="h-3 w-3" />
										Deadline: {new Date(project.deadline).toLocaleDateString()}
									</div>
								)}
							</div>
						</div>
						<div className="flex items-center gap-3">
							{(activeRole === 'admin' || activeRole === 'team-lead' || activeRole === 'account-manager' || activeRole === 'user') && (
								<>
									<Button variant="outline" onClick={() => navigate(`/project/${project.id}/overview`)}>
										Project Overview
									</Button>
									<Button variant="outline" onClick={() => setIsReportsOpen(true)} className="bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
										<FileText className="mr-2 h-4 w-4" /> Reports
									</Button>
									<Button variant="outline" onClick={() => setIsFinanceOpen(true)} className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:text-green-700">
										<DollarSign className="mr-2 h-4 w-4" /> Add Expense
									</Button>
									{(activeRole === 'admin' || activeRole === 'team-lead' || activeRole === 'account-manager') && (
										<Button variant="outline" onClick={() => setIsHistoryDialogOpen(true)}>
											View History
										</Button>
									)}
									{!project.isArchived && project.status !== 'on-hold' && (
										<>
											{(activeRole === 'admin' || activeRole === 'team-lead') && (
												<Button variant="outline" onClick={() => setIsStageManagementOpen(true)}>
													Manage Stages
												</Button>
											)}
											{canCreateTasks ? (
												(activeRole === 'admin' || activeRole === 'team-lead') ? (
													<div className="flex items-center">
														<Button
															className="rounded-r-none border-r-0"
															onClick={() => { setEditingTask(null); setIsTaskDialogOpen(true); }}
														>
															<Plus className="mr-2 h-4 w-4" /> Add Task
														</Button>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button className="rounded-l-none px-2 border-l border-primary-foreground/20">
																	<ChevronDown className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem onClick={() => setIsImportTasksOpen(true)}>
																	<Sparkles className="mr-2 h-4 w-4 text-purple-500" />
																	Import Tasks from File
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												) : (
													<Button onClick={() => { setEditingTask(null); setIsTaskDialogOpen(true); }}>
														<Plus className="mr-2 h-4 w-4" /> Add Task
													</Button>
												)
											) : (
												<Button variant="destructive" disabled className="opacity-80">
													<Lock className="mr-2 h-4 w-4" />
													{project.isArchived ? "Archived" : (project.status === 'completed' ? "Completed" : "PO Required")}
												</Button>
											)}
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
			<main className="flex-1 overflow-hidden relative">
				{isProjectBlocked && (
					<div className="absolute inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-[1px] pointer-events-none">
						<div className="bg-destructive/10 text-destructive border border-destructive/20 px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300 pointer-events-auto">
							<Lock className="h-8 w-8" />
							<div className="text-center">
								<p className="text-lg font-bold uppercase tracking-wider">Project Blocked</p>
								<p className="text-xs opacity-80">This project is currently on hold or blocked.</p>
							</div>
						</div>
					</div>
				)}
				{isPORequired && !isProjectBlocked && (
					<div className="absolute inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-[1px] pointer-events-none">
						<div className="bg-orange-500/10 text-orange-600 border border-orange-500/20 px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300 pointer-events-auto">
							<FileText className="h-8 w-8" />
							<div className="text-center">
								<p className="text-lg font-bold uppercase tracking-wider">PO Required</p>
								<p className="text-xs opacity-80 mb-3">This project requires a Purchase Order to continue.</p>
								{(activeRole === 'admin' || activeRole === 'hr') && (
									<Button 
										variant="outline" 
										size="sm" 
										className="border-orange-500 text-orange-600 hover:bg-orange-50"
										onClick={() => setIsPOSelectOpen(true)}
									>
										Select PO
									</Button>
								)}
							</div>
						</div>
					</div>
				)}
				<div className={cn(
					"h-full overflow-auto p-6 pb-10 bg-muted/5 transition-all duration-500",
					(isProjectBlocked || isPORequired) && "grayscale opacity-50 pointer-events-none select-none"
				)}>
					<div className="w-full">
						{view === 'kanban' ? (
							<KanbanBoard
								tasks={topLevelTasks}
								stages={sortedStages}
								onTaskUpdate={(!project.isArchived && !isProjectBlocked && !isPORequired) ? handleTaskUpdate : undefined}
								onTaskEdit={(!project.isArchived && !isProjectBlocked && !isPORequired) ? handleTaskEdit : undefined}
								onTaskDelete={(!project.isArchived && !isProjectBlocked && !isPORequired) ? handleTaskDelete : undefined}
								useProjectStages
								canManageTasks={activeRole !== 'user' && !project.isArchived && !isProjectBlocked}
								canDragTasks={activeRole !== 'user' && activeRole !== 'account-manager' && !project.isArchived && !isProjectBlocked}
								disableColumnScroll={true}
								disableBacklogRenaming={true}
								onTaskReview={(!project.isArchived && !isProjectBlocked && !isPORequired) ? (task) => { setReviewTask(task); setIsReviewTaskDialogOpen(true); } : undefined}
								onAddTaskToStage={(!project.isArchived && !isProjectBlocked && canCreateTasks) ? handleAddTaskToStage : undefined}
								projectId={String(project.id)}
								onAddSubtask={(!project.isArchived && !isProjectBlocked && canCreateTasks) ? handleAddSubtask : undefined}
								teamMembers={teamMembers}
								departments={departments}
								allTasks={allTasks}
								onRefresh={loadData}
							/>
						) : (
							<TaskListView
								tasks={topLevelTasks}
								stages={sortedStages}
								onTaskEdit={(!project.isArchived && !isProjectBlocked) ? handleTaskEdit : undefined}
								onTaskDelete={(!project.isArchived && !isProjectBlocked) ? handleTaskDelete : undefined}
								onTaskUpdate={(!project.isArchived && !isProjectBlocked) ? handleTaskUpdate : undefined}
								teamMembers={teamMembers}
								canManage={activeRole !== 'user' && !project.isArchived && !isProjectBlocked}
								onTaskReview={(!project.isArchived && !isProjectBlocked) ? (task) => { setReviewTask(task); setIsReviewTaskDialogOpen(true); } : undefined}
								showReviewButton={(activeRole === 'admin' || activeRole === 'team-lead') && !project.isArchived && !isProjectBlocked}
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

			{/* Reports Dialog */}
			<Dialog open={isReportsOpen} onOpenChange={setIsReportsOpen}>
				<DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0">
					<DialogHeader className="p-6 pb-0">
						<DialogTitle>Project Reports - {project.name}</DialogTitle>
						<DialogDescription>Submit and track reports for this project.</DialogDescription>
					</DialogHeader>
					<div className="flex-1 overflow-auto p-6 pt-2">
						<ProjectReportsTab project={project} />
					</div>
				</DialogContent>
			</Dialog>
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

			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the task "{taskToDelete?.title}" and remove it from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<POSelectDialog
				open={isPOSelectOpen}
				onOpenChange={setIsPOSelectOpen}
				project={project}
				onSuccess={(updatedProject) => setProject(updatedProject)}
			/>

			<POViewDialog
				open={isPOViewOpen}
				onOpenChange={setIsPOViewOpen}
				url={project.poDocumentUrl || ""}
				poNumber={project.poNumber}
			/>

			{/* Finance Dialog */}
			<Dialog open={isFinanceOpen} onOpenChange={setIsFinanceOpen}>
				<DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0">
					<DialogHeader className="p-6 pb-0">
						<DialogTitle>Project Finance - {project.name}</DialogTitle>
						<DialogDescription>Manage budget and expenses for this project.</DialogDescription>
					</DialogHeader>
					<div className="flex-1 overflow-auto p-6 pt-2">
						<ProjectFinanceTab
							project={project}
							onBudgetUpdate={(budgetAllocated) =>
								setProject(prev => ({ ...prev, budget_allocated: budgetAllocated ?? undefined }))
							}
						/>
					</div>
				</DialogContent>
			</Dialog>

			{/* Task Import — upload dialog */}
			{numericProjectId && (
				<ImportTasksDialog
					open={isImportTasksOpen}
					onOpenChange={setIsImportTasksOpen}
					projectId={numericProjectId}
					projectName={project.name}
					onSubmitted={startImportPolling}
				/>
			)}

			{/* Task Import — review + bulk-assign popup (auto-opens via Echo) */}
			{numericProjectId && (
				<ImportTasksReviewDialog
					open={isImportReviewOpen}
					onOpenChange={setIsImportReviewOpen}
					tasks={importedTasks}
					projectId={numericProjectId}
					stages={sortedStages}
					teamMembers={teamMembers}
					departments={departments}
					onTasksCreated={() => loadData(true)}
				/>
			)}
		</div>
	);
}
