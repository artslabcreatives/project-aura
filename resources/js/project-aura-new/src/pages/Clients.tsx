import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Building2, ExternalLink, Mail, Phone, MoreHorizontal, Pencil, Trash2, Loader2, History } from "lucide-react";
import { Client } from "@/types/client";
import { clientService } from "@/services/clientService";
import { useToast } from "@/hooks/use-toast";
import { ClientDialog } from "@/components/ClientDialog";
import { ClientHistoryDialog } from "@/components/ClientHistoryDialog";
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

export default function Clients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const { toast } = useToast();

    const fetchClients = async (query?: string) => {
        setLoading(true);
        try {
            const data = await clientService.getAll(query);
            setClients(data);
        } catch (error) {
            console.error("Failed to fetch clients:", error);
            toast({
                title: "Error",
                description: "Failed to load clients list.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchClients(searchQuery);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSaveClient = async (clientData: any) => {
        try {
            if (editingClient) {
                const updated = await clientService.update(editingClient.id, clientData);
                setClients(prev => prev.map(c => c.id === editingClient.id ? updated : c));
                toast({ title: "Client updated", description: "Company details have been saved." });
            } else {
                const created = await clientService.create(clientData);
                setClients(prev => [created, ...prev]);
                toast({ title: "Client created", description: `${created.company_name} has been added.` });
            }
            setEditingClient(null);
        } catch (error) {
            console.error("Failed to save client:", error);
            toast({
                title: "Error",
                description: "Failed to save client details.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteClient = async () => {
        if (!clientToDelete) return;
        try {
            await clientService.delete(clientToDelete.id);
            setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
            toast({
                title: "Client deleted",
                description: `${clientToDelete.company_name} has been removed.`,
                variant: "destructive",
            });
            setClientToDelete(null);
        } catch (error) {
            console.error("Failed to delete client:", error);
            toast({
                title: "Error",
                description: "Failed to delete client.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage client database and contacts
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsHistoryDialogOpen(true)} className="gap-2">
                        <History className="h-4 w-4" />
                        View Logs
                    </Button>
                    <Button onClick={() => setIsClientDialogOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Client
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 max-w-sm relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search clients..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            {loading && clients.length === 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="hover:shadow-sm">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-3/4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : clients.length === 0 ? (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No clients found</h3>
                    <p className="text-muted-foreground mt-1">
                        {searchQuery ? "No clients match your search criteria." : "Get started by adding your first client."}
                    </p>
                    {!searchQuery && (
                        <Button onClick={() => setIsClientDialogOpen(true)} variant="outline" className="mt-4">
                            Add Client
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {clients.map((client) => (
                        <Card key={client.id} className="hover:shadow-md transition-shadow group">
                            <Link to={`/clients/${client.id}`} className="block">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                                                {client.company_name}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {client.industry || "Industry unspecified"}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        {client.email && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-3.5 w-3.5" />
                                                <span className="truncate">{client.email}</span>
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-3.5 w-3.5" />
                                                <span>{client.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
                                        <Badge variant="secondary">
                                            {client.contacts_count || 0} Contacts
                                        </Badge>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setEditingClient(client);
                                                    setIsClientDialogOpen(true);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setClientToDelete(client);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}

            <ClientDialog
                open={isClientDialogOpen}
                onOpenChange={(open) => {
                    setIsClientDialogOpen(open);
                    if (!open) setEditingClient(null);
                }}
                onSave={handleSaveClient}
                editClient={editingClient}
            />

            <ClientHistoryDialog
                open={isHistoryDialogOpen}
                onOpenChange={setIsHistoryDialogOpen}
            />

            <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Client</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{clientToDelete?.company_name}"? This will also delete all associated contacts. This action cannot be undone.
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
        </div>
    );
}
