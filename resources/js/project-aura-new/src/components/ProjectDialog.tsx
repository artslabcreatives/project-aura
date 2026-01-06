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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Stage } from "@/types/stage";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@/types/task";
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
import { MultiSelect } from "./ui/multi-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Department } from "@/types/department";
import { Project } from "@/types/project";
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
		department?: Department
	) => void;
	existingProjects: string[];
	teamMembers: User[];
	editProject?: Project;
	departments: Department[];
	currentUser?: User | null;
}

interface SortableStageItemProps {
	stage: Stage;
	updateStage: <K extends keyof Stage>(id: string, field: K, value: Stage[K]) => void;
	removeStage: (id: string) => void;
	stages: Stage[];
	memberOptions: SearchableOption[];
	isSystem?: boolean;
}

function SortableStageItem({ stage, updateStage, removeStage, stages, memberOptions, isSystem }: SortableStageItemProps) {
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
					value={stage.title}
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
					<SelectTrigger className="w-[140px]">
						<SelectValue>
							<div className="flex items-center gap-2">
								<div
									className="h-3 w-3 rounded-full border border-slate-200"
									style={{ backgroundColor: colorOptions.find(c => c.value === stage.color)?.hex }}
								/>
								<span className="text-sm">
									{colorOptions.find(c => c.value === stage.color)?.label}
								</span>
							</div>
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{colorOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								<div className="flex items-center gap-2">
									<div
										className="h-3 w-3 rounded-full border border-slate-200"
										style={{ backgroundColor: option.hex }}
									/>
									<span>{option.label}</span>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
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
				{isSystem && <div className="w-9" />} {/* Spacer for delete button */}
			</div>

			<div className="flex items-center gap-2 ml-6">
				<Checkbox
					id={`review-stage-${stage.id}`}
					checked={stage.isReviewStage}
					onCheckedChange={(checked) => updateStage(stage.id, "isReviewStage", checked === true)}
					disabled={isSystem}
				/>
				<Label
					htmlFor={`review-stage-${stage.id}`}
					className="text-xs font-normal cursor-pointer"
				>
					Mark as Review Stage
				</Label>
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
						<Label className="text-xs">Linked Review Stage (Optional):</Label>
						<Select
							value={stage.linkedReviewStageId || "none"}
							onValueChange={(value) => updateStage(stage.id, "linkedReviewStageId", value === "none" ? undefined : value)}
							disabled={isSystem}
						>
							<SelectTrigger className="h-8">
								<SelectValue placeholder="Select review stage" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">None (Go to next stage)</SelectItem>
								{stages
									.filter((s) => s.isReviewStage && s.id !== stage.id)
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


			<div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor={`main-responsible-${stage.id}`} className="text-xs">Main Responsible</Label>
					<SearchableSelect
						value={stage.mainResponsibleId}
						onValueChange={(value) => updateStage(stage.id, "mainResponsibleId", value)}
						options={memberOptions.filter(o => o.value !== stage.backupResponsibleId1 && o.value !== stage.backupResponsibleId2)}
						placeholder="Select main"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor={`backup1-responsible-${stage.id}`} className="text-xs">Backup Responsible 1</Label>
					<SearchableSelect
						value={stage.backupResponsibleId1}
						onValueChange={(value) => updateStage(stage.id, "backupResponsibleId1", value)}
						options={memberOptions.filter(o => o.value !== stage.mainResponsibleId && o.value !== stage.backupResponsibleId2)}
						placeholder="Select backup 1"
					/>
				</div>
				<div className="flex flex-col gap-1.5">
					<Label htmlFor={`backup2-responsible-${stage.id}`} className="text-xs">Backup Responsible 2</Label>
					<SearchableSelect
						value={stage.backupResponsibleId2}
						onValueChange={(value) => updateStage(stage.id, "backupResponsibleId2", value)}
						options={memberOptions.filter(o => o.value !== stage.mainResponsibleId && o.value !== stage.backupResponsibleId1)}
						placeholder="Select backup 2"
					/>
				</div>
			</div>
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
	const { toast } = useToast();
	const [formData, setFormData] = useState<ProjectFormData>({
		name: "",
		description: "",
	});
	const [stages, setStages] = useState<Stage[]>([]);
	const [emails, setEmails] = useState<string[]>([]);
	const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
	const [department, setDepartment] = useState<Department | undefined>();
	const [phoneNumbersOptions, setPhoneNumbersOptions] = useState<{ value: string, label: string }[]>([]);
	const [errors, setErrors] = useState<
		Partial<Record<keyof ProjectFormData, string>>
	>({});

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	useEffect(() => {
		if (open) {
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

			// Populate form if editing
			if (editProject) {
				setFormData({
					name: editProject.name,
					description: editProject.description || "",
				});
				setStages(editProject.stages || []);
				setEmails(editProject.emails || []);
				setPhoneNumbers(editProject.phoneNumbers || []);
				setDepartment(editProject.department);
			} else {
				// For new project, auto-select department for team-lead
				if (currentUser?.role === "team-lead") {
					const userDepartment = departments.find(
						dept => dept.id === currentUser.department
					);
					setDepartment(userDepartment);
				}
				setStages([]);
			}
		} else {
			setFormData({ name: "", description: "" });
			setStages([]);
			setErrors({});
			setEmails([]);
			setPhoneNumbers([]);
			setDepartment(undefined);
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const result = projectSchema.safeParse(formData);

		if (!result.success) {
			const fieldErrors: Partial<Record<keyof ProjectFormData, string>> = {};
			result.error.errors.forEach((err) => {
				if (err.path[0]) {
					fieldErrors[err.path[0] as keyof ProjectFormData] = err.message;
				}
			});
			setErrors(fieldErrors);
			return;
		}

		if (existingProjects.some(p => p.toLowerCase() === result.data.name.toLowerCase() && (!editProject || p !== editProject.name))) {
			setErrors({ name: "A project with this name already exists" });
			return;
		}

		// Ensure stages don't use reserved names
		const reservedNames = SYSTEM_STAGES;
		const hasInvalidNames = middleStages.some(s => reservedNames.includes(s.title.toLowerCase().trim()));
		if (hasInvalidNames) {
			toast({
				title: "Validation Error",
				description: "You cannot create stages with system reserved names (Suggest, Pending, Complete, Archive).",
				variant: "destructive",
			});
			return;
		}

		if (middleStages.length === 0 && !editProject) {
			toast({
				title: "Validation Error",
				description: "Please add at least one custom stage to the project.",
				variant: "destructive",
			});
			return;
		}

		const stageTitles = stages.map(s => s.title.toLowerCase());
		const hasDuplicates = stageTitles.some((title, index) => stageTitles.indexOf(title) !== index);
		if (hasDuplicates) {
			toast({
				title: "Validation Error",
				description: "Stage names must be unique",
				variant: "destructive",
			});
			return;
		}

		onSave(result.data.name, result.data.description || "", stages, emails, phoneNumbers, department);
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

	const memberOptions: SearchableOption[] = teamMembers.map(member => {
		const deptName = departments.find(d => d.id === member.department)?.name || "Other";
		return {
			value: member.id,
			label: member.name,
			group: deptName
		};
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{editProject ? "Edit Project" : "Create New Project"}</DialogTitle>
						<DialogDescription>
							{editProject ? "Update project details and workflow stages." : "Add a new project with custom workflow stages."}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name">
								Project Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="Enter project name"
								maxLength={50}
								className={errors.name ? "border-destructive" : ""}
								disabled={!!editProject}
							/>
							{errors.name && (
								<p className="text-sm text-destructive">{errors.name}</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="description">Description (Optional)</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								placeholder="Enter project description"
								rows={3}
								maxLength={200}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="emails">External Emails</Label>
							<TagInput
								value={emails}
								onChange={setEmails}
								placeholder="Add emails and press Enter..."
								validate={(email) => /^\S+@\S+\.\S+$/.test(email)}
								validationMessage="Please enter a valid email address."
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="phoneNumbers">WhatsApp Group's</Label>
							<MultiSelect
								options={phoneNumbersOptions}
								value={phoneNumbers}
								onValueChange={setPhoneNumbers}
								placeholder="Select numbers..."
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="department">Department</Label>
							<Select
								value={department?.id?.toString() ?? ""}
								onValueChange={(value) => {
									if (!value || value === "") {
										setDepartment(undefined);
										return;
									}
									const selectedDept = departments.find(
										(dept) => dept.id.toString() === value
									);
									if (selectedDept) {
										setDepartment(selectedDept);
									}
								}}
								disabled={currentUser?.role === "team-lead" && departments.find(d => d.id === currentUser.department)?.name.toLowerCase() !== "digital"}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a department" />
								</SelectTrigger>
								<SelectContent>
									{currentUser?.role === "team-lead" && departments.find(d => d.id === currentUser.department)?.name.toLowerCase() === "digital" ? (
										departments
											.filter(dept => dept.name.toLowerCase() === "digital" || dept.name.toLowerCase() === "design")
											.map((dept) => (
												<SelectItem key={dept.id} value={dept.id.toString()}>
													{dept.name}
												</SelectItem>
											))
									) : (
										departments.map((dept) => (
											<SelectItem key={dept.id} value={dept.id.toString()}>
												{dept.name}
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-3">
							<div className="flex items-center justify-between">
								<Label>
									Workflow Stages <span className="text-destructive">*</span>
								</Label>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addStage}
									className="gap-2"
								>
									<Plus className="h-4 w-4" />
									Add Stage
								</Button>
							</div>

							<div className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
								Note: <strong>Suggested, Pending, Complete, and Archive</strong> stages are automatically created and managed by the system. You only need to define the custom workflow steps in between.
							</div>

							{stages.length === 0 && !editProject ? (
								<div className="text-center py-6 border-2 border-dashed rounded-lg">
									<p className="text-sm text-muted-foreground">
										No custom stages yet. Click "Add Stage" to create your workflow.
									</p>
								</div>
							) : (
								<div className="space-y-2">
									{topStages.map(stage => (
										<SortableStageItem
											key={stage.id}
											stage={stage}
											updateStage={updateStage}
											removeStage={removeStage}
											stages={stages}
											memberOptions={memberOptions}
											isSystem={true}
										/>
									))}

									<DndContext
										sensors={sensors}
										collisionDetection={closestCenter}
										onDragEnd={handleDragEnd}
									>
										<SortableContext
											items={middleStages.map(s => s.id)}
											strategy={verticalListSortingStrategy}
										>
											{middleStages.map(stage => (
												<SortableStageItem
													key={stage.id}
													stage={stage}
													updateStage={updateStage}
													removeStage={removeStage}
													stages={stages}
													memberOptions={memberOptions}
													isSystem={false}
												/>
											))}
										</SortableContext>
									</DndContext>

									{bottomStages.map(stage => (
										<SortableStageItem
											key={stage.id}
											stage={stage}
											updateStage={updateStage}
											removeStage={removeStage}
											stages={stages}
											memberOptions={memberOptions}
											isSystem={true}
										/>
									))}
								</div>
							)}
							<p className="text-xs text-muted-foreground">
								Drag and drop to reorder custom stages.
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit">{editProject ? "Update Project" : "Create Project"}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
