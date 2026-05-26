
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { analyticsService, AnalyticsFilter } from '@/services/analyticsService';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Loader2, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface AnalyticsData {
    completion_analytics: any;
    completion_rate: any;
    completion_time: any;
    comparison: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function AdminAnalytics() {
    const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await analyticsService.getDashboard({ period });
                setData(result);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [period]);

    if (loading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) {
        return <div className="text-center text-muted-foreground">Failed to load analytics data.</div>;
    }

    const { completion_analytics, completion_rate, completion_time, comparison } = data;

    // Transform breakdown for charts
    const trendData = Object.entries(completion_analytics.breakdown || {}).map(([key, value]) => ({
        name: key,
        tasks: Number(value),
    }));

    const projectData = (completion_analytics.by_project || []).slice(0, 5);
    const userData = (completion_analytics.by_user || []).slice(0, 5);

    const trend = comparison?.comparison?.trend;
    const trendIcon = trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-500" /> :
        trend === 'down' ? <TrendingDown className="h-4 w-4 text-red-500" /> :
            <span className="text-muted-foreground">-</span>;

    const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';


    const NoDataMessage = ({ message }: { message: string }) => (
        <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground flex-col gap-2">
            <AlertCircle className="h-8 w-8 opacity-20" />
            <span className="text-sm">{message}</span>
        </div>
    );

    const stageData = completion_analytics.by_stage?.slice(0, 7) || [];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
                    <p className="text-muted-foreground">Detailed insights into task completion and performance.</p>
                </div>
                <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Completed */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completion_analytics.total_completed}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            {trendIcon}
                            <span className={trendColor}>
                                {Math.abs(comparison?.comparison?.percentage_change || 0)}%
                            </span>
                            from last {period}
                        </p>
                    </CardContent>
                </Card>

                {/* Completion Rate */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completion_rate.completion_rate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {completion_rate.completed_tasks} of {completion_rate.total_tasks} tasks
                        </p>
                    </CardContent>
                </Card>

                {/* Avg Completion Time */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completion_time.average_days} days</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            ~ {completion_time.average_hours} hours
                        </p>
                    </CardContent>
                </Card>

                {/* Pending Tasks (calculated from rate data) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completion_rate.pending_tasks}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tasks created in this {period}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Trend Chart */}
                {trendData.length > 0 && trendData.some(d => d.tasks > 0) && (
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Completion Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                        <Area type="monotone" dataKey="tasks" stroke="#8884d8" fillOpacity={1} fill="url(#colorTasks)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Completion by Project */}
                {projectData.length > 0 && (
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Top Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={projectData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="project_name" width={100} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value: number) => [value, 'Completed Tasks']}
                                            cursor={false}
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                        />
                                        <Bar dataKey="count" fill="#adfa1d" radius={[0, 4, 4, 0]}>
                                            {projectData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Top Users */}
                {userData.length > 0 && (
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Top Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={userData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="user_name" width={100} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value: number) => [value, 'Completed Tasks']}
                                            cursor={false}
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                        />
                                        <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                            {userData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tasks by Stage */}
                {stageData.length > 0 && (
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Tasks by Stage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stageData}>
                                        <XAxis dataKey="stage_name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            formatter={(value: number) => [value, 'Tasks']}
                                            cursor={false}
                                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                        />
                                        <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Show message if NO charts are visible */}
            {!((trendData.length > 0 && trendData.some(d => d.tasks > 0)) || projectData.length > 0 || userData.length > 0 || stageData.length > 0) && (
                <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground flex-col gap-2 border rounded-lg border-dashed">
                    <AlertCircle className="h-8 w-8 opacity-20" />
                    <span className="text-sm">Data not available for this period</span>
                </div>
            )}

        </div>
    );
}
