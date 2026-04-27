import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { taskService } from "@/services/taskService";
import { User } from "@/types/task";
import { Stage } from "@/types/stage";
import { Loader2, Sparkles, Trash2, Calendar, User as UserIcon, Layers } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export interface ImportedTask {
	title: string;
	description: string | null;
	due_date: string | null;
	priority: "low" | "medium" | "high" | null;
}

interface ReviewRow extends ImportedTask {
	_id: number;
	assigneeId: string;
	stageId: string;
}

interface ImportTasksReviewDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tasks: ImportedTask[];
	projectId: number;
	stages: Stage[];
	teamMembers: User[];
	departments: { id: string; name: string }[];
	onTasksCreated: () => void;
}

const PRIORITY_OPTIONS = [
	{ value: "low", label: "Low" },
	{ value: "medium", label: "Medium" },
	{ value: "high", label: "High" },
];

const PRIORITY_COLORS: Record<string, string> = {
	low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
	high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function ImportTasksReviewDialog({
	open,
	onOpenChange,
	tasks,
	projectId,
	stages,
	teamMembers,
	departments,
	onTasksCreated,
}: ImportTasksReviewDialogProps) {
	const { toast } = useToast();
	const [rows, setRows] = useState<ReviewRow[]>([]);
	const [bulkAssigneeId, setBulkAssigneeId] = useState("");
	const [bulkStageId, setBulkStageId] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	useEffect(() => {
		if (open && tasks.length > 0) {
			const pendingStage = stages.find(s => s.title.toLowerCase().trim() === 'pending');
			const defaultStageId = pendingStage ? String(pendingStage.id) : "";

			setRows(
				tasks.map((t, i) => ({
					...t,
					_id: i,
					assigneeId: "",
					stageId: defaultStageId,
				}))
			);
			setBulkAssigneeId("");
			setBulkStageId("");
		}
	}, [open, tasks, stages]);

	const applyBulkAssignee = () => {
		if (!bulkAssigneeId) return;
		setRows((prev) => prev.map((r) => ({ ...r, assigneeId: bulkAssigneeId })));
	};

	const applyBulkStage = () => {
		if (!bulkStageId) return;
		setRows((prev) => prev.map((r) => ({ ...r, stageId: bulkStageId })));
	};

	const updateRow = (id: number, patch: Partial<ReviewRow>) => {
		setRows((prev) => prev.map((r) => (r._id === id ? { ...r, ...patch } : r)));
	};

	const removeRow = (id: number) => {
		setRows((prev) => prev.filter((r) => r._id !== id));
	};

	const handleCreate = async () => {
		if (rows.length === 0) return;

		const missing = rows.filter((r) => !r.title.trim());
		if (missing.length > 0) {
			toast({ title: "Validation error", description: "All tasks must have a title.", variant: "destructive" });
			return;
		}

		setIsCreating(true);
		let created = 0;
		let failed = 0;

		for (const row of rows) {
			try {
				await taskService.create({
					title: row.title.trim(),
					description: row.description || "",
					projectId,
					assigneeId: row.assigneeId ? parseInt(row.assigneeId) : undefined,
					projectStageId: row.stageId ? parseInt(row.stageId) : undefined,
					dueDate: row.due_date || undefined,
					priority: row.priority || "medium",
					userStatus: "pending",
				} as any);
				created++;
			} catch {
				failed++;
			}
		}

		setIsCreating(false);

		if (failed === 0) {
			toast({ title: `${created} task${created !== 1 ? "s" : ""} created`, description: "All imported tasks were added to the project." });
		} else {
			toast({
				title: `${created} created, ${failed} failed`,
				description: "Some tasks could not be created. Please add them manually.",
				variant: "destructive",
			});
		}

		onTasksCreated();
		onOpenChange(false);
	};

	const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name || "";

	const membersByDept = teamMembers
		.filter((m) => m.is_active !== false)
		.sort((a, b) => {
			const da = getDeptName(a.department);
			const db = getDeptName(b.department);
			return da.localeCompare(db) || a.name.localeCompare(b.name);
		});

	const visibleStages = stages.filter(
		(s) => !["archive"].includes(s.title.toLowerCase().trim())
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col p-0"
				onPointerDownOutside={(e) => e.preventDefault()}
				onInteractOutside={(e) => e.preventDefault()}
			>
				<DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
					<DialogTitle className="flex items-center gap-2 text-lg">
						<Sparkles className="h-5 w-5 text-primary" />
						Review Imported Tasks
						<Badge variant="secondary" className="ml-1">{rows.length} task{rows.length !== 1 ? "s" : ""}</Badge>
					</DialogTitle>
					<DialogDescription>
						Tasks extracted by AI. Review, edit, assign stages and team members, then confirm to create them.
					</DialogDescription>
				</DialogHeader>

				{/* Bulk assignment bar */}
				<div className="px-6 py-3 bg-muted/40 border-y flex-shrink-0">
					<p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Bulk Assign All</p>
					<div className="flex flex-wrap gap-3 items-end">
						<div className="flex items-center gap-2 flex-1 min-w-[200px]">
							<UserIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
							<Select value={bulkAssigneeId} onValueChange={setBulkAssigneeId}>
								<SelectTrigger className="h-8 text-xs flex-1">
									<SelectValue placeholder="Assignee for all…" />
								</SelectTrigger>
								<SelectContent>
									{membersByDept.map((m) => (
										<SelectItem key={m.id} value={String(m.id)} className="text-xs">
											{m.name}
											{getDeptName(m.department) && (
												<span className="ml-1 text-muted-foreground">({getDeptName(m.department)})</span>
											)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button size="sm" variant="outline" className="h-8 text-xs" onClick={applyBulkAssignee} disabled={!bulkAssigneeId}>
								Apply
							</Button>
						</div>

						<div className="flex items-center gap-2 flex-1 min-w-[200px]">
							<Layers className="h-4 w-4 text-muted-foreground flex-shrink-0" />
							<Select value={bulkStageId} onValueChange={setBulkStageId}>
								<SelectTrigger className="h-8 text-xs flex-1">
									<SelectValue placeholder="Stage for all…" />
								</SelectTrigger>
								<SelectContent>
									{visibleStages.map((s) => (
										<SelectItem key={s.id} value={String(s.id)} className="text-xs">
											{s.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button size="sm" variant="outline" className="h-8 text-xs" onClick={applyBulkStage} disabled={!bulkStageId}>
								Apply
							</Button>
						</div>
					</div>
				</div>

				{/* Task rows */}
				<div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
					<div className="px-6 py-4 space-y-4">
						{rows.length === 0 && (
							<p className="text-sm text-muted-foreground text-center py-8">No tasks to review. All removed.</p>
						)}

						{rows.map((row, idx) => (
							<div key={row._id} className="border rounded-lg p-4 space-y-3 bg-card shadow-sm">
								<div className="flex items-center justify-between gap-2">
									<span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
									<Button
										variant="ghost"
										size="sm"
										className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
										onClick={() => removeRow(row._id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>

								{/* Title */}
								<div className="space-y-1">
									<Label className="text-xs">Title *</Label>
									<Input
										value={row.title}
										onChange={(e) => updateRow(row._id, { title: e.target.value })}
										className="h-8 text-sm"
										placeholder="Task title"
									/>
								</div>

								{/* Description */}
								<div className="space-y-1">
									<Label className="text-xs">Description</Label>
									<Textarea
										value={row.description || ""}
										onChange={(e) => updateRow(row._id, { description: e.target.value || null })}
										className="text-sm min-h-[60px] resize-none"
										placeholder="Optional description…"
									/>
								</div>

								{/* Row 3: due date / priority / assignee / stage */}
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
									<div className="space-y-1">
										<Label className="text-xs flex items-center gap-1">
											<Calendar className="h-3 w-3" /> Due Date
										</Label>
										<Input
											type="date"
											className="h-8 text-xs"
											value={row.due_date || ""}
											onChange={(e) => updateRow(row._id, { due_date: e.target.value || null })}
										/>
									</div>

									<div className="space-y-1">
										<Label className="text-xs">Priority</Label>
										<Select
											value={row.priority || "medium"}
											onValueChange={(v) => updateRow(row._id, { priority: v as any })}
										>
											<SelectTrigger className="h-8 text-xs">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{PRIORITY_OPTIONS.map((p) => (
													<SelectItem key={p.value} value={p.value} className="text-xs">
														<span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${PRIORITY_COLORS[p.value]}`}>
															{p.label}
														</span>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-1">
										<Label className="text-xs flex items-center gap-1">
											<UserIcon className="h-3 w-3" /> Assignee
										</Label>
										<Select
											value={row.assigneeId || "__none__"}
											onValueChange={(v) => updateRow(row._id, { assigneeId: v === "__none__" ? "" : v })}
										>
											<SelectTrigger className="h-8 text-xs">
												<SelectValue placeholder="None" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="__none__" className="text-xs text-muted-foreground">None</SelectItem>
												{membersByDept.map((m) => (
													<SelectItem key={m.id} value={String(m.id)} className="text-xs">
														{m.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-1">
										<Label className="text-xs flex items-center gap-1">
											<Layers className="h-3 w-3" /> Stage
										</Label>
										<Select
											value={row.stageId || "__none__"}
											onValueChange={(v) => updateRow(row._id, { stageId: v === "__none__" ? "" : v })}
										>
											<SelectTrigger className="h-8 text-xs">
												<SelectValue placeholder="None" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="__none__" className="text-xs text-muted-foreground">None</SelectItem>
												{visibleStages.map((s) => (
													<SelectItem key={s.id} value={String(s.id)} className="text-xs">
														{s.title}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<Separator />

				<DialogFooter className="px-6 py-4 flex-shrink-0">
					<Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isCreating}>
						Cancel
					</Button>
					<Button onClick={handleCreate} disabled={isCreating || rows.length === 0}>
						{isCreating ? (
							<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating tasks…</>
						) : (
							<><Sparkles className="mr-2 h-4 w-4" /> Create {rows.length} Task{rows.length !== 1 ? "s" : ""}</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
