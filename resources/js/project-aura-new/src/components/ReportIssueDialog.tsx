import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, X } from "lucide-react";
import { toJpeg } from 'html-to-image';
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface ReportIssueDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReportIssueDialog({ open, onOpenChange }: ReportIssueDialogProps) {
    const { toast } = useToast();
    const [description, setDescription] = useState("");
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dialogContentRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const captureScreen = async () => {
        setIsCapturing(true);

        // We'll try to capture immediately after a short delay to allow the dialog to close.
        onOpenChange(false);

        setTimeout(async () => {
            try {
                const dataUrl = await toJpeg(document.body, {
                    quality: 0.8,
                    cacheBust: true,
                    filter: (node) => {
                        // Only ignore elements explicitly marked to be ignored
                        if (node instanceof HTMLElement && node.classList.contains('ignore-screenshot')) {
                            return false;
                        }
                        return true;
                    }
                });
                setScreenshot(dataUrl);
                onOpenChange(true);
            } catch (error) {
                console.error("Failed to capture screenshot", error);
                toast({ title: "Error", description: "Failed to capture screenshot. Please try again.", variant: "destructive" });
                onOpenChange(true);
            } finally {
                setIsCapturing(false);
            }
        }, 500); // Increased delay slightly to 500ms to ensure animation clears
    };

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const validFiles = newFiles.filter(file => {
                if (file.size > MAX_FILE_SIZE) {
                    toast({
                        title: "File too large",
                        description: `${file.name} exceeds the 2MB limit.`,
                        variant: "destructive"
                    });
                    return false;
                }
                return true;
            });

            if (validFiles.length > 0) {
                setAttachedFiles(prev => [...prev, ...validFiles]);
            }
        }
    };

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!description.trim()) {
            toast({ title: "Description required", description: "Please describe the issue.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("description", description);
            formData.append("type", "bug_report");
            formData.append("device_info", JSON.stringify({
                userAgent: navigator.userAgent,
                screenSize: `${window.screen.width}x${window.screen.height}`,
                windowSize: `${window.innerWidth}x${window.innerHeight}`,
                url: window.location.href
            }));

            if (screenshot) {
                const blob = await (await fetch(screenshot)).blob();
                formData.append("screenshot", blob, "screenshot.jpg");
            }

            if (attachedFiles.length > 0) {
                attachedFiles.forEach((file) => {
                    formData.append("images[]", file);
                });
            }

            await api.post("/feedback", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });

            toast({ title: "Report Sent", description: "Thank you for your feedback!" });
            onOpenChange(false);
            setDescription("");
            setScreenshot(null);
            setAttachedFiles([]);
        } catch (error: any) {
            console.error("Failed to submit report", error);
            let errorMessage = error.response?.data?.message || "Failed to send report.";

            if (error.response?.data?.errors) {
                const validationErrors = Object.values(error.response.data.errors).flat().join(", ");
                if (validationErrors) {
                    errorMessage += ` (${validationErrors})`;
                }
            }

            toast({ title: "Error", description: errorMessage, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] ignore-screenshot">
                <DialogHeader>
                    <DialogTitle>Report an Issue</DialogTitle>
                    <DialogDescription>
                        Found a bug? Let us know. You can attach a screenshot or upload images.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Describe what happened, what you expected, and how to reproduce it..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Attachments</Label>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Screenshot Capture Area */}
                            {screenshot ? (
                                <div className="relative border rounded-md overflow-hidden group aspect-video">
                                    <img src={screenshot} alt="Screenshot" className="w-full h-full object-cover" />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => setScreenshot(null)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 truncate">
                                        Screen Capture
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors aspect-video"
                                    onClick={captureScreen}
                                >
                                    {isCapturing ? (
                                        <Loader2 className="h-6 w-6 animate-spin mb-1" />
                                    ) : (
                                        <Camera className="h-6 w-6 mb-1" />
                                    )}
                                    <span className="text-xs text-center">Capture Screen</span>
                                </div>
                            )}

                            {/* Uploaded Files */}
                            {attachedFiles.map((file, index) => (
                                <div key={index} className="relative border rounded-md overflow-hidden group aspect-video">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Preview ${index}`}
                                        className="w-full h-full object-cover"
                                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeFile(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 truncate">
                                        {file.name}
                                    </div>
                                </div>
                            ))}

                            {/* Upload Button */}
                            <div
                                className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors aspect-video"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                                <span className="text-2xl mb-1">+</span>
                                <span className="text-xs text-center">Upload Images</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || (!description && !screenshot && attachedFiles.length === 0)}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
