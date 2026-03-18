import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Estimate, EstimateLineItem, EstimateStatus } from "@/types/estimate";
import { Client } from "@/types/client";
import { Project } from "@/types/project";
import { Plus, Trash2 } from "lucide-react";

interface EstimateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (estimate: Omit<Estimate, 'id' | 'created_at' | 'updated_at' | 'client'>) => void;
    editEstimate?: Estimate | null;
    clients: Client[];
    projects?: Project[];
    defaultClientId?: number;
    defaultProjectId?: number;
}

const emptyLineItem = (): EstimateLineItem => ({
    description: "",
    quantity: 1,
    unit_price: 0,
    total: 0,
});

export function EstimateDialog({
    open,
    onOpenChange,
    onSave,
    editEstimate,
    clients,
    projects,
    defaultClientId,
    defaultProjectId,
}: EstimateDialogProps) {
    const [formData, setFormData] = useState({
        client_id: defaultClientId ?? 0,
        title: "",
        description: "",
        status: "draft" as EstimateStatus,
        valid_until: "",
        notes: "",
        tax_rate: 0,
        currency: "USD",
        project_id: defaultProjectId ?? 0,
    });
    const [lineItems, setLineItems] = useState<EstimateLineItem[]>([emptyLineItem()]);

    useEffect(() => {
        if (editEstimate) {
            setFormData({
                client_id: editEstimate.client_id,
                title: editEstimate.title,
                description: editEstimate.description ?? "",
                status: editEstimate.status,
                valid_until: editEstimate.valid_until ?? "",
                notes: editEstimate.notes ?? "",
                tax_rate: editEstimate.tax_rate ?? 0,
                currency: editEstimate.currency || "USD",
                project_id: editEstimate.project_id ?? 0,
            });
            setLineItems(editEstimate.items?.length ? editEstimate.items : [emptyLineItem()]);
        } else {
            setFormData({
                client_id: defaultClientId ?? 0,
                title: "",
                description: "",
                status: "draft",
                valid_until: "",
                notes: "",
                tax_rate: 0,
                currency: "USD",
                project_id: defaultProjectId ?? 0,
            });
            setLineItems([emptyLineItem()]);
        }
    }, [editEstimate, open, defaultClientId, defaultProjectId]);

    const updateLineItem = (index: number, field: keyof EstimateLineItem, value: string | number) => {
        setLineItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            updated[index].total = updated[index].quantity * updated[index].unit_price;
            return updated;
        });
    };

    const addLineItem = () => setLineItems(prev => [...prev, emptyLineItem()]);

    const removeLineItem = (index: number) => {
        setLineItems(prev => prev.filter((_, i) => i !== index));
    };

    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = subtotal * (formData.tax_rate / 100);
    const totalAmount = subtotal + taxAmount;

    const currencySymbol = formData.currency === "LKR" ? "Rs. " : "$";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            items: lineItems,
            subtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editEstimate ? "Edit Estimate" : "Create New Estimate"}</DialogTitle>
                        <DialogDescription>
                            {editEstimate
                                ? "Update the estimate details below."
                                : "Fill in the estimate details to create a new quotation."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 px-1">
                        {/* Client & Project */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="client">Client *</Label>
                                <Select
                                    value={String(formData.client_id)}
                                    onValueChange={(v) => setFormData({ ...formData, client_id: Number(v) })}
                                >
                                    <SelectTrigger id="client">
                                        <SelectValue placeholder="Select client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map(c => (
                                            <SelectItem key={c.id} value={String(c.id)}>
                                                {c.company_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="project">Project (Optional)</Label>
                                <Select
                                    value={String(formData.project_id)}
                                    onValueChange={(v) => {
                                        const projectId = Number(v);
                                        const selectedProject = projects?.find(p => p.id === projectId);
                                        setFormData({ 
                                            ...formData, 
                                            project_id: projectId,
                                            currency: selectedProject?.currency || formData.currency 
                                        });
                                    }}
                                >
                                    <SelectTrigger id="project">
                                        <SelectValue placeholder="Select project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">None</SelectItem>
                                        {projects?.map(p => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Website Redesign Project"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the estimate scope"
                                rows={2}
                            />
                        </div>

                        {/* Status & Valid Until */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(v) => setFormData({ ...formData, status: v as EstimateStatus })}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="sent">Sent</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="valid_until">Valid Until</Label>
                                <Input
                                    id="valid_until"
                                    type="date"
                                    value={formData.valid_until}
                                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Currency */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="currency">Currency *</Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(v) => setFormData({ ...formData, currency: v })}
                                >
                                    <SelectTrigger id="currency">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="LKR">LKR (Rs.)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="grid gap-2">
                            <Label>Line Items</Label>
                            <div className="space-y-2">
                                {lineItems.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-5">
                                            <Input
                                                placeholder="Description"
                                                value={item.description}
                                                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                type="number"
                                                placeholder="Qty"
                                                min={1}
                                                value={item.quantity}
                                                onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                type="number"
                                                placeholder="Unit Price"
                                                min={0}
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => updateLineItem(index, 'unit_price', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-2 text-right text-sm font-medium pr-1">
                                            {currencySymbol}{((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)}
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeLineItem(index)}
                                                disabled={lineItems.length === 1}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addLineItem}
                                className="mt-1"
                            >
                                <Plus className="h-4 w-4 mr-1" /> Add Line Item
                            </Button>
                        </div>

                        {/* Totals */}
                        <div className="border rounded-md p-3 space-y-1 text-sm bg-muted/40">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-muted-foreground">Tax (%)</span>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step="0.1"
                                    value={formData.tax_rate}
                                    onChange={(e) => setFormData({ ...formData, tax_rate: Number(e.target.value) })}
                                    className="h-7 w-20 text-right"
                                />
                            </div>
                            <div className="flex justify-between font-semibold border-t pt-1">
                                <span>Total</span>
                                <span>{currencySymbol}{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Additional terms or notes for the client"
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">{editEstimate ? "Save Changes" : "Create Estimate"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
