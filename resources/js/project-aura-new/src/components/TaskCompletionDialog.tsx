import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, X, Upload, Link as LinkIcon, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskCompletionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (data: { comment?: string; links: string[]; files: File[] }) => void;
    taskTitle?: string;
}

export function TaskCompletionDialog({
    open,
    onOpenChange,
    onConfirm,
    taskTitle,
}: TaskCompletionDialogProps) {
    const [comment, setComment] = useState("");
    const [links, setLinks] = useState<string[]>([]);
    const [currentLink, setCurrentLink] = useState("");
    const [files, setFiles] = useState<File[]>([]);

    const handleAddLink = () => {
        if (currentLink && !links.includes(currentLink)) {
            setLinks([...links, currentLink]);
            setCurrentLink("");
        }
    };

    const handleRemoveLink = (linkToRemove: string) => {
        setLinks(links.filter((link) => link !== linkToRemove));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles([...files, ...Array.from(e.target.files)]);
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = () => {
        onConfirm({
            comment: comment.trim() || undefined,
            links,
            files,
        });
        // Reset state
        setComment("");
        setLinks([]);
        setFiles([]);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Complete Task</DialogTitle>
                    <DialogDescription>
                        {taskTitle ? `"${taskTitle}"` : "This task"} is being moved to complete. Would you like to add any closing comments or resources?
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="comment">Closing Comment</Label>
                        <Textarea
                            id="comment"
                            placeholder="Add a summary or closing note..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Resources (Links)</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="https://..."
                                    value={currentLink}
                                    onChange={(e) => setCurrentLink(e.target.value)}
                                    className="pl-9"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddLink();
                                        }
                                    }}
                                />
                            </div>
                            <Button type="button" size="icon" variant="outline" onClick={handleAddLink}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {links.length > 0 && (
                            <ScrollArea className="h-24 rounded-md border p-2">
                                <div className="space-y-2">
                                    {links.map((link, index) => (
                                        <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 text-sm">
                                            <a href={link} target="_blank" rel="noopener noreferrer" className="truncate hover:underline text-blue-500">
                                                {link}
                                            </a>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleRemoveLink(link)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Attachments</Label>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Files
                                <Input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
                            </Label>
                        </div>
                        {files.length > 0 && (
                            <ScrollArea className="h-24 rounded-md border p-2">
                                <div className="space-y-2">
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 text-sm">
                                            <div className="flex items-center gap-2 truncate">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="truncate">{file.name}</span>
                                                <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(0)}KB)</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleRemoveFile(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        Complete Task
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
