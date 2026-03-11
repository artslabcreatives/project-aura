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
    ArrowLeft,
    ExternalLink,
    FolderKanban,
    Clock,
    Copy,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";
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

const CopyButton = ({ text, label }: { text: string; label: string }) => {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({
            title: "Copied to clipboard",
            description: `${label} has been copied.`,
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-1 hover:bg-primary/10 transition-colors"
            onClick={handleCopy}
            title={`Copy ${label}`}
        >
            {copied ? (
                <Check className="h-3 w-3 text-green-500" />
            ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
            )}
        </Button>
    );
};

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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Main Info) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                Company Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Industry</p>
                                    <p className="text-sm font-medium">{client.industry || 'Not specified'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Website</p>
                                    {client.website ? (
                                        <a href={client.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                                            {client.website} <ExternalLink className="h-3 w-3" />
                                        </a>
                                    ) : (
                                        <p className="text-sm font-medium text-muted-foreground italic">No website</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary Email</p>
                                    <div className="flex items-center">
                                        <p className="text-sm font-medium">{client.email || 'Not specified'}</p>
                                        {client.email && <CopyButton text={client.email} label="Primary Email" />}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary Phone</p>
                                    <div className="flex items-center">
                                        <p className="text-sm font-medium">{client.phone || 'Not specified'}</p>
                                        {client.phone && <CopyButton text={client.phone} label="Primary Phone" />}
                                    </div>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</p>
                                    <p className="text-sm font-medium whitespace-pre-line">{client.address || 'No address provided'}</p>
                                </div>
                            </div>
                            <div className="space-y-2 pt-4 border-t">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Internal Notes</p>
                                <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                    {client.notes || 'No internal notes available.'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Associated Projects Card */}
                    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                <FolderKanban className="h-5 w-5 text-primary" />
                                Associated Projects
                            </CardTitle>
                            <Badge variant="outline" className="font-normal">
                                {client.projects?.length || 0} Total
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            {client.projects && client.projects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {client.projects.map(project => (
                                        <div
                                            key={project.id}
                                            onClick={() => navigate(`/project/${project.id}/overview`)}
                                            className="p-4 rounded-xl border bg-background/50 hover:bg-muted/30 transition-all cursor-pointer group border-border/50 hover:border-primary/20"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                    {project.name}
                                                </h3>
                                                <Badge className="text-[10px] px-2 py-0 h-4 capitalize font-normal">
                                                    {project.status || 'active'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {project.estimatedHours || 0}h
                                                </div>
                                                {project.department && (
                                                    <Badge variant="secondary" className="text-[10px] px-2 py-0 h-4 font-normal">
                                                        {project.department.name}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-3">
                                    <FolderKanban className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
                                    <p className="text-muted-foreground text-sm">No projects found for this client.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Contacts */}
                <div className="lg:col-span-1">
                    <Card className="h-full border-none shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-primary" />
                                Contacts
                            </CardTitle>
                            <Button size="sm" variant="ghost" onClick={() => setIsContactDialogOpen(true)} className="h-8 w-8 p-0">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(!client.contacts || client.contacts.length === 0) ? (
                                    <div className="text-center py-12 border border-dashed rounded-lg">
                                        <p className="text-xs text-muted-foreground">No contacts added yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {client.contacts.sort((a, b) => (a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1)).map((contact) => (
                                            <div key={contact.id} className="p-3 rounded-lg border bg-background/50 hover:bg-muted/30 transition-colors group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold">{contact.name}</p>
                                                        {contact.is_primary && <Star className="h-3 w-3 fill-amber-500 text-amber-500" />}
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditingContact(contact); setIsContactDialogOpen(true); }} className="text-muted-foreground hover:text-primary"><Pencil className="h-3 w-3" /></button>
                                                        <button onClick={() => setContactToDelete(contact)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-2">{contact.title || "No title"}</p>
                                                <div className="space-y-1">
                                                    {contact.email && (
                                                        <div className="text-[11px] text-muted-foreground flex items-center justify-between group/item">
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <Mail className="h-3 w-3 flex-shrink-0" /> {contact.email}
                                                            </div>
                                                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                <CopyButton text={contact.email} label="Email" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {contact.phone && (
                                                        <div className="text-[11px] text-muted-foreground flex items-center justify-between group/item">
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <Phone className="h-3 w-3 flex-shrink-0" /> {contact.phone}
                                                            </div>
                                                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                <CopyButton text={contact.phone} label="Phone" />
                                                            </div>
                                                        </div>
                                                    )}
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

            {/* Dialogs */}
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
                            Are you sure you want to delete "{client.company_name}"? All associated contacts and projects will be affected.
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
