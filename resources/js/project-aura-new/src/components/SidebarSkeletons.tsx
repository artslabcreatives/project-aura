import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";

/**
 * Skeleton loader for project items in the sidebar
 * Displays animated placeholder while projects are loading
 */
export function SidebarProjectsSkeletonList({ count = 5 }) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Projects</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{Array.from({ length: count }).map((_, index) => (
						<SidebarMenuItem key={index}>
							<SidebarMenuButton className="w-full opacity-60">
								<div className="flex items-center gap-3 w-full">
									<div className="h-4 w-4 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse" />
									<div className="h-4 w-32 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse flex-1" />
									<div className="h-4 w-4 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse" />
								</div>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

/**
 * Skeleton loader for department groups with nested structure
 * Displays animated placeholder while departments are loading
 */
export function SidebarDepartmentsSkeletonList({ count = 3 }) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Departments</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{Array.from({ length: count }).map((_, deptIndex) => (
						<div key={deptIndex} className="space-y-1">
							{/* Department Header */}
							<SidebarMenuItem>
								<SidebarMenuButton className="w-full opacity-60">
									<div className="flex items-center gap-3 w-full">
										<div className="h-4 w-4 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse" />
										<div className="h-4 w-24 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse flex-1" />
										<div className="h-4 w-4 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse" />
									</div>
								</SidebarMenuButton>
							</SidebarMenuItem>

							{/* Department Sub-items (Nested Projects) */}
							{Array.from({ length: 2 }).map((_, itemIndex) => (
								<div key={itemIndex} className="ml-6 pl-3 border-l border-sidebar-border">
									<SidebarMenuItem>
										<SidebarMenuButton className="w-full opacity-60">
											<div className="flex items-center gap-3 w-full">
												<div className="h-3 w-3 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse" />
												<div className="h-3 w-28 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse flex-1" />
											</div>
										</SidebarMenuButton>
									</SidebarMenuItem>
								</div>
							))}
						</div>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

/**
 * Combined skeleton loader for all sidebar sections
 * Shows loading state for both projects and departments simultaneously
 */
export function SidebarLoadingAnimation() {
	return (
		<>
			<SidebarProjectsSkeletonList count={5} />
			<SidebarDepartmentsSkeletonList count={3} />
		</>
	);
}
