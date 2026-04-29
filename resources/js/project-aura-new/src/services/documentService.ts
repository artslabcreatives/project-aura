import { api } from './api';
import { Document, DocumentGrouped } from '@/types/document';

export const documentService = {
    list: async (status: 'approved' | 'pending' = 'approved'): Promise<DocumentGrouped> => {
        const response = await api.get<DocumentGrouped>(`/documents?status=${status}`);
        return response.data;
    },

    upload: async (data: { name: string; department_id: number; upload_key?: string; file?: File }) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('department_id', String(data.department_id));
        if (data.upload_key) formData.append('upload_key', data.upload_key);
        if (data.file) formData.append('file', data.file);

        const response = await api.post<Document>('/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    approve: async (id: string) => {
        const response = await api.post<Document>(`/documents/${id}/approve`);
        return response.data;
    },

    reject: async (id: string, reason: string) => {
        const response = await api.post<Document>(`/documents/${id}/reject`, { reason });
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/documents/${id}`);
    },
    
    download: async (id: string, mode: 'download' | 'view' = 'download') => {
        const response = await api.get<{ url: string; name: string }>(`/documents/${id}/download?mode=${mode}`);
        return response.data;
    },
};
