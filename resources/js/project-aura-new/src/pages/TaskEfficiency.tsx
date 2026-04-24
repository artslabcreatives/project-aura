import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskEfficiencyDashboard } from "@/components/TaskEfficiencyDashboard";
import { TrendingUp, BarChart3, Clock } from "lucide-react";

export default function TaskEfficiency() {
	const { currentUser } = useUser();

	if (!currentUser) return null;

	return (
		<div className="space-y-6 fade-in">
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="p-3 rounded-xl bg-primary/10 text-primary">
					<TrendingUp className="h-8 w-8" />
				</div>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Task Efficiency</h1>
					<p className="text-muted-foreground">Monitor your performance metrics and task completion efficiency</p>
				</div>
			</div>

			{/* Main Dashboard */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5 text-primary" />
						Efficiency Metrics
					</CardTitle>
					<CardDescription>
						Track how efficiently you're completing tasks based on estimated vs actual time
					</CardDescription>
				</CardHeader>
				<CardContent>
					<TaskEfficiencyDashboard userId={currentUser.id} />
				</CardContent>
			</Card>

			{/* Info Card */}
			<Card className="bg-muted/50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Clock className="h-5 w-5 text-muted-foreground" />
						How Efficiency is Calculated
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					<p>
						<strong>Efficiency Score:</strong> (Estimated Hours / Actual Hours) × 100
					</p>
					<p>
						• <strong>Above 100%:</strong> Tasks completed faster than estimated
					</p>
					<p>
						• <strong>Around 100%:</strong> Tasks completed on time
					</p>
					<p>
						• <strong>Below 100%:</strong> Tasks taking longer than estimated
					</p>
					<p className="mt-4 text-xs">
						Note: Only time logged by you is counted, so task reassignments don't affect your metrics.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
