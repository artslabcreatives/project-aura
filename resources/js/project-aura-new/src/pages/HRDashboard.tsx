import { useEffect, useState } from "react";
import { Project } from "@/types/project";
import { projectService } from "@/services/projectService";
import { Skeleton } from "@/components/ui/skeleton";
import { HRDashboardStats } from "@/components/HRDashboardStats";
import { DeadlineCalendar } from "@/components/DeadlineCalendar";
import { Briefcase, ChevronRight, Search, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { startOfDay, addDays, parseISO, isWithinInterval, format } from "date-fns";

const HRDashboard = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'summary' | 'project-list'>('summary');
    const [filterType, setFilterType] = useState<'total' | 'active' | 'upcoming' | 'missing' | null>(null);
    const [filterTitle, setFilterTitle] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

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

    const filteredProjects = projects.filter(p => {
        if (!filterType) return false;
        
        let matchesType = false;
        const today = startOfDay(new Date());
        const fourteenDaysFromNow = addDays(today, 14);

        if (filterType === 'total') matchesType = true;
        else if (filterType === 'active') matchesType = p.status === 'active';
        else if (filterType === 'upcoming') {
            if (!p.deadline) matchesType = false;
            else {
                try {
                    const deadlineDate = parseISO(p.deadline);
                    matchesType = isWithinInterval(deadlineDate, { start: today, end: fourteenDaysFromNow });
                } catch (e) {
                    matchesType = false;
                }
            }
        }
        else if (filterType === 'missing') matchesType = !p.deadline && !p.isArchived;

        if (!matchesType) return false;
        
        if (searchQuery) {
            return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   p.client?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
        }
        
        return true;
    });

    const handleCardClick = (type: 'total' | 'active' | 'upcoming' | 'missing', title: string) => {
        setFilterType(type);
        setFilterTitle(title);
        setSearchQuery("");
        setView('project-list');
    };

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
            {view === 'summary' ? (
                <>
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
                    <HRDashboardStats 
                        projects={projects} 
                        onCardClick={handleCardClick}
                    />

                    {/* Calendar Section */}
                    <div className="flex-1 min-h-0">
                        <DeadlineCalendar projects={projects} />
                    </div>
                </>
            ) : (
                <div className="flex flex-col gap-8 h-full">
                    {/* Sub-page Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                        <div className="flex items-center gap-4">
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => setView('summary')}
                                className="rounded-2xl h-12 w-12 border-white/10 hover:bg-white/5 shadow-xl transition-all"
                            >
                                <ChevronRight className="h-6 w-6 rotate-180" />
                            </Button>
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-3">
                                    {filterTitle}
                                    <Badge className="bg-primary/20 text-primary border-primary/20 py-1 px-4 text-sm font-bold rounded-full tabular-nums">
                                        {filteredProjects.length}
                                    </Badge>
                                </h2>
                                <p className="text-muted-foreground font-medium mt-1">
                                    Exploring filtered projects based on your selection
                                </p>
                            </div>
                        </div>

                        <div className="relative group w-full md:w-[400px]">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search project name or client..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-14 h-14 bg-card/60 border-white/10 rounded-2xl focus:ring-primary/20 text-lg shadow-xl"
                            />
                        </div>
                    </div>

                    {/* Project Grid */}
                    <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                        {filteredProjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-40 text-center opacity-40">
                                <FolderKanban className="h-24 w-24 mb-6 stroke-[1]" />
                                <p className="text-2xl font-bold italic tracking-tight">No projects found for current criteria</p>
                                <Button 
                                    variant="link" 
                                    onClick={() => setSearchQuery("")}
                                    className="mt-2 text-primary text-lg"
                                >
                                    Clear Search
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredProjects.map(project => (
                                    <div 
                                        key={project.id}
                                        onClick={() => navigate(`/project/${project.id}/overview`)}
                                        className="group relative p-8 rounded-3xl border border-white/5 bg-card/40 backdrop-blur-sm hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between shadow-lg hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-6 overflow-hidden">
                                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                                                <FolderKanban className="h-8 w-8 text-primary" />
                                            </div>
                                            <div className="space-y-2 min-w-0">
                                                <h4 className="font-extrabold text-2xl text-foreground group-hover:text-primary transition-colors truncate tracking-tight">
                                                    {project.name}
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="text-[11px] uppercase font-black tracking-[0.1em] py-0.5 px-3 h-6 border-white/10 bg-white/5 text-muted-foreground">
                                                        {project.status || 'Active'}
                                                    </Badge>
                                                    {project.client?.company_name && (
                                                        <span className="text-sm font-semibold text-muted-foreground truncate opacity-70">
                                                            {project.client.company_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 shrink-0">
                                            {project.deadline && (
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[11px] uppercase font-black text-muted-foreground tracking-widest opacity-40">Deadline</p>
                                                    <p className="text-lg font-black tabular-nums tracking-tighter">{format(parseISO(project.deadline), 'MMM dd, yyyy')}</p>
                                                </div>
                                            )}
                                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 shadow-lg border border-white/10">
                                                <ChevronRight className="h-6 w-6" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


export default HRDashboard;
