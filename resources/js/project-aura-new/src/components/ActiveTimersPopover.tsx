import { useState, useEffect, useCallback } from 'react';
import { Timer, Square, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ActiveTimeLog {
    id: number;
    task_id: number;
    user_id: number;
    started_at: string;
    ended_at: string | null;
    notes: string | null;
    task?: {
        id: number;
        title: string;
        project?: { id: number; name: string };
    };
}

function formatElapsed(startedAt: string): string {
    const seconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function ActiveTimersPopover() {
    const [open, setOpen] = useState(false);
    const [timers, setTimers] = useState<ActiveTimeLog[]>([]);
    const [tick, setTick] = useState(0);
    const { toast } = useToast();
    const navigate = useNavigate();

    const fetchTimers = useCallback(async () => {
        try {
            const response = await api.get('/user/active-timers');
            setTimers(response.data);
        } catch (error) {
            // Silently fail – timers are optional UI
        }
    }, []);

    // Poll every 30 seconds and on open
    useEffect(() => {
        fetchTimers();
        const interval = setInterval(fetchTimers, 30000);
        return () => clearInterval(interval);
    }, [fetchTimers]);

    // Tick every second to update elapsed time display
    useEffect(() => {
        const hasTimers = timers.length > 0;
        if (!hasTimers) return;
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [timers.length > 0]);

    const stopTimer = async (timer: ActiveTimeLog) => {
        try {
            await api.patch(`/tasks/${timer.task_id}/time-log/${timer.id}`, {
                ended_at: new Date().toISOString(),
            });
            toast({ title: 'Timer stopped', description: timer.task?.title });
            fetchTimers();
        } catch {
            toast({ title: 'Error', description: 'Failed to stop timer', variant: 'destructive' });
        }
    };

    const goToTask = (taskId: number) => {
        setOpen(false);
        navigate(`/tasks/${taskId}`);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    title="Active Timers"
                    className="relative text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                    <Timer className="h-5 w-5" />
                    {timers.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 text-[10px] font-bold text-white flex items-center justify-center">
                            {timers.length}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h3 className="font-semibold text-sm">Active Timers</h3>
                    {timers.length > 0 && (
                        <span className="text-xs text-muted-foreground">{timers.length} running</span>
                    )}
                </div>
                <ScrollArea className="max-h-80">
                    {timers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Timer className="h-8 w-8 mb-2 opacity-40" />
                            <p className="text-sm">No active timers</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {timers.map((timer) => (
                                <div key={timer.id} className="px-4 py-3 flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {timer.task?.title ?? `Task #${timer.task_id}`}
                                        </p>
                                        {timer.task?.project && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {timer.task.project.name}
                                            </p>
                                        )}
                                        <p className="text-lg font-mono font-bold text-green-600 mt-1">
                                            {formatElapsed(timer.started_at)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            title="Go to task"
                                            onClick={() => goToTask(timer.task_id)}
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive hover:text-destructive"
                                            title="Stop timer"
                                            onClick={() => stopTimer(timer)}
                                        >
                                            <Square className="h-3.5 w-3.5 fill-current" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
