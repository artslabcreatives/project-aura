import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Project } from "@/types/project";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building2, Clock, CheckCircle2, AlertCircle, Calendar, Mail, Phone, Globe, ArrowLeft, Lock, ShieldCheck, FileText, AlertTriangle, BanIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
import { POUploadDialog } from "@/components/POUploadDialog";
import { POViewDialog } from "@/components/POViewDialog";
import { InvoiceUploadDialog } from "@/components/InvoiceUploadDialog";
import { GracePeriodDialog } from "@/components/GracePeriodDialog";
import { ProvisionalPODialog } from "@/components/ProvisionalPODialog";
import { InvoiceViewDialog } from "@/components/InvoiceViewDialog";

export default function ProjectOverview() {
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isPOUploadOpen, setIsPOUploadOpen] = useState(false);
    const [isPOViewOpen, setIsPOViewOpen] = useState(false);
    const [isInvoiceUploadOpen, setIsInvoiceUploadOpen] = useState(false);
    const [isEditingDeadline, setIsEditingDeadline] = useState(false);
    const [isGracePeriodOpen, setIsGracePeriodOpen] = useState(false);
    const [isProvisionalPOOpen, setIsProvisionalPOOpen] = useState(false);
    const [isInvoiceViewOpen, setIsInvoiceViewOpen] = useState(false);
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

    const completedStageId = project?.stages.find(s => s.title.toLowerCase().trim() === 'completed')?.id;
    const suggestedStageIds = project?.stages
        .filter(s => {
            const title = s.title.toLowerCase().trim();
            return title === 'suggested' || title === 'suggested task';
        })
        .map(s => s.id);
    const archiveStageId = project?.stages.find(s => s.title.toLowerCase().trim() === 'archive')?.id;

    const filteredTasks = tasks.filter(t => {
        if (!t.projectStage) return true;
        return !suggestedStageIds.includes(t.projectStage) && t.projectStage !== archiveStageId;
    });

    const completedTasks = tasks.filter(t => t.projectStage === completedStageId).length;
    const totalTasks = filteredTasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const statusColors: Record<string, string> = {
        active: "bg-green-500",
        "on-hold": "bg-orange-500",
        completed: "bg-blue-500",
        cancelled: "bg-red-500",
        suggested: "bg-blue-400",
        blocked: "bg-red-600",
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

        // Trigger Invoice upload if status changed to completed
        if (newStatus === 'completed' && (currentUser?.role === 'hr' || currentUser?.role === 'admin')) {
            setIsInvoiceUploadOpen(true);
            return;
        }

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
    const canSeeClientInfo = currentUser?.role === 'admin' || currentUser?.role === 'hr';
    const canManageFinance = currentUser?.role === 'admin' || currentUser?.role === 'hr';
    const isBlocked = project?.isBlocked || project?.status === 'blocked';

    const handleGracePeriodSave = async (expiresAt: string, notes: string) => {
        if (!project) return;
        try {
            const updatedProject = await projectService.update(String(project.id), {
                ...project,
                gracePeriodExpiresAt: expiresAt,
                gracePeriodNotes: notes,
            });
            setProject(updatedProject);
            toast({ title: "Grace period authorized successfully." });
        } catch {
            toast({ title: "Error", description: "Failed to save grace period.", variant: "destructive" });
        }
    };

    const handleProvisionalPOSave = async (poNumber: string, expiresAt: string) => {
        if (!project) return;
        try {
            const updatedProject = await projectService.update(String(project.id), {
                ...project,
                provisionalPoNumber: poNumber,
                provisionalPoExpiresAt: expiresAt,
            });
            setProject(updatedProject);
            toast({ title: "Provisional PO issued successfully." });
        } catch {
            toast({ title: "Error", description: "Failed to issue provisional PO.", variant: "destructive" });
        }
    };

    const handleToggleBlock = async () => {
        if (!project) return;
        const newStatus = isBlocked ? 'active' : 'blocked';
        setIsUpdatingStatus(true);
        try {
            const updatedProject = await projectService.update(String(project.id), {
                ...project,
                status: newStatus,
                isBlocked: !isBlocked,
            });
            setProject(updatedProject);
            toast({
                title: isBlocked ? "Project Unblocked" : "Project Blocked",
                description: isBlocked
                    ? "The project has been unblocked and is now active."
                    : "The project has been blocked and is now read-only.",
            });
        } catch {
            toast({ title: "Error", description: "Failed to update project status.", variant: "destructive" });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const hasPO = !!project?.poDocumentUrl || !!project?.poNumber;
    const hasGracePeriod = !!project?.gracePeriodExpiresAt;
    const gracePeriodExpired = hasGracePeriod && new Date(project!.gracePeriodExpiresAt!) < new Date();
    const hasProvisionalPO = !!project?.provisionalPoNumber;
    const provisionalPOExpired = hasProvisionalPO && project?.provisionalPoExpiresAt
        ? new Date(project.provisionalPoExpiresAt) < new Date()
        : false;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (window.history.length > 2) {
                                    navigate(-1);
                                } else {
                                    navigate('/');
                                }
                            }}
                            className="h-9 w-9"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
                        {project.projectCode && (
                            <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {project.projectCode}
                            </span>
                        )}
                        {project.isLockedByPo ? (
                            <div className="flex items-center gap-2">
                                <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider bg-red-500 hover:bg-red-600 border-none px-2 h-6 flex items-center gap-1">
                                    <Lock className="h-3 w-3" /> Awaiting PO
                                </Badge>
                                {(currentUser?.role === 'admin' || currentUser?.role === 'hr') && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-6 text-[10px] px-2 py-0 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                        onClick={() => setIsPOUploadOpen(true)}
                                    >
                                        Upload PO
                                    </Button>
                                )}
                            </div>
                        ) : project.poDocumentUrl ? (
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-6 text-[10px] px-2 py-0 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                                    onClick={() => setIsPOViewOpen(true)}
                                >
                                    View PO
                                </Button>
                                {project.invoiceDocumentUrl && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-6 text-[10px] px-2 py-0 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                                        onClick={() => setIsInvoiceViewOpen(true)}
                                    >
                                        View Invoice
                                    </Button>
                                )}
                            </div>
                        ) : project.invoiceDocumentUrl ? (
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-6 text-[10px] px-2 py-0 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                                    onClick={() => setIsInvoiceViewOpen(true)}
                                >
                                    View Invoice
                                </Button>
                            </div>
                        ) : null}
                        {canChangeStatus ? (
                            <Select
                                value={project.status || 'active'}
                                onValueChange={handleStatusChange}
                                disabled={isUpdatingStatus}
                            >
                                <SelectTrigger className={`w-[130px] h-8 text-xs font-semibold capitalize border-none text-white focus:ring-0 ${statusColors[project.status || 'active']}`}>
                                    {isUpdatingStatus ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                                    <SelectValue placeholder="Status">
                                        {project.status === 'on-hold' ? 'Blocked' : undefined}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="suggested">Suggested</SelectItem>
                                    <SelectItem value="on-hold">On Hold</SelectItem>
                                    <SelectItem value="blocked">Blocked</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <Badge className={`${statusColors[project.status || 'active']} hover:${statusColors[project.status || 'active']} text-white capitalize px-3 py-1`}>
                                {project.status === 'on-hold' ? 'On Hold' :
                                 project.status === 'suggested' ? 'Suggested' :
                                 project.status === 'blocked' ? 'Blocked' :
                                 project.status || 'Active'}
                            </Badge>
                        )}
                        {isBlocked && (
                            <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider bg-red-600 border-none px-2 h-6 flex items-center gap-1">
                                <BanIcon className="h-3 w-3" /> Blocked
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground text-lg">
                        {project.department?.name} • {project.group?.name || 'No Group'}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {canManageFinance && (
                        <Button
                            variant={isBlocked ? "outline" : "destructive"}
                            size="sm"
                            onClick={handleToggleBlock}
                            disabled={isUpdatingStatus}
                        >
                            {isUpdatingStatus ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            ) : isBlocked ? (
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            ) : (
                                <BanIcon className="h-3.5 w-3.5 mr-1" />
                            )}
                            {isBlocked ? "Unblock Project" : "Block Project"}
                        </Button>
                    )}
                    <button
                        onClick={() => navigate(`/project/${projectId}`)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                    >
                        Go to Kanban Board
                    </button>
                </div>
            </div>

            {/* PO Warning Banner */}
            {!hasPO && !hasGracePeriod && !hasProvisionalPO && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold text-amber-800 dark:text-amber-300">Purchase Order Required</p>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                            This project does not have a PO on file. Task creation is restricted until a PO is received.
                        </p>
                    </div>
                    {canManageFinance && (
                        <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900" onClick={() => setIsPOUploadOpen(true)}>
                                Upload PO
                            </Button>
                            <Button size="sm" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900" onClick={() => setIsGracePeriodOpen(true)}>
                                <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Grace Period
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Grace Period Banner */}
            {hasGracePeriod && !hasPO && (
                <div className={`flex items-start gap-3 rounded-lg border p-4 ${gracePeriodExpired ? 'border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800' : 'border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800'}`}>
                    <ShieldCheck className={`h-5 w-5 shrink-0 mt-0.5 ${gracePeriodExpired ? 'text-red-500' : 'text-blue-500'}`} />
                    <div className="flex-1">
                        <p className={`font-semibold ${gracePeriodExpired ? 'text-red-800 dark:text-red-300' : 'text-blue-800 dark:text-blue-300'}`}>
                            {gracePeriodExpired ? 'Grace Period Expired' : 'Grace Period Active'}
                        </p>
                        <p className={`text-sm mt-0.5 ${gracePeriodExpired ? 'text-red-700 dark:text-red-400' : 'text-blue-700 dark:text-blue-400'}`}>
                            {gracePeriodExpired
                                ? `The authorized grace period expired on ${new Date(project!.gracePeriodExpiresAt!).toLocaleDateString()}. A PO is now required.`
                                : `Work may proceed without PO until ${new Date(project!.gracePeriodExpiresAt!).toLocaleDateString()}.`}
                            {project!.gracePeriodNotes && ` Note: ${project!.gracePeriodNotes}`}
                        </p>
                    </div>
                    {canManageFinance && (
                        <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="outline" onClick={() => setIsGracePeriodOpen(true)}>
                                Update
                            </Button>
                            {gracePeriodExpired && !hasProvisionalPO && (
                                <Button size="sm" variant="outline" className="border-blue-400 text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900" onClick={() => setIsProvisionalPOOpen(true)}>
                                    <FileText className="h-3.5 w-3.5 mr-1" /> Provisional PO
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Provisional PO Banner */}
            {hasProvisionalPO && !hasPO && (
                <div className={`flex items-start gap-3 rounded-lg border p-4 ${provisionalPOExpired ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800' : 'border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-800'}`}>
                    <FileText className={`h-5 w-5 shrink-0 mt-0.5 ${provisionalPOExpired ? 'text-orange-500' : 'text-green-500'}`} />
                    <div className="flex-1">
                        <p className={`font-semibold ${provisionalPOExpired ? 'text-orange-800 dark:text-orange-300' : 'text-green-800 dark:text-green-300'}`}>
                            {provisionalPOExpired ? 'Provisional PO Expired' : 'Provisional PO Active'}
                        </p>
                        <p className={`text-sm mt-0.5 ${provisionalPOExpired ? 'text-orange-700 dark:text-orange-400' : 'text-green-700 dark:text-green-400'}`}>
                            PO Reference: <strong>{project!.provisionalPoNumber}</strong>
                            {project!.provisionalPoExpiresAt && ` · ${provisionalPOExpired ? 'Expired' : 'Expires'} ${new Date(project!.provisionalPoExpiresAt).toLocaleDateString()}`}
                        </p>
                    </div>
                    {canManageFinance && (
                        <Button size="sm" variant="outline" onClick={() => setIsProvisionalPOOpen(true)}>
                            Update
                        </Button>
                    )}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <Card className="h-full border-none shadow-md bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4 text-indigo-500" />
                            Estimated Hours
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center">
                        <div className="text-4xl font-black tracking-tighter">{project.estimatedHours || 0}h</div>
                    </CardContent>
                </Card>

                <Card className="h-full border-none shadow-md bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Completion
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center space-y-3">
                        <div className="text-4xl font-black tracking-tighter">{progress}%</div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">
                            {completedTasks} / {totalTasks} tasks finished
                        </p>
                    </CardContent>
                </Card>

                <Card className="h-full border-none shadow-md bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-amber-500" />
                            Created On
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center">
                        <div className="text-3xl font-black tracking-tighter">
                            {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full border-none shadow-md bg-gradient-to-br from-rose-500/10 to-red-500/10 dark:from-rose-500/20 dark:to-red-500/20 flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-rose-500" />
                            Deadline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center">
                        {canChangeStatus ? (
                            <div className="flex flex-col gap-1">
                                {isEditingDeadline || !project.deadline ? (
                                    <input
                                        type="date"
                                        autoFocus={isEditingDeadline}
                                        value={project.deadline || ""}
                                        onBlur={() => setIsEditingDeadline(false)}
                                        onChange={async (e) => {
                                            const newDeadline = e.target.value;
                                            try {
                                                const updatedProject = await projectService.update(String(project.id), {
                                                   ...project,
                                                    deadline: newDeadline
                                                });
                                                setProject(updatedProject);
                                                setIsEditingDeadline(false);
                                                toast({ title: "Deadline Updated", description: "Project deadline has been updated successfully." });
                                            } catch (error) {
                                                toast({ title: "Error", description: "Failed to update deadline.", variant: "destructive" });
                                            }
                                        }}
                                        className="bg-transparent border-none text-2xl font-black tracking-tighter focus:ring-0 p-0 w-full cursor-pointer hover:opacity-70 transition-opacity"
                                    />
                                ) : (
                                    <div 
                                        onClick={() => setIsEditingDeadline(true)}
                                        className="text-3xl font-black tracking-tighter cursor-pointer hover:opacity-70 transition-opacity"
                                    >
                                        {new Date(project.deadline).toLocaleDateString()}
                                    </div>
                                )}
                                {!project.deadline && !isEditingDeadline && <span className="text-[10px] uppercase font-bold text-muted-foreground/50">Set Deadline</span>}
                            </div>
                        ) : (
                            <div className="text-3xl font-black tracking-tighter">
                                {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {canSeeClientInfo && (
                    <Card className="h-full border-none shadow-md bg-gradient-to-br from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20 flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-pink-500" />
                                Client
                              </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center">
                            <div className="text-xl font-black tracking-tight line-clamp-2">
                                {project.client?.company_name || 'Internal Project'}
                            </div>
                        </CardContent>
                    </Card>
                )}
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
                    {canSeeClientInfo ? (
                        project.client ? (
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
                        )
                    ) : null}
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

            <POUploadDialog
                open={isPOUploadOpen}
                onOpenChange={setIsPOUploadOpen}
                project={project}
                onSuccess={(updatedProject) => setProject(updatedProject)}
            />

            <POViewDialog
                open={isPOViewOpen}
                onOpenChange={setIsPOViewOpen}
                url={project.poDocumentUrl || ""}
                poNumber={project.poNumber}
            />

            <InvoiceUploadDialog
                open={isInvoiceUploadOpen}
                onOpenChange={setIsInvoiceUploadOpen}
                project={project}
                onSuccess={(updatedProject) => {
                    setProject(updatedProject);
                    // Optionally force status to completed if it wasn't already updated by the dialog's save logic
                    // The projectService.update inside the dialog should handle fields, 
                    // but we might want to ensure the status is 'completed' there too.
                }}
            />

            <GracePeriodDialog
                open={isGracePeriodOpen}
                onOpenChange={setIsGracePeriodOpen}
                onSave={handleGracePeriodSave}
                currentExpiresAt={project.gracePeriodExpiresAt}
                currentNotes={project.gracePeriodNotes}
            />

            <ProvisionalPODialog
                open={isProvisionalPOOpen}
                onOpenChange={setIsProvisionalPOOpen}
                onSave={handleProvisionalPOSave}
                projectName={project.name}
                currentPoNumber={project.provisionalPoNumber}
                currentExpiresAt={project.provisionalPoExpiresAt}
            />

            <InvoiceViewDialog
                open={isInvoiceViewOpen}
                onOpenChange={setIsInvoiceViewOpen}
                url={project.invoiceDocumentUrl || ""}
                project={project}
                onSuccess={(updatedProject) => setProject(updatedProject)}
            />
        </div>
    );
}
