import { ad as createLucideIcon, bw as Subscribable, bx as shallowEqualObjects, by as hashKey, bz as getDefaultState, bA as notifyManager, bB as useQueryClient, l as reactExports, bC as noop, bD as shouldThrowError, ax as api, F as useToast, bc as useQuery, j as jsxRuntimeExports, at as Settings, I as Input, Y as Badge, B as Button, aE as History, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, Q as Label, U as DialogFooter, v as useUser, bs as Bell, bE as DialogTrigger, P as Plus, ae as Textarea, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription, a8 as AlertDialogFooter, a9 as AlertDialogCancel, aa as AlertDialogAction, bF as reminderService, aJ as RefreshCw, i as isPast, q as Check, a2 as Trash2 } from "./index-C4ZP3eFM.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent, e as CardFooter } from "./card-5_9pbgKs.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-DRavPKwG.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-D5Ybxpto.js";
import { S as Switch } from "./switch-DKaAaDNb.js";
import { I as Info } from "./info-BO35z3vl.js";
import { A as ArrowRight } from "./arrow-right-TrnDYsFi.js";
import { f as format } from "./format-BDODTvac.js";
import { p as parseISO } from "./parseISO-BZpuPkuQ.js";
import { C as Clock } from "./clock-C-1UQMq-.js";
import { C as Calendar } from "./calendar-B2-LyEnc.js";
import "./index-D6Uc8srH.js";
const BellRing = createLucideIcon("BellRing", [
  ["path", { d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9", key: "1qo2s2" }],
  ["path", { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0", key: "qgo35s" }],
  ["path", { d: "M4 2C2.8 3.7 2 5.7 2 8", key: "tap9e0" }],
  ["path", { d: "M22 8c0-2.3-.8-4.3-2-6", key: "5bb3ad" }]
]);
var MutationObserver = class extends Subscribable {
  #client;
  #currentResult = void 0;
  #currentMutation;
  #mutateOptions;
  constructor(client, options) {
    super();
    this.#client = client;
    this.setOptions(options);
    this.bindMethods();
    this.#updateResult();
  }
  bindMethods() {
    this.mutate = this.mutate.bind(this);
    this.reset = this.reset.bind(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    this.options = this.#client.defaultMutationOptions(options);
    if (!shallowEqualObjects(this.options, prevOptions)) {
      this.#client.getMutationCache().notify({
        type: "observerOptionsUpdated",
        mutation: this.#currentMutation,
        observer: this
      });
    }
    if (prevOptions?.mutationKey && this.options.mutationKey && hashKey(prevOptions.mutationKey) !== hashKey(this.options.mutationKey)) {
      this.reset();
    } else if (this.#currentMutation?.state.status === "pending") {
      this.#currentMutation.setOptions(this.options);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.#currentMutation?.removeObserver(this);
    }
  }
  onMutationUpdate(action) {
    this.#updateResult();
    this.#notify(action);
  }
  getCurrentResult() {
    return this.#currentResult;
  }
  reset() {
    this.#currentMutation?.removeObserver(this);
    this.#currentMutation = void 0;
    this.#updateResult();
    this.#notify();
  }
  mutate(variables, options) {
    this.#mutateOptions = options;
    this.#currentMutation?.removeObserver(this);
    this.#currentMutation = this.#client.getMutationCache().build(this.#client, this.options);
    this.#currentMutation.addObserver(this);
    return this.#currentMutation.execute(variables);
  }
  #updateResult() {
    const state = this.#currentMutation?.state ?? getDefaultState();
    this.#currentResult = {
      ...state,
      isPending: state.status === "pending",
      isSuccess: state.status === "success",
      isError: state.status === "error",
      isIdle: state.status === "idle",
      mutate: this.mutate,
      reset: this.reset
    };
  }
  #notify(action) {
    notifyManager.batch(() => {
      if (this.#mutateOptions && this.hasListeners()) {
        const variables = this.#currentResult.variables;
        const onMutateResult = this.#currentResult.context;
        const context = {
          client: this.#client,
          meta: this.options.meta,
          mutationKey: this.options.mutationKey
        };
        if (action?.type === "success") {
          try {
            this.#mutateOptions.onSuccess?.(
              action.data,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
          try {
            this.#mutateOptions.onSettled?.(
              action.data,
              null,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
        } else if (action?.type === "error") {
          try {
            this.#mutateOptions.onError?.(
              action.error,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
          try {
            this.#mutateOptions.onSettled?.(
              void 0,
              action.error,
              variables,
              onMutateResult,
              context
            );
          } catch (e) {
            void Promise.reject(e);
          }
        }
      }
      this.listeners.forEach((listener) => {
        listener(this.#currentResult);
      });
    });
  }
};
function useMutation(options, queryClient) {
  const client = useQueryClient();
  const [observer] = reactExports.useState(
    () => new MutationObserver(
      client,
      options
    )
  );
  reactExports.useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);
  const result = reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => observer.subscribe(notifyManager.batchCalls(onStoreChange)),
      [observer]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  const mutate = reactExports.useCallback(
    (variables, mutateOptions) => {
      observer.mutate(variables, mutateOptions).catch(noop);
    },
    [observer]
  );
  if (result.error && shouldThrowError(observer.options.throwOnError, [result.error])) {
    throw result.error;
  }
  return { ...result, mutate, mutateAsync: result.mutate };
}
const automatedReminderService = {
  getData: async () => {
    return await api.get("/automated-reminder-settings");
  },
  updateSetting: async (id, data) => {
    return await api.patch(`/automated-reminder-settings/${id}`, data);
  },
  updateProjectOverride: async (projectId, data) => {
    return await api.patch(`/projects/${projectId}/reminder-override`, data);
  },
  getAuditLogs: async () => {
    return await api.get("/automated-reminder-settings/audit-logs");
  }
};
const formatAuditValue = (value) => {
  if (value === null || value === void 0) return "Not set";
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") + " days" : "Not set";
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
    return format(parseISO(value), "PPP");
  }
  return String(value);
};
const getFieldLabel = (field) => {
  const labels = {
    manual_reminder_date: "Manual Reminder Date",
    manual_reminder_days: "Custom Day Sequence",
    manual_reminder_frequency_days: "Reminder Frequency",
    days_before: "Days Before Expiry",
    is_active: "Active Status"
  };
  return labels[field] || field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};
const FieldChange = ({ field, oldValue, newValue }) => {
  const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);
  if (!hasChanged) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground min-w-[140px]", children: getFieldLabel(field) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded bg-destructive/10 text-destructive text-xs font-mono", children: formatAuditValue(oldValue) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3 h-3 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono", children: formatAuditValue(newValue) })
    ] })
  ] });
};
const AutomatedReminderSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProject, setEditingProject] = reactExports.useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["automatedReminderSettings"],
    queryFn: () => automatedReminderService.getData()
  });
  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["automatedReminderAuditLogs"],
    queryFn: () => automatedReminderService.getAuditLogs()
  });
  const updateSettingMutation = useMutation({
    mutationFn: ({ id, data: data2 }) => automatedReminderService.updateSetting(id, data2),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automatedReminderSettings"] });
      queryClient.invalidateQueries({ queryKey: ["automatedReminderAuditLogs"] });
      toast({ title: "Setting updated successfully" });
    }
  });
  const updateOverrideMutation = useMutation({
    mutationFn: ({ id, data: data2 }) => automatedReminderService.updateProjectOverride(id, data2),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automatedReminderSettings"] });
      queryClient.invalidateQueries({ queryKey: ["automatedReminderAuditLogs"] });
      setEditingProject(null);
      toast({ title: "Project override updated" });
    }
  });
  const handleSettingChange = (id, field, value) => {
    updateSettingMutation.mutate({ id, data: { [field]: value } });
  };
  const handleDaysChange = (id, rawValue) => {
    const days = rawValue.split(",").map((d) => parseInt(d.trim())).filter((d) => !isNaN(d));
    handleSettingChange(id, "days_before", days);
  };
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Loading settings..." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 animate-in fade-in duration-500", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-l-4 border-l-primary bg-card/60 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-5 h-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Global Automated Reminder Settings" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Configure default periods for system-wide reminders. Enter comma-separated days before (e.g., 7, 3, 1)." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Reminder Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Trigger Days (Days Before)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: data?.settings.map((setting) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-semibold", children: setting.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  className: "max-w-[300px]",
                  defaultValue: Array.isArray(setting.days_before) ? setting.days_before.join(", ") : setting.days_before,
                  onBlur: (e) => handleDaysChange(setting.id, e.target.value),
                  placeholder: "e.g. 7, 3, 1"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground whitespace-nowrap", children: "days before" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: Array.isArray(setting.days_before) && setting.days_before.map((day) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-[10px] bg-primary/10 text-primary border-primary/20", children: [
              day,
              "d before"
            ] }, day)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: setting.is_active,
              onCheckedChange: (checked) => handleSettingChange(setting.id, "is_active", checked)
            }
          ) })
        ] }, setting.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-l-4 border-l-primary bg-card/60 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BellRing, { className: "w-5 h-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Project Manual Overrides" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Manually set specific reminder dates or custom day sequences for active projects." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Project" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Grace Period Expiry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Override Mode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Days / Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: data?.projects_with_overrides.map((project) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: project.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground tabular-nums", children: project.project_code })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "tabular-nums", children: format(parseISO(project.grace_period_expires_at), "PPP") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: project.manual_reminder_date ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "bg-primary/10 text-primary border-primary/20", children: "Fixed Date" }) : project.manual_reminder_days ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "bg-primary/10 text-primary border-primary/20", children: "Custom Sequence" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", children: "Global Default" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: project.manual_reminder_date ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-primary", children: format(parseISO(project.manual_reminder_date), "PPP") }) : project.manual_reminder_days ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: project.manual_reminder_days.map((day) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[10px] border-primary/30 text-primary/80", children: [
            day,
            "d"
          ] }, day)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic text-sm", children: "System default" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setEditingProject(project), children: "Override" }) })
        ] }, project.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-l-4 border-l-primary bg-card/60 backdrop-blur-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-5 h-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Audit Logs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Track all manual changes and overrides to automated reminders." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar", children: logsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Loading logs..." }) : auditLogs?.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: "No audit logs yet" }) : auditLogs?.map((log) => {
        const oldValues = log.details?.old || {};
        const newValues = log.details?.new || {};
        const allFields = /* @__PURE__ */ new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-xl bg-muted/40 border border-white/5 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold bg-secondary px-2 py-0.5 rounded text-secondary-foreground", children: log.action.replace(/_/g, " ").toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground tabular-nums", children: format(parseISO(log.created_at), "PPP p") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-primary", children: log.user.name }),
            " modified reminder settings."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 mt-3", children: Array.from(allFields).map((field) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            FieldChange,
            {
              field,
              oldValue: oldValues[field],
              newValue: newValues[field]
            },
            field
          )) })
        ] }, log.id);
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editingProject, onOpenChange: (open) => !open && setEditingProject(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Override Reminder for ",
        editingProject?.name
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Manual Reminder Date (Fixed)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "date",
              defaultValue: editingProject?.manual_reminder_date || "",
              onChange: (e) => setEditingProject((prev) => prev ? { ...prev, manual_reminder_date: e.target.value, manual_reminder_days: null } : null)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3 h-3" }),
            "Setting this will trigger a reminder ONLY after this specific date."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-full border-t" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-background px-2 text-muted-foreground", children: "OR" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Custom Day sequence (Days Before Expiry)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g. 14, 7, 1",
              defaultValue: Array.isArray(editingProject?.manual_reminder_days) ? editingProject?.manual_reminder_days.join(", ") : "",
              onChange: (e) => {
                const days = e.target.value.split(",").map((d) => parseInt(d.trim())).filter((d) => !isNaN(d));
                setEditingProject((prev) => prev ? { ...prev, manual_reminder_days: days, manual_reminder_date: null } : null);
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Enter comma-separated numbers for days before expiry." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setEditingProject(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => {
              if (editingProject) {
                updateOverrideMutation.mutate({
                  id: editingProject.id,
                  data: {
                    manual_reminder_date: editingProject.manual_reminder_date,
                    manual_reminder_days: editingProject.manual_reminder_days
                  }
                });
              }
            },
            children: "Save Override"
          }
        )
      ] })
    ] }) })
  ] });
};
const Reminders = () => {
  const { currentUser, activeRole } = useUser();
  const isHR = activeRole === "hr" || activeRole === "admin";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDataOpen, setIsDataOpen] = reactExports.useState(false);
  const [editingReminder, setEditingReminder] = reactExports.useState(null);
  const [reminderToDelete, setReminderToDelete] = reactExports.useState(null);
  const [newReminder, setNewReminder] = reactExports.useState({
    title: "",
    description: "",
    reminder_at: ""
  });
  const [page, setPage] = reactExports.useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["reminders", page],
    queryFn: () => reminderService.getAll(page),
    placeholderData: (previousData) => previousData
  });
  const reminders = data?.active || [];
  const completedReminders = data?.completed?.data || [];
  const totalPages = data?.completed?.last_page || 1;
  const createMutation = useMutation({
    mutationFn: reminderService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      handleCloseDialog();
      toast({ title: "Reminder set successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create reminder", variant: "destructive" });
    }
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data: data2 }) => reminderService.update(id, data2),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      handleCloseDialog();
      toast({ title: "Reminder updated" });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: reminderService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({ title: "Reminder deleted" });
      setReminderToDelete(null);
    }
  });
  const markReadMutation = useMutation({
    mutationFn: reminderService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    }
  });
  const handleCloseDialog = () => {
    setIsDataOpen(false);
    setEditingReminder(null);
    setNewReminder({ title: "", description: "", reminder_at: "" });
  };
  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    const date = new Date(reminder.reminder_at);
    const localDateTime = format(date, "yyyy-MM-dd'T'HH:mm");
    setNewReminder({
      title: reminder.title,
      description: reminder.description || "",
      reminder_at: localDateTime
    });
    setIsDataOpen(true);
  };
  const confirmDelete = () => {
    if (reminderToDelete) {
      deleteMutation.mutate(reminderToDelete.id);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newReminder.title || !newReminder.reminder_at) return;
    const isoDate = new Date(newReminder.reminder_at).toISOString();
    if (editingReminder) {
      updateMutation.mutate({
        id: editingReminder.id,
        data: {
          ...newReminder,
          reminder_at: isoDate
        }
      });
    } else {
      createMutation.mutate({
        ...newReminder,
        reminder_at: isoDate
      });
    }
  };
  const [currentTime, setCurrentTime] = reactExports.useState(/* @__PURE__ */ new Date());
  reactExports.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(/* @__PURE__ */ new Date());
    }, 1e3);
    return () => clearInterval(timer);
  }, []);
  const lkrTime = currentTime.toLocaleTimeString("en-US", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  reactExports.useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);
  const renderRemindersContent = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-semibold flex items-center gap-2 text-foreground/80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5" }),
        "Active Reminders"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full flex justify-center py-12 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-6 w-6 animate-spin" }) }) : reminders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full text-center py-12 border rounded-lg bg-muted/20 border-dashed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-12 w-12 mx-auto text-muted-foreground/50 mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: "No active reminders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "You're all caught up!" })
      ] }) : reminders.map((reminder) => {
        const isExpired = isPast(new Date(reminder.reminder_at));
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Card,
          {
            className: "transition-all hover:shadow-md bg-card border-l-4 border-l-primary",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg font-semibold leading-tight", children: reminder.title }),
                  isExpired && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded", children: "Overdue" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { className: "flex items-center gap-1.5 text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }),
                  format(new Date(reminder.reminder_at), "PPP p"),
                  " (",
                  format(new Date(reminder.reminder_at), "z"),
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pb-2", children: reminder.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/80 whitespace-pre-wrap", children: reminder.description }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardFooter, { className: "pt-2 flex justify-end gap-2 border-t mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    className: "text-primary hover:text-primary/90 hover:bg-primary/10 h-8",
                    onClick: () => markReadMutation.mutate(reminder.id),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 mr-1.5" }),
                      "Done"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    className: "text-muted-foreground hover:text-foreground hover:bg-muted h-8",
                    onClick: () => handleEdit(reminder),
                    children: "Edit"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8",
                    onClick: () => setReminderToDelete(reminder),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                  }
                )
              ] })
            ]
          },
          reminder.id
        );
      }) })
    ] }),
    completedReminders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-6 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-semibold flex items-center gap-2 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5" }),
        "Completed"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80", children: completedReminders.map((reminder) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Card,
        {
          className: "transition-all hover:shadow-md bg-muted/40",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between items-start gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-lg font-semibold leading-tight line-through text-muted-foreground", children: reminder.title }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }),
                format(new Date(reminder.reminder_at), "PPP p")
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pb-2", children: reminder.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap", children: reminder.description }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardFooter, { className: "pt-2 flex justify-end gap-2 border-t mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8",
                onClick: () => setReminderToDelete(reminder),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
              }
            ) })
          ]
        },
        reminder.id
      )) }),
      totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center gap-2 mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => setPage((p) => Math.max(1, p - 1)),
            disabled: page === 1,
            children: "Previous"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm text-muted-foreground", children: [
          "Page ",
          page,
          " of ",
          totalPages
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
            disabled: page === totalPages,
            children: "Next"
          }
        )
      ] })
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto p-6 max-w-5xl space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold tracking-tight text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-8 w-8 text-primary" }),
          "My Reminders"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mt-1 flex items-center gap-2", children: [
          "Manage your personal reminders.",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded text-xs font-medium text-secondary-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
            "Local Time: ",
            lkrTime
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: isDataOpen, onOpenChange: (open) => !open && handleCloseDialog(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "gap-2 shadow-lg hover:shadow-xl transition-all", onClick: () => setIsDataOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          "Add Reminder"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editingReminder ? "Edit Reminder" : "Set New Reminder" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 py-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "title", children: "Title" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "title",
                  placeholder: "e.g. Call Client",
                  value: newReminder.title,
                  onChange: (e) => setNewReminder({ ...newReminder, title: e.target.value }),
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "datetime", children: "Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "datetime",
                  type: "datetime-local",
                  required: true,
                  value: newReminder.reminder_at,
                  onChange: (e) => setNewReminder({
                    ...newReminder,
                    reminder_at: e.target.value
                  })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Select time. Reminders will trigger based on your local time setting." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "description", children: "Description (Optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  id: "description",
                  placeholder: "Details...",
                  value: newReminder.description,
                  onChange: (e) => setNewReminder({
                    ...newReminder,
                    description: e.target.value
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: createMutation.isPending || updateMutation.isPending, children: createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Reminder" }) })
          ] })
        ] })
      ] })
    ] }),
    isHR ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "personal", className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "bg-muted/30 p-1 rounded-xl glass-morphism border border-white/10 shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "personal", className: "rounded-lg font-bold tracking-tight px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all", children: "Personal Reminders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "automated", className: "rounded-lg font-bold tracking-tight px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all", children: "Automated Reminder Management" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "personal", className: "space-y-10 focus:outline-none", children: renderRemindersContent() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "automated", className: "focus:outline-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutomatedReminderSettings, {}) })
    ] }) : renderRemindersContent(),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!reminderToDelete, onOpenChange: (open) => !open && setReminderToDelete(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Are you sure?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'This will permanently delete the reminder "',
          reminderToDelete?.title,
          '". This action cannot be undone.'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AlertDialogAction,
          {
            onClick: confirmDelete,
            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            children: "Delete"
          }
        )
      ] })
    ] }) })
  ] });
};
export {
  Reminders as default
};
