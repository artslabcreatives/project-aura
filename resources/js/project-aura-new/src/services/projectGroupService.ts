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
            parentId: raw.parent_id ? String(raw.parent_id) : null,
        })) : [];
    },

    create: async (name: string, departmentId: string, parentId?: string | null): Promise<ProjectGroup> => {
        const payload: any = {
            name,
            department_id: departmentId
        };
        if (parentId) {
            payload.parent_id = parentId;
        }
        const { data } = await api.post('/project-groups', payload);
        return {
            id: String(data.id),
            name: data.name,
            departmentId: String(data.department_id),
            parentId: data.parent_id ? String(data.parent_id) : null,
        };
    },
};
