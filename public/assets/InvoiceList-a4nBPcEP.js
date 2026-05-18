import { ad as createLucideIcon, ax as api, F as useToast, l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, Q as Label, I as Input, P as Plus, B as Button, X, U as DialogFooter, L as LoaderCircle, aC as Mail, x as projectService, z as cn, ak as ExternalLink, G as Search, S as Skeleton, C as CircleAlert, aj as FileText, aJ as RefreshCw, aB as Building2, al as Eye, a2 as Trash2, Y as Badge } from "./index-C4ZP3eFM.js";
import { C as Checkbox } from "./checkbox-qHm_4cmk.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { F as File$1 } from "./file-DZtoCEiO.js";
import { C as CloudUpload } from "./cloud-upload-CSttdRmy.js";
import { T as Truck } from "./truck-wtuWzB4V.js";
import { C as CircleCheckBig } from "./circle-check-big-Cwck6DPV.js";
import { D as Download } from "./download-qf94484n.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-5_9pbgKs.js";
import { A as Alert, a as AlertDescription } from "./alert-ZV6Vs13A.js";
import { C as Calendar } from "./calendar-B2-LyEnc.js";
import { D as DollarSign } from "./receipt-BPWO68lI.js";
const FolderOpen = createLucideIcon("FolderOpen", [
  [
    "path",
    {
      d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
      key: "usdka0"
    }
  ]
]);
const MapPin = createLucideIcon("MapPin", [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
]);
const Package = createLucideIcon("Package", [
  [
    "path",
    {
      d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",
      key: "1a0edw"
    }
  ],
  ["path", { d: "M12 22V12", key: "d0xqtd" }],
  ["path", { d: "m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7", key: "yx3hmr" }],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }]
]);
const Pen = createLucideIcon("Pen", [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ]
]);
const RotateCcw = createLucideIcon("RotateCcw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
const Save = createLucideIcon("Save", [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
]);
const transformInvoice = (raw) => ({
  id: raw.id,
  source: raw.source,
  projectId: raw.project_id,
  clientId: raw.client_id,
  invoiceNumber: raw.invoice_number,
  invoiceType: raw.invoice_type,
  status: raw.status,
  amount: raw.amount,
  currency: raw.currency,
  issuedAt: raw.issued_at,
  dueDate: raw.due_date,
  xeroInvoiceId: raw.xero_invoice_id,
  xeroStatus: raw.xero_status,
  description: raw.description,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
  project: raw.project,
  client: raw.client ? {
    id: raw.client.id,
    companyName: raw.client.company_name
  } : void 0,
  invoiceDocument: raw.invoice_document_url || raw.invoice_document,
  isPhysicalInvoice: Boolean(raw.is_physical_invoice),
  courierTrackingNumber: raw.courier_tracking_number,
  courierDeliveryStatus: raw.courier_delivery_status
});
const invoiceService = {
  /**
   * Get all invoices with optional filters
   */
  async getAll(filters) {
    const params = new URLSearchParams();
    if (filters?.source) params.append("source", filters.source);
    if (filters?.projectId) params.append("project_id", String(filters.projectId));
    if (filters?.clientId) params.append("client_id", String(filters.clientId));
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.perPage) params.append("per_page", String(filters.perPage));
    const response = await api.get(`/invoices?${params.toString()}`);
    return {
      data: response.data.map(transformInvoice),
      total: response.total || response.data.length
    };
  },
  /**
   * Get invoices for a specific project
   */
  async getByProject(projectId) {
    const response = await api.get(`/invoices?project_id=${projectId}`);
    return response.data.map(transformInvoice);
  },
  /**
   * Get invoices for a specific client
   */
  async getByClient(clientId) {
    const response = await api.get(`/invoices?client_id=${clientId}`);
    return response.data.map(transformInvoice);
  },
  /**
   * Get a single invoice by ID
   */
  async getById(id) {
    const response = await api.get(`/invoices/${id}`);
    return transformInvoice(response);
  },
  /**
   * Create a new invoice
   */
  async create(data) {
    const isFormData = data.invoiceDocument instanceof File;
    let payload;
    if (isFormData) {
      payload = new FormData();
      payload.append("source", data.source);
      if (data.projectId) payload.append("project_id", String(data.projectId));
      if (data.clientId) payload.append("client_id", String(data.clientId));
      if (data.invoiceNumber) payload.append("invoice_number", data.invoiceNumber);
      if (data.invoiceType) payload.append("invoice_type", data.invoiceType);
      if (data.status) payload.append("status", data.status);
      if (data.amount !== void 0) payload.append("amount", String(data.amount));
      if (data.currency) payload.append("currency", data.currency);
      if (data.issuedAt) payload.append("issued_at", data.issuedAt);
      if (data.dueDate) payload.append("due_date", data.dueDate);
      if (data.description) payload.append("description", data.description);
      if (data.invoiceDocument) payload.append("invoice_document", data.invoiceDocument);
      if (data.isPhysicalInvoice !== void 0) payload.append("is_physical_invoice", data.isPhysicalInvoice ? "1" : "0");
      if (data.courierTrackingNumber) payload.append("courier_tracking_number", data.courierTrackingNumber);
    } else {
      payload = {
        source: data.source,
        project_id: data.projectId,
        client_id: data.clientId,
        invoice_number: data.invoiceNumber,
        invoice_type: data.invoiceType,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        issued_at: data.issuedAt,
        due_date: data.dueDate,
        xero_invoice_id: data.xeroInvoiceId,
        xero_status: data.xeroStatus,
        description: data.description,
        is_physical_invoice: data.isPhysicalInvoice,
        courier_tracking_number: data.courierTrackingNumber
      };
    }
    const response = await api.post("/invoices", payload);
    return transformInvoice(response);
  },
  /**
   * Update an existing invoice
   */
  async update(id, data) {
    const payload = {};
    if (data.source) payload.source = data.source;
    if (data.projectId !== void 0) payload.project_id = data.projectId;
    if (data.clientId !== void 0) payload.client_id = data.clientId;
    if (data.invoiceNumber !== void 0) payload.invoice_number = data.invoiceNumber;
    if (data.invoiceType !== void 0) payload.invoice_type = data.invoiceType;
    if (data.status !== void 0) payload.status = data.status;
    if (data.amount !== void 0) payload.amount = data.amount;
    if (data.currency !== void 0) payload.currency = data.currency;
    if (data.issuedAt !== void 0) payload.issued_at = data.issuedAt;
    if (data.dueDate !== void 0) payload.due_date = data.dueDate;
    if (data.xeroInvoiceId !== void 0) payload.xero_invoice_id = data.xeroInvoiceId;
    if (data.xeroStatus !== void 0) payload.xero_status = data.xeroStatus;
    if (data.description !== void 0) payload.description = data.description;
    if (data.isPhysicalInvoice !== void 0) payload.is_physical_invoice = data.isPhysicalInvoice;
    if (data.courierTrackingNumber !== void 0) payload.courier_tracking_number = data.courierTrackingNumber;
    if (data.courierDeliveryStatus !== void 0) payload.courier_delivery_status = data.courierDeliveryStatus;
    const response = await api.put(`/invoices/${id}`, payload);
    return transformInvoice(response);
  },
  /**
   * Delete an invoice
   */
  async delete(id) {
    await api.delete(`/invoices/${id}`);
  }
};
function InvoiceUploadDialog({
  open,
  onOpenChange,
  project,
  clientId,
  projects = [],
  onSuccess,
  completeProject = true,
  invoice
}) {
  const { toast } = useToast();
  const [invoiceNumber, setInvoiceNumber] = reactExports.useState("");
  const [invoiceDocument, setInvoiceDocument] = reactExports.useState();
  const [amount, setAmount] = reactExports.useState("");
  const [currency, setCurrency] = reactExports.useState(project?.currency || "LKR");
  const [dueDate, setDueDate] = reactExports.useState("");
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const [isDragging, setIsDragging] = reactExports.useState(false);
  const [isSendingEmail, setIsSendingEmail] = reactExports.useState(false);
  const [isPhysicalInvoice, setIsPhysicalInvoice] = reactExports.useState(false);
  const [courierTrackingNumber, setCourierTrackingNumber] = reactExports.useState("");
  const [invoiceType, setInvoiceType] = reactExports.useState("Complete");
  const [customInvoiceType, setCustomInvoiceType] = reactExports.useState("");
  const [selectedProjectId, setSelectedProjectId] = reactExports.useState(project?.id ? String(project.id) : "");
  reactExports.useEffect(() => {
    if (open) {
      if (invoice) {
        setInvoiceNumber(invoice.invoiceNumber || "");
        setAmount(invoice.amount?.toString() || "");
        setCurrency(invoice.currency || project?.currency || "LKR");
        setDueDate(invoice.dueDate?.split("T")[0] || "");
        setIsPhysicalInvoice(!!invoice.isPhysicalInvoice);
        setCourierTrackingNumber(invoice.courierTrackingNumber || "");
        setSelectedProjectId(invoice.projectId ? String(invoice.projectId) : "");
        const knownTypes = ["Advance", "Milestone", "Complete"];
        if (invoice.invoiceType && knownTypes.includes(invoice.invoiceType)) {
          setInvoiceType(invoice.invoiceType);
          setCustomInvoiceType("");
        } else if (invoice.invoiceType) {
          setInvoiceType("custom");
          setCustomInvoiceType(invoice.invoiceType);
        }
        setInvoiceDocument(void 0);
      } else {
        resetForm();
      }
    }
  }, [invoice, project, open]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetProjectId = selectedProjectId || (project?.id ? String(project.id) : void 0);
    const targetClientId = clientId || project?.clientId;
    setIsUploading(true);
    try {
      let updatedProject = project;
      if (invoice) {
        await invoiceService.update(invoice.id, {
          projectId: targetProjectId ? parseInt(targetProjectId) : void 0,
          clientId: targetClientId,
          invoiceNumber,
          invoiceType: invoiceType === "custom" ? customInvoiceType : invoiceType,
          invoiceDocument,
          // Only if new file selected
          isPhysicalInvoice,
          courierTrackingNumber: isPhysicalInvoice ? courierTrackingNumber : void 0,
          amount: amount ? parseFloat(amount) : void 0,
          currency,
          dueDate: dueDate || void 0
        });
      } else {
        if (completeProject && targetProjectId) {
          updatedProject = await projectService.update(targetProjectId, {
            status: "completed",
            invoice_number: invoiceNumber,
            invoice_document: invoiceDocument,
            isPhysicalInvoice,
            courierTrackingNumber: isPhysicalInvoice ? courierTrackingNumber : void 0
          });
        }
        await invoiceService.create({
          source: "manual",
          projectId: targetProjectId ? parseInt(targetProjectId) : void 0,
          clientId: targetClientId,
          invoiceNumber,
          invoiceType: invoiceType === "custom" ? customInvoiceType : invoiceType,
          invoiceDocument,
          isPhysicalInvoice,
          courierTrackingNumber: isPhysicalInvoice ? courierTrackingNumber : void 0,
          status: isPhysicalInvoice ? "pending" : "sent",
          amount: amount ? parseFloat(amount) : void 0,
          currency: currency || project?.currency || "LKR",
          issuedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          dueDate: dueDate || void 0,
          description: `Invoice ${invoiceNumber} for ${project?.name || "Client"}`
        });
        if (completeProject && !isPhysicalInvoice) {
          setIsSendingEmail(true);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setIsSendingEmail(false);
        }
      }
      onSuccess(updatedProject);
      onOpenChange(false);
      resetForm();
      toast({
        title: invoice ? "Invoice Updated" : completeProject ? "Invoice Uploaded" : "Invoice Added",
        description: invoice ? "Invoice details have been updated." : completeProject ? isPhysicalInvoice ? "Invoice has been uploaded. Tracking info is available in the invoice viewer." : "Invoice has been uploaded and email sent to the client." : "Invoice has been added to this project."
      });
    } catch (error) {
      console.error("Failed to save invoice:", error);
      const errorData = error.response?.data;
      const message = errorData?.errors ? Object.values(errorData.errors).flat().join(", ") : errorData?.message || "Failed to save invoice.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      setIsSendingEmail(false);
    }
  };
  const resetForm = () => {
    setInvoiceNumber("");
    setInvoiceDocument(void 0);
    setAmount("");
    setCurrency(project?.currency || "LKR");
    setDueDate("");
    setIsPhysicalInvoice(false);
    setCourierTrackingNumber("");
    setInvoiceType("Complete");
    setCustomInvoiceType("");
    setSelectedProjectId(project?.id ? String(project.id) : "");
  };
  const canSubmit = invoiceNumber.trim() !== "" && (!!invoice || !!invoiceDocument);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    onOpenChange(v);
    if (!v) resetForm();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogContent,
    {
      className: "sm:max-w-[450px]",
      onPointerDownOutside: (e) => e.preventDefault(),
      onInteractOutside: (e) => e.preventDefault(),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: invoice ? "Edit Invoice" : completeProject && project ? "Upload Invoice" : "Add Invoice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: invoice ? `Updating details for invoice ${invoice.invoiceNumber}.` : completeProject && project ? `Complete the project by uploading the final invoice. Linked to PO: ${project.poNumber || "N/A"}.` : `Add an invoice record for ${project?.name || "this client"}.` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "invoiceNumber", children: "Invoice Number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "invoiceNumber",
                value: invoiceNumber,
                onChange: (e) => setInvoiceNumber(e.target.value),
                placeholder: "Enter Invoice Number",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: invoiceType, onValueChange: setInvoiceType, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Purpose" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Advance", children: "Advance" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Milestone", children: "Milestone" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Complete", children: "Complete" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "custom", children: "Custom..." })
              ] })
            ] })
          ] }),
          invoiceType === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 animate-in fade-in slide-in-from-top-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "customInvoiceType", children: "Custom Purpose" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "customInvoiceType",
                  value: customInvoiceType,
                  onChange: (e) => setCustomInvoiceType(e.target.value),
                  placeholder: "e.g. Deposit, Retainer",
                  className: "pr-10"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "amount", children: "Amount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "amount",
                  type: "number",
                  min: "0",
                  step: "0.01",
                  value: amount,
                  onChange: (e) => setAmount(e.target.value),
                  placeholder: "0.00"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "currency", children: "Currency" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: currency, onValueChange: setCurrency, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "currency", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "LKR" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LKR", children: "LKR" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "USD", children: "USD" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dueDate", children: "Due Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "dueDate",
                type: "date",
                value: dueDate,
                onChange: (e) => setDueDate(e.target.value)
              }
            )
          ] }),
          !project && projects.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "projectSelect", children: "Project (Optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedProjectId, onValueChange: setSelectedProjectId, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "projectSelect", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select Project" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "None (General Client Invoice)" }),
                projects.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(p.id), children: p.name }, p.id))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "poNumberDisplay", children: "Linked PO Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "poNumberDisplay",
                value: project?.poNumber || (selectedProjectId && selectedProjectId !== "none" ? projects.find((p) => String(p.id) === selectedProjectId)?.poNumber : "") || "No PO linked",
                disabled: true,
                className: "bg-muted"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                id: "isPhysicalInvoice",
                checked: isPhysicalInvoice,
                onCheckedChange: (checked) => setIsPhysicalInvoice(!!checked)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "isPhysicalInvoice", className: "text-sm font-medium leading-none", children: "This is a physical invoice (Courier required)" })
          ] }),
          isPhysicalInvoice && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 animate-in fade-in slide-in-from-top-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "courierTrackingNumber", children: "Courier Tracking Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "courierTrackingNumber",
                value: courierTrackingNumber,
                onChange: (e) => setCourierTrackingNumber(e.target.value),
                placeholder: "Enter Tracking Number",
                required: isPhysicalInvoice
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "invoiceDocument", children: invoice ? "Replace Invoice Document (Optional)" : "Upload Invoice Document *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors
								${isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"}`,
                onDragOver: (e) => {
                  e.preventDefault();
                  setIsDragging(true);
                },
                onDragLeave: (e) => {
                  e.preventDefault();
                  setIsDragging(false);
                },
                onDrop: (e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) setInvoiceDocument(file);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 text-center", children: invoiceDocument ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(File$1, { className: "mx-auto h-12 w-12 text-primary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-medium", children: invoiceDocument.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    (invoiceDocument.size / 1024 / 1024).toFixed(2),
                    " MB"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "mt-2 text-destructive hover:text-destructive",
                      onClick: () => setInvoiceDocument(void 0),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 mr-1" }),
                        " Remove"
                      ]
                    }
                  )
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUpload, { className: "mx-auto h-12 w-12 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center text-sm text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "label",
                      {
                        htmlFor: "invoiceDocument",
                        className: "relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Upload a file" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Input,
                            {
                              id: "invoiceDocument",
                              type: "file",
                              className: "sr-only",
                              accept: ".pdf,.png,.jpg,.jpeg",
                              onChange: (e) => {
                                const file = e.target.files?.[0];
                                if (file) setInvoiceDocument(file);
                              }
                            }
                          )
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "pl-1", children: "or drag and drop" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "PDF, PNG, JPG up to 10MB" })
                ] }) })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex flex-col sm:flex-row gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => onOpenChange(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: isUploading || isSendingEmail || !canSubmit, children: isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
            "Saving..."
          ] }) : isSendingEmail ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "mr-2 h-4 w-4 animate-pulse" }),
            "Sending Email..."
          ] }) : invoice ? "Update Invoice" : completeProject ? "Upload & Complete" : "Add Invoice" })
        ] })
      ] })
    }
  ) });
}
const DELIVERY_STATUSES = [
  { value: "pending", label: "Processing", icon: Package, color: "text-indigo-500", bgColor: "bg-indigo-500" },
  { value: "shipped", label: "Shipped", icon: Truck, color: "text-amber-500", bgColor: "bg-amber-500" },
  { value: "delivered", label: "Delivered", icon: CircleCheckBig, color: "text-emerald-500", bgColor: "bg-emerald-500" },
  { value: "returned", label: "Returned", icon: RotateCcw, color: "text-rose-500", bgColor: "bg-rose-500" }
];
function InvoiceViewDialog({ open, onOpenChange, url: propUrl, project, invoice, onSuccess }) {
  const { toast } = useToast();
  const displayInvoiceNumber = invoice?.invoiceNumber || project?.invoiceNumber || "N/A";
  const displayUrl = invoice?.invoiceDocument || propUrl || project?.invoiceDocumentUrl || "";
  const displayCreatedAt = invoice?.createdAt || project?.createdAt;
  const isPhysicalInvoice = invoice?.isPhysicalInvoice ?? project?.isPhysicalInvoice ?? false;
  const trackingNo = invoice?.courierTrackingNumber || project?.courierTrackingNumber || "";
  const deliveryStatus = invoice?.courierDeliveryStatus || project?.courierDeliveryStatus || "pending";
  const poNo = project?.poNumber || "N/A";
  const clientName = invoice?.client?.companyName || project?.client?.company_name || "N/A";
  const [status, setStatus] = reactExports.useState(deliveryStatus);
  const [isUpdating, setIsUpdating] = reactExports.useState(false);
  const [isPhysical, setIsPhysical] = reactExports.useState(isPhysicalInvoice);
  const [trackingNumber, setTrackingNumber] = reactExports.useState(trackingNo);
  const [showEditTracking, setShowEditTracking] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setStatus(deliveryStatus);
    setIsPhysical(isPhysicalInvoice);
    setTrackingNumber(trackingNo);
  }, [invoice, project, deliveryStatus, isPhysicalInvoice, trackingNo]);
  if (!displayUrl) return null;
  const isPDF = displayUrl.toLowerCase().includes(".pdf") || displayUrl.includes("data:application/pdf");
  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      if (invoice) {
        const updatedInvoice = await invoiceService.update(invoice.id, {
          courierDeliveryStatus: newStatus
        });
        setStatus(newStatus);
        if (onSuccess) onSuccess(updatedInvoice);
      } else if (project) {
        const updatedProject = await projectService.update(String(project.id), {
          courierDeliveryStatus: newStatus
        });
        setStatus(newStatus);
        if (onSuccess) onSuccess(updatedProject);
      }
      toast({
        title: "Status Updated",
        description: `Delivery status changed to ${newStatus}.`
      });
    } catch (error) {
      console.error("Failed to update delivery status:", error);
      toast({
        title: "Update Failed",
        description: "Could not update delivery status.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  const handleUpdateTrackingDetails = async () => {
    setIsUpdating(true);
    try {
      if (invoice) {
        const updatedInvoice = await invoiceService.update(invoice.id, {
          isPhysicalInvoice: isPhysical,
          courierTrackingNumber: trackingNumber
        });
        if (onSuccess) onSuccess(updatedInvoice);
      } else if (project) {
        const updatedProject = await projectService.update(String(project.id), {
          isPhysicalInvoice: isPhysical,
          courierTrackingNumber: trackingNumber
        });
        if (onSuccess) onSuccess(updatedProject);
      }
      setShowEditTracking(false);
      toast({
        title: "Tracking Details Updated",
        description: "Physical invoice settings and tracking number have been saved."
      });
    } catch (error) {
      console.error("Failed to update tracking details:", error);
      toast({
        title: "Update Failed",
        description: "Could not update tracking details.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  const currentStatusIndex = DELIVERY_STATUSES.findIndex((s) => s.value === status);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "max-w-[70rem] w-[95vw] h-[95vh] flex flex-col p-0 overflow-hidden",
      onPointerDownOutside: (e) => e.preventDefault(),
      onInteractOutside: (e) => e.preventDefault(),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "p-4 border-b flex flex-row items-center justify-between space-y-0 bg-background z-10 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "text-xl font-bold flex items-center gap-2", children: [
              "Invoice: ",
              displayInvoiceNumber,
              isPhysical && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
                "text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider",
                DELIVERY_STATUSES.find((s) => s.value === status)?.bgColor || "bg-muted",
                "text-white"
              ), children: DELIVERY_STATUSES.find((s) => s.value === status)?.label || status })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "text-xs", children: [
              "Created on ",
              displayCreatedAt ? new Date(displayCreatedAt).toLocaleDateString() : "N/A"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pr-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "h-8 gap-2",
                onClick: () => window.open(displayUrl, "_blank"),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
                  "Open"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: displayUrl,
                download: true,
                className: "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
                  "Download"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-8 w-8 ml-2 rounded-full hover:bg-muted",
                onClick: () => onOpenChange(false),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-muted/20 relative flex items-center justify-center p-4 overflow-hidden border-r", children: isPDF ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "iframe",
            {
              src: `${displayUrl}#view=FitH`,
              className: "w-full h-full rounded-lg shadow-2xl border bg-white",
              title: "Invoice Document Viewer"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full overflow-auto flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: displayUrl,
              alt: "Invoice Document",
              className: "max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-white"
            }
          ) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-80 flex flex-col bg-background shrink-0 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-primary" }),
                  " Delivery Status"
                ] }),
                isPhysical && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-medium text-muted-foreground italic", children: "Handled via Courier" })
              ] }),
              isPhysical ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative space-y-4", children: DELIVERY_STATUSES.map((s, idx) => {
                  const isActive = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  const Icon = s.icon;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 relative", children: [
                    idx !== DELIVERY_STATUSES.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
                      "absolute left-3.5 top-8 w-0.5 h-6 transition-colors",
                      isActive ? s.bgColor : "bg-muted"
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all",
                      isActive ? s.bgColor + " text-white shadow-lg scale-110" : "bg-muted text-muted-foreground"
                    ), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col pt-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
                        "text-sm font-bold",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      ), children: s.label }),
                      isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground animate-pulse", children: "Current stage" })
                    ] })
                  ] }, s.value);
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Update Current Status" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: status,
                      onValueChange: handleStatusChange,
                      disabled: isUpdating,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "h-9 w-full bg-muted/50 border-none", children: [
                          isUpdating ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin mr-2" }) : null,
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: DELIVERY_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.value, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: `h-3 w-3 ${s.color}` }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s.label })
                        ] }) }, s.value)) })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted px-4 py-3 rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-mono font-bold tracking-tight", children: trackingNumber || "N/A" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "ghost",
                        size: "icon",
                        className: "h-6 w-6 text-primary hover:text-primary/80",
                        onClick: () => window.open(`https://www.google.com/search?q=${trackingNumber}`, "_blank"),
                        title: "Track on Google",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "ghost",
                        size: "icon",
                        className: "h-6 w-6 text-primary hover:text-primary/80",
                        onClick: () => setShowEditTracking(true),
                        title: "Edit tracking info",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-3.5 w-3.5" })
                      }
                    )
                  ] })
                ] }) })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold leading-tight", children: "This invoice is not currently marked for physical delivery." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    className: "w-full text-[10px] h-7 border-amber-500/30 bg-transparent hover:bg-amber-500/10",
                    onClick: () => {
                      setIsPhysical(true);
                      setShowEditTracking(true);
                    },
                    children: "Enable Physical Delivery Tracking"
                  }
                )
              ] })
            ] }),
            showEditTracking && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-4 border-t animate-in fade-in slide-in-from-bottom-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2", children: "Update Tracking Info" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 py-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    id: "edit_isPhysicalInvoice",
                    checked: isPhysical,
                    onCheckedChange: (checked) => setIsPhysical(!!checked)
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "edit_isPhysicalInvoice", className: "text-xs font-medium", children: "Physical Invoice (Courier)" })
              ] }),
              isPhysical && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "edit_trackingNumber", className: "text-xs", children: "Tracking Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "edit_trackingNumber",
                    value: trackingNumber,
                    onChange: (e) => setTrackingNumber(e.target.value),
                    className: "h-8 text-sm",
                    placeholder: "Enter tracking #"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    className: "flex-1 h-8",
                    onClick: handleUpdateTrackingDetails,
                    disabled: isUpdating,
                    children: [
                      isUpdating ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-3.5 w-3.5 mr-2" }),
                      "Save"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    className: "h-8",
                    onClick: () => setShowEditTracking(false),
                    children: "Cancel"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-8 border-t", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold uppercase tracking-wider text-muted-foreground", children: "General Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold text-muted-foreground uppercase", children: "PO Number" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium", children: poNo })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold text-muted-foreground uppercase", children: "Client" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium line-clamp-1", children: clientName })
                ] })
              ] }) })
            ] })
          ] }) })
        ] })
      ]
    }
  ) });
}
function InvoiceList({
  projectId,
  clientId,
  showFilters = true,
  onInvoiceClick,
  onAddInvoice,
  onEditInvoice,
  onDeleteInvoice
}) {
  const [invoices, setInvoices] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [filters, setFilters] = reactExports.useState({
    projectId,
    clientId
  });
  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const activeFilters = {
        ...filters,
        projectId: filters.projectId ?? projectId,
        clientId: filters.clientId ?? clientId
      };
      const { data } = await invoiceService.getAll(activeFilters);
      setInvoices(data);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      setError(err.response?.data?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    loadInvoices();
  }, [projectId, clientId, filters]);
  const formatCurrency = (amount, currency) => {
    if (amount === void 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "LKR"
    }).format(amount);
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  const getStatusBadge = (status, xeroStatus) => {
    const displayStatus = xeroStatus || status || "pending";
    const statusLower = displayStatus.toLowerCase();
    if (statusLower.includes("paid") || statusLower.includes("authorised")) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-500", children: displayStatus });
    }
    if (statusLower.includes("pending") || statusLower.includes("draft")) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: displayStatus });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: displayStatus });
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Invoices" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Loading invoices..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-4 border rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-48" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-64" })
      ] }, i)) })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { variant: "destructive", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, { children: error })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-none shadow-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 text-primary" }),
          "Invoices (",
          invoices.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "View and manage invoices" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        onAddInvoice && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: onAddInvoice, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          "Add Invoice"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: loadInvoices, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: invoices.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No invoices found" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: invoices.map((invoice) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer",
        onClick: () => onInvoiceClick?.(invoice),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: invoice.invoiceNumber || `#${invoice.id}` }),
              getStatusBadge(invoice.status, invoice.xeroStatus)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 text-xs text-muted-foreground", children: [
              invoice.project && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: invoice.project.name })
              ] }),
              invoice.client && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: invoice.client.companyName })
              ] }),
              invoice.issuedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Issued: ",
                  formatDate(invoice.issuedAt)
                ] })
              ] }),
              invoice.dueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Due: ",
                  formatDate(invoice.dueDate)
                ] })
              ] })
            ] }),
            invoice.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 line-clamp-1", children: invoice.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 ml-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-lg font-bold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4" }),
                formatCurrency(invoice.amount, invoice.currency)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: invoice.currency })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "p-2 rounded-full hover:bg-primary/10 transition-colors",
                onClick: (e) => {
                  e.stopPropagation();
                  onInvoiceClick?.(invoice);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 text-primary" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "p-2 rounded-full hover:bg-amber-500/10 transition-colors",
                onClick: (e) => {
                  e.stopPropagation();
                  onEditInvoice?.(invoice);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-4 w-4 text-amber-500" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "p-2 rounded-full hover:bg-rose-500/10 transition-colors",
                onClick: (e) => {
                  e.stopPropagation();
                  onDeleteInvoice?.(invoice);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 text-rose-500" })
              }
            )
          ] })
        ]
      },
      invoice.id
    )) }) })
  ] });
}
export {
  FolderOpen as F,
  InvoiceList as I,
  Package as P,
  InvoiceUploadDialog as a,
  InvoiceViewDialog as b,
  invoiceService as i
};
