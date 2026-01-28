import { useState, useEffect } from "react";
import { User, UserStatus } from "@/types/task";
import { Department } from "@/types/department";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect, SearchableOption } from "@/components/ui/searchable-select";
import { Loader2 } from "lucide-react";

interface AddSubtaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (subtask: { title: string; description: string; assignee: string; dueDate: string; userStatus: UserStatus }) => Promise<void>;
    teamMembers: User[];
    departments?: Department[];
    parentTaskTitle: string;
}

export function AddSubtaskDialog({
    open,
    onOpenChange,
    onSave,
    teamMembers,
    departments,
    parentTaskTitle,
}: AddSubtaskDialogProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        assignee: "",
        dueDate: "",
        userStatus: "pending" as UserStatus,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            setFormData({
                title: "",
                description: "",
                assignee: "",
                dueDate: tomorrow.toISOString().split('T')[0],
                userStatus: "pending",
            });
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(formData);
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create subtask", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDepartmentName = (departmentId: string) => {
        return departments?.find(dep => dep.id === departmentId)?.name || "Other";
    };

    const memberOptions: SearchableOption[] = teamMembers.map((member) => {
        const departmentName = member.department ? getDepartmentName(member.department) : "Other";
        return {
            value: member.name,
            label: member.name,
            group: departmentName,
        };
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Subtask</DialogTitle>
                        <DialogDescription>
                            Adding a subtask to: <span className="font-medium">{parentTaskTitle}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter subtask title"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter description"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="assignee">Assign To *</Label>
                                <SearchableSelect
                                    value={formData.assignee}
                                    onValueChange={(value) => setFormData({ ...formData, assignee: value })}
                                    options={memberOptions}
                                    placeholder="Select member"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dueDate">Due Date *</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Add Subtask"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
