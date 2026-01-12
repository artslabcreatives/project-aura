import { api } from "./api";

export interface Tag {
    id: number;
    name: string;
    department_id: string;
    created_at: string;
    updated_at: string;
}

export const tagService = {
    getAll: async (departmentId?: string): Promise<Tag[]> => {
        const params = departmentId ? { department_id: departmentId } : {};
        const response = await api.get('/tags', { params });
        return response.data;
    },

    create: async (name: string, departmentId: string): Promise<Tag> => {
        const response = await api.post('/tags', {
            name,
            department_id: departmentId
        });
        return response.data;
    }
};
