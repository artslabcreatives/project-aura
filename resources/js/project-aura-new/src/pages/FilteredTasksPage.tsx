import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Task, User } from "@/types/task";
import { Project } from "@/types/project";
import { Department } from "@/types/department";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { userService } from "@/services/userService";
import { departmentService } from "@/services/departmentService";
import { TaskListView } from "@/components/TaskListView";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { isToday, isPast, isFuture, addDays } from "date-fns";
import { Stage } from "@/types/stage";
import { useUser } from "@/hooks/use-user";

export default function FilteredTasksPage() {
    const { filterType } = useParams<{ filterType: string }>();
    const navigate = useNavigate();
    const { currentUser } = useUser();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [tasksData, projectsData, usersData, departmentsData] = await Promise.all([
                    taskService.getAll(),
                    projectService.getAll(),
                    userService.getAll(),
                    departmentService.getAll()
                ]);

                setTasks(tasksData);
                setProjects(projectsData);
                setTeamMembers(usersData);
                setDepartments(departmentsData);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const filteredTasks = useMemo(() => {
        if (!filterType) return [];

        // Helper to flatten tasks (recursive + unique)
        const flattenTasks = (taskList: Task[]): Task[] => {
            const flattened: Task[] = [];
            const seenIds = new Set<string>();

            const recurse = (items: Task[]) => {
                for (const item of items) {
                    if (!seenIds.has(item.id)) {
                        seenIds.add(item.id);
                        flattened.push(item);
                        if (item.subtasks && item.subtasks.length > 0) {
                            recurse(item.subtasks);
                        }
                    }
                }
            };
            recurse(taskList);
            return flattened;
        };

        const allFlatTasks = flattenTasks(tasks);
        const today = new Date();

        return allFlatTasks.filter(task => {
            const archivedProjectIds = new Set(
                projects.filter(p => p.isArchived).map(p => p.id)
            );
            if (task.projectId && archivedProjectIds.has(task.projectId)) return false;

            // Apply role-based filtering first (same as Tasks.tsx/UserView.tsx basic logic)
            // For Admin and Team Lead: show ALL tasks (not filtered by assignment)
            // For regular users: show only their assigned tasks
            if (currentUser && currentUser.role === 'user') {
                // Must be assigned to user (for regular users only)
                const isAssigned =
                    task.assignee === currentUser.name ||
                    (task.assignedUsers && task.assignedUsers.some(u => String(u.id) === String(currentUser.id)));
                if (!isAssigned) return false;
            }
            // Admin and team-lead see all tasks without assignment filtering

            // Now apply the specific category filter
            switch (filterType) {
                case 'due-today':
                    return task.userStatus !== "complete" && task.dueDate && isToday(new Date(task.dueDate));

                case 'overdue':
                    let isCompleteStage = false;
                    if (projects && task.projectStage) {
                        const project = projects.find(p => p.stages.some(s => s.id === task.projectStage));
                        const stage = project?.stages.find(s => s.id === task.projectStage);
                        if (stage && (stage.title.toLowerCase() === 'complete' || stage.title.toLowerCase() === 'completed')) {
                            isCompleteStage = true;
                        }
                    }
                    return task.userStatus !== "complete" &&
                        !isCompleteStage &&
                        task.dueDate &&
                        isPast(new Date(task.dueDate)) &&
                        !isToday(new Date(task.dueDate));

                case 'upcoming':
                    if (!task.dueDate) return false;
                    const dueDate = new Date(task.dueDate);
                    const nextWeek = addDays(today, 7);
                    return (
                        task.userStatus !== "complete" &&
                        isFuture(dueDate) &&
                        dueDate <= nextWeek
                    );

                case 'completed':
                    return task.userStatus === "complete" && task.projectStage !== null;

                default:
                    return true;
            }
        });
    }, [tasks, projects, filterType, currentUser]);

    const getPageTitle = () => {
        switch (filterType) {
            case 'due-today': return 'Due Today';
            case 'overdue': return 'Overdue Tasks';
            case 'upcoming': return 'Upcoming Tasks (7 Days)';
            case 'completed': return 'Completed Tasks';
            default: return 'Tasks';
        }
    };

    // Use fixed stages for Kanban-like coloring/grouping if needed, or just list
    const systemStages: Stage[] = [
        { id: "pending", title: "Pending", color: "bg-status-todo", order: 0, type: "user" },
        { id: "in-progress", title: "In Progress", color: "bg-status-progress", order: 1, type: "user" },
        { id: "complete", title: "Completed", color: "bg-status-done", order: 2, type: "user" },
    ];

    const [viewTask, setViewTask] = useState<Task | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    const handleViewTask = (task: Task) => {
        setViewTask(task);
        setIsViewDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
                    <p className="text-muted-foreground">{filteredTasks.length} tasks found</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onDragStart={() => { }}
                        onEdit={() => { }}
                        onDelete={() => { }}
                        onView={() => handleViewTask(task)}
                        canManage={false}
                        canDrag={false}
                    />
                ))}
                {filteredTasks.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <p>No tasks found for this category.</p>
                    </div>
                )}
            </div>

            <TaskDetailsDialog
                task={viewTask}
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
            />
        </div >
    );
}
