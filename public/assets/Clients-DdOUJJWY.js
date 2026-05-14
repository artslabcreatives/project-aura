import { b as api, l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, aE as History, O as DialogDescription, A as ScrollArea, L as LoaderCircle, a2 as Trash2, a1 as Pencil, ba as UserPlus, P as Plus, F as useToast, x as projectService, B as Button, aJ as RefreshCw, aB as Building2, Y as Badge, G as Search, I as Input, ac as Link, aC as Mail, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription, a8 as AlertDialogFooter, a9 as AlertDialogCancel, aa as AlertDialogAction, ax as api$1, S as Skeleton, s as ChevronRight } from "./index-C4ZP3eFM.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./card-5_9pbgKs.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-DRavPKwG.js";
import { c as clientService } from "./clientService-Cp6DDAHT.js";
import { C as ClientDialog } from "./ClientDialog-BBSNwwR8.js";
import { f as format } from "./format-BDODTvac.js";
import { T as Truck, P as Phone } from "./truck-wtuWzB4V.js";
import { C as ChevronLeft } from "./chevron-left-zAeTltYW.js";
const supplierService = {
  getPaginated: async (search, page = 1, perPage = 15) => {
    const { data } = await api.get("/suppliers", {
      params: { search: search || void 0, page, per_page: perPage }
    });
    return data;
  },
  delete: async (id) => {
    await api.delete(`/suppliers/${id}`);
  }
};
function ClientHistoryDialog({
  open,
  onOpenChange
}) {
  const [history, setHistory] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await clientService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch client history:", error);
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open]);
  const getActionIcon = (action) => {
    switch (action) {
      case "created_client":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 text-green-500" });
      case "updated_client":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4 text-blue-500" });
      case "deleted_client":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-red-500" });
      case "added_contact":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4 text-green-500" });
      case "updated_contact":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4 text-blue-500" });
      case "deleted_contact":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-red-500" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4 text-muted-foreground" });
    }
  };
  const getActionLabel = (action) => {
    return action.replace("_", " ").toUpperCase();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[600px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-5 w-5" }),
        "Client Activity Logs"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Recent actions performed in the Client Management Module." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[400px] mt-4 pr-4", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : history.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "No activity logs found." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: history.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 p-3 rounded-lg border bg-card/50 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5", children: getActionIcon(item.action) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-primary", children: getActionLabel(item.action) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: format(new Date(item.created_at), "MMM d, yyyy HH:mm") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: item.user?.name }),
          item.action.includes("client") ? " for company " : " for contact ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: item.target_name }),
          item.details?.company && ` (${item.details.company})`
        ] })
      ] })
    ] }, item.id)) }) })
  ] }) });
}
const PER_PAGE = 15;
function PaginationBar({ meta, onPageChange }) {
  if (meta.last_page <= 1) return null;
  const { current_page, last_page, total, from, to } = meta;
  const pages = [];
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: from && to ? `Showing ${from}–${to} of ${total}` : `${total} total` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          size: "icon",
          className: "h-8 w-8",
          disabled: current_page === 1,
          onClick: () => onPageChange(current_page - 1),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" })
        }
      ),
      pages.map(
        (p, i) => p === "…" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1 text-muted-foreground text-sm", children: "…" }, `ellipsis-${i}`) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: p === current_page ? "default" : "outline",
            size: "icon",
            className: "h-8 w-8 text-sm",
            onClick: () => onPageChange(p),
            children: p
          },
          p
        )
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          size: "icon",
          className: "h-8 w-8",
          disabled: current_page === last_page,
          onClick: () => onPageChange(current_page + 1),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
        }
      )
    ] })
  ] });
}
function CardSkeletons() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center gap-4 space-y-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-10 rounded-lg" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-24" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-3/4" })
    ] })
  ] }, i)) });
}
function Clients() {
  const [activeTab, setActiveTab] = reactExports.useState("customers");
  const { toast } = useToast();
  const [clients, setClients] = reactExports.useState([]);
  const [clientMeta, setClientMeta] = reactExports.useState(null);
  const [clientPage, setClientPage] = reactExports.useState(1);
  const [clientsLoading, setClientsLoading] = reactExports.useState(true);
  const [clientSearch, setClientSearch] = reactExports.useState("");
  const [internalClient, setInternalClient] = reactExports.useState(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = reactExports.useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = reactExports.useState(false);
  const [editingClient, setEditingClient] = reactExports.useState(null);
  const [clientToDelete, setClientToDelete] = reactExports.useState(null);
  const [syncingCustomers, setSyncingCustomers] = reactExports.useState(false);
  const [suppliers, setSuppliers] = reactExports.useState([]);
  const [supplierMeta, setSupplierMeta] = reactExports.useState(null);
  const [supplierPage, setSupplierPage] = reactExports.useState(1);
  const [suppliersLoading, setSuppliersLoading] = reactExports.useState(false);
  const [supplierSearch, setSupplierSearch] = reactExports.useState("");
  const [supplierToDelete, setSupplierToDelete] = reactExports.useState(null);
  const [syncingSuppliers, setSyncingSuppliers] = reactExports.useState(false);
  const [suppliersLoaded, setSuppliersLoaded] = reactExports.useState(false);
  const fetchClients = reactExports.useCallback(async (search, page) => {
    setClientsLoading(true);
    try {
      const [{ data, meta }, projects] = await Promise.all([
        clientService.getPaginated(search, page, PER_PAGE),
        page === 1 ? projectService.getAll() : Promise.resolve([])
      ]);
      if (page === 1) {
        const internalProjects = projects.filter((p) => !p.clientId);
        const matchesSearch = !search || "internal project".includes(search.toLowerCase());
        if (internalProjects.length > 0 && matchesSearch) {
          setInternalClient({
            id: "internal",
            company_name: "Internal Project",
            industry: "Internal Operations",
            email: "internal@aura.artslab",
            projects: internalProjects,
            contacts_count: 0
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
  reactExports.useEffect(() => {
    setClientPage(1);
  }, [clientSearch]);
  reactExports.useEffect(() => {
    const delay = setTimeout(() => fetchClients(clientSearch, clientPage), clientPage === 1 ? 300 : 0);
    return () => clearTimeout(delay);
  }, [clientSearch, clientPage]);
  const fetchSuppliers = reactExports.useCallback(async (search, page) => {
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
  reactExports.useEffect(() => {
    setSupplierPage(1);
  }, [supplierSearch]);
  reactExports.useEffect(() => {
    if (activeTab !== "suppliers") return;
    const delay = setTimeout(() => fetchSuppliers(supplierSearch, supplierPage), supplierPage === 1 ? 300 : 0);
    return () => clearTimeout(delay);
  }, [activeTab, supplierSearch, supplierPage]);
  const handleSaveClient = async (clientData) => {
    try {
      if (editingClient) {
        const updated = await clientService.update(editingClient.id, clientData);
        setClients((prev) => prev.map((c) => c.id === editingClient.id ? updated : c));
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
      const response = await api$1.post("/xero/sync-clients", {});
      toast({
        title: "Customers synced",
        description: `${response.created} created, ${response.merged} merged${response.removed ? `, ${response.removed} removed` : ""}`
      });
      fetchClients(clientSearch, 1);
      setClientPage(1);
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to sync from Xero", variant: "destructive" });
    } finally {
      setSyncingCustomers(false);
    }
  };
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
      const response = await api$1.post("/xero/sync-suppliers", {});
      toast({ title: "Suppliers synced", description: `${response.created} new suppliers added` });
      fetchSuppliers(supplierSearch, 1);
      setSupplierPage(1);
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to sync suppliers", variant: "destructive" });
    } finally {
      setSyncingSuppliers(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Clients" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Manage client database and contacts" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        activeTab === "customers" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setIsHistoryDialogOpen(true), className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4" }),
            "View Logs"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleSyncCustomers, disabled: syncingCustomers, className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${syncingCustomers ? "animate-spin" : ""}` }),
            syncingCustomers ? "Syncing..." : "Sync from Xero"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setIsClientDialogOpen(true), className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "New Client"
          ] })
        ] }),
        activeTab === "suppliers" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleSyncSuppliers, disabled: syncingSuppliers, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 ${syncingSuppliers ? "animate-spin" : ""}` }),
          syncingSuppliers ? "Syncing..." : "Sync Suppliers from Xero"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: (v) => setActiveTab(v), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "customers", className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4" }),
          "Customers",
          clientMeta && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "ml-1 text-[10px] h-4 px-1.5", children: clientMeta.total })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "suppliers", className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-4 w-4" }),
          "Suppliers",
          supplierMeta && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "ml-1 text-[10px] h-4 px-1.5", children: supplierMeta.total })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "customers", className: "mt-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 max-w-sm relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search customers...",
              className: "pl-9",
              value: clientSearch,
              onChange: (e) => setClientSearch(e.target.value)
            }
          ),
          clientsLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-muted-foreground" })
        ] }),
        clientsLoading && clients.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CardSkeletons, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: clients.length === 0 && !internalClient ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-dashed rounded-lg p-12 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: "No customers found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: clientSearch ? "No customers match your search." : "Get started by adding your first client." }),
          !clientSearch && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setIsClientDialogOpen(true), variant: "outline", className: "mt-4", children: "Add Client" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: [
            internalClient && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "hover:shadow-md transition-shadow group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/clients/internal", className: "block", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "flex flex-row items-start space-y-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 text-primary p-2 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-6 w-6" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg font-bold group-hover:text-primary transition-colors", children: internalClient.company_name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: internalClient.industry })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between border-t border-border pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
                internalClient.projects?.length || 0,
                " Projects"
              ] }) }) })
            ] }) }),
            clients.map((client) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "hover:shadow-md transition-shadow group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: `/clients/${client.id}`, className: "block", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "flex flex-row items-start justify-between space-y-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 text-primary p-2 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-6 w-6" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg font-bold group-hover:text-primary transition-colors line-clamp-1", children: client.company_name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground truncate", children: client.industry || "Industry unspecified" })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  client.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: client.email })
                  ] }),
                  client.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: client.phone })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t border-border pt-4 mt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
                    client.contacts_count || 0,
                    " Contacts"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "ghost",
                        size: "icon",
                        className: "h-8 w-8",
                        onClick: (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingClient(client);
                          setIsClientDialogOpen(true);
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "ghost",
                        size: "icon",
                        className: "h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10",
                        onClick: (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setClientToDelete(client);
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                      }
                    )
                  ] })
                ] })
              ] })
            ] }) }, client.id))
          ] }),
          clientMeta && /* @__PURE__ */ jsxRuntimeExports.jsx(PaginationBar, { meta: clientMeta, onPageChange: (page) => setClientPage(page) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "suppliers", className: "mt-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 max-w-sm relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search suppliers...",
              className: "pl-9",
              value: supplierSearch,
              onChange: (e) => setSupplierSearch(e.target.value)
            }
          ),
          suppliersLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-muted-foreground" })
        ] }),
        suppliersLoading && !suppliersLoaded ? /* @__PURE__ */ jsxRuntimeExports.jsx(CardSkeletons, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: suppliers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-dashed rounded-lg p-12 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: "No suppliers found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: supplierSearch ? "No suppliers match your search." : "Sync suppliers from Xero to populate this list." }),
          !supplierSearch && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "mt-4", onClick: handleSyncSuppliers, disabled: syncingSuppliers, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${syncingSuppliers ? "animate-spin" : ""}` }),
            "Sync from Xero"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: suppliers.map((supplier) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "hover:shadow-md transition-shadow group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "flex flex-row items-start justify-between space-y-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-orange-500/10 text-orange-500 p-2 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-6 w-6" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg font-bold line-clamp-1", children: supplier.company_name }),
                supplier.website && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground truncate", children: supplier.website })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                supplier.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: supplier.email })
                ] }),
                supplier.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: supplier.phone })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end border-t border-border pt-4 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity",
                  onClick: () => setSupplierToDelete(supplier),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                }
              ) })
            ] })
          ] }, supplier.id)) }),
          supplierMeta && /* @__PURE__ */ jsxRuntimeExports.jsx(PaginationBar, { meta: supplierMeta, onPageChange: (page) => setSupplierPage(page) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ClientDialog,
      {
        open: isClientDialogOpen,
        onOpenChange: (open) => {
          setIsClientDialogOpen(open);
          if (!open) setEditingClient(null);
        },
        onSave: handleSaveClient,
        editClient: editingClient
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ClientHistoryDialog, { open: isHistoryDialogOpen, onOpenChange: setIsHistoryDialogOpen }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!clientToDelete, onOpenChange: (open) => !open && setClientToDelete(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Client" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'Are you sure you want to delete "',
          clientToDelete?.company_name,
          '"? This will also delete all associated contacts. This action cannot be undone.'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDeleteClient, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!supplierToDelete, onOpenChange: (open) => !open && setSupplierToDelete(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Remove Supplier" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'Are you sure you want to remove "',
          supplierToDelete?.company_name,
          '"?'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDeleteSupplier, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Remove" })
      ] })
    ] }) })
  ] });
}
export {
  Clients as default
};
