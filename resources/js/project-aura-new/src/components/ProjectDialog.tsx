import { useState, useEffect, useMemo } from "react";
import { z } from "zod";
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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Stage } from "@/types/stage";
import { Plus, Trash2, GripVertical, Check, X, Info, ChevronRight, ChevronLeft, UploadCloud, File as FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@/types/task";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectGroup,
	SelectLabel,
} from "@/components/ui/select";
import { TagInput } from "./ui/TagInput";
import { MultiSearchableSelect } from "./ui/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Department } from "@/types/department";
import { Project } from "@/types/project";
import { ProjectGroup } from "@/types/project-group";
import { projectGroupService } from "@/services/projectGroupService";
import { stageGroupService, StageGroup } from "@/services/stageGroupService";
import { clientService } from "@/services/clientService";
import { Client as ClientType } from "@/types/client";
import { SearchableSelect, SearchableOption } from "./ui/searchable-select";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const projectSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, { message: "Project name is required" })
		.max(50, { message: "Project name must be less than 50 characters" })
		.regex(/^[a-zA-Z0-9\s-]+$/, {
			message: "Project name can only contain letters, numbers, spaces, and hyphens",
		}),
	description: z
		.string()
		.trim()
		.max(200, { message: "Description must be less than 200 characters" })
		.optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const colorOptions = [
	{ value: "bg-slate-200", label: "Gray", hex: "#e2e8f0" },
	{ value: "bg-blue-500", label: "Blue", hex: "#3b82f6" },
	{ value: "bg-green-500", label: "Green", hex: "#22c55e" },
	{ value: "bg-red-500", label: "Red", hex: "#ef4444" },
	{ value: "bg-orange-500", label: "Orange", hex: "#f97316" },
	{ value: "bg-purple-500", label: "Purple", hex: "#a855f7" },
	{ value: "bg-slate-500", label: "Accent", hex: "#64748b" },
];

const SYSTEM_STAGES = ['suggested', 'suggested task', 'pending', 'complete', 'completed', 'archive'];

interface ProjectDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (
		name: string,
		description: string,
		stages: Stage[],
		emails: string[],
		phoneNumbers: string[],
		department?: Department,
		groupId?: string,
		clientId?: string,
		estimatedHours?: number,
		status?: string,
		poNumber?: string,
		deadline?: string,
		poDocument?: File
	) => Promise<void> | void;
	existingProjects: string[];
	teamMembers: User[];
	editProject?: Project;
	departments: Department[];
	currentUser?: User | null;
}

// ... SortableStageItem remains same ...
interface SortableStageItemProps {
	stage: Stage;
	updateStage: <K extends keyof Stage>(id: string, field: K, value: Stage[K]) => void;
	removeStage: (id: string) => void;
	stages: Stage[];
	memberOptions: SearchableOption[];
	isSystem?: boolean;
	currentUser?: User | null;
	stageGroups: StageGroup[];
	allTeamMembers: User[];
}

function SortableStageItem({ stage, updateStage, removeStage, stages, memberOptions, isSystem, currentUser, stageGroups, allTeamMembers }: SortableStageItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: stage.id, disabled: isSystem });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"flex flex-col gap-2 p-3 border rounded-lg",
				isSystem ? "bg-muted/50 border-dashed" : "bg-card"
			)}
		>
			<div className="flex items-center gap-2">
				{!isSystem && (
					<div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
						<GripVertical className="h-4 w-4" />
					</div>
				)}
				{isSystem && <div className="w-4" />} {/* Spacer */}

				<Input
					value={stage.title === "Pending" ? "Backlog" : stage.title}
					onChange={(e) => updateStage(stage.id, "title", e.target.value)}
					placeholder="Stage name"
					className="flex-1"
					maxLength={30}
					disabled={isSystem}
				/>
				<Select
					value={stage.color}
					onValueChange={(value) => updateStage(stage.id, "color", value)}
					disabled={isSystem}
				>
					<SelectTrigger className="w-[60px] px-2 flex justify-center">
						<SelectValue>
							<div className="flex items-center justify-center w-full">
								<div
									className="h-4 w-4 rounded-full border border-slate-200 shadow-sm"
									style={{ backgroundColor: colorOptions.find(c => c.value === stage.color)?.hex }}
								/>
							</div>
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="end" className="min-w-[50px]">
						{colorOptions.map((option) => (
							<SelectItem key={option.value} value={option.value} className="justify-center px-2 cursor-pointer">
								<div className="flex items-center justify-center w-full">
									<div
										className="h-4 w-4 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110"
										style={{ backgroundColor: option.hex }}
										title={option.label}
									/>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{/* Info tooltip for Suggested Task stage */}
				{isSystem && stage.title.toLowerCase().includes('suggested') && (
					<TooltipProvider>
						<Tooltip delayDuration={0}>
							<TooltipTrigger asChild>
								<div className="cursor-help">
									<Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
								</div>
							</TooltipTrigger>
							<TooltipContent side="right" className="max-w-[300px] p-3">
								<div className="space-y-3">
									<p className="font-semibold text-sm">Client Requests</p>
									<p className="text-xs text-muted-foreground">
										This stage shows tasks suggested via WhatsApp and Email clients.
									</p>
									<div className="flex items-center gap-2 bg-muted/50 rounded px-2 py-1.5">
										<span className="text-xs font-mono">+94 78 538 4672</span>
										<button
											type="button"
											className="p-1 hover:bg-muted rounded transition-colors"
											onClick={() => {
												navigator.clipboard.writeText('+94785384672');
											}}
											title="Copy number"
										>
											<svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
												<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
											</svg>
										</button>
									</div>
									<p className="text-xs text-muted-foreground">
										Add this number to the WhatsApp group to receive suggestions.
									</p>
								</div>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
				{!isSystem && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => removeStage(stage.id)}
						className="text-destructive hover:text-destructive flex-shrink-0"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				)}
				{isSystem && !stage.title.toLowerCase().includes('suggested') && <div className="w-9" />} {/* Spacer for delete button */}
			</div>

			{!isSystem && (
				<>
					<div className="flex flex-wrap items-center justify-between gap-4 mt-4 ml-6 mr-2">
						<div className="flex items-center gap-2">
							<Checkbox
								id={`review-stage-${stage.id}`}
								checked={stage.isReviewStage}
								onCheckedChange={(checked) => updateStage(stage.id, "isReviewStage", checked === true)}
								disabled={isSystem}
							/>
							<Label
								htmlFor={`review-stage-${stage.id}`}
								className="text-xs font-normal cursor-pointer select-none"
							>
								Mark as Review Stage
							</Label>
						</div>

						{stageGroups.length > 0 && (
							<div className="flex items-center gap-2">
								<TooltipProvider>
									<Tooltip delayDuration={300}>
										<TooltipTrigger asChild>
											<Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
										</TooltipTrigger>
										<TooltipContent className="max-w-[300px] p-3">
											<div className="space-y-2">
												<p className="font-semibold text-xs">Stage Group (Click to change)</p>
												<p className="text-xs text-muted-foreground">
													Click the button to cycle through stage types:
												</p>
												<ul className="text-xs space-y-1 list-disc pl-3">
													<li><span className="font-medium text-red-500">Pending</span>: Not started</li>
													<li><span className="font-medium text-orange-500">Active</span>: In progress</li>
													<li><span className="font-medium text-green-500">Completed</span>: Finished</li>
												</ul>
											</div>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>

								{(() => {
									const currentGroup = stageGroups.find(g => g.id === stage.stageGroupId) || stageGroups[1]; // Default to active if missing
									if (!currentGroup) return null;

									let colorClass = "bg-orange-500";
									if (currentGroup.id === 1) colorClass = "bg-red-500";
									else if (currentGroup.id === 2) colorClass = "bg-orange-500";
									else if (currentGroup.id === 3) colorClass = "bg-green-500";

									return (
										<div
											className="flex items-center gap-2 cursor-pointer group select-none bg-muted/30 hover:bg-muted/60 pl-1.5 pr-3 py-1.5 rounded-full border border-transparent hover:border-border transition-all"
											onClick={() => {
												// Cycle: 1 (Pending) -> 2 (Active) -> 3 (Completed) -> 1
												const nextId = currentGroup.id === 1 ? 2 : currentGroup.id === 2 ? 3 : 1;
												updateStage(stage.id, 'stageGroupId', nextId);
											}}
										>
											<div className={cn(
												"h-4 w-4 rounded-full border border-primary flex items-center justify-center p-0.5",
											)}>
												<div className={cn("h-full w-full rounded-full transition-colors", colorClass)} />
											</div>
											<span className="text-xs font-medium uppercase tracking-wide text-foreground">
												{currentGroup.name}
											</span>
										</div>
									);
								})()}
							</div>
						)}
					</div>

					{/* Stage Transition Configuration */}
					<div className="mt-3 ml-6">
						{stage.isReviewStage ? (
							<div className="grid gap-1.5">
								<Label className="text-xs">After approval, move task to:</Label>
								<Select
									value={stage.approvedTargetStageId || ""}
									onValueChange={(value) => updateStage(stage.id, "approvedTargetStageId", value)}
									disabled={isSystem}
								>
									<SelectTrigger className="h-8">
										<SelectValue placeholder="Select target stage" />
									</SelectTrigger>
									<SelectContent>
										{stages
											.filter((s) => s.id !== stage.id)
											.map((s) => (
												<SelectItem key={s.id} value={s.id}>
													{s.title || "Untitled Stage"}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</div>
						) : (
							<div className="grid gap-1.5">
								<Label className="text-xs">Linked Next Stage (Go to next nearest stage if not selected):</Label>
								<Select
									value={stage.linkedReviewStageId || "none"}
									onValueChange={(value) => updateStage(stage.id, "linkedReviewStageId", value === "none" ? undefined : value)}
									disabled={isSystem}
								>
									<SelectTrigger className="h-8">
										<SelectValue placeholder="Select Next stage" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">None (Go to next stage)</SelectItem>
										{stages
											.filter((s) => s.id !== stage.id)
											.map((s) => (
												<SelectItem key={s.id} value={s.id}>
													{s.title || "Untitled Stage"}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>
				</>
			)}

			{!['completed', 'complete', 'archive'].includes(stage.title.toLowerCase().trim()) && (
				<div className={cn("grid gap-2 mt-2 transition-all duration-300 ease-in-out",
					!stage.mainResponsibleId ? "grid-cols-1" :
						!stage.backupResponsibleId1 ? "grid-cols-1 md:grid-cols-2" :
							"grid-cols-1 md:grid-cols-3"
				)}>
					{(() => {
						const getOptions = (currentValue: string | undefined, excludeValues: (string | undefined)[]) => {
							let opts = memberOptions;
							opts = opts.filter(o => !excludeValues.includes(o.value));
							if (currentValue && !opts.find(o => o.value === currentValue)) {
								const user = allTeamMembers.find(u => u.id === currentValue);
								if (user) {
									opts = [...opts, {
										value: user.id,
										label: user.name + (user.is_active === false ? " (Deactivated)" : ""),
										group: "Deactivated"
									}];
								}
							}
							return opts;
						};

						return (
							<>
								<div className="flex flex-col gap-1.5 transition-all">
									<Label htmlFor={`main-responsible-${stage.id}`} className="text-xs">Main Responsible</Label>
									<SearchableSelect
										value={stage.mainResponsibleId}
										onValueChange={(value) => updateStage(stage.id, "mainResponsibleId", value)}
										options={getOptions(stage.mainResponsibleId, [stage.backupResponsibleId1, stage.backupResponsibleId2])}
										placeholder="Select main"
									/>
								</div>
								{stage.mainResponsibleId && (
									<div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-left-1 duration-300">
										<Label htmlFor={`backup1-responsible-${stage.id}`} className="text-xs">Backup Responsible 1</Label>
										<SearchableSelect
											value={stage.backupResponsibleId1}
											onValueChange={(value) => updateStage(stage.id, "backupResponsibleId1", value)}
											options={getOptions(stage.backupResponsibleId1, [stage.mainResponsibleId, stage.backupResponsibleId2])}
											placeholder="Select backup 1"
										/>
									</div>
								)}
								{stage.mainResponsibleId && stage.backupResponsibleId1 && (
									<div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-left-1 duration-300">
										<Label htmlFor={`backup2-responsible-${stage.id}`} className="text-xs">Backup Responsible 2</Label>
										<SearchableSelect
											value={stage.backupResponsibleId2}
											onValueChange={(value) => updateStage(stage.id, "backupResponsibleId2", value)}
											options={getOptions(stage.backupResponsibleId2, [stage.mainResponsibleId, stage.backupResponsibleId1])}
											placeholder="Select backup 2"
										/>
									</div>
								)}
							</>
						);
					})()}
				</div>
			)}
		</div>
	);
}

export function ProjectDialog({
	open,
	onOpenChange,
	onSave,
	existingProjects,
	teamMembers,
	editProject,
	departments,
	currentUser,
}: ProjectDialogProps) {
	const canSeeClientInfo = currentUser?.role === 'admin' || currentUser?.role === 'hr';
	const { toast } = useToast();
	const [formData, setFormData] = useState<ProjectFormData & { clientId?: string, estimatedHours?: number, status?: string, poNumber?: string, deadline?: string, poDocument?: File }>({
		name: "",
		description: "",
		clientId: "",
		estimatedHours: 0,
		status: "active",
		poNumber: "",
		deadline: "",
		poDocument: undefined,
	});
	const [clients, setClients] = useState<ClientType[]>([]);
	const [stages, setStages] = useState<Stage[]>([]);
	const [emails, setEmails] = useState<string[]>([]);
	const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
	const [department, setDepartment] = useState<Department | undefined>();
	const [groupId, setGroupId] = useState<string>("");
	const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
	const [stageGroups, setStageGroups] = useState<StageGroup[]>([]);
	const [phoneNumbersOptions, setPhoneNumbersOptions] = useState<{ value: string, label: string }[]>([]);
	const [currentStep, setCurrentStep] = useState(1);
	const [isDraggingPO, setIsDraggingPO] = useState(false);
	const [errors, setErrors] = useState<
		Partial<Record<keyof ProjectFormData | 'department', string>>
	>({});

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Fetch groups when department changes
	useEffect(() => {
		const fetchGroups = async () => {
			if (department) {
				try {
					const groups = await projectGroupService.getAll(String(department.id));
					setProjectGroups(groups);
				} catch (error) {
					console.error("Failed to load project groups", error);
					setProjectGroups([]);
				}
			} else {
				setProjectGroups([]);
			}
		};
		fetchGroups();
	}, [department]);

	useEffect(() => {
		if (open) {
			setCurrentStep(1);
			fetch('https://automation.artslabcreatives.com/webhook/af66e522-e04f-478d-aa0b-6c7b408c8fc6')
				.then(async response => {
					const text = await response.text();
					if (!text) return [];
					try {
						const data = JSON.parse(text);
						return Array.isArray(data) ? data : [];
					} catch (e) {
						console.error('Error parsing phone numbers JSON:', e);
						return [];
					}
				})
				.then(data => {
					const options = (data || []).map((item: { id: string, name: string }) => ({
						value: item.id,
						label: item.name,
					}));
					setPhoneNumbersOptions(options);
				})
				.catch(error => {
					console.error('Error fetching phone numbers:', error);
				});

			stageGroupService.getAll()
				.then(groups => setStageGroups(groups))
				.catch(err => console.error("Failed to load stage groups", err));

			if (canSeeClientInfo) {
				clientService.getAll()
					.then(data => setClients(data))
					.catch(err => console.error("Failed to load clients", err));
			}

			// Populate form if editing
			if (editProject) {
				setDepartment(editProject.department);
				setGroupId(editProject.group?.id ? String(editProject.group.id) : "");
				setFormData({
					name: editProject.name,
					description: editProject.description || "",
					clientId: editProject.clientId ? String(editProject.clientId) : "",
					estimatedHours: editProject.estimatedHours || 0,
					status: editProject.status || "active",
					poNumber: editProject.poNumber || "",
					deadline: editProject.deadline || "",
					poDocument: undefined, // cannot prefill file inputs
				});
				setStages(editProject.stages || []);
				setEmails(editProject.emails || []);
				setPhoneNumbers(editProject.phoneNumbers || []);
			} else {
				// For new project, auto-select department for team-lead
				if (currentUser?.role === "team-lead" || currentUser?.role === "account-manager") {
					const userDepartment = departments.find(
						dept => dept.id === currentUser.department
					);
					setDepartment(userDepartment);
				}
				setStages([
					{ id: 'system-suggested', title: 'Suggested Task', color: 'bg-slate-200', order: 0, type: 'project', isReviewStage: false, stageGroupId: 1 },
					{ id: 'system-pending', title: 'Pending', color: 'bg-orange-500', order: 1, type: 'project', isReviewStage: false, stageGroupId: 1 },
					{ id: 'system-completed', title: 'Completed', color: 'bg-green-500', order: 998, type: 'project', isReviewStage: false, stageGroupId: 3 },
					{ id: 'system-archive', title: 'Archive', color: 'bg-slate-500', order: 999, type: 'project', isReviewStage: false, stageGroupId: 3 },
				]);
				setEmails([]);
				setPhoneNumbers([]);
			}
		} else {
			setGroupId("");
			setFormData({ name: "", description: "", clientId: "", estimatedHours: 0, status: "active", poNumber: "", deadline: "", poDocument: undefined });
			setStages([]);
			setEmails([]);
			setPhoneNumbers([]);
		}
	}, [open, editProject, currentUser, departments]);

	// Split stages into logic groups
	const { topStages, middleStages, bottomStages } = useMemo(() => {
		const top: Stage[] = [];
		const bot: Stage[] = [];
		const mid: Stage[] = [];

		stages.forEach(s => {
			const t = s.title.toLowerCase().trim();
			if (t === 'suggested' || t === 'suggested task' || t === 'pending') {
				top.push(s);
			} else if (t === 'completed' || t === 'complete' || t === 'archive') {
				bot.push(s);
			} else {
				mid.push(s);
			}
		});

		// Sort system stages if they exist (unlikely in new project, but likely in edit)
		top.sort((a, b) => {
			const getP = (s: string) => (s.includes('suggested') ? 0 : 1);
			return getP(a.title.toLowerCase()) - getP(b.title.toLowerCase());
		});

		bot.sort((a, b) => {
			const getP = (s: string) => (s.includes('archive') ? 1 : 0);
			return getP(a.title.toLowerCase()) - getP(b.title.toLowerCase());
		});

		return { topStages: top, middleStages: mid, bottomStages: bot };
	}, [stages]);

	const [isCreatingGroup, setIsCreatingGroup] = useState(false);
	const [newGroupName, setNewGroupName] = useState("");
	const [newGroupParentId, setNewGroupParentId] = useState<string>("none");

	const handleCreateGroup = async () => {
		if (!newGroupName.trim() || !department) return;

		try {
			const parentId = newGroupParentId === "none" ? null : newGroupParentId;
			const newGroup = await projectGroupService.create(newGroupName, String(department.id), parentId);
			setProjectGroups([...projectGroups, newGroup]);
			setGroupId(newGroup.id);
			setNewGroupName("");
			setNewGroupParentId("none");
			setIsCreatingGroup(false);
			toast({
				title: "Group created",
				description: `Project group "${newGroup.name}" has been created.`,
			});
		} catch (error) {
			console.error("Failed to create group", error);
			toast({
				title: "Error",
				description: "Failed to create project group.",
				variant: "destructive",
			});
		}
	};

	// Helper to visualize hierarchy in dropdown
	const hierarchicalGroupOptions = useMemo(() => {
		const buildOptions = (parentId: string | null = null, depth = 0): JSX.Element[] => {
			const children = projectGroups.filter(g => g.parentId == parentId); // Abstract equality checks null/undefined
			if (children.length === 0) return [];

			let options: JSX.Element[] = [];
			children.forEach(child => {
				options.push(
					<SelectItem key={child.id} value={child.id}>
						{Array(depth).fill("\u00A0\u00A0").join("") + (depth > 0 ? "└ " : "") + child.name}
					</SelectItem>
				);
				options = [...options, ...buildOptions(child.id, depth + 1)];
			});
			return options;
		};
		const roots = projectGroups.filter(g => !g.parentId);
		let options: JSX.Element[] = [];
		roots.forEach(root => {
			options.push(
				<SelectItem key={root.id} value={root.id}>
					{root.name}
				</SelectItem>
			);
			options = [...options, ...buildOptions(root.id, 1)];
		});
		return options;
	}, [projectGroups]);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (active.id !== over?.id) {
			const oldIndex = middleStages.findIndex((s) => s.id === active.id);
			const newIndex = middleStages.findIndex((s) => s.id === over?.id);

			const newMiddle = arrayMove(middleStages, oldIndex, newIndex);
			// Reconstruct full list preserving top and bottom
			const newAllStages = [...topStages, ...newMiddle, ...bottomStages];

			// Update orders locally to reflect new sequence
			const reordered = newAllStages.map((s, idx) => ({ ...s, order: idx }));
			setStages(reordered);
		}
	};

	const nextStep = () => {
		setErrors({});
		if (currentStep === 1) {
			const result = projectSchema.safeParse({ name: formData.name, description: formData.description });
			if (!result.success) {
				const fieldErrors: any = {};
				result.error.errors.forEach((err) => {
					if (err.path[0]) fieldErrors[err.path[0]] = err.message;
				});
				setErrors(fieldErrors);
				return;
			}
			if (!department) {
				setErrors({ department: "Department is required" } as any);
				return;
			}
			if (existingProjects.some(p => p.toLowerCase() === formData.name.toLowerCase() && (!editProject || p !== editProject.name))) {
				setErrors({ name: "A project with this name already exists" });
				return;
			}
		}
		setCurrentStep(prev => Math.min(prev + 1, 3));
	};

	const prevStep = () => {
		setCurrentStep(prev => Math.max(prev - 1, 1));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		// If on step 1 or 2, just move to the next one
		if (currentStep === 1 || currentStep === 2) {
			nextStep();
			return;
		}

		// FINAL STEP (Step 3) VALIDATIONS - Only run if we are actually on step 3
		if (currentStep !== 3) return;

		// 1. Stage name validation (cannot use system names)
		const reservedNames = SYSTEM_STAGES;
		const hasInvalidNames = middleStages.some(s => reservedNames.includes(s.title.toLowerCase().trim()));
		if (hasInvalidNames) {
			toast({
				title: "Validation Error",
				description: "You cannot create stages with system reserved names (Suggested, Pending, etc).",
				variant: "destructive",
			});
			return;
		}

		// 2. Guard against empty custom stages if it's a new project
		// We use middleStages which contains everything except system stages
		if (middleStages.length === 0 && !editProject) {
			toast({
				title: "Validation Error",
				description: "Please add at least one custom stage to define your project workflow.",
				variant: "destructive",
			});
			return;
		}

		const uniqueStages: Stage[] = [];
		const seenTitles = new Set<string>();
		stages.forEach(stage => {
			const normalizedTitle = stage.title.toLowerCase().trim();
			if (!seenTitles.has(normalizedTitle)) {
				seenTitles.add(normalizedTitle);
				uniqueStages.push(stage);
			}
		});

		const stagesMissingResponsible = uniqueStages.filter(s => {
			const title = s.title.toLowerCase().trim();
			if (['completed', 'complete', 'archive'].includes(title)) return false;
			return !s.mainResponsibleId;
		});

		if (stagesMissingResponsible.length > 0) {
			const missingNames = stagesMissingResponsible.map(s => s.title).join(", ");
			toast({
				title: "Validation Error",
				description: `Assign Main Responsible for: ${missingNames}`,
				variant: "destructive",
			});
			return;
		}

		onSave(formData.name, formData.description || "", uniqueStages, emails, phoneNumbers, department, groupId, formData.clientId, formData.estimatedHours, formData.status, formData.poNumber, formData.deadline, formData.poDocument);
		onOpenChange(false);
	};

	const addStage = () => {
		const newStage: Stage = {
			id: `stage-${Date.now()}`,
			title: "",
			color: "bg-slate-200",
			order: stages.length,
			type: "project",
			mainResponsibleId: undefined,
			backupResponsibleId1: undefined,

			backupResponsibleId2: undefined,
			isReviewStage: false,
			stageGroupId: 2, // Default to Active/Orange group
		};
		// Add to middle
		setStages([...topStages, ...middleStages, newStage, ...bottomStages]);
	};

	const updateStage = <K extends keyof Stage>(id: string, field: K, value: Stage[K]) => {
		setStages(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
	};

	const removeStage = (id: string) => {
		setStages(prev => prev.filter(s => s.id !== id));
	};

	const memberOptions: SearchableOption[] = teamMembers
		.filter(member => member.is_active !== false)
		.map(member => {
			const deptName = departments.find(d => d.id === member.department)?.name || "Other";
			return {
				value: member.id,
				label: member.name,
				group: deptName
			};
		});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent 
				className="sm:max-w-[700px] max-h-[95vh] p-0 flex flex-col gap-0 overflow-hidden"
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
				onInteractOutside={(e) => e.preventDefault()}
			>
				<form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[95vh] overflow-hidden">
					<div className="p-6 pb-4 shrink-0">
						<DialogHeader>
							<DialogTitle>{editProject ? "Edit Project" : "Create New Project"}</DialogTitle>
							<DialogDescription>
								{editProject ? "Update project details and workflow stages." : "Add a new project with custom workflow stages."}
							</DialogDescription>
						</DialogHeader>
						
						{/* Step Indicator */}
						<div className="flex items-center justify-between mt-6">
							{[1, 2, 3].map((step) => (
								<div key={step} className="flex items-center flex-1 last:flex-none">
									<div className={cn(
										"h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
										currentStep === step ? "border-primary bg-primary text-primary-foreground scale-110" :
										currentStep > step ? "border-primary bg-primary/20 text-primary" : "border-muted text-muted-foreground"
									)}>
										{currentStep > step ? <Check className="h-4 w-4" /> : step}
									</div>
									<div className="flex-1 px-4">
										<p className={cn(
											"text-[10px] uppercase tracking-wider font-bold mb-0.5",
											currentStep === step ? "text-primary" : "text-muted-foreground"
										)}>
											Step {step}
										</p>
										<p className="text-xs font-semibold whitespace-nowrap">
											{step === 1 ? "Basics" : step === 2 ? "Details" : "Workflow"}
										</p>
									</div>
									{step < 3 && <div className={cn("h-[2px] flex-1 mx-2", currentStep > step ? "bg-primary" : "bg-muted")} />}
								</div>
							))}
						</div>
					</div>

					<Separator />

					<div className="flex-1 overflow-y-auto p-6">
						{currentStep === 1 && (
							<div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
								<div className="grid gap-2">
									<Label htmlFor="name">Project Name <span className="text-destructive">*</span></Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										placeholder="Enter project name"
										maxLength={50}
										className={errors.name ? "border-destructive" : ""}
										disabled={!!editProject}
									/>
									{errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
								</div>

								<div className="grid gap-2">
									<Label htmlFor="description">Description (Optional)</Label>
									<RichTextEditor
										id="description"
										value={formData.description || ""}
										onChange={(value) => setFormData({ ...formData, description: value })}
										placeholder="Enter project description"
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="grid gap-2">
										<Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
										<Select
											value={department?.id?.toString() ?? ""}
											onValueChange={(value) => {
												const selectedDept = departments.find(dept => dept.id.toString() === value);
												if (selectedDept) {
													setDepartment(selectedDept);
													setGroupId("");
													setErrors(prev => ({ ...prev, department: undefined }));
												}
											}}
											disabled={(currentUser?.role === "team-lead" || currentUser?.role === "account-manager") && departments.find(d => d.id === currentUser.department)?.name.toLowerCase() !== "digital"}
										>
											<SelectTrigger className={errors.department ? "border-destructive" : ""}>
												<SelectValue placeholder="Select department" />
											</SelectTrigger>
											<SelectContent>
												{departments.map((dept) => (
													<SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
									</div>

									<div className="grid gap-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="group">Group (Optional)</Label>
											<Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setIsCreatingGroup(true)} disabled={!department}>
												<Plus className="h-3 w-3 mr-1" /> New
											</Button>
										</div>
										{isCreatingGroup ? (
											<div className="flex flex-col gap-2 p-2 border rounded-md bg-muted/30">
												<Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Group Name" className="h-8 text-sm" />
												<div className="flex justify-end gap-1">
													<Button type="button" variant="ghost" size="sm" onClick={() => setIsCreatingGroup(false)}>Cancel</Button>
													<Button type="button" size="sm" onClick={handleCreateGroup}>Create</Button>
												</div>
											</div>
										) : (
											<Select value={groupId} onValueChange={(val) => setGroupId(val === "unassign_group" ? "" : val)} disabled={!department}>
												<SelectTrigger>
													<SelectValue placeholder="Select a group" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="unassign_group" className="text-muted-foreground italic">None</SelectItem>
													{hierarchicalGroupOptions}
												</SelectContent>
											</Select>
										)}
									</div>
								</div>
							</div>
						)}

						{currentStep === 2 && (
							<div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
								{canSeeClientInfo && (
									<div className="grid gap-2">
										<Label htmlFor="client">Client (Optional)</Label>
										<SearchableSelect
											value={formData.clientId}
											onValueChange={(value) => setFormData({ ...formData, clientId: value })}
											options={[
												{ value: "", label: "Internal Project (Default)" },
												...clients.map(client => ({ value: String(client.id), label: client.company_name }))
											]}
											placeholder="Select a client"
										/>
									</div>
								)}

								<div className="grid gap-2">
									<Label htmlFor="emails">External Emails</Label>
									<TagInput
										value={emails}
										onChange={setEmails}
										placeholder="Add emails..."
										validate={(email) => /^\S+@\S+\.\S+$/.test(email)}
									/>
								</div>

								<div className="grid gap-2">
									<Label htmlFor="phoneNumbers">WhatsApp Groups</Label>
									<MultiSearchableSelect options={phoneNumbersOptions} values={phoneNumbers} onValuesChange={setPhoneNumbers} placeholder="Select groups..." />
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="grid gap-2">
										<Label htmlFor="estimatedHours">Estimated Hours</Label>
										<Input id="estimatedHours" type="number" value={formData.estimatedHours} onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })} />
									</div>
									<div className="grid gap-2">
										<Label htmlFor="status">Status</Label>
										<Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
											<SelectTrigger><SelectValue /></SelectTrigger>
											<SelectContent>
												<SelectItem value="active">Active</SelectItem>
												<SelectItem value="on-hold">Blocked</SelectItem>
												<SelectItem value="completed">Completed</SelectItem>
												<SelectItem value="cancelled">Cancelled</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								
								{canSeeClientInfo && (
									<div className="grid gap-2">
										<Label htmlFor="deadline">Project Deadline</Label>
										<Input 
											id="deadline" 
											type="date" 
											value={formData.deadline} 
											onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} 
										/>
									</div>
								)}
								
								<div className="grid grid-cols-2 gap-4">
									<div className="grid gap-2">
										<Label htmlFor="poNumber">PO Number</Label>
										<Input
											id="poNumber"
											value={formData.poNumber}
											onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
											placeholder="Enter PO Number"
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="poDocument">Upload PO Document (Optional)</Label>
										<div 
											className={`flex justify-center px-6 py-4 border-2 border-dashed rounded-md transition-colors h-[104px]
											${isDraggingPO ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}`}
											onDragOver={(e) => { e.preventDefault(); setIsDraggingPO(true); }}
											onDragLeave={(e) => { e.preventDefault(); setIsDraggingPO(false); }}
											onDrop={(e) => {
												e.preventDefault();
												setIsDraggingPO(false);
												const file = e.dataTransfer.files?.[0];
												if (file) setFormData({ ...formData, poDocument: file });
											}}
										>
											<div className="space-y-1 text-center">
												{formData.poDocument ? (
													<div className="flex flex-col items-center justify-center h-full">
														<div className="flex items-center gap-2">
															<FileIcon className="h-6 w-6 text-primary" />
															<div className="text-left">
																<p className="text-sm font-medium max-w-[120px] truncate">{formData.poDocument.name}</p>
																<p className="text-xs text-muted-foreground">{(formData.poDocument.size / 1024 / 1024).toFixed(2)} MB</p>
															</div>
															<Button 
																type="button" 
																variant="ghost" 
																size="sm" 
																className="text-destructive hover:text-destructive h-8 px-2 ml-2"
																onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, poDocument: undefined }); }}
															>
																<X className="h-4 w-4" />
															</Button>
														</div>
													</div>
												) : (
													<>
														<UploadCloud className="mx-auto h-6 w-6 text-muted-foreground" />
														<div className="flex justify-center text-xs text-muted-foreground">
															<label
																htmlFor="poDocument"
																className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
															>
																<span>Upload a file</span>
																<Input
																	id="poDocument"
																	type="file"
																	className="sr-only"
																	onChange={(e) => {
																		const file = e.target.files?.[0];
																		if (file) setFormData({ ...formData, poDocument: file });
																	}}
																/>
															</label>
															<p className="pl-1 hidden sm:block">or drag and drop</p>
														</div>
														<p className="text-[10px] text-muted-foreground hidden sm:block">PDF, PNG, JPG up to 10MB</p>
													</>
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{currentStep === 3 && (
							<div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
								<div className="flex items-center justify-between">
									<Label className="text-base font-semibold">Workflow Stages <span className="text-destructive">*</span></Label>
								</div>
								
								<div className="text-[10px] text-muted-foreground bg-muted/50 p-2 rounded-md border border-dashed text-center">
									Note: <strong>Suggested, Backlog, Complete, and Archive</strong> stages are automatically managed.
								</div>

								<div className="space-y-4 pr-1">
									{topStages.map(stage => <SortableStageItem key={stage.id} stage={stage} updateStage={updateStage} removeStage={removeStage} stages={stages} memberOptions={memberOptions} isSystem={true} currentUser={currentUser} stageGroups={stageGroups} allTeamMembers={teamMembers} />)}
									
									<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
										<SortableContext items={middleStages.map(s => s.id)} strategy={verticalListSortingStrategy}>
											{middleStages.map(stage => <SortableStageItem key={stage.id} stage={stage} updateStage={updateStage} removeStage={removeStage} stages={stages} memberOptions={memberOptions} isSystem={false} currentUser={currentUser} stageGroups={stageGroups} allTeamMembers={teamMembers} />)}
										</SortableContext>
									</DndContext>

									<div className="flex items-center justify-center py-2">
										<Button 
											type="button" 
											variant="outline" 
											size="sm" 
											onClick={addStage} 
											className="w-full gap-2 border-dashed bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all h-10"
										>
											<Plus className="h-4 w-4" /> Add Custom Workflow Stage
										</Button>
									</div>

									{bottomStages.map(stage => <SortableStageItem key={stage.id} stage={stage} updateStage={updateStage} removeStage={removeStage} stages={stages} memberOptions={memberOptions} isSystem={true} currentUser={currentUser} stageGroups={stageGroups} allTeamMembers={teamMembers} />)}
								</div>
							</div>
						)}
					</div>

					<div className="p-6 pt-4 shrink-0 border-t mt-auto">
						<DialogFooter className="gap-2 sm:justify-between sm:gap-0">
							{currentStep > 1 ? (
								<Button key="back-btn" type="button" variant="outline" onClick={prevStep} className="gap-2">
									<ChevronLeft className="h-4 w-4" /> Back
								</Button>
							) : (
								<Button key="cancel-btn" type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
							)}
							
							{currentStep < 3 ? (
								<Button key="next-btn" type="button" onClick={nextStep} className="gap-2">
									Next <ChevronRight className="h-4 w-4" />
								</Button>
							) : (
								<Button key="submit-btn" type="submit" className="gap-2">
									{editProject ? "Update Project" : "Create Project"}
									<Check className="h-4 w-4" />
								</Button>
							)}
						</DialogFooter>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
