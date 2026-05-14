import { ad as createLucideIcon, l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, Q as Label, I as Input, U as DialogFooter, B as Button, ax as api, bI as normalizeNumber, T as TrendingUp, aj as FileText, Y as Badge, S as Skeleton, bJ as ChartColumn, a as CircleCheck, C as CircleAlert, z as cn, H as useParams, u as useNavigate, F as useToast, v as useUser, bj as Shield, aB as Building2, a1 as Pencil, ar as DropdownMenu, as as DropdownMenuTrigger, aF as Ellipsis, au as DropdownMenuContent, av as DropdownMenuItem, a2 as Trash2, ak as ExternalLink, bf as FolderKanban, Z as ChevronDown, P as Plus, ag as User, aC as Mail, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription, a8 as AlertDialogFooter, a9 as AlertDialogCancel, aa as AlertDialogAction, x as projectService, q as Check, aR as Copy } from "./index-C4ZP3eFM.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent, d as CardDescription } from "./card-5_9pbgKs.js";
import { c as clientService } from "./clientService-Cp6DDAHT.js";
import { E as EstimateDialog, e as estimateService } from "./EstimateDialog-fDGlM0A0.js";
import { C as ClientDialog } from "./ClientDialog-BBSNwwR8.js";
import { C as Checkbox } from "./checkbox-qHm_4cmk.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-DRavPKwG.js";
import { P as Package, I as InvoiceList, F as FolderOpen, b as InvoiceViewDialog, a as InvoiceUploadDialog, i as invoiceService } from "./InvoiceList-a4nBPcEP.js";
import { D as DollarSign, R as Receipt } from "./receipt-BPWO68lI.js";
import { T as TrendingDown } from "./trending-down-DJZzQmVx.js";
import { W as Wallet } from "./alert-ZV6Vs13A.js";
import { A as ArrowLeft } from "./arrow-left-84kdjEmA.js";
import { G as Globe } from "./globe-CuQXKfU6.js";
import { P as Phone } from "./truck-wtuWzB4V.js";
import { C as Clock } from "./clock-C-1UQMq-.js";
import "./select-Beq9iUV3.js";
import "./index-D6Uc8srH.js";
import "./chevrons-up-down-DISs2Pfx.js";
import "./file-DZtoCEiO.js";
import "./cloud-upload-CSttdRmy.js";
import "./circle-check-big-Cwck6DPV.js";
import "./download-qf94484n.js";
import "./calendar-B2-LyEnc.js";
const Radio = createLucideIcon("Radio", [
  ["path", { d: "M4.9 19.1C1 15.2 1 8.8 4.9 4.9", key: "1vaf9d" }],
  ["path", { d: "M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5", key: "u1ii0m" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
  ["path", { d: "M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5", key: "1j5fej" }],
  ["path", { d: "M19.1 4.9C23 8.8 23 15.1 19.1 19", key: "10b0cb" }]
]);
const Star = createLucideIcon("Star", [
  [
    "path",
    {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
      key: "r04s7s"
    }
  ]
]);
function ContactDialog({
  open,
  onOpenChange,
  onSave,
  editContact
}) {
  const [formData, setFormData] = reactExports.useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    is_primary: false
  });
  reactExports.useEffect(() => {
    if (editContact) {
      setFormData({
        name: editContact.name,
        title: editContact.title || "",
        email: editContact.email || "",
        phone: editContact.phone || "",
        is_primary: editContact.is_primary
      });
    } else {
      setFormData({
        name: "",
        title: "",
        email: "",
        phone: "",
        is_primary: false
      });
    }
  }, [editContact, open]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "sm:max-w-[425px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editContact ? "Edit Contact" : "Add New Contact" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editContact ? "Update contact details for this client." : "Add a new contact person to this client's profile." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4 px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Full Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "name",
            value: formData.name,
            onChange: (e) => setFormData({ ...formData, name: e.target.value }),
            placeholder: "John Doe",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "title", children: "Job Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "title",
            value: formData.title,
            onChange: (e) => setFormData({ ...formData, title: e.target.value }),
            placeholder: "Marketing Manager"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "email",
            type: "email",
            value: formData.email,
            onChange: (e) => setFormData({ ...formData, email: e.target.value }),
            placeholder: "john.doe@client.com"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phone", children: "Phone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "phone",
            value: formData.phone,
            onChange: (e) => setFormData({ ...formData, phone: e.target.value }),
            placeholder: "+1 (555) 123-4567"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Checkbox,
          {
            id: "is_primary",
            checked: formData.is_primary,
            onCheckedChange: (checked) => setFormData({ ...formData, is_primary: checked === true })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 leading-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Label,
            {
              htmlFor: "is_primary",
              className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              children: "Primary Contact"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mark this person as the main point of contact for the client." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: editContact ? "Save Changes" : "Add Contact" })
    ] })
  ] }) }) });
}
const mapInvoice = (invoice) => ({
  projectId: invoice.project_id,
  projectName: invoice.project_name,
  invoiceNumber: invoice.invoice_number,
  amount: invoice.amount,
  currency: invoice.currency,
  isPhysical: invoice.is_physical,
  deliveryStatus: invoice.delivery_status,
  isPaid: invoice.is_paid
});
const mapClientFinancialDashboard = (raw) => ({
  clientId: raw.client_id,
  clientName: raw.client_name,
  profitability: {
    clientId: raw.profitability.client_id,
    totalProjects: raw.profitability.total_projects,
    totalRevenue: normalizeNumber(raw.profitability.total_revenue),
    totalCost: normalizeNumber(raw.profitability.total_cost),
    totalProfit: normalizeNumber(raw.profitability.total_profit),
    profitMarginPercentage: normalizeNumber(raw.profitability.profit_margin_percentage),
    projects: raw.profitability.projects.map((project) => ({
      id: project.id,
      name: project.name,
      revenue: normalizeNumber(project.revenue),
      cost: normalizeNumber(project.cost),
      profit: normalizeNumber(project.profit),
      profitMargin: normalizeNumber(project.profit_margin),
      isInternalProject: project.is_internal_project
    }))
  },
  invoices: {
    totalInvoiced: normalizeNumber(raw.invoices.total_invoiced),
    totalPaid: normalizeNumber(raw.invoices.total_paid),
    totalOutstanding: normalizeNumber(raw.invoices.total_outstanding),
    pendingCount: raw.invoices.pending_count,
    completedCount: raw.invoices.completed_count,
    pendingInvoices: raw.invoices.pending_invoices.map(mapInvoice),
    completedInvoices: raw.invoices.completed_invoices.map(mapInvoice)
  },
  projectStatus: {
    totalProjects: raw.project_status.total_projects,
    statusCounts: raw.project_status.status_counts,
    statusPercentages: Object.fromEntries(
      Object.entries(raw.project_status.status_percentages).map(([k, v]) => [k, normalizeNumber(v)])
    )
  }
});
const financialService = {
  getClientFinancialDashboard: async (clientId) => {
    const response = await api.get(`/clients/${clientId}/financial-dashboard`);
    return mapClientFinancialDashboard(response);
  }
};
const REFRESH_DEBOUNCE_MS = 250;
function ClientFinancialDashboardComponent({ clientId }) {
  const [dashboard, setDashboard] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const refreshTimeoutRef = reactExports.useRef(null);
  const fetchDashboard = reactExports.useCallback(async () => {
    try {
      setLoading(true);
      const response = await financialService.getClientFinancialDashboard(clientId);
      setDashboard(response);
    } catch (error) {
      console.error("Failed to fetch financial dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [clientId]);
  const scheduleRefresh = reactExports.useCallback(() => {
    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = window.setTimeout(() => {
      void fetchDashboard();
    }, REFRESH_DEBOUNCE_MS);
  }, [fetchDashboard]);
  reactExports.useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);
  const subscribedProjectIds = reactExports.useMemo(
    () => dashboard?.profitability.projects.map((project) => project.id) ?? [],
    [dashboard]
  );
  reactExports.useEffect(() => {
    {
      return;
    }
  }, [scheduleRefresh, subscribedProjectIds]);
  reactExports.useEffect(() => () => {
    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current);
    }
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Loading..." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: "-" }) })
    ] }, i)) }) });
  }
  if (!dashboard) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Failed to load financial dashboard" });
  }
  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency
    }).format(amount);
  };
  const safeToFixed = (value, digits) => {
    const num = Number(value);
    return isNaN(num) ? 0 .toFixed(digits) : num.toFixed(digits);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Revenue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(dashboard.profitability.totalRevenue) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "From ",
            dashboard.profitability.totalProjects,
            " projects"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Profit" }),
          dashboard.profitability.totalProfit >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-4 w-4 text-red-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: `text-2xl font-bold ${dashboard.profitability.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`,
              children: formatCurrency(dashboard.profitability.totalProfit)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            safeToFixed(dashboard.profitability.profitMarginPercentage, 2),
            "% margin"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Total Invoiced" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: formatCurrency(dashboard.invoices.totalInvoiced) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            dashboard.invoices.completedCount,
            " paid, ",
            dashboard.invoices.pendingCount,
            " pending"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Outstanding" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-orange-600", children: formatCurrency(dashboard.invoices.totalOutstanding) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            dashboard.invoices.pendingCount,
            " pending invoices"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "h-4 w-4 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Real-time updates are currently unavailable" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "profitability", className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "profitability", children: "Profitability" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "invoices", children: "Invoices" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "projects", children: "Projects" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "profitability", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Project Profitability" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Revenue and profit breakdown by project (including internal projects)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: dashboard.profitability.projects.map((project) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between border-b pb-4 last:border-0",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: project.name }),
                  project.isInternalProject && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: "Internal" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-sm text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Revenue: ",
                    formatCurrency(project.revenue)
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Cost: ",
                    formatCurrency(project.cost)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    className: `font-bold ${project.profit >= 0 ? "text-green-600" : "text-red-600"}`,
                    children: formatCurrency(project.profit)
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                  safeToFixed(project.profitMargin, 2),
                  "% margin"
                ] })
              ] })
            ]
          },
          project.id
        )) }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "invoices", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        InvoiceList,
        {
          clientId,
          showFilters: true,
          onInvoiceClick: (invoice) => {
            console.log("Invoice clicked:", invoice);
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "projects", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Project Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Overview of all projects for this client" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: Object.entries(dashboard.projectStatus.statusCounts).map(([status, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
              count,
              " projects"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
              safeToFixed(dashboard.projectStatus.statusPercentages[status], 1),
              "%"
            ] })
          ] })
        ] }, status)) }) })
      ] }) })
    ] })
  ] });
}
function deriveFromProjects(projects) {
  const totalRevenue = projects.reduce((s, p) => s + (p.totalRevenue ?? 0), 0);
  const totalCost = projects.reduce((s, p) => s + (p.totalCost ?? 0), 0);
  const totalProfit = projects.reduce((s, p) => s + (p.actualProfit ?? (p.totalRevenue ?? 0) - (p.totalCost ?? 0)), 0);
  const profitMarginPct = totalRevenue > 0 ? totalProfit / totalRevenue * 100 : 0;
  const totalBudget = projects.reduce((s, p) => s + (p.budget_allocated ?? 0), 0);
  return {
    totalRevenue,
    totalCost,
    totalProfit,
    profitMarginPct,
    totalProjects: projects.length,
    totalBudget,
    invoiced: 0,
    paid: 0,
    outstanding: 0,
    pendingCount: 0
  };
}
function deriveFromDashboard(dashboard, projects) {
  const { profitability, invoices } = dashboard;
  return {
    totalRevenue: profitability.totalRevenue,
    totalCost: profitability.totalCost,
    totalProfit: profitability.totalProfit,
    profitMarginPct: profitability.profitMarginPercentage,
    totalProjects: profitability.totalProjects,
    totalBudget: projects.reduce((s, p) => s + (p.budget_allocated ?? 0), 0),
    invoiced: invoices.totalInvoiced,
    paid: invoices.totalPaid,
    outstanding: invoices.totalOutstanding,
    pendingCount: invoices.pendingCount
  };
}
function ClientFinanceSummaryCard({ clientId, projects }) {
  const [dashboard, setDashboard] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(!!clientId);
  reactExports.useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    financialService.getClientFinancialDashboard(clientId).then(setDashboard).catch(console.error).finally(() => setLoading(false));
  }, [clientId]);
  const fmt = (n) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-sm bg-card/50 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-52" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 w-full rounded-xl" }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3 pt-2", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i)) })
      ] })
    ] });
  }
  const stats = clientId && dashboard ? deriveFromDashboard(dashboard, projects) : deriveFromProjects(projects);
  const {
    totalRevenue,
    totalCost,
    totalProfit,
    profitMarginPct,
    totalProjects,
    totalBudget,
    invoiced,
    paid,
    outstanding,
    pendingCount
  } = stats;
  const isProfit = totalProfit >= 0;
  const hasInvoices = invoiced > 0;
  const budgetPct = totalBudget > 0 ? Math.min(totalCost / totalBudget * 100, 100) : 0;
  const collectedPct = invoiced > 0 ? Math.min(paid / invoiced * 100, 100) : 0;
  const budgetBarColor = budgetPct > 90 ? "bg-red-500" : budgetPct > 70 ? "bg-orange-400" : "bg-primary";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-sm bg-card/50 backdrop-blur-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xl font-semibold flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-5 w-5 text-primary" }),
      "Financial Overview",
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Badge,
        {
          variant: isProfit ? "default" : "destructive",
          className: "ml-auto text-xs font-normal",
          children: [
            isProfit ? "+" : "",
            profitMarginPct.toFixed(1),
            "% margin"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatTile,
          {
            label: "Total Revenue",
            value: fmt(totalRevenue),
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 text-primary" }),
            sub: `${totalProjects} project${totalProjects !== 1 ? "s" : ""}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatTile,
          {
            label: "Budget Allocated",
            value: totalBudget > 0 ? fmt(totalBudget) : "—",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4 text-blue-500" }),
            sub: "across all projects"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatTile,
          {
            label: "Total Costs",
            value: fmt(totalCost),
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "h-4 w-4 text-orange-500" }),
            sub: "labor & expenses"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatTile,
          {
            label: "Net Profit",
            value: fmt(totalProfit),
            icon: isProfit ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-4 w-4 text-red-500" }),
            sub: `${profitMarginPct.toFixed(1)}% margin`,
            valueClass: isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        totalBudget > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProgressRow,
          {
            label: "Budget Utilization",
            right: `${budgetPct.toFixed(0)}% used`,
            pct: budgetPct,
            barClass: budgetBarColor
          }
        ),
        hasInvoices && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ProgressRow,
          {
            label: "Invoice Collection",
            right: `${fmt(paid)} of ${fmt(invoiced)}`,
            pct: collectedPct,
            barClass: "bg-green-500"
          }
        )
      ] }),
      hasInvoices && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 pt-3 border-t border-border/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          InvoiceTile,
          {
            label: "Invoiced",
            value: fmt(invoiced),
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 text-muted-foreground" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          InvoiceTile,
          {
            label: "Collected",
            value: fmt(paid),
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-green-500" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          InvoiceTile,
          {
            label: "Outstanding",
            value: fmt(outstanding),
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5 text-orange-500" }),
            sub: pendingCount > 0 ? `${pendingCount} pending` : void 0,
            valueClass: outstanding > 0 ? "text-orange-600 dark:text-orange-400" : ""
          }
        )
      ] })
    ] })
  ] });
}
function StatTile({
  label,
  value,
  icon,
  sub,
  valueClass
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-background/60 border border-border/40 p-3 space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide leading-none", children: label }),
      icon
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-lg font-bold leading-tight tabular-nums", valueClass), children: value }),
    sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: sub })
  ] });
}
function ProgressRow({
  label,
  right,
  pct,
  barClass
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: right })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 w-full rounded-full bg-secondary overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn("h-full rounded-full transition-all", barClass),
        style: { width: `${pct}%` }
      }
    ) })
  ] });
}
function InvoiceTile({
  label,
  value,
  icon,
  sub,
  valueClass
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
      icon,
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-sm font-bold tabular-nums", valueClass), children: value }),
    sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: sub })
  ] });
}
const CopyButton = ({ text, label }) => {
  const { toast } = useToast();
  const [copied, setCopied] = reactExports.useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied.`
    });
    setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      variant: "ghost",
      size: "icon",
      className: "h-6 w-6 ml-1 hover:bg-primary/10 transition-colors",
      onClick: handleCopy,
      title: `Copy ${label}`,
      children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3 text-muted-foreground" })
    }
  );
};
function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = reactExports.useState(null);
  const [estimates, setEstimates] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [isClientDialogOpen, setIsClientDialogOpen] = reactExports.useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = reactExports.useState(false);
  const [isEstimateDialogOpen, setIsEstimateDialogOpen] = reactExports.useState(false);
  const [editingContact, setEditingContact] = reactExports.useState(null);
  const [contactToDelete, setContactToDelete] = reactExports.useState(null);
  const [isDeletingClient, setIsDeletingClient] = reactExports.useState(false);
  const [expandedGroupId, setExpandedGroupId] = reactExports.useState(null);
  const [isInvoiceViewOpen, setIsInvoiceViewOpen] = reactExports.useState(false);
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = reactExports.useState(false);
  const [selectedInvoice, setSelectedInvoice] = reactExports.useState();
  const [invoiceToEdit, setInvoiceToEdit] = reactExports.useState();
  const [invoiceToDelete, setInvoiceToDelete] = reactExports.useState();
  const { currentUser, activeRole } = useUser();
  const canManageFinance = activeRole === "admin" || activeRole === "hr";
  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      await invoiceService.delete(invoiceToDelete.id);
      toast({ title: "Invoice Deleted", description: "The invoice has been removed." });
      setInvoiceToDelete(void 0);
      fetchClient();
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      toast({ title: "Error", description: "Failed to delete invoice.", variant: "destructive" });
    }
  };
  const toggleGroup = (groupId) => {
    setExpandedGroupId((prev) => prev === groupId ? null : groupId);
  };
  const collapseAllGroups = () => {
    setExpandedGroupId(null);
  };
  const fetchClient = async () => {
    if (!id) return;
    setLoading(true);
    try {
      if (id === "internal") {
        const projects = await projectService.getAll();
        const internalProjects = projects.filter((p) => !p.clientId);
        setClient({
          id: "internal",
          company_name: "Internal Project",
          industry: "Internal Operations",
          email: "internal@aura.artslab",
          notes: "This is a virtual client group representing all projects that do not have an external client associated with them.",
          projects: internalProjects,
          contacts: []
        });
      } else {
        const data = await clientService.getById(id);
        setClient(data);
        try {
          const estData = await estimateService.getAll(id);
          setEstimates(estData);
        } catch {
        }
      }
    } catch (error) {
      console.error("Failed to fetch client:", error);
      toast({
        title: "Error",
        description: "Failed to load client details.",
        variant: "destructive"
      });
      navigate("/clients");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    fetchClient();
  }, [id]);
  const handleSaveClient = async (clientData) => {
    if (!client) return;
    try {
      const updated = await clientService.update(client.id, clientData);
      setClient((prev) => prev ? { ...prev, ...updated } : null);
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
  const handleSaveContact = async (contactData) => {
    if (!client) return;
    try {
      if (editingContact) {
        const updated = await clientService.updateContact(client.id, editingContact.id, contactData);
        setClient((prev) => prev ? {
          ...prev,
          contacts: prev.contacts?.map((c) => c.id === editingContact.id ? updated : contactData.is_primary ? { ...c, is_primary: false } : c)
        } : null);
        toast({ title: "Contact updated", description: "Contact details have been saved." });
      } else {
        const created = await clientService.addContact(client.id, contactData);
        setClient((prev) => prev ? {
          ...prev,
          contacts: contactData.is_primary ? [created, ...prev.contacts?.map((c) => ({ ...c, is_primary: false })) || []] : [...prev.contacts || [], created]
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
      setClient((prev) => prev ? {
        ...prev,
        contacts: prev.contacts?.filter((c) => c.id !== contactToDelete.id)
      } : null);
      toast({ title: "Contact deleted", description: "Contact has been removed.", variant: "destructive" });
      setContactToDelete(null);
    } catch (error) {
      console.error("Failed to delete contact:", error);
      toast({ title: "Error", description: "Failed to delete contact.", variant: "destructive" });
    }
  };
  const handleSaveEstimate = async (payload) => {
    try {
      const created = await estimateService.create(payload);
      setEstimates((prev) => [created, ...prev]);
      toast({ title: "Estimate created successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to create estimate.", variant: "destructive" });
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-10 rounded-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-64" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-1 space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-3/4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-1/4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full" })
          ] })
        ] }) })
      ] })
    ] });
  }
  if (!client) return null;
  const groupedProjects = {
    groups: [],
    ungrouped: []
  };
  if (client.projects) {
    const groupMap = /* @__PURE__ */ new Map();
    client.projects.forEach((project) => {
      if (project.group?.id) {
        const groupId = String(project.group.id);
        if (!groupMap.has(groupId)) {
          groupMap.set(groupId, { group: project.group, projects: [] });
        }
        groupMap.get(groupId).projects.push(project);
      } else {
        groupedProjects.ungrouped.push(project);
      }
    });
    groupedProjects.groups = Array.from(groupMap.values());
  }
  const renderProjectCard = (project) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      onClick: () => navigate(`/project/${project.id}/overview`),
      className: "p-4 rounded-xl border bg-background/50 hover:bg-muted/30 transition-all cursor-pointer group border-border/50 hover:border-primary/20",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground group-hover:text-primary transition-colors", children: project.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-[10px] px-2 py-0 h-4 capitalize font-normal", children: project.status || "active" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
            project.estimatedHours || 0,
            "h"
          ] }),
          project.department && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] px-2 py-0 h-4 font-normal", children: project.department.name })
        ] })
      ]
    },
    project.id
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => navigate("/clients"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 text-primary p-2 rounded-lg", children: id === "internal" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-8 w-8" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-8 w-8" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: client.company_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: client.industry || "Industry unspecified" }),
            client.website && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: client.website, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-primary hover:underline flex items-center gap-1 ml-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3 w-3" }),
              client.website.replace(/^https?:\/\//, "")
            ] })
          ] })
        ] })
      ] }),
      id !== "internal" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setIsClientDialogOpen(true), className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }),
          "Edit Client"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            DropdownMenuItem,
            {
              className: "text-destructive focus:text-destructive",
              onClick: () => setIsDeletingClient(true),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                "Delete Client"
              ]
            }
          ) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-sm bg-card/50 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xl font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-5 w-5 text-primary" }),
            "Company Profile"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Industry" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: client.industry || "Not specified" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Website" }),
                client.website ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: client.website, target: "_blank", rel: "noreferrer", className: "text-sm font-medium text-primary hover:underline flex items-center gap-1", children: [
                  client.website,
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground italic", children: "No website" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Primary Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: client.email || "Not specified" }),
                  client.email && /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton, { text: client.email, label: "Primary Email" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Primary Phone" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: client.phone || "Not specified" }),
                  client.phone && /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton, { text: client.phone, label: "Primary Phone" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Address" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium whitespace-pre-line", children: client.address || "No address provided" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-4 border-t", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Internal Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap", children: client.notes || "No internal notes available." })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ClientFinanceSummaryCard,
          {
            clientId: typeof client?.id === "number" ? client.id : void 0,
            projects: client.projects ?? []
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-sm bg-card/50 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xl font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FolderKanban, { className: "h-5 w-5 text-primary" }),
              "Associated Projects"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              expandedGroupId && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: collapseAllGroups,
                  className: "text-[10px] h-6 px-2 text-muted-foreground hover:text-primary font-medium",
                  children: "Collapse All"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "font-normal", children: [
                client.projects?.length || 0,
                " Total"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-6", children: client.projects && client.projects.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            groupedProjects.groups.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: groupedProjects.groups.map(({ group, projects }) => {
              const isExpanded = expandedGroupId === String(group.id);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "flex items-center gap-2 px-1 cursor-pointer group/group-header",
                    onClick: () => toggleGroup(String(group.id)),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        !isExpanded && "-rotate-90"
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { className: "h-4 w-4 text-primary/70" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-foreground/80 group-hover/group-header:text-primary transition-colors", children: group.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] h-4 px-1.5 font-normal", children: projects.length }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-grow bg-border/40 ml-2" })
                    ]
                  }
                ),
                isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200", children: projects.map((project) => renderProjectCard(project)) })
              ] }, group.id);
            }) }),
            groupedProjects.ungrouped.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              groupedProjects.groups.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-foreground/80", children: "Other Projects" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-grow bg-border/40 ml-2" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: groupedProjects.ungrouped.map((project) => renderProjectCard(project)) })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-12 text-center space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FolderKanban, { className: "h-10 w-10 text-muted-foreground mx-auto opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "No projects found for this client." })
          ] }) })
        ] }),
        id !== "internal" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-sm bg-card/50 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-xl font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 text-primary" }),
              "Estimates"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "font-normal", children: [
                estimates.length,
                " Total"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", onClick: () => setIsEstimateDialogOpen(true), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: estimates.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            estimates.map((est) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                onClick: () => navigate(`/estimates/${est.id}`),
                className: "p-3 rounded-lg border bg-background/50 hover:bg-muted/30 transition-all cursor-pointer group border-border/50 hover:border-primary/20 flex items-center justify-between",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold group-hover:text-primary transition-colors", children: est.title }),
                    est.estimate_number && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-mono", children: [
                      "#",
                      est.estimate_number
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    est.total_amount !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium", children: [
                      est.currency === "LKR" ? "Rs. " : "$",
                      est.total_amount.toFixed(2)
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: `text-[10px] capitalize ${est.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : est.status === "sent" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : est.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`, children: est.status })
                  ] })
                ]
              },
              est.id
            )),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "w-full text-muted-foreground mt-1",
                onClick: () => navigate("/estimates"),
                children: "View All Estimates →"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8 text-muted-foreground mx-auto opacity-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "No estimates for this client." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setIsEstimateDialogOpen(true), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
              " Create Estimate"
            ] })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full border-none shadow-sm bg-card/50 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-lg font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5 text-primary" }),
            "Contacts"
          ] }),
          id !== "internal" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setIsContactDialogOpen(true), className: "h-8 w-8 p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: !client.contacts || client.contacts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 border border-dashed rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No contacts added yet." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: client.contacts.sort((a, b) => a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1).map((contact) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border bg-background/50 hover:bg-muted/30 transition-colors group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: contact.name }),
              contact.is_primary && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-amber-500 text-amber-500" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                setEditingContact(contact);
                setIsContactDialogOpen(true);
              }, className: "text-muted-foreground hover:text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setContactToDelete(contact), className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-2", children: contact.title || "No title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            contact.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground flex items-center justify-between group/item", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 truncate", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3 flex-shrink-0" }),
                " ",
                contact.email
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "opacity-0 group-hover/item:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton, { text: contact.email, label: "Email" }) })
            ] }),
            contact.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground flex items-center justify-between group/item", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 truncate", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3 flex-shrink-0" }),
                " ",
                contact.phone
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "opacity-0 group-hover/item:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton, { text: contact.phone, label: "Phone" }) })
            ] })
          ] })
        ] }, contact.id)) }) }) })
      ] }) })
    ] }),
    id !== "internal" && typeof client?.id === "number" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5" }),
          "All Invoices"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
          "Invoices for ",
          client.company_name
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        InvoiceList,
        {
          clientId: client.id,
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
      ) })
    ] }) }),
    id !== "internal" && typeof client?.id === "number" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClientFinancialDashboardComponent, { clientId: client.id }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ClientDialog,
      {
        open: isClientDialogOpen,
        onOpenChange: setIsClientDialogOpen,
        onSave: handleSaveClient,
        editClient: client
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ContactDialog,
      {
        open: isContactDialogOpen,
        onOpenChange: (open) => {
          setIsContactDialogOpen(open);
          if (!open) setEditingContact(null);
        },
        onSave: handleSaveContact,
        editContact: editingContact
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: isDeletingClient, onOpenChange: setIsDeletingClient, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Client" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'Are you sure you want to delete "',
          client.company_name,
          '"? All associated contacts and projects will be affected.'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDeleteClient, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!contactToDelete, onOpenChange: (open) => !open && setContactToDelete(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Remove Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'Are you sure you want to remove "',
          contactToDelete?.name,
          '"?'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDeleteContact, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Remove" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EstimateDialog,
      {
        open: isEstimateDialogOpen,
        onOpenChange: setIsEstimateDialogOpen,
        onSave: handleSaveEstimate,
        clients: client ? [client] : [],
        projects: client?.projects || [],
        defaultClientId: typeof client?.id === "number" ? client.id : void 0
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      InvoiceViewDialog,
      {
        open: isInvoiceViewOpen,
        onOpenChange: setIsInvoiceViewOpen,
        invoice: selectedInvoice
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      InvoiceUploadDialog,
      {
        open: isAddInvoiceOpen,
        onOpenChange: setIsAddInvoiceOpen,
        clientId: typeof client.id === "number" ? client.id : void 0,
        projects: client.projects || [],
        onSuccess: () => {
          fetchClient();
          setIsAddInvoiceOpen(false);
        },
        completeProject: false,
        invoice: invoiceToEdit
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!invoiceToDelete, onOpenChange: (open) => !open && setInvoiceToDelete(void 0), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Invoice" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Are you sure you want to delete this invoice? This action cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDeleteInvoice, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete" })
      ] })
    ] }) })
  ] });
}
export {
  ClientProfile as default
};
