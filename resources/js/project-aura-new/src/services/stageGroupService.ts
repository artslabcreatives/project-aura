import { api } from './api';

export interface StageGroup {
    id: number;
    name: string;
    description?: string;
    projectId?: number;
    stages?: any[];
}

export const stageGroupService = {
    getAll: async (projectId?: string): Promise<StageGroup[]> => {
        const params: any = {};
        if (projectId) params.project_id = projectId;
        const { data } = await api.get('/stage-groups', { params });
        return data;
    },
};
