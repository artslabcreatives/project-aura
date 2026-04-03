import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, TrendingUp, TrendingDown, Target } from 'lucide-react';
import api from '../lib/api';
import { UserEfficiency } from '../types/efficiency';

interface TaskEfficiencyDashboardProps {
	userId: number;
}

export function TaskEfficiencyDashboard({ userId }: TaskEfficiencyDashboardProps) {
	const [efficiency, setEfficiency] = useState<UserEfficiency | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchEfficiency = async () => {
			try {
				setLoading(true);
				const response = await api.get(`/api/users/${userId}/efficiency`);
				setEfficiency(response.data);
			} catch (error) {
				console.error('Failed to fetch efficiency data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchEfficiency();
	}, [userId]);

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Card key={i}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Loading...</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">-</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (!efficiency) {
		return <div>No efficiency data available</div>;
	}

	const getEfficiencyBadge = (efficiencyPercentage: number) => {
		if (efficiencyPercentage >= 100) {
			return <Badge className="bg-green-500">On Time</Badge>;
		} else if (efficiencyPercentage >= 80) {
			return <Badge className="bg-yellow-500">Nearly On Time</Badge>;
		} else {
			return <Badge variant="destructive">Delayed</Badge>;
		}
	};

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{efficiency.totalTasks}</div>
						<p className="text-xs text-muted-foreground">Tasks with logged time</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Hours Worked</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{efficiency.totalHoursWorked.toFixed(1)}h</div>
						<p className="text-xs text-muted-foreground">
							Est: {efficiency.totalHoursEstimated.toFixed(1)}h
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average Efficiency</CardTitle>
						{efficiency.averageEfficiency >= 100 ? (
							<TrendingUp className="h-4 w-4 text-green-500" />
						) : (
							<TrendingDown className="h-4 w-4 text-orange-500" />
						)}
					</CardHeader>
					<CardContent>
						<div
							className={`text-2xl font-bold ${
								efficiency.averageEfficiency >= 100 ? 'text-green-600' : 'text-orange-600'
							}`}
						>
							{efficiency.averageEfficiency.toFixed(1)}%
						</div>
						<p className="text-xs text-muted-foreground">
							{efficiency.averageEfficiency >= 100 ? 'Ahead of schedule' : 'Behind schedule'}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Time Variance</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{(efficiency.totalHoursEstimated - efficiency.totalHoursWorked).toFixed(1)}h
						</div>
						<p className="text-xs text-muted-foreground">
							{efficiency.totalHoursWorked < efficiency.totalHoursEstimated
								? 'Under estimated time'
								: 'Over estimated time'}
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Task Breakdown</CardTitle>
					<CardDescription>
						Efficiency metrics by task (without reassignment penalty)
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{efficiency.tasks.map((task) => (
							<div
								key={task.taskId}
								className="flex items-center justify-between border-b pb-4 last:border-0"
							>
								<div className="flex-1">
									<p className="font-medium">{task.taskName}</p>
									<p className="text-sm text-muted-foreground">{task.projectName}</p>
									<div className="flex gap-4 mt-1 text-xs text-muted-foreground">
										<span>Est: {task.estimatedHours}h</span>
										<span>Actual: {task.userHoursWorked}h</span>
									</div>
								</div>
								<div className="text-right flex items-center gap-2">
									<div>
										<p className="font-bold text-lg">
											{task.efficiencyPercentage.toFixed(1)}%
										</p>
									</div>
									{getEfficiencyBadge(task.efficiencyPercentage)}
								</div>
							</div>
						))}

						{efficiency.tasks.length === 0 && (
							<div className="text-center py-8 text-muted-foreground">
								No tasks with logged time yet
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Efficiency Explanation</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground space-y-2">
					<p>
						<strong>Efficiency</strong> is calculated as (estimated hours / actual hours worked) × 100%
					</p>
					<ul className="list-disc list-inside space-y-1">
						<li>
							<strong>&gt;100%</strong> means you completed tasks faster than estimated
						</li>
						<li>
							<strong>100%</strong> means you completed tasks exactly as estimated
						</li>
						<li>
							<strong>&lt;100%</strong> means tasks took longer than estimated
						</li>
					</ul>
					<p className="pt-2">
						<strong>Note:</strong> This tracking system only counts time you personally logged,
						so reassignments don't negatively impact your efficiency metrics.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
