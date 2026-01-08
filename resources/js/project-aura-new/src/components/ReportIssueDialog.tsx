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
import { toPng } from 'html-to-image';
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
    const [isCapturing, setIsCapturing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dialogContentRef = useRef<HTMLDivElement>(null);


    const captureScreen = async () => {
        setIsCapturing(true);

        // We'll try to capture immediately after a short delay to allow the dialog to close.
        onOpenChange(false);

        setTimeout(async () => {
            try {
                const dataUrl = await toPng(document.body, {
                    cacheBust: true,
                    filter: (node) => {
                        // Double safety: ignore the dialog container if it's still somehow in the DOM
                        // Shadcn dialog usually has role="dialog"
                        if (node instanceof HTMLElement && node.getAttribute('role') === 'dialog') {
                            return false;
                        }
                        // Also ignore any other elements with class 'ignore-screenshot'
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
                formData.append("screenshot", blob, "screenshot.png");
            }

            await api.post("/feedback", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast({ title: "Report Sent", description: "Thank you for your feedback!" });
            onOpenChange(false);
            setDescription("");
            setScreenshot(null);
        } catch (error) {
            console.error("Failed to submit report", error);
            toast({ title: "Error", description: "Failed to send report.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Report an Issue</DialogTitle>
                    <DialogDescription>
                        Found a bug? Let us know. You can attach a screenshot of the current screen.
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
                        <Label>Screenshot</Label>
                        {screenshot ? (
                            <div className="relative border rounded-md overflow-hidden group">
                                <img src={screenshot} alt="Screenshot" className="w-full h-auto max-h-[200px] object-contain bg-muted" />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setScreenshot(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={captureScreen}
                            >
                                {isCapturing ? (
                                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                ) : (
                                    <Camera className="h-8 w-8 mb-2" />
                                )}
                                <span className="text-sm">Click to capture current screen</span>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !description}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
