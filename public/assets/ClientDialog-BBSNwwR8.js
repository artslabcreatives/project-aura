import { l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, Q as Label, I as Input, ae as Textarea, U as DialogFooter, B as Button } from "./index-C4ZP3eFM.js";
function ClientDialog({
  open,
  onOpenChange,
  onSave,
  editClient
}) {
  const [formData, setFormData] = reactExports.useState({
    company_name: "",
    industry: "",
    website: "",
    phone: "",
    email: "",
    address: "",
    notes: ""
  });
  reactExports.useEffect(() => {
    if (editClient) {
      setFormData({
        company_name: editClient.company_name,
        industry: editClient.industry || "",
        website: editClient.website || "",
        phone: editClient.phone || "",
        email: editClient.email || "",
        address: editClient.address || "",
        notes: editClient.notes || ""
      });
    } else {
      setFormData({
        company_name: "",
        industry: "",
        website: "",
        phone: "",
        email: "",
        address: "",
        notes: ""
      });
    }
  }, [editClient, open]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "sm:max-w-[500px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editClient ? "Edit Client" : "Add New Client" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editClient ? "Update client company details." : "Create a new client entry in the master database." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4 px-1 max-h-[70vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "company_name", children: "Company Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "company_name",
            value: formData.company_name,
            onChange: (e) => setFormData({ ...formData, company_name: e.target.value }),
            placeholder: "Acme Corp",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "industry", children: "Industry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "industry",
              value: formData.industry,
              onChange: (e) => setFormData({ ...formData, industry: e.target.value }),
              placeholder: "Technology"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "website", children: "Website" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "website",
              value: formData.website,
              onChange: (e) => setFormData({ ...formData, website: e.target.value }),
              placeholder: "https://example.com"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "email",
              type: "email",
              value: formData.email,
              onChange: (e) => setFormData({ ...formData, email: e.target.value }),
              placeholder: "contact@acme.com"
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
              placeholder: "+1 (555) 000-0000"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "address", children: "Address" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "address",
            value: formData.address,
            onChange: (e) => setFormData({ ...formData, address: e.target.value }),
            placeholder: "123 Street, City, Country",
            rows: 2
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notes", children: "Internal Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "notes",
            value: formData.notes,
            onChange: (e) => setFormData({ ...formData, notes: e.target.value }),
            placeholder: "Add any internal notes about the client...",
            rows: 3
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: editClient ? "Save Changes" : "Add Client" })
    ] })
  ] }) }) });
}
export {
  ClientDialog as C
};
