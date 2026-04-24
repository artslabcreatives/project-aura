import { useRef, useState, useSyncExternalStore } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Upload, Wifi, WifiOff, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { uploadManager, type UploadWorkflow, type UploadItem } from '@/lib/upload-manager';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function isReloadRecoveryMessage(message?: string) {
	if (!message) return false;
	return message.trim().toLowerCase() === 'please select the file to continue uploading';
}

function statusLabel(item: UploadItem, isReloadRecoveryFailure: boolean) {
	switch (item.status) {
		case 'queued':
			return 'Queued';
		case 'uploading':
			return `${item.progress}% uploaded`;
		case 'processing':
			return 'Finalizing';
		case 'completed':
			return 'Done';
		case 'failed':
			if (isReloadRecoveryFailure) {
				return 'Please select the file to continue uploading';
			}
			return item.error || 'Failed';
		default:
			return 'Pending';
	}
}

function workflowLabel(workflow: UploadWorkflow) {
	if (workflow.kind === 'task-completion') {
		return `Completing task #${workflow.taskId}`;
	}

	return `Uploading to task #${workflow.taskId}`;
}

export function UploadManagerPopup() {
	const state = useSyncExternalStore(uploadManager.subscribe, uploadManager.getSnapshot, uploadManager.getSnapshot);
	const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
	const [reselectErrors, setReselectErrors] = useState<Record<string, string>>({});
	const workflows = Object.values(state.workflows).sort((a, b) => b.updatedAt - a.updatedAt);

	if (workflows.length === 0) {
		return null;
	}

	const activeCount = workflows.filter((workflow) => workflow.status !== 'completed').length;
	const completedCount = workflows.length - activeCount;

	const openReselectDialog = (workflowId: string) => {
		fileInputsRef.current[workflowId]?.click();
	};

	const handleReselectFiles = async (workflowId: string, files: FileList | null) => {
		if (!files || files.length === 0) {
			return;
		}

		try {
			await uploadManager.reselectWorkflowFiles(workflowId, Array.from(files));
			setReselectErrors((prev) => {
				const next = { ...prev };
				delete next[workflowId];
				return next;
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Could not reselect files for this upload.';
			setReselectErrors((prev) => ({ ...prev, [workflowId]: message }));
		}

		if (fileInputsRef.current[workflowId]) {
			fileInputsRef.current[workflowId]!.value = '';
		}
	};

	return (
		<div className="fixed bottom-4 right-4 z-[70] w-[380px] max-w-[calc(100vw-2rem)] rounded-xl border bg-card/95 shadow-2xl backdrop-blur">
			<div className="flex items-center justify-between gap-3 border-b px-4 py-3">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<Upload className="h-4 w-4 text-primary" />
						<p className="text-sm font-semibold">Uploads</p>
						<Badge variant="secondary">{activeCount} active</Badge>
						{completedCount > 0 && <Badge variant="outline">{completedCount} done</Badge>}
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						{state.isOnline ? 'Resumable uploads are ready.' : 'Offline — uploads will retry when the connection returns.'}
					</p>
				</div>
				<div className="flex items-center gap-1">
					{state.isOnline ? (
						<Wifi className="h-4 w-4 text-emerald-500" />
					) : (
						<WifiOff className="h-4 w-4 text-amber-500" />
					)}
					<Button variant="ghost" size="icon" className="h-8 w-8" onClick={uploadManager.toggleExpanded}>
						{state.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
					</Button>
				</div>
			</div>

			{state.expanded && (
				<div className="max-h-[60vh] space-y-3 overflow-y-auto p-3">
					{workflows.map((workflow) => {
						const items = workflow.itemIds
							.map((itemId) => state.items[itemId])
							.filter((item): item is UploadItem => Boolean(item));
						const canReselect = uploadManager.canReselectFilesForWorkflow(workflow.id);
						const isReloadRecoveryFailure = isReloadRecoveryMessage(workflow.error)
							|| items.some((item) => isReloadRecoveryMessage(item.error));

						return (
							<div key={workflow.id} className="rounded-lg border bg-background/80 p-3">
								<div className="mb-3 flex items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="truncate text-sm font-medium">{workflowLabel(workflow)}</p>
										<p className="text-xs text-muted-foreground">
											{items.length} file{items.length === 1 ? '' : 's'}
										</p>
									</div>
									<div className="flex items-center gap-1">
										{workflow.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
										{workflow.status === 'failed' && <AlertCircle className={cn('h-4 w-4', isReloadRecoveryFailure ? 'text-blue-600' : 'text-destructive')} />}
										{workflow.status === 'failed' && (
											<>
												<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void uploadManager.retryWorkflow(workflow.id)}>
													<RefreshCw className="h-4 w-4" />
												</Button>
												{canReselect && (
													<>
														<input
															ref={(el) => {
																fileInputsRef.current[workflow.id] = el;
															}}
															type="file"
															className="hidden"
															multiple={items.length > 1}
															onChange={(event) => void handleReselectFiles(workflow.id, event.target.files)}
														/>
														<Button variant="ghost" size="sm" className="h-8" onClick={() => openReselectDialog(workflow.id)}>
															Browse
														</Button>
													</>
												)}
												<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => uploadManager.dismissWorkflow(workflow.id)}>
													<X className="h-4 w-4" />
												</Button>
											</>
										)}
										{workflow.status === 'completed' && (
											<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => uploadManager.dismissWorkflow(workflow.id)}>
												<X className="h-4 w-4" />
											</Button>
										)}
									</div>
								</div>

								<div className="space-y-3">
									{items.map((item) => (
										<div key={item.id} className="space-y-1.5">
											<div className="flex items-center justify-between gap-3">
												<p className="truncate text-sm">{item.fileName}</p>
												<span className={cn('text-xs', item.status === 'failed' ? (isReloadRecoveryFailure ? 'text-blue-600' : 'text-blue-600') : 'text-muted-foreground')}>
													{statusLabel(item, isReloadRecoveryFailure)}
												</span>
											</div>
											<Progress value={item.progress} className="h-2" />
										</div>
									))}
								</div>

								{reselectErrors[workflow.id] && (
									<p className="mt-2 text-xs text-destructive">{reselectErrors[workflow.id]}</p>
								)}
							</div>
						);
					})}

					{completedCount > 0 && (
						<div className="flex justify-end pt-1">
							<Button variant="ghost" size="sm" onClick={uploadManager.clearCompleted}>
								Clear completed
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
