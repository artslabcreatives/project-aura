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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Pencil, Trash2, Folder, Plus } from "lucide-react";

interface AssignGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: Project | null;
    availableGroups: ProjectGroup[];
    onAssign: (project: Project, groupId: string | null, newGroupName?: string, newGroupParentId?: string | null) => Promise<void>;
    onUpdateGroup?: (groupId: string, name: string) => Promise<void>;
    onDeleteGroup?: (groupId: string) => Promise<void>;
}

export function AssignGroupDialog({
    open,
    onOpenChange,
    project,
    availableGroups,
    onAssign,
    onUpdateGroup,
    onDeleteGroup,
}: AssignGroupDialogProps) {
    const [selectedGroupId, setSelectedGroupId] = useState<string>("none");
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupParentId, setNewGroupParentId] = useState<string>("none");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comboboxOpen, setComboboxOpen] = useState(false);

    // Edit/Delete states
    const [groupToEdit, setGroupToEdit] = useState<ProjectGroup | null>(null);
    const [editGroupName, setEditGroupName] = useState("");
    const [groupToDelete, setGroupToDelete] = useState<ProjectGroup | null>(null);

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

    const handleEditSave = async () => {
        if (!groupToEdit || !onUpdateGroup) return;
        try {
            await onUpdateGroup(groupToEdit.id, editGroupName);
            setGroupToEdit(null);
            setEditGroupName("");
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!groupToDelete || !onDeleteGroup) return;
        try {
            await onDeleteGroup(groupToDelete.id);
            if (selectedGroupId === groupToDelete.id) {
                setSelectedGroupId("none");
            }
            setGroupToDelete(null);
        } catch (error) {
            console.error(error);
        }
    };

    if (!project) return null;

    return (
        <>
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
                            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={comboboxOpen}
                                        className="w-full justify-between font-normal"
                                    >
                                        {selectedGroupId === "none"
                                            ? "No Group (Uncategorized)"
                                            : selectedGroupId === "new"
                                                ? `+ Create New Group${newGroupName ? `: ${newGroupName}` : ""}`
                                                : availableGroups.find((g) => g.id === selectedGroupId)?.name || "Select group..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search group..." />
                                        <CommandList>
                                            <CommandEmpty>No group found.</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    value="none"
                                                    onSelect={() => {
                                                        setSelectedGroupId("none");
                                                        setComboboxOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedGroupId === "none" ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    No Group (Uncategorized)
                                                </CommandItem>
                                                {availableGroups.map((group) => (
                                                    <CommandItem
                                                        key={group.id}
                                                        value={group.name}
                                                        onSelect={() => {
                                                            setSelectedGroupId(group.id);
                                                            setComboboxOpen(false);
                                                        }}
                                                        className="group flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center">
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedGroupId === group.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                                                            {group.name}
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {onUpdateGroup && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setGroupToEdit(group);
                                                                        setEditGroupName(group.name);
                                                                    }}
                                                                >
                                                                    <Pencil className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                            {onDeleteGroup && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setGroupToDelete(group);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                                <CommandItem
                                                    value="new"
                                                    onSelect={() => {
                                                        setSelectedGroupId("new");
                                                        setComboboxOpen(false);
                                                    }}
                                                    className="font-medium text-primary"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Create New Group
                                                </CommandItem>
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
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
                                            {availableGroups.map(g => (
                                                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                            ))}
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

            {/* Edit Group Dialog */}
            <Dialog open={!!groupToEdit} onOpenChange={(open) => !open && setGroupToEdit(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Group: {groupToEdit?.name}</DialogTitle>
                        <DialogDescription>
                            Rename the group.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="edit-group-name">Group Name</Label>
                        <Input
                            id="edit-group-name"
                            value={editGroupName}
                            onChange={(e) => setEditGroupName(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGroupToEdit(null)}>Cancel</Button>
                        <Button onClick={handleEditSave} disabled={!editGroupName.trim()}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Group Alert */}
            <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Group?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the group "{groupToDelete?.name}"? <br />
                            If this group has projects assigned, you must unassign them first.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
