const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-C4ZP3eFM.js","assets/index-t6OHpcEa.css"])))=>i.map(i=>d[i]);
import { ad as createLucideIcon, F as useToast, l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, G as Search, I as Input, L as LoaderCircle, C as CircleAlert, B as Button, aj as FileText, A as ScrollArea, Y as Badge, a as CircleCheck, z as cn, U as DialogFooter, ax as api, x as projectService, ak as ExternalLink, v as useUser, af as Upload, X, q as Check, aD as MessageSquare, a1 as Pencil, Q as Label, ae as Textarea, aE as History, aB as Building2, S as Skeleton, aA as Progress, az as TriangleAlert, P as Plus, ar as DropdownMenu, as as DropdownMenuTrigger, aF as Ellipsis, au as DropdownMenuContent, av as DropdownMenuItem, a2 as Trash2, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription, a8 as AlertDialogFooter, a9 as AlertDialogCancel, aa as AlertDialogAction, aG as __vitePreload, b as api$1, aH as uploadManager } from "./index-C4ZP3eFM.js";
import { D as Download } from "./download-qf94484n.js";
import { r as reportService } from "./reportService-DNtsOblX.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-5_9pbgKs.js";
import { f as format } from "./format-BDODTvac.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { A as Alert, a as AlertDescription, W as Wallet } from "./alert-ZV6Vs13A.js";
import { D as DollarSign, R as Receipt } from "./receipt-BPWO68lI.js";
import { L as Link2 } from "./link-2-qOcW-qoJ.js";
import { P as Paperclip } from "./paperclip-DDW-rwXv.js";
import { C as CircleX } from "./circle-x-BkjZsnQk.js";
import { C as Clock } from "./clock-C-1UQMq-.js";
const CreditCard = createLucideIcon("CreditCard", [
  ["rect", { width: "20", height: "14", x: "2", y: "5", rx: "2", key: "ynyp8z" }],
  ["line", { x1: "2", x2: "22", y1: "10", y2: "10", key: "1b3vmo" }]
]);
function POSelectDialog({ open, onOpenChange, project, onSuccess }) {
  const { toast } = useToast();
  const [pos, setPos] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [searching, setSearching] = reactExports.useState("");
  const [selectedPo, setSelectedPo] = reactExports.useState(null);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const fetchPOs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (project.client?.xero_contact_id) {
        params.append("xero_contact_id", project.client.xero_contact_id);
      }
      const response = await api.get(`/xero/purchase-orders?${params.toString()}`);
      setPos(response);
    } catch (err) {
      console.error("Failed to fetch POs:", err);
      setError(err.response?.data?.message || "Failed to load Purchase Orders from Xero.");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    if (open) {
      fetchPOs();
      setSelectedPo(null);
      setSearching("");
    }
  }, [open]);
  const handleSelect = async () => {
    if (!selectedPo) return;
    setIsSaving(true);
    try {
      const updatedProject = await projectService.update(String(project.id), {
        po_number: selectedPo.PurchaseOrderNumber
        // In the future we could sync currency/amount too
      });
      onSuccess(updatedProject);
      onOpenChange(false);
      toast({
        title: "PO Linked",
        description: `Purchase Order ${selectedPo.PurchaseOrderNumber} has been linked to this project.`
      });
    } catch (err) {
      console.error("Failed to link PO:", err);
      toast({
        title: "Error",
        description: "Failed to link Purchase Order.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  const filteredPos = pos.filter(
    (po) => po.PurchaseOrderNumber.toLowerCase().includes(searching.toLowerCase()) || po.Contact.Name.toLowerCase().includes(searching.toLowerCase()) || po.Reference && po.Reference.toLowerCase().includes(searching.toLowerCase())
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[500px] h-[600px] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Select Purchase Order" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Select a Purchase Order from Xero to link to this project." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative my-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Search by PO number, client, or reference...",
          className: "pl-8",
          value: searching,
          onChange: (e) => setSearching(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-hidden", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-10 w-10 text-destructive mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-destructive", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "mt-4", onClick: fetchPOs, children: "Try Again" })
    ] }) : filteredPos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-10 w-10 mb-2 opacity-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No available Purchase Orders found." }),
      project.client?.xero_contact_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs mt-1", children: [
        "Filtered by client: ",
        project.client.company_name
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full pr-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filteredPos.map((po) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent",
          selectedPo?.PurchaseOrderID === po.PurchaseOrderID ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
        ),
        onClick: () => setSelectedPo(po),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-sm", children: po.PurchaseOrderNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] py-0 h-4 bg-muted/50", children: po.Type })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: po.Contact.Name }),
            po.Reference && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] bg-muted px-1.5 py-0.5 rounded-full w-fit mt-1", children: [
              "Ref: ",
              po.Reference
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right flex flex-col items-end gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-sm", children: [
              po.CurrencyCode,
              " ",
              po.Total.toLocaleString(void 0, { minimumFractionDigits: 2 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: new Date(po.DateString).toLocaleDateString() }),
            selectedPo?.PurchaseOrderID === po.PurchaseOrderID && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-primary" })
          ] })
        ]
      },
      po.PurchaseOrderID
    )) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: handleSelect,
          disabled: !selectedPo || isSaving,
          children: [
            isSaving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
            "Link Selected PO"
          ]
        }
      )
    ] })
  ] }) });
}
function POViewDialog({ open, onOpenChange, url, poNumber }) {
  if (!url) return null;
  const isPDF = url.toLowerCase().includes(".pdf") || url.includes("data:application/pdf");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0 overflow-hidden",
      onPointerDownOutside: (e) => e.preventDefault(),
      onInteractOutside: (e) => e.preventDefault(),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "p-4 border-b flex flex-row items-center justify-between space-y-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "text-xl font-bold", children: [
            "Purchase Order ",
            poNumber ? `: ${poNumber}` : ""
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pr-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "h-8 gap-2",
                onClick: () => window.open(url, "_blank"),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
                  "Open in New Tab"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: url,
                download: true,
                className: "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
                  "Download"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-muted/30 relative flex items-center justify-center p-4", children: isPDF ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "iframe",
          {
            src: `${url}#view=FitH`,
            className: "w-full h-full rounded-md shadow-sm border bg-white",
            title: "PO Document Viewer"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full overflow-auto flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: url,
            alt: "PO Document",
            className: "max-w-full max-h-full object-contain rounded-md shadow-md bg-white"
          }
        ) }) })
      ]
    }
  ) });
}
function ProjectReportsTab({ project }) {
  const [reports, setReports] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [isUploadOpen, setIsUploadOpen] = reactExports.useState(false);
  const [editingReport, setEditingReport] = reactExports.useState(null);
  const [selectedReport, setSelectedReport] = reactExports.useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = reactExports.useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = reactExports.useState(false);
  const [approvalAction, setApprovalAction] = reactExports.useState("approve");
  const [comment, setComment] = reactExports.useState("");
  const [newComment, setNewComment] = reactExports.useState("");
  const [processing, setProcessing] = reactExports.useState(false);
  const { currentUser, activeRole } = useUser();
  const { toast } = useToast();
  reactExports.useEffect(() => {
    loadReports();
  }, [project.id]);
  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getReports(String(project.id));
      setReports(data);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title");
    const description = formData.get("description");
    const fileInput = e.currentTarget.querySelector('input[type="file"]');
    const file = fileInput.files?.[0];
    if (!title || !file && !editingReport) {
      toast({
        title: "Error",
        description: "Title and File are required.",
        variant: "destructive"
      });
      return;
    }
    try {
      setProcessing(true);
      if (editingReport) {
        await reportService.updateReport(String(editingReport.id), {
          title,
          description,
          report_file: file || void 0
        });
        toast({ title: "Updated", description: "Report has been updated and re-submitted." });
      } else {
        await reportService.uploadReport({
          project_id: String(project.id),
          title,
          description,
          report_file: file
        });
        toast({ title: "Submitted", description: "Report has been submitted for approval." });
      }
      setIsUploadOpen(false);
      setEditingReport(null);
      loadReports();
    } catch (error) {
      console.error("Failed to process report:", error);
      toast({ title: "Error", description: "Failed to process the report.", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };
  const handleAction = async () => {
    if (!selectedReport) return;
    if (approvalAction === "reject" && !comment) {
      toast({ title: "Required", description: "Comment is required for rejection.", variant: "destructive" });
      return;
    }
    try {
      setProcessing(true);
      const isHR = activeRole === "hr" || activeRole === "admin";
      const isTL = activeRole === "team-lead";
      if (approvalAction === "reject") {
        await reportService.reject(String(selectedReport.id), comment);
        toast({ title: "Rejected", description: "Report has been rejected." });
      } else {
        if (isHR) {
          await reportService.hrApprove(String(selectedReport.id), comment);
          toast({ title: "Approved", description: "Report has been given final approval." });
        } else if (isTL) {
          await reportService.tlApprove(String(selectedReport.id), comment);
          toast({ title: "Approved", description: "Report has been approved by Team Lead." });
        }
      }
      setIsApprovalOpen(false);
      setComment("");
      loadReports();
      if (isDetailsOpen) {
        const updated = await reportService.getReport(String(selectedReport.id));
        setSelectedReport(updated);
      }
    } catch (error) {
      console.error("Failed to process action:", error);
      toast({ title: "Error", description: "Failed to process approval.", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };
  const handleAddComment = async () => {
    if (!selectedReport || !newComment) return;
    try {
      setProcessing(true);
      await reportService.addComment(String(selectedReport.id), newComment);
      setNewComment("");
      const updated = await reportService.getReport(String(selectedReport.id));
      setSelectedReport(updated);
      loadReports();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setProcessing(false);
    }
  };
  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return { color: "bg-green-500", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 mr-1" }), label: "Approved" };
      case "tl_approved":
        return { color: "bg-indigo-500", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 mr-1" }), label: "Pending Review from HR" };
      case "submitted":
        return { color: "bg-blue-500", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 mr-1 animate-spin" }), label: "Pending Review From Team Lead" };
      case "rejected":
        return { color: "bg-red-500", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3 mr-1" }), label: "Rejected" };
      default:
        return { color: "bg-gray-500", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3 mr-1" }), label: "Draft" };
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 text-indigo-500" }),
            "Project Reports"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Manage and track report approvals for this project." })
        ] }),
        (activeRole === "user" || activeRole === "account-manager") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditingReport(null);
          setIsUploadOpen(true);
        }, className: "bg-indigo-600 hover:bg-indigo-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4 mr-2" }),
          "Upload Report"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : reports.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border-2 border-dashed rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-12 w-12 text-muted-foreground/30 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No reports uploaded yet." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4", children: reports.map((report) => {
        const config = getStatusConfig(report.status);
        const isHR = activeRole === "hr" || activeRole === "admin";
        const isTL = activeRole === "team-lead" && String(report.user?.department_id) === String(currentUser?.department);
        const canApprove = isTL && report.status === "submitted" || isHR && report.status === "tl_approved";
        const isOwner = String(report.user_id) === String(currentUser?.id);
        const canEdit = isOwner && report.status !== "approved";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 p-4 rounded-lg bg-background border hover:border-indigo-300 transition-colors cursor-pointer", onClick: () => {
          setSelectedReport(report);
          setIsDetailsOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold truncate", children: report.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: cn(config.color, "text-white whitespace-nowrap"), children: [
                config.icon,
                " ",
                config.label
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "by ",
                report.user?.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: format(new Date(report.created_at), "MMMM d, yyyy") })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            canApprove && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 border-r pr-2 mr-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-8 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20", onClick: (e) => {
                e.stopPropagation();
                setSelectedReport(report);
                setApprovalAction("reject");
                setIsApprovalOpen(true);
              }, title: "Reject", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-8 border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20", onClick: (e) => {
                e.stopPropagation();
                setSelectedReport(report);
                setApprovalAction("approve");
                setIsApprovalOpen(true);
              }, title: "Approve", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", className: "h-8 text-indigo-400 hover:text-indigo-600", onClick: (e) => {
              e.stopPropagation();
              setSelectedReport(report);
              setIsDetailsOpen(true);
            }, title: "View Details & Comments", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4 mr-1" }),
              report.activities?.length || 0
            ] }),
            canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", onClick: (e) => {
              e.stopPropagation();
              setEditingReport(report);
              setIsUploadOpen(true);
            }, title: "Edit Report", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", asChild: true, onClick: (e) => e.stopPropagation(), title: "Download", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: report.file_url || "#", target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }) }) })
          ] })
        ] }, report.id);
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isUploadOpen, onOpenChange: setIsUploadOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "sm:max-w-[500px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleUpload, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingReport ? "Edit Report" : "Upload New Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editingReport ? "Modifying a report after Team Lead approval will restart the approval process." : "Submit a report for approval. It will go to the Team Lead first." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "title", children: "Report Title *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "title", name: "title", defaultValue: editingReport?.title, placeholder: "e.g., Monthly Digital Marketing Report - March", required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "description", children: "Description (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "description", name: "description", defaultValue: editingReport?.description || "", placeholder: "Add any details or context..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "report_file", children: [
            "Report File ",
            editingReport ? "(Optional if keeping same file)" : "*"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "report_file", type: "file", required: !editingReport, className: "file:bg-indigo-50 file:text-indigo-600" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setIsUploadOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: processing, className: "bg-indigo-600 hover:bg-indigo-700", children: [
          processing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4 mr-2" }),
          editingReport ? "Update & Re-Submit" : "Submit for Approval"
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDetailsOpen, onOpenChange: setIsDetailsOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "sm:max-w-[700px] max-h-[85vh] flex flex-col p-0", children: selectedReport && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 pb-4 border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-xl mb-1", children: selectedReport.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "by ",
                selectedReport.user?.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Project: ",
                project.name
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: cn(getStatusConfig(selectedReport.status).color, "text-white"), children: getStatusConfig(selectedReport.status).label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "flex-1", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: selectedReport.file_url || "#", target: "_blank", rel: "noreferrer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-2" }),
            " Download Report"
          ] }) }),
          (activeRole === "team-lead" && selectedReport.status === "submitted" && String(selectedReport.user?.department_id) === String(currentUser?.department) || (activeRole === "hr" || activeRole === "admin") && selectedReport.status === "tl_approved") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-red-600 h-9", onClick: () => {
              setApprovalAction("reject");
              setIsApprovalOpen(true);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 mr-1" }),
              " Reject"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "bg-indigo-600 hover:bg-indigo-700 h-9", onClick: () => {
              setApprovalAction("approve");
              setIsApprovalOpen(true);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 mr-1" }),
              " Approve"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-8", children: [
        selectedReport.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm bg-muted/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-950", children: selectedReport.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-3 w-3" }),
            " Approval History & Comments"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: selectedReport.activities?.map((activity) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative pl-6 pb-4 border-l-2 border-muted last:pb-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
              "absolute left-[-9px] top-0 h-4 w-4 rounded-full border-2 border-background",
              activity.activity_type === "status_change" ? "bg-indigo-500" : "bg-gray-400"
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: activity.user.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: format(new Date(activity.created_at), "MMM d, h:mm a") })
            ] }),
            activity.activity_type === "status_change" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] h-4 px-1 leading-none", children: activity.from_status || "Draft" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "→" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] h-4 px-1 leading-none border-indigo-200 text-indigo-600", children: activity.to_status })
            ] }),
            activity.comment && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-1 italic", children: [
              '"',
              activity.comment,
              '"'
            ] })
          ] }, activity.id)) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t bg-muted/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Add a comment...",
            value: newComment,
            onChange: (e) => setNewComment(e.target.value),
            onKeyPress: (e) => e.key === "Enter" && handleAddComment()
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", disabled: !newComment || processing, onClick: handleAddComment, children: processing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-white" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4" }) })
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isApprovalOpen, onOpenChange: setIsApprovalOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[400px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: cn(approvalAction === "approve" ? "text-green-600" : "text-red-600"), children: approvalAction === "approve" ? "Approve Report" : "Reject Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: approvalAction === "approve" ? "Add an optional comment for your approval." : "Please provide a reason for the rejection. The staff user will be able to see this and resubmit." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          placeholder: "Add your comments here...",
          value: comment,
          onChange: (e) => setComment(e.target.value),
          className: "min-h-[100px]"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setIsApprovalOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: approvalAction === "approve" ? "default" : "destructive",
            className: cn(approvalAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""),
            onClick: handleAction,
            disabled: processing || approvalAction === "reject" && !comment,
            children: [
              processing && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }),
              approvalAction === "approve" ? "Confirm Approval" : "Confirm Rejection"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
const projectExpenseService = {
  async list(projectId) {
    return await api.get(`/projects/${projectId}/expenses`);
  },
  async create(projectId, data) {
    const form = new FormData();
    form.append("type", data.type);
    form.append("amount", String(data.amount));
    form.append("expense_date", data.expense_date);
    if (data.currency) form.append("currency", data.currency);
    if (data.description) form.append("description", data.description);
    if (data.supplier_id != null) form.append("supplier_id", String(data.supplier_id));
    if (data.is_reimbursable != null) form.append("is_reimbursable", data.is_reimbursable ? "1" : "0");
    if (data.receipt) form.append("receipt", data.receipt);
    return await api.post(`/projects/${projectId}/expenses`, form);
  },
  async update(projectId, expenseId, data) {
    const form = new FormData();
    if (data.type !== void 0) form.append("type", data.type);
    if (data.amount !== void 0) form.append("amount", String(data.amount));
    if (data.currency !== void 0) form.append("currency", data.currency);
    if (data.description !== void 0) form.append("description", data.description);
    if (data.expense_date !== void 0) form.append("expense_date", data.expense_date);
    if (data.supplier_id != null) form.append("supplier_id", String(data.supplier_id));
    if (data.is_reimbursable != null) form.append("is_reimbursable", data.is_reimbursable ? "1" : "0");
    if (data.reimbursement_noted != null) form.append("reimbursement_noted", data.reimbursement_noted ? "1" : "0");
    if (data.receipt) form.append("receipt", data.receipt);
    return await api.post(`/projects/${projectId}/expenses/${expenseId}`, form);
  },
  async approve(projectId, expenseId) {
    return await api.post(`/projects/${projectId}/expenses/${expenseId}/approve`, {});
  },
  async reject(projectId, expenseId, reason) {
    return await api.post(`/projects/${projectId}/expenses/${expenseId}/reject`, { reason });
  },
  async delete(projectId, expenseId) {
    await api.delete(`/projects/${projectId}/expenses/${expenseId}`);
  },
  async markReimbursementNoted(projectId, expenseId) {
    return this.update(projectId, expenseId, { reimbursement_noted: true });
  }
};
class JothikaService {
  /**
   * Check if current user has a valid Jothika token
   */
  async getTokenStatus() {
    return await api.get("/api/jothika/token/status");
  }
  /**
   * Store a Jothika API token for current user
   */
  async storeToken(token, expiresAt) {
    return await api.post("/api/jothika/token", {
      token,
      expires_at: expiresAt
    });
  }
  /**
   * Revoke/disconnect Jothika token for current user
   */
  async revokeToken() {
    return await api.delete("/api/jothika/token");
  }
  /**
   * Create a reimbursement in Jothika from a project expense
   */
  async createReimbursementFromExpense(projectId, expenseId) {
    return await api.post(
      "/api/jothika/reimbursement/create-from-expense",
      {
        project_id: projectId,
        expense_id: expenseId
      }
    );
  }
  /**
   * Create a custom reimbursement in Jothika
   */
  async createReimbursement(data) {
    return await api.post("/api/jothika/reimbursement", data);
  }
}
const jothikaService = new JothikaService();
function JothikaReimbursementModal({
  open,
  onClose,
  expense,
  clientName,
  projectId,
  onNoted
}) {
  const { toast } = useToast();
  const [hasToken, setHasToken] = reactExports.useState(null);
  const [isCreating, setIsCreating] = reactExports.useState(false);
  const [isCheckingToken, setIsCheckingToken] = reactExports.useState(false);
  const [showTokenInput, setShowTokenInput] = reactExports.useState(false);
  const [tokenInput, setTokenInput] = reactExports.useState("");
  const [isSavingToken, setIsSavingToken] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (open) {
      checkTokenStatus();
    }
  }, [open]);
  const checkTokenStatus = async () => {
    setIsCheckingToken(true);
    try {
      const status = await jothikaService.getTokenStatus();
      setHasToken(status.has_token && status.is_valid);
    } catch (error) {
      console.error("Failed to check token status:", error);
      setHasToken(false);
    } finally {
      setIsCheckingToken(false);
    }
  };
  const handleSaveToken = async () => {
    if (!tokenInput.trim()) {
      toast({
        title: "Token required",
        description: "Please enter your Jothika API token",
        variant: "destructive"
      });
      return;
    }
    setIsSavingToken(true);
    try {
      await jothikaService.storeToken(tokenInput.trim());
      toast({
        title: "Connected",
        description: "Jothika account connected successfully"
      });
      setHasToken(true);
      setShowTokenInput(false);
      setTokenInput("");
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error.response?.data?.message || "Failed to connect Jothika account",
        variant: "destructive"
      });
    } finally {
      setIsSavingToken(false);
    }
  };
  const handleCreateReimbursement = async () => {
    setIsCreating(true);
    try {
      const response = await jothikaService.createReimbursementFromExpense(projectId, expense.id);
      toast({
        title: "Success",
        description: `Reimbursement created in Jothika (ID: ${response.jothika_id})`
      });
      const updated = await projectExpenseService.markReimbursementNoted(projectId, expense.id);
      onNoted(updated);
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to create reimbursement";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
      if (errorMsg.includes("token") || errorMsg.includes("connect")) {
        setHasToken(false);
      }
    } finally {
      setIsCreating(false);
    }
  };
  const handleOpenJothika = () => {
    window.open("https://jothika.artslabcreatives.com", "_blank", "noopener,noreferrer");
  };
  const handleMarkNoted = async () => {
    try {
      const updated = await projectExpenseService.markReimbursementNoted(projectId, expense.id);
      onNoted(updated);
      toast({ title: "Noted", description: "Reimbursement reminder dismissed." });
      onClose();
    } catch {
      toast({ title: "Error", description: "Failed to save status.", variant: "destructive" });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-5 w-5 text-amber-500" }),
        "Create Reimbursement in Jothika"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This expense was paid personally. Create a reimbursement entry in Jothika automatically." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-muted/40 p-3 space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
            expense.currency,
            " ",
            parseFloat(expense.amount).toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize", children: expense.type })
        ] }),
        expense.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground shrink-0", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-right text-xs", children: expense.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Client" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3 w-3" }),
            clientName
          ] })
        ] })
      ] }),
      isCheckingToken ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "Checking connection..." })
      ] }) : hasToken === false ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: "Connect your Jothika account to automatically create reimbursements" })
        ] }),
        showTokenInput ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "token", children: "Jothika API Token" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "token",
                type: "password",
                placeholder: "Paste your token here",
                value: tokenInput,
                onChange: (e) => setTokenInput(e.target.value)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Get your token from Jothika → Settings → API Tokens" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                onClick: handleSaveToken,
                disabled: isSavingToken,
                className: "flex-1",
                children: [
                  isSavingToken ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : null,
                  "Connect Account"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => setShowTokenInput(false),
                children: "Cancel"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: () => setShowTokenInput(true),
            className: "w-full",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4 mr-2" }),
              "Connect Jothika Account"
            ]
          }
        )
      ] }) : hasToken === true ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { className: "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-600 dark:text-green-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { className: "text-green-800 dark:text-green-200", children: "Ready to create reimbursement automatically" })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex-col sm:flex-row gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          onClick: handleMarkNoted,
          className: "sm:order-1",
          size: "sm",
          children: "Skip / Already done"
        }
      ),
      hasToken ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleCreateReimbursement,
          disabled: isCreating,
          className: "sm:order-2",
          children: isCreating ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
            "Creating..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 mr-2" }),
            "Create Reimbursement"
          ] })
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: handleOpenJothika,
          variant: "outline",
          className: "sm:order-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 mr-2" }),
            "Open Jothika Manually"
          ]
        }
      )
    ] })
  ] }) });
}
const APPROVER_ROLES = ["admin", "hr", "team_lead"];
const TYPE_ICONS = {
  receipt: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4" }),
  expense: /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4" }),
  invoice: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" })
};
const STATUS_CONFIG = {
  pending: { label: "Pending Approval", variant: "secondary", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }) },
  approved: { label: "Approved", variant: "default", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }) },
  rejected: { label: "Rejected", variant: "destructive", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }) }
};
const DEFAULT_FORM = {
  type: "expense",
  amount: "",
  currency: "LKR",
  description: "",
  expense_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
  supplier_id: "",
  is_reimbursable: false,
  receipt: null
};
function ProjectFinanceTab({ project, onBudgetUpdate }) {
  const { currentUser, activeRole } = useUser();
  const { toast } = useToast();
  const [expenses, setExpenses] = reactExports.useState([]);
  const [budget, setBudget] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editExpense, setEditExpense] = reactExports.useState(null);
  const [deleteExpense, setDeleteExpense] = reactExports.useState(null);
  const [rejectExpense, setRejectExpense] = reactExports.useState(null);
  const [rejectReason, setRejectReason] = reactExports.useState("");
  const [jothikaExpense, setJothikaExpense] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [editingBudget, setEditingBudget] = reactExports.useState(false);
  const [budgetInput, setBudgetInput] = reactExports.useState("");
  const fileInputRef = reactExports.useRef(null);
  const isApprover = currentUser && APPROVER_ROLES.includes(activeRole);
  const clientName = project.client?.company_name ?? "Client";
  const load = async () => {
    setLoading(true);
    try {
      const data = await projectExpenseService.list(project.id);
      setExpenses(data.expenses);
      setBudget(data.budget);
    } catch {
      toast({ title: "Error", description: "Failed to load expenses.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    load();
  }, [project.id]);
  const checkReimbursable = (expense) => {
    if (expense.is_reimbursable && !expense.reimbursement_noted && expense.status === "approved") {
      setJothikaExpense(expense);
    }
  };
  const saveBudget = async () => {
    const val = budgetInput === "" ? null : parseFloat(budgetInput);
    try {
      await __vitePreload(async () => {
        const { api: api2 } = await import("./index-C4ZP3eFM.js").then((n) => n.ch);
        return { api: api2 };
      }, true ? __vite__mapDeps([0,1]) : void 0).then(
        ({ api: api2 }) => api2.put(`/projects/${project.id}`, { budget_allocated: val })
      );
      setBudget((prev) => prev ? { ...prev, allocated: val !== null ? String(val) : null } : prev);
      onBudgetUpdate?.(val);
      setEditingBudget(false);
      toast({ title: "Budget updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update budget.", variant: "destructive" });
    }
  };
  const handleSubmit = async () => {
    if (!form.amount || !form.expense_date || !form.type) {
      toast({ title: "Validation", description: "Amount, date and type are required.", variant: "destructive" });
      return;
    }
    if (!form.receipt && !editExpense?.receipt_file_url) {
      toast({ title: "Validation", description: "Receipt/Document is mandatory.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      if (editExpense) {
        const updated = await projectExpenseService.update(project.id, editExpense.id, {
          type: form.type,
          amount: parseFloat(form.amount),
          currency: form.currency,
          description: form.description,
          expense_date: form.expense_date,
          supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
          is_reimbursable: form.is_reimbursable,
          receipt: form.receipt
        });
        setExpenses((prev) => prev.map((e) => e.id === updated.id ? updated : e));
        toast({ title: "Expense updated" });
      } else {
        const created = await projectExpenseService.create(project.id, {
          type: form.type,
          amount: parseFloat(form.amount),
          currency: form.currency,
          description: form.description,
          expense_date: form.expense_date,
          supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
          is_reimbursable: form.is_reimbursable,
          receipt: form.receipt
        });
        setExpenses((prev) => [created, ...prev]);
        checkReimbursable(created);
        toast({ title: created.status === "approved" ? "Expense added & approved" : "Expense submitted for approval" });
      }
      const data = await projectExpenseService.list(project.id);
      setBudget(data.budget);
      setAddOpen(false);
      setEditExpense(null);
      setForm(DEFAULT_FORM);
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Failed to save expense.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };
  const openEdit = (expense) => {
    setEditExpense(expense);
    setForm({
      type: expense.type,
      amount: expense.amount,
      currency: expense.currency,
      description: expense.description ?? "",
      expense_date: expense.expense_date,
      supplier_id: expense.supplier_id ? String(expense.supplier_id) : "",
      is_reimbursable: expense.is_reimbursable,
      receipt: null
    });
    setAddOpen(true);
  };
  const handleApprove = async (expense) => {
    try {
      const updated = await projectExpenseService.approve(project.id, expense.id);
      setExpenses((prev) => prev.map((e) => e.id === updated.id ? updated : e));
      const data = await projectExpenseService.list(project.id);
      setBudget(data.budget);
      toast({ title: "Expense approved" });
      checkReimbursable(updated);
    } catch {
      toast({ title: "Error", description: "Failed to approve.", variant: "destructive" });
    }
  };
  const handleReject = async () => {
    if (!rejectExpense) return;
    try {
      const updated = await projectExpenseService.reject(project.id, rejectExpense.id, rejectReason);
      setExpenses((prev) => prev.map((e) => e.id === updated.id ? updated : e));
      toast({ title: "Expense rejected" });
      setRejectExpense(null);
      setRejectReason("");
    } catch {
      toast({ title: "Error", description: "Failed to reject.", variant: "destructive" });
    }
  };
  const handleDelete = async () => {
    if (!deleteExpense) return;
    try {
      await projectExpenseService.delete(project.id, deleteExpense.id);
      setExpenses((prev) => prev.filter((e) => e.id !== deleteExpense.id));
      const data = await projectExpenseService.list(project.id);
      setBudget(data.budget);
      toast({ title: "Expense deleted" });
      setDeleteExpense(null);
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };
  const budgetProgress = () => {
    if (!budget?.allocated || !budget?.spent) return 0;
    const pct = parseFloat(budget.spent) / parseFloat(budget.allocated) * 100;
    return Math.min(pct, 100);
  };
  const budgetOverrun = budget?.allocated && budget?.spent ? parseFloat(budget.spent) > parseFloat(budget.allocated) : false;
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-24 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4" }),
          "Budget"
        ] }),
        isApprover && !editingBudget && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => {
          setBudgetInput(budget?.allocated ?? "");
          setEditingBudget(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3 mr-1" }),
          " Set budget"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        editingBudget ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: "0",
              placeholder: "Allocated budget",
              value: budgetInput,
              onChange: (e) => setBudgetInput(e.target.value),
              className: "w-44"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: saveBudget, children: "Save" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setEditingBudget(false), children: "Cancel" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs mb-0.5", children: "Allocated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-lg", children: budget?.allocated ? `${project.currency ?? "LKR"} ${parseFloat(budget.allocated).toLocaleString(void 0, { minimumFractionDigits: 2 })}` : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs mb-0.5", children: "Spent (approved)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `font-semibold text-lg ${budgetOverrun ? "text-destructive" : ""}`, children: [
              project.currency ?? "LKR",
              " ",
              parseFloat(budget?.spent ?? "0").toLocaleString(void 0, { minimumFractionDigits: 2 })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs mb-0.5", children: "Remaining" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-semibold text-lg ${budgetOverrun ? "text-destructive" : "text-green-600 dark:text-green-400"}`, children: budget?.remaining != null ? `${project.currency ?? "LKR"} ${parseFloat(budget.remaining).toLocaleString(void 0, { minimumFractionDigits: 2 })}` : "—" })
          ] })
        ] }),
        budget?.allocated && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: budgetProgress(), className: budgetOverrun ? "[&>div]:bg-destructive" : "" }),
          budgetOverrun && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-destructive flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
            " Budget exceeded"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider", children: "Financial Entries" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setForm(DEFAULT_FORM);
          setEditExpense(null);
          setAddOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          " Add Entry"
        ] })
      ] }),
      expenses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-10 text-muted-foreground border rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No financial entries yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "Add a receipt, expense, or invoice below" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: expenses.map((expense) => {
        const statusCfg = STATUS_CONFIG[expense.status];
        const canApproveReject = isApprover && expense.status === "pending";
        const canEdit = isApprover || String(expense.submitted_by) === String(currentUser?.id) && expense.status === "pending";
        const canDelete = isApprover || String(expense.submitted_by) === String(currentUser?.id) && expense.status === "pending";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 border rounded-lg p-3 hover:bg-muted/30 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground mt-0.5", children: TYPE_ICONS[expense.type] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm capitalize", children: expense.type }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: statusCfg.variant, className: "text-xs flex items-center gap-1 px-1.5", children: [
                statusCfg.icon,
                statusCfg.label
              ] }),
              expense.is_reimbursable && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs text-amber-600 border-amber-300", children: "Reimbursable" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold mt-0.5", children: [
              expense.currency,
              " ",
              parseFloat(expense.amount).toLocaleString(void 0, { minimumFractionDigits: 2 })
            ] }),
            expense.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: expense.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(expense.expense_date).toLocaleDateString() }),
              expense.supplier && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3 w-3" }),
                expense.supplier.company_name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "by ",
                expense.submitted_by_user?.name ?? "—"
              ] }),
              expense.receipt_file_url && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: expense.receipt_file_url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "flex items-center gap-1 text-primary hover:underline",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-3 w-3" }),
                    " Receipt"
                  ]
                }
              )
            ] }),
            expense.status === "rejected" && expense.rejection_reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-destructive mt-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
              " ",
              expense.rejection_reason
            ] }),
            expense.is_reimbursable && expense.status === "approved" && !expense.reimbursement_noted && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setJothikaExpense(expense),
                className: "text-xs text-amber-600 hover:underline mt-1 flex items-center gap-1",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
                  " Create reimbursement in Jothika"
                ]
              }
            )
          ] }),
          (canApproveReject || canEdit || canDelete) && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
              canApproveReject && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => handleApprove(expense), className: "text-green-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 mr-2" }),
                  " Approve"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => {
                  setRejectExpense(expense);
                  setRejectReason("");
                }, className: "text-destructive", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 mr-2" }),
                  " Reject"
                ] })
              ] }),
              canEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => openEdit(expense), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4 mr-2" }),
                " Edit"
              ] }),
              canDelete && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setDeleteExpense(expense), className: "text-destructive", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                " Delete"
              ] })
            ] })
          ] })
        ] }, expense.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (open) => {
      if (!open) {
        setAddOpen(false);
        setEditExpense(null);
        setForm(DEFAULT_FORM);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editExpense ? "Edit Entry" : "Add Financial Entry" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editExpense ? "Update this expense entry." : "Add a receipt, expense, or invoice to this project." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.type, onValueChange: (v) => setForm((f) => ({ ...f, type: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "receipt", children: "Receipt" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "expense", children: "Expense" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "invoice", children: "Invoice" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Currency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.currency, onValueChange: (v) => setForm((f) => ({ ...f, currency: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LKR", children: "LKR" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "USD", children: "USD" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "AUD", children: "AUD" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "GBP", children: "GBP" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "EUR", children: "EUR" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "SGD", children: "SGD" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Amount *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: "0.01",
                step: "0.01",
                placeholder: "0.00",
                value: form.amount,
                onChange: (e) => setForm((f) => ({ ...f, amount: e.target.value }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: form.expense_date,
                onChange: (e) => setForm((f) => ({ ...f, expense_date: e.target.value }))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              placeholder: "What is this expense for?",
              rows: 2,
              value: form.description,
              onChange: (e) => setForm((f) => ({ ...f, description: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Receipt / Document *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: fileInputRef,
                type: "file",
                accept: ".jpg,.jpeg,.png,.pdf,.webp,.heic",
                className: "hidden",
                onChange: (e) => setForm((f) => ({ ...f, receipt: e.target.files?.[0] ?? null }))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", type: "button", onClick: () => fileInputRef.current?.click(), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4 mr-2" }),
              form.receipt ? form.receipt.name : editExpense?.receipt_file_url ? "Replace file" : "Upload file"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "is_reimbursable",
              type: "checkbox",
              className: "rounded border",
              checked: form.is_reimbursable,
              onChange: (e) => setForm((f) => ({ ...f, is_reimbursable: e.target.checked }))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "is_reimbursable", className: "cursor-pointer", children: "I paid this personally (reimbursable)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditExpense(null);
          setForm(DEFAULT_FORM);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSubmit, disabled: submitting, children: [
          submitting && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
          editExpense ? "Save Changes" : "Add Entry"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!rejectExpense, onOpenChange: (open) => {
      if (!open) setRejectExpense(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Reject Expense" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Optionally provide a reason for rejection." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          placeholder: "Reason (optional)",
          value: rejectReason,
          onChange: (e) => setRejectReason(e.target.value),
          rows: 3
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setRejectExpense(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: handleReject, children: "Reject" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleteExpense, onOpenChange: (open) => {
      if (!open) setDeleteExpense(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Expense?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This action cannot be undone. The expense entry will be permanently removed." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDelete, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete" })
      ] })
    ] }) }),
    jothikaExpense && /* @__PURE__ */ jsxRuntimeExports.jsx(
      JothikaReimbursementModal,
      {
        open: !!jothikaExpense,
        onClose: () => setJothikaExpense(null),
        expense: jothikaExpense,
        clientName,
        projectId: project.id,
        onNoted: (updated) => {
          setExpenses((prev) => prev.map((e) => e.id === updated.id ? updated : e));
          setJothikaExpense(null);
        }
      }
    )
  ] });
}
const projectAttachmentService = {
  async uploadFile(projectId, file) {
    const [attachment] = await uploadManager.attachFilesToProject(projectId, [file]);
    return attachment;
  },
  async uploadFiles(projectId, files) {
    return uploadManager.attachFilesToProject(projectId, files);
  },
  async addLink(projectId, name, url) {
    const response = await api$1.post(`/projects/${projectId}/attachments`, {
      name,
      url,
      type: "link"
    });
    return this.mapAttachment(response.data);
  },
  async delete(attachmentId) {
    await api$1.delete(`/project-attachments/${attachmentId}`);
  },
  mapAttachment(raw) {
    return {
      id: String(raw.id),
      name: raw.name,
      url: raw.url,
      type: raw.type,
      uploadedAt: raw.uploaded_at || raw.created_at
    };
  }
};
export {
  ProjectReportsTab as P,
  POSelectDialog as a,
  POViewDialog as b,
  ProjectFinanceTab as c,
  projectAttachmentService as p
};
