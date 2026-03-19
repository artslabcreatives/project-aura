import { api } from './api';

export interface Notification {
    id: string;
    type: string;
    data: {
        title: string;
        message: string;
        link?: string;
        project_id?: string;
        task_id?: string;
    };
    read_at: string | null;
    created_at: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    unread_count: number;
}

export const notificationService = {
    getAll: async (): Promise<NotificationResponse> => {
        const { data } = await api.get('/notifications');
        // Ensure we handle the structure correctly if the API wrapper unwraps it
        return data;
    },

    markAsRead: async (id: string): Promise<void> => {
        await api.patch(`/notifications/${id}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await api.post('/notifications/read-all');
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/notifications/${id}`);
    },
};
