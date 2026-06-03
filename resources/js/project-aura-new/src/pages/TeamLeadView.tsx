import { DashboardStats } from "@/components/DashboardStats";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { useEffect, useState, useMemo } from "react";
import { Task, User } from "@/types/task";
import { Project } from "@/types/project";
import { useUser } from "@/hooks/use-user";
import { TaskCalendar } from "@/components/TaskCalendar";

import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { userService } from "@/services/userService";
import { departmentService } from "@/services/departmentService";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingTour, useOnboardingTour } from "@/components/OnboardingTour";
import { teamLeadTourSteps } from "@/components/tourSteps";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function TeamLeadView() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [teamMembers, setTeamMembers] = useState<User[]>([]);
	const [viewTask, setViewTask] = useState<Task | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const { currentUser } = useUser();
	const [loading, setLoading] = useState(true);

	// Onboarding tour
	const tourId = `team_lead_dashboard_tour_${currentUser?.id}`;
	// @ts-ignore
	const { isOpen: isTourOpen, startTour, endTour, autoStart, hasCompleted } = useOnboardingTour(tourId);

	// Auto-start tour on first visit
	useEffect(() => {
		if (!loading && currentUser && currentUser.hasSeenWelcomeVideo) {
			autoStart();
		}
	}, [loading, currentUser, autoStart]);

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			try {
				const [tasksData, projectsData, teamMembersData] = await Promise.all([
					taskService.getAll(),
					projectService.getAll(),
					userService.getAll(),
				]);
				setTasks(tasksData);
				setProjects(projectsData);
				setTeamMembers(teamMembersData);
			} catch (error) {
				setTasks([]);
				setProjects([]);
				setTeamMembers([]);
				// Optionally show a toast or error message
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, []);

	// Filter tasks by department
	const departmentTasks = useMemo(() => {
		if (!currentUser) return tasks;

		// Get team members from current user's department
		const departmentMembers = teamMembers
			.filter(member => member.department === currentUser.department)
			.map(member => member.name);

		// Filter tasks assigned to department members or projects in their department
		return tasks.filter(task => {
			// Include if task is assigned to someone in their department
			const isAssignedToDepartment = departmentMembers.includes(task.assignee);

			// Include if task's project belongs to their department
			const taskProject = projects.find(p => p.name === task.project);
			const isProjectInDepartment = taskProject?.department?.id === currentUser.department;

			// Filter out suggested tasks
			if (isAssignedToDepartment || isProjectInDepartment) {
				const forbiddenStageTitles = ['suggested', 'suggested task'];
				const stage = taskProject?.stages.find(s => s.id === task.projectStage);
				if (stage && forbiddenStageTitles.includes(stage.title.toLowerCase().trim())) {
					return false;
				}
				return true;
			}
			return false;
		});
	}, [tasks, projects, teamMembers, currentUser]);

	// Flatten and filter for Calendar
	const calendarTasks = useMemo(() => {
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

		const flatTasks = flattenTasks(departmentTasks);

		// Filter for Calendar (Active tasks usually)
		const forbiddenStageTitles = ['archive', 'completed', 'complete'];
		const forbiddenStageIds = new Set<string>();
		projects.forEach((p: Project) => {
			p.stages.forEach(s => {
				if (forbiddenStageTitles.includes(s.title.toLowerCase().trim())) {
					forbiddenStageIds.add(s.id);
				}
			});
		});

		return flatTasks.filter(task => {
			if (task.projectStage && forbiddenStageIds.has(task.projectStage)) return false;
			if (task.userStatus === 'complete') return false;
			return true;
		});
	}, [departmentTasks, projects]);


	const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
		setTasks(prev => {
			// Recursive update
			const updateInList = (list: Task[]): Task[] => {
				return list.map(t => {
					if (t.id === taskId) return { ...t, ...updates };
					if (t.subtasks) return { ...t, subtasks: updateInList(t.subtasks) };
					return t;
				});
			};
			return updateInList(prev);
		});
	};

	// Get department name
	const [departments, setDepartments] = useState<any[]>([]);
	useEffect(() => {
		const loadDepartments = async () => {
			try {
				const departmentsData = await departmentService.getAll();
				setDepartments(departmentsData);
			} catch {
				setDepartments([]);
			}
		};
		loadDepartments();
	}, []);

	const getDepartmentName = () => {
		if (currentUser && departments.length > 0) {
			const dept = departments.find((d) => d.id === currentUser.department);
			return dept?.name || "Your Department";
		}
		return "Your Department";
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
			<div data-tour="dashboard-header" className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-secondary via-secondary-light to-primary shadow-xl">
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
				<div className="relative z-10">
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-3 mb-2">
							<div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
								<svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
								</svg>
							</div>
							<div>
								<h1 className="text-4xl font-bold text-white tracking-tight">Team Lead Dashboard</h1>
								<p className="text-white/90 mt-1 text-lg">
									{getDepartmentName()} department overview and progress
								</p>
							</div>
						</div>
						{/* Take a Tour Button */}
						<Button
							onClick={startTour}
							variant="secondary"
							className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg"
						>
							<Sparkles className="h-4 w-4 mr-2" />
							{hasCompleted() ? 'Restart Tour' : 'Take a Tour'}
						</Button>
					</div>
				</div>
			</div>

			<div data-tour="dashboard-stats">
				<DashboardStats tasks={departmentTasks} projects={projects} />
			</div>

			<div data-tour="team-calender" className="mt-8 mb-8">
				<div className="flex items-center gap-2 mb-4">
					<div className="h-8 w-1 bg-primary rounded-full"></div>
					<h3 className="text-xl font-bold text-foreground/80">Team Calendar</h3>
				</div>
				<TaskCalendar
					tasks={calendarTasks}
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

			{/* Onboarding Tour */}
			<OnboardingTour
				tourId={tourId}
				steps={teamLeadTourSteps}
				isOpen={isTourOpen}
				onComplete={endTour}
				onSkip={endTour}
			/>
		</div>
	);
}
