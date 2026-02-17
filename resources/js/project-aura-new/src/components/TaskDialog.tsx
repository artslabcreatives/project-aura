import { useState, useEffect, useRef } from "react";
import { Task, UserStatus, TaskPriority, User, TaskAttachment } from "@/types/task";
import { Stage } from "@/types/stage";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { SearchableSelect, SearchableOption } from "@/components/ui/searchable-select";
import { Project } from "@/types/project";
import { Department } from "@/types/department";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Link as LinkIcon, Upload, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { attachmentService } from "@/services/attachmentService";
import { tagService, Tag } from "@/services/tagService";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

// Represents a file that is pending upload (not yet saved to server)
interface PendingFile {
	id: string;
	file: File;
	name: string;
}

interface TaskDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (task: Omit<Task, "id" | "createdAt"> & { assigneeId?: string; assigneeIds?: string[] }, pendingFiles?: File[], pendingLinks?: { name: string; url: string }[]) => void;
	editTask?: Task | null;
	availableProjects?: string[];
	availableStatuses: Stage[];
	useProjectStages?: boolean;
	teamMembers: User[];
	departments: Department[];
	allTasks?: Task[];
	allProjects?: Project[];
	initialStageId?: string;
	isStageLocked?: boolean;
	currentUser?: User;
	fixedDepartmentId?: string;
	disableBacklogRenaming?: boolean;
}

export function TaskDialog({
	open,
	onOpenChange,
	onSave,
	editTask,
	availableProjects,
	availableStatuses,
	useProjectStages = false,
	teamMembers,
	departments,
	allTasks = [],
	allProjects,
	initialStageId,
	isStageLocked = false,
	currentUser,
	fixedDepartmentId,
	disableBacklogRenaming = false,
}: TaskDialogProps) {
	const { toast } = useToast();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const projects = availableProjects || [];
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		project: "",
		assignee: "", // Legacy/Display name of primary assignee
		assigneeIds: [] as string[], // IDs of all assignees
		dueDate: "",
		dueTime: "",
		userStatus: "pending" as UserStatus,
		projectStage: "",
		startStageId: "", // Stage to move to when start time arrives
		priority: "medium" as TaskPriority,
		startDate: "",
		startTime: "",
		isAssigneeLocked: false,
	});
	const [tags, setTags] = useState<string[]>([]);
	const [newTag, setNewTag] = useState("");
	const [noStartDate, setNoStartDate] = useState(false);
	const [noEndDate, setNoEndDate] = useState(false);
	// Saved attachments (from server/existing task)
	const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
	// Pending files to upload (not yet saved to server)
	const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
	// Pending links to add (for new tasks)
	const [pendingLinks, setPendingLinks] = useState<{ name: string; url: string }[]>([]);
	const [newLinkName, setNewLinkName] = useState("");
	const [newLinkUrl, setNewLinkUrl] = useState("");
	const [isUploading, setIsUploading] = useState(false);

	// Tag states
	const [availableTags, setAvailableTags] = useState<Tag[]>([]);
	const [tagDepartmentId, setTagDepartmentId] = useState<string>("");

	// Calculate task count for each assignee
	const getTaskCountForAssignee = (assigneeName: string) => {
		return allTasks.filter(task => task.assignee === assigneeName).length;
	};

	// Set initial department for tags based on user role or fixed department
	useEffect(() => {
		if (open) {
			if (fixedDepartmentId) {
				setTagDepartmentId(fixedDepartmentId);
			} else if (currentUser) {
				if (currentUser.role === 'team-lead' || currentUser.role === 'account-manager') {
					setTagDepartmentId(currentUser.department);
				} else if (currentUser.role === 'admin') {
					// Admin defaults to their department but can change it. 
					setTagDepartmentId(currentUser.department);
				} else {
					// Regular user defaults to their department
					setTagDepartmentId(currentUser.department);
				}
			}
		}
	}, [open, currentUser, fixedDepartmentId]);

	// Fetch tags when department changes
	useEffect(() => {
		const loadTags = async () => {
			if (!tagDepartmentId) return;
			try {
				const tags = await tagService.getAll(tagDepartmentId);
				setAvailableTags(tags);
			} catch (error) {
				console.error("Failed to load tags:", error);
			}
		};
		if (open) { // Only fetch if dialog is open
			loadTags();
		}
	}, [tagDepartmentId, open]);

	useEffect(() => {
		if (editTask) {
			// Map assignedUsers to IDs
			let ids: string[] = [];
			if (editTask.assignedUsers && editTask.assignedUsers.length > 0) {
				ids = editTask.assignedUsers.map(u => u.id);
			} else if (editTask.assignee) {
				// Fallback: try to find user by name
				const user = teamMembers.find(u => u.name === editTask.assignee);
				if (user) ids = [user.id];
			}

			setFormData({
				title: editTask.title,
				description: editTask.description,
				project: editTask.project,
				assignee: editTask.assignee,
				assigneeIds: ids,
				dueDate: editTask.dueDate.split("T")[0],
				dueTime: editTask.dueDate.split("T")[1]?.substring(0, 5) || "",
				userStatus: editTask.userStatus,
				projectStage: editTask.projectStage || "",
				startStageId: editTask.startStageId || "",
				priority: editTask.priority,
				startDate: editTask.startDate ? editTask.startDate.split("T")[0] : "",
				startTime: editTask.startDate ? editTask.startDate.split("T")[1]?.substring(0, 5) || "" : "",
				isAssigneeLocked: editTask.isAssigneeLocked || false,
			});
			setTags(editTask.tags || []);
			setAttachments(editTask.attachments || []);
			setPendingFiles([]);
			setPendingLinks([]);
			setNoStartDate(!editTask.startDate);
			setNoEndDate(!editTask.dueDate);
		} else {
			// Get specific stage ID if provided, otherwise default to "Pending" stage
			let defaultStage = "";
			if (initialStageId) {
				defaultStage = initialStageId;
			} else if (useProjectStages && availableStatuses.length > 0) {
				const pendingStage = availableStatuses.find(s => s.title === "Pending");
				if (pendingStage) {
					defaultStage = pendingStage.id;
				} else {
					// Fallback: exclude "Specific Stage" and "Suggested Task" if possible
					const validStage = availableStatuses.find(s => s.title !== "Specific Stage" && s.title !== "Suggested Task");
					defaultStage = (validStage || availableStatuses[0]).id;
				}
			}

			// Calculate Sri Lanka Time (UTC+5:30)
			const slTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" });
			const today = new Date(slTime);
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);

			// Format time as HH:mm
			const hours = String(today.getHours()).padStart(2, '0');
			const minutes = String(today.getMinutes()).padStart(2, '0');
			const slTimeString = `${hours}:${minutes}`;

			setFormData({
				title: "",
				description: "",
				project: projects.length === 1 ? projects[0] : "",
				assignee: "",
				assigneeIds: [],
				dueDate: tomorrow.toISOString().split('T')[0],
				dueTime: "17:00",
				userStatus: "pending",
				projectStage: defaultStage,
				startStageId: "",
				priority: "medium",
				startDate: today.toISOString().split('T')[0],
				startTime: slTimeString,
				isAssigneeLocked: false,
			});
			setTags([]);
			setAttachments([]);
			setPendingFiles([]);
			setPendingLinks([]);
			setNewTag("");
			setNewLinkName("");
			setNewLinkUrl("");
			setNoStartDate(false);
			setNoEndDate(false);
		}
	}, [editTask, open, availableStatuses, useProjectStages, projects, initialStageId, teamMembers]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Store as-is without timezone conversion
		// Store as-is without timezone conversion
		const dueDateTime = noEndDate
			? null
			: (formData.dueDate
				? `${formData.dueDate}T${formData.dueTime || "00:00"}:00`
				: new Date().toISOString());

		// Combine date and time for start
		const startDateTime = noStartDate
			? null
			: (formData.startDate
				? `${formData.startDate}T${formData.startTime || "00:00"}:00`
				: undefined);

		// Include any unsaved link inputs
		const effectivePendingLinks = [...pendingLinks];
		if (newLinkName && newLinkUrl) {
			effectivePendingLinks.push({ name: newLinkName, url: newLinkUrl });
		}

		// Determine primary assignee name and ID
		let primaryAssigneeName = formData.assignee;
		let primaryAssigneeId = undefined;
		if (formData.assigneeIds.length > 0) {
			// Use the first selected assignee as primary/legacy
			const firstUserId = formData.assigneeIds[0];
			const user = teamMembers.find(u => u.id === firstUserId);
			if (user) {
				primaryAssigneeName = user.name;
				primaryAssigneeId = user.id;
			}
		}

		// For editing existing tasks, upload files immediately
		if (editTask && (pendingFiles.length > 0 || effectivePendingLinks.length > 0)) {
			setIsUploading(true);
			try {
				const uploadedAttachments: TaskAttachment[] = [...attachments];

				// Upload pending files
				for (const pendingFile of pendingFiles) {
					const uploaded = await attachmentService.uploadFile(editTask.id, pendingFile.file);
					uploadedAttachments.push(uploaded);
				}

				// Add pending links
				for (const link of effectivePendingLinks) {
					const uploaded = await attachmentService.addLink(editTask.id, link.name, link.url);
					uploadedAttachments.push(uploaded);
				}

				onSave({
					...formData,
					assignee: primaryAssigneeName,
					assigneeId: primaryAssigneeId,
					assigneeIds: formData.assigneeIds,
					dueDate: dueDateTime,
					projectStage: formData.projectStage || undefined,
					userStatus: formData.userStatus,
					tags: tags.length > 0 ? tags : undefined,
					startDate: startDateTime,
					attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
					isAssigneeLocked: formData.isAssigneeLocked,
				});

				toast({
					title: "Files uploaded",
					description: `${pendingFiles.length + effectivePendingLinks.length} attachment(s) uploaded successfully.`,
				});
				// Clear inputs
				setNewLinkName("");
				setNewLinkUrl("");
			} catch (error) {
				console.error('Failed to upload attachments:', error);
				toast({
					title: "Upload failed",
					description: "Some attachments could not be uploaded. Please try again.",
					variant: "destructive",
				});
				setIsUploading(false);
				return;
			}
			setIsUploading(false);
		} else {
			// For new tasks, pass pending files to the parent to handle after task creation
			const filesToUpload = pendingFiles.map(pf => pf.file);
			onSave(
				{
					...formData,
					assignee: primaryAssigneeName,
					assigneeId: primaryAssigneeId,
					assigneeIds: formData.assigneeIds,
					dueDate: dueDateTime,
					projectStage: formData.projectStage || undefined,
					userStatus: formData.userStatus,
					tags: tags.length > 0 ? tags : undefined,
					startDate: startDateTime,
					attachments: attachments.length > 0 ? attachments : undefined,
					isAssigneeLocked: formData.isAssigneeLocked,
				},
				filesToUpload.length > 0 ? filesToUpload : undefined,
				effectivePendingLinks.length > 0 ? effectivePendingLinks : undefined
			);

			// Clear inputs
			setNewLinkName("");
			setNewLinkUrl("");
		}
		onOpenChange(false);
	};

	const addTag = (tag: string) => {
		if (tag && !tags.includes(tag)) {
			setTags([...tags, tag]);
			setNewTag("");
		}
	};

	const handleCreateTag = async () => {
		if (!newTag || !tagDepartmentId) return;

		try {
			const createdTag = await tagService.create(newTag, tagDepartmentId);
			// Add to available tags so it shows up
			setAvailableTags(prev => [...prev, createdTag]);
			// Add to selected tags
			addTag(createdTag.name);
			// Show success toast
			toast({
				title: "Tag created",
				description: "New tag added to " + getDepartmentName(tagDepartmentId),
			});
		} catch (error) {
			console.error("Failed to create tag:", error);
			toast({
				title: "Error",
				description: "Failed to create tag. You might not be authorized.",
				variant: "destructive",
			});
		}
	};

	const removeTag = (tagToRemove: string) => {
		setTags(tags.filter(tag => tag !== tagToRemove));
	};

	const addLink = () => {
		if (newLinkName && newLinkUrl) {
			if (editTask) {
				// For editing, we'll upload when saving - add to pending links
				setPendingLinks([...pendingLinks, { name: newLinkName, url: newLinkUrl }]);
			} else {
				// For new tasks, also add to pending links
				setPendingLinks([...pendingLinks, { name: newLinkName, url: newLinkUrl }]);
			}
			setNewLinkName("");
			setNewLinkUrl("");
		}
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		// Add files to pending list
		const newPendingFiles: PendingFile[] = Array.from(files).map(file => ({
			id: `pending-${Date.now()}-${Math.random()}`,
			file,
			name: file.name,
		}));

		setPendingFiles(prev => [...prev, ...newPendingFiles]);

		// Reset the file input
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const removeAttachment = async (id: string) => {
		// Check if it's a pending file
		if (id.startsWith('pending-')) {
			setPendingFiles(pendingFiles.filter(pf => pf.id !== id));
			return;
		}

		// Check if it's an existing attachment - delete from server
		const attachment = attachments.find(att => att.id === id);
		if (attachment) {
			try {
				await attachmentService.delete(id);
				setAttachments(attachments.filter(att => att.id !== id));
				toast({
					title: "Attachment removed",
					description: "The attachment has been deleted.",
				});
			} catch (error) {
				console.error('Failed to delete attachment:', error);
				toast({
					title: "Delete failed",
					description: "Could not delete the attachment. Please try again.",
					variant: "destructive",
				});
			}
		}
	};

	const removePendingLink = (index: number) => {
		setPendingLinks(pendingLinks.filter((_, i) => i !== index));
	};

	const getDepartmentName = (departmentId: string) => {
		return departments.find(dep => dep.id === departmentId)?.name || "Uncategorized";
	};

	// Use member ID as value
	const memberOptions: SearchableOption[] = teamMembers
		.filter(member => member.is_active !== false || formData.assigneeIds.includes(member.id))
		.map((member) => {
			const departmentName = getDepartmentName(member.department);
			const taskCount = getTaskCountForAssignee(member.name);
			return {
				value: member.id, // Use ID as value
				label: `${member.name} (${taskCount})` + (member.is_active === false ? " (Deactivated)" : ""),
				group: departmentName,
			};
		});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>
							{editTask ? "Edit Task" : "Create New Task"}
						</DialogTitle>
						<DialogDescription>
							{editTask
								? "Make changes to the task details below."
								: "Add a new task to your project. Fill in the details below."}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								placeholder="Enter task title"
								required
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<RichTextEditor
								id="description"
								value={formData.description}
								onChange={(value) =>
									setFormData({ ...formData, description: value })
								}
								placeholder="Enter task description"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="project">Project *</Label>
								<SearchableSelect
									value={formData.project}
									onValueChange={(value) =>
										setFormData({ ...formData, project: value })
									}
									options={[
										...(allProjects || []).map(project => ({
											value: project.name,
											label: project.name,
											group: project.department ? project.department.name : "Uncategorized"
										}))
									]}
									placeholder="Select project"
									disabled={projects.length === 1}
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="assignee">Assign To *</Label>
								<SearchableSelect
									value={formData.assigneeIds[0]}
									onValueChange={(value) =>
										setFormData({ ...formData, assigneeIds: value ? [value] : [] })
									}
									options={memberOptions}
									placeholder="Select member"
								/>
								{(currentUser?.role === 'admin' || currentUser?.role === 'team-lead' || currentUser?.role === 'account-manager') && (
									<div className="flex items-center space-x-2 mt-2">
										<Checkbox
											id="isAssigneeLocked"
											checked={formData.isAssigneeLocked}
											onCheckedChange={(checked) => setFormData({ ...formData, isAssigneeLocked: checked as boolean })}
										/>
										<Label htmlFor="isAssigneeLocked" className="text-xs font-normal text-muted-foreground">
											Keep Assigning this user
										</Label>
									</div>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="status">Status</Label>
								<Select
									value={useProjectStages ? formData.projectStage : formData.userStatus}
									onValueChange={(value) => {
										const updates: any = {};

										if (useProjectStages) {
											updates.projectStage = value;
											// Try to map back to userStatus if possible
											const selectedStage = availableStatuses.find(s => s.id === value);
											if (selectedStage) {
												const title = selectedStage.title.toLowerCase();
												if (title === 'pending') updates.userStatus = 'pending';
												else if (title.includes('complete')) updates.userStatus = 'complete';
												else updates.userStatus = 'in-progress';
											}
										} else {
											updates.userStatus = value as UserStatus;

											// Auto-select corresponding project stage if available
											if (allProjects && formData.project) {
												const project = allProjects.find(p => p.name === formData.project);
												if (project && project.stages) {
													let mappedStage;
													if (value === 'pending') {
														mappedStage = project.stages.find(s => s.title.toLowerCase() === 'pending');
													} else if (value === 'complete') {
														mappedStage = project.stages.find(s => ['complete', 'completed'].includes(s.title.toLowerCase()));
													} else {
														// For in-progress, maybe don't force a stage unless we know which one?
														// Or better, clear it to avoid mismatch?
														// Actually keeping it undefined is safer for the backend to handle or ignore.
													}

													if (mappedStage) {
														updates.projectStage = String(mappedStage.id);
													} else {
														updates.projectStage = "";
													}
												}
											}
										}

										setFormData(prev => ({ ...prev, ...updates }));
									}}
									disabled={isStageLocked}
								>
									<SelectTrigger id="status">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{(useProjectStages && allProjects && formData.project
											? allProjects.find(p => p.name === formData.project)?.stages || availableStatuses
											: availableStatuses
										)
											.filter((status) => status.title !== "Specific Stage") // Hide Specific Stage from selection
											.slice()
											.sort((a, b) => {
												return a.order - b.order;
											})
											.map((status) => (
												<SelectItem key={status.id} value={status.id}>
													{status.title === "Pending" && !disableBacklogRenaming
														? "Backlog"
														: status.title}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="priority">Priority</Label>
								<Select
									value={formData.priority}
									onValueChange={(value: TaskPriority) =>
										setFormData({ ...formData, priority: value })
									}
								>
									<SelectTrigger id="priority">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="high">High</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Start Stage Selector - Show whenever we have a project stage that is "Pending" */}
						{(() => {
							// Determine if we should show the start stage selector
							// Condition: We have a valid project selected, and the CURRENT projectStage is "Pending"

							if (!formData.project) return null;

							// Find the relevant stages
							let currentProjectStages: Stage[] = [];

							if (allProjects) {
								const proj = allProjects.find(p => p.name === formData.project);
								if (proj) currentProjectStages = proj.stages;
							}

							// Fallback if useProjectStages is true and availableStatuses are passed correctly
							if (currentProjectStages.length === 0 && useProjectStages) {
								currentProjectStages = availableStatuses;
							}

							if (currentProjectStages.length === 0) return null;

							// Check if current stage is Pending
							// We check formData.projectStage
							const currentStageId = formData.projectStage;
							const currentStage = currentProjectStages.find(s => String(s.id) === String(currentStageId));

							// If we don't have a mapped project stage, check if userStatus is pending and we can find a pending stage
							let isPending = false;
							if (currentStage) {
								isPending = currentStage.title.toLowerCase() === "pending";
							} else if (formData.userStatus === 'pending') {
								// If userStatus is pending, we might have just failed to map it above due to state updates delay or earlier logic
								// But we should try to find the pending stage to show the options
								const pendingStage = currentProjectStages.find(s => s.title.toLowerCase() === 'pending');
								if (pendingStage) {
									isPending = true;
									// Verify if we should have had this set
								}
							}

							if (!isPending) return null;

							// Get available stages excluding Pending and Suggested Task
							const startStageOptions = currentProjectStages
								.filter(s => s.title !== "Pending" && s.title !== "Suggested Task" && s.title !== "Specific Stage")
								.sort((a, b) => a.order - b.order);

							return (
								<div className="grid gap-2">
									<Label htmlFor="startStage">Start Stage (Auto-move)</Label>
									<Select
										value={formData.startStageId || undefined}
										onValueChange={(value) =>
											setFormData({ ...formData, startStageId: value || "" })
										}
									>
										<SelectTrigger id="startStage">
											<SelectValue placeholder="None (Stay in Pending)" />
										</SelectTrigger>
										<SelectContent>
											{startStageOptions.map((stage) => (
												<SelectItem key={stage.id} value={String(stage.id)}>
													{stage.title}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<p className="text-xs text-muted-foreground">
										Task will automatically move to this stage when the start time arrives
									</p>
								</div>
							);
						})()}

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="startDate">Start Date</Label>
									{(currentUser?.role === 'admin' || currentUser?.role === 'team-lead' || currentUser?.role === 'account-manager') && (
										<div className="flex items-center space-x-2">
											<Checkbox
												id="noStartDate"
												checked={noStartDate}
												onCheckedChange={(checked) => setNoStartDate(checked as boolean)}
											/>
											<Label htmlFor="noStartDate" className="text-xs font-normal text-muted-foreground">No date</Label>
										</div>
									)}
								</div>
								<Input
									id="startDate"
									type="date"
									value={formData.startDate}
									disabled={noStartDate}
									onChange={(e) =>
										setFormData({ ...formData, startDate: e.target.value })
									}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="startTime">Start Time</Label>
								<Input
									id="startTime"
									type="time"
									value={formData.startTime}
									disabled={noStartDate}
									onChange={(e) =>
										setFormData({ ...formData, startTime: e.target.value })
									}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="dueDate">End Date {noEndDate ? '' : '*'}</Label>
									{(currentUser?.role === 'admin' || currentUser?.role === 'team-lead' || currentUser?.role === 'account-manager') && (
										<div className="flex items-center space-x-2">
											<Checkbox
												id="noEndDate"
												checked={noEndDate}
												onCheckedChange={(checked) => setNoEndDate(checked as boolean)}
											/>
											<Label htmlFor="noEndDate" className="text-xs font-normal text-muted-foreground">No date</Label>
										</div>
									)}
								</div>
								<Input
									id="dueDate"
									type="date"
									value={formData.dueDate}
									disabled={noEndDate}
									onChange={(e) =>
										setFormData({ ...formData, dueDate: e.target.value })
									}
									required={!noEndDate}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="dueTime">End Time</Label>
								<Input
									id="dueTime"
									type="time"
									value={formData.dueTime}
									disabled={noEndDate}
									onChange={(e) =>
										setFormData({ ...formData, dueTime: e.target.value })
									}
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<div className="flex items-center justify-between">
								<Label>Tags</Label>
								{currentUser?.role === 'admin' && (
									<Select value={tagDepartmentId} onValueChange={setTagDepartmentId} disabled={!!fixedDepartmentId}>
										<SelectTrigger className="w-[180px] h-8 text-xs">
											<SelectValue placeholder="Filter by Department" />
										</SelectTrigger>
										<SelectContent>
											{departments.map((dept) => (
												<SelectItem key={dept.id} value={dept.id}>
													{dept.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>

							<div className="flex flex-wrap gap-2 mb-2">
								{tags.map(tag => (
									<Badge key={tag} variant="secondary" className="gap-1">
										{tag}
										<X
											className="h-3 w-3 cursor-pointer"
											onClick={() => removeTag(tag)}
										/>
									</Badge>
								))}
							</div>
							<div className="flex flex-wrap gap-2 mb-2">
								{availableTags
									.filter(tag => !tags.includes(tag.name))
									.map(tag => (
										<Badge
											key={tag.id}
											variant="outline"
											className="cursor-pointer hover:bg-secondary"
											onClick={() => addTag(tag.name)}
										>
											<Plus className="h-3 w-3 mr-1" />
											{tag.name}
										</Badge>
									))}
							</div>

							{(currentUser?.role === 'admin' || currentUser?.role === 'team-lead') && (
								<div className="flex gap-2">
									<Input
										placeholder="New tag name..."
										value={newTag}
										onChange={(e) => setNewTag(e.target.value)}
										onKeyPress={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												handleCreateTag();
											}
										}}
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={handleCreateTag}
										disabled={!newTag || !tagDepartmentId}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							)}
						</div>

						<div className="grid gap-2">
							<Label>Attachments</Label>

							{/* Existing attachments from server */}
							{attachments.length > 0 && (
								<div className="space-y-2 mb-2">
									{attachments.map(attachment => (
										<div
											key={attachment.id}
											className="flex items-center justify-between p-2 border rounded-md"
										>
											<div className="flex items-center gap-2">
												{attachment.type === "link" ? (
													<LinkIcon className="h-4 w-4 text-blue-500" />
												) : (
													<Upload className="h-4 w-4 text-green-500" />
												)}
												<a
													href={attachment.url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm truncate max-w-[200px] hover:underline"
												>
													{attachment.name}
												</a>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												onClick={() => removeAttachment(attachment.id)}
											>
												<X className="h-3 w-3" />
											</Button>
										</div>
									))}
								</div>
							)}

							{/* Pending files to upload */}
							{pendingFiles.length > 0 && (
								<div className="space-y-2 mb-2">
									{pendingFiles.map(pendingFile => (
										<div
											key={pendingFile.id}
											className="flex items-center justify-between p-2 border border-dashed rounded-md bg-muted/50"
										>
											<div className="flex items-center gap-2">
												<Upload className="h-4 w-4 text-orange-500" />
												<span className="text-sm truncate max-w-[200px]">
													{pendingFile.name}
												</span>
												<Badge variant="outline" className="text-xs">
													Pending upload
												</Badge>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												onClick={() => removeAttachment(pendingFile.id)}
											>
												<X className="h-3 w-3" />
											</Button>
										</div>
									))}
								</div>
							)}

							{/* Pending links to add */}
							{pendingLinks.length > 0 && (
								<div className="space-y-2 mb-2">
									{pendingLinks.map((link, index) => (
										<div
											key={`pending-link-${index}`}
											className="flex items-center justify-between p-2 border border-dashed rounded-md bg-muted/50"
										>
											<div className="flex items-center gap-2">
												<LinkIcon className="h-4 w-4 text-orange-500" />
												<span className="text-sm truncate max-w-[200px]">
													{link.name}
												</span>
												<Badge variant="outline" className="text-xs">
													Pending
												</Badge>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												onClick={() => removePendingLink(index)}
											>
												<X className="h-3 w-3" />
											</Button>
										</div>
									))}
								</div>
							)}

							<div className="space-y-2">
								<div className="flex gap-2">
									<Input
										ref={fileInputRef}
										type="file"
										multiple
										onChange={handleFileUpload}
										className="file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
									/>
								</div>

								<div className="flex gap-2">
									<Input
										placeholder="Link name..."
										value={newLinkName}
										onChange={(e) => setNewLinkName(e.target.value)}
									/>
									<Input
										placeholder="URL..."
										value={newLinkUrl}
										onChange={(e) => setNewLinkUrl(e.target.value)}
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={addLink}
									>
										<LinkIcon className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isUploading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isUploading}>
							{isUploading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Uploading...
								</>
							) : (
								editTask ? "Save Changes" : "Create Task"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent >
		</Dialog >
	);
}