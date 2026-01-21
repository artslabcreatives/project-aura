import { api } from './api';
import { Project } from '@/types/project';
import { Stage } from '@/types/stage';
import { SuggestedTask } from '@/types/task';

// Map backend stage (snake_case) to frontend Stage interface
function mapStage(raw: any): Stage {
	let color = raw.color;
	if (!color) {
		const t = raw.title.toLowerCase().trim();
		if (t.includes('suggested')) color = 'bg-blue-400';
		else if (t === 'pending') color = 'bg-orange-300';
		else if (t.includes('complete')) color = 'bg-green-500';
		else if (t === 'archive') color = 'bg-gray-400';
		else color = 'bg-status-todo';
	}

	return {
		id: String(raw.id),
		title: raw.title,
		color: color,
		order: raw.order ?? 0,
		type: (raw.type === 'user' || raw.type === 'project') ? raw.type : 'project',
		mainResponsibleId: raw.main_responsible_id ? String(raw.main_responsible_id) : undefined,
		backupResponsibleId1: raw.backup_responsible_id_1 ? String(raw.backup_responsible_id_1) : undefined,
		backupResponsibleId2: raw.backup_responsible_id_2 ? String(raw.backup_responsible_id_2) : undefined,
		isReviewStage: raw.is_review_stage ?? false,
		linkedReviewStageId: raw.linked_review_stage_id ? String(raw.linked_review_stage_id) : undefined,
		approvedTargetStageId: raw.approved_target_stage_id ? String(raw.approved_target_stage_id) : undefined,
	};
}

function mapProject(raw: any): Project {
	// Determine if Pending stage has tasks
	// 1. Find the Pending stage ID (case-insensitive)
	const pendingStage = Array.isArray(raw.stages)
		? raw.stages.find((s: any) => s.title?.toLowerCase()?.trim() === 'pending')
		: null;

	let hasPendingTasks = false;
	if (pendingStage && Array.isArray(raw.tasks)) {
		// Check if any task belongs to the Pending stage
		hasPendingTasks = raw.tasks.some((t: any) => String(t.project_stage_id) === String(pendingStage.id));
	}

	return {
		id: raw.id,
		name: raw.name,
		description: raw.description ?? '',
		createdAt: raw.created_at,
		stages: Array.isArray(raw.stages) ? raw.stages.map(mapStage) : [],
		department: raw.department ? { id: String(raw.department.id), name: raw.department.name } : undefined,
		emails: raw.emails || [],
		phoneNumbers: raw.phoneNumbers || [],
		group: raw.group ? { id: String(raw.group.id), name: raw.group.name, departmentId: String(raw.group.department_id) } : undefined,
		hasPendingTasks,
		isArchived: raw.is_archived,
	};
}

export const projectService = {
	getAll: async (): Promise<Project[]> => {
		const { data } = await api.get('/projects');
		// Axios returns response.data already via interceptor; but our api instance returns {data:..}
		const raw = data || data === 0 ? data : data; // defensive
		return Array.isArray(raw) ? raw.map(mapProject) : [];
	},

	getById: async (id: string): Promise<Project> => {
		const { data } = await api.get(`/projects/${id}`);
		return mapProject(data);
	},

	getByName: async (name: string): Promise<Project | null> => {
		const projects = await projectService.getAll();
		return projects.find(p => p.name === name) || null;
	},

	create: async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
		// Backend expects department_id not nested object
		const payload: any = {
			name: project.name,
			description: project.description,
			department_id: project.department ? parseInt(project.department.id, 10) : null,
			emails: project.emails,
			phone_numbers: project.phoneNumbers,
			project_group_id: project.group ? parseInt(project.group.id, 10) : null,
		};
		const { data } = await api.post('/projects', payload);
		return mapProject(data);
	},

	update: async (id: string, updates: Partial<Project>): Promise<Project> => {
		const payload: any = {
			name: updates.name,
			description: updates.description,
			department_id: updates.department ? parseInt(updates.department.id, 10) : undefined,
			emails: updates.emails,
			phone_numbers: updates.phoneNumbers,
			project_group_id: updates.group === null ? null : (updates.group ? parseInt(updates.group.id, 10) : undefined),
			is_archived: updates.isArchived,
		};
		const { data } = await api.put(`/projects/${id}`, payload);
		return mapProject(data);
	},

	delete: async (id: string): Promise<void> => {
		await api.delete(`/projects/${id}`);
	},

	getSuggestedTasks: async (projectId: string): Promise<SuggestedTask[]> => {
		const { data } = await api.get(`/projects/${projectId}/suggested-tasks`);
		return Array.isArray(data) ? data.map((raw: any) => ({
			id: String(raw.id),
			title: raw.title,
			description: raw.description,
			source: raw.source,
			suggestedAt: raw.suggested_at,
		})) : [];
	},
};
