import { l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, aw as ShieldCheck, N as DialogTitle, O as DialogDescription, Q as Label, I as Input, ae as Textarea, U as DialogFooter, B as Button, aj as FileText, v as useUser, F as useToast, L as LoaderCircle, af as Upload, a as CircleCheck, Y as Badge, C as CircleAlert, x as projectService, ax as api, S as Skeleton, T as TrendingUp, ay as ClipboardList, G as Search, A as ScrollArea, z as cn, a2 as Trash2, P as Plus, u as useNavigate, aq as Lock, az as TriangleAlert, aA as Progress, aB as Building2, aC as Mail, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription, a8 as AlertDialogFooter, a9 as AlertDialogCancel, aa as AlertDialogAction, H as useParams, w as taskService } from "./index-C4ZP3eFM.js";
import { c as ProjectFinanceTab, P as ProjectReportsTab, a as POSelectDialog, b as POViewDialog, p as projectAttachmentService } from "./projectAttachmentService-EW5IPKYC.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-5_9pbgKs.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { P as Package, I as InvoiceList, a as InvoiceUploadDialog, b as InvoiceViewDialog, i as invoiceService } from "./InvoiceList-a4nBPcEP.js";
import { D as Download } from "./download-qf94484n.js";
import { A as Alert, a as AlertDescription } from "./alert-ZV6Vs13A.js";
import { D as DollarSign } from "./receipt-BPWO68lI.js";
import { C as Clock } from "./clock-C-1UQMq-.js";
import { T as TrendingDown } from "./trending-down-DJZzQmVx.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-DRavPKwG.js";
import { A as ArrowLeft } from "./arrow-left-84kdjEmA.js";
import { I as Info } from "./info-BO35z3vl.js";
import { T as Truck, P as Phone } from "./truck-wtuWzB4V.js";
import { B as Ban } from "./ban-CxrDCq8f.js";
import { C as Calendar } from "./calendar-B2-LyEnc.js";
import { G as Globe } from "./globe-CuQXKfU6.js";
import { L as Link } from "./link-CjUUS0B-.js";
import "./reportService-DNtsOblX.js";
import "./format-BDODTvac.js";
import "./link-2-qOcW-qoJ.js";
import "./paperclip-DDW-rwXv.js";
import "./circle-x-BkjZsnQk.js";
import "./index-D6Uc8srH.js";
import "./checkbox-qHm_4cmk.js";
import "./file-DZtoCEiO.js";
import "./cloud-upload-CSttdRmy.js";
import "./circle-check-big-Cwck6DPV.js";
function GracePeriodDialog({
  open,
  onOpenChange,
  onSave,
  currentExpiresAt,
  currentNotes
}) {
  const [expiresAt, setExpiresAt] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (open) {
      setExpiresAt(currentExpiresAt ? currentExpiresAt.split("T")[0] : "");
      setNotes(currentNotes ?? "");
    }
  }, [open, currentExpiresAt, currentNotes]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(expiresAt, notes);
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "sm:max-w-[440px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-5 w-5 text-amber-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Authorize Grace Period" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Grant a temporary grace period allowing this project to proceed without a Purchase Order. This action requires Finance role authorization." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4 px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "expires_at", children: "Grace Period Expiry Date *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "expires_at",
            type: "date",
            value: expiresAt,
            onChange: (e) => setExpiresAt(e.target.value),
            min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            required: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Work may proceed until this date without a PO on file." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "grace_notes", children: "Authorization Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "grace_notes",
            value: notes,
            onChange: (e) => setNotes(e.target.value),
            placeholder: "Reason for granting grace period (e.g. verbal confirmation from client)",
            rows: 3
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "bg-amber-500 hover:bg-amber-600", children: "Authorize Grace Period" })
    ] })
  ] }) }) });
}
function ProvisionalPODialog({
  open,
  onOpenChange,
  onSave,
  projectName,
  currentPoNumber,
  currentExpiresAt
}) {
  const [poNumber, setPoNumber] = reactExports.useState("");
  const [expiresAt, setExpiresAt] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (open) {
      setPoNumber(currentPoNumber ?? "");
      setExpiresAt(currentExpiresAt ? currentExpiresAt.split("T")[0] : "");
    }
  }, [open, currentPoNumber, currentExpiresAt]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(poNumber, expiresAt);
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "sm:max-w-[440px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 text-blue-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Generate Provisional PO" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: projectName ? `Issue a provisional Purchase Order for "${projectName}" to allow work to continue while awaiting the official PO.` : "Issue a provisional Purchase Order to allow work to continue while awaiting the official PO." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4 px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prov_po_number", children: "Provisional PO Number *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "prov_po_number",
            value: poNumber,
            onChange: (e) => setPoNumber(e.target.value),
            placeholder: "PROV-2026-001",
            required: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "This temporary reference will be used until the official PO is received." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "prov_expires_at", children: "Expiry Date *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "prov_expires_at",
            type: "date",
            value: expiresAt,
            onChange: (e) => setExpiresAt(e.target.value),
            min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            required: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "If the official PO is not received by this date, the project will be re-evaluated." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "bg-blue-600 hover:bg-blue-700", children: "Issue Provisional PO" })
    ] })
  ] }) }) });
}
function CampaignReportSection({ project, onSuccess }) {
  const [uploading, setUploading] = reactExports.useState(false);
  const [approving, setApproving] = reactExports.useState(false);
  const { currentUser, activeRole } = useUser();
  const { toast } = useToast();
  const isDigitalMarketing = project.department?.name === "Digital Marketing";
  if (!isDigitalMarketing) return null;
  const isDigitalTeam = project.department?.name === "Digital Marketing";
  const isHR = activeRole === "hr" || currentUser?.department === "HR";
  const isAdmin = activeRole === "admin";
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const updatedProject = await projectService.uploadCampaignReport(String(project.id), file);
      onSuccess(updatedProject);
      toast({
        title: "Report Uploaded",
        description: "Campaign report has been uploaded and is pending approval."
      });
    } catch (error) {
      console.error("Failed to upload report:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload the campaign report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  const handleApprove = async () => {
    setApproving(true);
    try {
      const updatedProject = await projectService.approveCampaignReport(String(project.id));
      onSuccess(updatedProject);
      toast({
        title: "Report Approved",
        description: "Campaign report has been approved. Invoice functionality is now enabled."
      });
    } catch (error) {
      console.error("Failed to approve report:", error);
      toast({
        title: "Approval Failed",
        description: "Failed to approve the campaign report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setApproving(false);
    }
  };
  const getStatusBadge = () => {
    switch (project.campaign_report_status) {
      case "approved":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-green-500 hover:bg-green-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 mr-1" }),
          " Approved"
        ] });
      case "pending":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-orange-500 hover:bg-orange-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3 mr-1" }),
          " Pending Approval"
        ] });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Not Uploaded" });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 text-indigo-500" }),
          "Campaign Report"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "A campaign report is required before invoices can be processed for Digital Marketing projects." })
      ] }),
      getStatusBadge()
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-4", children: [
      project.campaign_report_document_url ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center gap-3 p-3 rounded-md bg-background border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: "Campaign Report Document" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: project.campaign_report_approved_at ? `Approved on ${new Date(project.campaign_report_approved_at).toLocaleDateString()}` : "Uploaded, awaiting approval" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: project.campaign_report_document_url, target: "_blank", rel: "noreferrer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-2" }),
          " Download"
        ] }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-center py-6 border-2 border-dashed rounded-md border-indigo-200 dark:border-indigo-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "No report uploaded yet" }),
        isDigitalTeam && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              id: "report-upload",
              className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer",
              onChange: handleFileUpload,
              disabled: uploading
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "border-indigo-400 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50", disabled: uploading, children: [
            uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4 mr-2" }),
            "Upload Report"
          ] })
        ] })
      ] }),
      project.campaign_report_status === "pending" && (isAdmin || isHR) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: handleApprove,
          disabled: approving,
          className: "bg-indigo-600 hover:bg-indigo-700 text-white shrink-0",
          children: [
            approving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 mr-2" }),
            "Approve Report"
          ]
        }
      ),
      project.campaign_report_status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-green-600 font-medium text-sm border border-green-200 bg-green-50 px-4 py-2 rounded-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5" }),
        "Report Approved"
      ] })
    ] }) })
  ] });
}
function ExportButtons({ type, id }) {
  const { toast } = useToast();
  const handleExportCSV = async () => {
    try {
      let data;
      let filename;
      switch (type) {
        case "client-financial":
          const clientResponse = await api.get(`/clients/${id}/financial-dashboard`);
          data = clientResponse.data;
          filename = `client-${id}-financial-report.csv`;
          break;
        case "project-profitability":
          const projectResponse = await api.get(`/projects/${id}/profitability`);
          data = projectResponse.data;
          filename = `project-${id}-profitability.csv`;
          break;
        case "department-efficiency":
          const deptResponse = await api.get(`/departments/${id}/efficiency`);
          data = deptResponse.data;
          filename = `department-${id}-efficiency.csv`;
          break;
      }
      const csv = convertToCSV(data, type);
      downloadCSV(csv, filename);
      toast({
        title: "Export Successful",
        description: "Report has been downloaded"
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export report",
        variant: "destructive"
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleExportCSV, variant: "outline", size: "sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-2" }),
    "Export CSV"
  ] }) });
}
function convertToCSV(data, type) {
  let rows = [];
  switch (type) {
    case "client-financial":
      rows.push(["Metric", "Value"]);
      rows.push(["Client Name", data.client_name || ""]);
      rows.push(["Total Revenue", data.profitability.total_revenue.toString()]);
      rows.push(["Total Cost", data.profitability.total_cost.toString()]);
      rows.push(["Total Profit", data.profitability.total_profit.toString()]);
      rows.push(["Profit Margin %", data.profitability.profit_margin_percentage.toString()]);
      rows.push(["Total Invoiced", data.invoices.total_invoiced.toString()]);
      rows.push(["Total Outstanding", data.invoices.total_outstanding.toString()]);
      rows.push([]);
      rows.push(["Project Breakdown"]);
      rows.push(["Project Name", "Revenue", "Cost", "Profit", "Profit Margin %"]);
      data.profitability.projects.forEach((project) => {
        rows.push([
          project.name,
          project.revenue.toString(),
          project.cost.toString(),
          project.profit.toString(),
          project.profit_margin?.toString() || "0"
        ]);
      });
      break;
    case "project-profitability":
      rows.push(["Project Profitability Report"]);
      rows.push(["Project", data.project_name]);
      rows.push([]);
      rows.push(["Metric", "Value"]);
      rows.push(["Revenue", data.profitability.revenue.toString()]);
      rows.push(["Cost", data.profitability.cost.toString()]);
      rows.push(["Profit", data.profitability.profit.toString()]);
      rows.push(["Profit Margin %", data.profitability.profit_margin_percentage.toString()]);
      rows.push([]);
      rows.push(["Task Breakdown"]);
      rows.push(["Task", "Estimated Hours", "Actual Hours", "Rate", "Estimated Cost", "Actual Cost", "Variance", "Efficiency %"]);
      data.task_breakdown.forEach((task) => {
        rows.push([
          task.task_name,
          task.estimated_hours.toString(),
          task.actual_hours.toString(),
          task.hourly_rate.toString(),
          task.estimated_cost.toString(),
          task.actual_cost.toString(),
          task.variance.toString(),
          task.efficiency_percentage.toString()
        ]);
      });
      break;
    case "department-efficiency":
      rows.push(["Department Efficiency Report"]);
      rows.push(["Metric", "Value"]);
      if (data.overall_efficiency !== void 0) {
        rows.push(["Overall Efficiency", data.overall_efficiency.toString() + "%"]);
      }
      if (data.total_tasks !== void 0) {
        rows.push(["Total Tasks", data.total_tasks.toString()]);
      }
      if (data.avg_completion_time !== void 0) {
        rows.push(["Avg Completion Time", data.avg_completion_time.toString() + " hours"]);
      }
      break;
  }
  return rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
}
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
function ProjectProfitability({ projectId }) {
  const [data, setData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const fetchProfitability = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/projects/${projectId}/profitability`);
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch profitability:", err);
        setError(err.response?.data?.message || "Failed to load profitability data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfitability();
  }, [projectId]);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Project Profitability" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Loading profitability data..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-24" })
      ] }, i)) }) })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: error })
    ] });
  }
  if (!data) {
    return null;
  }
  const { profitability, task_breakdown } = data;
  const isProfit = profitability.profit >= 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-5 w-5 text-primary" }),
          "Project Profitability"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Financial overview and task cost breakdown" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ExportButtons, { type: "project-profitability", id: projectId })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3 w-3" }),
            "Revenue"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: formatCurrency(profitability.revenue) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "From estimate" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
            "Cost"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: formatCurrency(profitability.cost) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Actual hours worked" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1", children: [
            isProfit ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-3 w-3 text-red-500" }),
            "Profit"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-2xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`, children: formatCurrency(profitability.profit) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            profitability.profit_margin_percentage.toFixed(2),
            "% margin"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: isProfit ? "default" : "destructive",
              className: `text-sm font-bold ${isProfit ? "bg-green-500 hover:bg-green-600" : ""}`,
              children: isProfit ? "Profitable" : "Over Budget"
            }
          )
        ] })
      ] }),
      task_breakdown && task_breakdown.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Task Cost Breakdown" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: task_breakdown.map((task) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: task.task_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-xs text-muted-foreground mt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Est: ",
                    task.estimated_hours,
                    "h"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Actual: ",
                    task.actual_hours,
                    "h"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Rate: ",
                    formatCurrency(task.hourly_rate),
                    "/h"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold", children: formatCurrency(task.actual_cost) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Badge,
                    {
                      variant: "outline",
                      className: `text-xs ${task.variance >= 0 ? "border-green-500/50 bg-green-500/10 text-green-700" : "border-red-500/50 bg-red-500/10 text-red-700"}`,
                      children: [
                        task.variance >= 0 ? "+" : "",
                        formatCurrency(task.variance)
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  task.efficiency_percentage.toFixed(0),
                  "% efficient"
                ] })
              ] })
            ]
          },
          task.task_id
        )) })
      ] }),
      (!task_breakdown || task_breakdown.length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-6 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No tasks with cost tracking yet" })
      ] })
    ] })
  ] });
}
function BulkPOAssignDialog({
  open,
  onOpenChange,
  project,
  onSuccess
}) {
  const { toast } = useToast();
  const [tab, setTab] = reactExports.useState("xero");
  const [xeroPOs, setXeroPOs] = reactExports.useState([]);
  const [xeroLoading, setXeroLoading] = reactExports.useState(false);
  const [xeroError, setXeroError] = reactExports.useState(null);
  const [xeroSearch, setXeroSearch] = reactExports.useState("");
  const [selectedXeroPOs, setSelectedXeroPOs] = reactExports.useState([]);
  const [manualEntries, setManualEntries] = reactExports.useState([
    { id: crypto.randomUUID(), poNumber: "", amount: "", currency: project.currency || "USD", notes: "" }
  ]);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const fetchXeroPOs = async () => {
    setXeroLoading(true);
    setXeroError(null);
    try {
      const params = new URLSearchParams();
      if (project.client?.xero_contact_id) {
        params.append("xero_contact_id", project.client.xero_contact_id);
      }
      const response = await api.get(`/xero/purchase-orders?${params.toString()}`);
      setXeroPOs(response);
    } catch (err) {
      setXeroError(err.response?.data?.message || "Failed to load Purchase Orders from Xero.");
    } finally {
      setXeroLoading(false);
    }
  };
  reactExports.useEffect(() => {
    if (open) {
      fetchXeroPOs();
      setSelectedXeroPOs([]);
      setXeroSearch("");
      setManualEntries([
        { id: crypto.randomUUID(), poNumber: "", amount: "", currency: project.currency || "USD", notes: "" }
      ]);
    }
  }, [open]);
  const toggleXeroPO = (po) => {
    setSelectedXeroPOs(
      (prev) => prev.some((p) => p.PurchaseOrderID === po.PurchaseOrderID) ? prev.filter((p) => p.PurchaseOrderID !== po.PurchaseOrderID) : [...prev, po]
    );
  };
  const addManualRow = () => {
    setManualEntries((prev) => [
      ...prev,
      { id: crypto.randomUUID(), poNumber: "", amount: "", currency: project.currency || "USD", notes: "" }
    ]);
  };
  const removeManualRow = (id) => {
    setManualEntries((prev) => prev.filter((e) => e.id !== id));
  };
  const updateManualRow = (id, field, value) => {
    setManualEntries(
      (prev) => prev.map((e) => e.id === id ? { ...e, [field]: value } : e)
    );
  };
  const filteredXeroPOs = xeroPOs.filter(
    (po) => po.PurchaseOrderNumber.toLowerCase().includes(xeroSearch.toLowerCase()) || po.Contact.Name.toLowerCase().includes(xeroSearch.toLowerCase()) || po.Reference && po.Reference.toLowerCase().includes(xeroSearch.toLowerCase())
  );
  const handleSave = async () => {
    const posToAssign = [];
    if (tab === "xero") {
      if (selectedXeroPOs.length === 0) {
        toast({ title: "Select at least one PO", variant: "destructive" });
        return;
      }
      selectedXeroPOs.forEach((po) => {
        posToAssign.push({
          poNumber: po.PurchaseOrderNumber,
          xeroPoId: po.PurchaseOrderID,
          amount: po.Total,
          currency: po.CurrencyCode,
          status: po.Status
        });
      });
    } else {
      const valid = manualEntries.filter((e) => e.poNumber.trim());
      if (valid.length === 0) {
        toast({ title: "Enter at least one PO number", variant: "destructive" });
        return;
      }
      valid.forEach((e) => {
        posToAssign.push({
          poNumber: e.poNumber.trim(),
          amount: e.amount ? parseFloat(e.amount) : void 0,
          currency: e.currency || void 0,
          notes: e.notes || void 0
        });
      });
    }
    setIsSaving(true);
    try {
      const result = await projectService.bulkAssignPurchaseOrders(
        String(project.id),
        posToAssign
      );
      onSuccess(result.project, result.purchaseOrders);
      onOpenChange(false);
      toast({
        title: "Purchase Orders Assigned",
        description: `${posToAssign.length} PO${posToAssign.length > 1 ? "s" : ""} linked to this project.`
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to assign purchase orders.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[580px] h-[620px] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-5 w-5" }),
        "Assign Purchase Orders"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "Link one or more purchase orders to ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: project.name }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Tabs,
      {
        value: tab,
        onValueChange: (v) => setTab(v),
        className: "flex-1 flex flex-col overflow-hidden",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "xero", children: "Select from Xero" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "manual", children: "Enter Manually" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "xero", className: "flex-1 flex flex-col overflow-hidden mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-2 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Search by PO number, client, or reference...",
                  className: "pl-8",
                  value: xeroSearch,
                  onChange: (e) => setXeroSearch(e.target.value)
                }
              )
            ] }),
            selectedXeroPOs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mb-2 shrink-0", children: selectedXeroPOs.map((po) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                variant: "secondary",
                className: "cursor-pointer",
                onClick: () => toggleXeroPO(po),
                children: [
                  po.PurchaseOrderNumber,
                  " ✕"
                ]
              },
              po.PurchaseOrderID
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-hidden", children: xeroLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : xeroError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-10 w-10 text-destructive mb-2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: xeroError }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "mt-4", onClick: fetchXeroPOs, children: "Try Again" })
            ] }) : filteredXeroPOs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col items-center justify-center text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-10 w-10 mb-2 opacity-20" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No available Purchase Orders found." })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full pr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filteredXeroPOs.map((po) => {
              const isSelected = selectedXeroPOs.some(
                (p) => p.PurchaseOrderID === po.PurchaseOrderID
              );
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: cn(
                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent",
                    isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                  ),
                  onClick: () => toggleXeroPO(po),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: cn(
                            "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0",
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                          ),
                          children: isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 text-primary-foreground" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-sm", children: po.PurchaseOrderNumber }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] py-0 h-4 bg-muted/50", children: po.Type })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: po.Contact.Name })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-sm", children: [
                      po.CurrencyCode,
                      " ",
                      po.Total.toLocaleString(void 0, { minimumFractionDigits: 2 })
                    ] }) })
                  ]
                },
                po.PurchaseOrderID
              );
            }) }) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "manual", className: "flex-1 overflow-hidden mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full pr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            manualEntries.map((entry, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border rounded-lg space-y-2 bg-muted/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-muted-foreground uppercase", children: [
                  "PO #",
                  idx + 1
                ] }),
                manualEntries.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    size: "icon",
                    className: "h-6 w-6 text-destructive hover:text-destructive",
                    onClick: () => removeManualRow(entry.id),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "PO Number *" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      value: entry.poNumber,
                      onChange: (e) => updateManualRow(entry.id, "poNumber", e.target.value),
                      placeholder: "e.g. PO-2026-001",
                      className: "h-8 mt-1"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Amount" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "number",
                      min: "0",
                      step: "0.01",
                      value: entry.amount,
                      onChange: (e) => updateManualRow(entry.id, "amount", e.target.value),
                      placeholder: "0.00",
                      className: "h-8 mt-1"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Currency" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      value: entry.currency,
                      onChange: (e) => updateManualRow(entry.id, "currency", e.target.value),
                      placeholder: "USD",
                      className: "h-8 mt-1",
                      maxLength: 10
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      value: entry.notes,
                      onChange: (e) => updateManualRow(entry.id, "notes", e.target.value),
                      placeholder: "Optional notes",
                      className: "h-8 mt-1"
                    }
                  )
                ] })
              ] })
            ] }, entry.id)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "sm",
                className: "w-full",
                onClick: addManualRow,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
                  "Add Another PO"
                ]
              }
            )
          ] }) }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: isSaving, children: [
        isSaving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        tab === "xero" ? `Assign ${selectedXeroPOs.length > 0 ? selectedXeroPOs.length + " " : ""}PO${selectedXeroPOs.length !== 1 ? "s" : ""}` : `Assign ${manualEntries.filter((e) => e.poNumber.trim()).length || ""} PO${manualEntries.filter((e) => e.poNumber.trim()).length !== 1 ? "s" : ""}`
      ] })
    ] })
  ] }) });
}
function ProjectOverviewContent({
  project: initialProject,
  tasks,
  onProjectUpdate,
  showBackButton = true,
  showKanbanButton = true
}) {
  const [project, setProject] = reactExports.useState(initialProject);
  const [isUpdatingStatus, setIsUpdatingStatus] = reactExports.useState(false);
  const [isPOSelectOpen, setIsPOSelectOpen] = reactExports.useState(false);
  const [isPOViewOpen, setIsPOViewOpen] = reactExports.useState(false);
  const [isInvoiceUploadOpen, setIsInvoiceUploadOpen] = reactExports.useState(false);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = reactExports.useState(false);
  const [isEditingDeadline, setIsEditingDeadline] = reactExports.useState(false);
  const [isGracePeriodOpen, setIsGracePeriodOpen] = reactExports.useState(false);
  const [isProvisionalPOOpen, setIsProvisionalPOOpen] = reactExports.useState(false);
  const [isInvoiceViewOpen, setIsInvoiceViewOpen] = reactExports.useState(false);
  const [isBulkPOOpen, setIsBulkPOOpen] = reactExports.useState(false);
  const [selectedInvoice, setSelectedInvoice] = reactExports.useState();
  const [invoiceToEdit, setInvoiceToEdit] = reactExports.useState();
  const [invoiceToDelete, setInvoiceToDelete] = reactExports.useState();
  const [projectPOs, setProjectPOs] = reactExports.useState(project.purchaseOrders || []);
  const [isUploadingAttachment, setIsUploadingAttachment] = reactExports.useState(false);
  const [newLinkName, setNewLinkName] = reactExports.useState("");
  const [newLinkUrl, setNewLinkUrl] = reactExports.useState("");
  const fileInputRef = reactExports.useRef(null);
  const [isRemovingPO, setIsRemovingPO] = reactExports.useState(null);
  const { toast } = useToast();
  const { currentUser, activeRole } = useUser();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    setProject(initialProject);
    if (initialProject.purchaseOrders) {
      setProjectPOs(initialProject.purchaseOrders);
    }
  }, [initialProject]);
  const handleProjectChange = (updated) => {
    setProject(updated);
    onProjectUpdate?.(updated);
  };
  const completedStageId = project.stages.find(
    (s) => s.title.toLowerCase().trim() === "completed"
  )?.id;
  const suggestedStageIds = project.stages.filter((s) => {
    const title = s.title.toLowerCase().trim();
    return title === "suggested" || title === "suggested task";
  }).map((s) => s.id);
  const archiveStageId = project.stages.find(
    (s) => s.title.toLowerCase().trim() === "archive"
  )?.id;
  const filteredTasks = tasks.filter((t) => {
    if (!t.projectStage) return true;
    return !suggestedStageIds.includes(t.projectStage) && t.projectStage !== archiveStageId;
  });
  const completedTasks = tasks.filter(
    (t) => t.projectStage === completedStageId
  ).length;
  const totalTasks = filteredTasks.length;
  const progress = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
  const statusColors = {
    active: "bg-green-500",
    "on-hold": "bg-orange-500",
    completed: "bg-blue-500",
    cancelled: "bg-red-500",
    suggested: "bg-blue-400",
    blocked: "bg-red-600"
  };
  const getDisplayName = (title) => {
    if (!title) return title;
    if (title.toLowerCase().trim() === "pending") {
      return "Backlog";
    }
    return title;
  };
  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      await invoiceService.delete(invoiceToDelete.id);
      toast({ title: "Invoice Deleted", description: "The invoice has been removed." });
      setInvoiceToDelete(void 0);
      handleProjectChange(project);
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      toast({ title: "Error", description: "Failed to delete invoice.", variant: "destructive" });
    }
  };
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingAttachment(true);
    try {
      for (const file of Array.from(files)) {
        await projectAttachmentService.uploadFile(String(project.id), file);
      }
      toast({ title: "Success", description: "Files uploaded successfully." });
      const updatedProject = await projectService.getById(String(project.id));
      handleProjectChange(updatedProject);
    } catch (error) {
      console.error("Failed to upload files:", error);
      toast({ title: "Upload failed", description: "Could not upload files.", variant: "destructive" });
    } finally {
      setIsUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const handleAddLink = async () => {
    if (!newLinkName || !newLinkUrl) return;
    setIsUploadingAttachment(true);
    try {
      await projectAttachmentService.addLink(String(project.id), newLinkName, newLinkUrl);
      toast({ title: "Success", description: "Link added successfully." });
      setNewLinkName("");
      setNewLinkUrl("");
      const updatedProject = await projectService.getById(String(project.id));
      handleProjectChange(updatedProject);
    } catch (error) {
      console.error("Failed to add link:", error);
      toast({ title: "Error", description: "Could not add link.", variant: "destructive" });
    } finally {
      setIsUploadingAttachment(false);
    }
  };
  const handleRemoveAttachment = async (id) => {
    try {
      await projectAttachmentService.delete(id);
      toast({ title: "Success", description: "Attachment removed." });
      const updatedProject = await projectService.getById(String(project.id));
      handleProjectChange(updatedProject);
    } catch (error) {
      console.error("Failed to remove attachment:", error);
      toast({ title: "Error", description: "Could not remove attachment.", variant: "destructive" });
    }
  };
  const isDigitalMarketing = project.department?.name === "Digital Marketing";
  const isCampaignReportApproved = !isDigitalMarketing || project.campaign_report_status === "approved";
  const handleStatusChange = async (newStatus) => {
    if (newStatus === "completed" && (activeRole === "hr" || activeRole === "admin")) {
      if (!isCampaignReportApproved) {
        toast({
          title: "Report Required",
          description: "A campaign report must be uploaded and approved before completing a Digital Marketing project.",
          variant: "destructive"
        });
        return;
      }
      setIsInvoiceUploadOpen(true);
      return;
    }
    setIsUpdatingStatus(true);
    try {
      const updatedProject = await projectService.update(
        String(project.id),
        {
          ...project,
          status: newStatus,
          group: project.group,
          department: project.department
        }
      );
      handleProjectChange(updatedProject);
      toast({
        title: "Status Updated",
        description: `Project status changed to ${newStatus}.`
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        title: "Error",
        description: "Failed to update project status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  const canChangeStatus = activeRole === "admin" || activeRole === "hr" || activeRole === "team-lead";
  const canSeeClientInfo = activeRole === "admin" || activeRole === "hr";
  const canManageFinance = activeRole === "admin" || activeRole === "hr";
  const isBlocked = project.isBlocked || project.status === "blocked";
  const handleGracePeriodSave = async (expiresAt, notes) => {
    try {
      const updatedProject = await projectService.grantGracePeriod(
        String(project.id),
        expiresAt,
        notes
      );
      handleProjectChange(updatedProject);
      toast({ title: "Grace period authorized successfully." });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save grace period.",
        variant: "destructive"
      });
    }
  };
  const handleProvisionalPOSave = async (poNumber, expiresAt) => {
    try {
      const updatedProject = await projectService.issueProvisionalPo(
        String(project.id),
        poNumber,
        expiresAt
      );
      handleProjectChange(updatedProject);
      toast({
        title: "Provisional PO issued successfully. Client will be notified by email."
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to issue provisional PO.",
        variant: "destructive"
      });
    }
  };
  const handleBulkPOSuccess = (updatedProject, newPOs) => {
    handleProjectChange(updatedProject);
    setProjectPOs((prev) => [...newPOs, ...prev]);
  };
  const handleRemovePO = async (po) => {
    setIsRemovingPO(po.id);
    try {
      await projectService.removePurchaseOrder(String(project.id), po.id);
      setProjectPOs((prev) => prev.filter((p) => p.id !== po.id));
      if (projectPOs.length === 1 && !project.poNumber) {
        handleProjectChange({ ...project, isLockedByPo: true });
      }
      toast({ title: "Purchase Order Removed" });
    } catch {
      toast({ title: "Error", description: "Failed to remove purchase order.", variant: "destructive" });
    } finally {
      setIsRemovingPO(null);
    }
  };
  const handleToggleBlock = async () => {
    const newStatus = isBlocked ? "active" : "blocked";
    setIsUpdatingStatus(true);
    try {
      const updatedProject = await projectService.update(
        String(project.id),
        {
          ...project,
          status: newStatus,
          isBlocked: !isBlocked
        }
      );
      handleProjectChange(updatedProject);
      toast({
        title: isBlocked ? "Project Unblocked" : "Project Blocked",
        description: isBlocked ? "The project has been unblocked and is now active." : "The project has been blocked and is now read-only."
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update project status.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  const hasPO = !!project.poDocumentUrl || !!project.poNumber;
  const hasGracePeriod = !!project.gracePeriodExpiresAt;
  const gracePeriodExpired = hasGracePeriod && new Date(project.gracePeriodExpiresAt) < /* @__PURE__ */ new Date();
  const hasProvisionalPO = !!project.provisionalPoNumber;
  const provisionalPOExpired = hasProvisionalPO && project.provisionalPoExpiresAt ? new Date(project.provisionalPoExpiresAt) < /* @__PURE__ */ new Date() : false;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          showBackButton && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              },
              className: "h-9 w-9",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold tracking-tight", children: project.name }),
          project.projectCode && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded", children: project.projectCode }),
          project.isInternalProject ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              variant: "outline",
              className: "text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border-blue-200 px-2 h-6 flex items-center gap-1",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3 w-3" }),
                " Internal Project"
              ]
            }
          ) : project.isLockedByPo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                variant: "destructive",
                className: "text-[10px] font-bold uppercase tracking-wider bg-red-500 hover:bg-red-600 border-none px-2 h-6 flex items-center gap-1",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
                  " Awaiting PO"
                ]
              }
            ),
            (activeRole === "admin" || activeRole === "hr") && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "h-6 text-[10px] px-2 py-0 border-red-500 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950",
                onClick: () => setIsPOSelectOpen(true),
                children: "Select PO"
              }
            )
          ] }) : project.poDocumentUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "h-6 text-[10px] px-2 py-0 border-green-600 text-green-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950",
                onClick: () => setIsPOViewOpen(true),
                children: "View PO"
              }
            ),
            project.invoiceDocumentUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  className: `h-6 text-[10px] px-2 py-0 border-blue-600 text-blue-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 ${!isCampaignReportApproved ? "opacity-50 cursor-not-allowed" : ""}`,
                  onClick: () => {
                    if (isCampaignReportApproved) {
                      setIsInvoiceViewOpen(true);
                    } else {
                      toast({
                        title: "Report Required",
                        description: "Report must be approved to view invoices.",
                        variant: "destructive"
                      });
                    }
                  },
                  children: "View Invoice"
                }
              ),
              project.isPhysicalInvoice && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Badge,
                {
                  variant: "outline",
                  className: cn(
                    "h-6 text-[9px] font-bold uppercase border-none text-white flex items-center gap-1 px-2 cursor-pointer hover:opacity-90 transition-opacity",
                    project.courierDeliveryStatus === "delivered" ? "bg-emerald-500" : project.courierDeliveryStatus === "shipped" ? "bg-amber-500" : project.courierDeliveryStatus === "returned" ? "bg-rose-500" : "bg-indigo-500"
                  ),
                  onClick: () => setIsInvoiceViewOpen(true),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-3 w-3" }),
                    project.courierDeliveryStatus || "Pending"
                  ]
                }
              )
            ] })
          ] }) : project.invoiceDocumentUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: `h-6 text-[10px] px-2 py-0 border-blue-600 text-blue-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 ${!isCampaignReportApproved ? "opacity-50 cursor-not-allowed" : ""}`,
              onClick: () => {
                if (isCampaignReportApproved) {
                  setIsInvoiceViewOpen(true);
                } else {
                  toast({
                    title: "Report Required",
                    description: "Report must be approved to view invoices.",
                    variant: "destructive"
                  });
                }
              },
              children: "View Invoice"
            }
          ) }) : null,
          canChangeStatus ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: project.status || "active",
              onValueChange: handleStatusChange,
              disabled: isUpdatingStatus,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  SelectTrigger,
                  {
                    className: `w-[130px] h-8 text-xs font-semibold capitalize border-none text-white focus:ring-0 ${statusColors[project.status || "active"]}`,
                    children: [
                      isUpdatingStatus ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin mr-2" }) : null,
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status", children: project.status === "on-hold" ? "Blocked" : void 0 })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", children: "Active" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "suggested", children: "Suggested" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "on-hold", children: "On Hold" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "blocked", children: "Blocked" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "completed", children: "Completed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: "Cancelled" })
                ] })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              className: `${statusColors[project.status || "active"]} hover:${statusColors[project.status || "active"]} text-white capitalize px-3 py-1`,
              children: project.status === "on-hold" ? "On Hold" : project.status === "suggested" ? "Suggested" : project.status === "blocked" ? "Blocked" : project.status || "Active"
            }
          ),
          isBlocked && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Badge,
            {
              variant: "destructive",
              className: "text-[10px] font-bold uppercase tracking-wider bg-red-600 border-none px-2 h-6 flex items-center gap-1",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3 w-3" }),
                " Blocked"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-lg", children: [
          project.department?.name,
          " •",
          " ",
          project.group?.name || "No Group"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        canManageFinance && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: isBlocked ? "outline" : "destructive",
            size: "sm",
            onClick: handleToggleBlock,
            disabled: isUpdatingStatus,
            children: [
              isUpdatingStatus ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }) : isBlocked ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3.5 w-3.5 mr-1" }),
              isBlocked ? "Unblock Project" : "Block Project"
            ]
          }
        ),
        showKanbanButton && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => navigate(`/project/${project.id}`),
            className: "px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors",
            children: "Go to Kanban Board"
          }
        )
      ] })
    ] }),
    !hasPO && !hasGracePeriod && !hasProvisionalPO && !project.isInternalProject && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-amber-500 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-amber-800 dark:text-amber-300", children: "Purchase Order Required" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-700 dark:text-amber-400 mt-0.5", children: "This project does not have a PO on file. Task creation is restricted until a PO is received." })
      ] }),
      canManageFinance && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "sm",
            variant: "outline",
            className: "border-amber-400 text-amber-700 hover:text-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900",
            onClick: () => setIsPOSelectOpen(true),
            children: "Select PO"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            className: "border-amber-400 text-amber-700 hover:text-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900",
            onClick: () => setIsGracePeriodOpen(true),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3.5 w-3.5 mr-1" }),
              " Grace Period"
            ]
          }
        )
      ] })
    ] }),
    hasGracePeriod && !hasPO && !project.isInternalProject && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `flex items-start gap-3 rounded-lg border p-4 ${gracePeriodExpired ? "border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800" : "border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ShieldCheck,
            {
              className: `h-5 w-5 shrink-0 mt-0.5 ${gracePeriodExpired ? "text-red-500" : "text-blue-500"}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: `font-semibold ${gracePeriodExpired ? "text-red-800 dark:text-red-300" : "text-blue-800 dark:text-blue-300"}`,
                children: gracePeriodExpired ? "Grace Period Expired" : "Grace Period Active"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "p",
              {
                className: `text-sm mt-0.5 ${gracePeriodExpired ? "text-red-700 dark:text-red-400" : "text-blue-700 dark:text-blue-400"}`,
                children: [
                  gracePeriodExpired ? `The authorized grace period expired on ${new Date(
                    project.gracePeriodExpiresAt
                  ).toLocaleDateString()}. A PO is now required.` : `Work may proceed without PO until ${new Date(
                    project.gracePeriodExpiresAt
                  ).toLocaleDateString()}.`,
                  project.gracePeriodNotes && ` Note: ${project.gracePeriodNotes}`
                ]
              }
            )
          ] }),
          canManageFinance && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => setIsGracePeriodOpen(true),
                children: "Update"
              }
            ),
            gracePeriodExpired && !hasProvisionalPO && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                className: "border-blue-400 text-blue-700 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900",
                onClick: () => setIsProvisionalPOOpen(true),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 mr-1" }),
                  " ",
                  "Provisional PO"
                ]
              }
            )
          ] })
        ]
      }
    ),
    hasProvisionalPO && !hasPO && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `flex items-start gap-3 rounded-lg border p-4 ${provisionalPOExpired ? "border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800" : "border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-800"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FileText,
            {
              className: `h-5 w-5 shrink-0 mt-0.5 ${provisionalPOExpired ? "text-orange-500" : "text-green-500"}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: `font-semibold ${provisionalPOExpired ? "text-orange-800 dark:text-orange-300" : "text-green-800 dark:text-green-300"}`,
                children: provisionalPOExpired ? "Provisional PO Expired" : "Provisional PO Active"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "p",
              {
                className: `text-sm mt-0.5 ${provisionalPOExpired ? "text-orange-700 dark:text-orange-400" : "text-green-700 dark:text-green-400"}`,
                children: [
                  "PO Reference:",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: project.provisionalPoNumber }),
                  project.provisionalPoExpiresAt && ` · ${provisionalPOExpired ? "Expired" : "Expires"} ${new Date(
                    project.provisionalPoExpiresAt
                  ).toLocaleDateString()}`
                ]
              }
            )
          ] }),
          canManageFinance && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: () => setIsProvisionalPOOpen(true),
              children: "Update"
            }
          )
        ]
      }
    ),
    canManageFinance && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-base", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-5 w-5 text-primary" }),
          "Purchase Orders (",
          projectPOs.length + (project.poNumber ? 1 : 0),
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setIsBulkPOOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Assign POs"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: projectPOs.length === 0 && !project.poNumber ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "No purchase orders linked yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        project.poNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: project.poNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Primary PO" })
          ] }),
          project.poDocumentUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "text-xs",
              onClick: () => setIsPOViewOpen(true),
              children: "View"
            }
          )
        ] }),
        projectPOs.map((po) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: po.poNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              po.amount !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                po.currency || "USD",
                " ",
                Number(po.amount).toLocaleString(void 0, { minimumFractionDigits: 2 })
              ] }),
              po.status && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-muted px-1.5 py-0.5 rounded-full", children: po.status }),
              po.xeroPoId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-blue-500/10 text-blue-700 px-1.5 py-0.5 rounded-full", children: "Xero" })
            ] }),
            po.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: po.notes })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "h-7 w-7 text-destructive hover:text-destructive",
              disabled: isRemovingPO === po.id,
              onClick: () => handleRemovePO(po),
              children: isRemovingPO === po.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
            }
          )
        ] }, po.id))
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CampaignReportSection,
      {
        project,
        onSuccess: handleProjectChange
      }
    ),
    canSeeClientInfo && project.client && /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectProfitability, { projectId: project.id }),
    canSeeClientInfo && project.client && /* @__PURE__ */ jsxRuntimeExports.jsx(
      InvoiceList,
      {
        clientId: project.clientId,
        showFilters: true,
        onInvoiceClick: (invoice) => {
          setSelectedInvoice(invoice);
          setIsInvoiceViewOpen(true);
        },
        onAddInvoice: canManageFinance ? () => {
          setInvoiceToEdit(void 0);
          setIsAddInvoiceOpen(true);
        } : void 0,
        onEditInvoice: canManageFinance ? (invoice) => {
          setInvoiceToEdit(invoice);
          setIsAddInvoiceOpen(true);
        } : void 0,
        onDeleteInvoice: canManageFinance ? (invoice) => {
          setInvoiceToDelete(invoice);
        } : void 0
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProjectFinanceTab,
      {
        project,
        onBudgetUpdate: (budgetAllocated) => handleProjectChange({ ...project, budget_allocated: budgetAllocated ?? void 0 })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectReportsTab, { project }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full border-none shadow-md bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-indigo-500" }),
          "Estimated Hours"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "flex-1 flex flex-col justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-4xl font-black tracking-tighter", children: [
          project.estimatedHours || 0,
          "h"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full border-none shadow-md bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-500" }),
          "Completion"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex-1 flex flex-col justify-center space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-4xl font-black tracking-tighter", children: [
            progress,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progress, className: "h-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-tight", children: [
            completedTasks,
            " / ",
            totalTasks,
            " tasks finished"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full border-none shadow-md bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-amber-500" }),
          "Created On"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "flex-1 flex flex-col justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black tracking-tighter", children: project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "N/A" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full border-none shadow-md bg-gradient-to-br from-rose-500/10 to-red-500/10 dark:from-rose-500/20 dark:to-red-500/20 flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-rose-500" }),
          "Deadline"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "flex-1 flex flex-col justify-center", children: canChangeStatus ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
          isEditingDeadline || !project.deadline ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "date",
              autoFocus: isEditingDeadline,
              value: project.deadline || "",
              onBlur: () => setIsEditingDeadline(false),
              onChange: async (e) => {
                const newDeadline = e.target.value;
                try {
                  const updatedProject = await projectService.update(
                    String(project.id),
                    {
                      ...project,
                      deadline: newDeadline
                    }
                  );
                  handleProjectChange(updatedProject);
                  setIsEditingDeadline(false);
                  toast({
                    title: "Deadline Updated",
                    description: "Project deadline has been updated successfully."
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to update deadline.",
                    variant: "destructive"
                  });
                }
              },
              className: "bg-transparent border-none text-2xl font-black tracking-tighter focus:ring-0 p-0 w-full cursor-pointer hover:opacity-70 transition-opacity"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              onClick: () => setIsEditingDeadline(true),
              className: "text-3xl font-black tracking-tighter cursor-pointer hover:opacity-70 transition-opacity",
              children: new Date(
                project.deadline
              ).toLocaleDateString()
            }
          ),
          !project.deadline && !isEditingDeadline && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase font-bold text-muted-foreground/50", children: "Set Deadline" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black tracking-tighter", children: project.deadline ? new Date(
          project.deadline
        ).toLocaleDateString() : "N/A" }) })
      ] }),
      canSeeClientInfo && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full border-none shadow-md bg-gradient-to-br from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20 flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-pink-500" }),
          "Client"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "flex-1 flex flex-col justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-black tracking-tight line-clamp-2", children: project.client?.company_name || "Internal Project" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Project Description" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "prose prose-sm dark:prose-invert max-w-none",
              dangerouslySetInnerHTML: {
                __html: project.description || "No description provided."
              }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Workflow Stages" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Custom stages defined for this project's Kanban board" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: project.stages.map((stage) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/50 text-sm font-medium",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `w-2.5 h-2.5 rounded-full ${stage.color}`
                  }
                ),
                getDisplayName(stage.title)
              ]
            },
            stage.id
          )) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8", children: canSeeClientInfo ? project.client ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-primary/20 bg-primary/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-5 w-5" }),
          "Client Information"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Company" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-lg", children: project.client.company_name })
          ] }),
          project.client.industry && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Industry" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: project.client.industry })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 space-y-3", children: [
            project.client.website && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: project.client.website,
                  target: "_blank",
                  rel: "noreferrer",
                  className: "text-primary hover:underline",
                  children: project.client.website
                }
              )
            ] }),
            project.client.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: project.client.email })
            ] }),
            project.client.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: project.client.phone })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => navigate(
                `/clients/${project.client?.id}`
              ),
              className: "w-full mt-4 text-sm font-medium text-primary hover:text-primary/80",
              children: "View Full Client Profile →"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-10 text-center space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-8 w-8 text-muted-foreground mx-auto opacity-50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No client associated with this project." })
      ] }) }) : null })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base font-semibold", children: "Project Links" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground", children: "Emails" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: project.emails && project.emails.length > 0 ? project.emails.map((email) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: "font-normal",
              children: email
            },
            email
          )) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "None" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground", children: "WhatsApp Group Numbers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: project.phoneNumbers && project.phoneNumbers.length > 0 ? project.phoneNumbers.map((phone) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "outline",
              className: "font-normal",
              children: phone
            },
            phone
          )) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "None" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "mt-8 border-none shadow-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2 border-b mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-5 w-5 text-primary" }),
          "Files & Links"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "h-8 gap-2 font-semibold",
              onClick: () => fileInputRef.current?.click(),
              disabled: isUploadingAttachment,
              children: [
                isUploadingAttachment ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
                "Upload File"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              ref: fileInputRef,
              className: "hidden",
              multiple: true,
              onChange: handleFileUpload
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-end bg-muted/20 p-4 rounded-lg border border-dashed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "linkName", className: "text-[10px] text-muted-foreground uppercase font-black tracking-widest", children: "Link Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "linkName",
                placeholder: "e.g. Design Folder",
                value: newLinkName,
                onChange: (e) => setNewLinkName(e.target.value),
                className: "h-9 bg-background border-muted-foreground/20 focus:border-primary transition-colors"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 flex-[2]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "linkUrl", className: "text-[10px] text-muted-foreground uppercase font-black tracking-widest", children: "URL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "linkUrl",
                placeholder: "https://...",
                value: newLinkUrl,
                onChange: (e) => setNewLinkUrl(e.target.value),
                className: "h-9 bg-background border-muted-foreground/20 focus:border-primary transition-colors"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              className: "h-9 font-bold px-4",
              onClick: handleAddLink,
              disabled: !newLinkName || !newLinkUrl || isUploadingAttachment,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
                " Add Link"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: project.attachments && project.attachments.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: project.attachments.map((attachment) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between p-3 rounded-lg border bg-muted/30 group hover:border-primary/50 hover:bg-background transition-all duration-200 hover:shadow-md",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
                  "p-2.5 rounded-lg",
                  attachment.type === "link" ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                ), children: attachment.type === "link" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold truncate", title: attachment.name, children: attachment.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "a",
                    {
                      href: attachment.url,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "text-[10px] text-muted-foreground hover:text-primary truncate block font-mono opacity-70 group-hover:opacity-100 transition-opacity",
                      children: attachment.url
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all duration-200",
                  onClick: () => handleRemoveAttachment(attachment.id),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                }
              )
            ]
          },
          attachment.id
        )) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 border-2 border-dashed rounded-xl bg-muted/10 flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-6 w-6 text-muted-foreground/40" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-muted-foreground", children: "No files or links added yet." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60 mt-1 max-w-[200px] mx-auto text-center", children: "Centralize all project resources like Figma links, Drive folders, and documents." })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      POSelectDialog,
      {
        open: isPOSelectOpen,
        onOpenChange: setIsPOSelectOpen,
        project,
        onSuccess: handleProjectChange
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      POViewDialog,
      {
        open: isPOViewOpen,
        onOpenChange: setIsPOViewOpen,
        url: project.poDocumentUrl || "",
        poNumber: project.poNumber
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      InvoiceUploadDialog,
      {
        open: isInvoiceUploadOpen,
        onOpenChange: setIsInvoiceUploadOpen,
        project,
        onSuccess: handleProjectChange
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      GracePeriodDialog,
      {
        open: isGracePeriodOpen,
        onOpenChange: setIsGracePeriodOpen,
        onSave: handleGracePeriodSave,
        currentExpiresAt: project.gracePeriodExpiresAt,
        currentNotes: project.gracePeriodNotes
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProvisionalPODialog,
      {
        open: isProvisionalPOOpen,
        onOpenChange: setIsProvisionalPOOpen,
        onSave: handleProvisionalPOSave,
        projectName: project.name,
        currentPoNumber: project.provisionalPoNumber,
        currentExpiresAt: project.provisionalPoExpiresAt
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      InvoiceViewDialog,
      {
        open: isInvoiceViewOpen,
        onOpenChange: (open) => {
          setIsInvoiceViewOpen(open);
          if (!open) setSelectedInvoice(void 0);
        },
        url: selectedInvoice ? void 0 : project.invoiceDocumentUrl || "",
        project,
        invoice: selectedInvoice,
        onSuccess: (updated) => {
          if (selectedInvoice) {
            handleProjectChange(project);
          } else {
            handleProjectChange(updated);
          }
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      InvoiceUploadDialog,
      {
        open: isAddInvoiceOpen,
        onOpenChange: (open) => {
          setIsAddInvoiceOpen(open);
          if (!open) setInvoiceToEdit(void 0);
        },
        project,
        invoice: invoiceToEdit,
        onSuccess: (updated) => {
          handleProjectChange(updated);
        },
        completeProject: false
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!invoiceToDelete, onOpenChange: (open) => {
      if (!open) setInvoiceToDelete(void 0);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Are you absolutely sure?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          "This will permanently delete invoice ",
          invoiceToDelete?.invoiceNumber || "this invoice",
          ". This action cannot be undone."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDeleteInvoice, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      BulkPOAssignDialog,
      {
        open: isBulkPOOpen,
        onOpenChange: setIsBulkPOOpen,
        project,
        onSuccess: handleBulkPOSuccess
      }
    )
  ] });
}
function ProjectOverview() {
  const { projectId } = useParams();
  const [project, setProject] = reactExports.useState(null);
  const [tasks, setTasks] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        let found = null;
        if (projectId) {
          if (/^\d+$/.test(projectId)) {
            found = await projectService.getById(projectId);
          } else {
            const decoded = decodeURIComponent(projectId);
            const allProjects = await projectService.getAll();
            found = allProjects.find((p) => p.name === decoded) || null;
            if (!found) {
              const slug = projectId.toLowerCase();
              found = allProjects.find((p) => p.name.toLowerCase().replace(/\s+/g, "-") === slug) || null;
            }
          }
        }
        if (found) {
          setProject(found);
          const projectTasks = await taskService.getAll({ projectId: String(found.id) });
          setTasks(projectTasks);
        }
      } catch (error) {
        console.error("Failed to fetch project overview data:", error);
        toast({ title: "Error", description: "Failed to load project details", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, toast]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-64" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-96" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-24" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-40 w-full" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-80 w-full" })
    ] });
  }
  if (!project) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-[60vh] space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-12 w-12 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Project Not Found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => navigate("/"),
          className: "text-primary hover:underline",
          children: "Back to Dashboard"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 max-w-7xl mx-auto animate-in fade-in duration-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    ProjectOverviewContent,
    {
      project,
      tasks,
      onProjectUpdate: setProject,
      showBackButton: true,
      showKanbanButton: true
    }
  ) });
}
export {
  ProjectOverview as default
};
