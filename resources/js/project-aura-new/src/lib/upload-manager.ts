import Uppy, { UppyFile } from '@uppy/core';
import Tus from '@uppy/tus';
import GoldenRetriever from '@uppy/golden-retriever';
import { api } from '@/services/api';
import { getToken } from '@/lib/api';
import type { Task, TaskAttachment } from '@/types/task';

export type UploadWorkflowKind = 'task-attachment' | 'task-completion';
export type UploadItemStatus = 'queued' | 'uploading' | 'processing' | 'completed' | 'failed';
export type UploadWorkflowStatus = 'queued' | 'uploading' | 'processing' | 'completed' | 'failed';

interface RawAttachment {
	id: number;
	task_id: number;
	name: string;
	url: string;
	type: 'file' | 'link';
	created_at: string;
	updated_at: string;
}

interface RawAssignedUser {
	id: number | string;
	name: string;
	pivot?: {
		status?: 'pending' | 'in-progress' | 'complete';
	};
}

interface RawTaskComment {
	id: number | string;
	comment: string;
	user_id: number | string;
	created_at?: string;
	user?: {
		id: number | string;
		name: string;
	} | null;
}

interface RawRevisionHistory {
	id: number | string;
	comment: string;
	requested_by?: string;
	requested_at?: string;
	created_at?: string;
	resolved_at?: string;
}

interface RawTaskHistory {
	id: number | string;
	action: string;
	details: string;
	user?: {
		id: number | string;
		name: string;
	} | null;
	created_at?: string;
	previous_details?: unknown;
}

interface RawTaskAttachment {
	id: number | string;
	name?: string;
	filename?: string;
	url?: string;
	path?: string;
	type?: 'file' | 'link';
	created_at?: string;
}

interface RawTaskResponse {
	id: number | string;
	title: string;
	description?: string | null;
	project?: { id?: number; name?: string } | null;
	assignee?: { name?: string } | null;
	assigned_users?: RawAssignedUser[];
	due_date?: string | null;
	user_status?: 'pending' | 'in-progress' | 'complete';
	project_stage_id?: number | string | null;
	start_stage_id?: number | string | null;
	priority?: 'low' | 'medium' | 'high';
	created_at?: string;
	tags?: string[];
	start_date?: string | null;
	attachments?: RawTaskAttachment[];
	is_in_specific_stage?: boolean;
	revision_comment?: string | null;
	previous_stage_id?: number | string | null;
	original_assignee?: { name?: string } | null;
	completed_at?: string | null;
	comments?: RawTaskComment[];
	revision_histories?: RawRevisionHistory[];
	task_histories?: RawTaskHistory[];
	subtasks?: RawTaskResponse[];
	parent_id?: number | string | null;
	is_assignee_locked?: boolean | number;
}

interface UploadItem {
	id: string;
	workflowId: string;
	kind: UploadWorkflowKind;
	taskId: string;
	fileName: string;
	bytesUploaded: number;
	bytesTotal: number;
	progress: number;
	status: UploadItemStatus;
	createdAt: number;
	updatedAt: number;
	error?: string;
	uploadKey?: string;
	resultId?: string;
}

interface TaskAttachmentWorkflow {
	id: string;
	kind: 'task-attachment';
	taskId: string;
	status: UploadWorkflowStatus;
	itemIds: string[];
	createdAt: number;
	updatedAt: number;
	results: TaskAttachment[];
	error?: string;
}

interface TaskCompletionWorkflow {
	id: string;
	kind: 'task-completion';
	taskId: string;
	status: UploadWorkflowStatus;
	itemIds: string[];
	createdAt: number;
	updatedAt: number;
	payload: {
		status?: string;
		projectStageId?: string;
		comment?: string;
		links?: string[];
	};
	uploadKeys: Record<string, string>;
	error?: string;
}

type UploadWorkflow = TaskAttachmentWorkflow | TaskCompletionWorkflow;

interface UploadState {
	items: Record<string, UploadItem>;
	workflows: Record<string, UploadWorkflow>;
	expanded: boolean;
	isOnline: boolean;
}

type ManagedUppyFile = UppyFile<Record<string, unknown>, Record<string, unknown>> & {
	isGhost?: boolean;
	isRestored?: boolean;
	data?: Blob | File | undefined;
};

const STORAGE_KEY = 'aura.upload-manager.state.v1';
const TASK_ATTACHMENTS_EVENT = 'aura:task-attachments-uploaded';
const TASK_COMPLETION_EVENT = 'aura:task-completion-finished';
const RELOAD_FILE_LOST_ERROR = 'Please select the file to continue uploading.';
const RELOAD_GHOST_ERROR = 'Please select the file to continue uploading.';
const LEGACY_RELOAD_ERROR_PHRASES = [
	'cannot auto-resume after reload',
	'could not restore the local file data after reload',
];

const mapAttachment = (raw: RawAttachment): TaskAttachment => ({
	id: String(raw.id),
	name: raw.name,
	url: raw.url,
	type: raw.type,
	uploadedAt: raw.created_at,
});

type WorkflowResolution = Task | TaskAttachment[];

const mapTask = (raw: RawTaskResponse): Task => ({
	id: String(raw.id),
	title: raw.title,
	description: raw.description ?? '',
	project: raw.project ? raw.project.name : '',
	projectId: raw.project ? raw.project.id : undefined,
	assignee: raw.assignee ? raw.assignee.name : '',
	assignedUsers: raw.assigned_users?.map((u) => ({
		id: String(u.id),
		name: u.name,
		status: u.pivot?.status || 'pending',
	})) || [],
	dueDate: raw.due_date ?? '',
	userStatus: raw.user_status || 'pending',
	projectStage: raw.project_stage_id ? String(raw.project_stage_id) : undefined,
	startStageId: raw.start_stage_id ? String(raw.start_stage_id) : undefined,
	priority: raw.priority || 'medium',
	createdAt: raw.created_at || new Date().toISOString(),
	tags: raw.tags || [],
	startDate: raw.start_date || undefined,
	attachments: raw.attachments?.map((a) => ({
		id: String(a.id),
		name: a.name || a.filename || 'file',
		url: a.url || a.path || '',
		type: a.type || 'file',
		uploadedAt: a.created_at || new Date().toISOString(),
	})) || [],
	isInSpecificStage: raw.is_in_specific_stage || false,
	revisionComment: raw.revision_comment || undefined,
	previousStage: raw.previous_stage_id ? String(raw.previous_stage_id) : undefined,
	originalAssignee: raw.original_assignee ? raw.original_assignee.name : undefined,
	completedAt: raw.completed_at || undefined,
	comments: raw.comments?.map((c) => ({
		id: String(c.id),
		comment: c.comment,
		userId: String(c.user_id),
		createdAt: c.created_at || new Date().toISOString(),
		user: c.user ? {
			id: String(c.user.id),
			name: c.user.name,
		} : undefined,
	})) || [],
	revisionHistory: raw.revision_histories?.map((r) => ({
		id: String(r.id),
		comment: r.comment,
		requestedBy: r.requested_by || '',
		requestedAt: r.requested_at || r.created_at || new Date().toISOString(),
		resolvedAt: r.resolved_at || undefined,
	})) || [],
	taskHistory: raw.task_histories?.map((h) => ({
		id: String(h.id),
		action: h.action,
		details: h.details,
		user: h.user ? { id: String(h.user.id), name: h.user.name } : undefined,
		createdAt: h.created_at || new Date().toISOString(),
		previousDetails: h.previous_details,
	})) || [],
	subtasks: raw.subtasks?.map(mapTask) || [],
	parentId: raw.parent_id ? String(raw.parent_id) : null,
	isAssigneeLocked: raw.is_assignee_locked === true || raw.is_assignee_locked === 1,
});

const randomId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

class UploadManager {
	private uppy: Uppy | null = null;
	private listeners = new Set<() => void>();
	private workflowResolvers = new Map<string, { resolve: (value: WorkflowResolution) => void; reject: (reason?: unknown) => void }>();
	private readonly isReloadNavigation: boolean;
	private state: UploadState = {
		items: {},
		workflows: {},
		expanded: true,
		isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
	};

	constructor() {
		this.isReloadNavigation = this.detectReloadNavigation();
		this.state = this.loadState();
		this.init();
	}

	private detectReloadNavigation() {
		if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') {
			return false;
		}

		const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
		return navEntries.some((entry) => entry.type === 'reload');
	}

	private isReloadFailureMessage(message?: string) {
		if (!message) {
			return false;
		}

		return message.trim() === RELOAD_FILE_LOST_ERROR;
	}

	private normalizeReloadErrorMessage(message?: string) {
		if (!message) {
			return message;
		}

		const normalized = message.toLowerCase();
		if (LEGACY_RELOAD_ERROR_PHRASES.some((phrase) => normalized.includes(phrase))) {
			return RELOAD_FILE_LOST_ERROR;
		}

		return message;
	}

	private log(message: string, details?: unknown) {
		if (typeof details === 'undefined') {
			console.log(`[uppy] ${message}`);
			return;
		}

		console.log(`[uppy] ${message}`, details);
	}

	private warn(message: string, details?: unknown) {
		if (typeof details === 'undefined') {
			console.warn(`[uppy] ${message}`);
			return;
		}

		console.warn(`[uppy] ${message}`, details);
	}

	private error(message: string, details?: unknown) {
		if (typeof details === 'undefined') {
			console.error(`[uppy] ${message}`);
			return;
		}

		console.error(`[uppy] ${message}`, details);
	}

	private init() {
		if (this.uppy || typeof window === 'undefined') {
			return;
		}

		this.log('initializing upload manager', {
			isOnline: this.state.isOnline,
			persistedWorkflowCount: Object.keys(this.state.workflows).length,
			persistedItemCount: Object.keys(this.state.items).length,
		});

		const uppy = new Uppy({
			autoProceed: true,
			allowMultipleUploadBatches: true,
		});

		uppy.use(GoldenRetriever, {});
		uppy.use(Tus, {
			endpoint: '/api/uploads/tus',
			retryDelays: [0, 1000, 3000, 5000, 10000, 30000],
			chunkSize: 5 * 1024 * 1024,
			headers: () => {
				const token = getToken();
				return token ? { Authorization: `Bearer ${token}` } : {};
			},
			onBeforeRequest: (req, file) => {
				const method = typeof req.getMethod === 'function' ? req.getMethod() : 'UNKNOWN';
				const url = typeof req.getURL === 'function' ? req.getURL() : 'UNKNOWN';
				const item = this.state.items[file.id];
				this.log('chunk request', {
					method,
					url,
					fileId: file.id,
					fileName: file.name,
					workflowId: item?.workflowId,
					status: item?.status,
					progress: item?.progress,
				});
			},
			onProgress: (bytesUploaded, bytesTotal) => {
				this.log('tus progress callback', {
					bytesUploaded,
					bytesTotal,
					percent: bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : 0,
				});
			},
			onSuccess: (payload) => {
				this.log('tus upload success callback', payload);
			},
			onError: (error) => {
				this.error('tus upload error callback', error);
			},
		});

		uppy.on('file-added', (file) => {
			this.log('file added', {
				fileId: file.id,
				fileName: file.name,
				size: file.size,
				isRestored: (file as ManagedUppyFile).isRestored,
				isGhost: (file as ManagedUppyFile).isGhost,
				meta: file.meta,
			});
		});

		uppy.on('files-added', (files) => {
			this.log('files added batch', files.map((file) => ({
				fileId: file.id,
				fileName: file.name,
				size: file.size,
			})));
		});

		uppy.on('upload', (data) => {
			this.log('upload cycle started', data);
		});

		uppy.on('restored', () => {
			this.log('golden retriever restored state', uppy.getState().recoveredState);
			try {
				this.log('emitting restore-confirmed');
				uppy.emit('restore-confirmed');
			} catch (error) {
				this.error('failed to auto-confirm restored uploads', error);
			}

			this.reconcileGhostWorkflows();
			void this.resumePendingWorkflows();
		});

		uppy.on('state-update', (_prevState, nextState, patch) => {
			if (patch.files || patch.currentUploads || patch.recoveredState) {
				this.log('uppy state update', {
					recoveredState: nextState.recoveredState,
					currentUploadIds: Object.keys(nextState.currentUploads || {}),
					fileIds: Object.keys(nextState.files || {}),
					patch,
				});
			}
		});

		uppy.on('upload-start', (files) => {
			this.log('upload started', files.map((file) => ({
				fileId: file.id,
				fileName: file.name,
				isRestored: (file as ManagedUppyFile).isRestored,
				isGhost: (file as ManagedUppyFile).isGhost,
			})));
		});

		uppy.on('upload-progress', (file, progress) => {
			if (!file?.id) return;
			this.log('upload progress event', {
				fileId: file.id,
				fileName: file.name,
				bytesUploaded: progress.bytesUploaded,
				bytesTotal: progress.bytesTotal,
				percent: progress.bytesTotal > 0 ? Math.round((progress.bytesUploaded / progress.bytesTotal) * 100) : 0,
			});
			this.updateItem(file.id, {
				bytesUploaded: progress.bytesUploaded,
				bytesTotal: progress.bytesTotal,
				progress: progress.bytesTotal > 0 ? Math.round((progress.bytesUploaded / progress.bytesTotal) * 100) : 0,
				status: 'uploading',
				error: undefined,
			});
			this.touchWorkflowByItem(file.id, 'uploading');
		});

		uppy.on('upload-success', async (file, response) => {
			if (!file?.id) return;
			const item = this.state.items[file.id];
			if (!item) return;

			this.log('upload success event', {
				fileId: file.id,
				fileName: file.name,
				response,
			});

			const uploadKey = this.extractUploadKey(response?.uploadURL);
			this.updateItem(file.id, {
				uploadKey,
				progress: 100,
				status: 'processing',
				error: undefined,
			});

			const workflow = this.state.workflows[item.workflowId];
			if (!workflow) return;

			try {
				if (workflow.kind === 'task-attachment') {
					await this.finalizeTaskAttachmentItem(workflow.id, item.id);
				} else {
					await this.registerCompletionUploadKey(workflow.id, item.id, uploadKey);
				}
			} catch (error) {
				this.failWorkflow(item.workflowId, error);
			}
		});

		uppy.on('upload-error', (file, error) => {
			if (!file?.id) return;
			this.error('upload error event', {
				fileId: file.id,
				fileName: file.name,
				error,
			});
			this.updateItem(file.id, {
				status: 'failed',
				error: error?.message || 'Upload failed.',
			});
			const item = this.state.items[file.id];
			if (item) {
				this.failWorkflow(item.workflowId, error);
			}
		});

		uppy.on('error', (error) => {
			this.error('upload manager error', error);
		});

		uppy.on('complete', (result) => {
			this.log('upload cycle complete', result);
		});

		window.addEventListener('online', this.handleOnline);
		window.addEventListener('offline', this.handleOffline);
		window.addEventListener('beforeunload', this.handleBeforeUnload);

		this.uppy = uppy;
		window.setTimeout(() => {
			this.log('initial deferred resume check fired');
			this.reconcileGhostWorkflows();
			void this.resumePendingWorkflows();
		}, 250);
	}

	private waitForNextTick() {
		return new Promise<void>((resolve) => {
			window.setTimeout(resolve, 0);
		});
	}

	private rebindTrackedItemId(oldItemId: string, newItemId: string) {
		if (oldItemId === newItemId) {
			return;
		}

		const existing = this.state.items[oldItemId];
		if (!existing || this.state.items[newItemId]) {
			return;
		}

		this.log('rebinding tracked upload item id', {
			oldItemId,
			newItemId,
			workflowId: existing.workflowId,
		});

		this.state.items[newItemId] = {
			...existing,
			id: newItemId,
			updatedAt: Date.now(),
		};
		delete this.state.items[oldItemId];

		const workflow = this.state.workflows[existing.workflowId];
		if (workflow) {
			workflow.itemIds = workflow.itemIds.map((itemId) => (itemId === oldItemId ? newItemId : itemId));
			workflow.updatedAt = Date.now();

			if (workflow.kind === 'task-completion' && workflow.uploadKeys[oldItemId]) {
				workflow.uploadKeys[newItemId] = workflow.uploadKeys[oldItemId];
				delete workflow.uploadKeys[oldItemId];
			}
		}
	}

	private cleanupUntrackedUppyFiles() {
		const uppy = this.uppy;
		if (!uppy) {
			return;
		}

		let mutated = false;
		const trackedItemIds = new Set(Object.keys(this.state.items));

		this.getManagedFiles().forEach((file) => {
			const meta = (file.meta || {}) as Record<string, unknown>;
			const metaItemId = typeof meta.itemId === 'string' ? meta.itemId : undefined;
			const isTrackedById = trackedItemIds.has(file.id);
			const isTrackedByMeta = Boolean(metaItemId && trackedItemIds.has(metaItemId));

			if (!isTrackedById && isTrackedByMeta && metaItemId) {
				this.rebindTrackedItemId(metaItemId, file.id);
				trackedItemIds.delete(metaItemId);
				trackedItemIds.add(file.id);
				mutated = true;
				return;
			}

			if (!isTrackedById && !isTrackedByMeta) {
				this.warn('removing unmanaged uppy file', {
					fileId: file.id,
					fileName: file.name,
					meta,
				});
				uppy.removeFile(file.id);
				mutated = true;
			}
		});

		if (mutated) {
			this.emit();
		}
	}

	private getManagedFiles() {
		const uppy = this.uppy;
		return (uppy?.getFiles() || []) as ManagedUppyFile[];
	}

	private reconcileGhostWorkflows() {
		const knownFiles = this.getManagedFiles();
		const knownFileIds = new Set(knownFiles.map((file) => file.id));
		const ghostFileIds = new Set(
			knownFiles
				.filter((file) => file.isGhost || (!file.progress.uploadComplete && !file.data))
				.map((file) => file.id),
		);
		let mutated = false;

		Object.values(this.state.workflows).forEach((workflow) => {
			if (workflow.status === 'completed' || workflow.status === 'failed') {
				return;
			}

			const ghostItemIds = workflow.itemIds.filter((itemId) => {
				const item = this.state.items[itemId];
				return item && item.status !== 'completed' && !item.uploadKey && ghostFileIds.has(itemId);
			});

			if (ghostItemIds.length > 0) {
				this.warn('ghost restored files detected', {
					workflowId: workflow.id,
					ghostItemIds,
				});
				workflow.status = 'failed';
				workflow.error = RELOAD_GHOST_ERROR;
				workflow.updatedAt = Date.now();
				ghostItemIds.forEach((itemId) => {
					const item = this.state.items[itemId];
					if (item) {
						item.status = 'failed';
						item.error = workflow.error;
						item.updatedAt = Date.now();
					}
				});
				mutated = true;
				return;
			}

			if (!this.isReloadNavigation) {
				return;
			}

			const missingAllPendingFiles = workflow.itemIds.every((itemId) => {
				const item = this.state.items[itemId];
				if (!item || item.status === 'completed' || item.uploadKey) {
					return false;
				}

				return !knownFileIds.has(itemId);
			});

			if (!missingAllPendingFiles) {
				return;
			}

			this.warn('pending workflow has no recoverable uppy files after reload', {
				workflowId: workflow.id,
				itemIds: workflow.itemIds,
			});

			workflow.status = 'failed';
			workflow.error = RELOAD_FILE_LOST_ERROR;
			workflow.updatedAt = Date.now();
			workflow.itemIds.forEach((itemId) => {
				const item = this.state.items[itemId];
				if (item && item.status !== 'completed' && !item.uploadKey) {
					item.status = 'failed';
					item.error = workflow.error;
					item.updatedAt = Date.now();
				}
			});
			mutated = true;
		});

		if (mutated) {
			this.emit();
		}
	}

	private isReloadFailureWorkflow(workflow: UploadWorkflow) {
		return workflow.status === 'failed' && this.isReloadFailureMessage(workflow.error);
	}

	private async startOrResumeUploads() {
		if (!this.state.isOnline) {
			this.warn('startOrResumeUploads skipped because browser is offline');
			return;
		}

		const uppy = this.ensureUppy();
		this.cleanupUntrackedUppyFiles();
		await this.waitForNextTick();

		let { currentUploads, recoveredState } = uppy.getState();
		this.log('startOrResumeUploads invoked', {
			recoveredState,
			currentUploadIds: Object.keys(currentUploads || {}),
			fileIds: this.getManagedFiles().map((file) => file.id),
		});

		if (recoveredState) {
			try {
				this.log('recovered state present, emitting restore-confirmed during auto-resume');
				uppy.emit('restore-confirmed');
			} catch (error) {
				this.error('failed to confirm restored uploads during auto-resume', error);
			}
			await this.waitForNextTick();
			({ currentUploads, recoveredState } = uppy.getState());
			this.log('state after restore-confirmed', {
				recoveredState,
				currentUploadIds: Object.keys(currentUploads || {}),
			});
		}

		if (recoveredState) {
			this.warn('recoveredState still present after restore confirmation; skipping start for now');
			return;
		}

		if (Object.keys(currentUploads).length > 0) {
			this.log('resuming existing uploads', Object.keys(currentUploads));
			uppy.resumeAll();
			await Promise.all(Object.keys(currentUploads).map((uploadId) => uppy.restore(uploadId)));
			this.log('existing upload restore calls finished', Object.keys(currentUploads));
			return;
		}

		this.reconcileGhostWorkflows();

		const pendingFiles = this.getManagedFiles().filter((file) => {
			const item = this.state.items[file.id];
			return item && item.status !== 'completed' && !item.uploadKey && !file.isGhost && !file.progress.uploadStarted;
		});
		this.log('pending files eligible to start', pendingFiles.map((file) => ({
			fileId: file.id,
			fileName: file.name,
			isRestored: file.isRestored,
			isGhost: file.isGhost,
			uploadStarted: file.progress.uploadStarted,
		})));

		if (pendingFiles.length > 0) {
			this.log('starting new upload cycle', { count: pendingFiles.length });
			await uppy.upload();
			return;
		}

		this.warn('no pending files were eligible to start');
	}

	private handleOnline = () => {
		this.log('browser went online, attempting resume');
		this.state.isOnline = true;
		this.persist();
		this.emit();
		void this.resumePendingWorkflows();
	};

	private handleOffline = () => {
		this.warn('browser went offline');
		this.state.isOnline = false;
		this.persist();
		this.emit();
	};

	private handleBeforeUnload = () => {
		this.warn('page is unloading/reloading', {
			workflowIds: Object.keys(this.state.workflows),
			itemIds: Object.keys(this.state.items),
		});
	};

	private extractUploadKey(uploadURL?: string) {
		const parsed = uploadURL ? new URL(uploadURL, window.location.origin) : null;
		const key = parsed?.pathname.split('/').filter(Boolean).pop();
		if (!key || key === 'tus') {
			throw new Error('Could not determine the resumable upload key.');
		}
		return key;
	}

	private loadState(): UploadState {
		if (!canUseStorage()) {
			return {
				items: {},
				workflows: {},
				expanded: true,
				isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
			};
		}

		try {
			const raw = window.localStorage.getItem(STORAGE_KEY);
			if (!raw) {
				return {
					items: {},
					workflows: {},
					expanded: true,
					isOnline: navigator.onLine,
				};
			}
			const parsed = JSON.parse(raw) as Partial<UploadState>;
			const items = Object.fromEntries(
				Object.entries(parsed.items || {}).map(([itemId, item]) => [
					itemId,
					{
						...item,
						error: this.normalizeReloadErrorMessage(item?.error),
					},
				]),
			) as Record<string, UploadItem>;

			const workflows = Object.fromEntries(
				Object.entries(parsed.workflows || {}).map(([workflowId, workflow]) => [
					workflowId,
					{
						...workflow,
						error: this.normalizeReloadErrorMessage(workflow?.error),
					},
				]),
			) as Record<string, UploadWorkflow>;

			return {
				items,
				workflows,
				expanded: parsed.expanded ?? true,
				isOnline: navigator.onLine,
			};
		} catch {
			return {
				items: {},
				workflows: {},
				expanded: true,
				isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
			};
		}
	}

	private persist() {
		if (!canUseStorage()) {
			return;
		}

		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
	}

	private emit() {
		this.state = {
			...this.state,
			items: { ...this.state.items },
			workflows: { ...this.state.workflows },
		};
		this.persist();
		this.listeners.forEach((listener) => listener());
	}

	private ensureUppy() {
		this.init();
		if (!this.uppy) {
			throw new Error('Upload manager is not available in this environment.');
		}
		return this.uppy;
	}

	private getDuplicateManagedFiles(file: File, excludeItemId?: string) {
		return this.getManagedFiles().filter((managedFile) => {
			if (excludeItemId && managedFile.id === excludeItemId) {
				return false;
			}

			return managedFile.name === file.name
				&& managedFile.size === file.size
				&& managedFile.type === file.type;
		});
	}

	private isDuplicateFileReplaceable(duplicateFileId: string) {
		const duplicateItem = this.state.items[duplicateFileId];
		if (!duplicateItem) {
			return true;
		}

		const duplicateWorkflow = this.state.workflows[duplicateItem.workflowId];
		if (!duplicateWorkflow) {
			return true;
		}

		if (duplicateWorkflow.status === 'completed' || duplicateWorkflow.status === 'failed') {
			return true;
		}

		if (duplicateItem.status === 'completed' || duplicateItem.status === 'failed') {
			return true;
		}

		return false;
	}

	private addFileToUppyInternal(uppy: Uppy, item: UploadItem, file: File) {
		uppy.addFile({
			id: item.id,
			name: file.name,
			type: file.type,
			data: file,
			meta: {
				name: file.name,
				filename: file.name,
				workflowId: item.workflowId,
				itemId: item.id,
				kind: item.kind,
				taskId: item.taskId,
			},
		});
	}

	private addFileToUppy(item: UploadItem, file: File) {
		const uppy = this.ensureUppy();
		this.cleanupUntrackedUppyFiles();

		if (uppy.getFile(item.id)) {
			this.warn('skipping addFileToUppy because file already exists', {
				itemId: item.id,
				fileName: file.name,
			});
			return;
		}

		const duplicates = this.getDuplicateManagedFiles(file, item.id);
		const blockedDuplicate = duplicates.find((duplicateFile) => !this.isDuplicateFileReplaceable(duplicateFile.id));
		if (blockedDuplicate) {
			this.warn('duplicate file is already part of an active upload workflow', {
				itemId: item.id,
				fileName: file.name,
				duplicateFileId: blockedDuplicate.id,
			});
			throw new Error(`File "${file.name}" is already uploading. Please wait for it to finish or clear the previous upload.`);
		}

		duplicates.forEach((duplicateFile) => {
			this.warn('removing stale duplicate file before adding new upload item', {
				itemId: item.id,
				fileName: file.name,
				duplicateFileId: duplicateFile.id,
			});
			uppy.removeFile(duplicateFile.id);
		});

		this.log('adding file to uppy', {
			itemId: item.id,
			workflowId: item.workflowId,
			taskId: item.taskId,
			fileName: file.name,
			size: file.size,
		});

		try {
			this.addFileToUppyInternal(uppy, item, file);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			const isDuplicateRestriction = message.toLowerCase().includes('duplicate file');

			if (!isDuplicateRestriction) {
				throw error;
			}

			this.warn('uppy rejected file as duplicate; retrying after aggressive stale cleanup', {
				itemId: item.id,
				fileName: file.name,
				error: message,
			});

			this.getDuplicateManagedFiles(file, item.id).forEach((duplicateFile) => {
				if (this.isDuplicateFileReplaceable(duplicateFile.id)) {
					uppy.removeFile(duplicateFile.id);
				}
			});

			this.addFileToUppyInternal(uppy, item, file);
		}
	}

	private createItem(kind: UploadWorkflowKind, workflowId: string, taskId: string, file: File): UploadItem {
		return {
			id: randomId('upload'),
			workflowId,
			kind,
			taskId,
			fileName: file.name,
			bytesUploaded: 0,
			bytesTotal: file.size,
			progress: 0,
			status: 'queued',
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};
	}

	private touchWorkflowByItem(itemId: string, status?: UploadWorkflowStatus) {
		const item = this.state.items[itemId];
		if (!item) return;
		const workflow = this.state.workflows[item.workflowId];
		if (!workflow) return;
		workflow.updatedAt = Date.now();
		if (status) {
			workflow.status = status;
		}
		this.emit();
	}

	private updateItem(itemId: string, updates: Partial<UploadItem>) {
		const existing = this.state.items[itemId];
		if (!existing) return;
		this.state.items[itemId] = {
			...existing,
			...updates,
			updatedAt: Date.now(),
		};
		this.emit();
	}

	private resolveWorkflow(workflowId: string, value: WorkflowResolution) {
		const resolver = this.workflowResolvers.get(workflowId);
		if (resolver) {
			resolver.resolve(value);
			this.workflowResolvers.delete(workflowId);
		}
	}

	private rejectWorkflow(workflowId: string, reason: unknown) {
		const resolver = this.workflowResolvers.get(workflowId);
		if (resolver) {
			resolver.reject(reason);
			this.workflowResolvers.delete(workflowId);
		}
	}

	private failWorkflow(workflowId: string, error: unknown) {
		const workflow = this.state.workflows[workflowId];
		if (!workflow) return;
		this.error('workflow failed', {
			workflowId,
			error,
		});
		workflow.status = 'failed';
		workflow.error = error instanceof Error ? error.message : 'Upload failed.';
		workflow.updatedAt = Date.now();
		workflow.itemIds.forEach((itemId) => {
			const item = this.state.items[itemId];
			if (item && item.status !== 'completed') {
				item.status = 'failed';
				item.error = workflow.error;
				item.updatedAt = Date.now();
			}
		});
		this.emit();
		this.rejectWorkflow(workflowId, error);
	}

	private async finalizeTaskAttachmentItem(workflowId: string, itemId: string) {
		const workflow = this.state.workflows[workflowId];
		const item = this.state.items[itemId];
		if (!workflow || workflow.kind !== 'task-attachment' || !item?.uploadKey) {
			return;
		}

		const { data } = await api.post('/task-attachments', {
			task_id: workflow.taskId,
			name: item.fileName,
			upload_key: item.uploadKey,
			type: 'file',
		});
		const attachment = mapAttachment(data as RawAttachment);
		this.log('task attachment finalized', {
			workflowId,
			itemId,
			attachment,
		});

		workflow.results = [...workflow.results.filter((result) => result.id !== attachment.id), attachment];
		workflow.updatedAt = Date.now();
		item.status = 'completed';
		item.resultId = attachment.id;
		item.progress = 100;
		item.error = undefined;
		item.updatedAt = Date.now();
		this.emit();

		const allCompleted = workflow.itemIds.every((workflowItemId) => this.state.items[workflowItemId]?.status === 'completed');
		if (allCompleted) {
			workflow.status = 'completed';
			workflow.error = undefined;
			workflow.updatedAt = Date.now();
			this.emit();
			window.dispatchEvent(new CustomEvent(TASK_ATTACHMENTS_EVENT, {
				detail: { taskId: workflow.taskId, attachments: workflow.results },
			}));
			this.resolveWorkflow(workflowId, workflow.results);
		}
	}

	private async registerCompletionUploadKey(workflowId: string, itemId: string, uploadKey: string) {
		const workflow = this.state.workflows[workflowId];
		if (!workflow || workflow.kind !== 'task-completion') {
			return;
		}

		workflow.uploadKeys[itemId] = uploadKey;
		this.log('registered completion upload key', {
			workflowId,
			itemId,
			uploadKey,
		});
		workflow.status = 'processing';
		workflow.updatedAt = Date.now();
		this.emit();

		const ready = workflow.itemIds.every((id) => Boolean(workflow.uploadKeys[id]));
		if (!ready) {
			return;
		}

		await this.finalizeTaskCompletionWorkflow(workflowId);
	}

	private async finalizeTaskCompletionWorkflow(workflowId: string) {
		const workflow = this.state.workflows[workflowId];
		if (!workflow || workflow.kind !== 'task-completion') {
			return;
		}

		workflow.status = 'processing';
		workflow.error = undefined;
		workflow.updatedAt = Date.now();
		workflow.itemIds.forEach((itemId) => {
			const item = this.state.items[itemId];
			if (item) {
				item.status = 'processing';
				item.progress = 100;
				item.error = undefined;
				item.updatedAt = Date.now();
			}
		});
		this.emit();

		try {
			this.log('finalizing task completion workflow', {
				workflowId,
				taskId: workflow.taskId,
				uploadKeys: workflow.itemIds.map((itemId) => workflow.uploadKeys[itemId]),
			});
			const { data } = await api.post(`/tasks/${workflow.taskId}/complete`, {
				user_status: workflow.payload.status,
				project_stage_id: workflow.payload.projectStageId,
				comment: workflow.payload.comment,
				links: workflow.payload.links,
				upload_keys: workflow.itemIds.map((itemId) => workflow.uploadKeys[itemId]),
			});

			workflow.status = 'completed';
			workflow.error = undefined;
			workflow.updatedAt = Date.now();
			workflow.itemIds.forEach((itemId) => {
				const item = this.state.items[itemId];
				if (item) {
					item.status = 'completed';
					item.progress = 100;
					item.error = undefined;
					item.updatedAt = Date.now();
				}
			});
			this.emit();

			const task = mapTask(data);
			this.log('task completion finalized', {
				workflowId,
				taskId: workflow.taskId,
				task,
			});
			window.dispatchEvent(new CustomEvent(TASK_COMPLETION_EVENT, {
				detail: { taskId: workflow.taskId, task },
			}));
			this.resolveWorkflow(workflowId, task);
		} catch (error) {
			this.failWorkflow(workflowId, error);
		}
	}

	private async resumePendingWorkflows() {
		if (!this.state.isOnline) {
			this.warn('resumePendingWorkflows skipped because browser is offline');
			return;
		}

		this.log('resumePendingWorkflows running', {
			workflowIds: Object.keys(this.state.workflows),
			itemIds: Object.keys(this.state.items),
		});

		Object.values(this.state.workflows).forEach((workflow) => {
			if (workflow.status === 'completed' || workflow.status === 'failed') {
				return;
			}

			if (workflow.kind === 'task-completion') {
				const hasAllUploadKeys = workflow.itemIds.every((itemId) => Boolean(workflow.uploadKeys[itemId]));
				if (hasAllUploadKeys) {
					void this.finalizeTaskCompletionWorkflow(workflow.id);
				}
			}

			if (workflow.kind === 'task-attachment') {
				workflow.itemIds.forEach((itemId) => {
					const item = this.state.items[itemId];
					if (item?.uploadKey && item.status !== 'completed') {
						void this.finalizeTaskAttachmentItem(workflow.id, itemId);
					}
				});
			}
		});

		try {
			await this.startOrResumeUploads();
		} catch (error) {
			this.error('failed to resume pending uploads', error);
		}
	}

	getSnapshot = (): UploadState => this.state;

	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	};

	toggleExpanded = () => {
		this.state.expanded = !this.state.expanded;
		this.emit();
	};

	clearCompleted = () => {
		Object.values(this.state.workflows)
			.filter((workflow) => workflow.status === 'completed')
			.forEach((workflow) => this.dismissWorkflow(workflow.id));
	};

	dismissWorkflow = (workflowId: string) => {
		const workflow = this.state.workflows[workflowId];
		if (!workflow) return;

		workflow.itemIds.forEach((itemId) => {
			delete this.state.items[itemId];
			const file = this.uppy?.getFile(itemId);
			if (file) {
				this.uppy?.removeFile(itemId);
			}
		});

		delete this.state.workflows[workflowId];
		this.emit();
	};

	retryWorkflow = async (workflowId: string) => {
		const workflow = this.state.workflows[workflowId];
		if (!workflow) return;

		workflow.error = undefined;
		workflow.status = 'uploading';
		workflow.updatedAt = Date.now();

		if (workflow.kind === 'task-completion') {
			const hasAllUploadKeys = workflow.itemIds.every((itemId) => Boolean(workflow.uploadKeys[itemId]));
			if (hasAllUploadKeys) {
				await this.finalizeTaskCompletionWorkflow(workflowId);
				return;
			}
		}

		if (workflow.kind === 'task-attachment') {
			const uploadedItems = workflow.itemIds
				.map((itemId) => this.state.items[itemId])
				.filter((item): item is UploadItem => Boolean(item?.uploadKey && item.status !== 'completed'));

			if (uploadedItems.length > 0) {
				await Promise.all(uploadedItems.map((item) => this.finalizeTaskAttachmentItem(workflow.id, item.id)));
				return;
			}
		}

		workflow.itemIds.forEach((itemId) => {
			const item = this.state.items[itemId];
			if (item && item.status !== 'completed') {
				item.status = 'queued';
				item.error = undefined;
				item.updatedAt = Date.now();
			}
		});
		this.emit();
		await this.resumePendingWorkflows();
	};

	canReselectFilesForWorkflow = (workflowId: string) => {
		const workflow = this.state.workflows[workflowId];
		if (!workflow) return false;
		return this.isReloadFailureWorkflow(workflow);
	};

	reselectWorkflowFiles = async (workflowId: string, files: File[]) => {
		const workflow = this.state.workflows[workflowId];
		if (!workflow) {
			throw new Error('Upload workflow no longer exists.');
		}

		if (!this.isReloadFailureWorkflow(workflow)) {
			throw new Error('This upload cannot be reselected.');
		}

		const pendingItemIds = workflow.itemIds.filter((itemId) => {
			const item = this.state.items[itemId];
			return Boolean(item && item.status !== 'completed');
		});

		if (files.length !== pendingItemIds.length) {
			throw new Error(`Please select ${pendingItemIds.length} file${pendingItemIds.length === 1 ? '' : 's'} to continue this upload.`);
		}

		pendingItemIds.forEach((itemId, index) => {
			const item = this.state.items[itemId];
			if (!item) return;

			this.uppy?.removeFile(itemId);

			const file = files[index];
			this.state.items[itemId] = {
				...item,
				fileName: file.name,
				bytesUploaded: 0,
				bytesTotal: file.size,
				progress: 0,
				status: 'queued',
				error: undefined,
				uploadKey: undefined,
				resultId: undefined,
				updatedAt: Date.now(),
			};

			if (workflow.kind === 'task-completion') {
				delete workflow.uploadKeys[itemId];
			}
		});

		workflow.status = 'queued';
		workflow.error = undefined;
		workflow.updatedAt = Date.now();
		this.emit();

		pendingItemIds.forEach((itemId, index) => {
			const item = this.state.items[itemId];
			if (!item) return;
			this.addFileToUppy(item, files[index]);
		});

		await this.startOrResumeUploads();
	};

	attachFilesToTask = async (taskId: string, files: File[]): Promise<TaskAttachment[]> => {
		if (files.length === 0) {
			return [];
		}

		this.log('attachFilesToTask called', {
			taskId,
			files: files.map((file) => ({ name: file.name, size: file.size, type: file.type })),
		});

		const workflowId = randomId('workflow');
		const items = files.map((file) => this.createItem('task-attachment', workflowId, taskId, file));
		const workflow: TaskAttachmentWorkflow = {
			id: workflowId,
			kind: 'task-attachment',
			taskId,
			status: 'queued',
			itemIds: items.map((item) => item.id),
			createdAt: Date.now(),
			updatedAt: Date.now(),
			results: [],
		};

		items.forEach((item) => {
			this.state.items[item.id] = item;
		});
		this.state.workflows[workflowId] = workflow;
		this.state.expanded = true;
		this.emit();

		const promise = new Promise<TaskAttachment[]>((resolve, reject) => {
			this.workflowResolvers.set(workflowId, {
				resolve: (value) => resolve(value as TaskAttachment[]),
				reject,
			});
		});

		files.forEach((file, index) => {
			this.addFileToUppy(items[index], file);
		});

		await this.startOrResumeUploads();
		return promise;
	};

	completeTask = async (taskId: string, payload: { status?: string; projectStageId?: string; comment?: string; links?: string[]; files?: File[] }): Promise<Task> => {
		const files = payload.files || [];
		this.log('completeTask called', {
			taskId,
			status: payload.status,
			projectStageId: payload.projectStageId,
			fileCount: files.length,
			files: files.map((file) => ({ name: file.name, size: file.size, type: file.type })),
		});
		if (files.length === 0) {
			const { data } = await api.post(`/tasks/${taskId}/complete`, {
				user_status: payload.status,
				project_stage_id: payload.projectStageId,
				comment: payload.comment,
				links: payload.links,
			});
			return mapTask(data);
		}

		const workflowId = randomId('workflow');
		const items = files.map((file) => this.createItem('task-completion', workflowId, taskId, file));
		const workflow: TaskCompletionWorkflow = {
			id: workflowId,
			kind: 'task-completion',
			taskId,
			status: 'queued',
			itemIds: items.map((item) => item.id),
			createdAt: Date.now(),
			updatedAt: Date.now(),
			payload: {
				status: payload.status,
				projectStageId: payload.projectStageId,
				comment: payload.comment,
				links: payload.links,
			},
			uploadKeys: {},
		};

		items.forEach((item) => {
			this.state.items[item.id] = item;
		});
		this.state.workflows[workflowId] = workflow;
		this.state.expanded = true;
		this.emit();

		const promise = new Promise<Task>((resolve, reject) => {
			this.workflowResolvers.set(workflowId, {
				resolve: (value) => resolve(value as Task),
				reject,
			});
		});

		files.forEach((file, index) => {
			this.addFileToUppy(items[index], file);
		});

		await this.startOrResumeUploads();
		return promise;
	};
}

export const uploadManager = new UploadManager();
export type { UploadItem, UploadState, UploadWorkflow };
