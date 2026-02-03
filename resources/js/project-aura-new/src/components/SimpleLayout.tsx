import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";

/**
 * SimpleLayout - A minimal layout without sidebar or header
 * Used for embedding in iframes (e.g., Mattermost integration)
 * No header or navigation - just the content area
 * Wraps with SidebarProvider to prevent errors from components that use useSidebar
 */
const SimpleLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<SidebarProvider>
			<div className="min-h-screen w-full bg-background">
				<Toaster />
				<Sonner />

				{/* Full content area without any header */}
				<main className="p-4">
					{children}
				</main>
			</div>
		</SidebarProvider>
	);
};

export default SimpleLayout;
