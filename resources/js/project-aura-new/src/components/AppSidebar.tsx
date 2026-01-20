import { LayoutDashboard, Users, FolderKanban, Inbox, Plus, Layers, Pencil, Trash2, FileCog, Building2, FolderOpen } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import Logo from "@/assets/Logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarHeader,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { ProjectDialog } from "./ProjectDialog";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/project";
import { Stage } from "@/types/stage";
import { User, UserRole, Task } from "@/types/task";
import { useUser } from "@/hooks/use-user";
import { useHistory } from "@/hooks/use-history";
import { Department } from "@/types/department";
import { api } from "@/services/api"; // Use axios instance
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { departmentService } from "@/services/departmentService";
import { userService } from "@/services/userService";
import { projectGroupService } from "@/services/projectGroupService";
import { AssignGroupDialog } from "./AssignGroupDialog";
import { ProjectGroup } from "@/types/project-group";
import { FolderPlus } from "lucide-react";
import { echo } from "@/services/echoService";
import { TaskUpdated } from "@/types/events"; // We don't have this type yet but we can assume structure or use any
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const mainMenuItems = [
	{ title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["admin", "team-lead", "user"] },
	{ title: "Team", url: "/team", icon: Users, roles: ["admin", "team-lead"] },
	{ title: "Tasks", url: "/tasks", icon: Inbox, roles: ["admin", "team-lead"] },
];

interface GroupedDepartment {
	id: string;
	name: string;
	projects: Project[];
	projectGroups: Record<string, { id: string; name: string; projects: Project[] }>;
	ungroupedProjects: Project[];
}

export function AppSidebar() {
	const location = useLocation();
	const navigate = useNavigate();
	const { toast } = useToast();
	const { currentUser } = useUser();
	const { addHistoryEntry } = useHistory();
	const [projectsOpen, setProjectsOpen] = useState(true);
	const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
	const [projects, setProjects] = useState<Project[]>([]);
	const [teamMembers, setTeamMembers] = useState<User[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [assignedProjectsOpen, setAssignedProjectsOpen] = useState(true);
	const [departmentProjectsOpen, setDepartmentProjectsOpen] = useState(true);
	const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
	const [userAssignedProjects, setUserAssignedProjects] = useState<Project[]>([]);
	const [userDepartmentProjects, setUserDepartmentProjects] = useState<Project[]>([]);
	const [hoveredProject, setHoveredProject] = useState<string | null>(null);
	const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
	const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
	const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
	const [isAssignGroupOpen, setIsAssignGroupOpen] = useState(false);
	const [projectToAssign, setProjectToAssign] = useState<Project | null>(null);
	const [expandedProjectGroups, setExpandedProjectGroups] = useState<Set<string>>(new Set());
	const userRole = currentUser?.role;

	const fetchData = async () => {
		if (!currentUser) return;
		try {
			const [projectsData, departmentsData, projectGroupsData] = await Promise.all([
				projectService.getAll(),
				departmentService.getAll(),
				projectGroupService.getAll(),
			]);
			setProjects(projectsData);
			setDepartments(departmentsData);
			setProjectGroups(projectGroupsData);

			if (userRole === 'admin' || userRole === 'team-lead') {
				const usersData = await userService.getAll();
				setTeamMembers(usersData);
			}

			// Do NOT reset expanded departments here to avoid collapsing user view on refresh
			// setExpandedDepartments(new Set()); 

			if (userRole === 'user' && currentUser) {
				// Fetch tasks for user only (client-side filter)
				const tasksData = await taskService.getAll();
				const userProjectStages = new Map<string, Set<string>>();
				tasksData
					.filter(task => {
						const isAssigned = task.assignee === currentUser.name ||
							(task.assignedUsers && task.assignedUsers.some(u => String(u.id) === String(currentUser.id)));

						// Check if MY part is complete
						const myAssignment = task.assignedUsers?.find(u => String(u.id) === String(currentUser.id));
						const isMyPartComplete = myAssignment?.status === 'complete';

						return isAssigned && task.userStatus !== 'complete' && !isMyPartComplete;
					})
					.forEach(task => {
						if (task.project && task.projectStage) {
							if (!userProjectStages.has(task.project)) {
								userProjectStages.set(task.project, new Set());
							}
							userProjectStages.get(task.project)?.add(task.projectStage);
						}
					});

				const assignedProjects = projectsData
					.filter(project => userProjectStages.has(project.name))
					.map(project => ({
						...project,
						stages: project.stages.filter(stage => {
							const title = stage.title.toLowerCase().trim();
							const hiddenStages = ['suggested', 'suggested task', 'task', 'archive', 'completed', 'pending'];

							// User requested to hide specific system stages
							if (hiddenStages.includes(title)) return false;

							return userProjectStages.get(project.name)?.has(stage.id);
						})
					}))
					.filter(project => project.stages.length > 0);
				setUserAssignedProjects(assignedProjects);

				const currentDept = departmentsData.find(d => d.id === currentUser.department);
				const isDigitalDept = currentDept?.name.toLowerCase() === 'digital';
				const departmentProjects = projectsData.filter(project => {
					const isOwnDepartment = project.department?.id === currentUser.department;
					const isDesignProject = isDigitalDept && project.department?.name.toLowerCase() === 'design';
					return isOwnDepartment || isDesignProject;
				});
				setUserDepartmentProjects(departmentProjects);
			}
		} catch (error) {
			console.error('Failed to fetch data from API:', error);
			// Silent error or toast? Toast might be spammy on auto-refresh
		}
	};

	// Initial Load
	useEffect(() => {
		fetchData();
	}, [userRole, currentUser?.id]); // Use ID dependency to safe-guard

	// Real-time Updates
	useEffect(() => {
		if (projects.length === 0) return;

		// Listen to project channels
		projects.forEach(project => {
			echo.private(`project.${project.id}`)
				.listen('TaskUpdated', (e: any) => {
					console.log('Real-time update received:', e);
					fetchData();
				});
		});

		return () => {
			projects.forEach(project => {
				echo.leave(`project.${project.id}`);
			});
		};
	}, [projects.map(p => p.id).join(',')]); // Re-subscribe if project list changes (added/removed)

	const handleProjectSave = async (
		name: string,
		description: string,
		stages: Stage[],
		emails: string[],
		phoneNumbers: string[],
		department?: Department
	) => {
		if (!currentUser) return;
		try {
			// Create project via service
			const newProject = await projectService.create({
				name,
				description,
				stages: [], // stages created separately
				emails,
				phoneNumbers,
				department,
			});

			// Fetch fresh project details to get any auto-created system stages
			const fetchedProject = await projectService.getById(String(newProject.id));

			// Step 1: Create all stages without linked IDs (to get numeric IDs from backend)
			const stageIdMap = new Map<string, number>(); // Map temp ID -> real ID
			const createdStages = [];

			// Check for automatically created system stages using the fetched project data
			const existingSystemStages = new Map(fetchedProject.stages.map(s => [s.title.toLowerCase().trim(), s]));

			for (const stage of stages) {
				const existing = existingSystemStages.get(stage.title.toLowerCase().trim());

				if (existing) {
					// Map the temp ID to the existing real ID from backend
					stageIdMap.set(stage.id, Number(existing.id));

					// Update the existing system stage with user properties (e.g. color, responsible persons)
					// This ensures the backend stage matches the user's intent (e.g. Orange Pending instead of Grey)
					await api.put(`/stages/${existing.id}`, {
						color: stage.color,
						main_responsible_id: stage.mainResponsibleId,
						backup_responsible_id_1: stage.backupResponsibleId1,
						backup_responsible_id_2: stage.backupResponsibleId2,
						// We don't update title or type for system stages
					});

				} else {
					// Create new custom stage
					const response = await api.post('/stages', {
						title: stage.title,
						color: stage.color,
						order: stage.order,
						project_id: newProject.id,
						type: stage.type,
						main_responsible_id: stage.mainResponsibleId,
						backup_responsible_id_1: stage.backupResponsibleId1,
						backup_responsible_id_2: stage.backupResponsibleId2,
						is_review_stage: stage.isReviewStage,
						// Don't send linked IDs yet - they reference temp IDs
					});
					stageIdMap.set(stage.id, response.data.id);
					createdStages.push({ tempId: stage.id, realId: response.data.id, originalStage: stage });
				}
			}

			// Step 2: Update stages with proper linked IDs now that all stages exist
			for (const { realId, originalStage } of createdStages) {
				const updates: any = {};

				if (originalStage.linkedReviewStageId) {
					const linkedId = stageIdMap.get(originalStage.linkedReviewStageId);
					if (linkedId) updates.linked_review_stage_id = linkedId;
				}

				if (originalStage.approvedTargetStageId) {
					const approvedId = stageIdMap.get(originalStage.approvedTargetStageId);
					if (approvedId) updates.approved_target_stage_id = approvedId;
				}

				// Only update if there are linked IDs to set
				if (Object.keys(updates).length > 0) {
					await api.put(`/stages/${realId}`, updates);
				}
			}

			const projectsData = await projectService.getAll();
			setProjects(projectsData);

			addHistoryEntry({
				action: 'CREATE_PROJECT',
				entityId: newProject.id?.toString() || name,
				entityType: 'project',
				projectId: newProject.id?.toString() || name,
				userId: currentUser.id,
				details: { name: newProject.name },
			});

			toast({
				title: 'Project created',
				description: `${name} has been created with ${stages.length} workflow stages.`,
			});
		} catch (error) {
			console.error('Failed to create project:', error);
			toast({
				title: 'Error',
				description: 'Failed to create project. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const handleProjectUpdate = async (
		name: string,
		description: string,
		stages: Stage[],
		emails: string[],
		phoneNumbers: string[],
		department?: Department
	) => {
		if (!currentUser || !projectToEdit) return;
		try {
			const updatedProject = await projectService.update(String(projectToEdit.id), {
				name,
				description,
				emails,
				phoneNumbers,
				department,
			});

			// Create any newly added stages (id not numeric)
			const newStages = stages.filter(s => !/^[0-9]+$/.test(String(s.id)));
			for (const stage of newStages) {
				await api.post('/stages', {
					title: stage.title,
					color: stage.color,
					order: stage.order,
					project_id: updatedProject.id,
					type: stage.type,
					main_responsible_id: stage.mainResponsibleId,
					backup_responsible_id_1: stage.backupResponsibleId1,
					backup_responsible_id_2: stage.backupResponsibleId2,
					is_review_stage: stage.isReviewStage,
					linked_review_stage_id: stage.linkedReviewStageId,
					approved_target_stage_id: stage.approvedTargetStageId,
				});
			}

			// Update existing stages
			const existingStages = stages.filter(s => /^[0-9]+$/.test(String(s.id)));
			for (const stage of existingStages) {
				await api.put(`/stages/${stage.id}`, {
					title: stage.title,
					color: stage.color,
					order: stage.order,
					main_responsible_id: stage.mainResponsibleId,
					backup_responsible_id_1: stage.backupResponsibleId1,
					backup_responsible_id_2: stage.backupResponsibleId2,
					is_review_stage: stage.isReviewStage,
					linked_review_stage_id: stage.linkedReviewStageId,
					approved_target_stage_id: stage.approvedTargetStageId,
				});
			}

			const projectsData = await projectService.getAll();
			setProjects(projectsData);

			addHistoryEntry({
				action: 'UPDATE_PROJECT',
				entityId: updatedProject.id?.toString() || name,
				entityType: 'project',
				projectId: updatedProject.id?.toString() || name,
				userId: currentUser.id,
				details: { name: updatedProject.name },
			});

			toast({
				title: 'Project updated',
				description: `${name} has been updated successfully.`,
			});
			setProjectToEdit(null);
		} catch (error) {
			console.error('Failed to update project:', error);
			toast({
				title: 'Error',
				description: 'Failed to update project. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const handleProjectDelete = async () => {
		if (!currentUser || !projectToDelete) return;
		try {
			await projectService.delete(String(projectToDelete.id));
			const projectsData = await projectService.getAll();
			setProjects(projectsData);
			addHistoryEntry({
				action: 'DELETE_PROJECT',
				entityId: projectToDelete.id?.toString() || projectToDelete.name,
				entityType: 'project',
				projectId: projectToDelete.id?.toString() || projectToDelete.name,
				userId: currentUser.id,
				details: { name: projectToDelete.name },
			});
			toast({
				title: 'Project deleted',
				description: `${projectToDelete.name} has been deleted.`,
				variant: 'destructive',
			});
			if (location.pathname.startsWith(`/project/${projectToDelete.id}`)) navigate('/');
			setProjectToDelete(null);
		} catch (error) {
			console.error('Failed to delete project:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete project. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const getProjectSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');
	const getProjectUrl = (project: Project) => `/project/${getProjectSlug(project.name)}`;

	const isProjectActive = (project: Project) => {
		return location.pathname === getProjectUrl(project);
	};

	const isStageActive = (projectId: string, stageId: string) => {
		return location.pathname === `/user-project/${projectId}/stage/${stageId}`;
	};

	const toggleProjectExpanded = (projectName: string) => {
		setExpandedProjects(prev => {
			const newSet = new Set(prev);
			if (newSet.has(projectName)) {
				newSet.delete(projectName);
			} else {
				newSet.add(projectName);
			}
			return newSet;
		});
	};

	const toggleDepartmentExpanded = (departmentId: string) => {
		setExpandedDepartments(prev => {
			const newSet = new Set(prev);
			if (newSet.has(departmentId)) {
				newSet.delete(departmentId);
			} else {
				newSet.add(departmentId);
			}
			return newSet;
		});
	};

	const handleAssignGroup = async (project: Project, groupId: string | null, newGroupName?: string) => {
		try {
			let targetGroupId = groupId;

			if (newGroupName && (!targetGroupId || targetGroupId === 'new')) {
				if (!project.department) {
					toast({
						title: "Cannot create group",
						description: "Project must belong to a department to assign a group.",
						variant: "destructive",
					});
					return;
				}
				// Create new group
				const newGroup = await projectGroupService.create(newGroupName, project.department.id);
				targetGroupId = newGroup.id;
				setProjectGroups(prev => [...prev, newGroup]);
			}

			const updatedProject = await projectService.update(String(project.id), {
				group: targetGroupId ? { id: targetGroupId } as any : null,
			});

			// Refresh projects
			const projectsData = await projectService.getAll();
			setProjects(projectsData);

			toast({ title: "Project group updated" });
		} catch (error) {
			console.error("Failed to assign group:", error);
			toast({
				title: "Failed to update group",
				description: "An error occurred while updating the project group.",
				variant: "destructive",
			});
		}
	};

	const toggleProjectGroupExpanded = (groupId: string) => {
		setExpandedProjectGroups(prev => {
			const newSet = new Set(prev);
			if (newSet.has(groupId)) {
				newSet.delete(groupId);
			} else {
				newSet.add(groupId);
			}
			return newSet;
		});
	};

	// Group projects by department (admin) or filter flat list (team-lead)
	const projectsByDepartment = useMemo<Record<string, GroupedDepartment>>(() => {
		let filteredProjects = projects;

		// Filter projects by department for team-lead
		if (userRole === "team-lead" && currentUser) {
			const currentDept = departments.find(d => d.id === currentUser.department);
			const isDigitalDept = currentDept?.name.toLowerCase() === "digital";

			filteredProjects = projects.filter(project => {
				// Include projects that have a department matching the team-lead's department
				// OR projects with no department (for backward compatibility)
				const hasMatchingDepartment = project.department?.id === currentUser.department;
				const hasNoDepartment = !project.department;

				// Special permission: Digital Department can see Design Department projects too
				const isDesignProject = project.department?.name.toLowerCase() === "design";
				const hasSpecialPermission = isDigitalDept && isDesignProject;

				return hasMatchingDepartment || hasNoDepartment || hasSpecialPermission;
			});

			// For Digital dept team-lead, group by department (Digital and Design)
			// For other team-leads, return flat structure
			if (isDigitalDept) {
				const grouped = filteredProjects.reduce((acc, project) => {
					// Use the project's actual department for grouping
					const projectDept = project.department;
					const deptId = projectDept?.id || 'uncategorized';
					const deptName = projectDept?.name || 'Uncategorized';

					if (!acc[deptId]) {
						acc[deptId] = {
							id: deptId,
							name: deptName,
							projects: [],
							projectGroups: {},
							ungroupedProjects: []
						};
					}
					acc[deptId].projects.push(project);

					if (project.group) {
						const groupId = project.group.id;
						if (groupId) {
							if (!acc[deptId].projectGroups[groupId]) {
								acc[deptId].projectGroups[groupId] = {
									id: groupId,
									name: project.group.name,
									projects: []
								};
							}
							acc[deptId].projectGroups[groupId].projects.push(project);
						}
					} else {
						acc[deptId].ungroupedProjects.push(project);
					}

					return acc;
				}, {} as Record<string, GroupedDepartment>);

				return grouped;
			} else {
				// For other team-leads, don't group by department - return flat structure
				// But we still want to support project groups!
				const projectGroups: Record<string, { id: string, name: string, projects: Project[] }> = {};
				const ungroupedProjects: Project[] = [];

				filteredProjects.forEach(project => {
					if (project.group && project.group.id) {
						if (!projectGroups[project.group.id]) {
							projectGroups[project.group.id] = {
								id: project.group.id,
								name: project.group.name,
								projects: []
							};
						}
						projectGroups[project.group.id].projects.push(project);
					} else {
						ungroupedProjects.push(project);
					}
				});

				return {
					'flat': {
						id: 'flat',
						name: '',
						projects: filteredProjects,
						projectGroups,
						ungroupedProjects
					}
				};
			}
		}


		// For admin, group by department
		return filteredProjects.reduce((acc, project) => {
			const deptId = project.department?.id || 'uncategorized';
			const deptName = project.department?.name || 'Uncategorized';

			if (!acc[deptId]) {
				acc[deptId] = {
					id: deptId,
					name: deptName,
					projects: [],
					projectGroups: {},
					ungroupedProjects: []
				};
			}
			acc[deptId].projects.push(project);

			if (project.group && project.group.id) {
				const groupId = project.group.id;
				if (!acc[deptId].projectGroups[groupId]) {
					acc[deptId].projectGroups[groupId] = {
						id: groupId,
						name: project.group.name,
						projects: []
					};
				}
				acc[deptId].projectGroups[groupId].projects.push(project);
			} else {
				acc[deptId].ungroupedProjects.push(project);
			}

			return acc;
		}, {} as Record<string, GroupedDepartment>);
	}, [projects, userRole, currentUser, departments]);

	const departmentGroups = Object.values(projectsByDepartment).sort((a, b) => {
		if (a.id === 'uncategorized') return 1;
		if (b.id === 'uncategorized') return -1;
		return a.name.localeCompare(b.name);
	});

	const filteredMainMenuItems = mainMenuItems.filter(item =>
		userRole && item.roles.includes(userRole)
	);

	const renderProjectItem = (project: Project) => (
		<SidebarMenuItem
			key={project.id}
			onMouseEnter={() => setHoveredProject(project.name)}
			onMouseLeave={() => setHoveredProject(null)}
		>
			<div className="relative group">
				<SidebarMenuButton asChild>
					<NavLink
						to={getProjectUrl(project)}
						className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent ${isProjectActive(project)
							? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
							: ""
							}`}
					>
						<FolderKanban className="h-4 w-4" />
						<span className="text-sm flex-1">{project.name}</span>
						{project.hasPendingTasks && (
							<span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Has Pending Tasks" />
						)}
					</NavLink>
				</SidebarMenuButton>
				{hoveredProject === project.name && (
					<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-sidebar z-10">
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 hover:bg-primary hover:text-white transition-all duration-200"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setProjectToAssign(project);
								setIsAssignGroupOpen(true);
							}}
							title="Assign to Group"
						>
							<FolderPlus className="h-3 w-3" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 hover:bg-primary hover:text-white transition-all duration-200"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setProjectToEdit(project);
								setIsProjectDialogOpen(true);
							}}
							title="Edit project"
						>
							<Pencil className="h-3 w-3" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 text-destructive hover:bg-destructive hover:text-white transition-all duration-200"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setProjectToDelete(project);
							}}
							title="Delete project"
						>
							<Trash2 className="h-3 w-3" />
						</Button>
					</div>
				)}
			</div>
		</SidebarMenuItem>
	);

	return (
		<Sidebar>
			<SidebarHeader className="border-b border-sidebar-border p-4">
				<div className="flex items-center gap-2">
					<img src={Logo} alt="Aura" className="h-10 w-10 object-contain" />
					<div>
						<h2 className="font-semibold text-sm">Aura</h2>
						<p className="text-xs text-muted-foreground">Project Management System</p>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{filteredMainMenuItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<NavLink
											to={item.url}
											end
											className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent"
											activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
										>
											<item.icon className="h-4 w-4" />
											<span>{item.title}</span>
										</NavLink>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{(userRole === "admin" || userRole === "team-lead") && (
					<SidebarGroup>
						<Collapsible open={projectsOpen} onOpenChange={setProjectsOpen}>
							<div className="flex items-center justify-between px-2">
								<CollapsibleTrigger className="flex flex-1 items-center justify-between py-1.5 text-sm font-medium hover:bg-sidebar-accent rounded-md transition-colors">
									<SidebarGroupLabel className="hover:bg-transparent">Projects</SidebarGroupLabel>
									<ChevronRight
										className={`h-4 w-4 transition-transform ${projectsOpen ? "rotate-90" : ""
											}`}
									/>
								</CollapsibleTrigger>
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 ml-1"
									onClick={() => setIsProjectDialogOpen(true)}
									title="Add new project"
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
							<CollapsibleContent>
								<SidebarGroupContent>
									<SidebarMenu>
										{departmentGroups.length === 0 ? (
											<div className="px-3 py-2 text-sm text-muted-foreground">
												No projects found
											</div>
										) : userRole === "team-lead" && departmentGroups[0]?.id === 'flat' ? (
											// Non-Digital Team-lead: Show flat list with groups support
											<>
												{Object.values(departmentGroups[0].projectGroups || {}).map(group => (
													<Collapsible
														key={group.id}
														open={expandedProjectGroups.has(group.id)}
														onOpenChange={() => toggleProjectGroupExpanded(group.id)}
													>
														<SidebarMenuItem>
															<CollapsibleTrigger asChild>
																<SidebarMenuButton className="w-full">
																	<div className="flex items-center gap-2 flex-1">
																		<FolderKanban className="h-4 w-4" />
																		<span className="text-sm font-medium">{group.name}</span>
																	</div>
																	<ChevronRight
																		className={`h-4 w-4 transition-transform ${expandedProjectGroups.has(group.id) ? "rotate-90" : ""
																			}`}
																	/>
																</SidebarMenuButton>
															</CollapsibleTrigger>
															<CollapsibleContent>
																<SidebarMenuSub>
																	{group.projects.map((project) => renderProjectItem(project))}
																</SidebarMenuSub>
															</CollapsibleContent>
														</SidebarMenuItem>
													</Collapsible>
												))}
												{departmentGroups[0]?.ungroupedProjects.map((project) => renderProjectItem(project))}
											</>
										) : (
											// Admin or Digital Team-lead: Show grouped by department
											departmentGroups.map((departmentGroup) => (
												<Collapsible
													key={departmentGroup.id}
													open={expandedDepartments.has(departmentGroup.id)}
													onOpenChange={() => toggleDepartmentExpanded(departmentGroup.id)}
												>
													<SidebarMenuItem>
														<CollapsibleTrigger asChild>
															<SidebarMenuButton className="w-full">
																<div className="flex items-center gap-2 flex-1">
																	<Building2 className="h-4 w-4" />
																	<span className="text-sm font-medium">{departmentGroup.name}</span>
																	<span className="text-xs text-muted-foreground">({departmentGroup.projects.length})</span>
																</div>
																<ChevronRight
																	className={`h-4 w-4 transition-transform ${expandedDepartments.has(departmentGroup.id) ? "rotate-90" : ""
																		}`}
																/>
															</SidebarMenuButton>
														</CollapsibleTrigger>
														<CollapsibleContent>
															<SidebarMenuSub>
																{/* Render Project Groups within Department */}
																{Object.values(departmentGroup.projectGroups || {}).map(group => (
																	<Collapsible
																		key={group.id}
																		open={expandedProjectGroups.has(group.id)}
																		onOpenChange={() => toggleProjectGroupExpanded(group.id)}
																	>
																		<SidebarMenuItem>
																			<CollapsibleTrigger asChild>
																				<SidebarMenuButton className="w-full pl-2">
																					<div className="flex items-center gap-2 flex-1">
																						<FolderOpen className="h-4 w-4 text-muted-foreground" />
																						<span className="text-sm">{group.name}</span>
																					</div>
																					<ChevronRight
																						className={`h-4 w-4 transition-transform ${expandedProjectGroups.has(group.id) ? "rotate-90" : ""
																							}`}
																					/>
																				</SidebarMenuButton>
																			</CollapsibleTrigger>
																			<CollapsibleContent>
																				<SidebarMenuSub>
																					{group.projects.map((project) => renderProjectItem(project))}
																				</SidebarMenuSub>
																			</CollapsibleContent>
																		</SidebarMenuItem>
																	</Collapsible>
																))}

																{/* Render Ungrouped Projects */}
																{departmentGroup.ungroupedProjects.map((project) => renderProjectItem(project))}
															</SidebarMenuSub>
														</CollapsibleContent>
													</SidebarMenuItem>
												</Collapsible>
											))
										)}
									</SidebarMenu>
								</SidebarGroupContent>
							</CollapsibleContent>
						</Collapsible>
					</SidebarGroup>
				)}

				{userRole === "user" && userAssignedProjects.length > 0 && (
					<SidebarGroup>
						<Collapsible open={assignedProjectsOpen} onOpenChange={setAssignedProjectsOpen}>
							<div className="flex items-center justify-between px-2">
								<CollapsibleTrigger className="flex flex-1 items-center justify-between py-1.5 text-sm font-medium hover:bg-sidebar-accent rounded-md transition-colors">
									<SidebarGroupLabel className="hover:bg-transparent">Assigned Projects</SidebarGroupLabel>
									<ChevronRight
										className={`h-4 w-4 transition-transform ${assignedProjectsOpen ? "rotate-90" : ""
											}`}
									/>
								</CollapsibleTrigger>
							</div>
							<CollapsibleContent>
								<SidebarGroupContent>
									<SidebarMenu>
										{userAssignedProjects.map((project) => (
											<Collapsible
												key={project.id}
												open={expandedProjects.has(String(project.id))}
												onOpenChange={() => toggleProjectExpanded(String(project.id))}
											>
												<SidebarMenuItem>
													<CollapsibleTrigger asChild>
														<SidebarMenuButton className="w-full">
															<div className="flex items-center gap-2 flex-1">
																<FolderKanban className="h-4 w-4" />
																<span className="text-sm">{project.name}</span>
															</div>
															<ChevronRight
																className={`h-4 w-4 transition-transform ${expandedProjects.has(String(project.id)) ? "rotate-90" : ""
																	}`}
															/>
														</SidebarMenuButton>
													</CollapsibleTrigger>
													<CollapsibleContent>
														<SidebarMenuSub>
															{project.stages
																.map((stage) => (
																	<SidebarMenuSubItem key={stage.id}>
																		<SidebarMenuSubButton asChild>
																			<NavLink
																				to={`/user-project/${project.id}/stage/${stage.id}`}
																				className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent ${isStageActive(String(project.id), stage.id)
																					? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
																					: ""
																					}`}
																			>
																				<Layers className="h-3 w-3" />
																				<span className="text-sm">{stage.title}</span>
																			</NavLink>
																		</SidebarMenuSubButton>
																	</SidebarMenuSubItem>
																))}
														</SidebarMenuSub>
													</CollapsibleContent>
												</SidebarMenuItem>
											</Collapsible>
										))}
									</SidebarMenu>
								</SidebarGroupContent>
							</CollapsibleContent>
						</Collapsible>
					</SidebarGroup>
				)}

				{userRole === "user" && userDepartmentProjects.length > 0 && (
					<SidebarGroup>
						<Collapsible open={departmentProjectsOpen} onOpenChange={setDepartmentProjectsOpen}>
							<div className="flex items-center justify-between px-2">
								<CollapsibleTrigger className="flex flex-1 items-center justify-between py-1.5 text-sm font-medium hover:bg-sidebar-accent rounded-md transition-colors">
									<SidebarGroupLabel className="hover:bg-transparent">
										{departments.find(d => d.id === currentUser?.department)?.name || 'Department'} Projects
									</SidebarGroupLabel>
									<ChevronRight
										className={`h-4 w-4 transition-transform ${departmentProjectsOpen ? "rotate-90" : ""
											}`}
									/>
								</CollapsibleTrigger>
							</div>
							<CollapsibleContent>
								<SidebarGroupContent>
									<SidebarMenu>
										{userDepartmentProjects.map((project) => (
											<SidebarMenuItem key={project.id}>
												<SidebarMenuButton asChild>
													<NavLink
														to={getProjectUrl(project)}
														className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent ${isProjectActive(project)
															? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
															: ""
															}`}
													>
														<FolderKanban className="h-4 w-4" />
														<span className="text-sm">{project.name}</span>
													</NavLink>
												</SidebarMenuButton>
											</SidebarMenuItem>
										))}
									</SidebarMenu>
								</SidebarGroupContent>
							</CollapsibleContent>
						</Collapsible>
					</SidebarGroup>
				)}
			</SidebarContent>

			<ProjectDialog
				open={isProjectDialogOpen}
				onOpenChange={(open) => {
					setIsProjectDialogOpen(open);
					if (!open) setProjectToEdit(null);
				}}
				onSave={projectToEdit ? handleProjectUpdate : handleProjectSave}
				existingProjects={projects.map(p => p.name)}
				teamMembers={teamMembers}
				editProject={projectToEdit || undefined}
				departments={departments}
				currentUser={currentUser}
			/>

			<AssignGroupDialog
				open={isAssignGroupOpen}
				onOpenChange={(open) => {
					setIsAssignGroupOpen(open);
					if (!open) setProjectToAssign(null);
				}}
				project={projectToAssign}
				availableGroups={projectGroups.filter(g => projectToAssign?.department?.id === g.departmentId)}
				onAssign={handleAssignGroup}
			/>

			<AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Project</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone and will also delete all tasks associated with this project.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleProjectDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Sidebar>
	);
}
