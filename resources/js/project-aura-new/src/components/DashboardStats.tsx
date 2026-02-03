import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertCircle, TrendingUp, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Task } from "@/types/task";
import { isToday, isPast, isFuture, addDays, isThisMonth, parseISO } from "date-fns";

interface DashboardStatsProps {
  tasks: Task[];
  projects?: Project[];
}

import { Project } from "@/types/project";

export function DashboardStats({ tasks, projects }: DashboardStatsProps) {
  const today = new Date();

  // Helper to flatten tasks (recursive + unique) - matches FilteredTasksPage
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

  const allTasksRaw = flattenTasks(tasks);

  // Filter out tasks from archived projects (matches FilteredTasksPage) and exclude subtasks
  const allTasks = allTasksRaw.filter(task => {
    if (task.parentId) return false; // Exclude subtasks
    if (!projects) return true;
    const archivedProjectIds = new Set(
      projects.filter(p => p.isArchived).map(p => p.id)
    );
    if (task.projectId && archivedProjectIds.has(task.projectId)) return false;
    return true;
  });

  // Helper to check if a task is effectively completed
  const isTaskCompleted = (task: Task) => {
    // 1. Explicit status
    if (task.userStatus === "complete") return true;

    // 2. Project Stage Check
    if (projects && projects.length > 0 && task.projectStage) {
      let stage: any = undefined;

      if (task.projectId) {
        // Try finding specific project first
        const project = projects.find(p => String(p.id) === String(task.projectId));
        if (project) {
          stage = project.stages.find(s => String(s.id) === String(task.projectStage));
        }
      }

      if (!stage) {
        // Fallback: Robust search by stage ID (finds project containing the stage)
        const project = projects.find(p => p.stages.some(s => String(s.id) === String(task.projectStage)));
        stage = project?.stages.find(s => String(s.id) === String(task.projectStage));
      }

      if (stage) {
        const title = stage.title.toLowerCase().trim();
        return ['complete', 'completed', 'archive', 'done', 'finished', 'closed'].includes(title);
      }
    }
    return false;
  };

  const dueToday = allTasks.filter(
    (task) => !isTaskCompleted(task) && task.dueDate && isToday(new Date(task.dueDate))
  ).length;

  const overdue = allTasks.filter(
    (task) =>
      !isTaskCompleted(task) &&
      task.dueDate &&
      isPast(new Date(task.dueDate)) &&
      !isToday(new Date(task.dueDate))
  ).length;

  const upcoming = allTasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const nextWeek = addDays(today, 7);
    return (
      !isTaskCompleted(task) &&
      isFuture(dueDate) &&
      dueDate <= nextWeek
    );
  }).length;

  const completed = allTasks.filter((task) => {
    if (!isTaskCompleted(task)) return false;

    // Filter by this month
    // If completedAt is missing, fallback to createdAt (best effort)
    const dateStr = task.completedAt || task.createdAt;
    if (!dateStr) return false;

    const taskDate = parseISO(dateStr);
    return isThisMonth(taskDate);
  }).length;

  const navigate = useNavigate();

  const stats = [
    {
      title: "Due Today",
      value: dueToday,
      icon: Clock,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      path: "/tasks/filter/due-today"
    },
    {
      title: "Overdue",
      value: overdue,
      icon: AlertCircle,
      iconColor: "text-status-overdue",
      bgColor: "bg-status-overdue/10",
      path: "/tasks/filter/overdue"
    },
    {
      title: "Upcoming (7 days)",
      value: upcoming,
      icon: TrendingUp,
      iconColor: "text-status-progress",
      bgColor: "bg-status-progress/10",
      path: "/tasks/filter/upcoming"
    },
    {
      title: "Completed (This Month)",
      value: completed,
      icon: CheckCircle2,
      iconColor: "text-status-done",
      bgColor: "bg-status-done/10",
      path: "/tasks/filter/completed"
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="hover:shadow-md transition-shadow cursor-pointer hover:bg-accent/40"
          onClick={() => navigate(stat.path)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
