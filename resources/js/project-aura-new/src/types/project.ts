import { Department } from "./department";
import { Stage } from "./stage";
import { ProjectGroup } from "./project-group";
import { Client } from "./client";

export interface Project {
	id?: number;
	name: string;
	description: string;
	createdAt?: string;
	stages: Stage[];
	department?: Department;
	emails?: string[];
	phoneNumbers?: string[];
	group?: ProjectGroup;
	hasOverdueTasks?: boolean;
	isArchived?: boolean;
	collaborators?: { id: number; name: string; email: string; department_id?: number; role?: string }[];
	mattermostChannelId?: string;
	clientId?: number;
	estimatedHours?: number;
	status?: 'active' | 'on-hold' | 'completed' | 'cancelled';
	client?: Client;
	poNumber?: string;
	poDocument?: string;
	poDocumentUrl?: string;
	isLockedByPo?: boolean;
}
