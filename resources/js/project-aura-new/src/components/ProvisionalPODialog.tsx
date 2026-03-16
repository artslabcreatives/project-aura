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
import { FileText } from "lucide-react";

interface ProvisionalPODialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (poNumber: string, expiresAt: string) => void;
    projectName?: string;
    currentPoNumber?: string;
    currentExpiresAt?: string;
}

export function ProvisionalPODialog({
    open,
    onOpenChange,
    onSave,
    projectName,
    currentPoNumber,
    currentExpiresAt,
}: ProvisionalPODialogProps) {
    const [poNumber, setPoNumber] = useState("");
    const [expiresAt, setExpiresAt] = useState("");

    useEffect(() => {
        if (open) {
            setPoNumber(currentPoNumber ?? "");
            setExpiresAt(currentExpiresAt ? currentExpiresAt.split("T")[0] : "");
        }
    }, [open, currentPoNumber, currentExpiresAt]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(poNumber, expiresAt);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <DialogTitle>Generate Provisional PO</DialogTitle>
                        </div>
                        <DialogDescription>
                            {projectName
                                ? `Issue a provisional Purchase Order for "${projectName}" to allow work to continue while awaiting the official PO.`
                                : "Issue a provisional Purchase Order to allow work to continue while awaiting the official PO."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 px-1">
                        <div className="grid gap-2">
                            <Label htmlFor="prov_po_number">Provisional PO Number *</Label>
                            <Input
                                id="prov_po_number"
                                value={poNumber}
                                onChange={(e) => setPoNumber(e.target.value)}
                                placeholder="PROV-2026-001"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                This temporary reference will be used until the official PO is received.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="prov_expires_at">Expiry Date *</Label>
                            <Input
                                id="prov_expires_at"
                                type="date"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                If the official PO is not received by this date, the project will be re-evaluated.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Issue Provisional PO
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
