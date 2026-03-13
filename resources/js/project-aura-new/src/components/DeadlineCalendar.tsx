import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday, parseISO } from 'date-fns';
import { Project } from '@/types/project';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface DeadlineCalendarProps {
    projects: Project[];
}

export function DeadlineCalendar({ projects }: DeadlineCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const navigate = useNavigate();

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const getProjectsForDate = (date: Date) => {
        return projects.filter(project =>
            project.deadline && isSameDay(parseISO(project.deadline), date)
        );
    };

    const selectedDateProjects = getProjectsForDate(selectedDate);

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[750px] lg:h-[650px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Left Side: Calendar View */}
            <div className="w-full lg:w-2/3 bg-card/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl flex flex-col h-full overflow-hidden">
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/20 shadow-inner">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="font-bold text-2xl tracking-tight">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={prevMonth}
                            className="rounded-lg hover:bg-white/5 border-white/10 h-9 w-9"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }}
                            className="font-medium px-4 h-9"
                        >
                            Today
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={nextMonth}
                            className="rounded-lg hover:bg-white/5 border-white/10 h-9 w-9"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 bg-muted/30">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                    {calendarDays.map((day, dayIdx) => {
                        const dayProjects = getProjectsForDate(day);
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isTodayDate = isToday(day);

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={cn(
                                    "min-h-[100px] p-3 border-b border-r border-white/5 relative cursor-pointer transition-all hover:bg-primary/5 group select-none flex flex-col items-center",
                                    !isCurrentMonth && "opacity-20",
                                    isSelected && "bg-primary/10 z-10 shadow-[inset_0_0_20px_rgba(var(--primary),0.05)]",
                                    dayIdx % 7 === 6 && "border-r-0"
                                )}
                            >
                                <span className={cn(
                                    "text-sm font-semibold h-8 w-8 flex items-center justify-center rounded-full transition-all group-hover:scale-110",
                                    isTodayDate ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "text-muted-foreground group-hover:text-foreground",
                                    isSelected && !isTodayDate && "ring-2 ring-primary/50 text-foreground"
                                )}>
                                    {format(day, 'd')}
                                </span>

                                {/* Project Indicator (Orange Underline) */}
                                {dayProjects.length > 0 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] animate-pulse" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Side: Details Panel */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full">
                <div className="bg-card/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/5 shrink-0">
                        <h3 className="font-bold text-xl tracking-tight">
                            {format(selectedDate, 'EEEE, MMMM do')}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">
                            {selectedDateProjects.length === 1 
                                ? '1 Project Deadline' 
                                : `${selectedDateProjects.length} Project Deadlines`}
                        </p>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-6">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">
                                Scheduled Deadlines
                            </div>
                            
                            {selectedDateProjects.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-2 border-dashed border-white/5 rounded-2xl bg-white/5">
                                    <CalendarIcon className="h-12 w-12 mb-4 opacity-10" />
                                    <p className="text-sm font-medium opacity-50">No deadlines scheduled for this day</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedDateProjects.map(project => (
                                        <div 
                                            key={project.id}
                                            onClick={() => navigate(`/project/${project.id}/overview`)}
                                            className="group relative p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all group-hover:w-1.5" />
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                                                        {project.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider py-0 px-2 h-5 border-white/10 bg-white/5 text-muted-foreground group-hover:text-foreground transition-colors">
                                                            {project.status || 'Active'}
                                                        </Badge>
                                                        {project.client?.company_name && (
                                                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                                                {project.client.company_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    
                    {/* Bottom Quick Action */}
                    <div className="p-6 mt-auto border-t border-white/5 bg-white/5">
                        <Button 
                            variant="secondary" 
                            className="w-full group font-bold"
                            onClick={() => navigate('/clients')} // Navigation to where internal projects can be seen too
                        >
                            <FolderKanban className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                            View All Projects
                        </Button>
                    </div>
                </div>
            </div>
        </div >
    );
}
