import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Loading } from "@/components/Loading";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import SimpleLayout from "@/components/SimpleLayout";
import UserDashboard from "./pages/UserDashboard";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import NotFound from "./pages/NotFound";
import ProjectKanbanFixed from "./pages/ProjectKanbanFixed";
import UserProjectStageTasks from "./pages/UserProjectStageTasks";
import FilteredTasksPage from "./pages/FilteredTasksPage";
import { UserProvider, useUser } from "@/hooks/use-user";
import { Login } from "@/components/Login";
import { Button } from "@/components/ui/button";
import { LogOut, HelpCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OnboardingTour, useOnboardingTour } from "@/components/OnboardingTour";
import { userTourSteps } from "@/components/tourSteps";

const queryClient = new QueryClient();

import { NotificationsPopover } from "@/components/NotificationsPopover";

import { Bug } from "lucide-react";
import { useState, useEffect } from "react";
import { ReportIssueDialog } from "@/components/ReportIssueDialog";
import { GlobalSearch } from "@/components/GlobalSearch";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
	const { open } = useSidebar();
	const { currentUser, logout } = useUser();
	const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.shiftKey && (e.code === 'KeyR' || e.key.toLowerCase() === 'r')) {
				e.preventDefault();
				setIsReportDialogOpen(prev => !prev);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	return (
		<div className="min-h-screen flex w-full bg-background">
			<div data-tour="sidebar">
				<AppSidebar />
			</div>
			<div className="flex-1 flex flex-col min-w-0">
				<header className={`sticky top-0 z-40 h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card/80 backdrop-blur-md shadow-sm transition-[padding] duration-200 ${open ? 'pr-12' : ''}`}>
					<div className="flex items-center gap-4">
						<SidebarTrigger className="hover:bg-accent/50 transition-colors" />
						<div data-tour="global-search">
							<GlobalSearch />
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div data-tour="theme-toggle">
							<ThemeToggle />
						</div>
						<div className="flex flex-col items-center mr-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsReportDialogOpen(true)}
								title="Report an Issue (Ctrl+Shift+R)"
								className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
							>
								<Bug className="h-5 w-5" />
							</Button>
							<span className="text-[10px] text-muted-foreground leading-none hidden md:block">Ctrl+Shift+R</span>
						</div>
						<div data-tour="notifications">
							<NotificationsPopover />
						</div>
						<div data-tour="user-menu" className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground hidden md:block">
								{currentUser?.name} ({currentUser?.role})
							</span>
							<Button
								variant="ghost"
								size="icon"
								onClick={logout}
								title="Logout"
								className="hover:bg-accent/50 transition-colors"
							>
								<LogOut className="h-5 w-5" />
							</Button>
						</div>
					</div>
				</header>
				<main className="flex-1 p-6 overflow-y-auto">
					{children}
				</main>
				<ReportIssueDialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen} />
			</div>
		</div>
	);
};


const AppLayout = ({ children }: { children: React.ReactNode }) => {
	const { currentUser, isLoading, isAuthenticated } = useUser();
	const [searchParams] = useSearchParams();
	const location = useLocation();

	// Check if embedded: either via query param or if path starts with /mattermost/
	const isEmbedded = searchParams.get('embed') === 'true' ||
		searchParams.get('embed') === '1' ||
		location.pathname.startsWith('/mattermost');

	// Debug logging
	console.log('AppLayout Debug:', {
		pathname: location.pathname,
		embed: searchParams.get('embed'),
		isEmbedded,
		currentUser: currentUser?.name
	});

	if (isLoading) {
		if (isLoading) {
			return <Loading />;
		}
	}

	if (!isAuthenticated || !currentUser) {
		return null; // Login component will be shown by AuthWrapper
	}

	// Use SimpleLayout for embedded views (Mattermost iframes, etc.)
	if (isEmbedded) {
		return <SimpleLayout>{children}</SimpleLayout>;
	}

	// Use full DashboardLayout with sidebar for regular views
	return (
		<SidebarProvider>
			<DashboardLayout>{children}</DashboardLayout>
		</SidebarProvider>
	);
};

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
	const { isAuthenticated, isLoading, refreshUser } = useUser();

	if (isLoading) {
		if (isLoading) {
			return <Loading />;
		}
	}

	if (!isAuthenticated) {
		return <Login onLoginSuccess={refreshUser} />;
	}

	return <>{children}</>;
};

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
	const { currentUser, isLoading } = useUser();

	if (isLoading) return <Loading />;

	if (!currentUser || !allowedRoles.includes(currentUser.role)) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
};

import TaskDetailsPage from "./pages/TaskDetailsPage";
import ReviewNeededPage from "./pages/ReviewNeededPage";

import HRDashboard from "./pages/HRDashboard";

const Dashboard = () => {
	const { currentUser } = useUser();

	if (currentUser?.role === 'hr') {
		return <HRDashboard />;
	}

	return <UserDashboard />;
};

const App = () => (
	<UserProvider>
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Toaster />
				<Sonner />
				<BrowserRouter>
					<AuthWrapper>
						<Routes>
							{/* Regular routes */}
							<Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
							<Route path="/tasks" element={
								<ProtectedRoute allowedRoles={['admin', 'team-lead']}>
									<AppLayout><Tasks /></AppLayout>
								</ProtectedRoute>
							} />
							<Route path="/tasks/filter/:filterType" element={
								<ProtectedRoute allowedRoles={['admin', 'team-lead', 'account-manager', 'user']}>
									<AppLayout><FilteredTasksPage /></AppLayout>
								</ProtectedRoute>
							} />
							<Route path="/tasks/:taskId" element={<AppLayout><TaskDetailsPage /></AppLayout>} />
							<Route path="/project/:projectId" element={<AppLayout><ProjectKanbanFixed /></AppLayout>} />
							<Route path="/team" element={
								<ProtectedRoute allowedRoles={['admin', 'team-lead']}>
									<AppLayout><Team /></AppLayout>
								</ProtectedRoute>
							} />
							<Route path="/user-project/:projectId/stage/:stageId" element={<AppLayout><UserProjectStageTasks /></AppLayout>} />
							<Route path="/review-needed" element={
								<ProtectedRoute allowedRoles={['account-manager']}>
									<AppLayout><ReviewNeededPage /></AppLayout>
								</ProtectedRoute>
							} />

							{/* Mattermost embedded routes (with /mattermost prefix) */}
							<Route path="/mattermost" element={<AppLayout><Dashboard /></AppLayout>} />
							<Route path="/mattermost/tasks" element={
								<ProtectedRoute allowedRoles={['admin', 'team-lead']}>
									<AppLayout><Tasks /></AppLayout>
								</ProtectedRoute>
							} />
							<Route path="/mattermost/tasks/filter/:filterType" element={
								<ProtectedRoute allowedRoles={['admin', 'team-lead', 'account-manager', 'user']}>
									<AppLayout><FilteredTasksPage /></AppLayout>
								</ProtectedRoute>
							} />
							<Route path="/mattermost/tasks/:taskId" element={<AppLayout><TaskDetailsPage /></AppLayout>} />
							<Route path="/mattermost/project/:projectId" element={<AppLayout><ProjectKanbanFixed /></AppLayout>} />
							<Route path="/mattermost/team" element={
								<ProtectedRoute allowedRoles={['admin', 'team-lead']}>
									<AppLayout><Team /></AppLayout>
								</ProtectedRoute>
							} />
							<Route path="/mattermost/user-project/:projectId/stage/:stageId" element={<AppLayout><UserProjectStageTasks /></AppLayout>} />
							<Route path="/mattermost/review-needed" element={
								<ProtectedRoute allowedRoles={['account-manager']}>
									<AppLayout><ReviewNeededPage /></AppLayout>
								</ProtectedRoute>
							} />

							{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
							<Route path="*" element={<NotFound />} />
						</Routes>
					</AuthWrapper>
				</BrowserRouter>
			</TooltipProvider>
		</QueryClientProvider>
	</UserProvider>
);

export default App;
