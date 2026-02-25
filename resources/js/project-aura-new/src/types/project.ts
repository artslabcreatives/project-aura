import { Department } from "./department";
import { Stage } from "./stage";
import { ProjectGroup } from "./project-group";

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
	hasPendingTasks?: boolean;
	isArchived?: boolean;
	collaborators?: { id: number; name: string; email: string; department_id?: number; role?: string }[];
	mattermostChannelId?: string;
}
