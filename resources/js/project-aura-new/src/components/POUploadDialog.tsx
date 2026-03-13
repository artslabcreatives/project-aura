import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { projectService } from "@/services/projectService";
import { Project } from "@/types/project";
import { Loader2, UploadCloud, File as FileIcon, X } from "lucide-react";

interface POUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: Project;
    onSuccess: (updatedProject: Project) => void;
}

export function POUploadDialog({ open, onOpenChange, project, onSuccess }: POUploadDialogProps) {
    const { toast } = useToast();
    const [poNumber, setPoNumber] = useState(project.poNumber || "");
    const [poDocument, setPoDocument] = useState<File | undefined>();
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            const updatedProject = await projectService.update(String(project.id), {
                po_number: poNumber,
                po_document: poDocument,
            });
            onSuccess(updatedProject);
            onOpenChange(false);
            setPoDocument(undefined);
            toast({ title: "PO Uploaded", description: "Purchase Order has been uploaded successfully." });
        } catch (error) {
            console.error("Failed to upload PO:", error);
            toast({ title: "Error", description: "Failed to upload PO.", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="sm:max-w-[425px]"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <form onSubmit={handleUpload}>
                    <DialogHeader>
                        <DialogTitle>Upload Purchase Order</DialogTitle>
                        <DialogDescription>
                            Attach a Purchase Order document to verify and unlock this project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="poNumber">PO Number</Label>
                            <Input
                                id="poNumber"
                                value={poNumber}
                                onChange={(e) => setPoNumber(e.target.value)}
                                placeholder="Enter PO Number (Optional)"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="poDocument">Upload PO Document</Label>
                            <div 
                                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors
                                ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}`}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) setPoDocument(file);
                                }}
                            >
                                <div className="space-y-1 text-center">
                                    {poDocument ? (
                                        <div className="flex flex-col items-center">
                                            <FileIcon className="mx-auto h-12 w-12 text-primary" />
                                            <p className="mt-2 text-sm font-medium">{poDocument.name}</p>
                                            <p className="text-xs text-muted-foreground">{(poDocument.size / 1024 / 1024).toFixed(2)} MB</p>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm" 
                                                className="mt-2 text-destructive hover:text-destructive"
                                                onClick={() => setPoDocument(undefined)}
                                            >
                                                <X className="h-4 w-4 mr-1" /> Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <div className="flex justify-center text-sm text-muted-foreground">
                                                <label
                                                    htmlFor="poDocument"
                                                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                                                >
                                                    <span>Upload a file</span>
                                                    <Input
                                                        id="poDocument"
                                                        type="file"
                                                        className="sr-only"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) setPoDocument(file);
                                                        }}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">PDF, PNG, JPG up to 10MB</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isUploading || (!poNumber && !poDocument)}>
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upload PO
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
