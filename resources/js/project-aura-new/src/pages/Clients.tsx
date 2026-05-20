import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus, Search, Building2, Mail, Phone, Pencil,
    Trash2, Loader2, History, RefreshCw, Truck,
    ChevronLeft, ChevronRight,
} from "lucide-react";
import { Client } from "@/types/client";
import { Supplier } from "@/types/supplier";
import { clientService, PaginationMeta } from "@/services/clientService";
import { supplierService } from "@/services/supplierService";
import { projectService } from "@/services/projectService";
import { useToast } from "@/hooks/use-toast";
import { ClientDialog } from "@/components/ClientDialog";
import { ClientHistoryDialog } from "@/components/ClientHistoryDialog";
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
import { api } from "@/lib/api";

const PER_PAGE = 15;

// ── Simple pagination bar ────────────────────────────────────────────────────
function PaginationBar({ meta, onPageChange }: { meta: PaginationMeta; onPageChange: (page: number) => void }) {
    if (meta.last_page <= 1) return null;

    const { current_page, last_page, total, from, to } = meta;

    const pages: (number | "…")[] = [];
    if (last_page <= 7) {
        for (let i = 1; i <= last_page; i++) pages.push(i);
    } else {
        pages.push(1);
        if (current_page > 3) pages.push("…");
        for (let i = Math.max(2, current_page - 1); i <= Math.min(last_page - 1, current_page + 1); i++) {
            pages.push(i);
        }
        if (current_page < last_page - 2) pages.push("…");
        pages.push(last_page);
    }

    return (
        <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
                {from && to ? `Showing ${from}–${to} of ${total}` : `${total} total`}
            </p>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline" size="icon" className="h-8 w-8"
                    disabled={current_page === 1}
                    onClick={() => onPageChange(current_page - 1)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                {pages.map((p, i) =>
                    p === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                    ) : (
                        <Button
                            key={p}
                            variant={p === current_page ? "default" : "outline"}
                            size="icon"
                            className="h-8 w-8 text-sm"
                            onClick={() => onPageChange(p as number)}
                        >
                            {p}
                        </Button>
                    )
                )}
                <Button
                    variant="outline" size="icon" className="h-8 w-8"
                    disabled={current_page === last_page}
                    onClick={() => onPageChange(current_page + 1)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// ── Card skeletons ───────────────────────────────────────────────────────────
function CardSkeletons() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
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
    );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Clients() {
    const [activeTab, setActiveTab] = useState<"customers" | "suppliers">("customers");
    const { toast } = useToast();

    // ── Customers ──
    const [clients, setClients] = useState<Client[]>([]);
    const [clientMeta, setClientMeta] = useState<PaginationMeta | null>(null);
    const [clientPage, setClientPage] = useState(1);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [clientSearch, setClientSearch] = useState("");
    const [internalClient, setInternalClient] = useState<Client | null>(null);
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [syncingCustomers, setSyncingCustomers] = useState(false);

    // ── Suppliers ──
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [supplierMeta, setSupplierMeta] = useState<PaginationMeta | null>(null);
    const [supplierPage, setSupplierPage] = useState(1);
    const [suppliersLoading, setSuppliersLoading] = useState(false);
    const [supplierSearch, setSupplierSearch] = useState("");
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
    const [syncingSuppliers, setSyncingSuppliers] = useState(false);
    const [suppliersLoaded, setSuppliersLoaded] = useState(false);

    // ── Fetch clients ──────────────────────────────────────────────────────

    const fetchClients = useCallback(async (search: string, page: number) => {
        setClientsLoading(true);
        try {
            const [{ data, meta }, projects] = await Promise.all([
                clientService.getPaginated(search, page, PER_PAGE),
                page === 1 ? projectService.getAll() : Promise.resolve([]),
            ]);

            // Internal virtual client (page 1 only, no search or matches "internal")
            if (page === 1) {
                const internalProjects = (projects as any[]).filter((p: any) => !p.clientId);
                const matchesSearch = !search || "internal project".includes(search.toLowerCase());
                if (internalProjects.length > 0 && matchesSearch) {
                    setInternalClient({
                        id: "internal",
                        company_name: "Internal Project",
                        industry: "Internal Operations",
                        email: "internal@aura.artslab",
                        projects: internalProjects,
                        contacts_count: 0,
                    });
                } else {
                    setInternalClient(null);
                }
            } else {
                setInternalClient(null);
            }

            setClients(data);
            setClientMeta(meta);
        } catch {
            toast({ title: "Error", description: "Failed to load clients.", variant: "destructive" });
        } finally {
            setClientsLoading(false);
        }
    }, []);

    // Reset to page 1 when search changes
    useEffect(() => {
        setClientPage(1);
    }, [clientSearch]);

    useEffect(() => {
        const delay = setTimeout(() => fetchClients(clientSearch, clientPage), clientPage === 1 ? 300 : 0);
        return () => clearTimeout(delay);
    }, [clientSearch, clientPage]);

    // ── Fetch suppliers ────────────────────────────────────────────────────

    const fetchSuppliers = useCallback(async (search: string, page: number) => {
        setSuppliersLoading(true);
        try {
            const { data, meta } = await supplierService.getPaginated(search, page, PER_PAGE);
            setSuppliers(data);
            setSupplierMeta(meta);
            setSuppliersLoaded(true);
        } catch {
            toast({ title: "Error", description: "Failed to load suppliers.", variant: "destructive" });
        } finally {
            setSuppliersLoading(false);
        }
    }, []);

    useEffect(() => {
        setSupplierPage(1);
    }, [supplierSearch]);

    useEffect(() => {
        if (activeTab !== "suppliers") return;
        const delay = setTimeout(() => fetchSuppliers(supplierSearch, supplierPage), supplierPage === 1 ? 300 : 0);
        return () => clearTimeout(delay);
    }, [activeTab, supplierSearch, supplierPage]);

    // ── Customer handlers ──────────────────────────────────────────────────

    const handleSaveClient = async (clientData: any) => {
        try {
            if (editingClient) {
                const updated = await clientService.update(editingClient.id, clientData);
                setClients(prev => prev.map(c => c.id === editingClient.id ? updated : c));
                toast({ title: "Client updated" });
            } else {
                await clientService.create(clientData);
                toast({ title: "Client created" });
                fetchClients(clientSearch, clientPage);
            }
            setEditingClient(null);
        } catch {
            toast({ title: "Error", description: "Failed to save client.", variant: "destructive" });
        }
    };

    const handleDeleteClient = async () => {
        if (!clientToDelete) return;
        try {
            await clientService.delete(clientToDelete.id);
            toast({ title: "Client deleted", variant: "destructive" });
            setClientToDelete(null);
            fetchClients(clientSearch, clientPage);
        } catch {
            toast({ title: "Error", description: "Failed to delete client.", variant: "destructive" });
        }
    };

    const handleSyncCustomers = async () => {
        setSyncingCustomers(true);
        try {
            const response = await api.post<{ created: number; merged: number; removed: number }>('/xero/sync-clients', {});
            toast({
                title: 'Customers synced',
                description: `${response.created} created, ${response.merged} merged${response.removed ? `, ${response.removed} removed` : ''}`,
            });
            fetchClients(clientSearch, 1);
            setClientPage(1);
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to sync from Xero', variant: 'destructive' });
        } finally {
            setSyncingCustomers(false);
        }
    };

    // ── Supplier handlers ──────────────────────────────────────────────────

    const handleDeleteSupplier = async () => {
        if (!supplierToDelete) return;
        try {
            await supplierService.delete(supplierToDelete.id);
            toast({ title: "Supplier removed", variant: "destructive" });
            setSupplierToDelete(null);
            fetchSuppliers(supplierSearch, supplierPage);
        } catch {
            toast({ title: "Error", description: "Failed to remove supplier.", variant: "destructive" });
        }
    };

    const handleSyncSuppliers = async () => {
        setSyncingSuppliers(true);
        try {
            const response = await api.post<{ created: number }>('/xero/sync-suppliers', {});
            toast({ title: 'Suppliers synced', description: `${response.created} new suppliers added` });
            fetchSuppliers(supplierSearch, 1);
            setSupplierPage(1);
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to sync suppliers', variant: 'destructive' });
        } finally {
            setSyncingSuppliers(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground mt-1">Manage client database and contacts</p>
                </div>
                <div className="flex gap-2">
                    {activeTab === "customers" && (
                        <>
                            <Button variant="outline" onClick={() => setIsHistoryDialogOpen(true)} className="gap-2">
                                <History className="h-4 w-4" />
                                View Logs
                            </Button>
                            <Button variant="outline" onClick={handleSyncCustomers} disabled={syncingCustomers} className="gap-2">
                                <RefreshCw className={`h-4 w-4 ${syncingCustomers ? 'animate-spin' : ''}`} />
                                {syncingCustomers ? 'Syncing...' : 'Sync from Xero'}
                            </Button>
                            <Button onClick={() => setIsClientDialogOpen(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Client
                            </Button>
                        </>
                    )}
                    {activeTab === "suppliers" && (
                        <Button variant="outline" onClick={handleSyncSuppliers} disabled={syncingSuppliers} className="gap-2">
                            <RefreshCw className={`h-4 w-4 ${syncingSuppliers ? 'animate-spin' : ''}`} />
                            {syncingSuppliers ? 'Syncing...' : 'Sync Suppliers from Xero'}
                        </Button>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "customers" | "suppliers")}>
                <TabsList>
                    <TabsTrigger value="customers" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        Customers
                        {clientMeta && (
                            <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">{clientMeta.total}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="suppliers" className="gap-2">
                        <Truck className="h-4 w-4" />
                        Suppliers
                        {supplierMeta && (
                            <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">{supplierMeta.total}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* ── Customers Tab ── */}
                <TabsContent value="customers" className="mt-6 space-y-4">
                    <div className="flex items-center gap-2 max-w-sm relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search customers..."
                            className="pl-9"
                            value={clientSearch}
                            onChange={e => setClientSearch(e.target.value)}
                        />
                        {clientsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>

                    {clientsLoading && clients.length === 0 ? <CardSkeletons /> : (
                        <>
                            {(clients.length === 0 && !internalClient) ? (
                                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">No customers found</h3>
                                    <p className="text-muted-foreground mt-1">
                                        {clientSearch ? "No customers match your search." : "Get started by adding your first client."}
                                    </p>
                                    {!clientSearch && (
                                        <Button onClick={() => setIsClientDialogOpen(true)} variant="outline" className="mt-4">Add Client</Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {internalClient && (
                                            <Card className="hover:shadow-md transition-shadow group">
                                                <Link to="/clients/internal" className="block">
                                                    <CardHeader className="flex flex-row items-start space-y-0">
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                                                <Building2 className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                                                                    {internalClient.company_name}
                                                                </CardTitle>
                                                                <p className="text-sm text-muted-foreground">{internalClient.industry}</p>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex items-center justify-between border-t border-border pt-4">
                                                            <Badge variant="secondary">
                                                                {internalClient.projects?.length || 0} Projects
                                                            </Badge>
                                                        </div>
                                                    </CardContent>
                                                </Link>
                                            </Card>
                                        )}
                                        {clients.map(client => (
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
                                                                    <Mail className="h-3.5 w-3.5" /><span className="truncate">{client.email}</span>
                                                                </div>
                                                            )}
                                                            {client.phone && (
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <Phone className="h-3.5 w-3.5" /><span>{client.phone}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
                                                            <Badge variant="secondary">{client.contacts_count || 0} Contacts</Badge>
                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    variant="ghost" size="icon" className="h-8 w-8"
                                                                    onClick={e => { e.preventDefault(); e.stopPropagation(); setEditingClient(client); setIsClientDialogOpen(true); }}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost" size="icon"
                                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                    onClick={e => { e.preventDefault(); e.stopPropagation(); setClientToDelete(client); }}
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
                                    {clientMeta && (
                                        <PaginationBar meta={clientMeta} onPageChange={page => setClientPage(page)} />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>

                {/* ── Suppliers Tab ── */}
                <TabsContent value="suppliers" className="mt-6 space-y-4">
                    <div className="flex items-center gap-2 max-w-sm relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search suppliers..."
                            className="pl-9"
                            value={supplierSearch}
                            onChange={e => setSupplierSearch(e.target.value)}
                        />
                        {suppliersLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>

                    {suppliersLoading && !suppliersLoaded ? <CardSkeletons /> : (
                        <>
                            {suppliers.length === 0 ? (
                                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                                    <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium">No suppliers found</h3>
                                    <p className="text-muted-foreground mt-1">
                                        {supplierSearch ? "No suppliers match your search." : "Sync suppliers from Xero to populate this list."}
                                    </p>
                                    {!supplierSearch && (
                                        <Button variant="outline" className="mt-4" onClick={handleSyncSuppliers} disabled={syncingSuppliers}>
                                            <RefreshCw className={`h-4 w-4 mr-2 ${syncingSuppliers ? 'animate-spin' : ''}`} />
                                            Sync from Xero
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {suppliers.map(supplier => (
                                            <Card key={supplier.id} className="hover:shadow-md transition-shadow group">
                                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-orange-500/10 text-orange-500 p-2 rounded-lg">
                                                            <Truck className="h-6 w-6" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg font-bold line-clamp-1">{supplier.company_name}</CardTitle>
                                                            {supplier.website && (
                                                                <p className="text-sm text-muted-foreground truncate">{supplier.website}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="space-y-2">
                                                        {supplier.email && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Mail className="h-3.5 w-3.5" /><span className="truncate">{supplier.email}</span>
                                                            </div>
                                                        )}
                                                        {supplier.phone && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Phone className="h-3.5 w-3.5" /><span>{supplier.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-end border-t border-border pt-4 mt-2">
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => setSupplierToDelete(supplier)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                    {supplierMeta && (
                                        <PaginationBar meta={supplierMeta} onPageChange={page => setSupplierPage(page)} />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>
            </Tabs>

            {/* ── Dialogs ── */}
            <ClientDialog
                open={isClientDialogOpen}
                onOpenChange={open => { setIsClientDialogOpen(open); if (!open) setEditingClient(null); }}
                onSave={handleSaveClient}
                editClient={editingClient}
            />

            <ClientHistoryDialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen} />

            <AlertDialog open={!!clientToDelete} onOpenChange={open => !open && setClientToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Client</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{clientToDelete?.company_name}"? This will also delete all associated contacts. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!supplierToDelete} onOpenChange={open => !open && setSupplierToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Supplier</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove "{supplierToDelete?.company_name}"?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSupplier} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
