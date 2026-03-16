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
};
