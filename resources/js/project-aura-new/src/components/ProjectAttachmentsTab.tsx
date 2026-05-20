import React, { useState, useMemo } from 'react';
import { Project } from '@/types/project';
import { Task, TaskAttachment } from '@/types/task';
import { attachmentService } from '@/services/attachmentService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
    FileText, Download, Eye, Play, Search, 
    ExternalLink, Image as ImageIcon, Video, File, X
} from 'lucide-react';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectAttachmentsTabProps {
    project: Project;
    tasks: Task[];
}

interface FlattenedAttachment extends TaskAttachment {
    taskTitle: string;
    taskId: string;
}

export function ProjectAttachmentsTab({ project, tasks }: ProjectAttachmentsTabProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [viewingAttachment, setViewingAttachment] = useState<FlattenedAttachment | null>(null);
    const [isResolvingUrl, setIsResolvingUrl] = useState(false);
    const { toast } = useToast();

    const allAttachments = useMemo(() => {
        const flattened: FlattenedAttachment[] = [];
        
        const processTasks = (taskList: Task[]) => {
            taskList.forEach(task => {
                if (task.attachments) {
                    task.attachments.forEach(attachment => {
                        flattened.push({
                            ...attachment,
                            taskTitle: task.title,
                            taskId: task.id
                        });
                    });
                }
                if (task.subtasks && task.subtasks.length > 0) {
                    processTasks(task.subtasks);
                }
            });
        };

        processTasks(tasks);
        
        // Sort by date (newest first)
        return flattened.sort((a, b) => 
            new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
        );
    }, [tasks]);

    const filteredAttachments = allAttachments.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.taskTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isImage = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
    };

    const isVideo = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        return ['mp4', 'webm', 'ogg', 'mov'].includes(ext || '');
    };

    const handleView = async (attachment: FlattenedAttachment) => {
        if (attachment.type === 'link') {
            window.open(attachment.url, '_blank');
            return;
        }

        setIsResolvingUrl(true);
        try {
            const { url } = await attachmentService.download(attachment.id, 'view');
            setViewingAttachment({ ...attachment, url });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to open viewer. Please try downloading instead.",
                variant: "destructive"
            });
        } finally {
            setIsResolvingUrl(false);
        }
    };

    const handleDownload = async (attachmentId: string, name: string) => {
        try {
            const { url } = await attachmentService.download(attachmentId, 'download');
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to download file.",
                variant: "destructive"
            });
        }
    };

    const getIcon = (attachment: FlattenedAttachment) => {
        if (attachment.type === 'link') return <ExternalLink className="h-5 w-5 text-blue-500" />;
        if (isImage(attachment.name)) return <ImageIcon className="h-5 w-5 text-purple-500" />;
        if (isVideo(attachment.name)) return <Video className="h-5 w-5 text-rose-500" />;
        return <File className="h-5 w-5 text-gray-500" />;
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search attachments by name or task..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-muted/30 border-muted-foreground/20"
                />
            </div>

            <div className="grid gap-3">
                {filteredAttachments.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl">
                        <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">No attachments found.</p>
                    </div>
                ) : (
                    filteredAttachments.map((attachment) => (
                        <Card key={`${attachment.id}-${attachment.taskId}`} className="group hover:border-primary/30 transition-all duration-200">
                            <CardContent className="p-3 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                    {getIcon(attachment)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                        {attachment.name}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                        <span className="truncate max-w-[150px]">Task: {attachment.taskTitle}</span>
                                        <span>•</span>
                                        <span>{attachment.uploadedAt ? format(new Date(attachment.uploadedAt), 'MMM d, yyyy') : 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleView(attachment)}
                                        disabled={isResolvingUrl}
                                    >
                                        {attachment.type === 'link' ? (
                                            <ExternalLink className="h-4 w-4" />
                                        ) : isVideo(attachment.name) ? (
                                            <Play className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                    {attachment.type === 'file' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleDownload(attachment.id, attachment.name)}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Attachment Viewer Modal */}
            <Dialog open={!!viewingAttachment} onOpenChange={(open) => !open && setViewingAttachment(null)}>
                <DialogContent hideCloseButton={true} className="sm:max-w-[800px] p-0 overflow-hidden bg-black/90 border-none">
                    <div className="relative group">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
                            onClick={() => setViewingAttachment(null)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        
                        <div className="flex flex-col items-center justify-center min-h-[400px]">
                            {viewingAttachment && isImage(viewingAttachment.name) && (
                                <img
                                    src={viewingAttachment.url}
                                    alt={viewingAttachment.name}
                                    className="max-w-full max-h-[80vh] object-contain"
                                />
                            )}
                            {viewingAttachment && isVideo(viewingAttachment.name) && (
                                <video
                                    src={viewingAttachment.url}
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-[80vh]"
                                />
                            )}
                        </div>
                        
                        <div className="p-4 bg-black/50 backdrop-blur-sm text-white flex justify-between items-center">
                            <p className="text-sm font-medium truncate pr-4">{viewingAttachment?.name}</p>
                            <Button variant="outline" size="sm" className="bg-transparent border-white/20 text-white hover:bg-white/10" onClick={() => handleDownload(viewingAttachment?.id!, viewingAttachment?.name!)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
