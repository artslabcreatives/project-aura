import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Loading } from "@/components/Loading";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useLocation, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import SimpleLayout from "@/components/SimpleLayout";
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Team = lazy(() => import("./pages/Team"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProjectKanbanFixed = lazy(() => import("./pages/ProjectKanbanFixed"));
const ProjectOverview = lazy(() => import("./pages/ProjectOverview"));
const Emails = lazy(() => import("./pages/Emails"));
const UserProjectStageTasks = lazy(() => import("./pages/UserProjectStageTasks"));
const FilteredTasksPage = lazy(() => import("./pages/FilteredTasksPage"));
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
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { ReportIssueDialog } from "@/components/ReportIssueDialog";
import { GlobalSearch } from "@/components/GlobalSearch";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { UploadManagerPopup } from "@/components/UploadManagerPopup";
import { ActiveTimersPopover } from "@/components/ActiveTimersPopover";
import { AIHelperPopup } from "@/components/AIHelperPopup";

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
			setShowMattermostPreload(true);
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
							<ActiveTimersPopover />
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
				<AIHelperPopup />
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


const AppLayout = ({ children }: { children?: React.ReactNode }) => {
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
		return <Loading />;
	}

	if (!isAuthenticated || !currentUser) {
		return null; // Login component will be shown by AuthWrapper
	}

	const content = children || <Outlet />;

	// Use SimpleLayout for embedded views (Mattermost iframes, etc.)
	if (isEmbedded) {
		return <SimpleLayout>{content}</SimpleLayout>;
	}

	// Use full DashboardLayout with sidebar for regular views
	return (
		<SidebarProvider>
			<DashboardLayout>{content}</DashboardLayout>
		</SidebarProvider>
	);
};

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
	const { isAuthenticated, isLoading, refreshUser } = useUser();
	const location = useLocation();

	// Skip authentication for public routes
	const publicPaths = ['/set-password', '/reset-password', '/sso/authorize', '/oauth/authorize'];
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

const TaskDetailsPage = lazy(() => import("./pages/TaskDetailsPage"));
const ReviewNeededPage = lazy(() => import("./pages/ReviewNeededPage"));
const HRDashboard = lazy(() => import("./pages/HRDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Configuration = lazy(() => import("./pages/Configuration"));
const SetPassword = lazy(() => import("./pages/SetPassword").then(m => ({ default: m.SetPassword })));
const MattermostChat = lazy(() => import("./pages/MattermostChat").then(m => ({ default: m.MattermostChat })));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const Reminders = lazy(() => import("./pages/Reminders"));
const Clients = lazy(() => import("./pages/Clients"));
const ClientProfile = lazy(() => import("./pages/ClientProfile"));
const Estimates = lazy(() => import("./pages/Estimates"));
const EstimateDetail = lazy(() => import("./pages/EstimateDetail"));
const TaskEfficiency = lazy(() => import("./pages/TaskEfficiency"));
const DepartmentEfficiency = lazy(() => import("./pages/DepartmentEfficiency"));
const PublicMattermostChat = lazy(() => import("./pages/PublicMattermostChat").then(m => ({ default: m.PublicMattermostChat })));
import { ReminderPoller } from "./components/ReminderPoller";
const SSOAuthorize = lazy(() => import("./pages/SSOAuthorize"));
const SSOClients = lazy(() => import("./pages/SSOClients"));
const ReportManagement = lazy(() => import("./pages/ReportManagement"));
const Documents = lazy(() => import("./pages/Documents"));
const AIChatbot = lazy(() => import("./pages/AIChatbot"));

const Dashboard = () => {
	const { activeRole } = useUser();

	if (activeRole === 'hr') {
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
				<UploadManagerPopup />
				<BrowserRouter>
					<AuthWrapper>
						<Suspense fallback={<Loading />}>
							<Routes>
								{/* COMPLETELY PUBLIC ROUTE - NO AUTH */}
								<Route path="/chat" element={<PublicMattermostChat />} />

								{/* Public-ish routes handled by AuthWrapper skip logic */}
								<Route path="/reset-password" element={<ResetPasswordPage />} />
								<Route path="/set-password" element={<SetPassword />} />

								{/* SSO authorize consent page — manages its own auth */}
								<Route path="/sso/authorize" element={<SSOAuthorize />} />
								<Route path="/oauth/authorize" element={<SSOAuthorize />} />

								{/* Dashboard routes wrapped in AppLayout to persist Sidebar state */}
								<Route element={<AppLayout />}>
									<Route path="/" element={<Dashboard />} />
									<Route path="/mattermost-chat" element={<MattermostChat />} />
									<Route path="/tasks" element={
										<ProtectedRoute allowedRoles={['admin', 'team-lead']}>
											<Tasks />
										</ProtectedRoute>
									} />
									<Route path="/tasks/filter/:filterType" element={
										<ProtectedRoute allowedRoles={['admin', 'team-lead', 'account-manager', 'user']}>
											<FilteredTasksPage />
										</ProtectedRoute>
									} />
									<Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
									<Route path="/project/:projectId" element={<ProjectKanbanFixed />} />
									<Route path="/project/:projectId/overview" element={<ProjectOverview />} />
									<Route path="/team" element={
										<ProtectedRoute allowedRoles={['admin', 'team-lead', 'user', 'account-manager', 'hr']}>
											<Team />
										</ProtectedRoute>
									} />
									<Route path="/user-project/:projectId/stage/:stageId" element={<UserProjectStageTasks />} />
									<Route path="/review-needed" element={
										<ProtectedRoute allowedRoles={['account-manager']}>
											<ReviewNeededPage />
										</ProtectedRoute>
									} />
									<Route path="/profile" element={<Profile />} />
									<Route path="/reports" element={
										<ProtectedRoute allowedRoles={['admin', 'hr', 'team-lead', 'user', 'account-manager']}>
											<ReportManagement />
										</ProtectedRoute>
									} />
									<Route path="/configuration" element={<Configuration />} />
									<Route path="/task-efficiency" element={<TaskEfficiency />} />
									<Route path="/department-efficiency" element={<DepartmentEfficiency />} />
									<Route path="/reminders" element={<Reminders />} />
									<Route path="/clients" element={
										<ProtectedRoute allowedRoles={['admin', 'hr']}>
											<Clients />
										</ProtectedRoute>
									} />
									<Route path="/clients/:id" element={
										<ProtectedRoute allowedRoles={['admin', 'hr']}>
											<ClientProfile />
										</ProtectedRoute>
									} />
									<Route path="/estimates" element={
										<ProtectedRoute allowedRoles={['admin', 'team-lead', 'account-manager', 'hr']}>
											<Estimates />
										</ProtectedRoute>
									} />
									<Route path="/estimates/:estimateId" element={
										<ProtectedRoute allowedRoles={['admin', 'team-lead', 'account-manager', 'hr']}>
											<EstimateDetail />
										</ProtectedRoute>
									} />
									<Route path="/emails" element={<Emails />} />
									<Route path="/documents" element={<Documents />} />
									<Route path="/sso/clients" element={
										<ProtectedRoute allowedRoles={['admin']}>
											<SSOClients />
										</ProtectedRoute>
									} />
									<Route path="/ai-scenarios" element={
										<ProtectedRoute allowedRoles={['admin']}>
											<AIChatbot />
										</ProtectedRoute>
									} />

									{/* Mattermost embedded routes (with /mattermost prefix) */}
									<Route path="/mattermost" element={<Dashboard />} />
									<Route path="/mattermost/reminders" element={<Reminders />} />
									<Route path="/mattermost/tasks" element={
										<ProtectedRoute allowedRoles={['admin', 'team-lead']}>
											<Tasks />
										</ProtectedRoute>
									} />
									<Route path="/mattermost/tasks/filter/:filterType" element={
										<ProtectedRoute allowedRoles={['admin', 'team-lead', 'account-manager', 'user']}>
											<FilteredTasksPage />
										</ProtectedRoute>
									} />
									<Route path="/mattermost/tasks/:taskId" element={<TaskDetailsPage />} />
									<Route path="/mattermost/project/:projectId" element={<ProjectKanbanFixed />} />
									<Route path="/mattermost/team" element={
										<ProtectedRoute allowedRoles={['admin', 'team-lead', 'user', 'account-manager', 'hr']}>
											<Team />
										</ProtectedRoute>
									} />
									<Route path="/mattermost/user-project/:projectId/stage/:stageId" element={<UserProjectStageTasks />} />
									<Route path="/mattermost/review-needed" element={
										<ProtectedRoute allowedRoles={['account-manager']}>
											<ReviewNeededPage />
										</ProtectedRoute>
									} />
								</Route>

								{/* Catch-all for 404 */}
								<Route path="*" element={<NotFound />} />
							</Routes>
						</Suspense>
					</AuthWrapper>
				</BrowserRouter>
			</TooltipProvider>
		</QueryClientProvider>
	</UserProvider>
);

export default App;
