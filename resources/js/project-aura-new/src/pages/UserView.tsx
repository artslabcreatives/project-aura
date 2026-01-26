import { DashboardStats } from "@/components/DashboardStats";
import { Task } from "@/types/task";
import { Project } from "@/types/project";
import { projectService } from "@/services/projectService";
import { TaskCalendar } from "@/components/TaskCalendar";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";

import { taskService } from "@/services/taskService";

export default function UserView() {
	const { currentUser } = useUser();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [viewTask, setViewTask] = useState<Task | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

	useEffect(() => {
		const loadTasks = async () => {
			if (currentUser) {
				try {
					const [tasksData, projectsData] = await Promise.all([
						taskService.getAll(),
						projectService.getAll()
					]);

					// Filter out system stages
					const forbiddenStageTitles = ['pending', 'suggested', 'suggested task', 'archive', 'completed', 'complete'];
					const forbiddenStageIds = new Set<string>();
					projectsData.forEach((p: Project) => {
						p.stages.forEach(s => {
							if (forbiddenStageTitles.includes(s.title.toLowerCase().trim())) {
								forbiddenStageIds.add(s.id);
							}
						});
					});

					// Build set of archived project IDs
					const archivedProjectIds = new Set(
						projectsData.filter((p: Project) => p.isArchived).map((p: Project) => p.id)
					);

					const userTasks = tasksData.filter((task: Task) => {
						// Exclude tasks from archived projects
						if (task.projectId && archivedProjectIds.has(task.projectId)) return false;

						// Must be assigned to user
						const isAssigned =
							task.assignee === currentUser.name ||
							(task.assignedUsers && task.assignedUsers.some(u => String(u.id) === String(currentUser.id)));

						if (!isAssigned) return false;

						// Must not be in a forbidden stage
						if (task.projectStage && forbiddenStageIds.has(task.projectStage)) return false;

						return true;
					});

					setTasks(userTasks);
				} catch {
					setTasks([]);
				}
			}
		};
		loadTasks();
	}, [currentUser]);

	return (
		<div className="space-y-8 fade-in">
			{/* Hero Header with Gradient */}
			<div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-accent via-accent-light to-primary shadow-xl">
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
				<div className="relative z-10">
					<div className="flex items-center gap-3 mb-2">
						<div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
							<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
						</div>
						<div>
							<h1 className="text-4xl font-bold text-white tracking-tight">My Dashboard</h1>
							<p className="text-white/90 mt-1 text-lg">
								Welcome back, {currentUser?.name}! 👋
							</p>
						</div>
					</div>
				</div>
			</div>

			<DashboardStats tasks={tasks} />

			<div className="mt-8 mb-8">
				<div className="flex items-center gap-2 mb-4">
					<div className="h-8 w-1 bg-primary rounded-full"></div>
					<h3 className="text-xl font-bold text-foreground/80">Task Calendar</h3>
				</div>
				<TaskCalendar
					tasks={tasks}
					onViewTask={(task) => {
						setViewTask(task);
						setIsViewDialogOpen(true);
					}}
				/>
			</div>

			<TaskDetailsDialog
				task={viewTask}
				open={isViewDialogOpen}
				onOpenChange={setIsViewDialogOpen}
			/>
		</div >
	);
}
