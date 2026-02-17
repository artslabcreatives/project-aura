import { DashboardStats } from "@/components/DashboardStats";
import { AdminAnalytics } from "@/components/AdminAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { useEffect, useState } from "react";
import { Task } from "@/types/task";
import { Project } from "@/types/project";

import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingTour, useOnboardingTour } from "@/components/OnboardingTour";
import { adminTourSteps } from "@/components/tourSteps";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

import { useUser } from "@/hooks/use-user";

export default function AdminView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUser();

  // Onboarding tour
  const tourId = `admin_dashboard_tour_${currentUser?.id}`;
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
        const [tasksData, projectsData] = await Promise.all([
          taskService.getAll(),
          projectService.getAll()
        ]);

        setProjects(projectsData);

        // Filter out suggested tasks
        const forbiddenStageTitles = ['suggested', 'suggested task'];
        const forbiddenStageIds = new Set<string>();
        projectsData.forEach((p: Project) => {
          p.stages.forEach(s => {
            if (forbiddenStageTitles.includes(s.title.toLowerCase().trim())) {
              forbiddenStageIds.add(s.id);
            }
          });
        });

        const filteredTasks = tasksData.filter((task: Task) => {
          if (task.projectStage && forbiddenStageIds.has(task.projectStage)) return false;
          return true;
        });

        setTasks(filteredTasks);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setTasks([]);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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


      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Hero Header with Gradient */}
      <div data-tour="dashboard-header" className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-primary via-primary-light to-accent shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Admin Dashboard</h1>
                <p className="text-white/90 mt-1 text-lg">
                  Complete system overview and analytics
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
        <DashboardStats tasks={tasks} projects={projects} />
      </div>

      <div className="mt-8 mb-8" data-tour="admin-analytics">
        <AdminAnalytics />
      </div>



      <TaskDetailsDialog
        task={viewTask}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        tourId={tourId}
        steps={adminTourSteps}
        isOpen={isTourOpen}
        onComplete={endTour}
        onSkip={endTour}
      />
    </div>
  );
}
