import { api } from './api';
import { Department } from '@/types/department';

function mapDepartment(raw: any): Department {
	return {
		id: String(raw.id),
		name: raw.name,
	};
}

export const departmentService = {
	getAll: async (): Promise<Department[]> => {
		const { data } = await api.get('/departments');
		return Array.isArray(data) ? data.map(mapDepartment) : [];
	},

	getById: async (id: string): Promise<Department> => {
		const { data } = await api.get(`/departments/${id}`);
		return mapDepartment(data);
	},

	create: async (department: Omit<Department, 'id'>): Promise<Department> => {
		const { data } = await api.post('/departments', department);
		return mapDepartment(data);
	},

	update: async (id: string, updates: Partial<Department>): Promise<Department> => {
		const { data } = await api.put(`/departments/${id}`, updates);
		return mapDepartment(data);
	},

	delete: async (id: string): Promise<void> => {
		await api.delete(`/departments/${id}`);
	},
};
