import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Activity, CalendarClock, AlertTriangle } from "lucide-react";
import { Project } from "@/types/project";
import { isWithinInterval, addDays, startOfDay, parseISO } from "date-fns";

interface HRDashboardStatsProps {
    projects: Project[];
    onCardClick?: (type: 'total' | 'active' | 'upcoming' | 'missing', title: string) => void;
}

export function HRDashboardStats({ projects, onCardClick }: HRDashboardStatsProps) {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    
    const today = startOfDay(new Date());
    const fourteenDaysFromNow = addDays(today, 14);
    
    const upcomingDeadlines = projects.filter(p => {
        if (!p.deadline) return false;
        try {
            const deadlineDate = parseISO(p.deadline);
            return isWithinInterval(deadlineDate, { start: today, end: fourteenDaysFromNow });
        } catch (e) {
            return false;
        }
    }).length;
    
    const missingDeadlines = projects.filter(p => !p.deadline && !p.isArchived).length;

    const stats = [
        {
            type: 'total' as const,
            title: "Total Projects",
            value: totalProjects,
            icon: FolderKanban,
            iconColor: "text-blue-500",
            bgColor: "bg-blue-500/10",
            description: "Total projects in system"
        },
        {
            type: 'active' as const,
            title: "Active Projects",
            value: activeProjects,
            icon: Activity,
            iconColor: "text-green-500",
            bgColor: "bg-green-500/10",
            description: "Currently ongoing"
        },
        {
            type: 'upcoming' as const,
            title: "Upcoming Deadlines",
            value: upcomingDeadlines,
            icon: CalendarClock,
            iconColor: "text-amber-500",
            bgColor: "bg-amber-500/10",
            description: "Next 14 days"
        },
        {
            type: 'missing' as const,
            title: "Missing Deadlines",
            value: missingDeadlines,
            icon: AlertTriangle,
            iconColor: "text-rose-500",
            bgColor: "bg-rose-500/10",
            description: "Non-archived projects"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card 
                    key={stat.title} 
                    className="hover:shadow-md transition-all border-none shadow-sm bg-card/60 backdrop-blur-sm cursor-pointer hover:bg-white/5 active:scale-95"
                    onClick={() => onCardClick?.(stat.type, stat.title)}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
