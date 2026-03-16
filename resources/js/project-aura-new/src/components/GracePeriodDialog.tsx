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
import { ShieldCheck } from "lucide-react";

interface GracePeriodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (expiresAt: string, notes: string) => void;
    currentExpiresAt?: string;
    currentNotes?: string;
}

export function GracePeriodDialog({
    open,
    onOpenChange,
    onSave,
    currentExpiresAt,
    currentNotes,
}: GracePeriodDialogProps) {
    const [expiresAt, setExpiresAt] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (open) {
            setExpiresAt(currentExpiresAt ? currentExpiresAt.split("T")[0] : "");
            setNotes(currentNotes ?? "");
        }
    }, [open, currentExpiresAt, currentNotes]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(expiresAt, notes);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="h-5 w-5 text-amber-500" />
                            <DialogTitle>Authorize Grace Period</DialogTitle>
                        </div>
                        <DialogDescription>
                            Grant a temporary grace period allowing this project to proceed without a Purchase Order.
                            This action requires Finance role authorization.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 px-1">
                        <div className="grid gap-2">
                            <Label htmlFor="expires_at">Grace Period Expiry Date *</Label>
                            <Input
                                id="expires_at"
                                type="date"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Work may proceed until this date without a PO on file.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="grace_notes">Authorization Notes</Label>
                            <Textarea
                                id="grace_notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Reason for granting grace period (e.g. verbal confirmation from client)"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                            Authorize Grace Period
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
