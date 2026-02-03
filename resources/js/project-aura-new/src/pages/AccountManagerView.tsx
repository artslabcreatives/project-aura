import { DashboardStats } from "@/components/DashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { TaskDialog } from "@/components/TaskDialog";
import { Button } from "@/components/ui/button";
import { isPast, isToday, isTomorrow, isSameMonth } from "date-fns";
import { useEffect, useState, useMemo } from "react";
import { Task, User } from "@/types/task";
import { Project } from "@/types/project";
import { useUser } from "@/hooks/use-user";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { userService } from "@/services/userService";
import { departmentService } from "@/services/departmentService";
import { attachmentService } from "@/services/attachmentService";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountManagerView() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [viewTask, setViewTask] = useState<Task | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const { currentUser } = useUser();
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Get department name
    const [departments, setDepartments] = useState<any[]>([]); // Typed loosely or import Department

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const departmentsData = await departmentService.getAll();
                setDepartments(departmentsData);
            } catch {
                setDepartments([]);
            }
        };
        loadDepartments();
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [tasksData, projectsData, teamMembersData] = await Promise.all([
                    taskService.getAll(),
                    projectService.getAll(),
                    userService.getAll(),
                ]);
                setTasks(tasksData);
                setProjects(projectsData);
                setTeamMembers(teamMembersData);
            } catch (error) {
                setTasks([]);
                setProjects([]);
                setTeamMembers([]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleCreateTask = async (taskData: any, pendingFiles?: File[], pendingLinks?: { name: string; url: string }[]) => {
        try {
            // Create task
            const newTask = await taskService.create(taskData);

            // Upload files
            if (pendingFiles && pendingFiles.length > 0) {
                for (const file of pendingFiles) {
                    await attachmentService.uploadFile(newTask.id, file);
                }
            }

            // Add links
            if (pendingLinks && pendingLinks.length > 0) {
                for (const link of pendingLinks) {
                    await attachmentService.addLink(newTask.id, link.name, link.url);
                }
            }

            // Refresh saved task to get attachments
            const refreshedTask = await taskService.getById(newTask.id);

            setTasks(prev => [refreshedTask || newTask, ...prev]);
            setIsCreateDialogOpen(false);
            toast({
                title: "Success",
                description: "Task created successfully",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to create task",
                variant: "destructive",
            });
        }
    };

    // Filter tasks by assignment (Account Manager)
    const departmentTasks = useMemo(() => {
        if (!currentUser) return [];

        return tasks.filter(task => {
            // Check if assigned to current user
            const isAssigned =
                task.assignee === currentUser.name ||
                (task.assignedUsers && task.assignedUsers.some(u => String(u.id) === String(currentUser.id)));

            if (!isAssigned) return false;

            // Filter out suggested tasks
            const forbiddenStageTitles = ['suggested', 'suggested task'];
            // Check project stage (need to find project)
            const taskProject = projects.find(p => p.name === task.project);
            const stage = taskProject?.stages.find(s => s.id === task.projectStage);

            if (stage && forbiddenStageTitles.includes(stage.title.toLowerCase().trim())) {
                return false;
            }
            return true;
        });
    }, [tasks, projects, currentUser]);

    const today = new Date();

    // Helper to check if task is completed
    const isTaskCompleted = (task: Task) => {
        if (task.userStatus === "complete") return true;

        let stage: any = undefined;

        if (task.projectId && projects.length > 0) {
            const project = projects.find(p => String(p.id) === String(task.projectId));
            if (project && task.projectStage) {
                stage = project.stages.find(s => String(s.id) === String(task.projectStage));
            }
        }

        if (!stage && task.projectStage && projects.length > 0) {
            // Robust search by stage ID
            const project = projects.find(p => p.stages.some(s => String(s.id) === String(task.projectStage)));
            stage = project?.stages.find(s => String(s.id) === String(task.projectStage));
        }

        if (stage) {
            const title = stage.title.toLowerCase().trim();
            return ['complete', 'completed', 'archive', 'done', 'finished', 'closed'].includes(title);
        }

        return false;
    };

    const dueTodayTasks = departmentTasks.filter(
        (task) => !task.parentId && !isTaskCompleted(task) && task.dueDate && isToday(new Date(task.dueDate))
    );

    const overdueTasks = departmentTasks.filter(
        (task) =>
            !task.parentId &&
            !isTaskCompleted(task) &&
            task.dueDate &&
            isPast(new Date(task.dueDate)) &&
            !isToday(new Date(task.dueDate))
    );

    const tomorrowTasks = departmentTasks.filter((task) => {
        return !task.parentId && !isTaskCompleted(task) && task.dueDate && isTomorrow(new Date(task.dueDate));
    });

    const thisMonthTasks = departmentTasks.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return (
            !task.parentId &&
            !isTaskCompleted(task) &&
            isSameMonth(dueDate, today) &&
            !isPast(dueDate)
        );
    });

    const getDepartmentName = () => {
        if (currentUser && departments.length > 0) {
            const dept = departments.find((d: any) => d.id === currentUser.department);
            return dept?.name || "Your Department";
        }
        return "Your Department";
    };

    if (loading) {
        return (
            <div className="space-y-8 fade-in">
                {/* Hero Header Skeleton */}
                <div className="relative overflow-hidden rounded-2xl p-8 bg-background border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-6 w-48" />
                        </div>
                    </div>
                </div>

                {/* Stats Skeleton */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-6 rounded-xl border bg-card">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-24 w-full rounded-lg" />
                                <Skeleton className="h-24 w-full rounded-lg" />
                                <Skeleton className="h-24 w-full rounded-lg" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in">
            {/* Hero Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-secondary via-secondary-light to-primary shadow-xl">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">Account Manager Dashboard</h1>
                            <p className="text-white/90 mt-1 text-lg">
                                {getDepartmentName()} department overview and progress
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <DashboardStats tasks={departmentTasks} projects={projects} />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover-lift border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
                    <CardHeader className="relative">
                        <CardTitle className="text-base flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                            <span className="font-semibold">Due Today</span>
                            <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                {dueTodayTasks.length}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 relative">
                        {dueTodayTasks.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">All clear for today!</p>
                            </div>
                        ) : (
                            dueTodayTasks.slice(0, 3).map((task, index) => (
                                <div key={task.id} className="slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <TaskCard
                                        task={task}
                                        onDragStart={() => { }}
                                        onEdit={() => { }}
                                        onDelete={() => { }}
                                        onView={() => {
                                            setViewTask(task);
                                            setIsViewDialogOpen(true);
                                        }}
                                        canManage={false}
                                    />
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="hover-lift border-2 border-info/20 bg-gradient-to-br from-card to-info/5 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-info/10 rounded-full blur-3xl group-hover:bg-info/20 transition-all duration-500"></div>
                    <CardHeader className="relative">
                        <CardTitle className="text-base flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-info animate-pulse shadow-lg shadow-info/50" />
                            <span className="font-semibold">Tomorrow</span>
                            <span className="ml-auto text-xs bg-info/10 text-info px-2 py-1 rounded-full font-medium">
                                {tomorrowTasks.length}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 relative">
                        {tomorrowTasks.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-info/10 mb-3">
                                    <svg className="w-8 h-8 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">No tasks for tomorrow</p>
                            </div>
                        ) : (
                            tomorrowTasks.slice(0, 3).map((task, index) => (
                                <div key={task.id} className="slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <TaskCard
                                        task={task}
                                        onDragStart={() => { }}
                                        onEdit={() => { }}
                                        onDelete={() => { }}
                                        onView={() => {
                                            setViewTask(task);
                                            setIsViewDialogOpen(true);
                                        }}
                                        canManage={false}
                                    />
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="hover-lift border-2 border-success/20 bg-gradient-to-br from-card to-success/5 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-3xl group-hover:bg-success/20 transition-all duration-500"></div>
                    <CardHeader className="relative">
                        <CardTitle className="text-base flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-success animate-pulse shadow-lg shadow-success/50" />
                            <span className="font-semibold">This Month</span>
                            <span className="ml-auto text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium">
                                {thisMonthTasks.length}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 relative">
                        {thisMonthTasks.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-3">
                                    <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">No tasks this month</p>
                            </div>
                        ) : (
                            thisMonthTasks.slice(0, 3).map((task, index) => (
                                <div key={task.id} className="slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <TaskCard
                                        task={task}
                                        onDragStart={() => { }}
                                        onEdit={() => { }}
                                        onDelete={() => { }}
                                        onView={() => {
                                            setViewTask(task);
                                            setIsViewDialogOpen(true);
                                        }}
                                        canManage={false}
                                    />
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="hover-lift border-2 border-destructive/20 bg-gradient-to-br from-card to-destructive/5 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl group-hover:bg-destructive/20 transition-all duration-500"></div>
                    <CardHeader className="relative">
                        <CardTitle className="text-base flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-status-overdue animate-pulse shadow-lg shadow-destructive/50" />
                            <span className="font-semibold">Overdue</span>
                            <span className="ml-auto text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full font-medium">
                                {overdueTasks.length}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 relative">
                        {overdueTasks.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-3">
                                    <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">No overdue tasks</p>
                            </div>
                        ) : (
                            overdueTasks.slice(0, 3).map((task, index) => (
                                <div key={task.id} className="slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <TaskCard
                                        task={task}
                                        onDragStart={() => { }}
                                        onEdit={() => { }}
                                        onDelete={() => { }}
                                        onView={() => {
                                            setViewTask(task);
                                            setIsViewDialogOpen(true);
                                        }}
                                        canManage={false}
                                    />
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            <TaskDetailsDialog
                task={viewTask}
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
            />

            <TaskDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSave={handleCreateTask}
                teamMembers={teamMembers}
                departments={departments}
                allProjects={projects}
                availableProjects={projects.map(p => p.name)}
                availableStatuses={[]} // We are creating, so standard
                useProjectStages={true}
                currentUser={currentUser}
            />
        </div>
    );
}
