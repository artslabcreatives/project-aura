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
import { Client } from "@/types/client";

interface ClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (client: Omit<Client, "id" | "contacts" | "contacts_count" | "created_at" | "updated_at">) => void;
    editClient?: Client | null;
}

export function ClientDialog({
    open,
    onOpenChange,
    onSave,
    editClient,
}: ClientDialogProps) {
    const [formData, setFormData] = useState({
        company_name: "",
        industry: "",
        website: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
    });

    useEffect(() => {
        if (editClient) {
            setFormData({
                company_name: editClient.company_name,
                industry: editClient.industry || "",
                website: editClient.website || "",
                phone: editClient.phone || "",
                email: editClient.email || "",
                address: editClient.address || "",
                notes: editClient.notes || "",
            });
        } else {
            setFormData({
                company_name: "",
                industry: "",
                website: "",
                phone: "",
                email: "",
                address: "",
                notes: "",
            });
        }
    }, [editClient, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editClient ? "Edit Client" : "Add New Client"}</DialogTitle>
                        <DialogDescription>
                            {editClient ? "Update client company details." : "Create a new client entry in the master database."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 px-1 max-h-[70vh] overflow-y-auto">
                        <div className="grid gap-2">
                            <Label htmlFor="company_name">Company Name *</Label>
                            <Input
                                id="company_name"
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                placeholder="Acme Corp"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="industry">Industry</Label>
                                <Input
                                    id="industry"
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    placeholder="Technology"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="contact@acme.com"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="123 Street, City, Country"
                                rows={2}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Internal Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add any internal notes about the client..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">{editClient ? "Save Changes" : "Add Client"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
