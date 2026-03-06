import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Building2,
    Mail,
    Phone,
    Globe,
    MapPin,
    Plus,
    Pencil,
    Trash2,
    ChevronLeft,
    User as UserIcon,
    Star,
    MoreHorizontal,
    ArrowLeft
} from "lucide-react";
import { Client, ClientContact } from "@/types/client";
import { clientService } from "@/services/clientService";
import { useToast } from "@/hooks/use-toast";
import { ClientDialog } from "@/components/ClientDialog";
import { ContactDialog } from "@/components/ContactDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<ClientContact | null>(null);
    const [contactToDelete, setContactToDelete] = useState<ClientContact | null>(null);
    const [isDeletingClient, setIsDeletingClient] = useState(false);

    const fetchClient = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await clientService.getById(id);
            setClient(data);
        } catch (error) {
            console.error("Failed to fetch client:", error);
            toast({
                title: "Error",
                description: "Failed to load client details.",
                variant: "destructive",
            });
            navigate("/clients");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClient();
    }, [id]);

    const handleSaveClient = async (clientData: any) => {
        if (!client) return;
        try {
            const updated = await clientService.update(client.id, clientData);
            setClient(prev => prev ? { ...prev, ...updated } : null);
            toast({ title: "Client updated", description: "Company details have been saved." });
        } catch (error) {
            console.error("Failed to update client:", error);
            toast({ title: "Error", description: "Failed to update client.", variant: "destructive" });
        }
    };

    const handleDeleteClient = async () => {
        if (!client) return;
        try {
            await clientService.delete(client.id);
            toast({ title: "Client deleted", description: `${client.company_name} has been removed.`, variant: "destructive" });
            navigate("/clients");
        } catch (error) {
            console.error("Failed to delete client:", error);
            toast({ title: "Error", description: "Failed to delete client.", variant: "destructive" });
        }
    };

    const handleSaveContact = async (contactData: any) => {
        if (!client) return;
        try {
            if (editingContact) {
                const updated = await clientService.updateContact(client.id, editingContact.id, contactData);
                setClient(prev => prev ? {
                    ...prev,
                    contacts: prev.contacts?.map(c => c.id === editingContact.id ? updated : (contactData.is_primary ? { ...c, is_primary: false } : c))
                } : null);
                toast({ title: "Contact updated", description: "Contact details have been saved." });
            } else {
                const created = await clientService.addContact(client.id, contactData);
                setClient(prev => prev ? {
                    ...prev,
                    contacts: contactData.is_primary
                        ? [created, ...(prev.contacts?.map(c => ({ ...c, is_primary: false })) || [])]
                        : [...(prev.contacts || []), created]
                } : null);
                toast({ title: "Contact added", description: `${created.name} has been added.` });
            }
            setEditingContact(null);
        } catch (error) {
            console.error("Failed to save contact:", error);
            toast({ title: "Error", description: "Failed to save contact details.", variant: "destructive" });
        }
    };

    const handleDeleteContact = async () => {
        if (!client || !contactToDelete) return;
        try {
            await clientService.deleteContact(client.id, contactToDelete.id);
            setClient(prev => prev ? {
                ...prev,
                contacts: prev.contacts?.filter(c => c.id !== contactToDelete.id)
            } : null);
            toast({ title: "Contact deleted", description: "Contact has been removed.", variant: "destructive" });
            setContactToDelete(null);
        } catch (error) {
            console.error("Failed to delete contact:", error);
            toast({ title: "Error", description: "Failed to delete contact.", variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (!client) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Building2 className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{client.company_name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{client.industry || "Industry unspecified"}</Badge>
                            {client.website && (
                                <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 ml-2">
                                    <Globe className="h-3 w-3" />
                                    {client.website.replace(/^https?:\/\//, '')}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsClientDialogOpen(true)} className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Edit Client
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setIsDeletingClient(true)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Client
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Client Info Card */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Company Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                {client.email && (
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Main Email</p>
                                            <p className="text-sm text-muted-foreground">{client.email}</p>
                                        </div>
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Phone</p>
                                            <p className="text-sm text-muted-foreground">{client.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {client.address && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Address</p>
                                            <p className="text-sm text-muted-foreground whitespace-pre-line">{client.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {(client.notes) && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Internal Notes</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                                            {client.notes || "No internal notes provided."}
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Contacts Card */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-lg">Contacts</CardTitle>
                                <CardDescription>People associated with this company</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => setIsContactDialogOpen(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Contact
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(!client.contacts || client.contacts.length === 0) ? (
                                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                        <UserIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">No contacts added yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {client.contacts.sort((a, b) => (a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1)).map((contact) => (
                                            <div key={contact.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-full ${contact.is_primary ? 'bg-amber-100 text-amber-600' : 'bg-secondary text-secondary-foreground'}`}>
                                                        {contact.is_primary ? <Star className="h-4 w-4 fill-current" /> : <UserIcon className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold">{contact.name}</p>
                                                            {contact.is_primary && <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">Primary</Badge>}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{contact.title || "No title"}</p>
                                                        <div className="flex gap-4 mt-1">
                                                            {contact.email && (
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Mail className="h-3 w-3" /> {contact.email}
                                                                </span>
                                                            )}
                                                            {contact.phone && (
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Phone className="h-3 w-3" /> {contact.phone}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => {
                                                            setEditingContact(contact);
                                                            setIsContactDialogOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => setContactToDelete(contact)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ClientDialog
                open={isClientDialogOpen}
                onOpenChange={setIsClientDialogOpen}
                onSave={handleSaveClient}
                editClient={client}
            />

            <ContactDialog
                open={isContactDialogOpen}
                onOpenChange={(open) => {
                    setIsContactDialogOpen(open);
                    if (!open) setEditingContact(null);
                }}
                onSave={handleSaveContact}
                editContact={editingContact}
            />

            <AlertDialog open={isDeletingClient} onOpenChange={setIsDeletingClient}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Client</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{client.company_name}"? All associated contacts and internal notes will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!contactToDelete} onOpenChange={(open) => !open && setContactToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Contact</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove "{contactToDelete?.name}"?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteContact} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
