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
import { Checkbox } from "@/components/ui/checkbox";
import { ClientContact } from "@/types/client";

interface ContactDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (contact: Omit<ClientContact, "id" | "client_id" | "created_at" | "updated_at">) => void;
    editContact?: ClientContact | null;
}

export function ContactDialog({
    open,
    onOpenChange,
    onSave,
    editContact,
}: ContactDialogProps) {
    const [formData, setFormData] = useState({
        name: "",
        title: "",
        email: "",
        phone: "",
        is_primary: false,
    });

    useEffect(() => {
        if (editContact) {
            setFormData({
                name: editContact.name,
                title: editContact.title || "",
                email: editContact.email || "",
                phone: editContact.phone || "",
                is_primary: editContact.is_primary,
            });
        } else {
            setFormData({
                name: "",
                title: "",
                email: "",
                phone: "",
                is_primary: false,
            });
        }
    }, [editContact, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
                        <DialogDescription>
                            {editContact ? "Update contact details for this client." : "Add a new contact person to this client's profile."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 px-1">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="title">Job Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Marketing Manager"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john.doe@client.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="is_primary"
                                checked={formData.is_primary}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked === true })}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor="is_primary"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Primary Contact
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Mark this person as the main point of contact for the client.
                                </p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">{editContact ? "Save Changes" : "Add Contact"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
