import { api } from './api';
import { User } from '@/types/task';

export const userService = {
	getAll: async (): Promise<User[]> => {
		const { data } = await api.get('/users');
		// Normalize backend shape to User interface (department_id -> department string)
		return (Array.isArray(data) ? data : []).map((u: any) => ({
			id: String(u.id),
			name: u.name,
			email: u.email,
			role: u.role,
			department: u.department_id != null ? String(u.department_id) : '',
		}));
	},

	getById: async (id: string): Promise<User> => {
		const { data } = await api.get(`/users/${id}`);
		return {
			id: String(data.id),
			name: data.name,
			email: data.email,
			role: data.role,
			department: data.department_id != null ? String(data.department_id) : '',
		};
	},

	getCurrentUser: async (): Promise<User> => {
		const { data } = await api.get('/users/me');
		return data;
	},

	create: async (user: Omit<User, 'id'>): Promise<User> => {
		// Map frontend field names to backend format
		const payload = {
			name: user.name,
			email: user.email,
			role: user.role,
			department_id: user.department ? parseInt(user.department, 10) : null,
		};
		const { data } = await api.post('/users', payload);
		// Map response back to frontend format
		return {
			id: String(data.id),
			name: data.name,
			email: data.email,
			role: data.role,
			department: data.department_id != null ? String(data.department_id) : '',
		};
	},

	update: async (id: string, updates: Partial<User>): Promise<User> => {
		// Map frontend field names to backend format
		const payload: any = {
			name: updates.name,
			email: updates.email,
			role: updates.role,
		};
		if (updates.department) {
			payload.department_id = parseInt(updates.department, 10);
		}
		const { data } = await api.put(`/users/${id}`, payload);
		// Map response back to frontend format
		return {
			id: String(data.id),
			name: data.name,
			email: data.email,
			role: data.role,
			department: data.department_id != null ? String(data.department_id) : '',
		};
	},

	uploadAvatar: async (id: string, file: File): Promise<string> => {
		const formData = new FormData();
		formData.append('avatar', file);

		const { data } = await api.post(`/users/${id}/avatar`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return data.avatar_url;
	},

	delete: async (id: string): Promise<void> => {
		await api.delete(`/users/${id}`);
	},
};
