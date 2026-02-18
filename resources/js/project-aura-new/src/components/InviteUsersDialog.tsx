import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Search, UserPlus, Loader2 } from "lucide-react";
import { Project } from "@/types/project";
import { User } from "@/types/task";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface InviteUsersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: Project | null;
    allUsers: User[];
    onUpdate: (updatedProject: Project) => void;
}

export function InviteUsersDialog({
    open,
    onOpenChange,
    project,
    allUsers,
    onUpdate,
}: InviteUsersDialogProps) {
    const { toast } = useToast();
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentCollaborators, setCurrentCollaborators] = useState<{ id: number; name: string; email: string }[]>([]);

    // Reset state when dialog opens
    useEffect(() => {
        if (open && project) {
            setSelectedUserIds([]);
            setSearchQuery("");
            setCurrentCollaborators(project.collaborators || []);
        }
    }, [open, project]);

    if (!project) return null;

    const existingCollaboratorIds = new Set(currentCollaborators.map(c => String(c.id)));

    // Filter users: exclude already collaborating users and project's own department users
    const availableUsers = allUsers.filter(user => {
        if (user.is_active === false) return false;
        if (existingCollaboratorIds.has(String(user.id))) return false;
        // Optionally filter out users from the same department
        // If project belongs to department X, we may want to only show users NOT from department X
        // For now, we show all users (cross-department is the main use case)
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const handleToggleUser = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleInvite = async () => {
        if (selectedUserIds.length === 0) return;

        setIsLoading(true);
        try {
            const response = await api.post<{ collaborators: { id: number; name: string; email: string }[] }>(`/projects/${project.id}/collaborators`, {
                user_ids: selectedUserIds.map(id => parseInt(id, 10)),
            });

            setCurrentCollaborators(response.collaborators);
            onUpdate({
                ...project,
                collaborators: response.collaborators,
            });

            toast({
                title: "Users invited",
                description: `${selectedUserIds.length} user(s) added to the project.`,
            });

            setSelectedUserIds([]);
        } catch (error) {
            console.error("Failed to invite users:", error);
            toast({
                title: "Error",
                description: "Failed to invite users. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveCollaborator = async (userId: number) => {
        setIsLoading(true);
        try {
            const response = await api.delete<{ collaborators: { id: number; name: string; email: string }[] }>(`/projects/${project.id}/collaborators/${userId}`);

            setCurrentCollaborators(response.collaborators);
            onUpdate({
                ...project,
                collaborators: response.collaborators,
            });

            toast({
                title: "Collaborator removed",
            });
        } catch (error) {
            console.error("Failed to remove collaborator:", error);
            toast({
                title: "Error",
                description: "Failed to remove collaborator.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) return "";
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Invite Users
                    </DialogTitle>
                    <DialogDescription>
                        Add collaborators to <strong>{project.name}</strong>. They will see this project in their sidebar.
                    </DialogDescription>
                </DialogHeader>

                {/* Current Collaborators */}
                {currentCollaborators.length > 0 && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Current Collaborators</Label>
                        <div className="flex flex-wrap gap-2">
                            {currentCollaborators.map(collaborator => (
                                <Badge
                                    key={collaborator.id}
                                    variant="secondary"
                                    className="flex items-center gap-1 py-1 px-2"
                                >
                                    <span>{collaborator.name}</span>
                                    <button
                                        onClick={() => handleRemoveCollaborator(collaborator.id)}
                                        className="ml-1 hover:text-destructive focus:outline-none"
                                        disabled={isLoading}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* User List */}
                <ScrollArea className="h-64 border rounded-md">
                    <div className="p-2 space-y-1">
                        {availableUsers.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8 text-sm">
                                {searchQuery ? "No users found" : "All users are already collaborators"}
                            </p>
                        ) : (
                            availableUsers.map(user => (
                                <label
                                    key={user.id}
                                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                                >
                                    <Checkbox
                                        checked={selectedUserIds.includes(user.id)}
                                        onCheckedChange={() => handleToggleUser(user.id)}
                                    />
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-xs">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleInvite}
                        disabled={selectedUserIds.length === 0 || isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Invite {selectedUserIds.length > 0 && `(${selectedUserIds.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
