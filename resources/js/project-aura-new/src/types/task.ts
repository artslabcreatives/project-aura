export type UserStatus = "pending" | "in-progress" | "complete";
export type TaskPriority = "low" | "medium" | "high";
export type UserRole = "user" | "team-lead" | "admin" | "account-manager" | "hr";

export interface TaskAttachment {
	id: string;
	name: string;
	url: string;
	type: "file" | "link";
	uploadedAt: string;
}

export interface RevisionHistory {
	id: string;
	comment: string;
	requestedBy: string; // Admin/Team Lead who requested revision
	requestedAt: string;
	resolvedAt?: string; // When user completed the revision
}

export interface TaskHistory {
	id: string;
	action: string;
	details: string;
	user?: { id: string; name: string };
	createdAt: string;
	previousDetails?: any;
}

export interface TaskComment {
	id: string;
	comment: string;
	userId: string;
	createdAt: string;
	user?: {
		id: string;
		name: string;
		avatar?: string;
	};
}

export interface Task {
	id: string;
	title: string;
	description: string;
	project: string; // project name (display)
	projectId?: number; // numeric project id from backend
	assignee: string;
	dueDate?: string | null;
	userStatus: UserStatus; // User-level status: pending, in-progress, or complete
	projectStage?: string; // Project-specific stage ID (optional, for project views)
	startStageId?: string; // Stage to move to when start time arrives
	priority: TaskPriority;
	createdAt: string;
	tags?: string[]; // Custom tags like Static, Reel, Carousel, Print, etc.
	startDate?: string | null; // Start date with time
	attachments?: TaskAttachment[]; // File uploads and external links
	isInSpecificStage?: boolean; // Whether task is in specific stage
	revisionComment?: string; // Current/latest revision comment
	revisionHistory?: RevisionHistory[]; // Array of all revision requests
	taskHistory?: TaskHistory[]; // General task history (updates, moves, etc.)
	previousStage?: string; // Store the stage before moving to Review (for revision workflow)
	originalAssignee?: string; // Store the assignee who completed the task (for revision workflow)
	completedAt?: string; // ISO 8601 date string
	comments?: TaskComment[];
	assignedUsers?: AssignedUser[]; // Multiple assignees
	subtasks?: Task[]; // Subtasks
	parentId?: string | null; // Parent task ID
	isAssigneeLocked?: boolean; // If true, auto-reassignment is disabled
}

export interface AssignedUser {
	id: string; // User ID
	name: string;
	status: UserStatus; // Status for this specific user on this task
	pivot?: { status: UserStatus };
}

export interface SuggestedTask {
	id: string;
	title: string;
	description: string;
	source: "whatsapp" | "email";
	suggestedAt: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	department: string; // Department ID
	avatar?: string;
	preferences?: {
		notifications?: {
			email: boolean;
			push: boolean;
			whatsapp: boolean;
			mattermost: boolean;
		};
		reducedMotion?: boolean;
	};
	twoFactorEnabled?: boolean;
}
