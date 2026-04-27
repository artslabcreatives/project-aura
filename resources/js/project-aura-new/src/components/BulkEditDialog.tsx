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
import { Label } from "@/components/ui/label";
import { SearchableSelect, SearchableOption } from "@/components/ui/searchable-select";
import { User } from "@/types/task";
import { Input } from "@/components/ui/input";
import { Calendar, User as UserIcon, Clock, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

interface BulkEditDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (updates: { assigneeId?: number; dueDate?: string; extendDays?: number; clearDueDate?: boolean }) => Promise<void>;
	teamMembers: User[];
	selectedCount: number;
	departments: { id: string; name: string }[];
}

export function BulkEditDialog({
	open,
	onOpenChange,
	onSave,
	teamMembers,
	selectedCount,
	departments,
}: BulkEditDialogProps) {
	const [assigneeId, setAssigneeId] = useState<string>("");
	const [dueDate, setDueDate] = useState<string>("");
	const [dueTime, setDueTime] = useState<string>("17:00");
	const [extendDays, setExtendDays] = useState<string>("");
	const [clearDueDate, setClearDueDate] = useState(false);
	const [updateAssignee, setUpdateAssignee] = useState(false);
	const [updateDueDate, setUpdateDueDate] = useState(false);
	const [dateMode, setDateMode] = useState<"set" | "extend" | "clear">("set");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (open) {
			setAssigneeId("");
			setDueDate("");
			setDueTime("17:00");
			setExtendDays("");
			setClearDueDate(false);
			setUpdateAssignee(false);
			setUpdateDueDate(false);
			setDateMode("set");
			setIsSubmitting(false);
		}
	}, [open]);

	const handleSave = async () => {
		if (!updateAssignee && !updateDueDate) return;

		setIsSubmitting(true);
		try {
			const updates: { assigneeId?: number; dueDate?: string; extendDays?: number; clearDueDate?: boolean } = {};
			if (updateAssignee && assigneeId) {
				updates.assigneeId = parseInt(assigneeId);
			}
			if (updateDueDate) {
				if (dateMode === "clear") {
					updates.clearDueDate = true;
				} else if (dateMode === "extend" && extendDays) {
					updates.extendDays = parseInt(extendDays);
				} else if (dateMode === "set" && dueDate) {
					updates.dueDate = `${dueDate}T${dueTime || "00:00"}:00`;
				}
			}
			await onSave(updates);
			onOpenChange(false);
		} catch (error) {
			console.error("Bulk update failed:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const getDepartmentName = (id: string) => {
		return departments.find(d => d.id === id)?.name || "Uncategorized";
	};

	const memberOptions: SearchableOption[] = teamMembers
		.filter(member => member.is_active !== false)
		.map((member) => ({
			value: member.id,
			label: member.name,
			group: getDepartmentName(member.department),
		}));

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Bulk Edit Tasks</DialogTitle>
					<DialogDescription>
						Update {selectedCount} selected task{selectedCount !== 1 ? 's' : ''} at once.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Assignee Update Section */}
					<div className="space-y-4">
						<div className="flex items-center space-x-2">
							<Checkbox 
								id="updateAssignee" 
								checked={updateAssignee} 
								onCheckedChange={(checked) => setUpdateAssignee(checked as boolean)} 
							/>
							<Label htmlFor="updateAssignee" className="font-semibold cursor-pointer">Update Assignee</Label>
						</div>
						
						<div className={`pl-6 space-y-2 transition-all ${updateAssignee ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
							<SearchableSelect
								value={assigneeId}
								onValueChange={setAssigneeId}
								options={memberOptions}
								placeholder="Select new assignee"
							/>
						</div>
					</div>

					<Separator />

					{/* Due Date Update Section */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<Checkbox 
									id="updateDueDate" 
									checked={updateDueDate} 
									onCheckedChange={(checked) => {
										setUpdateDueDate(checked as boolean);
										if (checked) setClearDueDate(false);
									}} 
								/>
								<Label htmlFor="updateDueDate" className="font-semibold cursor-pointer">Update Due Date</Label>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox 
									id="clearDueDate" 
									checked={clearDueDate} 
									onCheckedChange={(checked) => {
										setClearDueDate(checked as boolean);
										if (checked) {
											setUpdateDueDate(true);
											setExtendDays("");
											setDueDate("");
										}
									}} 
								/>
								<Label htmlFor="clearDueDate" className="text-xs cursor-pointer text-muted-foreground">No Date</Label>
							</div>
						</div>

						<div className={`pl-6 space-y-4 transition-all ${updateDueDate ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
							{!clearDueDate && (
								<>
									{/* Specific Date/Time Inputs */}
									<div className="grid grid-cols-2 gap-4">
										<div className="grid gap-2">
											<Label className="text-xs">Specific Date</Label>
											<div className="relative">
												<Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
												<Input
													type="date"
													className="pl-9"
													value={dueDate}
													onChange={(e) => {
														setDueDate(e.target.value);
														setExtendDays("");
													}}
												/>
											</div>
										</div>
										<div className="grid gap-2">
											<Label className="text-xs">Time</Label>
											<div className="relative">
												<Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
												<Input
													type="time"
													className="pl-9"
													value={dueTime}
													onChange={(e) => setDueTime(e.target.value)}
												/>
											</div>
										</div>
									</div>

									{/* Extension Buttons */}
									<div className="space-y-3 pt-2">
										<Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Or Extend Deadline By</Label>
										<div className="flex flex-wrap gap-2">
											<Button 
												variant="secondary" 
												size="sm" 
												className="h-8 text-[10px] font-bold"
												onClick={() => {
													setExtendDays("1");
													setDueDate("");
												}}
											>+1 DAY</Button>
											<Button 
												variant="secondary" 
												size="sm" 
												className="h-8 text-[10px] font-bold"
												onClick={() => {
													setExtendDays("7");
													setDueDate("");
												}}
											>+1 WEEK</Button>
											<div className="relative">
												<Input
													type="number"
													placeholder="Days"
													className="h-8 w-24 text-xs pr-12"
													value={extendDays}
													onChange={(e) => {
														setExtendDays(e.target.value);
														setDueDate("");
													}}
												/>
												<span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold uppercase">Days</span>
											</div>
										</div>
									</div>
								</>
							)}

							{clearDueDate && (
								<div className="p-3 bg-orange-50 border border-orange-100 rounded-md flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
									<AlertCircle className="h-4 w-4 text-orange-600" />
									<p className="text-[10px] text-orange-700 font-medium">This will clear existing due dates for all selected tasks.</p>
								</div>
							)}
						</div>
					</div>

					{updateAssignee || updateDueDate ? (
						<div className="bg-blue-50 border border-blue-100 p-3 rounded-md flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
							<AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
							<p className="text-xs text-blue-700">
								This will apply the selected changes to all {selectedCount} tasks. This action can be tracked in task history.
							</p>
						</div>
					) : null}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
					<Button 
						onClick={handleSave} 
						disabled={isSubmitting || (!updateAssignee && !updateDueDate)}
					>
						{isSubmitting ? "Updating..." : `Apply to ${selectedCount} Tasks`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
