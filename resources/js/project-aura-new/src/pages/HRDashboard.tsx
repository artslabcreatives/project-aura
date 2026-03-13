import { useEffect, useState } from "react";
import { Project } from "@/types/project";
import { projectService } from "@/services/projectService";
import { Skeleton } from "@/components/ui/skeleton";
import { HRDashboardStats } from "@/components/HRDashboardStats";
import { DeadlineCalendar } from "@/components/DeadlineCalendar";
import { Briefcase } from "lucide-react";

const HRDashboard = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const projectsData = await projectService.getAll();
                setProjects(projectsData);
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 p-8 max-w-[1600px] mx-auto animate-pulse">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64 rounded-xl" />
                    <Skeleton className="h-6 w-48 rounded-lg" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-[600px] w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8 max-w-[1600px] mx-auto fade-in h-full flex flex-col">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 shadow-2xl shadow-indigo-500/20 ring-1 ring-white/20">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                            <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter">Strategic Overview</h1>
                            <p className="text-white/80 font-medium tracking-wide">
                                HR Project Intelligence & Deadline Tracking
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <HRDashboardStats projects={projects} />

            {/* Calendar Section */}
            <div className="flex-1 min-h-0">
                <DeadlineCalendar projects={projects} />
            </div>
        </div>
    );
};

export default HRDashboard;
