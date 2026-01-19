import { api } from './api';
import { ProjectGroup } from '@/types/project-group';

export const projectGroupService = {
    getAll: async (departmentId?: string): Promise<ProjectGroup[]> => {
        let url = '/project-groups';
        if (departmentId) {
            url += `?department_id=${departmentId}`;
        }
        const { data } = await api.get(url);
        return Array.isArray(data) ? data.map((raw: any) => ({
            id: String(raw.id),
            name: raw.name,
            departmentId: String(raw.department_id),
        })) : [];
    },

    create: async (name: string, departmentId: string): Promise<ProjectGroup> => {
        const { data } = await api.post('/project-groups', {
            name,
            department_id: departmentId
        });
        return {
            id: String(data.id),
            name: data.name,
            departmentId: String(data.department_id),
        };
    },
};
