import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Package, Truck, CheckCircle, RotateCcw, Loader2, Save, MapPin, Search, X } from "lucide-react";
import { Project } from "@/types/project";
import { projectService } from "@/services/projectService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Invoice } from "@/types/financial";
import { invoiceService } from "@/services/invoiceService";

interface InvoiceViewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    url?: string;
    project?: Project;
    invoice?: Invoice;
    onSuccess?: (updatedData: any) => void;
}

const DELIVERY_STATUSES = [
    { value: "pending", label: "Processing", icon: Package, color: "text-indigo-500", bgColor: "bg-indigo-500" },
    { value: "shipped", label: "Shipped", icon: Truck, color: "text-amber-500", bgColor: "bg-amber-500" },
    { value: "delivered", label: "Delivered", icon: CheckCircle, color: "text-emerald-500", bgColor: "bg-emerald-500" },
    { value: "returned", label: "Returned", icon: RotateCcw, color: "text-rose-500", bgColor: "bg-rose-500" },
];

export function InvoiceViewDialog({ open, onOpenChange, url: propUrl, project, invoice, onSuccess }: InvoiceViewDialogProps) {
    const { toast } = useToast();
    
    // Determine data source
    const displayInvoiceNumber = invoice?.invoiceNumber || project?.invoiceNumber || "N/A";
    const displayUrl = invoice?.invoiceDocument || propUrl || project?.invoiceDocumentUrl || "";
    const displayCreatedAt = invoice?.createdAt || (project as any)?.createdAt;
    const isPhysicalInvoice = invoice?.isPhysicalInvoice ?? project?.isPhysicalInvoice ?? false;
    const trackingNo = invoice?.courierTrackingNumber || project?.courierTrackingNumber || "";
    const deliveryStatus = invoice?.courierDeliveryStatus || project?.courierDeliveryStatus || "pending";
    const poNo = project?.poNumber || "N/A";
    const clientName = invoice?.client?.companyName || project?.client?.company_name || "N/A";

    const [status, setStatus] = useState<string>(deliveryStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isPhysical, setIsPhysical] = useState(isPhysicalInvoice);
    const [trackingNumber, setTrackingNumber] = useState(trackingNo);
    const [showEditTracking, setShowEditTracking] = useState(false);

    // Update local state when source props change
    useEffect(() => {
        setStatus(deliveryStatus);
        setIsPhysical(isPhysicalInvoice);
        setTrackingNumber(trackingNo);
    }, [invoice, project, deliveryStatus, isPhysicalInvoice, trackingNo]);

    if (!displayUrl) return null;

    const isPDF = displayUrl.toLowerCase().includes('.pdf') || displayUrl.includes('data:application/pdf');

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            if (invoice) {
                const updatedInvoice = await invoiceService.update(invoice.id, {
                    courierDeliveryStatus: newStatus,
                });
                setStatus(newStatus);
                if (onSuccess) onSuccess(updatedInvoice);
            } else if (project) {
                const updatedProject = await projectService.update(String(project.id), {
                    courierDeliveryStatus: newStatus,
                });
                setStatus(newStatus);
                if (onSuccess) onSuccess(updatedProject);
            }
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

    const handleUpdateTrackingDetails = async () => {
        setIsUpdating(true);
        try {
            if (invoice) {
                const updatedInvoice = await invoiceService.update(invoice.id, {
                    isPhysicalInvoice: isPhysical,
                    courierTrackingNumber: trackingNumber,
                });
                if (onSuccess) onSuccess(updatedInvoice);
            } else if (project) {
                const updatedProject = await projectService.update(String(project.id), {
                    isPhysicalInvoice: isPhysical,
                    courierTrackingNumber: trackingNumber,
                });
                if (onSuccess) onSuccess(updatedProject);
            }
            setShowEditTracking(false);
            toast({
                title: "Tracking Details Updated",
                description: "Physical invoice settings and tracking number have been saved.",
            });
        } catch (error) {
            console.error("Failed to update tracking details:", error);
            toast({
                title: "Update Failed",
                description: "Could not update tracking details.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const currentStatusIndex = DELIVERY_STATUSES.findIndex(s => s.value === status);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="max-w-[70rem] w-[95vw] h-[95vh] flex flex-col p-0 overflow-hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 bg-background z-10 shrink-0">
                    <div className="flex flex-col">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            Invoice: {displayInvoiceNumber}
                            {isPhysical && (
                                <span className={cn(
                                    "text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider",
                                    DELIVERY_STATUSES.find(s => s.value === status)?.bgColor || "bg-muted",
                                    "text-white"
                                )}>
                                    {DELIVERY_STATUSES.find(s => s.value === status)?.label || status}
                                </span>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Created on {displayCreatedAt ? new Date(displayCreatedAt).toLocaleDateString() : 'N/A'}
                        </DialogDescription>
                    </div>

                    <div className="flex items-center gap-3 pr-8">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => window.open(displayUrl, '_blank')}
                        >
                            <ExternalLink className="h-4 w-4" />
                            Open
                        </Button>
                        <a 
                            href={displayUrl} 
                            download 
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </a>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-2 rounded-full hover:bg-muted"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>
                
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Side: Document Viewer */}
                    <div className="flex-1 bg-muted/20 relative flex items-center justify-center p-4 overflow-hidden border-r">
                        {isPDF ? (
                            <iframe 
                                src={`${displayUrl}#view=FitH`}
                                className="w-full h-full rounded-lg shadow-2xl border bg-white"
                                title="Invoice Document Viewer"
                            />
                        ) : (
                            <div className="w-full h-full overflow-auto flex items-center justify-center">
                                <img 
                                    src={displayUrl} 
                                    alt="Invoice Document" 
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-white"
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Side: Tracking & Details */}
                    <div className="w-80 flex flex-col bg-background shrink-0 overflow-y-auto">
                        <div className="p-6 space-y-8">
                            {/* Tracking Status Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" /> Delivery Status
                                    </h3>
                                    {isPhysical && (
                                        <div className="text-[10px] font-medium text-muted-foreground italic">
                                            Handled via Courier
                                        </div>
                                    )}
                                </div>

                                {isPhysical ? (
                                    <div className="space-y-6">
                                        {/* Status Stepper */}
                                        <div className="relative space-y-4">
                                            {DELIVERY_STATUSES.map((s, idx) => {
                                                const isActive = idx <= currentStatusIndex;
                                                const isCurrent = idx === currentStatusIndex;
                                                const Icon = s.icon;

                                                return (
                                                    <div key={s.value} className="flex gap-4 relative">
                                                        {idx !== DELIVERY_STATUSES.length - 1 && (
                                                            <div className={cn(
                                                                "absolute left-3.5 top-8 w-0.5 h-6 transition-colors",
                                                                isActive ? s.bgColor : "bg-muted"
                                                            )} />
                                                        )}
                                                        <div className={cn(
                                                            "w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all",
                                                            isActive ? s.bgColor + " text-white shadow-lg scale-110" : "bg-muted text-muted-foreground"
                                                        )}>
                                                            <Icon className="h-3.5 w-3.5" />
                                                        </div>
                                                        <div className="flex flex-col pt-0.5">
                                                            <span className={cn(
                                                                "text-sm font-bold",
                                                                isActive ? "text-foreground" : "text-muted-foreground"
                                                            )}>
                                                                {s.label}
                                                            </span>
                                                            {isCurrent && (
                                                                <span className="text-[10px] text-muted-foreground animate-pulse">
                                                                    Current stage
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Status Selector */}
                                        <div className="pt-2 space-y-2">
                                            <Label className="text-xs">Update Current Status</Label>
                                            <Select 
                                                value={status} 
                                                onValueChange={handleStatusChange}
                                                disabled={isUpdating}
                                            >
                                                <SelectTrigger className="h-9 w-full bg-muted/50 border-none">
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

                                        {/* Tracking Number Display */}
                                        <div className="bg-muted px-4 py-3 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-mono font-bold tracking-tight">{trackingNumber || "N/A"}</span>
                                                <div className="flex gap-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-6 w-6 text-primary hover:text-primary/80"
                                                        onClick={() => window.open(`https://www.google.com/search?q=${trackingNumber}`, '_blank')}
                                                        title="Track on Google"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-6 w-6 text-primary hover:text-primary/80"
                                                        onClick={() => setShowEditTracking(true)}
                                                        title="Edit tracking info"
                                                    >
                                                        <Search className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl space-y-3">
                                        <div className="flex items-start gap-2">
                                            <Package className="h-4 w-4 shrink-0 mt-0.5" />
                                            <p className="text-xs font-semibold leading-tight">This invoice is not currently marked for physical delivery.</p>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full text-[10px] h-7 border-amber-500/30 bg-transparent hover:bg-amber-500/10"
                                            onClick={() => {
                                                setIsPhysical(true);
                                                setShowEditTracking(true);
                                            }}
                                        >
                                            Enable Physical Delivery Tracking
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Edit Tracking Dialog/Form */}
                            {showEditTracking && (
                                <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-bottom-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        Update Tracking Info
                                    </h3>
                                    
                                    <div className="flex items-center space-x-2 py-1">
                                        <Checkbox 
                                            id="edit_isPhysicalInvoice" 
                                            checked={isPhysical}
                                            onCheckedChange={(checked) => setIsPhysical(!!checked)}
                                        />
                                        <Label htmlFor="edit_isPhysicalInvoice" className="text-xs font-medium">Physical Invoice (Courier)</Label>
                                    </div>

                                    {isPhysical && (
                                        <div className="space-y-2">
                                            <Label htmlFor="edit_trackingNumber" className="text-xs">Tracking Number</Label>
                                            <Input
                                                id="edit_trackingNumber"
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                                className="h-8 text-sm"
                                                placeholder="Enter tracking #"
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            className="flex-1 h-8"
                                            onClick={handleUpdateTrackingDetails}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Save className="h-3.5 w-3.5 mr-2" />}
                                            Save
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-8"
                                            onClick={() => setShowEditTracking(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Additional Info Section */}
                            <div className="space-y-4 pt-8 border-t">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">General Details</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase">PO Number</div>
                                            <div className="text-xs font-medium">{poNo}</div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase">Client</div>
                                            <div className="text-xs font-medium line-clamp-1">{clientName}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
