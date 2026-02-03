import { Task, UserStatus } from "@/types/task";
import { Stage } from "@/types/stage";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Edit, Trash2, Eye, AlertCircle, History, ClipboardCheck, Share2, Plus, ListTodo, CheckSquare, Clock, Link, Users, Globe, Check } from "lucide-react";
import { format, isPast, isToday, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect, useRef } from "react";
import { taskService } from "@/services/taskService";
import { useUser } from "@/hooks/use-user";

interface TaskCardProps {
	task: Task;
	onDragStart: () => void;
	onEdit: () => void;
	onDelete: () => void;
	onView: () => void;
	onReviewTask?: () => void;
	canManage?: boolean;
	currentStage?: Stage;
	canDrag?: boolean;
	projectId?: string;
	onAddSubtask?: () => void;
	onViewSubtask?: (subtask: Task) => void;
	onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskCard({ task, onDragStart, onEdit, onDelete, onView, onReviewTask, canManage = true, currentStage, canDrag = true, projectId, onAddSubtask, onViewSubtask, onTaskUpdate }: TaskCardProps) {
	const dueDate = task.dueDate ? new Date(task.dueDate) : null;
	const isValidDueDate = dueDate && isValid(dueDate);
	const isCompleteStage = currentStage?.title?.toLowerCase() === "complete" || currentStage?.title?.toLowerCase() === "completed" || currentStage?.title?.toLowerCase() === "archive";
	const isTaskComplete = task.userStatus === "complete" || isCompleteStage;
	const isOverdue = isValidDueDate && isPast(dueDate) && !isToday(dueDate) && !isTaskComplete;
	const [showHistoryDialog, setShowHistoryDialog] = useState(false);
	const [timeLeft, setTimeLeft] = useState<string>("");
	const [isShareOpen, setIsShareOpen] = useState(false);
	const { toast } = useToast();
	const { currentUser } = useUser();
	const hasStartedRef = useRef(false);

	useEffect(() => {
		if (currentStage?.title !== "Pending" || !task.startDate || !projectId) {
			setTimeLeft("");
			return;
		}

		const calculateTimeLeft = () => {
			if (!task.startDate) return;

			// Force Sri Lanka timezone (+05:30)
			// We strip 'Z' or specific offsets to treat the stored "face value" time as SL time
			const dateStr = task.startDate;
			const parts = dateStr.split('T');
			const datePart = parts[0];
			const timePart = parts[1] ? parts[1].substring(0, 8) : "00:00:00"; // Get HH:mm:ss

			const targetDateStr = `${datePart}T${timePart}+05:30`;

			const start = new Date(targetDateStr);
			const now = new Date();
			const diff = start.getTime() - now.getTime();

			if (diff <= 0) {
				setTimeLeft("Starting...");
				if (!hasStartedRef.current) {
					// Only Admin or Team Lead should trigger auto-start
					if (currentUser?.role === 'admin' || currentUser?.role === 'team-lead') {
						hasStartedRef.current = true;
						taskService.start(task.id)
							.then((updatedTask) => {
								toast({
									title: "Task Started",
									description: "Task has been moved to the active stage.",
								});
								// Notify parent
								if (onTaskUpdate) {
									onTaskUpdate(updatedTask.id, updatedTask);
								}
							})
							.catch(err => {
								console.error("Failed to auto-start task:", err);
								hasStartedRef.current = false;
							});
					}
				}
				return;
			}

			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);

			const timeParts = [];
			if (days > 0) timeParts.push(`${days}d`);
			if (hours > 0) timeParts.push(`${hours}h`);
			timeParts.push(`${minutes}m`);
			timeParts.push(`${seconds}s`);

			setTimeLeft(timeParts.join(" "));
		};

		calculateTimeLeft();
		const timer = setInterval(calculateTimeLeft, 1000);
		return () => clearInterval(timer);
	}, [task.startDate, currentStage, task.id, toast, onView, projectId]);

	const handleCopyLink = () => {
		const pId = projectId || task.projectId;
		if (!pId) {
			toast({ title: "Error", description: "Project ID not available", variant: "destructive" });
			return;
		}
		const url = `${window.location.protocol}//${window.location.host}/project/${pId}?task=${task.id}`;
		navigator.clipboard.writeText(url);
		toast({ title: "Link copied", description: "Task link copied to clipboard" });
		setIsShareOpen(false);
	};

	const priorityColors = {
		low: "bg-priority-low/10 text-priority-low border-priority-low/20",
		medium: "bg-priority-medium/10 text-priority-medium border-priority-medium/20",
		high: "bg-priority-high/10 text-priority-high border-priority-high/20",
	};

	return (
		<Card
			id={`task-${task.id}`}
			draggable={canDrag}
			onDragStart={canDrag ? onDragStart : undefined}
			className={cn(
				"hover:shadow-md transition-all group relative",
				canDrag && "cursor-move hover:scale-[1.02]",
				!canDrag && "cursor-default",
				isOverdue && "border-destructive/50 bg-destructive/5"
			)}
		>
			<CardHeader className="p-4 pb-2">
				<div className="flex items-start justify-between gap-2">
					<h4 className="font-semibold text-sm leading-tight flex-1">
						{task.title}
					</h4>
					<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
						<Popover open={isShareOpen} onOpenChange={setIsShareOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7"
									onClick={(e) => e.stopPropagation()}
									title="Share task"
								>
									<Share2 className="h-3.5 w-3.5" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-56 p-1" align="end" onClick={(e) => e.stopPropagation()}>
								<div className="flex flex-col">
									<Button variant="ghost" className="justify-start h-9 text-xs font-normal" onClick={handleCopyLink}>
										<Link className="h-3.5 w-3.5 mr-2" />
										Copy link to Clipboard
									</Button>
									<Button variant="ghost" className="justify-start h-9 text-xs font-normal">
										<Users className="h-3.5 w-3.5 mr-2" />
										Internal Share
									</Button>
									<Button variant="ghost" className="justify-start h-9 text-xs font-normal">
										<Globe className="h-3.5 w-3.5 mr-2" />
										External Share
									</Button>
								</div>
							</PopoverContent>
						</Popover>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							onClick={(e) => {
								e.stopPropagation();
								onView();
							}}
							title="View details"
						>
							<Eye className="h-3.5 w-3.5" />
						</Button>
						{/* Show Review Task button if in review stage */}
						{currentStage?.isReviewStage && onReviewTask && (
							currentUser?.role === 'admin' ||
							currentUser?.role === 'team-lead' ||
							(currentUser?.role === 'account-manager' && (
								task.assignee === currentUser?.name ||
								(task.assignedUsers && task.assignedUsers.some(u => String(u.id) === String(currentUser?.id)))
							))
						) && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
												onClick={(e) => {
													e.stopPropagation();
													onReviewTask();
												}}
											>
												<ClipboardCheck className="h-3.5 w-3.5" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Review Task</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}


						{canManage && (
							<>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7"
									onClick={(e) => {
										e.stopPropagation();
										onEdit();
									}}
									title="Edit task"
								>
									<Edit className="h-3.5 w-3.5" />
								</Button>
								{currentUser?.role !== 'account-manager' && (
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
										onClick={(e) => {
											e.stopPropagation();
											onDelete();
										}}
										title="Delete task"
									>
										<Trash2 className="h-3.5 w-3.5" />
									</Button>
								)}
							</>
						)}
					</div>
				</div>
				{task.description && (
					<p className="text-xs text-muted-foreground line-clamp-2 mt-1">
						{task.description}
					</p>
				)}
			</CardHeader>

			<CardContent className="p-4 pt-2 space-y-2">
				{timeLeft && projectId && currentStage?.title === "Pending" && (currentUser?.role === "admin" || currentUser?.role === "team-lead") && (
					<div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 p-1.5 rounded-md border border-blue-100 mb-2">
						<Clock className="h-3.5 w-3.5" />
						<span>Starts in: {timeLeft}</span>
					</div>
				)}

				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<Calendar className="h-3 w-3" />
					<span
						className={cn(
							isOverdue && "text-status-overdue font-medium",
							isValidDueDate && isToday(dueDate) && "text-primary font-medium"
						)}
					>
						{isValidDueDate ? format(dueDate, "MMM dd, yyyy") : "No due date"}
					</span>
				</div>

				{task.assignedUsers && task.assignedUsers.length > 1 ? (
					<div className="flex flex-col gap-1 mt-1 pt-1 border-t border-dashed">
						<span className="text-[10px] text-muted-foreground font-medium px-1">Assignees</span>
						{task.assignedUsers.map(u => (
							<div key={u.id} className={cn(
								"flex items-center gap-2 text-xs p-1 rounded transition-colors",
								u.status === 'complete'
									? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
									: "text-muted-foreground hover:bg-muted"
							)}>
								<User className="h-3 w-3" />
								<span className="flex-1 truncate">{u.name}</span>
								{u.status === 'complete' && <CheckSquare className="h-3 w-3 text-green-600 dark:text-green-400" />}
							</div>
						))}
					</div>
				) : (
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<User className="h-3 w-3" />
						<span>
							{(task.assignedUsers && task.assignedUsers.length === 1)
								? task.assignedUsers[0].name
								: task.assignee}
						</span>
					</div>
				)}

				<div className="flex items-center gap-2">
					<Badge variant="outline" className="text-xs">
						{task.project}
					</Badge>
					<Badge
						variant="outline"
						className={cn("text-xs capitalize", priorityColors[task.priority])}
					>
						{task.priority}
					</Badge>
				</div>

				{task.tags && task.tags.length > 0 && (
					<div className="flex flex-wrap gap-1 mt-2">
						{task.tags.map((tag) => (
							<Badge
								key={tag}
								variant="secondary"
								className={cn(
									"text-xs",
									tag === "Redo" && "bg-amber-500/10 text-amber-700 border-amber-500/20"
								)}
							>
								{tag}
							</Badge>
						))}
					</div>
				)}

				{task.revisionComment && task.tags?.includes("Redo") && (
					<div className="mt-2">
						<div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
							<AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
							<div className="flex-1 min-w-0">
								<p className="text-xs font-medium text-amber-900 dark:text-amber-100">
									Revision Requested
								</p>
								<p className="text-xs text-amber-700 dark:text-amber-300 line-clamp-2 mt-0.5">
									{task.revisionComment}
								</p>
							</div>
							{task.revisionHistory && task.revisionHistory.length > 0 && (
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 flex-shrink-0"
									onClick={(e) => {
										e.stopPropagation();
										setShowHistoryDialog(true);
									}}
									title="View revision history"
								>
									<History className="h-3.5 w-3.5" />
								</Button>
							)}
						</div>
					</div>
				)}

				{/* Subtasks List */}
				{(task.subtasks && task.subtasks.length > 0 || onAddSubtask) && (
					<div className="mt-3 pt-3 border-t">
						<div className="flex items-center justify-between mb-2">
							<span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
								<ListTodo className="h-3 w-3" /> Subtasks
							</span>
							{canManage && onAddSubtask && (
								<Button
									variant="ghost"
									size="sm"
									className="h-5 px-1.5 text-[10px]"
									onClick={(e) => {
										e.stopPropagation();
										onAddSubtask();
									}}
								>
									<Plus className="h-3 w-3 mr-1" /> Add
								</Button>
							)}
						</div>
						<div className="space-y-1">
							{task.subtasks?.map(subtask => (
								<div
									key={subtask.id}
									className="flex items-center gap-2 text-xs p-1 hover:bg-muted/50 rounded group/subtask cursor-pointer"
									onClick={(e) => {
										e.stopPropagation();
										if (onViewSubtask) onViewSubtask(subtask);
									}}
								>
									<div
										className={cn(
											"h-4 w-4 border rounded-full flex items-center justify-center transition-colors cursor-pointer hover:border-primary",
											subtask.userStatus === 'complete'
												? "bg-primary border-primary text-primary-foreground"
												: "border-muted-foreground/50"
										)}
										onClick={async (e) => {
											e.stopPropagation();
											// Toggle status
											const newStatus: UserStatus = subtask.userStatus === 'complete' ? 'pending' : 'complete';
											try {

												// Call API
												await taskService.update(subtask.id, { userStatus: newStatus });

												// Notify parent to refresh/update state
												if (onTaskUpdate) {
													// Construct updated subtasks array
													const updatedSubtasks = task.subtasks?.map(st =>
														st.id === subtask.id ? { ...st, userStatus: newStatus } : st
													) || [];

													onTaskUpdate(task.id, { subtasks: updatedSubtasks });
												}
												toast({
													title: newStatus === 'complete' ? "Subtask Completed" : "Subtask Reopened",
													description: "Task updated successfully."
												});
											} catch (error) {
												console.error("Failed to toggle subtask", error);
												toast({
													title: "Error",
													description: "Failed to update subtask.",
													variant: "destructive"
												});
											}
										}}
									>
										{subtask.userStatus === 'complete' && <Check className="h-2.5 w-2.5" />}
									</div>
									<span className={cn(
										"flex-1 truncate select-none",
										subtask.userStatus === 'complete' && "line-through text-muted-foreground"
									)}>
										{subtask.title}
									</span>
									<span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
										{subtask.assignee.split(' ')[0]}
									</span>
								</div>
							))}
							{(!task.subtasks || task.subtasks.length === 0) && onAddSubtask && (
								<div className="text-[10px] text-muted-foreground italic px-1">
									No subtasks
								</div>
							)}
						</div>
					</div>
				)}
			</CardContent>

			{isOverdue && (
				<Badge variant="destructive" className="absolute bottom-2 right-2 text-[10px] h-5 px-1.5 animate-pulse shadow-sm">
					Overdue
				</Badge>
			)}

			{/* Revision History Dialog */}
			<Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
				<DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Revision History</DialogTitle>
						<DialogDescription>
							All revision requests for this task
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3 py-4">
						{task.revisionHistory && task.revisionHistory.length > 0 ? (
							[...task.revisionHistory].reverse().map((revision, index) => {
								const requestedDate = revision.requestedAt ? new Date(revision.requestedAt) : null;
								const resolvedDate = revision.resolvedAt ? new Date(revision.resolvedAt) : null;
								return (
									<div
										key={revision.id}
										className="p-3 bg-muted rounded-lg border"
									>
										<div className="flex items-center justify-between mb-2">
											<span className="text-xs font-medium text-muted-foreground">
												Revision #{task.revisionHistory!.length - index}
											</span>
											<span className="text-xs text-muted-foreground">
												{requestedDate && isValid(requestedDate) ? format(requestedDate, "MMM dd, yyyy 'at' hh:mm a") : "Unknown date"}
											</span>
										</div>
										<p className="text-sm mb-2">{revision.comment}</p>
										<div className="flex items-center gap-4 text-xs text-muted-foreground">
											<span>Requested by: {revision.requestedBy}</span>
											{resolvedDate && isValid(resolvedDate) && (
												<span className="text-green-600">
													✓ Resolved {format(resolvedDate, "MMM dd")}
												</span>
											)}
										</div>
									</div>
								)
							})
						) : (
							<p className="text-sm text-muted-foreground text-center py-4">
								No revision history available
							</p>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</Card >
	);
}
