import { api } from './api';

export interface AnalyticsFilter {
    period: 'week' | 'month' | 'quarter' | 'year';
    project_id?: string;
    stage_id?: string;
    user_id?: string;
    priority?: 'low' | 'medium' | 'high';
    start_date?: string;
    end_date?: string;
}

export const analyticsService = {
    getDashboard: async (filter: AnalyticsFilter) => {
        const { data } = await api.get('/analytics/dashboard', { params: filter });
        return data;
    },

    getCompletion: async (filter: AnalyticsFilter) => {
        const { data } = await api.get('/analytics/completion', { params: filter });
        return data;
    },

    getCompletionRate: async (filter: AnalyticsFilter) => {
        const { data } = await api.get('/analytics/completion-rate', { params: filter });
        return data;
    },

    getCompletionTime: async (filter: AnalyticsFilter) => {
        const { data } = await api.get('/analytics/completion-time', { params: filter });
        return data;
    }
};
