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
import { ArrowLeft, Filter, Calendar as CalendarIcon } from "lucide-react";
import { isToday, isPast, isFuture, addDays, isThisWeek, isThisMonth, parseISO, isWithinInterval, startOfDay, endOfDay, format } from "date-fns";
import { Stage } from "@/types/stage";
import { useUser } from "@/hooks/use-user";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { Skeleton } from "@/components/ui/skeleton";

export default function FilteredTasksPage() {
    const { filterType } = useParams<{ filterType: string }>();
    const navigate = useNavigate();
    const { currentUser } = useUser();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    // Date filter state for completed tasks
    const [dateFilter, setDateFilter] = useState<string>("month");
    const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);

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
            if (task.parentId) return false; // Exclude subtasks

            const archivedProjectIds = new Set(
                projects.filter(p => p.isArchived).map(p => p.id)
            );
            if (task.projectId && archivedProjectIds.has(task.projectId)) return false;

            // Apply role-based filtering first
            if (currentUser) {
                if (currentUser.role === 'user' || currentUser.role === 'account-manager') {
                    // Regular users: show only their assigned tasks
                    const isAssigned =
                        task.assignee === currentUser.name ||
                        (task.assignedUsers && task.assignedUsers.some(u => String(u.id) === String(currentUser.id)));
                    if (!isAssigned) return false;
                } else if (currentUser.role === 'team-lead') {
                    // Team Lead: show only tasks in their department (matching TeamLeadView)
                    // 1. Get team members in current user's department
                    const departmentMembers = teamMembers
                        .filter(member => member.department === currentUser.department)
                        .map(member => member.name);

                    // 2. Check if assigned to department member
                    const isAssignedToDepartment = departmentMembers.includes(task.assignee) ||
                        (task.assignedUsers && task.assignedUsers.some(u => departmentMembers.includes(u.name))); // Check assignedUsers names if available, or fetch user details? 
                    // Simplified: assuming legacy task.assignee name check works for now as primary.

                    // 3. Check if project is in department
                    // We need project details. task.project is name.
                    const taskProject = projects.find(p => p.id === task.projectId || p.name === task.project);
                    const isProjectInDepartment = taskProject?.department?.id === currentUser.department;

                    if (!isAssignedToDepartment && !isProjectInDepartment) {
                        return false;
                    }
                }
                // Admin sees all tasks (no additional filter needed)
            }

            // Exclude 'suggested' tasks (matches AdminView/TeamLeadView logic)
            if (projects && task.projectStage) {
                const project = projects.find(p => String(p.id) === String(task.projectId));
                if (project) {
                    const stage = project.stages.find(s => String(s.id) === String(task.projectStage));
                    if (stage && ['suggested', 'suggested task'].includes(stage.title.toLowerCase().trim())) {
                        return false;
                    }
                }
            }

            // Helper to check if task is completed
            const isTaskCompleted = (t: Task) => {
                if (t.userStatus === "complete") return true;

                let stage: any = undefined;

                if (t.projectId && projects.length > 0) {
                    const project = projects.find(p => String(p.id) === String(t.projectId));
                    if (project && t.projectStage) {
                        stage = project.stages.find(s => String(s.id) === String(t.projectStage));
                    }
                }

                if (!stage && t.projectStage && projects.length > 0) {
                    const project = projects.find(p => p.stages.some(s => String(s.id) === String(t.projectStage)));
                    stage = project?.stages.find(s => String(s.id) === String(t.projectStage));
                }

                if (stage) {
                    const title = stage.title.toLowerCase().trim();
                    return ['complete', 'completed', 'archive', 'done', 'finished', 'closed'].includes(title);
                }
                return false;
            };

            // Now apply the specific category filter
            switch (filterType) {
                case 'due-today':
                    return !isTaskCompleted(task) && task.dueDate && isToday(new Date(task.dueDate));

                case 'overdue':
                    return !isTaskCompleted(task) &&
                        task.dueDate &&
                        isPast(new Date(task.dueDate)) &&
                        !isToday(new Date(task.dueDate));

                case 'upcoming':
                    if (!task.dueDate) return false;
                    const dueDate = new Date(task.dueDate);
                    const nextWeek = addDays(today, 7);
                    return (
                        !isTaskCompleted(task) &&
                        isFuture(dueDate) &&
                        dueDate <= nextWeek
                    );

                case 'completed':
                    if (!isTaskCompleted(task)) return false;

                    // Apply date filter for completed tasks
                    if (dateFilter !== "all") {
                        const dateStr = task.completedAt || task.createdAt;
                        if (!dateStr) return dateFilter === "all";

                        const taskDate = parseISO(dateStr);

                        if (dateFilter === "today") {
                            return isToday(taskDate);
                        } else if (dateFilter === "week") {
                            return isThisWeek(taskDate, { weekStartsOn: 1 });
                        } else if (dateFilter === "month") {
                            return isThisMonth(taskDate);
                        } else if (dateFilter === "custom" && customDateRange?.from) {
                            const start = startOfDay(customDateRange.from);
                            const end = customDateRange.to ? endOfDay(customDateRange.to) : endOfDay(customDateRange.from);
                            return isWithinInterval(taskDate, { start, end });
                        }
                    }

                    return true;

                default:
                    return true;
            }
        });
    }, [tasks, projects, filterType, currentUser, dateFilter, customDateRange]);

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

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="p-4 rounded-lg border bg-card space-y-3">
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
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
                        <p className="text-muted-foreground">{filteredTasks.length} tasks found</p>
                    </div>
                </div>

                {/* Date Filter - Only for Completed Tasks */}
                {filterType === 'completed' && (
                    <div className="flex items-center gap-2">
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>

                        {dateFilter === 'custom' && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <CalendarIcon className="h-4 w-4" />
                                        {customDateRange?.from ? (
                                            customDateRange.to ? (
                                                <>
                                                    {format(customDateRange.from, "MMM d")} - {format(customDateRange.to, "MMM d, yyyy")}
                                                </>
                                            ) : (
                                                format(customDateRange.from, "MMM d, yyyy")
                                            )
                                        ) : (
                                            "Select dates"
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={customDateRange?.from}
                                        selected={customDateRange}
                                        onSelect={setCustomDateRange}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTasks.map(task => {
                    // Determine the current stage for this task
                    let taskStage: Stage | undefined;
                    if (task.projectStage && projects) {
                        const project = projects.find(p => p.stages.some(s => s.id === task.projectStage));
                        const stage = project?.stages.find(s => s.id === task.projectStage);
                        if (stage) {
                            taskStage = stage;
                        }
                    }
                    // If task.userStatus is complete, use the system complete stage
                    if (task.userStatus === "complete" && !taskStage) {
                        taskStage = systemStages[2]; // Completed stage
                    }

                    return (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onDragStart={() => { }}
                            onEdit={() => { }}
                            onDelete={() => { }}
                            onView={() => handleViewTask(task)}
                            canManage={false}
                            canDrag={false}
                            currentStage={taskStage}
                        />
                    );
                })}
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
