import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Package, Clock, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { ExportButtons } from './ExportButtons';

interface TaskBreakdown {
	task_id: number;
	task_name: string;
	estimated_hours: number;
	actual_hours: number;
	hourly_rate: number;
	estimated_cost: number;
	actual_cost: number;
	variance: number;
	efficiency_percentage: number;
}

interface ProjectProfitabilityData {
	project_id: number;
	project_name: string;
	profitability: {
		revenue: number;
		cost: number;
		profit: number;
		profit_margin_percentage: number;
	};
	task_breakdown: TaskBreakdown[];
}

interface ProjectProfitabilityProps {
	projectId: number;
}

export function ProjectProfitability({ projectId }: ProjectProfitabilityProps) {
	const [data, setData] = useState<ProjectProfitabilityData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProfitability = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = await api.get(`/api/projects/${projectId}/profitability`);
				setData(response.data);
			} catch (err: any) {
				console.error('Failed to fetch profitability:', err);
				setError(err.response?.data?.message || 'Failed to load profitability data');
			} finally {
				setLoading(false);
			}
		};

		fetchProfitability();
	}, [projectId]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Project Profitability</CardTitle>
					<CardDescription>Loading profitability data...</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-4">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-8 w-24" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	if (!data) {
		return null;
	}

	const { profitability, task_breakdown } = data;
	const isProfit = profitability.profit >= 0;

	return (
		<Card className="border-none shadow-md">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<DollarSign className="h-5 w-5 text-primary" />
							Project Profitability
						</CardTitle>
						<CardDescription>Financial overview and task cost breakdown</CardDescription>
					</div>
					<ExportButtons type="project-profitability" id={projectId} />
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Summary Cards */}
				<div className="grid gap-4 md:grid-cols-4">
					<div className="space-y-1">
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
							<Package className="h-3 w-3" />
							Revenue
						</p>
						<p className="text-2xl font-bold">{formatCurrency(profitability.revenue)}</p>
						<p className="text-xs text-muted-foreground">From estimate</p>
					</div>

					<div className="space-y-1">
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
							<Clock className="h-3 w-3" />
							Cost
						</p>
						<p className="text-2xl font-bold">{formatCurrency(profitability.cost)}</p>
						<p className="text-xs text-muted-foreground">Actual hours worked</p>
					</div>

					<div className="space-y-1">
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
							{isProfit ? (
								<TrendingUp className="h-3 w-3 text-green-500" />
							) : (
								<TrendingDown className="h-3 w-3 text-red-500" />
							)}
							Profit
						</p>
						<p className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
							{formatCurrency(profitability.profit)}
						</p>
						<p className="text-xs text-muted-foreground">
							{profitability.profit_margin_percentage.toFixed(2)}% margin
						</p>
					</div>

					<div className="space-y-1">
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
						<Badge
							variant={isProfit ? 'default' : 'destructive'}
							className={`text-sm font-bold ${isProfit ? 'bg-green-500 hover:bg-green-600' : ''}`}
						>
							{isProfit ? 'Profitable' : 'Over Budget'}
						</Badge>
					</div>
				</div>

				{/* Task Breakdown */}
				{task_breakdown && task_breakdown.length > 0 && (
					<div className="space-y-3">
						<h3 className="text-sm font-semibold">Task Cost Breakdown</h3>
						<div className="space-y-2">
							{task_breakdown.map((task) => (
								<div
									key={task.task_id}
									className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
								>
									<div className="flex-1">
										<p className="font-medium text-sm">{task.task_name}</p>
										<div className="flex gap-4 text-xs text-muted-foreground mt-1">
											<span>Est: {task.estimated_hours}h</span>
											<span>Actual: {task.actual_hours}h</span>
											<span>Rate: {formatCurrency(task.hourly_rate)}/h</span>
										</div>
									</div>
									<div className="text-right space-y-1">
										<div className="flex items-center gap-2">
											<span className="text-sm font-bold">
												{formatCurrency(task.actual_cost)}
											</span>
											<Badge
												variant="outline"
												className={`text-xs ${
													task.variance >= 0
														? 'border-green-500/50 bg-green-500/10 text-green-700'
														: 'border-red-500/50 bg-red-500/10 text-red-700'
												}`}
											>
												{task.variance >= 0 ? '+' : ''}
												{formatCurrency(task.variance)}
											</Badge>
										</div>
										<p className="text-xs text-muted-foreground">
											{task.efficiency_percentage.toFixed(0)}% efficient
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{(!task_breakdown || task_breakdown.length === 0) && (
					<div className="text-center py-6 text-muted-foreground">
						<Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
						<p className="text-sm">No tasks with cost tracking yet</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
