import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Task } from "@/types/task";
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
    History as HistoryIcon
} from "lucide-react";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function TaskDetailsPage() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [visibleHistoryCount, setVisibleHistoryCount] = useState(5);

    // Reset visible count when task changes
    useEffect(() => {
        setVisibleHistoryCount(5);
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
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
                                {task.description || "No description provided."}
                            </div>
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
                                        <div key={subtask.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
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
                                            <p className="whitespace-pre-wrap text-foreground/90 pl-7">{comment.comment}</p>
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
                    {task.taskHistory && task.taskHistory.length > 0 ? (
                        <div className="space-y-6">
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {[...task.taskHistory]
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .slice(0, visibleHistoryCount)
                                    .map((history) => (
                                        <div key={history.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Icon */}
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                <Clock className="h-5 w-5" />
                                            </div>

                                            {/* Card */}
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-card p-4 rounded border border-slate-200 dark:border-border shadow">
                                                <div className="flex items-center justify-between space-x-2 mb-1">
                                                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                                        {history.details}
                                                    </div>
                                                    <time className="font-caveat font-medium text-xs text-indigo-500">
                                                        {format(new Date(history.createdAt), "MMM dd, hh:mm a")}
                                                    </time>
                                                </div>
                                                <div className="text-slate-500 dark:text-muted-foreground text-xs flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {history.user?.name || "System"}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                            {visibleHistoryCount < task.taskHistory.length && (
                                <div className="flex justify-center pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setVisibleHistoryCount(prev => prev + 5)}
                                    >
                                        Load More
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground text-center py-8 italic bg-muted/30 rounded-lg border border-dashed">
                            No activity recorded for this task.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
