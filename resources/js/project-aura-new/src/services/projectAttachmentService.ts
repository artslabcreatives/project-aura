import { api } from "./api";
import { ProjectAttachment } from "../types/project";
import { uploadManager } from "@/lib/upload-manager";

export const projectAttachmentService = {
	async uploadFile(projectId: string, file: File): Promise<ProjectAttachment> {
		const [attachment] = await uploadManager.attachFilesToProject(projectId, [file]);
		return attachment;
	},

	async uploadFiles(projectId: string, files: File[]): Promise<ProjectAttachment[]> {
		return uploadManager.attachFilesToProject(projectId, files);
	},

	async addLink(projectId: string, name: string, url: string): Promise<ProjectAttachment> {
		const response = await api.post(`/projects/${projectId}/attachments`, {
			name,
			url,
			type: "link",
		});

		return this.mapAttachment(response.data);
	},

	async delete(attachmentId: string): Promise<void> {
		await api.delete(`/project-attachments/${attachmentId}`);
	},

	mapAttachment(raw: any): ProjectAttachment {
		return {
			id: String(raw.id),
			name: raw.name,
			url: raw.url,
			type: raw.type,
			uploadedAt: raw.uploaded_at || raw.created_at,
		};
	},
};
