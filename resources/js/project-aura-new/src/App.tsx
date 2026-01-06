import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import UserDashboard from "./pages/UserDashboard";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import NotFound from "./pages/NotFound";
import ProjectKanbanFixed from "./pages/ProjectKanbanFixed";
import UserProjectStageTasks from "./pages/UserProjectStageTasks";
import { UserProvider, useUser } from "@/hooks/use-user";
import { Login } from "@/components/Login";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const queryClient = new QueryClient();

import { NotificationsPopover } from "@/components/NotificationsPopover";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
	const { currentUser, isLoading, isAuthenticated, logout } = useUser();
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated || !currentUser) {
		return null; // Login component will be shown by AuthWrapper
	}

	return (
		<SidebarProvider>
			<div className="min-h-screen flex w-full bg-background">
				<AppSidebar />
				<div className="flex-1 flex flex-col">
					<header className="sticky top-0 z-40 h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card/80 backdrop-blur-md shadow-sm">
						<div className="flex items-center gap-4">
							<SidebarTrigger className="hover:bg-accent/50 transition-colors" />
						</div>
						<div className="flex items-center gap-3">
							<NotificationsPopover />
							<span className="text-sm text-muted-foreground hidden md:block">
								{currentUser.name} ({currentUser.role})
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
					</header >
					<main className="flex-1 p-6 overflow-y-auto">
						{children}
					</main>
				</div >
			</div >
		</SidebarProvider >
	);
};

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
	const { isAuthenticated, isLoading, refreshUser } = useUser();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Login onLoginSuccess={refreshUser} />;
	}

	return <>{children}</>;
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
							<Route path="/" element={<AppLayout><UserDashboard /></AppLayout>} />
							<Route path="/tasks" element={<AppLayout><Tasks /></AppLayout>} />
							<Route path="/project/:projectId" element={<AppLayout><ProjectKanbanFixed /></AppLayout>} />
							<Route path="/team" element={<AppLayout><Team /></AppLayout>} />
							<Route path="/user-project/:projectId/stage/:stageId" element={<AppLayout><UserProjectStageTasks /></AppLayout>} />
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
