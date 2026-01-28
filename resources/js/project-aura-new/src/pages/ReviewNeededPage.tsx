import { useState, useEffect, useMemo } from "react";
import { Task, User } from "@/types/task";
import { Project } from "@/types/project";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { userService } from "@/services/userService";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { useUser } from "@/hooks/use-user";
import { Loading } from "@/components/Loading";
import { useToast } from "@/hooks/use-toast";
import { FileCog } from "lucide-react";
import { ReviewTaskDialog } from "@/components/ReviewTaskDialog";
import { useHistory } from "@/hooks/use-history";

export default function ReviewNeededPage() {
    const { currentUser } = useUser();
    const { toast } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [viewTask, setViewTask] = useState<Task | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [reviewTask, setReviewTask] = useState<Task | null>(null);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { addHistoryEntry } = useHistory();
    const [teamMembers, setTeamMembers] = useState<User[]>([]);

    const fetchData = async () => {
        try {
            const [tasksData, projectsData, usersData] = await Promise.all([
                taskService.getAll(),
                projectService.getAll(),
                userService.getAll()
            ]);
            setTasks(tasksData);
            setProjects(projectsData);
            setTeamMembers(usersData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const reviewNeededTasks = useMemo(() => {
        if (!currentUser) return [];

        return tasks.filter(task => {
            // 1. Must be assigned to the current user
            const isAssigned =
                task.assignee === currentUser.name ||
                (task.assignedUsers && task.assignedUsers.some(u => String(u.id) === String(currentUser.id)));

            if (!isAssigned) return false;

            // 2. Must be in a "Review" stage
            // We need to find the project and the stage
            const project = projects.find(p => p.name === task.project);
            if (!project) return false;

            const stage = project.stages.find(s => s.id === task.projectStage);
            if (!stage) return false;

            // Check if it's a review stage (by property or title conventions)
            const isReview = stage.isReviewStage || stage.title.toLowerCase().includes("review");

            return isReview && task.userStatus !== 'complete';
        });
    }, [tasks, projects, currentUser]);

    const handleApproveTask = async (taskId: string, targetStageId: string, comment?: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // Find project to track history correctly
        const project = projects.find(p => p.name === task.project);
        const projectId = project ? String(project.id) : undefined;
        const targetStage = project?.stages.find(s => s.id === targetStageId);

        try {
            // Logic similar to ProjectKanban.handleTaskUpdate + history
            const updates: any = {
                projectStage: targetStageId,
                projectStageId: parseInt(targetStageId), // FIX: Add projectStageId for backend mapping
                isInSpecificStage: false,
                previousStage: undefined,
                originalAssignee: undefined,
                revisionComment: undefined
            };

            // If moving to a "Completed" stage (title check or property check), add tag
            // Note: ProjectKanban checks for last stage. Let's do similar or simple title check.
            // Simplified logic:
            if (targetStage?.title.toLowerCase().includes('complete')) {
                updates.userStatus = 'complete';
            } else {
                updates.userStatus = 'pending';
            }

            // Call API
            await taskService.update(taskId, updates);

            // Optimistic update
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));

            // History
            if (currentUser && projectId) {
                addHistoryEntry({
                    action: 'UPDATE_TASK_STATUS',
                    entityId: taskId,
                    entityType: 'task',
                    projectId: projectId,
                    userId: currentUser.id,
                    details: {
                        action: 'approved',
                        comment,
                        targetStage: targetStage?.title || targetStageId
                    }
                });
            }

            toast({ title: 'Task approved', description: `Task moved to ${targetStage?.title || 'selected stage'}.` });

        } catch (error) {
            console.error("Failed to approve task:", error);
            toast({ title: "Error", description: "Failed to approve task.", variant: "destructive" });
        }
    };

    const handleRequestRevision = async (taskId: string, targetStageId: string, comment: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const project = projects.find(p => p.name === task.project);
        const projectId = project ? String(project.id) : undefined;
        const targetStage = project?.stages.find(s => s.id === targetStageId);

        const originalAssigneeName = task.originalAssignee || task.assignee;
        if (!originalAssigneeName) {
            toast({ title: 'Error', description: 'Could not find the task assignee.', variant: 'destructive' });
            return;
        }

        const newRevision = {
            id: Date.now().toString(),
            comment,
            requestedBy: currentUser?.name || 'Unknown',
            requestedAt: new Date().toISOString()
        };

        const updatedRevisionHistory = [...(task.revisionHistory || []), newRevision];
        const updatedTags = task.tags ? [...task.tags] : [];
        if (!updatedTags.includes('Redo')) updatedTags.push('Redo');

        // Logic matched from ProjectKanban to restore assignee
        const originalAssigneeUser = teamMembers.find(u => u.name === originalAssigneeName);

        const updates: any = {
            projectStage: targetStageId,
            projectStageId: parseInt(targetStageId), // FIX: Add projectStageId for backend mapping
            userStatus: 'pending',
            isInSpecificStage: false,
            revisionComment: comment,
            revisionHistory: updatedRevisionHistory,
            tags: updatedTags,
            previousStage: undefined,
            originalAssignee: undefined
        };

        if (originalAssigneeUser) {
            updates.assignee = originalAssigneeName;
            updates.assigneeId = parseInt(originalAssigneeUser.id);
        }

        try {
            await taskService.update(taskId, updates);

            // Optimistic update (remove assigneeId for local state if needed, or just spread)
            const localUpdates = { ...updates };
            delete localUpdates.assigneeId;

            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...localUpdates } : t));

            if (currentUser && projectId) {
                // Note: 'UPDATE_TASK_STATUS' seems appropriate or generic 'UPDATE_TASK'
                // ProjectKanban calls handleTaskUpdate which logs log based on changes.
                // We'll just log "Revision requested".
                addHistoryEntry({ // Using generic addHistoryEntry from generic useHistory hook
                    action: 'UPDATE_TASK_STATUS', // Using STATUS for consistency with Approval? Or just custom.
                    entityId: taskId,
                    entityType: 'task',
                    projectId: projectId,
                    userId: currentUser.id,
                    details: {
                        action: 'revision_requested',
                        comment,
                        targetStage: targetStage?.title || targetStageId,
                        assignedTo: originalAssigneeName
                    }
                });
            }

            toast({ title: 'Revision requested', description: `Task returned for revision.` });

        } catch (error) {
            console.error("Failed to request revision:", error);
            toast({ title: "Error", description: "Failed to request revision.", variant: "destructive" });
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6 fade-in p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                    <FileCog className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Review Needed</h1>
                    <p className="text-muted-foreground">Tasks assigned to you that require review and approval.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {reviewNeededTasks.length > 0 ? (
                    reviewNeededTasks.map(task => {
                        // Find stage object for card
                        const project = projects.find(p => p.name === task.project);
                        const stage = project?.stages.find(s => s.id === task.projectStage);

                        return (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onDragStart={() => { }}
                                onEdit={() => { }}
                                onDelete={() => { }}
                                onView={() => {
                                    setViewTask(task);
                                    setIsViewDialogOpen(true);
                                }}
                                // Enable review capability here
                                // We pass onReviewTask to show the review button (icon)
                                // onReviewTask={() => openReviewDialog(task)}
                                onReviewTask={() => {
                                    setReviewTask(task);
                                    setIsReviewDialogOpen(true);
                                }}
                                canManage={false} // Account managers typically can't edit/delete here unless specified, user said "dont allow to delete or edit task on project section". Assuming safe to disable here too, only Review allowed.
                                currentStage={stage}
                                canDrag={false}
                            />
                        );
                    })
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                        <FileCog className="h-10 w-10 mb-3 opacity-20" />
                        <p>No tasks waiting for review.</p>
                    </div>
                )}
            </div>

            <TaskDetailsDialog
                task={viewTask}
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
            />

            <ReviewTaskDialog
                open={isReviewDialogOpen}
                onOpenChange={setIsReviewDialogOpen}
                task={reviewTask}
                stages={(() => {
                    if (!reviewTask) return [];
                    const proj = projects.find(p => p.name === reviewTask.project);
                    return proj?.stages || [];
                })()}
                onApprove={handleApproveTask}
                onRequestRevision={handleRequestRevision}
            />
        </div>
    );
}
