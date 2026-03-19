import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Package, Truck, CheckCircle, RotateCcw, Loader2 } from "lucide-react";
import { Project } from "@/types/project";
import { projectService } from "@/services/projectService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface InvoiceViewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    url: string;
    project: Project;
    onSuccess?: (updatedProject: Project) => void;
}

const DELIVERY_STATUSES = [
    { value: "pending", label: "Processing", icon: Package, color: "text-blue-500" },
    { value: "shipped", label: "Shipped", icon: Truck, color: "text-orange-500" },
    { value: "delivered", label: "Delivered", icon: CheckCircle, color: "text-green-500" },
    { value: "returned", label: "Returned", icon: RotateCcw, color: "text-red-500" },
];

export function InvoiceViewDialog({ open, onOpenChange, url, project, onSuccess }: InvoiceViewDialogProps) {
    const { toast } = useToast();
    const [status, setStatus] = useState<string>(project.courierDeliveryStatus || "pending");
    const [isUpdating, setIsUpdating] = useState(false);

    if (!url) return null;

    const isPDF = url.toLowerCase().includes('.pdf') || url.includes('data:application/pdf');

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            const updatedProject = await projectService.update(String(project.id), {
                courier_delivery_status: newStatus,
            });
            setStatus(newStatus);
            if (onSuccess) onSuccess(updatedProject);
            toast({
                title: "Status Updated",
                description: `Delivery status changed to ${newStatus}.`,
            });
        } catch (error) {
            console.error("Failed to update delivery status:", error);
            toast({
                title: "Update Failed",
                description: "Could not update delivery status.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="max-w-5xl w-[95vw] h-[95vh] flex flex-col p-0 overflow-hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 bg-background z-10">
                    <div className="flex flex-col">
                        <DialogTitle className="text-xl font-bold">
                            Invoice: {project.invoiceNumber || "N/A"}
                        </DialogTitle>
                        {project.isPhysicalInvoice && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium text-muted-foreground">Tracking:</span>
                                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{project.courierTrackingNumber || "N/A"}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pr-8">
                        {project.isPhysicalInvoice && (
                            <div className="flex items-center gap-2 mr-2">
                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Delivery Status:</span>
                                <Select 
                                    value={status} 
                                    onValueChange={handleStatusChange}
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger className="h-8 w-[140px]">
                                        {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DELIVERY_STATUSES.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>
                                                <div className="flex items-center gap-2">
                                                    <s.icon className={`h-3 w-3 ${s.color}`} />
                                                    <span>{s.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => window.open(url, '_blank')}
                        >
                            <ExternalLink className="h-4 w-4" />
                            Open
                        </Button>
                        <a 
                            href={url} 
                            download 
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </a>
                    </div>
                </DialogHeader>
                
                <div className="flex-1 bg-muted/20 relative flex items-center justify-center p-4 overflow-hidden">
                    {isPDF ? (
                        <iframe 
                            src={`${url}#view=FitH`}
                            className="w-full h-full rounded-md shadow-sm border bg-white"
                            title="Invoice Document Viewer"
                        />
                    ) : (
                        <div className="w-full h-full overflow-auto flex items-center justify-center">
                            <img 
                                src={url} 
                                alt="Invoice Document" 
                                className="max-w-full max-h-full object-contain rounded-md shadow-md bg-white"
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
