import React from 'react';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, ExternalLink, FileText, ImageIcon, Video, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: {
        id: string;
        name: string;
        url: string;
        type: 'file' | 'link';
    } | null;
}

export function FilePreviewDialog({ open, onOpenChange, file }: FilePreviewDialogProps) {
    if (!file) return null;

    const isImage = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
    };

    const isVideo = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        return ['mp4', 'webm', 'ogg', 'mov'].includes(ext || '');
    };

    const isPdf = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        return ext === 'pdf';
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderPreview = () => {
        if (file.type === 'link') {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <ExternalLink className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">External Link</h3>
                        <p className="text-sm text-muted-foreground max-w-[300px] mx-auto mt-1">
                            {file.url}
                        </p>
                    </div>
                    <Button onClick={() => window.open(file.url, '_blank')}>
                        Open in New Tab
                    </Button>
                </div>
            );
        }

        if (isImage(file.name)) {
            return (
                <div className="flex items-center justify-center bg-muted/10 rounded-lg overflow-hidden">
                    <img
                        src={file.url}
                        alt={file.name}
                        className="max-w-full max-h-[70vh] object-contain shadow-xl"
                    />
                </div>
            );
        }

        if (isVideo(file.name)) {
            return (
                <div className="flex items-center justify-center bg-black rounded-lg overflow-hidden shadow-2xl">
                    <video
                        src={file.url}
                        controls
                        autoPlay
                        className="max-w-full max-h-[70vh]"
                    />
                </div>
            );
        }

        if (isPdf(file.name)) {
            return (
                <div className="w-full h-[70vh] rounded-lg overflow-hidden border shadow-inner bg-muted/20">
                    <iframe
                        src={`${file.url}#toolbar=0`}
                        className="w-full h-full border-none"
                        title={file.name}
                    />
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/10 rounded-lg">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                    <h3 className="text-lg font-bold">Preview not available</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        This file type doesn't support in-browser previewing.
                    </p>
                </div>
                <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download to View
                </Button>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] w-[95vw] p-0 overflow-hidden border-none shadow-2xl bg-background/95 backdrop-blur-md">
                <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            file.type === 'link' ? "bg-blue-100 text-blue-600" : 
                            isImage(file.name) ? "bg-purple-100 text-purple-600" :
                            isVideo(file.name) ? "bg-rose-100 text-rose-600" :
                            isPdf(file.name) ? "bg-amber-100 text-amber-600" :
                            "bg-gray-100 text-gray-600"
                        )}>
                            {file.type === 'link' ? <ExternalLink className="h-4 w-4" /> : 
                             isImage(file.name) ? <ImageIcon className="h-4 w-4" /> :
                             isVideo(file.name) ? <Video className="h-4 w-4" /> :
                             <FileText className="h-4 w-4" />}
                        </div>
                        <div className="truncate">
                            <DialogTitle className="text-base font-bold truncate leading-none mb-1">{file.name}</DialogTitle>
                            <DialogDescription className="text-[10px] uppercase font-black tracking-widest opacity-60">
                                {file.type === 'link' ? 'External Link' : 'Project Attachment'}
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pr-8">
                        {file.type === 'file' && (
                            <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 gap-2 font-bold bg-background/50">
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                        )}
                        <Button variant="secondary" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8 rounded-full">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {renderPreview()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
