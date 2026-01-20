import { api } from './api';
import { Stage } from '@/types/stage';

// Helper to map frontend Stage to backend format
function mapToBackend(stage: Partial<Stage> & { projectId?: string | number }): any {
	return {
		title: stage.title,
		color: stage.color,
		order: stage.order,
		type: stage.type,
		project_id: stage.projectId ? String(stage.projectId) : undefined,
		main_responsible_id: stage.mainResponsibleId ? parseInt(stage.mainResponsibleId) : null,
		backup_responsible_id_1: stage.backupResponsibleId1 ? parseInt(stage.backupResponsibleId1) : null,
		backup_responsible_id_2: stage.backupResponsibleId2 ? parseInt(stage.backupResponsibleId2) : null,
		is_review_stage: stage.isReviewStage,
		linked_review_stage_id: stage.linkedReviewStageId ? parseInt(stage.linkedReviewStageId) : null,
		approved_target_stage_id: stage.approvedTargetStageId ? parseInt(stage.approvedTargetStageId) : null,
	};
}

// Helper to map backend format to frontend Stage
function mapFromBackend(raw: any): Stage {
	let color = raw.color;
	if (!color) {
		const t = raw.title?.toLowerCase().trim();
		if (t?.includes('suggested')) color = 'bg-blue-400';
		else if (t === 'pending') color = 'bg-orange-300';
		else if (t?.includes('complete')) color = 'bg-green-500';
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

export const stageService = {
	getAll: async (): Promise<Stage[]> => {
		const { data } = await api.get('/stages');
		return Array.isArray(data) ? data.map(mapFromBackend) : [];
	},

	getById: async (id: string): Promise<Stage> => {
		const { data } = await api.get(`/stages/${id}`);
		return mapFromBackend(data);
	},

	getByProject: async (projectId: string): Promise<Stage[]> => {
		const { data } = await api.get(`/stages`, { params: { project_id: projectId } });
		return Array.isArray(data) ? data.map(mapFromBackend) : [];
	},

	create: async (stage: Omit<Stage, 'id'> & { projectId?: string | number }): Promise<Stage> => {
		const payload = mapToBackend(stage);
		const { data } = await api.post('/stages', payload);
		return mapFromBackend(data);
	},

	update: async (id: string, updates: Partial<Stage>): Promise<Stage> => {
		const payload = mapToBackend(updates);
		// If we are sending partial updates, we should clear undefined keys if the backend doesn't support PATCH merging nicely
		// But usually PUT replaces or PATCH updates efficiently.
		// Assuming PUT/PATCH with partial fields is okay if keys are present.
		// mapToBackend returns a robust object with extensive keys. We should filter out undefined ones if they weren't in 'updates'.

		// Refined approach: only include keys that were in 'updates'
		const refinedPayload: any = {};
		if ('title' in updates) refinedPayload.title = updates.title;
		if ('color' in updates) refinedPayload.color = updates.color;
		if ('order' in updates) refinedPayload.order = updates.order;
		if ('type' in updates) refinedPayload.type = updates.type;
		// @ts-ignore
		if ('projectId' in updates) refinedPayload.project_id = updates.projectId;
		if ('mainResponsibleId' in updates) refinedPayload.main_responsible_id = updates.mainResponsibleId ? parseInt(updates.mainResponsibleId) : null;
		if ('backupResponsibleId1' in updates) refinedPayload.backup_responsible_id_1 = updates.backupResponsibleId1 ? parseInt(updates.backupResponsibleId1) : null;
		if ('backupResponsibleId2' in updates) refinedPayload.backup_responsible_id_2 = updates.backupResponsibleId2 ? parseInt(updates.backupResponsibleId2) : null;
		if ('isReviewStage' in updates) refinedPayload.is_review_stage = updates.isReviewStage;
		if ('linkedReviewStageId' in updates) refinedPayload.linked_review_stage_id = updates.linkedReviewStageId ? parseInt(updates.linkedReviewStageId) : null;
		if ('approvedTargetStageId' in updates) refinedPayload.approved_target_stage_id = updates.approvedTargetStageId ? parseInt(updates.approvedTargetStageId) : null;

		const { data } = await api.put(`/stages/${id}`, refinedPayload);
		return mapFromBackend(data);
	},

	delete: async (id: string): Promise<void> => {
		await api.delete(`/stages/${id}`);
	},
};
