import { api } from './api';
import { HistoryEntry } from '@/types/history';

// Map backend history entry to frontend format
function mapHistoryEntry(raw: any): HistoryEntry {
	return {
		id: String(raw.id),
		timestamp: raw.timestamp || raw.created_at,
		userId: String(raw.user_id),
		action: raw.action,
		entityId: String(raw.entity_id),
		entityType: raw.entity_type,
		projectId: String(raw.project_id),
		details: raw.details || {},
		user: raw.user ? {
			id: String(raw.user.id),
			name: raw.user.name,
			role: raw.user.role,
		} : undefined,
	};
}

export const historyService = {
	getAll: async (): Promise<HistoryEntry[]> => {
		const { data } = await api.get('/history-entries');
		return Array.isArray(data) ? data.map(mapHistoryEntry) : [];
	},

	getByProject: async (projectId: string): Promise<HistoryEntry[]> => {
		const { data } = await api.get('/history-entries', {
			params: { project_id: projectId }
		});
		return Array.isArray(data) ? data.map(mapHistoryEntry) : [];
	},

	create: async (entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<HistoryEntry> => {
		// user_id is automatically added by the backend from the authenticated user
		const payload = {
			action: entry.action,
			entity_id: parseInt(entry.entityId, 10),
			entity_type: entry.entityType,
			project_id: parseInt(entry.projectId, 10),
			details: entry.details,
		};
		console.log('HistoryEntry create payload:', payload);
		try {
			const { data } = await api.post('/history-entries', payload);
			return mapHistoryEntry(data);
		} catch (e: any) {
			console.error('HistoryEntry create failed:', e?.response?.status, e?.response?.data);
			throw e;
		}
	},

	delete: async (id: string): Promise<void> => {
		await api.delete(`/history-entries/${id}`);
	},
};
