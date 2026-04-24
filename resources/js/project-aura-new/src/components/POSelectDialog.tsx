import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { projectService } from "@/services/projectService";
import { Project } from "@/types/project";
import { api } from "@/lib/api";
import { Loader2, Search, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface XeroPO {
    PurchaseOrderID: string;
    PurchaseOrderNumber: string;
    DateString: string;
    Status: string;
    Total: number;
    CurrencyCode: string;
    Contact: {
        Name: string;
        ContactID: string;
    };
    Reference?: string;
    Type: 'Purchase Order' | 'Quote';
}

interface POSelectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: Project;
    onSuccess: (updatedProject: Project) => void;
}

export function POSelectDialog({ open, onOpenChange, project, onSuccess }: POSelectDialogProps) {
    const { toast } = useToast();
    const [pos, setPos] = useState<XeroPO[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState("");
    const [selectedPo, setSelectedPo] = useState<XeroPO | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPOs = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (project.client?.xero_contact_id) {
                params.append('xero_contact_id', project.client.xero_contact_id);
            }
            
            const response = await api.get<XeroPO[]>(`/xero/purchase-orders?${params.toString()}`);
            setPos(response);
        } catch (err: any) {
            console.error("Failed to fetch POs:", err);
            setError(err.response?.data?.message || "Failed to load Purchase Orders from Xero.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchPOs();
            setSelectedPo(null);
            setSearching("");
        }
    }, [open]);

    const handleSelect = async () => {
        if (!selectedPo) return;
        
        setIsSaving(true);
        try {
            const updatedProject = await projectService.update(String(project.id), {
                po_number: selectedPo.PurchaseOrderNumber,
                // In the future we could sync currency/amount too
            });
            onSuccess(updatedProject);
            onOpenChange(false);
            toast({ 
                title: "PO Linked", 
                description: `Purchase Order ${selectedPo.PurchaseOrderNumber} has been linked to this project.` 
            });
        } catch (err) {
            console.error("Failed to link PO:", err);
            toast({ 
                title: "Error", 
                description: "Failed to link Purchase Order.", 
                variant: "destructive" 
            });
        } finally {
            setIsSaving(false);
        }
    };

    const filteredPos = pos.filter(po => 
        po.PurchaseOrderNumber.toLowerCase().includes(searching.toLowerCase()) ||
        po.Contact.Name.toLowerCase().includes(searching.toLowerCase()) ||
        (po.Reference && po.Reference.toLowerCase().includes(searching.toLowerCase()))
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Purchase Order</DialogTitle>
                    <DialogDescription>
                        Select a Purchase Order from Xero to link to this project.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative my-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by PO number, client, or reference..."
                        className="pl-8"
                        value={searching}
                        onChange={(e) => setSearching(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4">
                            <AlertCircle className="h-10 w-10 text-destructive mb-2" />
                            <p className="text-sm font-medium text-destructive">{error}</p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={fetchPOs}>
                                Try Again
                            </Button>
                        </div>
                    ) : filteredPos.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                            <FileText className="h-10 w-10 mb-2 opacity-20" />
                            <p>No available Purchase Orders found.</p>
                            {project.client?.xero_contact_id && (
                                <p className="text-xs mt-1">Filtered by client: {project.client.company_name}</p>
                            )}
                        </div>
                    ) : (
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-2">
                                {filteredPos.map((po) => (
                                    <div
                                        key={po.PurchaseOrderID}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent",
                                            selectedPo?.PurchaseOrderID === po.PurchaseOrderID 
                                                ? "border-primary bg-primary/5 ring-1 ring-primary" 
                                                : "border-border"
                                        )}
                                        onClick={() => setSelectedPo(po)}
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm">{po.PurchaseOrderNumber}</span>
                                                <Badge variant="outline" className="text-[10px] py-0 h-4 bg-muted/50">
                                                    {po.Type}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{po.Contact.Name}</span>
                                            {po.Reference && (
                                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full w-fit mt-1">
                                                    Ref: {po.Reference}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <span className="font-bold text-sm">
                                                {po.CurrencyCode} {po.Total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(po.DateString).toLocaleDateString()}
                                            </span>
                                            {selectedPo?.PurchaseOrderID === po.PurchaseOrderID && (
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSelect} 
                        disabled={!selectedPo || isSaving}
                    >
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Link Selected PO
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
