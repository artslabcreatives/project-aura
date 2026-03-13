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

	// Determine if there are overdue tasks
	// Ignore "completed" and "archive" stages
	const ignoreStages = Array.isArray(raw.stages)
		? raw.stages.filter((s: any) => {
			const t = s.title?.toLowerCase()?.trim();
			return t === 'completed' || t === 'complete' || t === 'archive';
		}).map((s: any) => String(s.id))
		: [];

	const now = new Date();
	let hasOverdueTasks = false;
	if (raw.status !== 'on-hold' && Array.isArray(raw.tasks)) {
		hasOverdueTasks = raw.tasks.some((t: any) => {
			if (!t.due_date || t.user_status === 'complete') return false;
			const dueDate = new Date(t.due_date);
			const isOverdue = dueDate < now;
			const isIgnoredStage = ignoreStages.includes(String(t.project_stage_id));
			return isOverdue && !isIgnoredStage;
		});
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
		hasOverdueTasks,
		isArchived: raw.is_archived,
		collaborators: Array.isArray(raw.collaborators)
			? raw.collaborators.map((c: any) => ({
				id: c.id,
				name: c.name,
				email: c.email,
				department_id: c.department_id,
				role: c.role,
			}))
			: undefined,
		mattermostChannelId: raw.mattermost_channel_id || undefined,
		clientId: raw.client_id,
		estimatedHours: raw.estimated_hours,
		status: raw.status,
		client: raw.client,
		poNumber: raw.po_number,
		poDocument: raw.po_document,
		poDocumentUrl: raw.po_document_url,
		isLockedByPo: raw.is_locked_by_po,
		deadline: raw.deadline,
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

	create: async (project: any): Promise<Project> => {
		const isFormData = project.po_document instanceof File;
		
		let payload: any;
		if (isFormData) {
			payload = new FormData();
			payload.append('name', project.name || '');
			payload.append('description', project.description || '');
			if (project.department?.id) payload.append('department_id', String(project.department.id));
			if (project.group?.id) payload.append('project_group_id', String(project.group.id));
			if (project.client_id) payload.append('client_id', String(project.client_id));
			if (project.estimated_hours) payload.append('estimated_hours', String(project.estimated_hours));
			if (project.status) payload.append('status', String(project.status));
			if (project.po_number) payload.append('po_number', String(project.po_number));
			if (project.deadline) payload.append('deadline', project.deadline);
			if (project.po_document) payload.append('po_document', project.po_document);
			
			// Append arrays
			project.emails?.forEach((email: string) => payload.append('emails[]', email));
			project.phoneNumbers?.forEach((phone: string) => payload.append('phone_numbers[]', phone));
		} else {
			payload = {
				name: project.name,
				description: project.description,
				department_id: project.department ? parseInt(project.department.id, 10) : null,
				emails: project.emails,
				phone_numbers: project.phoneNumbers,
				project_group_id: project.group ? parseInt(project.group.id, 10) : null,
				client_id: project.client_id,
				estimated_hours: project.estimated_hours,
				status: project.status,
				po_number: project.po_number,
				deadline: project.deadline,
			};
		}

		const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
		const { data } = await api.post('/projects', payload, config);
		return mapProject(data);
	},

	update: async (id: string, updates: any): Promise<Project> => {
		const isFormData = updates.po_document instanceof File;

		let payload: any;
		if (isFormData) {
			payload = new FormData();
			payload.append('_method', 'PUT');
			if (updates.name !== undefined) payload.append('name', updates.name);
			if (updates.description !== undefined) payload.append('description', updates.description || '');
			if (updates.department?.id) payload.append('department_id', String(updates.department.id));
			if (updates.group === null) payload.append('project_group_id', '');
			else if (updates.group?.id) payload.append('project_group_id', String(updates.group.id));
			if (updates.isArchived !== undefined) payload.append('is_archived', updates.isArchived ? '1' : '0');
			
			// Fix null/undefined numeric relationships so Laravel validation passes
			if (updates.client_id !== undefined && updates.client_id !== null && updates.client_id !== '') {
				payload.append('client_id', String(updates.client_id));
			}
			if (updates.estimated_hours !== undefined && updates.estimated_hours !== null && updates.estimated_hours !== '') {
				payload.append('estimated_hours', String(updates.estimated_hours));
			}

			if (updates.status !== undefined) payload.append('status', updates.status);
			if (updates.po_number !== undefined) payload.append('po_number', updates.po_number);
			if (updates.deadline !== undefined) payload.append('deadline', updates.deadline);
			if (updates.po_document !== undefined) payload.append('po_document', updates.po_document);

			// Append arrays
			updates.emails?.forEach((email: string) => payload.append('emails[]', email));
			updates.phoneNumbers?.forEach((phone: string) => payload.append('phone_numbers[]', phone));
		} else {
			payload = {
				name: updates.name,
				description: updates.description,
				department_id: updates.department ? parseInt(updates.department.id, 10) : undefined,
				emails: updates.emails,
				phone_numbers: updates.phoneNumbers,
				project_group_id: updates.group === null ? null : (updates.group ? parseInt(updates.group.id, 10) : undefined),
				is_archived: updates.isArchived,
				client_id: updates.client_id,
				estimated_hours: updates.estimated_hours,
				status: updates.status,
				po_number: updates.po_number,
				deadline: updates.deadline,
				po_document: updates.po_document,
			};
		}

		const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
		const method = isFormData ? 'post' : 'put';
		const { data } = await api[method](`/projects/${id}`, payload, config);
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
