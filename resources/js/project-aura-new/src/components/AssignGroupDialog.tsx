import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Project } from "@/types/project";
import { ProjectGroup } from "@/types/project-group";

interface AssignGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: Project | null;
    availableGroups: ProjectGroup[];
    onAssign: (project: Project, groupId: string | null, newGroupName?: string) => Promise<void>;
}

export function AssignGroupDialog({
    open,
    onOpenChange,
    project,
    availableGroups,
    onAssign,
}: AssignGroupDialogProps) {
    const [selectedGroupId, setSelectedGroupId] = useState<string>("none");
    const [newGroupName, setNewGroupName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && project) {
            // Set initial state based on project's current group
            setSelectedGroupId(project.group?.id || "none");
            setNewGroupName("");
        }
    }, [open, project]);

    const handleSave = async () => {
        if (!project) return;
        setIsSubmitting(true);
        try {
            await onAssign(
                project,
                selectedGroupId === "none" || selectedGroupId === "new" ? null : selectedGroupId,
                selectedGroupId === "new" ? newGroupName : undefined
            );
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!project) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Organize {project.name}</DialogTitle>
                    <DialogDescription>
                        Assign this project to a group within the <strong>{project.department?.name || 'Unknown'}</strong> department.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="group">Project Group</Label>
                        <Select
                            value={selectedGroupId}
                            onValueChange={(value) => setSelectedGroupId(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Group (Uncategorized)</SelectItem>
                                {availableGroups.map((group) => (
                                    <SelectItem key={group.id} value={group.id}>
                                        {group.name}
                                    </SelectItem>
                                ))}
                                <SelectItem value="new" className="text-primary font-medium">
                                    + Create New Group
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedGroupId === "new" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="new-group-name">New Group Name</Label>
                            <Input
                                id="new-group-name"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                placeholder="e.g. Marketing Campaign Q1"
                                autoFocus
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting || (selectedGroupId === "new" && !newGroupName.trim())}
                    >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
