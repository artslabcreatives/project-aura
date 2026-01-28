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
    onAssign: (project: Project, groupId: string | null, newGroupName?: string, newGroupParentId?: string | null) => Promise<void>;
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
    const [newGroupParentId, setNewGroupParentId] = useState<string>("none");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open && project) {
            // Set initial state based on project's current group
            setSelectedGroupId(project.group?.id || "none");
            setNewGroupName("");
            setNewGroupParentId("none");
        }
    }, [open, project]);

    const handleSave = async () => {
        if (!project) return;
        setIsSubmitting(true);
        try {
            await onAssign(
                project,
                selectedGroupId === "none" || selectedGroupId === "new" ? null : selectedGroupId,
                selectedGroupId === "new" ? newGroupName : undefined,
                selectedGroupId === "new" && newGroupParentId !== "none" ? newGroupParentId : undefined
            );
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!project) return null;

    // Helper to visualize hierarchy in dropdown
    const renderGroupOptions = (groups: ProjectGroup[], parentId: string | null = null, level = 0) => {
        const filteredGroups = groups.filter(g => g.parentId === (parentId || null) || (!parentId && !g.parentId));

        // Return flat list of options with indentation
        // Since Select doesn't support recursive rendering easily, we assume flat 'availableGroups' and build a derived list or just show flat with names
        // But for a proper tree select in a standard Select, we can manually sort and indent.
        // Let's rely on a helper to flatten the tree for display if possible, or just simple mapping if order isn't guaranteed.
        // For now, simpler approach: Just list all groups. Indentation can be added if we sort them efficiently.
        // Let's do a simple sort by creation or name for now.
        return groups.map(group => (
            <SelectItem key={group.id} value={group.id}>
                {group.name}
            </SelectItem>
        ));
    };

    // Better approach: Pre-calculate the hierarchy for display
    const hierarchicalGroups = (() => {
        const buildOptions = (parentId: string | null = null, depth = 0): JSX.Element[] => {
            const children = availableGroups.filter(g => g.parentId == parentId); // Abstract equality for null/undefined
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
        // Root items (parentId is null or undefined or empty string, checking looser generic)
        const roots = availableGroups.filter(g => !g.parentId);
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
    })();


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
                                {hierarchicalGroups}
                                <SelectItem value="new" className="text-primary font-medium">
                                    + Create New Group
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedGroupId === "new" && (
                        <>
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
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label htmlFor="parent-group">Parent Group (Optional)</Label>
                                <Select
                                    value={newGroupParentId}
                                    onValueChange={(value) => setNewGroupParentId(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a parent group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Parent (Root Group)</SelectItem>
                                        {hierarchicalGroups}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
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
