import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { taskService } from "@/services/taskService";
import { TaskHistory } from "@/types/task";
import { Loader2, User, Clock, FileText, ArrowRight, Paperclip, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TaskHistoryDialogProps {
    taskId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskTitle: string;
}

export function TaskHistoryDialog({ taskId, open, onOpenChange, taskTitle }: TaskHistoryDialogProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['taskHistory', taskId],
        queryFn: () => taskService.getHistory(taskId),
        enabled: open,
    });

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'created':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'updated':
                return <FileText className="h-4 w-4 text-blue-500" />;
            case 'stage_changed':
            case 'moved_to_review_stage':
                return <ArrowRight className="h-4 w-4 text-orange-500" />;
            case 'attachment_added':
            case 'attachment_removed':
                return <Paperclip className="h-4 w-4 text-purple-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getActionLabel = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Task History</DialogTitle>
                    <DialogDescription>
                        History for task: <span className="font-medium text-foreground">{taskTitle}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden mt-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="space-y-6 pl-2">
                                {data && data.data.length > 0 ? (
                                    data.data.map((history: TaskHistory, index: number) => (
                                        <div key={history.id} className="relative flex gap-4 pb-2">
                                            {/* Vertical Line */}
                                            {index !== data.data.length - 1 && (
                                                <div className="absolute left-[0.95rem] top-8 bottom-[-1.5rem] w-px bg-border" />
                                            )}

                                            <div className={cn(
                                                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm",
                                            )}>
                                                {getActionIcon(history.action)}
                                            </div>

                                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold">
                                                        {getActionLabel(history.action)}
                                                    </span>
                                                    <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                                                        {format(new Date(history.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                                    </Badge>
                                                </div>

                                                <div className="text-sm text-muted-foreground">
                                                    {history.details}
                                                </div>

                                                {history.user && (
                                                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground bg-muted/50 w-fit px-2 py-0.5 rounded-full">
                                                        <User className="h-3 w-3" />
                                                        <span>{history.user.name}</span>
                                                    </div>
                                                )}

                                                {/* Optional: Show previous details if structured */}
                                                {history.previousDetails && history.action === 'updated' && (
                                                    <div className="mt-2 text-xs bg-muted/50 p-2 rounded border">
                                                        <div className="font-medium mb-1">Changes:</div>
                                                        <ul className="list-disc list-inside space-y-0.5">
                                                            {Object.entries(history.previousDetails).map(([key, value]) => {
                                                                if (key.startsWith('old_')) return null; // Skip old values, show pairs if possible
                                                                if (key.startsWith('new_')) {
                                                                    const fieldName = key.replace('new_', '');
                                                                    const oldValue = history.previousDetails['old_' + fieldName];
                                                                    return (
                                                                        <li key={key} className="break-all">
                                                                            <span className="font-medium">{fieldName}:</span> {String(oldValue)} → {String(value)}
                                                                        </li>
                                                                    );
                                                                }
                                                                return null;
                                                            })}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        No history recorded for this task.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
