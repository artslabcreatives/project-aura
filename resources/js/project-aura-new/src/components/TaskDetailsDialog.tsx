import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Task } from "@/types/task";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Tag, Paperclip, Clock, X, ExternalLink, Download, AlertCircle, ArrowRight, Edit, Eye, Play } from "lucide-react";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { TimeLogWidget } from "@/components/TimeLogWidget";
import { attachmentService } from "@/services/attachmentService";
import { useToast } from "@/hooks/use-toast";

interface TaskDetailsDialogProps {
	task: Task | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
	onEdit?: () => void;
}

export function TaskDetailsDialog({ task, open, onOpenChange, onTaskUpdate, onEdit }: TaskDetailsDialogProps) {
	const navigate = useNavigate();
	const { toast } = useToast();
	const [viewingAttachment, setViewingAttachment] = useState<{ id: string; name: string; url: string; type: string } | null>(null);
	const [isResolvingUrl, setIsResolvingUrl] = useState(false);

	if (!task) return null;

	const isVideo = (name: string) => {
		const ext = name.split('.').pop()?.toLowerCase();
		return ['mp4', 'webm', 'ogg', 'mov', 'm4v'].includes(ext || '');
	};

	const isImage = (name: string) => {
		const ext = name.split('.').pop()?.toLowerCase();
		return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
	};

	const handleDownload = async (attachmentId: string, name: string) => {
		try {
			const { url } = await attachmentService.download(attachmentId, 'download');
			const link = document.createElement('a');
			link.href = url;
			link.download = name;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to download file.",
				variant: "destructive"
			});
		}
	};

	const handleView = async (attachment: any) => {
		setIsResolvingUrl(true);
		try {
			const { url } = await attachmentService.download(attachment.id, 'view');
			setViewingAttachment({ ...attachment, url });
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to open viewer. Please try downloading instead.",
				variant: "destructive"
			});
		} finally {
			setIsResolvingUrl(false);
		}
	};

	const priorityColors = {
		low: "bg-priority-low/10 text-priority-low border-priority-low/20",
		medium: "bg-priority-medium/10 text-priority-medium border-priority-medium/20",
		high: "bg-priority-high/10 text-priority-high border-priority-high/20",
	};

	const statusColors = {
		pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
		"in-progress": "bg-blue-500/10 text-blue-700 border-blue-500/20",
		complete: "bg-green-500/10 text-green-700 border-green-500/20",
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto flex flex-col">
				<DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<DialogTitle className="text-2xl font-bold flex-1 pr-4">{task.title}</DialogTitle>
					{onEdit && (
						<Button variant="outline" size="sm" onClick={onEdit}>
							<Edit className="h-4 w-4 mr-2" />
							Edit
						</Button>
					)}
				</DialogHeader>

				<div className="space-y-6 flex-1">
					{/* Revision Comment - Show at the top if exists */}
					{task.revisionComment && task.tags?.includes("Redo") && (
						<>
							<div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500 dark:border-amber-600 rounded-lg">
								<div className="flex items-start gap-3">
									<AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
									<div className="flex-1">
										<h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
											Revision Requested
										</h3>
										<p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-wrap">
											{task.revisionComment}
										</p>
									</div>
								</div>
							</div>
							<Separator />
						</>
					)}

					{/* Description */}
					{task.description && (
						<div>
							<h3 className="text-sm font-semibold mb-2">Description</h3>
							{/<\/?[a-z][\s\S]*>/i.test(task.description) ? (
								<div
									className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
									dangerouslySetInnerHTML={{ __html: task.description }}
								/>
							) : (
								<p className="text-sm text-muted-foreground whitespace-pre-wrap">
									{task.description}
								</p>
							)}
						</div>
					)}

					{/* Project & Assignee */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<h3 className="text-sm font-semibold mb-2">Project</h3>
							<Badge variant="outline" className="text-sm">
								{task.project}
							</Badge>
						</div>
						<div>
							<h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
								Assigned To
							</h3>
							<div className="flex flex-col gap-1.5 mt-1">
								{task.assignedUsers && task.assignedUsers.length > 1 ? (
									task.assignedUsers.map(u => {
										const initials = u.name ? u.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "";
										const avatarUrl = u.avatar || `/api/users/${u.id}/avatar`;
										return (
											<div key={u.id} className="flex items-center gap-2">
												<Avatar className="h-6 w-6 border border-muted-foreground/10 shadow-sm flex-shrink-0">
													<AvatarImage src={avatarUrl} alt={u.name} />
													<AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
														{initials}
													</AvatarFallback>
												</Avatar>
												<span className="text-sm font-medium">{u.name}</span>
											</div>
										);
									})
								) : (
									(() => {
										const assigneeName = (task.assignedUsers && task.assignedUsers.length === 1) ? task.assignedUsers[0].name : task.assignee;
										const assigneeUserObj = (task.assignedUsers && task.assignedUsers.length === 1) ? task.assignedUsers[0] : null;
										const initials = assigneeName ? assigneeName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "";
										const avatarUrl = assigneeUserObj?.avatar || task.assigneeAvatar || (assigneeUserObj?.id ? `/api/users/${assigneeUserObj.id}/avatar` : undefined);
										return (
											<div className="flex items-center gap-2">
												<Avatar className="h-6 w-6 border border-muted-foreground/10 shadow-sm flex-shrink-0">
													{avatarUrl && <AvatarImage src={avatarUrl} alt={assigneeName} />}
													<AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
														{initials}
													</AvatarFallback>
												</Avatar>
												<span className="text-sm font-medium">{assigneeName}</span>
											</div>
										);
									})()
								)}
							</div>
						</div>
					</div>

					{/* Status & Priority */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<h3 className="text-sm font-semibold mb-2">Status</h3>
							<Badge
								variant="outline"
								className={cn("text-sm capitalize", statusColors[task.userStatus])}
							>
								{task.userStatus.replace("-", " ")}
							</Badge>
						</div>
						<div>
							<h3 className="text-sm font-semibold mb-2">Priority</h3>
							<Badge
								variant="outline"
								className={cn("text-sm capitalize", priorityColors[task.priority])}
							>
								{task.priority || "Medium"}
							</Badge>
						</div>
					</div>

					{/* Dates */}
					<div className="space-y-3">
						<h3 className="text-sm font-semibold">Timeline</h3>
						<div className="space-y-2">
							{task.startDate && (() => {
								// Parse the datetime string as-is (treat as local time)
								const dateTimeParts = task.startDate.split('T');
								const datePart = dateTimeParts[0];
								const timePart = dateTimeParts[1]?.substring(0, 5) || '00:00';
								const startDate = new Date(`${datePart}T${timePart}`);
								return isValid(startDate) ? (
									<div className="flex items-center gap-2 text-sm">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span className="text-muted-foreground">Start:</span>
										<span>{format(startDate, "MMM dd, yyyy 'at' hh:mm a")}</span>
									</div>
								) : null;
							})()}
							{(() => {
								// Parse the datetime string as-is (treat as local time)
								const dateTimeParts = task.dueDate?.split('T') || [];
								const datePart = dateTimeParts[0];
								const timePart = dateTimeParts[1]?.substring(0, 5) || '00:00';
								const dueDate = datePart ? new Date(`${datePart}T${timePart}`) : null;
								return dueDate && isValid(dueDate) ? (
									<div className="flex items-center gap-2 text-sm">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span className="text-muted-foreground">End:</span>
										<span>{format(dueDate, "MMM dd, yyyy 'at' hh:mm a")}</span>
									</div>
								) : null;
							})()}
							{(() => {
								const createdAt = task.createdAt ? new Date(task.createdAt) : null;
								return createdAt && isValid(createdAt) ? (
									<div className="flex items-center gap-2 text-sm">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span className="text-muted-foreground">Created:</span>
										<span>{format(createdAt, "MMM dd, yyyy 'at' hh:mm a")}</span>
									</div>
								) : null;
							})()}
						</div>
					</div>

					{/* Tags */}
					{task.tags && task.tags.length > 0 && (
						<div>
							<h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
								<Tag className="h-4 w-4" />
								Tags
							</h3>
							<div className="flex flex-wrap gap-2">
								{task.tags.map((tag) => (
									<Badge
										key={tag}
										variant="secondary"
										className={cn(
											tag === "Redo" && "bg-amber-500/10 text-amber-700 border-amber-500/20"
										)}
									>
										{tag}
									</Badge>
								))}
							</div>
						</div>
					)}

					{/* Attachments */}
					{task.attachments && task.attachments.length > 0 && (
						<div>
							<h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
								<Paperclip className="h-4 w-4" />
								Attachments ({task.attachments.length})
							</h3>
							<div className="space-y-2">
								{task.attachments.map((attachment) => (
									<div
										key={attachment.id}
										className="flex items-center justify-between p-3 border rounded-md hover:bg-accent transition-colors"
									>
										<div className="flex items-center gap-3 flex-1 min-w-0">
											{attachment.type === "link" ? (
												<ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
											) : (
												<Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
											)}
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium truncate">{attachment.name}</p>
												<p className="text-xs text-muted-foreground">
													{(() => {
														const uploadedAt = attachment.uploadedAt ? new Date(attachment.uploadedAt) : null;
														return uploadedAt && isValid(uploadedAt) ? format(uploadedAt, "MMM dd, yyyy") : "Unknown date";
													})()}
												</p>
											</div>
										</div>
										<div className="flex gap-1">
											{(isImage(attachment.name) || isVideo(attachment.name)) && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleView(attachment)}
													disabled={isResolvingUrl}
												>
													{isVideo(attachment.name) ? <Play className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
													View
												</Button>
											)}
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDownload(attachment.id, attachment.name)}
											>
												{attachment.type === "link" ? (
													<>
														<ExternalLink className="h-4 w-4" />
														Open
													</>
												) : (
													<>
														<Download className="h-4 w-4" />
														Download
													</>
												)}
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Time Tracking */}
				<TimeLogWidget taskId={parseInt(task.id)} />
				<DialogFooter className="mt-6 sm:justify-end">
					<Button
						className="w-full sm:w-auto"
						onClick={() => {
							onOpenChange(false);
							navigate(`/tasks/${task.id}`);
						}}
					>
						View Full Details <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</DialogFooter>
			</DialogContent>

			{/* Attachment Viewer Modal */}
			<Dialog open={!!viewingAttachment} onOpenChange={(open) => !open && setViewingAttachment(null)}>
				<DialogContent hideCloseButton={true} className="sm:max-w-[800px] p-0 overflow-hidden bg-black/90 border-none">
					<div className="relative group">
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
							onClick={() => setViewingAttachment(null)}
						>
							<X className="h-5 w-5" />
						</Button>
						
						<div className="flex flex-col items-center justify-center min-h-[400px]">
							{viewingAttachment && isImage(viewingAttachment.name) && (
								<img
									src={viewingAttachment.url}
									alt={viewingAttachment.name}
									className="max-w-full max-h-[80vh] object-contain"
								/>
							)}
							{viewingAttachment && isVideo(viewingAttachment.name) && (
								<video
									src={viewingAttachment.url}
									controls
									autoPlay
									className="max-w-full max-h-[80vh]"
								/>
							)}
						</div>
						
						<div className="p-4 bg-black/50 backdrop-blur-sm text-white flex justify-between items-center">
							<p className="text-sm font-medium truncate pr-4">{viewingAttachment?.name}</p>
							<Button variant="outline" size="sm" className="bg-transparent border-white/20 text-white hover:bg-white/10" onClick={() => handleDownload(viewingAttachment?.id!, viewingAttachment?.name!)}>
								<Download className="h-4 w-4 mr-2" />
								Download
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</Dialog>
	);
}
