import { H as useParams, l as reactExports, F as useToast, u as useNavigate, j as jsxRuntimeExports, S as Skeleton, aj as FileText, B as Button, aB as Building2, bK as FolderPlus, a as CircleCheck, a2 as Trash2, Y as Badge, ai as Separator, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription, a8 as AlertDialogFooter, a9 as AlertDialogCancel, aa as AlertDialogAction } from "./index-C4ZP3eFM.js";
import { E as EstimateDialog, e as estimateService } from "./EstimateDialog-fDGlM0A0.js";
import { c as clientService } from "./clientService-Cp6DDAHT.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./card-5_9pbgKs.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { A as ArrowLeft } from "./arrow-left-84kdjEmA.js";
import { S as SquarePen } from "./square-pen-Dr9mhwBZ.js";
import { C as Calendar } from "./calendar-B2-LyEnc.js";
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
function EstimateDetail() {
  const { estimateId } = useParams();
  const [estimate, setEstimate] = reactExports.useState(null);
  const [clients, setClients] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [isEditOpen, setIsEditOpen] = reactExports.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = reactExports.useState(false);
  const [isConverting, setIsConverting] = reactExports.useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const fetchEstimate = async () => {
    if (!estimateId) return;
    setLoading(true);
    try {
      const data = await estimateService.getById(estimateId);
      setEstimate(data);
    } catch {
      toast({ title: "Error", description: "Failed to load estimate.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    fetchEstimate();
    clientService.getAll().then(setClients).catch(() => {
    });
  }, [estimateId]);
  const handleStatusChange = async (status) => {
    if (!estimate?.id) return;
    try {
      const updated = await estimateService.updateStatus(estimate.id, status);
      setEstimate(updated);
      toast({ title: "Status updated." });
    } catch {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };
  const handleSave = async (payload) => {
    if (!estimate?.id) return;
    try {
      const updated = await estimateService.update(estimate.id, payload);
      setEstimate(updated);
      toast({ title: "Estimate updated successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to update estimate.", variant: "destructive" });
    }
  };
  const handleDelete = async () => {
    if (!estimate?.id) return;
    try {
      await estimateService.delete(estimate.id);
      toast({ title: "Estimate deleted." });
      navigate("/estimates");
    } catch {
      toast({ title: "Error", description: "Failed to delete estimate.", variant: "destructive" });
    }
  };
  const handleConvertToProject = async () => {
    if (!estimate?.id) return;
    setIsConverting(true);
    try {
      const result = await estimateService.convertToProject(estimate.id);
      toast({ title: "Project created from estimate." });
      navigate(`/project/${result.project_id}`);
    } catch {
      toast({ title: "Error", description: "Failed to create project from estimate.", variant: "destructive" });
    } finally {
      setIsConverting(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-48" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full" })
    ] });
  }
  if (!estimate) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-12 w-12 text-muted-foreground mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Estimate not found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "mt-4", onClick: () => navigate("/estimates"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
        " Back to Estimates"
      ] })
    ] });
  }
  const lineItems = estimate.items ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => navigate("/estimates"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: estimate.title }),
            estimate.estimate_number && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground font-mono", children: [
              "#",
              estimate.estimate_number
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: estimate.client?.company_name ?? "Unknown Client" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: estimate.status, onValueChange: handleStatusChange, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[130px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sent", children: "Sent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Rejected" })
          ] })
        ] }),
        estimate.status === "approved" && !estimate.project_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleConvertToProject,
            disabled: isConverting,
            className: "bg-green-600 hover:bg-green-700",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FolderPlus, { className: "h-4 w-4 mr-2" }),
              isConverting ? "Creating..." : "Create Project"
            ]
          }
        ),
        estimate.project_id && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            onClick: () => navigate(`/project/${estimate.project_id}`),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 mr-2 text-green-600" }),
              "View Project"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", onClick: () => setIsEditOpen(true), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            onClick: () => setIsDeleteOpen(true),
            className: "hover:text-destructive hover:border-destructive",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${getStatusConfig(estimate.status).className}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `${getStatusConfig(estimate.status).className} mr-1`, children: getStatusConfig(estimate.status).label }),
      estimate.valid_until && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-xs opacity-80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
        "Valid until ",
        new Date(estimate.valid_until).toLocaleDateString()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        estimate.description && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Description" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground whitespace-pre-line", children: estimate.description }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Line Items" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            lineItems.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No line items added." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground pb-2 border-b", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-6", children: "Description" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-right", children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-right", children: "Unit Price" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-right", children: "Total" })
              ] }),
              lineItems.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2 py-2 border-b last:border-b-0 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-6", children: item.description }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-right", children: item.quantity }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 text-right", children: [
                  estimate.currency === "LKR" ? "Rs. " : "$",
                  item.unit_price.toFixed(2)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 text-right font-medium", children: [
                  estimate.currency === "LKR" ? "Rs. " : "$",
                  (item.quantity * item.unit_price).toFixed(2)
                ] })
              ] }, i))
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-1 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between pt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Subtotal" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  estimate.currency === "LKR" ? "Rs. " : "$",
                  (estimate.subtotal ?? 0).toFixed(2)
                ] })
              ] }),
              estimate.tax_rate !== void 0 && estimate.tax_rate > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  "Tax (",
                  estimate.tax_rate,
                  "%)"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  estimate.currency === "LKR" ? "Rs. " : "$",
                  (estimate.tax_amount ?? 0).toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-semibold text-base pt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  estimate.currency === "LKR" ? "Rs. " : "$",
                  (estimate.total_amount ?? 0).toFixed(2)
                ] })
              ] })
            ] })
          ] })
        ] }),
        estimate.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Notes" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground whitespace-pre-line", children: estimate.notes }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Details" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Client" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: estimate.client?.company_name ?? "—" })
            ] })
          ] }),
          estimate.estimate_number && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Estimate #" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono font-medium", children: estimate.estimate_number })
            ] })
          ] }),
          estimate.valid_until && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Valid Until" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: new Date(estimate.valid_until).toLocaleDateString() })
            ] })
          ] }),
          estimate.created_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Created" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: new Date(estimate.created_at).toLocaleDateString() })
          ] }),
          estimate.project_id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "w-full",
              onClick: () => navigate(`/project/${estimate.project_id}`),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 mr-2 text-green-600" }),
                "Linked Project"
              ]
            }
          ) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EstimateDialog,
      {
        open: isEditOpen,
        onOpenChange: setIsEditOpen,
        onSave: handleSave,
        editEstimate: estimate,
        clients
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: isDeleteOpen, onOpenChange: setIsDeleteOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Estimate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'Are you sure you want to delete "',
          estimate.title,
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
  EstimateDetail as default
};
