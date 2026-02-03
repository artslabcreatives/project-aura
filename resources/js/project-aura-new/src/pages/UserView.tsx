import { DashboardStats } from "@/components/DashboardStats";
import { Task } from "@/types/task";
import { Project } from "@/types/project";
import { projectService } from "@/services/projectService";
import { TaskCalendar } from "@/components/TaskCalendar";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";

import { taskService } from "@/services/taskService";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserView() {
	const { currentUser } = useUser();
	const [statsTasks, setStatsTasks] = useState<Task[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [viewTask, setViewTask] = useState<Task | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadTasks = async () => {
			if (currentUser) {
				setLoading(true);
				try {
					const [tasksData, projectsData] = await Promise.all([
						taskService.getAll(),
						projectService.getAll()
					]);
					setProjects(projectsData);

					// Helper to flatten tasks (recursive + unique)
					const flattenTasks = (taskList: Task[]): Task[] => {
						const flattened: Task[] = [];
						const seenIds = new Set<string>();

						const recurse = (items: Task[]) => {
							for (const item of items) {
								if (!seenIds.has(item.id)) {
									seenIds.add(item.id);
									flattened.push(item);
									if (item.subtasks && item.subtasks.length > 0) {
										recurse(item.subtasks);
									}
								}
							}
						};
						recurse(taskList);
						return flattened;
					};

					const allFlatTasks = flattenTasks(tasksData);

					// Filter out system stages for Active Tasks (Calendar)
					// Removed 'pending' so assigned pending tasks show in calendar
					const forbiddenStageTitles = ['suggested', 'suggested task', 'archive', 'completed', 'complete'];
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

					// Base Filter: Assigned to User & Not Archived Project
					const allAssignedTasks = allFlatTasks.filter((task: Task) => {
						// Exclude tasks from archived projects
						if (task.projectId && archivedProjectIds.has(task.projectId)) return false;

						// Must be assigned to user
						const isAssigned =
							task.assignee === currentUser.name ||
							(task.assignedUsers && task.assignedUsers.some(u => String(u.id) === String(currentUser.id)));

						if (!isAssigned) return false;

						return true;
					});

					// Stats should show ALL assigned tasks (including pending/completed)
					setStatsTasks(allAssignedTasks);

					// Calendar/List should show only "Active" tasks (excluding system stages/completed/pending if desires)
					const activeTasks = allAssignedTasks.filter((task: Task) => {
						if (task.projectStage && forbiddenStageIds.has(task.projectStage)) return false;
						return true;
					});

					setTasks(activeTasks);
				} catch {
					setTasks([]);
					setStatsTasks([]);
					setProjects([]);
				} finally {
					setLoading(false);
				}
			}
		};
		loadTasks();
	}, [currentUser]);

	const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
		// Update helper
		const updateTaskInList = (list: Task[]) => {
			return list.map(t => {
				if (t.id === taskId) return { ...t, ...updates };
				if (t.subtasks) {
					return { ...t, subtasks: updateTaskInList(t.subtasks) };
				}
				return t;
			});
		};

		setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
		setStatsTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
	};

	if (loading) {
		return (
			<div className="space-y-8 fade-in">
				{/* Hero Header Skeleton */}
				<div className="relative overflow-hidden rounded-2xl p-8 bg-background border shadow-sm">
					<div className="flex items-center gap-3 mb-2">
						<Skeleton className="h-12 w-12 rounded-xl" />
						<div className="space-y-2">
							<Skeleton className="h-8 w-64" />
							<Skeleton className="h-6 w-48" />
						</div>
					</div>
				</div>

				{/* Stats Skeleton */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map(i => (
						<div key={i} className="p-6 rounded-xl border bg-card">
							<Skeleton className="h-4 w-24 mb-2" />
							<Skeleton className="h-8 w-16" />
						</div>
					))}
				</div>

				<div className="mt-8 mb-8">
					<div className="flex items-center gap-2 mb-4">
						<div className="h-8 w-1 bg-primary rounded-full"></div>
						<Skeleton className="h-6 w-48" />
					</div>
					<div className="rounded-md border p-4 space-y-4">
						<div className="flex justify-between items-center mb-4">
							<Skeleton className="h-8 w-32" />
							<div className="flex gap-2">
								<Skeleton className="h-8 w-8" />
								<Skeleton className="h-8 w-8" />
							</div>
						</div>
						<div className="grid grid-cols-7 gap-4">
							{[...Array(35)].map((_, i) => (
								<Skeleton key={i} className="h-24 w-full rounded-md" />
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

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

			<DashboardStats tasks={statsTasks} projects={projects} />

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
					onTaskUpdate={handleTaskUpdate}
				/>
			</div>

			<TaskDetailsDialog
				task={viewTask}
				open={isViewDialogOpen}
				onOpenChange={setIsViewDialogOpen}
				onTaskUpdate={handleTaskUpdate}
			/>
		</div >
	);
}
