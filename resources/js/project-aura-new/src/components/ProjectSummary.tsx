import { useMemo } from "react";
import { Task } from "@/types/task";
import { Project } from "@/types/project";
import { 
	Card, 
	CardContent, 
	CardHeader, 
	CardTitle,
	CardDescription
} from "@/components/ui/card";
import { 
	CheckCircle2, 
	Clock, 
	PlusCircle, 
	AlertCircle,
	ArrowUpRight,
	Calendar as CalendarIcon,
	TrendingUp,
	Activity,
	BarChart3,
	PieChart as PieChartIcon
} from "lucide-react";
import { 
	PieChart, 
	Pie, 
	Cell, 
	ResponsiveContainer, 
	Tooltip, 
	BarChart, 
	Bar, 
	XAxis, 
	YAxis, 
	CartesianGrid,
	Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { format, subDays, isAfter, parseISO } from "date-fns";

const getHexColor = (colorClass: string) => {
	const mapping: Record<string, string> = {
		'bg-blue-500': '#3b82f6',
		'bg-emerald-500': '#10b981',
		'bg-amber-500': '#f59e0b',
		'bg-rose-500': '#f43f5e',
		'bg-indigo-500': '#6366f1',
		'bg-purple-500': '#8b5cf6',
		'bg-pink-500': '#ec4899',
		'bg-teal-500': '#14b8a6',
		'bg-slate-500': '#64748b',
		'bg-red-500': '#ef4444',
		'bg-orange-500': '#f97316',
		'bg-yellow-500': '#eab308',
		'bg-green-500': '#22c55e',
		'bg-cyan-500': '#06b6d4',
		'bg-sky-500': '#0ea5e9',
		'bg-violet-500': '#8b5cf6',
		'bg-fuchsia-500': '#d946ef',
	};
	if (!colorClass) return '#6366f1';
	if (colorClass.startsWith('#')) return colorClass;
	const cleanClass = colorClass.split(' ').find(c => c.startsWith('bg-')) || colorClass.split(' ')[0];
	return mapping[cleanClass] || '#6366f1';
};

interface ProjectSummaryProps {
	project: Project;
	tasks: Task[];
}

export function ProjectSummary({ project, tasks }: ProjectSummaryProps) {
	const last7Days = useMemo(() => subDays(new Date(), 7), []);

	const stats = useMemo(() => {
		const completed = tasks.filter(t => t.completedAt && isAfter(parseISO(t.completedAt), last7Days)).length;
		const created = tasks.filter(t => isAfter(parseISO(t.createdAt), last7Days)).length;
		const updated = tasks.filter(t => {
			return isAfter(parseISO(t.createdAt), last7Days) || (t.completedAt && isAfter(parseISO(t.completedAt), last7Days));
		}).length;
		
		const now = new Date();
		const threeDaysFromNow = new Date();
		threeDaysFromNow.setDate(now.getDate() + 3);
		
		const dueSoon = tasks.filter(t => 
			t.userStatus !== 'complete' && 
			t.dueDate && 
			isAfter(parseISO(t.dueDate), now) && 
			!isAfter(parseISO(t.dueDate), threeDaysFromNow)
		).length;

		return { completed, created, updated, dueSoon };
	}, [tasks, last7Days]);

	const statusData = useMemo(() => {
		const stages = project.stages;
		const data = stages.map(stage => ({
			name: stage.title,
			value: tasks.filter(t => t.projectStage === stage.id).length,
			color: getHexColor(stage.color)
		})).filter(d => d.value > 0);

		if (data.length === 0) return [{ name: "No Tasks", value: 1, color: "#94a3b8" }];
		return data;
	}, [project, tasks]);

	const priorityData = useMemo(() => {
		const priorities = ["low", "medium", "high"];
		return priorities.map(p => ({
			name: p.charAt(0).toUpperCase() + p.slice(1),
			value: tasks.filter(t => t.priority === p).length,
			color: p === 'high' ? '#ef4444' : p === 'medium' ? '#f59e0b' : '#10b981'
		}));
	}, [tasks]);

	const recentActivity = useMemo(() => {
		const activity: any[] = [];
		tasks.forEach(t => {
			if (t.completedAt) {
				activity.push({
					id: `${t.id}-completed`,
					user: t.assignee,
					action: "completed task",
					task: t.title,
					taskId: t.id,
					date: parseISO(t.completedAt)
				});
			}
			activity.push({
				id: `${t.id}-created`,
				user: "System",
				action: "created task",
				task: t.title,
				taskId: t.id,
				date: parseISO(t.createdAt)
			});
		});

		return activity.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
	}, [tasks]);

	const workDistributionData = useMemo(() => {
		const tagsCount: Record<string, number> = {};
		tasks.forEach(t => {
			if (t.tags && t.tags.length > 0) {
				t.tags.forEach(tag => {
					tagsCount[tag] = (tagsCount[tag] || 0) + 1;
				});
			} else {
				const stageName = project.stages.find(s => s.id === t.projectStage)?.title || "Other";
				tagsCount[stageName] = (tagsCount[stageName] || 0) + 1;
			}
		});

		const data = Object.entries(tagsCount).map(([name, value]) => ({ name, value }));
		return data.sort((a, b) => b.value - a.value).slice(0, 5);
	}, [tasks, project.stages]);

	const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
			{/* Top Row: Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div className="p-2 bg-emerald-500/10 rounded-lg">
								<CheckCircle2 className="h-5 w-5 text-emerald-500" />
							</div>
							<Badge variant="outline" className="text-[10px] bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
								Last 7 days
							</Badge>
						</div>
						<div className="mt-4">
							<h3 className="text-2xl font-bold tracking-tight">{stats.completed}</h3>
							<p className="text-xs text-muted-foreground font-medium">Work items completed</p>
						</div>
					</CardContent>
				</Card>

				<Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div className="p-2 bg-blue-500/10 rounded-lg">
								<Activity className="h-5 w-5 text-blue-500" />
							</div>
							<Badge variant="outline" className="text-[10px] bg-blue-500/5 text-blue-600 border-blue-500/20">
								Last 7 days
							</Badge>
						</div>
						<div className="mt-4">
							<h3 className="text-2xl font-bold tracking-tight">{stats.updated}</h3>
							<p className="text-xs text-muted-foreground font-medium">Work items updated</p>
						</div>
					</CardContent>
				</Card>

				<Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div className="p-2 bg-indigo-500/10 rounded-lg">
								<PlusCircle className="h-5 w-5 text-indigo-500" />
							</div>
							<Badge variant="outline" className="text-[10px] bg-indigo-500/5 text-indigo-600 border-indigo-500/20">
								Last 7 days
							</Badge>
						</div>
						<div className="mt-4">
							<h3 className="text-2xl font-bold tracking-tight">{stats.created}</h3>
							<p className="text-xs text-muted-foreground font-medium">Work items created</p>
						</div>
					</CardContent>
				</Card>

				<Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div className="p-2 bg-amber-500/10 rounded-lg">
								<Clock className="h-5 w-5 text-amber-500" />
							</div>
							<Badge variant="outline" className="text-[10px] bg-amber-500/5 text-amber-600 border-amber-500/20">
								Next 3 days
							</Badge>
						</div>
						<div className="mt-4">
							<h3 className="text-2xl font-bold tracking-tight">{stats.dueSoon}</h3>
							<p className="text-xs text-muted-foreground font-medium">Work items due soon</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Middle Row: Charts & Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-semibold flex items-center gap-2">
								<BarChart3 className="h-4 w-4 text-primary" />
								Status Overview
							</CardTitle>
							<button className="text-[10px] text-primary font-bold uppercase hover:underline">
								View all items
							</button>
						</div>
						<CardDescription className="text-[10px]">Snapshot of task distribution across stages</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[250px] flex items-center">
							<div className="flex-1 h-full">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={statusData}
											cx="50%"
											cy="50%"
											innerRadius={60}
											outerRadius={80}
											paddingAngle={5}
											dataKey="value"
										>
											{statusData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.color} />
											))}
										</Pie>
										<Tooltip 
											contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
							<div className="flex-1 space-y-2">
								<div className="text-center mb-4">
									<div className="text-3xl font-black">{tasks.length}</div>
									<div className="text-[10px] text-muted-foreground uppercase font-bold">Total items</div>
								</div>
								<div className="grid grid-cols-1 gap-2">
									{statusData.slice(0, 4).map((entry, index) => (
										<div key={index} className="flex items-center gap-2">
											<div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
											<span className="text-[10px] font-medium truncate flex-1">{entry.name}</span>
											<span className="text-[10px] font-bold text-muted-foreground">{entry.value}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-semibold flex items-center gap-2">
								<TrendingUp className="h-4 w-4 text-primary" />
								Recent Activity
							</CardTitle>
						</div>
						<CardDescription className="text-[10px]">Stay updated with the latest movements</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
							{recentActivity.length > 0 ? (
								recentActivity.map((item) => (
									<div key={item.id} className="flex gap-3 relative pb-4 last:pb-0">
										<div className="absolute left-[13px] top-7 bottom-0 w-[1px] bg-border last:hidden" />
										<div className={cn(
											"w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-bold text-white shadow-sm",
											item.action.includes('completed') ? "bg-emerald-500" : "bg-indigo-500"
										)}>
											{item.user.charAt(0)}
										</div>
										<div className="space-y-1">
											<p className="text-[11px] leading-tight">
												<span className="font-bold">{item.user}</span>
												{" "}{item.action}{" "}
												<span className="font-semibold text-primary">{item.task}</span>
											</p>
											<p className="text-[9px] text-muted-foreground">
												{format(item.date, "EEEE, MMM d, yyyy")}
											</p>
										</div>
									</div>
								))
							) : (
								<div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
									<Activity className="h-8 w-8 opacity-20 mb-2" />
									<p className="text-xs">No recent activity recorded</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Bottom Row: Distribution Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="text-sm font-semibold flex items-center gap-2">
							<Activity className="h-4 w-4 text-primary" />
							Priority Breakdown
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-[200px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={priorityData} layout="vertical">
									<CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
									<XAxis type="number" hide />
									<YAxis 
										dataKey="name" 
										type="category" 
										axisLine={false} 
										tickLine={false} 
										tick={{ fontSize: 10, fontWeight: 500 }} 
									/>
									<Tooltip 
										cursor={{ fill: 'transparent' }}
										contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
									/>
									<Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
										{priorityData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="text-sm font-semibold flex items-center gap-2">
							<PieChartIcon className="h-4 w-4 text-primary" />
							Types of Work
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-[200px]">
							{workDistributionData.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={workDistributionData}
											cx="50%"
											cy="50%"
											outerRadius={60}
											dataKey="value"
											label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
											labelLine={false}
										>
											{workDistributionData.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
											))}
										</Pie>
										<Tooltip 
											contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
										/>
									</PieChart>
								</ResponsiveContainer>
							) : (
								<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
									<PieChartIcon className="h-8 w-8 opacity-20 mb-2" />
									<p className="text-xs">No tag data available</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "outline" }) {
	return (
		<span className={cn(
			"px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
			variant === "outline" ? "border" : "bg-primary text-primary-foreground",
			className
		)}>
			{children}
		</span>
	);
}
