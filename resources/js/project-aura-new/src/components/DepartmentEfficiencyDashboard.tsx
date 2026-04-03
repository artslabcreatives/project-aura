import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Clock, Target, TrendingUp, Users } from 'lucide-react';
import { DepartmentEfficiency } from '@/types/efficiency';
import { efficiencyService } from '@/services/efficiencyService';

interface DepartmentEfficiencyDashboardProps {
	departmentId: string;
}

export function DepartmentEfficiencyDashboard({ departmentId }: DepartmentEfficiencyDashboardProps) {
	const [efficiency, setEfficiency] = useState<DepartmentEfficiency | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchEfficiency = async () => {
			try {
				setLoading(true);
				const response = await efficiencyService.getDepartmentEfficiency(departmentId);
				setEfficiency(response);
			} catch (error) {
				console.error('Failed to fetch department efficiency data:', error);
				setEfficiency(null);
			} finally {
				setLoading(false);
			}
		};

		void fetchEfficiency();
	}, [departmentId]);

	const getEfficiencyBadge = (efficiencyPercentage: number) => {
		if (efficiencyPercentage >= 100) {
			return <Badge className="bg-green-500">On Time</Badge>;
		}

		if (efficiencyPercentage >= 80) {
			return <Badge className="bg-yellow-500">Nearly On Time</Badge>;
		}

		return <Badge variant="destructive">Delayed</Badge>;
	};

	if (loading) {
		return (
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
		);
	}

	if (!efficiency) {
		return <div>No department efficiency data available</div>;
	}

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tracked Users</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{efficiency.totalUsers}</div>
						<p className="text-xs text-muted-foreground">Team members in this department</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
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
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{efficiency.averageEfficiency.toFixed(1)}%</div>
						<p className="text-xs text-muted-foreground">Based on logged department time</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Department Breakdown</CardTitle>
					<CardDescription>Efficiency metrics for each tracked team member</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{efficiency.users.map((user) => (
							<div
								key={user.userId}
								className="flex items-center justify-between border-b pb-4 last:border-0"
							>
								<div>
									<p className="font-medium">{user.userName}</p>
									<p className="text-sm text-muted-foreground">
										{user.tasksCompleted} completed tasks with logged time
									</p>
								</div>
								<div className="flex items-center gap-2 text-right">
									<div>
										<p className="font-bold text-lg">{user.efficiency.toFixed(1)}%</p>
									</div>
									{getEfficiencyBadge(user.efficiency)}
								</div>
							</div>
						))}

						{efficiency.users.length === 0 && (
							<div className="text-center py-8 text-muted-foreground">
								No department efficiency data available yet
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
