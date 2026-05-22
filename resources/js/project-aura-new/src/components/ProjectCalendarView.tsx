import { useState, useMemo } from 'react';
import { 
	format, 
	startOfMonth, 
	endOfMonth, 
	startOfWeek, 
	endOfWeek, 
	eachDayOfInterval, 
	isSameDay, 
	isSameMonth, 
	addMonths, 
	subMonths, 
	isToday,
	parseISO,
	isPast,
	startOfDay
} from 'date-fns';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { 
	ChevronLeft, 
	ChevronRight, 
	Calendar as CalendarIcon, 
	Plus,
	Search,
	User,
	Filter,
	Maximize2,
	Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectCalendarViewProps {
	tasks: Task[];
	onTaskClick?: (task: Task) => void;
	onAddTask?: (date: Date) => void;
}

export function ProjectCalendarView({ tasks, onTaskClick, onAddTask }: ProjectCalendarViewProps) {
	const [currentMonth, setCurrentMonth] = useState(new Date());

	const monthStart = startOfMonth(currentMonth);
	const monthEnd = endOfMonth(monthStart);
	const startDate = startOfWeek(monthStart);
	const endDate = endOfWeek(monthEnd);

	const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

	const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
	const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
	const goToToday = () => setCurrentMonth(new Date());

	const tasksByDate = useMemo(() => {
		const map: Record<string, Task[]> = {};
		tasks.forEach(task => {
			if (task.dueDate) {
				const dateKey = format(parseISO(task.dueDate), 'yyyy-MM-dd');
				if (!map[dateKey]) map[dateKey] = [];
				map[dateKey].push(task);
			}
		});
		return map;
	}, [tasks]);

	return (
		<div className="flex flex-col h-full bg-background rounded-xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Calendar Header / Toolbar */}
			<div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-b bg-muted/5">
				<div className="flex items-center gap-4">
					<div className="flex items-center bg-muted/50 rounded-lg p-1 border">
						<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={prevMonth}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<div className="px-4 py-1 text-sm font-bold min-w-[140px] text-center">
							{format(currentMonth, 'MMMM yyyy')}
						</div>
						<Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={nextMonth}>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
					<Button variant="outline" size="sm" className="h-8 font-bold text-[10px] uppercase tracking-wider" onClick={goToToday}>
						Today
					</Button>
				</div>

				<div className="flex items-center gap-2">
					<div className="relative group">
						<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
						<input 
							type="text" 
							placeholder="Search calendar..." 
							className="h-8 w-[180px] pl-8 pr-3 text-[10px] rounded-lg bg-muted/50 border border-transparent focus:border-primary/30 focus:bg-background outline-none transition-all"
						/>
					</div>
					<Button variant="outline" size="sm" className="h-8 gap-1.5 text-[10px] font-bold uppercase">
						<User className="h-3.5 w-3.5" /> Assignee
					</Button>
					<Button variant="outline" size="sm" className="h-8 gap-1.5 text-[10px] font-bold uppercase">
						<Filter className="h-3.5 w-3.5" /> Status
					</Button>
				</div>
			</div>

			{/* Calendar Grid Header */}
			<div className="grid grid-cols-7 border-b bg-muted/20">
				{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
					<div key={day} className="py-2 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
						{day}
					</div>
				))}
			</div>

			{/* Calendar Grid Content */}
			<div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto custom-scrollbar">
				{calendarDays.map((day, idx) => {
					const dateKey = format(day, 'yyyy-MM-dd');
					const dayTasks = tasksByDate[dateKey] || [];
					const isCurrentMonth = isSameMonth(day, currentMonth);
					const isTodayDate = isToday(day);
					const isWeekend = day.getDay() === 0 || day.getDay() === 6;

					return (
						<div
							key={dateKey}
							className={cn(
								"min-h-[120px] p-2 border-b border-r border-border/40 group relative flex flex-col gap-1 transition-colors hover:bg-muted/5",
								!isCurrentMonth && "bg-muted/20 opacity-40",
								isWeekend && isCurrentMonth && "bg-muted/5"
							)}
						>
							<div className="flex justify-between items-center mb-1">
								<span className={cn(
									"text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full transition-all",
									isTodayDate ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : "text-muted-foreground group-hover:text-foreground",
								)}>
									{format(day, 'd')}
								</span>
								<button 
									onClick={() => onAddTask?.(day)}
									className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 hover:text-primary rounded-md transition-all"
								>
									<Plus className="h-3 w-3" />
								</button>
							</div>

							<div className="flex flex-col gap-1 flex-1 overflow-hidden pb-6">
								{dayTasks.slice(0, 3).map(task => (
									<TooltipProvider key={task.id}>
										<Tooltip>
											<TooltipTrigger asChild>
												<div 
													onClick={() => onTaskClick?.(task)}
													className={cn(
														"px-2 py-1 rounded-md text-[9px] font-bold truncate cursor-pointer transition-all hover:brightness-95 active:scale-95 border-l-2",
														task.priority === 'high' ? "bg-rose-500/10 text-rose-600 border-rose-500" :
														task.priority === 'medium' ? "bg-amber-500/10 text-amber-600 border-amber-500" :
														"bg-indigo-500/10 text-indigo-600 border-indigo-500",
														task.userStatus === 'complete' && "opacity-50 line-through grayscale"
													)}
												>
													{task.title}
												</div>
											</TooltipTrigger>
											<TooltipContent side="top" className="p-3 w-64 rounded-xl shadow-2xl">
												<div className="space-y-2">
													<div className="flex justify-between items-start gap-4">
														<p className="text-xs font-bold leading-tight">{task.title}</p>
														<Badge className={cn(
															"text-[8px] h-4 uppercase font-black",
															task.priority === 'high' ? "bg-rose-500" :
															task.priority === 'medium' ? "bg-amber-500" : "bg-indigo-500"
														)}>
															{task.priority}
														</Badge>
													</div>
													<div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
														<Clock className="h-3 w-3" />
														Due: {format(parseISO(task.dueDate!), 'HH:mm')}
													</div>
													<div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
														<User className="h-3 w-3" />
														{task.assignee}
													</div>
												</div>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								))}
								{dayTasks.length > 3 && (
									<button 
										className="text-[9px] font-bold text-muted-foreground hover:text-primary px-2 transition-colors text-left"
										onClick={() => onAddTask?.(day)} // Or a better view more action
									>
										+ {dayTasks.length - 3} more
									</button>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
