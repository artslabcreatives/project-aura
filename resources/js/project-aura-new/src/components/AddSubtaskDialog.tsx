import { useState, useEffect, useRef } from "react";
import { User, UserStatus, TaskPriority, TaskAttachment } from "@/types/task";
import { Department } from "@/types/department";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect, SearchableOption } from "@/components/ui/searchable-select";
import { Loader2, X, Plus, Upload, Link as LinkIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { tagService, Tag } from "@/services/tagService";
import { useToast } from "@/hooks/use-toast";

interface PendingFile {
    id: string;
    file: File;
    name: string;
}

interface AddSubtaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (subtask: {
        title: string;
        description: string;
        assignee: string; // name
        assigneeId?: string;
        dueDate: string;
        userStatus: UserStatus;
        priority: TaskPriority;
        startDate?: string;
        tags?: string[];
        pendingFiles?: File[];
        pendingLinks?: { name: string; url: string }[];
    }) => Promise<void>;
    teamMembers: User[];
    departments?: Department[];
    parentTaskTitle: string;
    currentUser?: User;
}

export function AddSubtaskDialog({
    open,
    onOpenChange,
    onSave,
    teamMembers,
    departments,
    parentTaskTitle,
    currentUser,
}: AddSubtaskDialogProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        assignee: "",
        assigneeId: "",
        dueDate: "",
        dueTime: "",
        userStatus: "pending" as UserStatus,
        priority: "medium" as TaskPriority,
        startDate: "",
        startTime: "",
    });
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [noStartDate, setNoStartDate] = useState(false);
    const [noEndDate, setNoEndDate] = useState(false);

    // Attachments (Pending only, since it's a new subtask)
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [pendingLinks, setPendingLinks] = useState<{ name: string; url: string }[]>([]);
    const [newLinkName, setNewLinkName] = useState("");
    const [newLinkUrl, setNewLinkUrl] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [tagDepartmentId, setTagDepartmentId] = useState<string>("");

    useEffect(() => {
        if (open) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Default Assignee logic (Current user or empty)
            const defaultAssignee = currentUser ? currentUser.name : "";
            const defaultAssigneeId = currentUser ? currentUser.id : "";

            // Determine department for tags
            if (currentUser) {
                setTagDepartmentId(currentUser.department);
            } else if (departments && departments.length > 0) {
                setTagDepartmentId(departments[0].id);
            }

            setFormData({
                title: "",
                description: "",
                assignee: defaultAssignee,
                assigneeId: defaultAssigneeId,
                dueDate: tomorrow.toISOString().split('T')[0],
                dueTime: "17:00",
                userStatus: "pending",
                priority: "medium",
                startDate: today.toISOString().split('T')[0],
                startTime: "09:00",
            });
            setTags([]);
            setPendingFiles([]);
            setPendingLinks([]);
            setNewTag("");
            setNewLinkName("");
            setNewLinkUrl("");
            setNoStartDate(false);
            setNoEndDate(false);
        }
    }, [open, currentUser, departments]);

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
        if (open) {
            loadTags();
        }
    }, [tagDepartmentId, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const dueDateTime = noEndDate
                ? null
                : (formData.dueDate
                    ? `${formData.dueDate}T${formData.dueTime || "00:00"}:00`
                    : new Date().toISOString());

            const startDateTime = noStartDate
                ? null
                : (formData.startDate
                    ? `${formData.startDate}T${formData.startTime || "00:00"}:00`
                    : undefined);

            const filesToUpload = pendingFiles.map(pf => pf.file);

            await onSave({
                title: formData.title,
                description: formData.description,
                assignee: formData.assignee,
                assigneeId: formData.assigneeId,
                dueDate: dueDateTime || "",
                userStatus: formData.userStatus,
                priority: formData.priority,
                startDate: startDateTime || undefined,
                tags: tags,
                pendingFiles: filesToUpload,
                pendingLinks: pendingLinks,
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create subtask", error);
            toast({
                title: "Error",
                description: "Failed to create subtask.",
                variant: "destructive",
            });
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
            value: member.id, // Use ID as value for more precision, but wait, TaskDialog uses ID?
            // TaskDialog uses SearchableSelect which expects values.
            // Let's check TaskDialog (Step 546):
            // value={formData.assigneeIds[0]} - so it uses ID.
            // options={memberOptions} where value is member.id.
            // So yes, we should use member.id as value.
            label: member.name,
            group: departmentName,
        };
    });

    // Tag handlers
    const addTag = (tag: string) => {
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleCreateTag = async () => {
        if (!newTag || !tagDepartmentId) return;
        try {
            const createdTag = await tagService.create(newTag, tagDepartmentId);
            setAvailableTags(prev => [...prev, createdTag]);
            addTag(createdTag.name);
            toast({ title: "Tag created", description: "New tag added." });
        } catch (error) {
            console.error("Failed to create tag:", error);
            toast({ title: "Error", description: "Failed to create tag.", variant: "destructive" });
        }
    };

    // Attachment handlers
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const newPendingFiles: PendingFile[] = Array.from(files).map(file => ({
            id: `pending-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
        }));
        setPendingFiles(prev => [...prev, ...newPendingFiles]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removePendingFile = (id: string) => {
        setPendingFiles(pendingFiles.filter(pf => pf.id !== id));
    };

    const addLink = () => {
        if (newLinkName && newLinkUrl) {
            setPendingLinks([...pendingLinks, { name: newLinkName, url: newLinkUrl }]);
            setNewLinkName("");
            setNewLinkUrl("");
        }
    };

    const removePendingLink = (index: number) => {
        setPendingLinks(pendingLinks.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]" onPointerDownOutside={(e) => e.preventDefault()}>
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

                        {/* Assignee & Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="assignee">Assign To *</Label>
                                <SearchableSelect
                                    value={formData.assigneeId}
                                    onValueChange={(value) => {
                                        const user = teamMembers.find(u => u.id === value);
                                        setFormData({ ...formData, assigneeId: value, assignee: user ? user.name : "" });
                                    }}
                                    options={memberOptions}
                                    placeholder="Select member"
                                />
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

                        {/* Start Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="noStartDate"
                                            checked={noStartDate}
                                            onCheckedChange={(checked) => setNoStartDate(checked as boolean)}
                                        />
                                        <Label htmlFor="noStartDate" className="text-xs font-normal text-muted-foreground">No date</Label>
                                    </div>
                                </div>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    disabled={noStartDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="startTime">Start Time</Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={formData.startTime}
                                    disabled={noStartDate}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* End Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="dueDate">End Date {noEndDate ? '' : '*'}</Label>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="noEndDate"
                                            checked={noEndDate}
                                            onCheckedChange={(checked) => setNoEndDate(checked as boolean)}
                                        />
                                        <Label htmlFor="noEndDate" className="text-xs font-normal text-muted-foreground">No date</Label>
                                    </div>
                                </div>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    disabled={noEndDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label>Tags</Label>
                                {currentUser?.role === 'admin' && (
                                    <Select value={tagDepartmentId} onValueChange={setTagDepartmentId}>
                                        <SelectTrigger className="w-[180px] h-8 text-xs">
                                            <SelectValue placeholder="Filter by Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments?.map((dept) => (
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
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <SearchableSelect
                                    value=""
                                    onValueChange={(val) => addTag(val)}
                                    options={availableTags.map(t => ({ value: t.name, label: t.name, group: "Available Tags" }))}
                                    placeholder="Search tags..."
                                />
                                <div className="flex gap-1 w-1/2">
                                    <Input
                                        placeholder="New tag..."
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                    />
                                    <Button type="button" size="sm" onClick={handleCreateTag} disabled={!newTag}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className="grid gap-2">
                            <Label>Attachments</Label>
                            <div className="border border-dashed rounded-lg p-4 space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="mr-2 h-4 w-4" /> Upload Files
                                        </Button>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Link Name"
                                                value={newLinkName}
                                                onChange={(e) => setNewLinkName(e.target.value)}
                                            />
                                            <Input
                                                placeholder="URL"
                                                value={newLinkUrl}
                                                onChange={(e) => setNewLinkUrl(e.target.value)}
                                            />
                                            <Button type="button" onClick={addLink} disabled={!newLinkName || !newLinkUrl}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Pending Files List */}
                                {pendingFiles.length > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Files to upload:</p>
                                        {pendingFiles.map(pf => (
                                            <div key={pf.id} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                                                <span>{pf.name}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePendingFile(pf.id)}>
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pending Links List */}
                                {pendingLinks.length > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground">Links to add:</p>
                                        {pendingLinks.map((link, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                                                <div className="flex items-center gap-2">
                                                    <LinkIcon className="h-3 w-3" />
                                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                        {link.name}
                                                    </a>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePendingLink(index)}>
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
