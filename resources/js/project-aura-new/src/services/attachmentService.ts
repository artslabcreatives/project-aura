import { api } from './api';
import { TaskAttachment } from '@/types/task';

interface RawAttachment {
	id: number;
	task_id: number;
	name: string;
	url: string;
	type: 'file' | 'link';
	created_at: string;
	updated_at: string;
}

function mapAttachment(raw: RawAttachment): TaskAttachment {
	return {
		id: String(raw.id),
		name: raw.name,
		url: raw.url,
		type: raw.type,
		uploadedAt: raw.created_at,
	};
}

export const attachmentService = {
	/**
	 * Upload a file attachment to a task
	 */
	uploadFile: async (taskId: string, file: File): Promise<TaskAttachment> => {
		const formData = new FormData();
		formData.append('task_id', taskId);
		formData.append('file', file);
		formData.append('type', 'file');

		const { data } = await api.post('/task-attachments', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return mapAttachment(data);
	},

	/**
	 * Add a link attachment to a task
	 */
	addLink: async (taskId: string, name: string, url: string): Promise<TaskAttachment> => {
		const { data } = await api.post('/task-attachments', {
			task_id: taskId,
			name,
			url,
			type: 'link',
		});
		return mapAttachment(data);
	},

	/**
	 * Get all attachments for a task
	 */
	getByTaskId: async (taskId: string): Promise<TaskAttachment[]> => {
		const { data } = await api.get('/task-attachments', {
			params: { task_id: taskId },
		});
		return Array.isArray(data) ? data.map(mapAttachment) : [];
	},

	/**
	 * Delete an attachment
	 */
	delete: async (attachmentId: string): Promise<void> => {
		await api.delete(`/task-attachments/${attachmentId}`);
	},

	/**
	 * Upload multiple files to a task
	 */
	uploadFiles: async (taskId: string, files: File[]): Promise<TaskAttachment[]> => {
		const results: TaskAttachment[] = [];
		for (const file of files) {
			const attachment = await attachmentService.uploadFile(taskId, file);
			results.push(attachment);
		}
		return results;
	},
};
