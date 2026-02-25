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

import { OnboardingTour, useOnboardingTour } from "@/components/OnboardingTour";
import { userTourSteps } from "@/components/tourSteps";

const queryClient = new QueryClient();

import { NotificationsPopover } from "@/components/NotificationsPopover";
import { VideoGuideModal } from "@/components/VideoGuideModal";
import { api } from "@/lib/api";

import { Bug } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ReportIssueDialog } from "@/components/ReportIssueDialog";
import { GlobalSearch } from "@/components/GlobalSearch";
import { UserProfileMenu } from "@/components/UserProfileMenu";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
	const { open } = useSidebar();
	const { currentUser, logout } = useUser();
	const [isVideoGuideOpen, setIsVideoGuideOpen] = useState(false);
	const [isWelcomeVideo, setIsWelcomeVideo] = useState(false);
	const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
	const hasShownWelcomeRef = useRef(false);
	const [showMattermostPreload, setShowMattermostPreload] = useState(false);

	useEffect(() => {
		if (currentUser) {
			const key = `mattermost_chat_preloaded_${currentUser.id}`;
			if (!localStorage.getItem(key)) {
				setShowMattermostPreload(true);
				localStorage.setItem(key, '1');
			}
		}
	}, [currentUser?.id]);

	useEffect(() => {
		if (currentUser && currentUser.hasSeenWelcomeVideo === false && !hasShownWelcomeRef.current) {
			setIsVideoGuideOpen(true);
			setIsWelcomeVideo(true);
			hasShownWelcomeRef.current = true;
		}
	}, [currentUser]);

	const handleVideoGuideClose = async () => {
		setIsVideoGuideOpen(false);
		if (isWelcomeVideo) {
			try {
				await api.post('/user/seen-welcome-video', {});
				if (currentUser) {
					// Update local object to prevent immediate re-trigger if state updates
					currentUser.hasSeenWelcomeVideo = true;
				}
			} catch (e) {
				console.error('Failed to mark welcome video as seen:', e);
			}
			setIsWelcomeVideo(false);
		}
	};

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
			{/* Search pinned to viewport center - must be outside header to avoid backdrop-filter containing block */}
			<div
				data-tour="global-search"
				className="fixed top-0 h-11 flex items-center z-50"
				style={{ left: '50vw', transform: 'translateX(-50%)' }}
			>
				<GlobalSearch />
			</div>
			<div data-tour="sidebar">
				<AppSidebar />
			</div>
			<div className="flex-1 flex flex-col min-w-0">
				<header className={`sticky top-0 z-40 h-11 border-b border-border/50 dark:border-[#242c40] flex items-center justify-between bg-card/80 backdrop-blur-md shadow-sm transition-[padding] duration-200 ${open ? 'pr-4' : ''}`}>
					<div className="flex items-center gap-4">
						<SidebarTrigger className="hover:bg-accent/50 transition-colors" />
					</div>
					<div className="flex items-center gap-3">

						<div className="flex items-center mr-2 gap-1">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => {
									setIsWelcomeVideo(false);
									setIsVideoGuideOpen(true);
								}}
								title="Help Guide"
								className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
							>
								<HelpCircle className="h-5 w-5" />
							</Button>
							<div className="flex flex-col items-center">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setIsReportDialogOpen(true)}
									title="Report an Issue (Ctrl+Shift+R)"
									className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
								>
									<Bug className="h-5 w-5" />
								</Button>
							</div>
						</div>
						<div data-tour="notifications">
							<NotificationsPopover />
						</div>
						<div data-tour="user-menu">
							<UserProfileMenu />
						</div>
					</div>
				</header>
				<main className="flex-1 p-6 overflow-y-auto">
					{children}
				</main>
				<ReminderPoller />
				<ReportIssueDialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen} />
				{currentUser && (
					<VideoGuideModal
						isOpen={isVideoGuideOpen}
						onClose={handleVideoGuideClose}
						role={currentUser.role}
						isWelcome={isWelcomeVideo}
					/>
				)}
			</div>
			{showMattermostPreload && (
				<iframe
					src="/mattermost-chat"
					title="mattermost-preload"
					style={{ position: 'fixed', width: 0, height: 0, border: 'none', opacity: 0, pointerEvents: 'none' }}
					tabIndex={-1}
					aria-hidden="true"
				/>
			)}
		</div>
	);
};


const AppLayout = ({ children }: { children: React.ReactNode }) => {
	const { currentUser, isLoading, isAuthenticated } = useUser();
	const [searchParams] = useSearchParams();
	const location = useLocation();

	// Check if embedded: either via query param or if path starts with /mattermost/ (not /mattermost-chat)
	const isEmbedded = searchParams.get('embed') === 'true' ||
		searchParams.get('embed') === '1' ||
		location.pathname.startsWith('/mattermost/');

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
	const location = useLocation();

	// Skip authentication for public routes
	const publicPaths = ['/set-password', '/reset-password'];
	const isPublicRoute = publicPaths.some(path => location.pathname.startsWith(path));

	if (isPublicRoute) {
		return <>{children}</>;
	}

	if (isLoading) {
		return <Loading />;
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
import Profile from "./pages/Profile";
import Configuration from "./pages/Configuration";
import { SetPassword } from "./pages/SetPassword";
import { MattermostChat } from "./pages/MattermostChat";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import Reminders from "./pages/Reminders";
import { PublicMattermostChat } from "./pages/PublicMattermostChat";
import { ReminderPoller } from "./components/ReminderPoller";

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
							{/* COMPLETELY PUBLIC ROUTE - NO AUTH */}
							<Route path="/chat" element={<PublicMattermostChat />} />

							{/* Public route for setting password from invite */}
							<Route path="/set-password" element={<SetPassword />} />
							<Route path="/reset-password" element={<ResetPasswordPage />} />

							{/* Regular routes */}
							<Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />						<Route path="/mattermost-chat" element={<AppLayout><MattermostChat /></AppLayout>} />
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
							<Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
							<Route path="/configuration" element={<AppLayout><Configuration /></AppLayout>} />
							<Route path="/reminders" element={<AppLayout><Reminders /></AppLayout>} />

							{/* Mattermost embedded routes (with /mattermost prefix) */}
							<Route path="/mattermost" element={<AppLayout><Dashboard /></AppLayout>} />
							<Route path="/mattermost/reminders" element={<AppLayout><Reminders /></AppLayout>} />
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

							{/* Catch-all for 404 */}
							<Route path="*" element={<NotFound />} />
						</Routes>
					</AuthWrapper>
				</BrowserRouter>
			</TooltipProvider>
		</QueryClientProvider>
	</UserProvider>
);

export default App;
