import { F as useToast, l as reactExports, j as jsxRuntimeExports, B as Button, P as Plus, L as LoaderCircle, bj as Shield, Y as Badge, aR as Copy, ar as DropdownMenu, as as DropdownMenuTrigger, au as DropdownMenuContent, av as DropdownMenuItem, bm as DropdownMenuSeparator, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, Q as Label, I as Input, U as DialogFooter, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription, a8 as AlertDialogFooter, a9 as AlertDialogCancel, aa as AlertDialogAction, br as EyeOff, al as Eye } from "./index-C4ZP3eFM.js";
import { C as Card, c as CardContent } from "./card-5_9pbgKs.js";
import { S as Switch } from "./switch-DKaAaDNb.js";
import { l as listClients, u as updateClient, c as createClient, d as deleteClient, r as regenerateSecret } from "./ssoService-7sYlG21c.js";
import { G as Globe } from "./globe-CuQXKfU6.js";
import { E as EllipsisVertical } from "./ellipsis-vertical-DaSxVRLi.js";
import "./index-D6Uc8srH.js";
const ALL_SCOPES = ["openid", "profile", "email"];
function SecretDisplay({ secret }) {
  const [visible, setVisible] = reactExports.useState(false);
  const { toast } = useToast();
  const copy = () => {
    navigator.clipboard.writeText(secret);
    toast({ title: "Copied to clipboard" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "flex-1 text-sm font-mono text-amber-800 dark:text-amber-300 break-all", children: visible ? secret : "•".repeat(Math.min(secret.length, 32)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setVisible(!visible), className: "text-amber-600 hover:text-amber-800 shrink-0", children: visible ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: copy, className: "text-amber-600 hover:text-amber-800 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-4 w-4" }) })
  ] });
}
const defaultForm = () => ({
  name: "",
  redirect_uris: "",
  allowed_scopes: ["openid", "profile", "email"],
  is_confidential: true,
  description: "",
  logo_url: "",
  homepage_url: ""
});
function SSOClients() {
  const { toast } = useToast();
  const [clients, setClients] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editingClient, setEditingClient] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(defaultForm());
  const [saving, setSaving] = reactExports.useState(false);
  const [newSecret, setNewSecret] = reactExports.useState(null);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [revokeTarget, setRevokeTarget] = reactExports.useState(null);
  const [regenerating, setRegenerating] = reactExports.useState(false);
  reactExports.useEffect(() => {
    load();
  }, []);
  async function load() {
    try {
      setClients(await listClients());
    } catch {
      toast({ title: "Failed to load SSO clients", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }
  function openCreate() {
    setEditingClient(null);
    setForm(defaultForm());
    setNewSecret(null);
    setShowForm(true);
  }
  function openEdit(client) {
    setEditingClient(client);
    setForm({
      name: client.name,
      redirect_uris: (client.redirect_uris ?? []).join("\n"),
      allowed_scopes: client.allowed_scopes ?? [...ALL_SCOPES],
      is_confidential: client.is_confidential,
      description: client.description ?? "",
      logo_url: client.logo_url ?? "",
      homepage_url: client.homepage_url ?? ""
    });
    setNewSecret(null);
    setShowForm(true);
  }
  async function handleSave() {
    const uris = form.redirect_uris.split("\n").map((u) => u.trim()).filter(Boolean);
    if (!form.name.trim()) return toast({ title: "Name is required", variant: "destructive" });
    if (uris.length === 0) return toast({ title: "At least one redirect URI is required", variant: "destructive" });
    const payload = {
      name: form.name.trim(),
      redirect_uris: uris,
      allowed_scopes: form.allowed_scopes,
      is_confidential: form.is_confidential,
      description: form.description.trim() || void 0,
      logo_url: form.logo_url.trim() || void 0,
      homepage_url: form.homepage_url.trim() || void 0
    };
    setSaving(true);
    try {
      if (editingClient) {
        const updated = await updateClient(editingClient.id, payload);
        setClients((prev) => prev.map((c) => c.id === updated.id ? updated : c));
        toast({ title: "Client updated" });
        setShowForm(false);
      } else {
        const created = await createClient(payload);
        setClients((prev) => [created, ...prev]);
        if (created.client_secret) {
          setNewSecret(created.client_secret);
        } else {
          setShowForm(false);
        }
        toast({ title: "Client created" });
      }
    } catch (err) {
      toast({ title: "Save failed", description: err.response?.data?.message ?? err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteClient(deleteTarget.id);
      setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast({ title: "Client deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  }
  async function handleRegenerateSecret(client) {
    setRevokeTarget(client);
  }
  async function confirmRegenerate() {
    if (!revokeTarget) return;
    setRegenerating(true);
    try {
      const { client_secret } = await regenerateSecret(revokeTarget.id);
      setNewSecret(client_secret);
      setEditingClient(revokeTarget);
      setShowForm(true);
      toast({ title: "Secret regenerated. All existing tokens revoked." });
    } catch {
      toast({ title: "Failed to regenerate secret", variant: "destructive" });
    } finally {
      setRegenerating(false);
      setRevokeTarget(null);
    }
  }
  async function toggleActive(client) {
    try {
      const updated = await updateClient(client.id, { is_active: !client.is_active });
      setClients((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-slate-900 dark:text-white", children: "SSO Applications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 mt-1", children: "Manage applications that can use Aurai as their identity provider." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openCreate, className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New Application"
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary" }) }) : clients.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-col items-center justify-center py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-slate-700 dark:text-slate-300 mb-1", children: "No SSO applications" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 mb-4", children: "Register an application to allow users to sign in with Aurai." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openCreate, variant: "outline", className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Register Application"
      ] })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: clients.map((client) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: !client.is_active ? "opacity-60" : "", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 min-w-0", children: [
        client.logo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: client.logo_url, alt: client.name, className: "h-10 w-10 rounded-lg object-contain border border-slate-200 dark:border-slate-700 shrink-0 p-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-5 w-5 text-slate-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-900 dark:text-white", children: client.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: client.is_active ? "default" : "secondary", className: "text-xs", children: client.is_active ? "Active" : "Inactive" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: client.is_confidential ? "Confidential" : "Public" })
          ] }),
          client.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 mt-0.5", children: client.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-400", children: "Client ID:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded", children: client.client_id }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                navigator.clipboard.writeText(client.client_id);
                toast({ title: "Copied" });
              }, className: "text-slate-400 hover:text-slate-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: (client.allowed_scopes ?? ALL_SCOPES).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs py-0", children: s }, s)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            checked: client.is_active,
            onCheckedChange: () => toggleActive(client),
            title: client.is_active ? "Disable" : "Enable"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => openEdit(client), children: "Edit" }),
            client.is_confidential && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => handleRegenerateSecret(client), children: "Regenerate secret" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              DropdownMenuItem,
              {
                className: "text-destructive focus:text-destructive",
                onClick: () => setDeleteTarget(client),
                children: "Delete"
              }
            )
          ] })
        ] })
      ] })
    ] }) }) }, client.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showForm, onOpenChange: (open) => {
      if (!open && !saving) {
        setShowForm(false);
        setNewSecret(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingClient ? "Edit Application" : "Register Application" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editingClient ? "Update the application settings." : "Register a new application to use Aurai SSO." })
      ] }),
      newSecret ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-slate-700 dark:text-slate-300 mb-1", children: "Client secret — copy it now, it won't be shown again." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SecretDisplay, { secret: newSecret }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500 mt-2", children: [
          "Client ID: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-slate-100 dark:bg-slate-800 px-1 rounded", children: editingClient?.client_id ?? clients[0]?.client_id })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), placeholder: "My App" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Redirect URIs * ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 font-normal", children: "(one per line)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: form.redirect_uris,
              onChange: (e) => setForm({ ...form, redirect_uris: e.target.value }),
              placeholder: "https://myapp.com/auth/callback",
              rows: 3,
              className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none font-mono"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Allowed scopes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4", children: ALL_SCOPES.map((scope) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1.5 cursor-pointer text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: form.allowed_scopes.includes(scope),
                onChange: (e) => {
                  setForm((f) => ({
                    ...f,
                    allowed_scopes: e.target.checked ? [...f.allowed_scopes, scope] : f.allowed_scopes.filter((s) => s !== scope)
                  }));
                },
                className: "rounded"
              }
            ),
            scope
          ] }, scope)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }), placeholder: "Optional description shown on consent screen" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Logo URL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.logo_url, onChange: (e) => setForm({ ...form, logo_url: e.target.value }), placeholder: "https://..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Homepage URL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.homepage_url, onChange: (e) => setForm({ ...form, homepage_url: e.target.value }), placeholder: "https://..." })
          ] })
        ] }),
        !editingClient && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-slate-800 dark:text-slate-200", children: "Confidential client" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400", children: "Requires a client secret (server-side apps). Uncheck for SPAs / mobile apps using PKCE only." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: form.is_confidential,
              onCheckedChange: (v) => setForm({ ...form, is_confidential: v })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: newSecret ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
        setShowForm(false);
        setNewSecret(null);
      }, children: "Done" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setShowForm(false), disabled: saving, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: saving, children: [
          saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }) : null,
          editingClient ? "Save changes" : "Create application"
        ] })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleteTarget, onOpenChange: (open) => {
      if (!open) setDeleteTarget(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogTitle, { children: [
          "Delete ",
          deleteTarget?.name,
          "?"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "This will permanently delete the application and revoke all issued tokens. This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDelete, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!revokeTarget, onOpenChange: (open) => {
      if (!open) setRevokeTarget(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Regenerate client secret?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          "This will invalidate the current secret and revoke all active tokens for ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: revokeTarget?.name }),
          ". Users will need to re-authenticate."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogAction, { onClick: confirmRegenerate, disabled: regenerating, children: [
          regenerating ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2 inline" }) : null,
          "Regenerate"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  SSOClients as default
};
