import { api } from './api';
import { ProjectReport, ReportActivity } from '../types/report';

export const reportService = {
    async getReports(projectId?: string): Promise<ProjectReport[]> {
        const url = projectId ? `/reports?project_id=${projectId}` : '/reports';
        const response = await api.get(url);
        return response.data;
    },

    async getReport(id: string): Promise<ProjectReport> {
        const response = await api.get(`/reports/${id}`);
        return response.data;
    },

    async uploadReport(data: { project_id: string; title: string; description?: string; report_file: File }): Promise<ProjectReport> {
        const formData = new FormData();
        formData.append('project_id', data.project_id);
        formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        formData.append('report_file', data.report_file);

        const response = await api.post('/reports', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async updateReport(id: string, data: { title?: string; description?: string; report_file?: File }): Promise<ProjectReport> {
        const formData = new FormData();
        if (data.title) formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        if (data.report_file) formData.append('report_file', data.report_file);

        const response = await api.post(`/reports/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    async tlApprove(id: string, comment?: string): Promise<ProjectReport> {
        const response = await api.post(`/reports/${id}/tl-approve`, { comment });
        return response.data;
    },

    async hrApprove(id: string, comment?: string): Promise<ProjectReport> {
        const response = await api.post(`/reports/${id}/hr-approve`, { comment });
        return response.data;
    },

    async reject(id: string, comment: string): Promise<ProjectReport> {
        const response = await api.post(`/reports/${id}/reject`, { comment });
        return response.data;
    },

    async addComment(id: string, comment: string): Promise<ReportActivity> {
        const response = await api.post(`/reports/${id}/comment`, { comment });
        return response.data;
    }
};
