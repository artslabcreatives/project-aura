import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday, isPast, isSameWeek } from 'date-fns';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { TaskCard } from '@/components/TaskCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskCalendarProps {
    tasks: Task[];
    onViewTask?: (task: Task) => void;
}

export function TaskCalendar({ tasks, onViewTask }: TaskCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filter, setFilter] = useState<'today' | 'week' | 'overdue' | 'custom'>('today');

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Filter tasks
    const getTasksForDate = (date: Date) => {
        return tasks.filter(task =>
            task.dueDate && isSameDay(new Date(task.dueDate), date) && task.userStatus !== 'complete'
        );
    };

    const selectedDateTasks = getTasksForDate(selectedDate);

    // Global overdue tasks (not just for selected date, but all overdue tasks that are incomplete)
    // "if have overdue task show it also" - typically implies showing ALL overdue items as a priority list
    const overdueTasks = tasks.filter(task =>
        task.dueDate &&
        isPast(new Date(task.dueDate)) &&
        !isToday(new Date(task.dueDate)) &&
        task.userStatus !== 'complete'
    );

    const weekTasks = tasks.filter(task =>
        task.dueDate &&
        isSameWeek(new Date(task.dueDate), new Date()) &&
        task.userStatus !== 'complete'
    ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

    let listTasks = selectedDateTasks;
    let listTitle: React.ReactNode = format(selectedDate, 'EEEE, MMMM do');

    if (filter === 'overdue') {
        listTasks = overdueTasks;
        listTitle = "Overdue Tasks";
    } else if (filter === 'week') {
        listTasks = weekTasks;
        listTitle = "This Week";
    } else if (filter === 'today' && isToday(selectedDate)) {
        listTitle = <>{format(selectedDate, 'EEEE, MMMM do')} <Badge className="ml-2">Today</Badge></>;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[750px] lg:h-[600px]">
            {/* Left Side: Calendar View */}
            <div className="w-full lg:w-2/3 bg-card rounded-xl border shadow-sm flex flex-col h-full">
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="font-bold text-lg">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="outline" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); setFilter('today'); }}>
                            Today
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 border-b bg-muted/40">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-muted/20">
                    {calendarDays.map((day, dayIdx) => {
                        const dayTasks = getTasksForDate(day);
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isTodayDate = isToday(day);

                        // Calculate visual indicators
                        const hasHighPriority = dayTasks.some(t => t.priority === 'high');
                        const hasMediumPriority = dayTasks.some(t => t.priority === 'medium');

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => {
                                    setSelectedDate(day);
                                    setFilter(isToday(day) ? 'today' : 'custom');
                                }}
                                className={cn(
                                    "min-h-[80px] p-2 border-b border-r bg-card relative cursor-pointer transition-all hover:bg-accent/50 group select-none flex flex-col justify-between",
                                    !isCurrentMonth && "bg-muted/30 text-muted-foreground/50",
                                    isSelected && "ring-2 ring-primary ring-inset z-10 bg-primary/5",
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full transition-colors",
                                        isTodayDate ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground group-hover:text-foreground",
                                        isSelected && !isTodayDate && "bg-primary/20 text-primary"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                {/* Task Dots/Indicators */}
                                <div className="flex gap-1 flex-wrap content-end">
                                    {dayTasks.length > 0 && (
                                        <div className="flex gap-1 w-full">
                                            {dayTasks.slice(0, 4).map((task, i) => (
                                                <div
                                                    key={task.id}
                                                    className={cn(
                                                        "h-1.5 flex-1 rounded-full",
                                                        task.priority === 'high' ? "bg-red-500" :
                                                            task.priority === 'medium' ? "bg-amber-500" :
                                                                "bg-blue-500"
                                                    )}
                                                />
                                            ))}
                                            {dayTasks.length > 4 && (
                                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Side: Task List */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full">

                {/* Header for Selected Date */}
                <div className="bg-card rounded-xl border shadow-sm flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b bg-muted/10 shrink-0">
                        <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                {listTitle}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {listTasks.length} tasks
                            </p>
                        </div>
                        <Select
                            value={filter}
                            onValueChange={(v: any) => {
                                setFilter(v);
                                if (v === 'today') setSelectedDate(new Date());
                            }}
                        >
                            <SelectTrigger className="w-[130px] h-8 bg-background">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                                {filter === 'custom' && <SelectItem value="custom" disabled className="hidden">Custom Date</SelectItem>}
                            </SelectContent>
                        </Select>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-6">

                            {/* Overdue Section (Visible only if NOT in overdue mode) */}
                            {filter !== 'overdue' && overdueTasks.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-destructive font-semibold text-sm uppercase tracking-wide">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Overdue Tasks ({overdueTasks.length})</span>
                                    </div>
                                    <div className="space-y-3 pl-1">
                                        {overdueTasks.map(task => (
                                            <div key={task.id} className="scale-95 origin-left opacity-90 hover:opacity-100 hover:scale-100 transition-all">
                                                <TaskCard
                                                    task={task}
                                                    onDragStart={() => { }}
                                                    onEdit={() => { }}
                                                    onDelete={() => { }}
                                                    onView={() => onViewTask?.(task)}
                                                    canManage={false}
                                                    canDrag={false}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-b my-4 opacity-50" />
                                </div>
                            )}

                            {/* Main Task List */}
                            <div className="space-y-3">
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                    {filter === 'overdue' ? 'Overdue Items' :
                                        filter === 'week' ? 'Tasks for this week' :
                                            'Scheduled Tasks'}
                                </div>
                                {listTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                                        <CalendarIcon className="h-10 w-10 mb-2 opacity-20" />
                                        <p>
                                            {filter === 'overdue' ? 'No overdue tasks' :
                                                filter === 'week' ? 'No tasks this week' :
                                                    'No tasks scheduled for this day'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {listTasks.map(task => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                onDragStart={() => { }}
                                                onEdit={() => { }}
                                                onDelete={() => { }}
                                                onView={() => onViewTask?.(task)}
                                                canManage={false}
                                                canDrag={false}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div >
    );
}
