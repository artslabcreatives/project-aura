import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { projectService } from "@/services/projectService";
import { Project } from "@/types/project";
import { Loader2, UploadCloud, File as FileIcon, X, Mail } from "lucide-react";

interface InvoiceUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: Project;
    onSuccess: (updatedProject: Project) => void;
}

export function InvoiceUploadDialog({ open, onOpenChange, project, onSuccess }: InvoiceUploadDialogProps) {
    const { toast } = useToast();
    const [invoiceNumber, setInvoiceNumber] = useState(project.invoiceNumber || "");
    const [invoiceDocument, setInvoiceDocument] = useState<File | undefined>();
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isPhysicalInvoice, setIsPhysicalInvoice] = useState(project.isPhysicalInvoice || false);
    const [courierTrackingNumber, setCourierTrackingNumber] = useState(project.courierTrackingNumber || "");

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let invoiceDocumentValue: any = invoiceDocument;

            if (invoiceDocument instanceof File) {
                // Read as base64 to bypass server /tmp full issue
                invoiceDocumentValue = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(invoiceDocument);
                });
            }

            const updatedProject = await projectService.update(String(project.id), {
                status: 'completed',
                invoice_number: invoiceNumber,
                invoice_document: invoiceDocumentValue,
                isPhysicalInvoice: isPhysicalInvoice,
                courierTrackingNumber: isPhysicalInvoice ? courierTrackingNumber : undefined,
            });

            // Simulate sending email
            setIsSendingEmail(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSendingEmail(false);

            onSuccess(updatedProject);
            onOpenChange(false);
            setInvoiceDocument(undefined);
            toast({ 
                title: "Invoice Uploaded", 
                description: "Invoice has been uploaded and demo email sent to the client." 
            });
        } catch (error) {
            console.error("Failed to upload invoice:", error);
            toast({ title: "Error", description: "Failed to upload invoice.", variant: "destructive" });
        } finally {
            setIsUploading(false);
            setIsSendingEmail(false);
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
                        <DialogTitle>Upload Invoice</DialogTitle>
                        <DialogDescription>
                            Complete the project by uploading the final invoice. This will be linked to PO: {project.poNumber || "N/A"}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="invoiceNumber">Invoice Number</Label>
                            <Input
                                id="invoiceNumber"
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                placeholder="Enter Invoice Number"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="poNumberDisplay">Linked PO Number</Label>
                            <Input
                                id="poNumberDisplay"
                                value={project.poNumber || "No PO linked"}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        <div className="flex items-center space-x-2 py-2">
                            <Checkbox 
                                id="isPhysicalInvoice" 
                                checked={isPhysicalInvoice}
                                onCheckedChange={(checked) => setIsPhysicalInvoice(!!checked)}
                            />
                            <Label 
                                htmlFor="isPhysicalInvoice"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                This is a physical invoice (Courier required)
                            </Label>
                        </div>

                        {isPhysicalInvoice && (
                            <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                                <Label htmlFor="courierTrackingNumber">Courier Tracking Number</Label>
                                <Input
                                    id="courierTrackingNumber"
                                    value={courierTrackingNumber}
                                    onChange={(e) => setCourierTrackingNumber(e.target.value)}
                                    placeholder="Enter Tracking Number"
                                    required={isPhysicalInvoice}
                                />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="invoiceDocument">Upload Invoice Document</Label>
                            <div 
                                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors
                                ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}`}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) setInvoiceDocument(file);
                                }}
                            >
                                <div className="space-y-1 text-center">
                                    {invoiceDocument ? (
                                        <div className="flex flex-col items-center">
                                            <FileIcon className="mx-auto h-12 w-12 text-primary" />
                                            <p className="mt-2 text-sm font-medium">{invoiceDocument.name}</p>
                                            <p className="text-xs text-muted-foreground">{(invoiceDocument.size / 1024 / 1024).toFixed(2)} MB</p>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm" 
                                                className="mt-2 text-destructive hover:text-destructive"
                                                onClick={() => setInvoiceDocument(undefined)}
                                            >
                                                <X className="h-4 w-4 mr-1" /> Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <div className="flex justify-center text-sm text-muted-foreground">
                                                <label
                                                    htmlFor="invoiceDocument"
                                                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                                                >
                                                    <span>Upload a file</span>
                                                    <Input
                                                        id="invoiceDocument"
                                                        type="file"
                                                        className="sr-only"
                                                        accept=".pdf,.png,.jpg,.jpeg"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) setInvoiceDocument(file);
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
                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isUploading || isSendingEmail || !invoiceNumber || !invoiceDocument}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : isSendingEmail ? (
                                <>
                                    <Mail className="mr-2 h-4 w-4 animate-pulse" />
                                    Sending Email...
                                </>
                            ) : (
                                "Upload & Complete"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
