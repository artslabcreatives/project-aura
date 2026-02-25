import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Task, TaskHistory } from "@/types/task";
import { taskService } from "@/services/taskService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Tag,
    Paperclip,
    ExternalLink,
    Download,
    AlertCircle,
    CheckCircle2,
    ListTodo,
    History as HistoryIcon,
    Eye,
    MessageSquare,
    Activity,
    UserPlus,
    FileIcon,
    Trash2,
    Ban
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";

export default function TaskDetailsPage() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useUser();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [historyEntries, setHistoryEntries] = useState<TaskHistory[]>([]);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyMeta, setHistoryMeta] = useState<any>(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [subtaskToDelete, setSubtaskToDelete] = useState<Task | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const loadHistory = async (page: number) => {
        if (!taskId) return;
        setLoadingHistory(true);
        try {
            const { data, meta } = await taskService.getHistory(taskId, page);
            if (page === 1) {
                setHistoryEntries(data);
            } else {
                setHistoryEntries(prev => [...prev, ...data]);
            }
            setHistoryMeta(meta);
            setHistoryPage(page);
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (taskId) {
            loadHistory(1);
        }
    }, [taskId]);

    useEffect(() => {
        const fetchTask = async () => {
            if (!taskId) return;
            try {
                setLoading(true);
                const data = await taskService.getById(taskId);
                setTask(data);
            } catch (err) {
                console.error("Failed to fetch task details:", err);
                setError("Failed to load task details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, [taskId]);

    if (loading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto p-6 pb-20">
                {/* Header Skeleton */}
                <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <div className="flex gap-3">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content Skeleton */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-24" />
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-8 w-full" />
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-20" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-16" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-24" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-8 gap-4">
                <p className="text-destructive font-medium">{error || "Task not found"}</p>
                <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    const priorityColors = {
        low: "bg-priority-low/10 text-priority-low border-priority-low/20",
        medium: "bg-priority-medium/10 text-priority-medium border-priority-medium/20",
        high: "bg-priority-high/10 text-priority-high border-priority-high/20",
    };

    const statusColors = {
        pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
        "in-progress": "bg-blue-500/10 text-blue-700 border-blue-500/20",
        complete: "bg-green-500/10 text-green-700 border-green-500/20",
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6 pb-20">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="mt-1"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{task.title}</h1>
                        <Badge variant="outline" className="text-xs">
                            Task ID: #{task.id}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="text-sm">
                            {task.project}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={cn("text-sm capitalize", statusColors[task.userStatus])}
                        >
                            {task.userStatus.replace("-", " ")}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={cn("text-sm capitalize", priorityColors[task.priority])}
                        >
                            {task.priority || "Medium"} Priority
                        </Badge>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Revision Alert */}
                    {
                        task.revisionComment && task.tags?.includes("Redo") && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500 dark:border-amber-600 rounded-lg animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
                                            Revision Requested
                                        </h3>
                                        <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-wrap">
                                            {task.revisionComment}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    }



                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {task.description ? (
                                /<\/?[a-z][\s\S]*>/i.test(task.description) ? (
                                    <div
                                        className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                                        dangerouslySetInnerHTML={{ __html: task.description }}
                                    />
                                ) : (
                                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
                                        {task.description}
                                    </div>
                                )
                            ) : (
                                <div className="text-muted-foreground italic">No description provided.</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Subtasks */}
                    {task.subtasks && task.subtasks.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ListTodo className="h-5 w-5" />
                                    Subtasks
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {task.subtasks.map((subtask) => (
                                        <div key={subtask.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                                            <div className={cn(
                                                "h-5 w-5 flex items-center justify-center rounded border",
                                                subtask.userStatus === 'complete'
                                                    ? "bg-primary border-primary text-primary-foreground"
                                                    : "border-muted-foreground/30"
                                            )}>
                                                {subtask.userStatus === 'complete' && <CheckCircle2 className="h-3.5 w-3.5" />}
                                            </div>
                                            <span className={cn(
                                                "flex-1 text-sm font-medium",
                                                subtask.userStatus === 'complete' && "line-through text-muted-foreground"
                                            )}>
                                                {subtask.title}
                                            </span>
                                            <Badge variant="secondary" className="text-xs font-normal">
                                                {subtask.assignee}
                                            </Badge>

                                            {/* Delete Subtask Button */}
                                            {(currentUser?.role === 'admin' || currentUser?.role === 'team-lead') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSubtaskToDelete(subtask);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Attachments */}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Paperclip className="h-5 w-5" />
                                Attachments {task.attachments?.length ? `(${task.attachments.length})` : ''}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {task.attachments && task.attachments.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {task.attachments.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                                    {attachment.type === "link" ? (
                                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{attachment.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(() => {
                                                            const uploadedAt = attachment.uploadedAt ? new Date(attachment.uploadedAt) : null;
                                                            return uploadedAt && isValid(uploadedAt) ? format(uploadedAt, "MMM dd, yyyy") : "Unknown date";
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <a
                                                    href={attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {attachment.type === "link" ? (
                                                        <ExternalLink className="h-4 w-4" />
                                                    ) : (
                                                        <Download className="h-4 w-4" />
                                                    )}
                                                </a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No attachments added.</p>
                            )}
                        </CardContent>
                    </Card>



                </div>

                {/* Sidebar */}
                <div className="md:col-span-1 space-y-6">
                    {/* Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-2">
                                    <User className="h-4 w-4" /> Assignees
                                </h3>
                                <div className="space-y-2">
                                    {task.assignedUsers && task.assignedUsers.length > 0 ? (
                                        task.assignedUsers.map(u => (
                                            <div key={u.id} className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <span className="text-sm">{u.name}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                                <User className="h-3 w-3 text-muted-foreground" />
                                            </div>
                                            <span className="text-sm italic text-muted-foreground">{task.assignee || "Unassigned"}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                {task.startDate && (() => {
                                    const dateTimeParts = task.startDate.split('T');
                                    const datePart = dateTimeParts[0];
                                    const timePart = dateTimeParts[1]?.substring(0, 5) || '00:00';
                                    const startDate = new Date(`${datePart}T${timePart}`);
                                    return isValid(startDate) ? (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Start Date</span>
                                            <span className="font-medium">{format(startDate, "MMM dd, yyyy")}</span>
                                        </div>
                                    ) : null;
                                })()}

                                {(() => {
                                    const dateTimeParts = task.dueDate?.split('T') || [];
                                    const datePart = dateTimeParts[0];
                                    const timePart = dateTimeParts[1]?.substring(0, 5) || '00:00';
                                    const dueDate = datePart ? new Date(`${datePart}T${timePart}`) : null;
                                    return dueDate && isValid(dueDate) ? (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Due Date</span>
                                            <span className="font-medium">{format(dueDate, "MMM dd, yyyy")}</span>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tags Card */}
                    {task.tags && task.tags.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Tag className="h-4 w-4" /> Tags
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {task.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className={cn(
                                                "text-sm py-1 px-3",
                                                tag === "Redo" && "bg-amber-500/10 text-amber-700 border-amber-500/20"
                                            )}
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Revision History */}
                    {task.revisionHistory && task.revisionHistory.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <HistoryIcon className="h-5 w-5" />
                                    History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {[...task.revisionHistory].reverse().map((history, index) => {
                                    const requestedDate = history.requestedAt ? new Date(history.requestedAt) : null;
                                    const resolvedDate = history.resolvedAt ? new Date(history.resolvedAt) : null;

                                    return (
                                        <div key={history.id} className="relative pl-4 border-l-2 border-muted pb-4 last:pb-0">
                                            <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    {requestedDate && isValid(requestedDate) ? format(requestedDate, "MMM dd, hh:mm a") : "Unknown"}
                                                </span>
                                                <p className="text-sm font-medium">{history.comment}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                    <User className="h-3 w-3" />
                                                    <span>{history.requestedBy}</span>
                                                    {resolvedDate && (
                                                        <span className="ml-auto text-green-600 flex items-center gap-1">
                                                            <CheckCircle2 className="h-3 w-3" /> Resolved
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Task Submission & Comments - Full Width */}
            {((task.comments && task.comments.length > 0) || task.completedAt) && (
                <Card className="w-full border-green-500/20 bg-green-50/10">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-500">
                            <CheckCircle2 className="h-5 w-5" />
                            Task Submission & Comments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {task.completedAt && (
                                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <span>
                                        Task marked as complete on <span className="font-medium text-foreground">{format(new Date(task.completedAt), "MMM dd, yyyy 'at' hh:mm a")}</span>
                                    </span>
                                </div>
                            )}

                            {task.comments && task.comments.length > 0 ? (
                                <div className="space-y-3 pt-2">
                                    {[...task.comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((comment) => (
                                        <div key={comment.id} className="bg-white dark:bg-card/50 p-3 rounded-md border text-sm shadow-sm">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                        {comment.user?.name.charAt(0) || "U"}
                                                    </div>
                                                    <span className="font-semibold text-xs">{comment.user?.name || "Unknown User"}</span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {format(new Date(comment.createdAt), "MMM dd, hh:mm a")}
                                                </span>
                                            </div>
                                            <div className="pl-7 text-foreground/90">
                                                {/<\/?[a-z][\s\S]*>/i.test(comment.comment) ? (
                                                    <div
                                                        className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                                                        dangerouslySetInnerHTML={{ __html: comment.comment }}
                                                    />
                                                ) : (
                                                    <p className="whitespace-pre-wrap">{comment.comment}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                task.completedAt && <p className="text-sm text-muted-foreground italic">No comments added.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Activity Log (Task History) - Full Width */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <HistoryIcon className="h-5 w-5" />
                        Activity Log
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {historyEntries.length > 0 ? (
                        <div className="space-y-6">
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {historyEntries.map((history) => {
                                    let Icon = Clock;
                                    let iconColor = "text-slate-500 group-[.is-active]:text-emerald-50";
                                    let iconBg = "bg-slate-300 group-[.is-active]:bg-emerald-500";
                                    let detailsContent = <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{history.details}</div>;

                                    switch (history.action) {
                                        case 'viewed':
                                            Icon = Eye;
                                            iconBg = "bg-blue-100 dark:bg-blue-900";
                                            iconColor = "text-blue-600 dark:text-blue-300";
                                            break;
                                        case 'comment_added':
                                            Icon = MessageSquare;
                                            iconBg = "bg-purple-100 dark:bg-purple-900";
                                            iconColor = "text-purple-600 dark:text-purple-300";
                                            if (history.previousDetails?.comment_text) {
                                                detailsContent = (
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{history.details}</div>
                                                        <div className="mt-1 text-sm bg-muted/50 p-2 rounded border-l-2 border-primary italic">
                                                            {/<\/?[a-z][\s\S]*>/i.test(history.previousDetails.comment_text) ? (
                                                                <div
                                                                    className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                                                                    dangerouslySetInnerHTML={{ __html: history.previousDetails.comment_text }}
                                                                />
                                                            ) : (
                                                                `"${history.previousDetails.comment_text}"`
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            break;
                                        case 'status_changed':
                                            if (history.previousDetails?.new_status === 'blocked') {
                                                Icon = Ban;
                                                iconBg = "bg-red-100 dark:bg-red-900";
                                                iconColor = "text-red-600 dark:text-red-300";
                                            } else if (history.previousDetails?.old_status === 'blocked') {
                                                Icon = CheckCircle2; // Unblocked
                                                iconBg = "bg-green-100 dark:bg-green-900";
                                                iconColor = "text-green-600 dark:text-green-300";
                                            } else {
                                                Icon = Activity;
                                                iconBg = "bg-orange-100 dark:bg-orange-900";
                                                iconColor = "text-orange-600 dark:text-orange-300";
                                            }
                                            break;
                                        case 'stage_changed':
                                            Icon = Activity;
                                            iconBg = "bg-orange-100 dark:bg-orange-900";
                                            iconColor = "text-orange-600 dark:text-orange-300";
                                            break;
                                        case 'assigned':
                                        case 'reassigned':
                                        case 'unassigned':
                                            Icon = UserPlus;
                                            iconBg = "bg-indigo-100 dark:bg-indigo-900";
                                            iconColor = "text-indigo-600 dark:text-indigo-300";
                                            break;
                                        case 'attachment_added':
                                            Icon = FileIcon;
                                            break;
                                        case 'attachment_removed':
                                            Icon = Trash2;
                                            iconBg = "bg-red-100 dark:bg-red-900";
                                            iconColor = "text-red-600 dark:text-red-300";
                                            break;
                                        case 'completed':
                                            Icon = CheckCircle2;
                                            iconBg = "bg-green-100 dark:bg-green-900";
                                            iconColor = "text-green-600 dark:text-green-300";
                                            break;
                                        default:
                                            Icon = Clock;
                                    }

                                    return (
                                        <div key={history.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Icon */}
                                            <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2", iconBg, iconColor)}>
                                                <Icon className="h-5 w-5" />
                                            </div>

                                            {/* Card */}
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-card p-4 rounded border border-slate-200 dark:border-border shadow">
                                                <div className="flex flex-col space-y-1 mb-1">
                                                    <div className="flex items-center justify-between">
                                                        {detailsContent}
                                                        <time className="font-caveat font-medium text-xs text-indigo-500 whitespace-nowrap ml-2">
                                                            {format(new Date(history.createdAt), "MMM dd, hh:mm a")}
                                                        </time>
                                                    </div>
                                                </div>
                                                <div className="text-slate-500 dark:text-muted-foreground text-xs flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {history.user?.name || "System"}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {(historyMeta && historyMeta.current_page < historyMeta.last_page) && (
                                <div className="flex justify-center pt-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => loadHistory(historyPage + 1)}
                                        disabled={loadingHistory}
                                    >
                                        {loadingHistory ? "Loading..." : "Load More"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground text-center py-8 italic bg-muted/30 rounded-lg border border-dashed">
                            {loadingHistory ? "Loading activity log..." : "No activity recorded for this task."}
                        </div>
                    )}
                </CardContent>
            </Card>
            {/* Subtask Deletion Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the subtask "{subtaskToDelete?.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                if (!subtaskToDelete || !task) return;
                                try {
                                    await taskService.delete(subtaskToDelete.id);
                                    // Update local state
                                    const updatedSubtasks = task.subtasks?.filter(st => st.id !== subtaskToDelete.id) || [];
                                    setTask({ ...task, subtasks: updatedSubtasks });
                                } catch (error) {
                                    console.error("Failed to delete subtask", error);
                                } finally {
                                    setIsDeleteDialogOpen(false);
                                    setSubtaskToDelete(null);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
