import { api } from './api';
import { Task } from '@/types/task';

function mapTask(raw: any): Task {
	return {
		id: String(raw.id),
		title: raw.title,
		description: raw.description ?? '',
		project: raw.project ? raw.project.name : '',
		projectId: raw.project ? raw.project.id : undefined,
		assignee: raw.assignee ? raw.assignee.name : '',
		// Map multiple assignees
		assignedUsers: raw.assigned_users?.map((u: any) => ({
			id: String(u.id),
			name: u.name,
			status: u.pivot?.status || 'pending',
		})) || [],
		dueDate: raw.due_date ?? '',
		userStatus: raw.user_status || 'pending',
		projectStage: raw.project_stage_id ? String(raw.project_stage_id) : undefined,
		startStageId: raw.start_stage_id ? String(raw.start_stage_id) : undefined,
		priority: raw.priority || 'medium',
		createdAt: raw.created_at || new Date().toISOString(),
		tags: raw.tags || [],
		startDate: raw.start_date || undefined,
		attachments: raw.attachments?.map((a: any) => ({
			id: String(a.id),
			name: a.name || a.filename || 'file',
			url: a.url || a.path || '',
			type: 'file',
			uploadedAt: a.created_at || new Date().toISOString(),
		})) || [],
		isInSpecificStage: raw.is_in_specific_stage || false,
		revisionComment: raw.revision_comment || undefined,
		previousStage: raw.previous_stage_id ? String(raw.previous_stage_id) : undefined,
		originalAssignee: raw.original_assignee ? raw.original_assignee.name : undefined,
		completedAt: raw.completed_at || undefined,
		comments: raw.comments?.map((c: any) => ({
			id: String(c.id),
			comment: c.comment,
			userId: String(c.user_id),
			createdAt: c.created_at || new Date().toISOString(),
			user: c.user ? {
				id: String(c.user.id),
				name: c.user.name,
			} : undefined
		})) || [],
		revisionHistory: raw.revision_histories?.map((r: any) => ({
			id: String(r.id),
			comment: r.comment,
			requestedBy: r.requested_by || '',
			requestedAt: r.requested_at || r.created_at || new Date().toISOString(),
			resolvedAt: r.resolved_at || undefined,
		})) || [],
		taskHistory: raw.task_histories?.map((h: any) => ({
			id: String(h.id),
			action: h.action,
			details: h.details,
			user: h.user ? { id: String(h.user.id), name: h.user.name } : undefined,
			createdAt: h.created_at || new Date().toISOString(),
			previousDetails: h.previous_details,
		})) || [],
		subtasks: raw.subtasks?.map(mapTask) || [],
		parentId: raw.parent_id ? String(raw.parent_id) : null,
	};
}

export const taskService = {
	getAll: async (filters?: {
		projectId?: string; // backend expects project_id
		assigneeId?: string; // backend expects assignee_id
		userStatus?: string; // backend expects user_status
		search?: string; // (not implemented backend yet)
	}): Promise<Task[]> => {
		const params: any = {};
		if (filters?.projectId) params.project_id = filters.projectId;
		if (filters?.assigneeId) params.assignee_id = filters.assigneeId;
		if (filters?.userStatus) params.user_status = filters.userStatus;
		const { data } = await api.get('/tasks', { params });
		return Array.isArray(data) ? data.map(mapTask) : [];
	},

	getById: async (id: string): Promise<Task> => {
		const { data } = await api.get(`/tasks/${id}`);
		return mapTask(data);
	},

	create: async (task: Omit<Task, 'id' | 'createdAt' | 'project' | 'assignee' | 'assignedUsers' | 'startStageId'> & { projectId?: number; assigneeId?: number; assigneeIds?: number[]; projectStageId?: number; startStageId?: number }): Promise<Task> => {
		// Map to backend payload
		const payload: any = {
			title: task.title,
			description: task.description,
			project_id: task.projectId,
			assignee_id: task.assigneeId,
			assignee_ids: task.assigneeIds, // Multiple assignees
			user_status: task.userStatus,
			project_stage_id: task.projectStageId,
			start_stage_id: task.startStageId,
			due_date: task.dueDate,
			priority: task.priority,
			tags: task.tags,
			start_date: task.startDate,
			is_in_specific_stage: task.isInSpecificStage,
			revision_comment: task.revisionComment,
			parent_id: task.parentId,
		};
		console.log('=== TASK CREATE DEBUG ===');
		console.log('Input task:', task);
		console.log('Payload to backend:', payload);
		const { data } = await api.post('/tasks', payload);
		console.log('Response from backend:', data);
		return mapTask(data);
	},

	update: async (id: string, updates: Omit<Partial<Task>, 'startStageId'> & { projectId?: number; assigneeId?: number; assigneeIds?: number[]; projectStageId?: number; startStageId?: number; originalAssigneeId?: number }): Promise<Task> => {
		const payload: any = {
			title: updates.title,
			description: updates.description,
			project_id: updates.projectId,
			assignee_id: updates.assigneeId,
			assignee_ids: updates.assigneeIds, // Multiple assignees
			user_status: updates.userStatus,
			project_stage_id: updates.projectStageId,
			start_stage_id: updates.startStageId,
			due_date: updates.dueDate,
			priority: updates.priority,
			tags: updates.tags,
			start_date: updates.startDate,
			is_in_specific_stage: updates.isInSpecificStage,
			revision_comment: updates.revisionComment,
			previous_stage_id: updates.previousStage,
			original_assignee_id: updates.originalAssigneeId,
			completed_at: updates.completedAt,
			parent_id: updates.parentId,
		};
		const { data } = await api.put(`/tasks/${id}`, payload);
		return mapTask(data);
	},

	delete: async (id: string): Promise<void> => {
		await api.delete(`/tasks/${id}`);
	},

	move: async (id: string, stageId: string): Promise<Task> => {
		const { data } = await api.put(`/tasks/${id}`, { project_stage_id: stageId });
		return mapTask(data);
	},

	complete: async (id: string, data: { status?: string; projectStageId?: string; comment?: string; links?: string[]; files?: File[] }): Promise<Task> => {
		const formData = new FormData();
		if (data.status) formData.append('user_status', data.status);
		if (data.projectStageId) formData.append('project_stage_id', data.projectStageId);
		if (data.comment) formData.append('comment', data.comment);
		if (data.links) {
			data.links.forEach((link) => formData.append('links[]', link));
		}
		if (data.files) {
			data.files.forEach((file) => formData.append('files[]', file));
		}

		const { data: result } = await api.post(`/tasks/${id}/complete`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		return mapTask(result);
	},

	start: async (id: string): Promise<Task> => {
		const { data } = await api.post(`/tasks/${id}/start`);
		return mapTask(data);
	},

	getHistory: async (id: string, page: number = 1): Promise<{ data: any[]; meta: any }> => {
		const { data } = await api.get(`/tasks/${id}/history?page=${page}`);
		return {
			data: data.data.map((h: any) => ({
				id: String(h.id),
				action: h.action,
				details: h.details,
				user: h.user ? { id: String(h.user.id), name: h.user.name } : undefined,
				createdAt: h.created_at || new Date().toISOString(),
				previousDetails: h.previous_details,
			})),
			meta: {
				currentPage: data.current_page,
				lastPage: data.last_page,
				total: data.total
			}
		};
	},
};
