import { l as reactExports, F as useToast, u as useNavigate, v as useUser, j as jsxRuntimeExports, B as Button, ak as ExternalLink, aJ as RefreshCw, P as Plus, Y as Badge, G as Search, I as Input, S as Skeleton, aj as FileText, a as CircleCheck, aB as Building2, al as Eye, a2 as Trash2, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription, a8 as AlertDialogFooter, a9 as AlertDialogCancel, aa as AlertDialogAction, x as projectService } from "./index-C4ZP3eFM.js";
import { E as EstimateDialog, e as estimateService } from "./EstimateDialog-fDGlM0A0.js";
import { c as clientService } from "./clientService-Cp6DDAHT.js";
import { C as Card, c as CardContent } from "./card-5_9pbgKs.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { S as SquarePen } from "./square-pen-Dr9mhwBZ.js";
import "./chevrons-up-down-DISs2Pfx.js";
import "./index-D6Uc8srH.js";
const statusConfig = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  sent: { label: "Sent", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  approved: { label: "Approved", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  accepted: { label: "Accepted", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  invoiced: { label: "Invoiced", className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  deleted: { label: "Deleted", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" }
};
const getStatusConfig = (status) => {
  return statusConfig[status] || { label: status.charAt(0).toUpperCase() + status.slice(1), className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };
};
function Estimates() {
  const [estimates, setEstimates] = reactExports.useState([]);
  const [clients, setClients] = reactExports.useState([]);
  const [projects, setProjects] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [editEstimate, setEditEstimate] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [isSyncingXero, setIsSyncingXero] = reactExports.useState(false);
  const [xeroConnected, setXeroConnected] = reactExports.useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, activeRole } = useUser();
  const fetchEstimates = async () => {
    setLoading(true);
    try {
      const data = await estimateService.getAll();
      setEstimates(data);
    } catch {
      toast({ title: "Error", description: "Failed to load estimates.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await clientService.getAll();
        setClients(data);
      } catch (error) {
        console.error("Failed to load clients for estimate form:", error);
      }
    };
    const fetchProjects = async () => {
      try {
        const data = await projectService.getAll();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects for estimate form:", error);
      }
    };
    const checkXero = async () => {
      try {
        const status = await estimateService.xeroStatus();
        setXeroConnected(status.connected);
      } catch {
        setXeroConnected(false);
      }
    };
    fetchClients();
    fetchProjects();
    fetchEstimates();
    checkXero();
  }, []);
  const handleSave = async (payload) => {
    try {
      if (editEstimate?.id) {
        await estimateService.update(editEstimate.id, payload);
        toast({ title: "Estimate updated successfully." });
      } else {
        await estimateService.create(payload);
        toast({ title: "Estimate created successfully." });
      }
      setEditEstimate(null);
      fetchEstimates();
    } catch {
      toast({ title: "Error", description: "Failed to save estimate.", variant: "destructive" });
    }
  };
  const handleXeroSync = async () => {
    setIsSyncingXero(true);
    try {
      const result = await estimateService.syncFromXero();
      toast({
        title: "Xero sync complete",
        description: `${result.created} created · ${result.updated} updated · ${result.skipped} skipped`
      });
      fetchEstimates();
    } catch (err) {
      toast({
        title: "Xero sync failed",
        description: err?.response?.data?.message ?? "Please check your Xero connection.",
        variant: "destructive"
      });
    } finally {
      setIsSyncingXero(false);
    }
  };
  const handleConnectXero = async () => {
    try {
      const { url } = await estimateService.xeroAuthUrl();
      window.location.href = url;
    } catch {
      toast({ title: "Error", description: "Failed to get Xero auth URL.", variant: "destructive" });
    }
  };
  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await estimateService.delete(deleteTarget.id);
      toast({ title: "Estimate deleted." });
      fetchEstimates();
    } catch {
      toast({ title: "Error", description: "Failed to delete estimate.", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };
  const filtered = estimates.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || (e.client?.company_name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) || (e.estimate_number ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const counts = estimates.reduce(
    (acc, e) => {
      acc[e.status] = (acc[e.status] ?? 0) + 1;
      return acc;
    },
    {}
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Estimates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-0.5", children: "Manage client quotations — synced from Xero" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        xeroConnected === false && (activeRole === "admin" || activeRole === "hr") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleConnectXero, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 mr-2" }),
          " Connect Xero"
        ] }),
        xeroConnected && (activeRole === "admin" || activeRole === "hr") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleXeroSync, disabled: isSyncingXero, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${isSyncingXero ? "animate-spin" : ""}` }),
          isSyncingXero ? "Syncing..." : "Sync from Xero"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setEditEstimate(null);
          setIsDialogOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
          " New Estimate"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: ["draft", "sent", "approved", "rejected"].map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        className: "cursor-pointer hover:shadow-md transition-shadow",
        onClick: () => setStatusFilter((prev) => prev === status ? "all" : status),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: counts[status] ?? 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `${statusConfig[status].className} mt-1 capitalize text-xs`, children: statusConfig[status].label })
        ] })
      },
      status
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search estimates...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "pl-9"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: statusFilter, onValueChange: (v) => setStatusFilter(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[140px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Filter status" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Statuses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sent", children: "Sent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Rejected" })
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 w-full rounded-lg" }, i)) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-12 w-12 text-muted-foreground mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-muted-foreground", children: searchQuery || statusFilter !== "all" ? "No estimates match your filters" : "No estimates yet" }),
      !searchQuery && statusFilter === "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          className: "mt-4",
          onClick: () => {
            setEditEstimate(null);
            setIsDialogOpen(true);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
            " Create your first estimate"
          ]
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filtered.map((estimate) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "hover:shadow-md transition-shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-3 flex-1 cursor-pointer min-w-0",
          onClick: () => navigate(`/estimates/${estimate.id}`),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-md bg-muted shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold truncate", children: estimate.title }),
                estimate.estimate_number && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-mono", children: [
                  "#",
                  estimate.estimate_number
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `${getStatusConfig(estimate.status).className} text-xs`, children: getStatusConfig(estimate.status).label }),
                estimate.xero_estimate_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 text-[10px] px-1.5 py-0.5 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-2.5 w-2.5" }),
                  " Xero"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm text-muted-foreground mt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: estimate.client?.company_name ?? "Unknown client" })
              ] })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 shrink-0", children: [
        estimate.total_amount !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-right hidden sm:block", children: [
          estimate.currency === "LKR" ? "Rs. " : "$",
          estimate.total_amount.toFixed(2)
        ] }),
        estimate.valid_until && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground hidden md:block", children: [
          "Valid until ",
          new Date(estimate.valid_until).toLocaleDateString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => navigate(`/estimates/${estimate.id}`),
              title: "View",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => {
                setEditEstimate(estimate);
                setIsDialogOpen(true);
              },
              title: "Edit",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => setDeleteTarget(estimate),
              title: "Delete",
              className: "hover:text-destructive",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
            }
          )
        ] })
      ] })
    ] }) }) }, estimate.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EstimateDialog,
      {
        open: isDialogOpen,
        onOpenChange: (open) => {
          setIsDialogOpen(open);
          if (!open) setEditEstimate(null);
        },
        onSave: handleSave,
        editEstimate,
        clients,
        projects
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleteTarget, onOpenChange: (open) => !open && setDeleteTarget(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Estimate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'Are you sure you want to delete "',
          deleteTarget?.title,
          '"? This action cannot be undone.'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDelete, className: "bg-destructive hover:bg-destructive/90", children: "Delete" })
      ] })
    ] }) })
  ] });
}
export {
  Estimates as default
};
