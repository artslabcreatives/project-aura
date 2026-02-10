import { LayoutDashboard, Users, FolderKanban, Inbox, Plus, Layers, Pencil, Trash2, FileCog, Building2, FolderOpen, MoreHorizontal, Archive, RefreshCcw, Copy, Loader2, UserPlus } from "lucide-react";
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
	SidebarRail,
} from "@/components/ui/sidebar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { InviteUsersDialog } from "./InviteUsersDialog";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const mainMenuItems = [
	{ title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["admin", "team-lead", "user", "account-manager", "hr"] },
	{ title: "Team", url: "/team", icon: Users, roles: ["admin", "team-lead"] },
	{ title: "Tasks", url: "/tasks", icon: Inbox, roles: ["admin", "team-lead"] },
	{ title: "Review Needed", url: "/review-needed", icon: FileCog, roles: ["account-manager"] },
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
	const [archivedProjectsOpen, setArchivedProjectsOpen] = useState(false);
	const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
	const [projects, setProjects] = useState<Project[]>([]);
	const [teamMembers, setTeamMembers] = useState<User[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [assignedProjectsOpen, setAssignedProjectsOpen] = useState(true);
	const [departmentProjectsOpen, setDepartmentProjectsOpen] = useState(true);
	const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
	const [userAssignedProjects, setUserAssignedProjects] = useState<Project[]>([]);
	const [userDepartmentProjects, setUserDepartmentProjects] = useState<Project[]>([]);
	// hoveredProject state removed in favor of CSS hover
	const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
	const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
	const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
	const [isAssignGroupOpen, setIsAssignGroupOpen] = useState(false);
	const [projectToAssign, setProjectToAssign] = useState<Project | null>(null);
	const [expandedProjectGroups, setExpandedProjectGroups] = useState<Set<string>>(new Set());
	const [reviewNeededCount, setReviewNeededCount] = useState(0);
	const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
	const [projectToDuplicate, setProjectToDuplicate] = useState<Project | null>(null);
	const [newProjectName, setNewProjectName] = useState("");
	const [isDuplicating, setIsDuplicating] = useState(false);
	const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
	const [projectToInvite, setProjectToInvite] = useState<Project | null>(null);
	const [collaboratedProjects, setCollaboratedProjects] = useState<Project[]>([]);
	const [invitedProjectsOpen, setInvitedProjectsOpen] = useState(true);
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

			if (userRole === 'admin' || userRole === 'team-lead' || userRole === 'account-manager') {
				const usersData = await userService.getAll();
				setTeamMembers(usersData);
			}

			// Do NOT reset expanded departments here to avoid collapsing user view on refresh
			// setExpandedDepartments(new Set()); 

			if ((userRole === 'user' || userRole === 'account-manager') && currentUser) {
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

				// Calculate Review Needed count for Account Managers
				if (userRole === 'account-manager') {
					const count = tasksData.filter(task => {
						const isAssigned = task.assignee === currentUser.name ||
							(task.assignedUsers && task.assignedUsers.some(u => String(u.id) === String(currentUser.id)));

						if (!isAssigned) return false;

						// We need to find the project and the stage from the fresh data
						// Note: projectsData is usually available in scope here as it was fetched above
						const project = projectsData.find(p => p.name === task.project);
						if (!project) return false;

						const stage = project.stages.find(s => s.id === task.projectStage);
						if (!stage) return false;

						const isReview = stage.isReviewStage || stage.title.toLowerCase().includes("review");
						return isReview && task.userStatus !== 'complete';
					}).length;
					setReviewNeededCount(count);
				}

				const assignedProjects = projectsData
					.filter(project => userProjectStages.has(project.name) && !project.isArchived)
					.map(project => ({
						...project,
						stages: project.stages.filter(stage => {
							const title = stage.title.toLowerCase().trim();
							// Base hidden stages
							const hiddenStages = ['suggested', 'suggested task', 'task', 'archive', 'completed', 'pending'];

							// For account managers, hide review stages from this list (they have a dedicated view)
							if (currentUser.role === 'account-manager') {
								if (stage.isReviewStage || title.includes('review')) {
									return false;
								}
							}

							// User requested to hide specific system stages
							if (hiddenStages.includes(title)) return false;

							return userProjectStages.get(project.name)?.has(stage.id);
						})
					}))
					.filter(project => project.stages.length > 0);

				// Separately track projects where user is a collaborator (invited from other departments)
				const collabProjects = projectsData.filter(project =>
					!project.isArchived &&
					project.collaborators?.some(c => String(c.id) === String(currentUser.id))
				);

				setUserAssignedProjects(assignedProjects);
				setCollaboratedProjects(collabProjects);

				const currentDept = departmentsData.find(d => d.id === currentUser.department);
				const isDigitalDept = currentDept?.name.toLowerCase() === 'digital';
				const departmentProjects = projectsData.filter(project => {
					// Exclude archived projects
					if (project.isArchived) return false;
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

	const handleAssignGroup = async (project: Project, groupId: string | null, newGroupName?: string, newGroupParentId?: string | null) => {
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
				const newGroup = await projectGroupService.create(newGroupName, project.department.id, newGroupParentId);
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

	interface TreeGroup extends ProjectGroup {
		projects: Project[];
		children: TreeGroup[];
	}

	interface GroupedDepartment {
		id: string;
		name: string;
		rootGroups: TreeGroup[];
		ungroupedProjects: Project[];
	}

	// Group projects by department (admin) or filter flat list (team-lead)
	const { active: projectsByDepartment, archived: archivedProjectsByDepartment } = useMemo(() => {
		const groupProjects = (projectList: Project[]) => {
			let filteredProjects = projectList;

			// Filter projects by department for team-lead
			if (userRole === "team-lead" && currentUser) {
				const currentDept = departments.find(d => d.id === currentUser.department);
				const isDigitalDept = currentDept?.name.toLowerCase() === "digital";

				filteredProjects = projectList.filter(project => {
					const hasMatchingDepartment = project.department?.id === currentUser.department;
					const hasNoDepartment = !project.department;
					const isDesignProject = project.department?.name.toLowerCase() === "design";
					const hasSpecialPermission = isDigitalDept && isDesignProject;
					return hasMatchingDepartment || hasNoDepartment || hasSpecialPermission;
				});
			} else if (userRole === "account-manager" && currentUser) {
				// Account Manager: Strict Department Only
				filteredProjects = projectList.filter(project => {
					return project.department?.id === currentUser.department;
				});
			}

			// Helper to build tree
			const buildTree = (projects: Project[], departmentId: string | 'flat'): { rootGroups: TreeGroup[], ungroupedProjects: Project[] } => {
				const relevantGroups = projectGroups.filter(g =>
					departmentId === 'flat' ? true : g.departmentId === departmentId
				);

				const groupMap = new Map<string, TreeGroup>();
				relevantGroups.forEach(g => {
					groupMap.set(g.id, { ...g, projects: [], children: [] });
				});

				const ungrouped: Project[] = [];

				projects.forEach(project => {
					if (project.group && project.group.id && groupMap.has(project.group.id)) {
						groupMap.get(project.group.id)!.projects.push(project);
					} else {
						ungrouped.push(project);
					}
				});

				const rootGroups: TreeGroup[] = [];

				// Build hierarchy
				groupMap.forEach(group => {
					if (group.parentId && groupMap.has(group.parentId)) {
						groupMap.get(group.parentId)!.children.push(group);
					} else {
						rootGroups.push(group);
					}
				});

				return { rootGroups, ungroupedProjects: ungrouped };
			};

			// For team-lead non-digital (flat view previously, now hierarchy for their dept)
			if ((userRole === "team-lead" || userRole === "account-manager") && currentUser) {
				const currentDept = departments.find(d => d.id === currentUser.department);
				const isDigitalDept = currentDept?.name.toLowerCase() === "digital";

				if (!isDigitalDept) {
					const { rootGroups, ungroupedProjects } = buildTree(filteredProjects, 'flat');
					return {
						'flat': {
							id: 'flat',
							name: '',
							rootGroups,
							ungroupedProjects
						}
					};
				}
			}

			// Group by department
			const groupedByDept: Record<string, GroupedDepartment> = {};

			// Initialize departments
			departments.forEach(dept => {
				groupedByDept[dept.id] = {
					id: dept.id,
					name: dept.name,
					rootGroups: [],
					ungroupedProjects: []
				};
			});
			// Add uncategorized
			groupedByDept['uncategorized'] = {
				id: 'uncategorized',
				name: 'Uncategorized',
				rootGroups: [],
				ungroupedProjects: []
			};

			const projectsPerDept: Record<string, Project[]> = {};
			filteredProjects.forEach(p => {
				const deptId = p.department?.id || 'uncategorized';
				if (!projectsPerDept[deptId]) projectsPerDept[deptId] = [];
				projectsPerDept[deptId].push(p);
			});

			Object.keys(groupedByDept).forEach(deptId => {
				const deptProjects = projectsPerDept[deptId] || [];

				if (deptId === 'uncategorized') {
					groupedByDept[deptId].ungroupedProjects = deptProjects;
				} else {
					const { rootGroups, ungroupedProjects } = buildTree(deptProjects, deptId);
					groupedByDept[deptId].rootGroups = rootGroups;
					groupedByDept[deptId].ungroupedProjects = ungroupedProjects;
				}
			});

			const result: Record<string, GroupedDepartment> = {};
			Object.values(groupedByDept).forEach(g => {
				if (g.rootGroups.length > 0 || g.ungroupedProjects.length > 0) {
					result[g.id] = g;
				}
			});

			return result;
		};

		const pruneTree = (groups: TreeGroup[]): TreeGroup[] => {
			return groups
				.map(group => {
					const prunedChildren = pruneTree(group.children);
					return { ...group, children: prunedChildren };
				})
				.filter(group => group.projects.length > 0 || group.children.length > 0);
		};

		const pruneGroupsInDepartment = (groupedDepts: Record<string, GroupedDepartment>) => {
			const pruned: Record<string, GroupedDepartment> = {};
			Object.values(groupedDepts).forEach(dept => {
				const prunedRoots = pruneTree(dept.rootGroups);
				if (prunedRoots.length > 0 || dept.ungroupedProjects.length > 0) {
					pruned[dept.id] = { ...dept, rootGroups: prunedRoots };
				}
			});
			return pruned;
		};

		const activeList = projects.filter(p => !p.isArchived);
		const archivedList = projects.filter(p => p.isArchived);

		return {
			active: pruneGroupsInDepartment(groupProjects(activeList)),
			archived: pruneGroupsInDepartment(groupProjects(archivedList))
		};
	}, [projects, userRole, currentUser, departments, projectGroups]);

	const userDepartmentGroups = useMemo(() => {
		const deptId = currentUser?.department;
		// Filter groups to only show those in user's department
		const relevantGroups = projectGroups.filter(g => g.departmentId === deptId);

		const groupMap = new Map<string, TreeGroup>();
		relevantGroups.forEach(g => {
			groupMap.set(g.id, { ...g, projects: [], children: [] });
		});

		const ungrouped: Project[] = [];

		userDepartmentProjects.forEach(project => {
			if (project.group && project.group.id && groupMap.has(project.group.id)) {
				groupMap.get(project.group.id)!.projects.push(project);
			} else {
				ungrouped.push(project);
			}
		});

		const rootGroups: TreeGroup[] = [];

		groupMap.forEach(group => {
			if (group.parentId && groupMap.has(group.parentId)) {
				groupMap.get(group.parentId)!.children.push(group);
			} else {
				rootGroups.push(group);
			}
		});

		// Pruning logic to hide empty groups
		const pruneTree = (groups: TreeGroup[]): TreeGroup[] => {
			return groups
				.map(group => {
					const prunedChildren = pruneTree(group.children);
					return { ...group, children: prunedChildren };
				})
				.filter(group => group.projects.length > 0 || group.children.length > 0);
		};

		return { rootGroups: pruneTree(rootGroups), ungrouped };
	}, [userDepartmentProjects, projectGroups, currentUser]);

	const renderProjectGroup = (group: TreeGroup) => (
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
					<SidebarMenuSub className="mr-0 ml-3 border-l px-2">
						{group.children.map((child) => renderProjectGroup(child))}
						{group.projects.map((project) => renderProjectItem(project))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</SidebarMenuItem>
		</Collapsible>
	);

	const departmentGroups = Object.values(projectsByDepartment).sort((a, b) => {
		if (a.id === 'uncategorized') return 1;
		if (b.id === 'uncategorized') return -1;
		return a.name.localeCompare(b.name);
	});

	const archivedDepartmentGroups = Object.values(archivedProjectsByDepartment).sort((a, b) => {
		if (a.id === 'uncategorized') return 1;
		if (b.id === 'uncategorized') return -1;
		return a.name.localeCompare(b.name);
	});

	const handleArchiveProject = async (project: Project) => {
		try {
			await projectService.update(String(project.id), { isArchived: true });
			setProjects(prev => prev.map(p => p.id === project.id ? { ...p, isArchived: true } : p));

			// Notify other components (ProjectKanbanFixed) immediately
			window.dispatchEvent(new CustomEvent('project-state-changed', {
				detail: { projectId: project.id, isArchived: true }
			}));

			toast({ title: "Project archived" });
		} catch (error) {
			toast({ title: "Failed to archive project", variant: "destructive" });
		}
	};

	const handleUnarchiveProject = async (project: Project) => {
		try {
			await projectService.update(String(project.id), { isArchived: false });
			setProjects(prev => prev.map(p => p.id === project.id ? { ...p, isArchived: false } : p));

			// Notify other components (ProjectKanbanFixed) immediately
			window.dispatchEvent(new CustomEvent('project-state-changed', {
				detail: { projectId: project.id, isArchived: false }
			}));

			toast({ title: "Project restored" });
		} catch (error) {
			toast({ title: "Failed to restore project", variant: "destructive" });
		}
	};

	const handleDuplicateProject = async () => {
		if (!currentUser || !projectToDuplicate || !newProjectName.trim()) return;

		setIsDuplicating(true);
		try {
			// 1. Create the new project
			const newProject = await projectService.create({
				name: newProjectName,
				description: projectToDuplicate.description,
				// Same location: same department and group
				department: projectToDuplicate.department,
				group: projectToDuplicate.group,
				emails: [],
				phoneNumbers: [],
				stages: []
			});

			// 2. Fetch fresh project details to get default stages
			const fetchedNewProject = await projectService.getById(String(newProject.id));
			const existingSystemStages = new Map(fetchedNewProject.stages.map(s => [s.title.toLowerCase().trim(), s]));

			// 3. Prepare to replicate stages
			const sourceStages = projectToDuplicate.stages;

			const stageIdMap = new Map<string, number>(); // SourceID -> NewRealID
			const createdStages: { realId: number, originalStage: Stage }[] = [];

			for (const stage of sourceStages) {
				const systemStage = existingSystemStages.get(stage.title.toLowerCase().trim());

				if (systemStage) {
					// Update system stage
					stageIdMap.set(stage.id, Number(systemStage.id));

					await api.put(`/stages/${systemStage.id}`, {
						color: stage.color,
						order: stage.order,
						main_responsible_id: stage.mainResponsibleId,
						backup_responsible_id_1: stage.backupResponsibleId1,
						backup_responsible_id_2: stage.backupResponsibleId2,
					});
					createdStages.push({ realId: Number(systemStage.id), originalStage: stage });
				} else {
					// Create custom stage
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
					});
					stageIdMap.set(stage.id, response.data.id);
					createdStages.push({ realId: response.data.id, originalStage: stage });
				}
			}

			// 4. Link stages
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

				if (Object.keys(updates).length > 0) {
					await api.put(`/stages/${realId}`, updates);
				}
			}

			const projectsData = await projectService.getAll();
			setProjects(projectsData);

			addHistoryEntry({
				action: 'CREATE_PROJECT',
				entityId: newProject.id?.toString(),
				entityType: 'project',
				projectId: newProject.id?.toString(),
				userId: currentUser.id,
				details: { name: newProject.name, message: `Duplicated from ${projectToDuplicate.name}` },
			});

			toast({
				title: 'Project duplicated',
				description: `${newProjectName} created successfully.`,
			});

			setIsDuplicateDialogOpen(false);
			setNewProjectName("");
			setProjectToDuplicate(null);
			navigate(getProjectUrl(newProject));

		} catch (error) {
			console.error('Failed to duplicate project:', error);
			toast({
				title: 'Error',
				description: 'Failed to duplicate project.',
				variant: 'destructive',
			});
		} finally {
			setIsDuplicating(false);
		}
	};

	const filteredMainMenuItems = mainMenuItems.filter(item =>
		userRole && item.roles.includes(userRole)
	);

	const renderProjectItem = (project: Project) => (
		<SidebarMenuItem key={project.id}>
			<div className="relative group/project-item w-full">
				<SidebarMenuButton asChild>
					<NavLink
						to={getProjectUrl(project)}
						className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent pr-8 ${isProjectActive(project)
							? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
							: ""
							}`}
					>
						<FolderKanban className="h-4 w-4 shrink-0" />
						<span className="text-sm flex-1 truncate">{project.name}</span>
						{(userRole === 'admin' || userRole === 'team-lead') && project.hasPendingTasks && (
							<span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" title="Has Pending Tasks" />
						)}
					</NavLink>
				</SidebarMenuButton>

				{(userRole === 'admin' || userRole === 'team-lead') && (
					<div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/project-item:opacity-100 transition-opacity bg-sidebar/80 backdrop-blur-sm rounded">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 hover:bg-sidebar-accent"
									title="More Options"
								>
									<MoreHorizontal className="h-3 w-3" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" side="right" className="w-48">
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										setProjectToEdit(project);
										setIsProjectDialogOpen(true);
									}}
								>
									<Pencil className="mr-2 h-4 w-4" />
									<span>Edit Project</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										setProjectToDuplicate(project);
										setNewProjectName(`${project.name} (Copy)`);
										setIsDuplicateDialogOpen(true);
									}}
								>
									<Copy className="mr-2 h-4 w-4" />
									<span>Duplicate Project</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										setProjectToAssign(project);
										setIsAssignGroupOpen(true);
									}}
								>
									<FolderPlus className="mr-2 h-4 w-4" />
									<span>Assign to Group</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										setProjectToInvite(project);
										setIsInviteDialogOpen(true);
									}}
								>
									<UserPlus className="mr-2 h-4 w-4" />
									<span>Invite Users</span>
								</DropdownMenuItem>
								{!project.isArchived ? (
									<DropdownMenuItem
										onClick={(e) => {
											e.stopPropagation();
											handleArchiveProject(project);
										}}
									>
										<Archive className="mr-2 h-4 w-4" />
										<span>Archive Project</span>
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem
										onClick={(e) => {
											e.stopPropagation();
											handleUnarchiveProject(project);
										}}
									>
										<RefreshCcw className="mr-2 h-4 w-4" />
										<span>Restore Project</span>
									</DropdownMenuItem>
								)}
								<DropdownMenuItem
									className="text-destructive focus:text-destructive"
									onClick={(e) => {
										e.stopPropagation();
										setProjectToDelete(project);
									}}
								>
									<Trash2 className="mr-2 h-4 w-4" />
									<span>Delete Project</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
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
											data-tour={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
											className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent"
											activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
										>
											<item.icon className="h-4 w-4" />
											<span className="flex-1">{item.title}</span>
											{item.title === "Review Needed" && reviewNeededCount > 0 && (
												<span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-semibold text-white bg-primary rounded-full animate-in zoom-in-50 duration-300">
													{reviewNeededCount}
												</span>
											)}
										</NavLink>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{(userRole === "user" || userRole === "account-manager") && userAssignedProjects.length > 0 && (
					<SidebarGroup data-tour="projects-list">
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

				{/* Invited Projects Section - shows projects user was invited to collaborate on */}
				{(userRole === "user" || userRole === "account-manager") && collaboratedProjects.length > 0 && (
					<SidebarGroup>
						<Collapsible open={invitedProjectsOpen} onOpenChange={setInvitedProjectsOpen}>
							<div className="flex items-center justify-between px-2">
								<CollapsibleTrigger className="flex flex-1 items-center justify-between py-1.5 text-sm font-medium hover:bg-sidebar-accent rounded-md transition-colors">
									<SidebarGroupLabel className="hover:bg-transparent">Invited Projects</SidebarGroupLabel>
									<ChevronRight
										className={`h-4 w-4 transition-transform ${invitedProjectsOpen ? "rotate-90" : ""
											}`}
									/>
								</CollapsibleTrigger>
							</div>
							<CollapsibleContent>
								<SidebarGroupContent>
									<SidebarMenu>
										{/* Group collaborated projects by department */}
										{Object.entries(
											collaboratedProjects.reduce((acc, project) => {
												const deptName = project.department?.name || 'Other';
												if (!acc[deptName]) acc[deptName] = [];
												acc[deptName].push(project);
												return acc;
											}, {} as Record<string, Project[]>)
										).map(([deptName, deptProjects]) => (
											<Collapsible
												key={deptName}
												open={expandedDepartments.has(`invited-${deptName}`)}
												onOpenChange={() => {
													const key = `invited-${deptName}`;
													setExpandedDepartments(prev => {
														const newSet = new Set(prev);
														if (newSet.has(key)) {
															newSet.delete(key);
														} else {
															newSet.add(key);
														}
														return newSet;
													});
												}}
											>
												<SidebarMenuItem>
													<CollapsibleTrigger asChild>
														<SidebarMenuButton className="w-full">
															<div className="flex items-center gap-2 flex-1">
																<Building2 className="h-4 w-4" />
																<span className="text-sm font-medium">{deptName}</span>
															</div>
															<ChevronRight
																className={`h-4 w-4 transition-transform ${expandedDepartments.has(`invited-${deptName}`) ? "rotate-90" : ""
																	}`}
															/>
														</SidebarMenuButton>
													</CollapsibleTrigger>
													<CollapsibleContent>
														<SidebarMenuSub>
															{deptProjects.map(project => (
																<SidebarMenuSubItem key={project.id}>
																	<SidebarMenuSubButton asChild>
																		<NavLink
																			to={`/project/${project.id}`}
																			className={`flex items-center gap-2 ${location.pathname === `/project/${project.id}` ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""
																				}`}
																		>
																			<FolderKanban className="h-3 w-3" />
																			<span className="text-sm">{project.name}</span>
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

				{(userRole === "admin" || userRole === "team-lead" || userRole === "account-manager") && (
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
								{(userRole === 'admin' || userRole === 'team-lead') && (
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 ml-1"
										onClick={() => setIsProjectDialogOpen(true)}
										title="Add new project"
										data-tour="create-project-btn"
									>
										<Plus className="h-4 w-4" />
									</Button>
								)}
							</div>
							<CollapsibleContent>
								<SidebarGroupContent>
									<SidebarMenu>
										{departmentGroups.length === 0 ? (
											<div className="px-3 py-2 text-sm text-muted-foreground">
												No projects found
											</div>
										) : (userRole === "team-lead" || userRole === "account-manager") && departmentGroups[0]?.id === 'flat' ? (
											// Non-Digital Team-lead: Show flat list (with hierarchy support)
											<>
												{departmentGroups[0].rootGroups.map(group => renderProjectGroup(group))}
												{departmentGroups[0].ungroupedProjects.map((project) => renderProjectItem(project))}
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
																<div className="flex items-center gap-2 flex-1 w-full">
																	<Building2 className="h-4 w-4 shrink-0" />
																	<span className="text-sm font-medium flex-1 truncate">{departmentGroup.name}</span>
																	<span className="text-xs text-muted-foreground mr-2 shrink-0">
																		({(() => {
																			const countGroupProjects = (group: TreeGroup): number => {
																				return group.projects.length + group.children.reduce((acc, child) => acc + countGroupProjects(child), 0);
																			};
																			return departmentGroup.ungroupedProjects.length + departmentGroup.rootGroups.reduce((acc, group) => acc + countGroupProjects(group), 0);
																		})()})
																	</span>
																</div>
																<ChevronRight
																	className={`h-4 w-4 shrink-0 transition-transform ${expandedDepartments.has(departmentGroup.id) ? "rotate-90" : ""
																		}`}
																/>
															</SidebarMenuButton>
														</CollapsibleTrigger>
														<CollapsibleContent>
															<SidebarMenuSub className="mr-0 ml-3 border-l px-2">
																{/* Render Root Project Groups within Department */}
																{departmentGroup.rootGroups.map(group => renderProjectGroup(group))}

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

				{(userRole === 'admin' || userRole === 'team-lead' || userRole === 'account-manager') && archivedDepartmentGroups.length > 0 && (
					<SidebarGroup>
						<Collapsible open={archivedProjectsOpen} onOpenChange={setArchivedProjectsOpen}>
							<div className="flex items-center justify-between px-2">
								<CollapsibleTrigger className="flex flex-1 items-center justify-between py-1.5 text-sm font-medium hover:bg-sidebar-accent rounded-md transition-colors">
									<SidebarGroupLabel className="hover:bg-transparent">Archived Projects</SidebarGroupLabel>
									<ChevronRight
										className={`h-4 w-4 transition-transform ${archivedProjectsOpen ? "rotate-90" : ""
											}`}
									/>
								</CollapsibleTrigger>
							</div>
							<CollapsibleContent>
								<SidebarGroupContent>
									<SidebarMenu>
										{(userRole === "team-lead" || userRole === "account-manager") && archivedDepartmentGroups[0]?.id === 'flat' ? (
											<>
												{archivedDepartmentGroups[0].rootGroups.map(group => renderProjectGroup(group))}
												{archivedDepartmentGroups[0].ungroupedProjects.map((project) => renderProjectItem(project))}
											</>
										) : (
											archivedDepartmentGroups.map((departmentGroup) => (
												<Collapsible
													key={departmentGroup.id}
													open={expandedDepartments.has(departmentGroup.id + '-archive')}
													onOpenChange={() => toggleDepartmentExpanded(departmentGroup.id + '-archive')}
												>
													<SidebarMenuItem>
														<CollapsibleTrigger asChild>
															<SidebarMenuButton className="w-full">
																<div className="flex items-center gap-2 flex-1 w-full">
																	<Building2 className="h-4 w-4 shrink-0" />
																	<span className="text-sm font-medium flex-1 truncate">{departmentGroup.name}</span>
																	<span className="text-xs text-muted-foreground mr-2 shrink-0">
																		({(() => {
																			const countGroupProjects = (group: TreeGroup): number => {
																				return group.projects.length + group.children.reduce((acc, child) => acc + countGroupProjects(child), 0);
																			};
																			return departmentGroup.ungroupedProjects.length + departmentGroup.rootGroups.reduce((acc, group) => acc + countGroupProjects(group), 0);
																		})()})
																	</span>
																</div>
																<ChevronRight
																	className={`h-4 w-4 shrink-0 transition-transform ${expandedDepartments.has(departmentGroup.id + '-archive') ? "rotate-90" : ""
																		}`}
																/>
															</SidebarMenuButton>
														</CollapsibleTrigger>
														<CollapsibleContent>
															<SidebarMenuSub className="mr-0 ml-3 border-l px-2">
																{departmentGroup.rootGroups.map(group => renderProjectGroup(group))}
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



				{(userRole === "user") && userDepartmentProjects.length > 0 && (
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
										{userDepartmentGroups.rootGroups.map((group) => renderProjectGroup(group))}
										{userDepartmentGroups.ungrouped.map((project) => renderProjectItem(project))}
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
			<SidebarRail />
			<Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Duplicate Project</DialogTitle>
						<DialogDescription>
							Enter a name for the new project. All stages will be copied from <strong>{projectToDuplicate?.name}</strong>. Tasks will not be copied.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Label htmlFor="projectName">Project Name</Label>
						<Input
							id="projectName"
							value={newProjectName}
							onChange={(e) => setNewProjectName(e.target.value)}
							placeholder="New Project Name"
							className="mt-2"
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>Cancel</Button>
						<Button onClick={handleDuplicateProject} disabled={!newProjectName.trim() || isDuplicating}>
							{isDuplicating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{isDuplicating ? "Duplicating..." : "Duplicate Project"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<InviteUsersDialog
				open={isInviteDialogOpen}
				onOpenChange={(open) => {
					setIsInviteDialogOpen(open);
					if (!open) setProjectToInvite(null);
				}}
				project={projectToInvite}
				allUsers={teamMembers}
				onUpdate={(updatedProject) => {
					setProjects(prev =>
						prev.map(p => p.id === updatedProject.id ? updatedProject : p)
					);
				}}
			/>
		</Sidebar>
	);
}
