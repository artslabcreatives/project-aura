import { api } from "@/lib/api";

export interface Reminder {
    id: number;
    user_id: number;
    title: string;
    description?: string;
    reminder_at: string;
    is_sent: boolean;
    is_read: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateReminderData {
    title: string;
    description?: string;
    reminder_at: string; // ISO string
}

export interface UpdateReminderData {
    title?: string;
    description?: string;
    reminder_at?: string;
    is_read?: boolean;
}

export const reminderService = {
    getAll: async (page = 1): Promise<{ active: Reminder[], completed: { data: Reminder[], current_page: number, last_page: number } }> => {
        return await api.get<{ active: Reminder[], completed: { data: Reminder[], current_page: number, last_page: number } }>(`/reminders?page=${page}`);
    },

    create: async (data: CreateReminderData): Promise<Reminder> => {
        return await api.post<Reminder>('/reminders', data);
    },

    update: async (id: number, data: UpdateReminderData): Promise<Reminder> => {
        return await api.put<Reminder>(`/reminders/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/reminders/${id}`);
    },

    markAsRead: async (id: number): Promise<Reminder> => {
        return reminderService.update(id, { is_read: true });
    }
};
