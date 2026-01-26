import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertCircle, TrendingUp, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Task } from "@/types/task";
import { isToday, isPast, isFuture, addDays } from "date-fns";

interface DashboardStatsProps {
  tasks: Task[];
  projects?: Project[];
}

import { Project } from "@/types/project";

export function DashboardStats({ tasks, projects }: DashboardStatsProps) {
  const today = new Date();

  const dueToday = tasks.filter(
    (task) => task.userStatus !== "complete" && task.dueDate && isToday(new Date(task.dueDate))
  ).length;

  const overdue = tasks.filter(
    (task) => {
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
    }
  ).length;

  const upcoming = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const nextWeek = addDays(today, 7);
    return (
      task.userStatus !== "complete" &&
      isFuture(dueDate) &&
      dueDate <= nextWeek
    );
  }).length;

  const completed = tasks.filter((task) => task.userStatus === "complete" && task.projectStage !== null).length;

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
      title: "Completed",
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
