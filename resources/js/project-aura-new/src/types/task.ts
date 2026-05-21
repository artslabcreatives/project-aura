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
	assigneeAvatar?: string;
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
	is_assignee_locked?: boolean;
	isLocked?: boolean; // If true, task is locked due to project status (on-hold/cancelled)
	previousStatus?: UserStatus; // Saved status before project was paused/cancelled
	isRecurring?: boolean;
	is_recurring?: boolean;
	recurrenceInterval?: 'daily' | 'weekly' | 'monthly' | 'custom' | 'on_completion';
	recurrence_interval?: 'daily' | 'weekly' | 'monthly' | 'custom' | 'on_completion';
	recurrenceCustomDays?: number[];
	recurrence_custom_days?: number[];
	nextRecurrenceAt?: string | null;
	next_recurrence_at?: string | null;
	recurrenceEndAt?: string | null;
	recurrence_end_at?: string | null;
	start_stage_id?: string;
}

export interface AssignedUser {
	id: string; // User ID
	name: string;
	avatar?: string;
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
	department_id?: number | string; // Numeric ID from backend
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
	hasSeenWelcomeVideo?: boolean;
	is_active?: boolean;
	createdAt?: string;
	todayTaskCount?: number;
	overdueTaskCount?: number;
	system_settings?: {
		enable_chatbot: boolean;
		enable_ai_scenarios: boolean;
	};
}
