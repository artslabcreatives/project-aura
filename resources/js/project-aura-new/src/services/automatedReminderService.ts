import { api } from "@/lib/api";

export interface AutomatedReminderSetting {
    id: number;
    type: string;
    label: string;
    days_before: number[];
    is_active: boolean;
}

export interface ProjectWithOverride {
    id: number;
    name: string;
    project_code: string;
    grace_period_expires_at: string;
    manual_reminder_date: string | null;
    manual_reminder_days: number[] | null;
}

export interface AuditLog {
    id: number;
    user: {
        id: number;
        name: string;
    };
    action: string;
    entity_id: number;
    entity_type: string;
    project_id?: number;
    details: any;
    created_at: string;
}

export const automatedReminderService = {
    getData: async (): Promise<{ settings: AutomatedReminderSetting[], projects_with_overrides: ProjectWithOverride[] }> => {
        return await api.get<{ settings: AutomatedReminderSetting[], projects_with_overrides: ProjectWithOverride[] }>('/automated-reminder-settings');
    },

    updateSetting: async (id: number, data: Partial<AutomatedReminderSetting>): Promise<AutomatedReminderSetting> => {
        return await api.patch<AutomatedReminderSetting>(`/automated-reminder-settings/${id}`, data);
    },

    updateProjectOverride: async (projectId: number, data: { manual_reminder_date: string | null, manual_reminder_days: number[] | null }): Promise<any> => {
        return await api.patch(`/projects/${projectId}/reminder-override`, data);
    },

    getAuditLogs: async (): Promise<AuditLog[]> => {
        return await api.get<AuditLog[]>('/automated-reminder-settings/audit-logs');
    }
};
