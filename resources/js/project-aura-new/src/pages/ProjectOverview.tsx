import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Project } from "@/types/project";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building2, Clock, CheckCircle2, AlertCircle, Calendar, Mail, Phone, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function ProjectOverview() {
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const { toast } = useToast();
    const { currentUser } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!projectId) return;
            setLoading(true);
            try {
                let found: Project | null = null;
                const allProjects = await projectService.getAll();

                if (/^\d+$/.test(projectId)) {
                    found = allProjects.find(p => String(p.id) === projectId) || null;
                } else {
                    const decoded = decodeURIComponent(projectId);
                    found = allProjects.find(p => p.name === decoded) || null;
                    if (!found) {
                        const slug = projectId.toLowerCase();
                        found = allProjects.find(p => p.name.toLowerCase().replace(/\s+/g, '-') === slug) || null;
                    }
                }

                if (found) {
                    setProject(found);
                    const projectTasks = await taskService.getAll({ projectId: String(found.id) });
                    setTasks(projectTasks);
                }
            } catch (error) {
                console.error("Failed to fetch project overview data:", error);
                toast({ title: "Error", description: "Failed to load project details", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId, toast]);

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
                <Skeleton className="h-80 w-full" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Project Not Found</h2>
                <button
                    onClick={() => navigate("/")}
                    className="text-primary hover:underline"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const completedTasks = tasks.filter(t => t.userStatus === 'complete').length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const statusColors = {
        active: "bg-green-500",
        "on-hold": "bg-yellow-500",
        completed: "bg-blue-500",
        cancelled: "bg-red-500",
    };

    const getDisplayName = (title: string) => {
        if (!title) return title;
        if (title.toLowerCase().trim() === 'pending') {
            return 'Backlog';
        }
        return title;
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!project) return;
        setIsUpdatingStatus(true);
        try {
            const updatedProject = await projectService.update(String(project.id), {
                ...project, // Send existing data
                status: newStatus,
                group: project.group, // handle the mapping logic in service if needed
                department: project.department
            });
            setProject(updatedProject);
            toast({
                title: "Status Updated",
                description: `Project status changed to ${newStatus}.`,
            });
        } catch (error) {
            console.error("Failed to update status:", error);
            toast({
                title: "Error",
                description: "Failed to update project status. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const canChangeStatus = currentUser?.role === 'admin' || currentUser?.role === 'hr';


    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
                        {canChangeStatus ? (
                            <Select
                                value={project.status || 'active'}
                                onValueChange={handleStatusChange}
                                disabled={isUpdatingStatus}
                            >
                                <SelectTrigger className={`w-[130px] h-8 text-xs font-semibold capitalize border-none text-white focus:ring-0 ${statusColors[project.status || 'active']}`}>
                                    {isUpdatingStatus ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="on-hold">On-Hold</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <Badge className={`${statusColors[project.status || 'active']} hover:${statusColors[project.status || 'active']} text-white capitalize px-3 py-1`}>
                                {project.status || 'active'}
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground text-lg">
                        {project.department?.name} • {project.group?.name || 'No Group'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors border"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate(`/project/${projectId}`)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                    >
                        Go to Kanban Board
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4 text-indigo-500" />
                            Estimated Hours
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{project.estimatedHours || 0}h</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Completion
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="text-3xl font-bold">{progress}%</div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                            {completedTasks} of {totalTasks} tasks finished
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-amber-500" />
                            Created On
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-pink-500" />
                            Client
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold truncate">
                            {project.client?.company_name || 'Internal Project'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Description & Stages */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: project.description || 'No description provided.' }}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Workflow Stages</CardTitle>
                            <CardDescription>Custom stages defined for this project's Kanban board</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {project.stages.map((stage) => (
                                    <div
                                        key={stage.id}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/50 text-sm font-medium"
                                    >
                                        <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                                        {getDisplayName(stage.title)}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Client Details & Contacts */}
                <div className="space-y-8">
                    {project.client ? (
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Client Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</label>
                                    <p className="font-medium text-lg">{project.client.company_name}</p>
                                </div>

                                {project.client.industry && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Industry</label>
                                        <p className="text-sm">{project.client.industry}</p>
                                    </div>
                                )}

                                <div className="pt-4 space-y-3">
                                    {project.client.website && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <a href={project.client.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                                {project.client.website}
                                            </a>
                                        </div>
                                    )}
                                    {project.client.email && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{project.client.email}</span>
                                        </div>
                                    )}
                                    {project.client.phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{project.client.phone}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => navigate(`/clients/${project.client?.id}`)}
                                    className="w-full mt-4 text-sm font-medium text-primary hover:text-primary/80"
                                >
                                    View Full Client Profile →
                                </button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="py-10 text-center space-y-2">
                                <Building2 className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                                <p className="text-muted-foreground">No client associated with this project.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Full Width: Project Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Project Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Emails</label>
                        <div className="flex flex-wrap gap-1">
                            {project.emails && project.emails.length > 0 ? (
                                project.emails.map(email => (
                                    <Badge key={email} variant="outline" className="font-normal">{email}</Badge>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground">None</span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">WhatsApp Group Numbers</label>
                        <div className="flex flex-wrap gap-1">
                            {project.phoneNumbers && project.phoneNumbers.length > 0 ? (
                                project.phoneNumbers.map(phone => (
                                    <Badge key={phone} variant="outline" className="font-normal">{phone}</Badge>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground">None</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
