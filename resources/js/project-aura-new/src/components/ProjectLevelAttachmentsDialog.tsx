import React, { useState, useRef } from 'react';
import { Project, ProjectAttachment } from '@/types/project';
import { projectAttachmentService } from '@/services/projectAttachmentService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { 
    Link as LinkIcon, Upload, Plus, Trash2, FileText, Loader2, Search, ExternalLink, X, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilePreviewDialog } from './FilePreviewDialog';

interface ProjectLevelAttachmentsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: Project;
    onProjectUpdate: (updatedProject: Project) => void;
}

export function ProjectLevelAttachmentsDialog({ 
    open, 
    onOpenChange, 
    project, 
    onProjectUpdate 
}: ProjectLevelAttachmentsDialogProps) {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [newLinkName, setNewLinkName] = useState("");
    const [newLinkUrl, setNewLinkUrl] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewFile, setPreviewFile] = useState<ProjectAttachment | null>(null);


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            await projectAttachmentService.uploadFiles(String(project.id), Array.from(files));
            
            toast({
                title: "Upload Started",
                description: `${files.length} file(s) are being uploaded.`,
            });
            
            // The actual refresh is handled by the PROJECT_ATTACHMENTS_EVENT listener in ProjectKanbanFixed
        } catch (error) {
            console.error("Upload failed:", error);
            toast({
                title: "Upload Failed",
                description: "Failed to upload files.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleAddLink = async () => {
        if (!newLinkName || !newLinkUrl) return;

        setIsUploading(true);
        try {
            await projectAttachmentService.addLink(String(project.id), newLinkName, newLinkUrl);
            setNewLinkName("");
            setNewLinkUrl("");
            toast({
                title: "Link Added",
                description: "External link has been added to the project.",
            });
            onProjectUpdate(project);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add link.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveAttachment = async (id: string) => {
        try {
            await projectAttachmentService.delete(id);
            toast({
                title: "Attachment Removed",
                description: "Attachment has been deleted.",
            });
            onProjectUpdate(project);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove attachment.",
                variant: "destructive",
            });
        }
    };

    const filteredAttachments = (project.attachments || []).filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="flex items-center gap-2">
                                <LinkIcon className="h-5 w-5 text-primary" />
                                Project Files & Links
                            </DialogTitle>
                            <DialogDescription>
                                Centralized resources for <strong>{project.name}</strong>
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-2 font-semibold"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                Upload File
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto p-6 space-y-6">
                    {/* Add Link Section */}
                    <div className="flex gap-2 items-end bg-muted/20 p-4 rounded-xl border border-dashed border-muted-foreground/30">
                        <div className="grid gap-1.5 flex-1">
                            <Label htmlFor="dlgLinkName" className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Link Name</Label>
                            <Input
                                id="dlgLinkName"
                                placeholder="e.g. Figma Design"
                                value={newLinkName}
                                onChange={(e) => setNewLinkName(e.target.value)}
                                className="h-9 bg-background focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div className="grid gap-1.5 flex-[2]">
                            <Label htmlFor="dlgLinkUrl" className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">URL</Label>
                            <Input
                                id="dlgLinkUrl"
                                placeholder="https://..."
                                value={newLinkUrl}
                                onChange={(e) => setNewLinkUrl(e.target.value)}
                                className="h-9 bg-background focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <Button
                            size="sm"
                            className="h-9 font-bold px-4"
                            onClick={handleAddLink}
                            disabled={!newLinkName || !newLinkUrl || isUploading}
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add Link
                        </Button>
                    </div>

                    {/* Search & List Section */}
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search attachments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-10 bg-muted/30 border-muted-foreground/20"
                            />
                        </div>

                        <div className="space-y-2">
                            {filteredAttachments.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {filteredAttachments.map((attachment) => (
                                        <div
                                            key={attachment.id}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 group hover:border-primary/50 hover:bg-background transition-all duration-200 hover:shadow-md"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={cn(
                                                    "p-2 rounded-lg",
                                                    attachment.type === 'link' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                )}>
                                                    {attachment.type === 'link' ? <LinkIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-bold truncate" title={attachment.name}>
                                                        {attachment.name}
                                                    </p>
                                                    <a
                                                        href={attachment.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] text-muted-foreground hover:text-primary truncate block font-mono opacity-70 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        {attachment.url}
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => setPreviewFile(attachment)}
                                                    title="Quick Preview"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => window.open(attachment.url, '_blank')}
                                                    title="Open in New Tab"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleRemoveAttachment(attachment.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/10 flex flex-col items-center justify-center">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                        <LinkIcon className="h-6 w-6 text-muted-foreground/40" />
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground">No attachments found.</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px] mx-auto text-center">
                                        Try a different search or add a new resource above.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t bg-muted/30 flex justify-end">
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
                </div>
            </DialogContent>

            <FilePreviewDialog 
                open={!!previewFile}
                onOpenChange={(open) => !open && setPreviewFile(null)}
                file={previewFile ? {
                    id: previewFile.id,
                    name: previewFile.name,
                    url: previewFile.url,
                    type: previewFile.type
                } : null}
            />
        </Dialog>
    );
}
