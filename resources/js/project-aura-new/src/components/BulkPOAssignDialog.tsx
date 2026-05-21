import { useEffect, useState } from "react";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { projectService } from "@/services/projectService";
import { Project, ProjectPurchaseOrder } from "@/types/project";
import { api } from "@/lib/api";
import {
    Loader2, Search, FileText, CheckCircle2, AlertCircle,
    Plus, Trash2, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface XeroPO {
    PurchaseOrderID: string;
    PurchaseOrderNumber: string;
    DateString: string;
    Status: string;
    Total: number;
    CurrencyCode: string;
    Contact: { Name: string; ContactID: string };
    Reference?: string;
    Type: "Purchase Order" | "Quote";
}

interface ManualPOEntry {
    id: string;
    poNumber: string;
    amount: string;
    currency: string;
    notes: string;
}

interface BulkPOAssignDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: Project;
    onSuccess: (updatedProject: Project, newPOs: ProjectPurchaseOrder[]) => void;
}

export function BulkPOAssignDialog({
    open,
    onOpenChange,
    project,
    onSuccess,
}: BulkPOAssignDialogProps) {
    const { toast } = useToast();
    const [tab, setTab] = useState<"xero" | "manual">("xero");

    // Xero tab state
    const [xeroPOs, setXeroPOs] = useState<XeroPO[]>([]);
    const [xeroLoading, setXeroLoading] = useState(false);
    const [xeroError, setXeroError] = useState<string | null>(null);
    const [xeroSearch, setXeroSearch] = useState("");
    const [selectedXeroPOs, setSelectedXeroPOs] = useState<XeroPO[]>([]);

    // Manual tab state
    const [manualEntries, setManualEntries] = useState<ManualPOEntry[]>([
        { id: crypto.randomUUID(), poNumber: "", amount: "", currency: project.currency || "USD", notes: "" },
    ]);

    const [isSaving, setIsSaving] = useState(false);

    const fetchXeroPOs = async () => {
        setXeroLoading(true);
        setXeroError(null);
        try {
            const params = new URLSearchParams();
            if (project.client?.xero_contact_id) {
                params.append("xero_contact_id", project.client.xero_contact_id);
            }
            const response = await api.get<XeroPO[]>(`/xero/purchase-orders?${params.toString()}`);
            setXeroPOs(response);
        } catch (err: any) {
            setXeroError(err.response?.data?.message || "Failed to load Purchase Orders from Xero.");
        } finally {
            setXeroLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchXeroPOs();
            setSelectedXeroPOs([]);
            setXeroSearch("");
            setManualEntries([
                { id: crypto.randomUUID(), poNumber: "", amount: "", currency: project.currency || "USD", notes: "" },
            ]);
        }
    }, [open]);

    const toggleXeroPO = (po: XeroPO) => {
        setSelectedXeroPOs((prev) =>
            prev.some((p) => p.PurchaseOrderID === po.PurchaseOrderID)
                ? prev.filter((p) => p.PurchaseOrderID !== po.PurchaseOrderID)
                : [...prev, po]
        );
    };

    const addManualRow = () => {
        setManualEntries((prev) => [
            ...prev,
            { id: crypto.randomUUID(), poNumber: "", amount: "", currency: project.currency || "USD", notes: "" },
        ]);
    };

    const removeManualRow = (id: string) => {
        setManualEntries((prev) => prev.filter((e) => e.id !== id));
    };

    const updateManualRow = (id: string, field: keyof Omit<ManualPOEntry, "id">, value: string) => {
        setManualEntries((prev) =>
            prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
        );
    };

    const filteredXeroPOs = xeroPOs.filter(
        (po) =>
            po.PurchaseOrderNumber.toLowerCase().includes(xeroSearch.toLowerCase()) ||
            po.Contact.Name.toLowerCase().includes(xeroSearch.toLowerCase()) ||
            (po.Reference && po.Reference.toLowerCase().includes(xeroSearch.toLowerCase()))
    );

    const handleSave = async () => {
        const posToAssign: Array<{
            poNumber: string;
            xeroPoId?: string;
            amount?: number;
            currency?: string;
            status?: string;
            notes?: string;
        }> = [];

        if (tab === "xero") {
            if (selectedXeroPOs.length === 0) {
                toast({ title: "Select at least one PO", variant: "destructive" });
                return;
            }
            selectedXeroPOs.forEach((po) => {
                posToAssign.push({
                    poNumber: po.PurchaseOrderNumber,
                    xeroPoId: po.PurchaseOrderID,
                    amount: po.Total,
                    currency: po.CurrencyCode,
                    status: po.Status,
                });
            });
        } else {
            const valid = manualEntries.filter((e) => e.poNumber.trim());
            if (valid.length === 0) {
                toast({ title: "Enter at least one PO number", variant: "destructive" });
                return;
            }
            valid.forEach((e) => {
                posToAssign.push({
                    poNumber: e.poNumber.trim(),
                    amount: e.amount ? parseFloat(e.amount) : undefined,
                    currency: e.currency || undefined,
                    notes: e.notes || undefined,
                });
            });
        }

        setIsSaving(true);
        try {
            const result = await projectService.bulkAssignPurchaseOrders(
                String(project.id),
                posToAssign
            );
            onSuccess(result.project, result.purchaseOrders);
            onOpenChange(false);
            toast({
                title: "Purchase Orders Assigned",
                description: `${posToAssign.length} PO${posToAssign.length > 1 ? "s" : ""} linked to this project.`,
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to assign purchase orders.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[580px] h-[620px] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Assign Purchase Orders
                    </DialogTitle>
                    <DialogDescription>
                        Link one or more purchase orders to <strong>{project.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    value={tab}
                    onValueChange={(v) => setTab(v as "xero" | "manual")}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    <TabsList className="shrink-0">
                        <TabsTrigger value="xero">Select from Xero</TabsTrigger>
                        <TabsTrigger value="manual">Enter Manually</TabsTrigger>
                    </TabsList>

                    {/* ── Xero tab ── */}
                    <TabsContent value="xero" className="flex-1 data-[state=active]:flex flex-col overflow-hidden mt-3">
                        <div className="relative mb-2 shrink-0">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by PO number, client, or reference..."
                                className="pl-8"
                                value={xeroSearch}
                                onChange={(e) => setXeroSearch(e.target.value)}
                            />
                        </div>

                        {selectedXeroPOs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2 shrink-0">
                                {selectedXeroPOs.map((po) => (
                                    <Badge
                                        key={po.PurchaseOrderID}
                                        variant="secondary"
                                        className="cursor-pointer"
                                        onClick={() => toggleXeroPO(po)}
                                    >
                                        {po.PurchaseOrderNumber} ✕
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="flex-1 overflow-hidden">
                            {xeroLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : xeroError ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                    <AlertCircle className="h-10 w-10 text-destructive mb-2" />
                                    <p className="text-sm text-destructive">{xeroError}</p>
                                    <Button variant="outline" size="sm" className="mt-4" onClick={fetchXeroPOs}>
                                        Try Again
                                    </Button>
                                </div>
                            ) : filteredXeroPOs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                    <FileText className="h-10 w-10 mb-2 opacity-20" />
                                    <p className="text-sm">No available Purchase Orders found.</p>
                                </div>
                            ) : (
                                <ScrollArea className="h-full pr-2">
                                    <div className="space-y-2">
                                        {filteredXeroPOs.map((po) => {
                                            const isSelected = selectedXeroPOs.some(
                                                (p) => p.PurchaseOrderID === po.PurchaseOrderID
                                            );
                                            return (
                                                <div
                                                    key={po.PurchaseOrderID}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent",
                                                        isSelected
                                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                            : "border-border"
                                                    )}
                                                    onClick={() => toggleXeroPO(po)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={cn(
                                                                "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0",
                                                                isSelected
                                                                    ? "bg-primary border-primary"
                                                                    : "border-muted-foreground"
                                                            )}
                                                        >
                                                            {isSelected && (
                                                                <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm">{po.PurchaseOrderNumber}</span>
                                                                <Badge variant="outline" className="text-[10px] py-0 h-4 bg-muted/50">
                                                                    {po.Type}
                                                                </Badge>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">{po.Contact.Name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-bold text-sm">
                                                            {po.CurrencyCode}{" "}
                                                            {po.Total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    </TabsContent>

                    {/* ── Manual tab ── */}
                    <TabsContent value="manual" className="flex-1 data-[state=active]:flex flex-col overflow-hidden mt-3">
                        <ScrollArea className="flex-1 pr-2">
                            <div className="space-y-3">
                                {manualEntries.map((entry, idx) => (
                                    <div key={entry.id} className="p-3 border rounded-lg space-y-2 bg-muted/30">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase">
                                                PO #{idx + 1}
                                            </span>
                                            {manualEntries.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                                    onClick={() => removeManualRow(entry.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="col-span-2">
                                                <Label className="text-xs">PO Number *</Label>
                                                <Input
                                                    value={entry.poNumber}
                                                    onChange={(e) => updateManualRow(entry.id, "poNumber", e.target.value)}
                                                    placeholder="e.g. PO-2026-001"
                                                    className="h-8 mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Amount</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={entry.amount}
                                                    onChange={(e) => updateManualRow(entry.id, "amount", e.target.value)}
                                                    placeholder="0.00"
                                                    className="h-8 mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Currency</Label>
                                                <Input
                                                    value={entry.currency}
                                                    onChange={(e) => updateManualRow(entry.id, "currency", e.target.value)}
                                                    placeholder="USD"
                                                    className="h-8 mt-1"
                                                    maxLength={10}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-xs">Notes</Label>
                                                <Input
                                                    value={entry.notes}
                                                    onChange={(e) => updateManualRow(entry.id, "notes", e.target.value)}
                                                    placeholder="Optional notes"
                                                    className="h-8 mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={addManualRow}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Another PO
                                </Button>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-4 shrink-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {tab === "xero"
                            ? `Assign ${selectedXeroPOs.length > 0 ? selectedXeroPOs.length + " " : ""}PO${selectedXeroPOs.length !== 1 ? "s" : ""}`
                            : `Assign ${manualEntries.filter((e) => e.poNumber.trim()).length || ""} PO${manualEntries.filter((e) => e.poNumber.trim()).length !== 1 ? "s" : ""}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
