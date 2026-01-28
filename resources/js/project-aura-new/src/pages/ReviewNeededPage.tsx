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

export default function ReviewNeededPage() {
    const { currentUser } = useUser();
    const { toast } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [viewTask, setViewTask] = useState<Task | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [tasksData, projectsData] = await Promise.all([
                taskService.getAll(),
                projectService.getAll()
            ]);
            setTasks(tasksData);
            setProjects(projectsData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Subscribe to events if needed (omitted for brevity, consistent with other pages)
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

    const handleTaskReview = async (task: Task) => {
        // Find next stage (Complete usually, or derived logic)
        // For simple "Review" button action, we might just mark it complete OR move it to next stage.
        // The instruction says "same process like admin review task".
        // Admin review usually moves it to 'Complete' or approves it.
        // Let's assume approval moves it to 'Complete' stage of the project.

        try {
            // Logic to find 'Complete' stage or move forward.
            // If we look at TaskCard, onReviewTask expects a function.
            // We can re-use projectService.moveTask if we knew the next stage.
            // But simpler might be to update status to complete?
            // Usually review implies moving from "Review" -> "Complete".

            const project = projects.find(p => p.name === task.project);
            if (!project) return;

            // Find "Complete" stage
            const completeStage = project.stages.find(s =>
                s.title.toLowerCase() === 'complete' ||
                s.title.toLowerCase() === 'completed'
            );

            if (completeStage) {
                await taskService.move(task.id, completeStage.id);
                toast({ title: "Task Approved", description: "Task moved to Completed." });
                // Optimistic update
                setTasks(prev => prev.filter(t => t.id !== task.id));
            } else {
                // Fallback: just mark status complete?
                await taskService.update(task.id, { userStatus: 'complete' });
                toast({ title: "Task Completed", description: "Task marked as complete." });
                setTasks(prev => prev.filter(t => t.id !== task.id));
            }
        } catch (error) {
            console.error("Failed to review task:", error);
            toast({ title: "Error", description: "Failed to approve task.", variant: "destructive" });
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
                                onReviewTask={() => handleTaskReview(task)}
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
        </div>
    );
}
