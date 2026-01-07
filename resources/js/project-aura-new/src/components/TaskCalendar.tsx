import { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TaskCalendarProps {
    tasks: Task[];
}

export function TaskCalendar({ tasks }: TaskCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

    // Helper to get tasks for a date
    const getTasksForDate = (date: Date) => {
        return tasks.filter(task =>
            task.dueDate && isSameDay(new Date(task.dueDate), date) && task.userStatus !== 'complete'
        );
    };

    return (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-card">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                    <Badge variant="outline" className="font-normal text-xs">
                        Week View
                    </Badge>
                </h2>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={prevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b bg-muted/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 bg-muted/20">
                {days.map((day, dayIdx) => {
                    const dayTasks = getTasksForDate(day);
                    const isTodayDate = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "min-h-[120px] p-2 border-b border-r bg-card transition-colors hover:bg-muted/10 flex flex-col gap-1",
                                isTodayDate && "bg-primary/5"
                            )}
                        >
                            <div className={cn(
                                "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ml-auto mb-1",
                                isTodayDate ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                            )}>
                                {format(day, 'd')}
                            </div>

                            <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[100px] scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted">
                                {dayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={cn(
                                            "text-[10px] p-1.5 rounded border shadow-sm truncate transition-all cursor-help select-none",
                                            task.priority === 'high' ? "bg-destructive/10 border-destructive/20 text-destructive-foreground dark:text-red-300" :
                                                task.priority === 'medium' ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-100" :
                                                    "bg-secondary/20 border-secondary/30"
                                        )}
                                        title={`${task.title} (${task.priority})`}
                                    >
                                        <span className="font-medium">{task.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
