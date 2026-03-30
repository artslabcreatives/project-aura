import { api } from './api';
import { Estimate } from '@/types/estimate';

export const estimateService = {
	getAll: async (clientId?: number | string): Promise<Estimate[]> => {
		const { data } = await api.get('/estimates', {
			params: clientId ? { client_id: clientId } : undefined,
		});
		return data;
	},

	getById: async (id: number | string): Promise<Estimate> => {
		const { data } = await api.get(`/estimates/${id}`);
		return data;
	},

	create: async (estimate: Omit<Estimate, 'id' | 'created_at' | 'updated_at' | 'client'>): Promise<Estimate> => {
		const { data } = await api.post('/estimates', estimate);
		return data;
	},

	update: async (id: number | string, estimate: Partial<Estimate>): Promise<Estimate> => {
		const { data } = await api.put(`/estimates/${id}`, estimate);
		return data;
	},

	delete: async (id: number | string): Promise<void> => {
		await api.delete(`/estimates/${id}`);
	},

	updateStatus: async (id: number | string, status: Estimate['status']): Promise<Estimate> => {
		const { data } = await api.put(`/estimates/${id}/status`, { status });
		return data;
	},

	convertToProject: async (id: number | string): Promise<{ project_id: number }> => {
		const { data } = await api.post(`/estimates/${id}/convert-to-project`, {});
		return data;
	},

	/** Trigger a manual sync of Xero Quotes into local estimates. */
	syncFromXero: async (): Promise<{ message: string; created: number; updated: number; skipped: number }> => {
		const { data } = await api.post('/xero/sync', {});
		return data;
	},

	/** Return Xero connection status. */
	xeroStatus: async (): Promise<{ connected: boolean; tenant_name?: string; token_is_expired?: boolean }> => {
		const { data } = await api.get('/xero/status');
		return data;
	},

	/** Get the Xero OAuth2 authorisation URL. */
	xeroAuthUrl: async (): Promise<{ url: string }> => {
		const { data } = await api.get('/xero/auth-url');
		return data;
	},
};
