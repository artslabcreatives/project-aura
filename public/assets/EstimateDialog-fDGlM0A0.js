import { b as api, l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, Q as Label, aS as Popover, aT as PopoverTrigger, B as Button, aU as PopoverContent, bL as Command, bM as CommandInput, bN as CommandEmpty, bO as CommandGroup, bP as CommandItem, q as Check, z as cn, bQ as CommandSeparator, I as Input, ae as Textarea, a2 as Trash2, P as Plus, U as DialogFooter } from "./index-C4ZP3eFM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { C as ChevronsUpDown } from "./chevrons-up-down-DISs2Pfx.js";
const estimateService = {
  getAll: async (clientId) => {
    const { data } = await api.get("/estimates", {
      params: clientId ? { client_id: clientId } : void 0
    });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/estimates/${id}`);
    return data;
  },
  create: async (estimate) => {
    const { data } = await api.post("/estimates", estimate);
    return data;
  },
  update: async (id, estimate) => {
    const { data } = await api.put(`/estimates/${id}`, estimate);
    return data;
  },
  delete: async (id) => {
    await api.delete(`/estimates/${id}`);
  },
  updateStatus: async (id, status) => {
    const { data } = await api.put(`/estimates/${id}/status`, { status });
    return data;
  },
  convertToProject: async (id) => {
    const { data } = await api.post(`/estimates/${id}/convert-to-project`, {});
    return data;
  },
  /** Trigger a manual sync of Xero Quotes into local estimates. */
  syncFromXero: async () => {
    const { data } = await api.post("/xero/sync", {});
    return data;
  },
  /** Return Xero connection status. */
  xeroStatus: async () => {
    const { data } = await api.get("/xero/status");
    return data;
  },
  /** Get the Xero OAuth2 authorisation URL. */
  xeroAuthUrl: async () => {
    const data = await api.get("/xero/auth-url");
    return data;
  }
};
const emptyLineItem = () => ({
  description: "",
  quantity: 1,
  unit_price: 0,
  total: 0
});
function EstimateDialog({
  open,
  onOpenChange,
  onSave,
  editEstimate,
  clients,
  projects,
  defaultClientId,
  defaultProjectId
}) {
  const [formData, setFormData] = reactExports.useState({
    client_id: defaultClientId ?? 0,
    title: "",
    description: "",
    status: "draft",
    valid_until: "",
    notes: "",
    tax_rate: 0,
    currency: "USD",
    project_id: defaultProjectId ?? 0
  });
  const [lineItems, setLineItems] = reactExports.useState([emptyLineItem()]);
  const [projectPopoverOpen, setProjectPopoverOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (editEstimate) {
      setFormData({
        client_id: editEstimate.client_id,
        title: editEstimate.title,
        description: editEstimate.description ?? "",
        status: editEstimate.status,
        valid_until: editEstimate.valid_until ?? "",
        notes: editEstimate.notes ?? "",
        tax_rate: editEstimate.tax_rate ?? 0,
        currency: editEstimate.currency || "USD",
        project_id: editEstimate.project_id ?? 0
      });
      setLineItems(editEstimate.items?.length ? editEstimate.items : [emptyLineItem()]);
    } else {
      setFormData({
        client_id: defaultClientId ?? 0,
        title: "",
        description: "",
        status: "draft",
        valid_until: "",
        notes: "",
        tax_rate: 0,
        currency: "USD",
        project_id: defaultProjectId ?? 0
      });
      setLineItems([emptyLineItem()]);
    }
  }, [editEstimate, open, defaultClientId, defaultProjectId]);
  const updateLineItem = (index, field, value) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      updated[index].total = updated[index].quantity * updated[index].unit_price;
      return updated;
    });
  };
  const addLineItem = () => setLineItems((prev) => [...prev, emptyLineItem()]);
  const removeLineItem = (index) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const taxAmount = subtotal * (formData.tax_rate / 100);
  const totalAmount = subtotal + taxAmount;
  const currencySymbol = formData.currency === "LKR" ? "Rs. " : "$";
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      items: lineItems,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    });
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "sm:max-w-[700px] max-h-[90vh] overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editEstimate ? "Edit Estimate" : "Create New Estimate" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editEstimate ? "Update the estimate details below." : "Fill in the estimate details to create a new quotation." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4 px-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "client", children: "Client *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: String(formData.client_id),
              onValueChange: (v) => setFormData({ ...formData, client_id: Number(v) }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "client", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select client" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: clients.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(c.id), children: c.company_name }, c.id)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "project", children: "Project (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open: projectPopoverOpen, onOpenChange: setProjectPopoverOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                role: "combobox",
                "aria-expanded": projectPopoverOpen,
                className: "justify-between font-normal",
                children: [
                  formData.project_id ? projects?.find((p) => p.id === formData.project_id)?.name ?? "Select project" : "Select project",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-[300px] p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Command, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: "Search projects..." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "No project found." }),
              formData.client_id > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { heading: `${clients.find((c) => c.id === formData.client_id)?.company_name || "Client"} Projects`, children: projects?.filter((p) => p.clientId === formData.client_id).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  CommandItem,
                  {
                    value: `${p.name}-${p.id}`,
                    onSelect: () => {
                      const projectId = p.id;
                      setFormData({
                        ...formData,
                        project_id: projectId,
                        currency: p.currency || formData.currency
                      });
                      setProjectPopoverOpen(false);
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Check,
                        {
                          className: cn(
                            "mr-2 h-4 w-4",
                            formData.project_id === p.id ? "opacity-100" : "opacity-0"
                          )
                        }
                      ),
                      p.name
                    ]
                  },
                  p.id
                )) }),
                projects?.some((p) => p.clientId !== formData.client_id) && /* @__PURE__ */ jsxRuntimeExports.jsx(CommandSeparator, {})
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandGroup, { heading: formData.client_id > 0 ? "Other Projects" : "All Projects", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  CommandItem,
                  {
                    value: "none-0",
                    onSelect: () => {
                      setFormData({ ...formData, project_id: 0 });
                      setProjectPopoverOpen(false);
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Check,
                        {
                          className: cn(
                            "mr-2 h-4 w-4",
                            formData.project_id === 0 ? "opacity-100" : "opacity-0"
                          )
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("em", { className: "text-muted-foreground", children: "None" })
                    ]
                  }
                ),
                projects?.filter((p) => formData.client_id === 0 || p.clientId !== formData.client_id).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  CommandItem,
                  {
                    value: `${p.name}-${p.id}`,
                    onSelect: () => {
                      const projectId = p.id;
                      setFormData({
                        ...formData,
                        project_id: projectId,
                        currency: p.currency || formData.currency
                      });
                      setProjectPopoverOpen(false);
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Check,
                        {
                          className: cn(
                            "mr-2 h-4 w-4",
                            formData.project_id === p.id ? "opacity-100" : "opacity-0"
                          )
                        }
                      ),
                      p.name,
                      p.client?.company_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-xs text-muted-foreground", children: [
                        "(",
                        p.client.company_name,
                        ")"
                      ] })
                    ]
                  },
                  p.id
                ))
              ] })
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "title", children: "Title *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "title",
            value: formData.title,
            onChange: (e) => setFormData({ ...formData, title: e.target.value }),
            placeholder: "Website Redesign Project",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "description", children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "description",
            value: formData.description,
            onChange: (e) => setFormData({ ...formData, description: e.target.value }),
            placeholder: "Brief description of the estimate scope",
            rows: 2
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "status", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.status,
              onValueChange: (v) => setFormData({ ...formData, status: v }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "status", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "draft", children: "Draft" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sent", children: "Sent" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "approved", children: "Approved" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "rejected", children: "Rejected" })
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "valid_until", children: "Valid Until" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "valid_until",
              type: "date",
              value: formData.valid_until,
              onChange: (e) => setFormData({ ...formData, valid_until: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "currency", children: "Currency *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: formData.currency,
            onValueChange: (v) => setFormData({ ...formData, currency: v }),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "currency", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "USD", children: "USD ($)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "LKR", children: "LKR (Rs.)" })
              ] })
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Line Items" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: lineItems.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-2 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Description",
              value: item.description,
              onChange: (e) => updateLineItem(index, "description", e.target.value)
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              placeholder: "Qty",
              min: 1,
              value: item.quantity,
              onChange: (e) => updateLineItem(index, "quantity", Number(e.target.value))
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              placeholder: "Unit Price",
              min: 0,
              step: "0.01",
              value: item.unit_price,
              onChange: (e) => updateLineItem(index, "unit_price", Number(e.target.value))
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 text-right text-sm font-medium pr-1", children: [
            currencySymbol,
            ((item.quantity || 0) * (item.unit_price || 0)).toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              onClick: () => removeLineItem(index),
              disabled: lineItems.length === 1,
              className: "h-8 w-8 text-muted-foreground hover:text-destructive",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
            }
          ) })
        ] }, index)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            onClick: addLineItem,
            className: "mt-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
              " Add Line Item"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md p-3 space-y-1 text-sm bg-muted/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Subtotal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            currencySymbol,
            subtotal.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Tax (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 0,
              max: 100,
              step: "0.1",
              value: formData.tax_rate,
              onChange: (e) => setFormData({ ...formData, tax_rate: Number(e.target.value) }),
              className: "h-7 w-20 text-right"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-semibold border-t pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            currencySymbol,
            totalAmount.toFixed(2)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notes", children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "notes",
            value: formData.notes,
            onChange: (e) => setFormData({ ...formData, notes: e.target.value }),
            placeholder: "Additional terms or notes for the client",
            rows: 2
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: editEstimate ? "Save Changes" : "Create Estimate" })
    ] })
  ] }) }) });
}
export {
  EstimateDialog as E,
  estimateService as e
};
