import { ad as createLucideIcon, F as useToast, l as reactExports, E as departmentService, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, Q as Label, I as Input, U as DialogFooter, B as Button, A as ScrollArea, b as api, v as useUser, ae as Textarea, Y as Badge, X, P as Plus, af as Upload, L as LoaderCircle, ag as User, ah as Layers, a2 as Trash2, ai as Separator, w as taskService, G as Search, aj as FileText, ak as ExternalLink, al as Eye, z as cn, H as useParams, S as Skeleton, am as cacheService, x as projectService, an as useSearchParams, u as useNavigate, ao as useSidebar, ap as useHistory, D as userService, aq as Lock, ar as DropdownMenu, as as DropdownMenuTrigger, at as Settings, au as DropdownMenuContent, av as DropdownMenuItem, Z as ChevronDown, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription, a8 as AlertDialogFooter, a9 as AlertDialogCancel, aa as AlertDialogAction } from "./index-C4ZP3eFM.js";
import { L as LayoutGrid, T as ToggleGroup, a as ToggleGroupItem, K as KanbanBoard, b as TaskListView } from "./toggle-group-CaAmqKYR.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { S as SearchableSelect } from "./searchable-select-BMuxGeaS.js";
import { t as tagService, T as TaskDialog } from "./TaskDialog-C-uIVVSP.js";
import { S as StageManagement } from "./StageManagement-DDF_sr3i.js";
import { i as isValid, f as format } from "./format-BDODTvac.js";
import { R as ReviewTaskDialog } from "./ReviewTaskDialog-DQBHS_MT.js";
import { a as attachmentService } from "./attachmentService-B1K5TSm1.js";
import { C as Checkbox } from "./checkbox-qHm_4cmk.js";
import { L as Link } from "./link-CjUUS0B-.js";
import { p as projectAttachmentService, P as ProjectReportsTab, a as POSelectDialog, b as POViewDialog, c as ProjectFinanceTab } from "./projectAttachmentService-EW5IPKYC.js";
import { S as Sparkles } from "./sparkles-BJEvvLwV.js";
import { F as File } from "./file-DZtoCEiO.js";
import { C as CloudUpload } from "./cloud-upload-CSttdRmy.js";
import { C as Calendar } from "./calendar-B2-LyEnc.js";
import { C as Card, c as CardContent } from "./card-5_9pbgKs.js";
import { P as Play } from "./play-BwxbIHvy.js";
import { D as Download } from "./download-qf94484n.js";
import { I as Info } from "./info-BO35z3vl.js";
import { D as DollarSign } from "./receipt-BPWO68lI.js";
import { P as Paperclip } from "./paperclip-DDW-rwXv.js";
import { E as EllipsisVertical } from "./ellipsis-vertical-DaSxVRLi.js";
import { L as List } from "./list-CgjYpKvJ.js";
import "./TaskCard-DsczT6D6.js";
import "./square-pen-Dr9mhwBZ.js";
import "./clock-C-1UQMq-.js";
import "./arrow-right-TrnDYsFi.js";
import "./circle-check-big-Cwck6DPV.js";
import "./globe-CuQXKfU6.js";
import "./list-todo-B9y_ixvA.js";
import "./isToday-RL2Fg3s3.js";
import "./rich-text-editor-CK9AOqrB.js";
import "./calendar-BErN999l.js";
import "./isThisMonth-C4UtR1WR.js";
import "./isSameMonth-fupOC6M2.js";
import "./chevron-left-zAeTltYW.js";
import "./isWithinInterval-BCwcG1Bq.js";
import "./parseISO-BZpuPkuQ.js";
import "./subMonths-BheFHfWm.js";
import "./table-D5Ybxpto.js";
import "./index-D6Uc8srH.js";
import "./chevrons-up-down-DISs2Pfx.js";
import "./sortable.esm-JHVIV_qM.js";
import "./reportService-DNtsOblX.js";
import "./alert-ZV6Vs13A.js";
import "./link-2-qOcW-qoJ.js";
import "./circle-x-BkjZsnQk.js";
const Image = createLucideIcon("Image", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
]);
const Video = createLucideIcon("Video", [
  [
    "path",
    {
      d: "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",
      key: "ftymec"
    }
  ],
  ["rect", { x: "2", y: "6", width: "14", height: "12", rx: "2", key: "158x01" }]
]);
const colorOptions = [
  { value: "bg-slate-200", label: "Gray", hex: "#e2e8f0" },
  { value: "bg-blue-500", label: "Blue", hex: "#3b82f6" },
  { value: "bg-green-500", label: "Green", hex: "#22c55e" },
  { value: "bg-red-500", label: "Red", hex: "#ef4444" },
  { value: "bg-orange-500", label: "Orange", hex: "#f97316" },
  { value: "bg-purple-500", label: "Purple", hex: "#a855f7" },
  { value: "bg-slate-500", label: "Accent", hex: "#64748b" }
];
function StageDialog({
  open,
  onOpenChange,
  onSave,
  editStage,
  existingStages,
  teamMembers
}) {
  const { toast } = useToast();
  const [formData, setFormData] = reactExports.useState({
    id: "",
    title: "",
    color: "bg-slate-200",
    mainResponsibleId: void 0,
    backupResponsibleId1: void 0,
    backupResponsibleId2: void 0
  });
  const [departments, setDepartments] = reactExports.useState([]);
  reactExports.useEffect(() => {
    departmentService.getAll().then(setDepartments).catch(console.error);
  }, []);
  reactExports.useEffect(() => {
    if (editStage) {
      setFormData({
        id: editStage.id,
        title: editStage.title,
        color: editStage.color,
        mainResponsibleId: editStage.mainResponsibleId,
        backupResponsibleId1: editStage.backupResponsibleId1,
        backupResponsibleId2: editStage.backupResponsibleId2
      });
    } else {
      setFormData({
        id: "",
        title: "",
        color: "bg-slate-200",
        mainResponsibleId: void 0,
        backupResponsibleId1: void 0,
        backupResponsibleId2: void 0
      });
    }
  }, [editStage, open]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim().length === 0) {
      toast({
        title: "Validation Error",
        description: "Stage title cannot be empty",
        variant: "destructive"
      });
      return;
    }
    const isDuplicate = existingStages.some(
      (stage) => stage.title.toLowerCase() === formData.title.toLowerCase() && stage.id !== editStage?.id
    );
    if (isDuplicate) {
      toast({
        title: "Validation Error",
        description: "A stage with this name already exists",
        variant: "destructive"
      });
      return;
    }
    const stageId = editStage ? formData.id : formData.title.toLowerCase().replace(/\s+/g, "-");
    onSave({
      id: stageId,
      title: formData.title,
      color: formData.color,
      type: "project",
      mainResponsibleId: formData.mainResponsibleId,
      backupResponsibleId1: formData.backupResponsibleId1,
      backupResponsibleId2: formData.backupResponsibleId2
    });
    onOpenChange(false);
  };
  const memberOptions = teamMembers.filter(
    (member) => member.is_active !== false || [formData.mainResponsibleId, formData.backupResponsibleId1, formData.backupResponsibleId2].includes(member.id)
  ).map((member) => {
    const deptName = departments.find((d) => d.id === member.department)?.name || "Other";
    return {
      value: member.id,
      label: member.name + (member.is_active === false ? " (Deactivated)" : ""),
      group: deptName
    };
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "sm:max-w-[425px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editStage ? "Edit Stage" : "Create New Stage" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editStage ? "Update the stage details below." : "Add a new stage to your kanban board." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "title", children: "Stage Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "title",
            value: formData.title,
            onChange: (e) => setFormData({ ...formData, title: e.target.value }),
            placeholder: "e.g., Review, Testing",
            maxLength: 30,
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "color", children: "Color" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: formData.color,
            onValueChange: (value) => setFormData({ ...formData, color: value }),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "color", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: colorOptions.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: option.value, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `h-3 w-3 rounded-full ${option.value}`
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: option.label })
              ] }) }, option.value)) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "main-responsible", children: "Main Responsible" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SearchableSelect,
          {
            value: formData.mainResponsibleId,
            onValueChange: (value) => setFormData({ ...formData, mainResponsibleId: value }),
            options: memberOptions.filter((o) => o.value !== formData.backupResponsibleId1 && o.value !== formData.backupResponsibleId2),
            placeholder: "Select main responsible"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "backup1-responsible", children: "Backup Responsible 1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SearchableSelect,
          {
            value: formData.backupResponsibleId1,
            onValueChange: (value) => setFormData({ ...formData, backupResponsibleId1: value }),
            options: memberOptions.filter((o) => o.value !== formData.mainResponsibleId && o.value !== formData.backupResponsibleId2),
            placeholder: "Select backup responsible 1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "backup2-responsible", children: "Backup Responsible 2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SearchableSelect,
          {
            value: formData.backupResponsibleId2,
            onValueChange: (value) => setFormData({ ...formData, backupResponsibleId2: value }),
            options: memberOptions.filter((o) => o.value !== formData.mainResponsibleId && o.value !== formData.backupResponsibleId1),
            placeholder: "Select backup responsible 2"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          onClick: () => onOpenChange(false),
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: editStage ? "Save Changes" : "Create Stage" })
    ] })
  ] }) }) });
}
const HistoryDialog = ({ open, onOpenChange, history, teamMembers, stages = [], loading }) => {
  const getUserInfo = (entry) => {
    if (entry.user) {
      return {
        name: entry.user.name,
        role: entry.user.role || "Unknown Role"
      };
    }
    const user = teamMembers.find((member) => member.id === entry.userId);
    return {
      name: user?.name || "Unknown User",
      role: user?.role || "Unknown Role"
    };
  };
  const getStageName = (stageId) => {
    if (!stageId) return "Unknown Stage";
    const stage = stages.find((s) => String(s.id) === String(stageId));
    const title = stage ? stage.title : String(stageId);
    if (typeof title !== "string") return "Unknown Stage";
    return title.toLowerCase().trim() === "pending" ? "Backlog" : title;
  };
  const renderDetails = (entry) => {
    const { action, details } = entry;
    const d = details;
    switch (action) {
      case "CREATE_PROJECT":
        return `created project "${d.name}"`;
      case "UPDATE_PROJECT":
        return `updated project status from "${d.from}" to "${d.to}"`;
      case "CREATE_TASK":
        return `created task "${d.title}"`;
      case "UPDATE_TASK":
        return `updated task "${d.to?.title || d.title || "Unknown"}"`;
      case "DELETE_TASK":
        return `deleted task "${d.title}"`;
      case "UPDATE_TASK_STATUS":
        if (d.action === "approved") {
          return `approved task and moved to "${getStageName(d.targetStage)}"`;
        }
        if (d.action === "revision_requested") {
          return `requested revision and moved task to "${getStageName(d.targetStage)}"`;
        }
        return `moved task from "${getStageName(d.from)}" to "${getStageName(d.to)}"`;
      case "UPDATE_TASK_ASSIGNEE":
        entry.user || teamMembers.find((m) => m.id === d.to);
        return `assigned task to ${d.to}`;
      case "CREATE_STAGE":
        return `created stage "${d.title}"`;
      case "UPDATE_STAGE":
        return `updated stage "${d.to?.title || "Unknown"}"`;
      case "DELETE_STAGE":
        return `deleted stage "${d.title}"`;
      case "USER_START_TASK":
        return `started task "${d.title}"`;
      case "USER_COMPLETE_TASK":
        return `completed task "${d.title}"`;
      default:
        return "performed an unknown action";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-4xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Project History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "A log of all changes made to this project." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[60vh] p-4 border rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: history.length > 0 ? history.map((entry) => {
      const userInfo = getUserInfo(entry);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-20 text-xs text-muted-foreground", children: (() => {
          const timestamp = entry.timestamp ? new Date(entry.timestamp) : null;
          return timestamp && isValid(timestamp) ? format(timestamp, "PPpp") : "Unknown date";
        })() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: userInfo.name }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "(",
            userInfo.role,
            ")"
          ] }),
          " ",
          renderDetails(entry)
        ] })
      ] }, entry.id);
    }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center pt-6 pb-2 text-xs text-muted-foreground/50", children: "No history records found." }) }) })
  ] }) });
};
function mapToBackend(stage) {
  return {
    title: stage.title,
    color: stage.color,
    order: stage.order,
    type: stage.type,
    project_id: stage.projectId ? String(stage.projectId) : stage.project_id ? String(stage.project_id) : void 0,
    main_responsible_id: stage.mainResponsibleId ? parseInt(stage.mainResponsibleId) : null,
    backup_responsible_id_1: stage.backupResponsibleId1 ? parseInt(stage.backupResponsibleId1) : null,
    backup_responsible_id_2: stage.backupResponsibleId2 ? parseInt(stage.backupResponsibleId2) : null,
    is_review_stage: stage.isReviewStage,
    linked_review_stage_id: stage.linkedReviewStageId ? parseInt(stage.linkedReviewStageId) : null,
    approved_target_stage_id: stage.approvedTargetStageId ? parseInt(stage.approvedTargetStageId) : null,
    stage_group_id: stage.stageGroupId || null
  };
}
function mapFromBackend(raw) {
  let color = raw.color;
  if (!color) {
    const t = raw.title?.toLowerCase().trim();
    if (t?.includes("suggested")) color = "bg-blue-400";
    else if (t === "pending") color = "bg-orange-300";
    else if (t?.includes("complete")) color = "bg-green-500";
    else if (t === "archive") color = "bg-gray-400";
    else color = "bg-status-todo";
  }
  return {
    id: String(raw.id),
    title: raw.title,
    color,
    order: raw.order ?? 0,
    type: raw.type === "user" || raw.type === "project" ? raw.type : "project",
    mainResponsibleId: raw.main_responsible_id ? String(raw.main_responsible_id) : void 0,
    backupResponsibleId1: raw.backup_responsible_id_1 ? String(raw.backup_responsible_id_1) : void 0,
    backupResponsibleId2: raw.backup_responsible_id_2 ? String(raw.backup_responsible_id_2) : void 0,
    isReviewStage: raw.is_review_stage ?? false,
    linkedReviewStageId: raw.linked_review_stage_id ? String(raw.linked_review_stage_id) : void 0,
    approvedTargetStageId: raw.approved_target_stage_id ? String(raw.approved_target_stage_id) : void 0,
    stageGroupId: raw.stage_group_id ? raw.stage_group_id : void 0
  };
}
const stageService = {
  getAll: async () => {
    const { data } = await api.get("/stages");
    return Array.isArray(data) ? data.map(mapFromBackend) : [];
  },
  getById: async (id) => {
    const { data } = await api.get(`/stages/${id}`);
    return mapFromBackend(data);
  },
  getByProject: async (projectId) => {
    const { data } = await api.get(`/stages`, { params: { project_id: projectId } });
    return Array.isArray(data) ? data.map(mapFromBackend) : [];
  },
  create: async (stage) => {
    const payload = mapToBackend(stage);
    const { data } = await api.post("/stages", payload);
    return mapFromBackend(data);
  },
  update: async (id, updates) => {
    mapToBackend(updates);
    const refinedPayload = {};
    if ("title" in updates) refinedPayload.title = updates.title;
    if ("color" in updates) refinedPayload.color = updates.color;
    if ("order" in updates) refinedPayload.order = updates.order;
    if ("type" in updates) refinedPayload.type = updates.type;
    if ("projectId" in updates) refinedPayload.project_id = updates.projectId;
    if ("mainResponsibleId" in updates) refinedPayload.main_responsible_id = updates.mainResponsibleId ? parseInt(updates.mainResponsibleId) : null;
    if ("backupResponsibleId1" in updates) refinedPayload.backup_responsible_id_1 = updates.backupResponsibleId1 ? parseInt(updates.backupResponsibleId1) : null;
    if ("backupResponsibleId2" in updates) refinedPayload.backup_responsible_id_2 = updates.backupResponsibleId2 ? parseInt(updates.backupResponsibleId2) : null;
    if ("isReviewStage" in updates) refinedPayload.is_review_stage = updates.isReviewStage;
    if ("linkedReviewStageId" in updates) refinedPayload.linked_review_stage_id = updates.linkedReviewStageId ? parseInt(updates.linkedReviewStageId) : null;
    if ("approvedTargetStageId" in updates) refinedPayload.approved_target_stage_id = updates.approvedTargetStageId ? parseInt(updates.approvedTargetStageId) : null;
    if ("stageGroupId" in updates) refinedPayload.stage_group_id = updates.stageGroupId;
    const { data } = await api.put(`/stages/${id}`, refinedPayload);
    return mapFromBackend(data);
  },
  delete: async (id) => {
    await api.delete(`/stages/${id}`);
  }
};
function AddSubtaskDialog({
  open,
  onOpenChange,
  onSave,
  teamMembers,
  departments,
  parentTaskTitle,
  currentUser
}) {
  const { toast } = useToast();
  const { activeRole } = useUser();
  const fileInputRef = reactExports.useRef(null);
  const [formData, setFormData] = reactExports.useState({
    title: "",
    description: "",
    assignee: "",
    assigneeId: "",
    dueDate: "",
    dueTime: "",
    userStatus: "pending",
    priority: "medium",
    startDate: "",
    startTime: ""
  });
  const [tags, setTags] = reactExports.useState([]);
  const [newTag, setNewTag] = reactExports.useState("");
  const [noStartDate, setNoStartDate] = reactExports.useState(false);
  const [noEndDate, setNoEndDate] = reactExports.useState(false);
  const [pendingFiles, setPendingFiles] = reactExports.useState([]);
  const [pendingLinks, setPendingLinks] = reactExports.useState([]);
  const [newLinkName, setNewLinkName] = reactExports.useState("");
  const [newLinkUrl, setNewLinkUrl] = reactExports.useState("");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [availableTags, setAvailableTags] = reactExports.useState([]);
  const [tagDepartmentId, setTagDepartmentId] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (open) {
      const today = /* @__PURE__ */ new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const defaultAssignee = currentUser ? currentUser.name : "";
      const defaultAssigneeId = currentUser ? currentUser.id : "";
      if (currentUser) {
        setTagDepartmentId(currentUser.department);
      } else if (departments && departments.length > 0) {
        setTagDepartmentId(departments[0].id);
      }
      setFormData({
        title: "",
        description: "",
        assignee: defaultAssignee,
        assigneeId: defaultAssigneeId,
        dueDate: tomorrow.toISOString().split("T")[0],
        dueTime: "17:00",
        userStatus: "pending",
        priority: "medium",
        startDate: today.toISOString().split("T")[0],
        startTime: "09:00"
      });
      setTags([]);
      setPendingFiles([]);
      setPendingLinks([]);
      setNewTag("");
      setNewLinkName("");
      setNewLinkUrl("");
      setNoStartDate(false);
      setNoEndDate(false);
    }
  }, [open, currentUser, departments]);
  reactExports.useEffect(() => {
    const loadTags = async () => {
      if (!tagDepartmentId) return;
      try {
        const tags2 = await tagService.getAll(tagDepartmentId);
        setAvailableTags(tags2);
      } catch (error) {
        console.error("Failed to load tags:", error);
      }
    };
    if (open) {
      loadTags();
    }
  }, [tagDepartmentId, open]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dueDateTime = noEndDate ? null : formData.dueDate ? `${formData.dueDate}T${formData.dueTime || "00:00"}:00` : (/* @__PURE__ */ new Date()).toISOString();
      const startDateTime = noStartDate ? null : formData.startDate ? `${formData.startDate}T${formData.startTime || "00:00"}:00` : void 0;
      const filesToUpload = pendingFiles.map((pf) => pf.file);
      await onSave({
        title: formData.title,
        description: formData.description,
        assignee: formData.assignee,
        assigneeId: formData.assigneeId,
        dueDate: dueDateTime || "",
        userStatus: formData.userStatus,
        priority: formData.priority,
        startDate: startDateTime || void 0,
        tags,
        pendingFiles: filesToUpload,
        pendingLinks
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create subtask", error);
      toast({
        title: "Error",
        description: "Failed to create subtask.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const getDepartmentName = (departmentId) => {
    return departments?.find((dep) => dep.id === departmentId)?.name || "Other";
  };
  const memberOptions = teamMembers.map((member) => {
    const departmentName = member.department ? getDepartmentName(member.department) : "Other";
    return {
      value: member.id,
      // Use ID as value for more precision, but wait, TaskDialog uses ID?
      // TaskDialog uses SearchableSelect which expects values.
      // Let's check TaskDialog (Step 546):
      // value={formData.assigneeIds[0]} - so it uses ID.
      // options={memberOptions} where value is member.id.
      // So yes, we should use member.id as value.
      label: member.name,
      group: departmentName
    };
  });
  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag("");
    }
  };
  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };
  const handleCreateTag = async () => {
    if (!newTag || !tagDepartmentId) return;
    try {
      const createdTag = await tagService.create(newTag, tagDepartmentId);
      setAvailableTags((prev) => [...prev, createdTag]);
      addTag(createdTag.name);
      toast({ title: "Tag created", description: "New tag added." });
    } catch (error) {
      console.error("Failed to create tag:", error);
      toast({ title: "Error", description: "Failed to create tag.", variant: "destructive" });
    }
  };
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newPendingFiles = Array.from(files).map((file) => ({
      id: `pending-${Date.now()}-${Math.random()}`,
      file,
      name: file.name
    }));
    setPendingFiles((prev) => [...prev, ...newPendingFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const removePendingFile = (id) => {
    setPendingFiles(pendingFiles.filter((pf) => pf.id !== id));
  };
  const addLink = () => {
    if (newLinkName && newLinkUrl) {
      setPendingLinks([...pendingLinks, { name: newLinkName, url: newLinkUrl }]);
      setNewLinkName("");
      setNewLinkUrl("");
    }
  };
  const removePendingLink = (index) => {
    setPendingLinks(pendingLinks.filter((_, i) => i !== index));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "sm:max-w-[600px] overflow-y-auto max-h-[90vh]", onPointerDownOutside: (e) => e.preventDefault(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Subtask" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "Adding a subtask to: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: parentTaskTitle })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "title", children: "Title *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "title",
            value: formData.title,
            onChange: (e) => setFormData({ ...formData, title: e.target.value }),
            placeholder: "Enter subtask title",
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
            placeholder: "Enter description",
            rows: 3
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "assignee", children: "Assign To *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SearchableSelect,
            {
              value: formData.assigneeId,
              onValueChange: (value) => {
                const user = teamMembers.find((u) => u.id === value);
                setFormData({ ...formData, assigneeId: value, assignee: user ? user.name : "" });
              },
              options: memberOptions,
              placeholder: "Select member"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "priority", children: "Priority" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.priority,
              onValueChange: (value) => setFormData({ ...formData, priority: value }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "priority", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "low", children: "Low" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "medium", children: "Medium" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "high", children: "High" })
                ] })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "startDate", children: "Start Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  id: "noStartDate",
                  checked: noStartDate,
                  onCheckedChange: (checked) => setNoStartDate(checked)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "noStartDate", className: "text-xs font-normal text-muted-foreground", children: "No date" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "startDate",
              type: "date",
              value: formData.startDate,
              disabled: noStartDate,
              onChange: (e) => setFormData({ ...formData, startDate: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "startTime", children: "Start Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "startTime",
              type: "time",
              value: formData.startTime,
              disabled: noStartDate,
              onChange: (e) => setFormData({ ...formData, startTime: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "dueDate", children: [
              "End Date ",
              noEndDate ? "" : "*"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  id: "noEndDate",
                  checked: noEndDate,
                  onCheckedChange: (checked) => setNoEndDate(checked)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "noEndDate", className: "text-xs font-normal text-muted-foreground", children: "No date" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "dueDate",
              type: "date",
              value: formData.dueDate,
              disabled: noEndDate,
              onChange: (e) => setFormData({ ...formData, dueDate: e.target.value }),
              required: !noEndDate
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dueTime", children: "End Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "dueTime",
              type: "time",
              value: formData.dueTime,
              disabled: noEndDate,
              onChange: (e) => setFormData({ ...formData, dueTime: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tags" }),
          activeRole === "admin" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tagDepartmentId, onValueChange: setTagDepartmentId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px] h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Filter by Department" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: departments?.map((dept) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: dept.id, children: dept.name }, dept.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1", children: [
          tag,
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3 cursor-pointer", onClick: () => removeTag(tag) })
        ] }, tag)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SearchableSelect,
            {
              value: "",
              onValueChange: (val) => addTag(val),
              options: availableTags.map((t) => ({ value: t.name, label: t.name, group: "Available Tags" })),
              placeholder: "Search tags..."
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 w-1/2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "New tag...",
                value: newTag,
                onChange: (e) => setNewTag(e.target.value)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", onClick: handleCreateTag, disabled: !newTag, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Attachments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-dashed rounded-lg p-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  ref: fileInputRef,
                  type: "file",
                  multiple: true,
                  className: "hidden",
                  onChange: handleFileUpload
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  type: "button",
                  variant: "outline",
                  className: "w-full",
                  onClick: () => fileInputRef.current?.click(),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mr-2 h-4 w-4" }),
                    " Upload Files"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "Link Name",
                  value: newLinkName,
                  onChange: (e) => setNewLinkName(e.target.value)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  placeholder: "URL",
                  value: newLinkUrl,
                  onChange: (e) => setNewLinkUrl(e.target.value)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", onClick: addLink, disabled: !newLinkName || !newLinkUrl, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
            ] }) })
          ] }),
          pendingFiles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "Files to upload:" }),
            pendingFiles.map((pf) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm bg-muted/50 p-2 rounded", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: pf.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => removePendingFile(pf.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
            ] }, pf.id))
          ] }),
          pendingLinks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "Links to add:" }),
            pendingLinks.map((link, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm bg-muted/50 p-2 rounded", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: link.url, target: "_blank", rel: "noopener noreferrer", className: "hover:underline", children: link.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => removePendingLink(index), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
            ] }, index))
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), disabled: isSubmitting, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        " Saving..."
      ] }) : "Add Subtask" })
    ] })
  ] }) }) });
}
const ACCEPTED_TYPES = ".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg";
function ImportTasksDialog({ open, onOpenChange, projectId, projectName, onSubmitted }) {
  const { toast } = useToast();
  const [file, setFile] = reactExports.useState();
  const [isDragging, setIsDragging] = reactExports.useState(false);
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post(`/projects/${projectId}/upload-tasks`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const importId = res.data?.import_id;
      toast({
        title: "File submitted",
        description: "AI is extracting tasks. A review popup will appear automatically when ready."
      });
      setFile(void 0);
      onOpenChange(false);
      if (importId) onSubmitted(importId);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to submit file for processing.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogContent,
    {
      className: "sm:max-w-[480px]",
      onPointerDownOutside: (e) => e.preventDefault(),
      onInteractOutside: (e) => e.preventDefault(),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
            "Import Tasks from File"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
            "Upload a document for ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: projectName }),
            ". AI will extract tasks, descriptions and deadlines — you'll review everything before anything is created."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Document" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors cursor-pointer ${isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"}`,
                onDragOver: (e) => {
                  e.preventDefault();
                  setIsDragging(true);
                },
                onDragLeave: () => setIsDragging(false),
                onDrop: handleDrop,
                onClick: () => !file && document.getElementById("import-file-input")?.click(),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 text-center", children: file ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(File, { className: "mx-auto h-10 w-10 text-primary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-medium", children: file.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    (file.size / 1024 / 1024).toFixed(2),
                    " MB"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      type: "button",
                      variant: "ghost",
                      size: "sm",
                      className: "mt-2 text-destructive hover:text-destructive",
                      onClick: (ev) => {
                        ev.stopPropagation();
                        setFile(void 0);
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 mr-1" }),
                        " Remove"
                      ]
                    }
                  )
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUpload, { className: "mx-auto h-10 w-10 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "label",
                      {
                        htmlFor: "import-file-input",
                        className: "cursor-pointer font-medium text-primary hover:text-primary/80",
                        onClick: (ev) => ev.stopPropagation(),
                        children: [
                          "Click to upload",
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Input,
                            {
                              id: "import-file-input",
                              type: "file",
                              className: "sr-only",
                              accept: ACCEPTED_TYPES,
                              onChange: (ev) => {
                                const f = ev.target.files?.[0];
                                if (f) setFile(f);
                                ev.target.value = "";
                              }
                            }
                          )
                        ]
                      }
                    ),
                    " ",
                    "or drag and drop"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "PDF, Word, Excel, TXT, CSV, or image — up to 20 MB" })
                ] }) })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/50 border px-4 py-3 text-xs text-muted-foreground space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: "What happens next?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "1. The file is sent to an AI pipeline that extracts tasks, descriptions & due dates." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "2. Processing may take a moment. This dialog closes immediately after upload." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "3. A review popup ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "opens automatically" }),
              " when results arrive — you can bulk-assign stages & team members before any task is created."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => onOpenChange(false), disabled: isSubmitting, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: !file || isSubmitting, children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
            " Submitting…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "mr-2 h-4 w-4" }),
            " Extract Tasks"
          ] }) })
        ] })
      ] })
    }
  ) });
}
const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" }
];
const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
};
function ImportTasksReviewDialog({
  open,
  onOpenChange,
  tasks,
  projectId,
  stages,
  teamMembers,
  departments,
  onTasksCreated
}) {
  const { toast } = useToast();
  const [rows, setRows] = reactExports.useState([]);
  const [bulkAssigneeId, setBulkAssigneeId] = reactExports.useState("");
  const [bulkStageId, setBulkStageId] = reactExports.useState("");
  const [isCreating, setIsCreating] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (open && tasks.length > 0) {
      const pendingStage = stages.find((s) => s.title.toLowerCase().trim() === "pending");
      const defaultStageId = pendingStage ? String(pendingStage.id) : "";
      setRows(
        tasks.map((t, i) => ({
          ...t,
          _id: i,
          assigneeId: "",
          stageId: defaultStageId
        }))
      );
      setBulkAssigneeId("");
      setBulkStageId("");
    }
  }, [open, tasks, stages]);
  const applyBulkAssignee = () => {
    if (!bulkAssigneeId) return;
    setRows((prev) => prev.map((r) => ({ ...r, assigneeId: bulkAssigneeId })));
  };
  const applyBulkStage = () => {
    if (!bulkStageId) return;
    setRows((prev) => prev.map((r) => ({ ...r, stageId: bulkStageId })));
  };
  const updateRow = (id, patch) => {
    setRows((prev) => prev.map((r) => r._id === id ? { ...r, ...patch } : r));
  };
  const removeRow = (id) => {
    setRows((prev) => prev.filter((r) => r._id !== id));
  };
  const handleCreate = async () => {
    if (rows.length === 0) return;
    const missing = rows.filter((r) => !r.title.trim());
    if (missing.length > 0) {
      toast({ title: "Validation error", description: "All tasks must have a title.", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    let created = 0;
    let failed = 0;
    for (const row of rows) {
      try {
        await taskService.create({
          title: row.title.trim(),
          description: row.description || "",
          projectId,
          assigneeId: row.assigneeId ? parseInt(row.assigneeId) : void 0,
          projectStageId: row.stageId ? parseInt(row.stageId) : void 0,
          dueDate: row.due_date || void 0,
          priority: row.priority || "medium",
          userStatus: "pending"
        });
        created++;
      } catch {
        failed++;
      }
    }
    setIsCreating(false);
    if (failed === 0) {
      toast({ title: `${created} task${created !== 1 ? "s" : ""} created`, description: "All imported tasks were added to the project." });
    } else {
      toast({
        title: `${created} created, ${failed} failed`,
        description: "Some tasks could not be created. Please add them manually.",
        variant: "destructive"
      });
    }
    onTasksCreated();
    onOpenChange(false);
  };
  const getDeptName = (id) => departments.find((d) => d.id === id)?.name || "";
  const membersByDept = teamMembers.filter((m) => m.is_active !== false).sort((a, b) => {
    const da = getDeptName(a.department);
    const db = getDeptName(b.department);
    return da.localeCompare(db) || a.name.localeCompare(b.name);
  });
  const visibleStages = stages.filter(
    (s) => !["archive"].includes(s.title.toLowerCase().trim())
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col p-0",
      onPointerDownOutside: (e) => e.preventDefault(),
      onInteractOutside: (e) => e.preventDefault(),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "px-6 pt-6 pb-0 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
            "Review Imported Tasks",
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "ml-1", children: [
              rows.length,
              " task",
              rows.length !== 1 ? "s" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Tasks extracted by AI. Review, edit, assign stages and team members, then confirm to create them." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-3 bg-muted/40 border-y flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide", children: "Bulk Assign All" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-[200px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-muted-foreground flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: bulkAssigneeId, onValueChange: setBulkAssigneeId, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Assignee for all…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: membersByDept.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(m.id), className: "text-xs", children: [
                  m.name,
                  getDeptName(m.department) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-muted-foreground", children: [
                    "(",
                    getDeptName(m.department),
                    ")"
                  ] })
                ] }, m.id)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-8 text-xs", onClick: applyBulkAssignee, disabled: !bulkAssigneeId, children: "Apply" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-[200px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-4 w-4 text-muted-foreground flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: bulkStageId, onValueChange: setBulkStageId, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Stage for all…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: visibleStages.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), className: "text-xs", children: s.title.toLowerCase().trim() === "pending" ? "Backlog" : s.title }, s.id)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-8 text-xs", onClick: applyBulkStage, disabled: !bulkStageId, children: "Apply" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto min-h-0 custom-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 space-y-4", children: [
          rows.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: "No tasks to review. All removed." }),
          rows.map((row, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-3 bg-card shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-muted-foreground", children: [
                "#",
                idx + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 w-7 p-0 text-muted-foreground hover:text-destructive",
                  onClick: () => removeRow(row._id),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Title *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: row.title,
                  onChange: (e) => updateRow(row._id, { title: e.target.value }),
                  className: "h-8 text-sm",
                  placeholder: "Task title"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Textarea,
                {
                  value: row.description || "",
                  onChange: (e) => updateRow(row._id, { description: e.target.value || null }),
                  className: "text-sm min-h-[60px] resize-none",
                  placeholder: "Optional description…"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
                  " Due Date"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "date",
                    className: "h-8 text-xs",
                    value: row.due_date || "",
                    onChange: (e) => updateRow(row._id, { due_date: e.target.value || null })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Priority" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: row.priority || "medium",
                    onValueChange: (v) => updateRow(row._id, { priority: v }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PRIORITY_OPTIONS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.value, className: "text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${PRIORITY_COLORS[p.value]}`, children: p.label }) }, p.value)) })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }),
                  " Assignee"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: row.assigneeId || "__none__",
                    onValueChange: (v) => updateRow(row._id, { assigneeId: v === "__none__" ? "" : v }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", className: "text-xs text-muted-foreground", children: "None" }),
                        membersByDept.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(m.id), className: "text-xs", children: m.name }, m.id))
                      ] })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-3 w-3" }),
                  " Stage"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: row.stageId || "__none__",
                    onValueChange: (v) => updateRow(row._id, { stageId: v === "__none__" ? "" : v }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", className: "text-xs text-muted-foreground", children: "None" }),
                        visibleStages.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(s.id), className: "text-xs", children: s.title.toLowerCase().trim() === "pending" ? "Backlog" : s.title }, s.id))
                      ] })
                    ]
                  }
                )
              ] })
            ] })
          ] }, row._id))
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "px-6 py-4 flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => onOpenChange(false), disabled: isCreating, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleCreate, disabled: isCreating || rows.length === 0, children: isCreating ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
            " Creating tasks…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "mr-2 h-4 w-4" }),
            " Create ",
            rows.length,
            " Task",
            rows.length !== 1 ? "s" : ""
          ] }) })
        ] })
      ]
    }
  ) });
}
function ProjectAttachmentsTab({ project, tasks }) {
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [viewingAttachment, setViewingAttachment] = reactExports.useState(null);
  const [isResolvingUrl, setIsResolvingUrl] = reactExports.useState(false);
  const { toast } = useToast();
  const allAttachments = reactExports.useMemo(() => {
    const flattened = [];
    const processTasks = (taskList) => {
      taskList.forEach((task) => {
        if (task.attachments) {
          task.attachments.forEach((attachment) => {
            flattened.push({
              ...attachment,
              taskTitle: task.title,
              taskId: task.id
            });
          });
        }
        if (task.subtasks && task.subtasks.length > 0) {
          processTasks(task.subtasks);
        }
      });
    };
    processTasks(tasks);
    return flattened.sort(
      (a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
    );
  }, [tasks]);
  const filteredAttachments = allAttachments.filter(
    (a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.taskTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const isImage = (name) => {
    const ext = name.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
  };
  const isVideo = (name) => {
    const ext = name.split(".").pop()?.toLowerCase();
    return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
  };
  const handleView = async (attachment) => {
    if (attachment.type === "link") {
      window.open(attachment.url, "_blank");
      return;
    }
    setIsResolvingUrl(true);
    try {
      const { url } = await attachmentService.download(attachment.id, "view");
      setViewingAttachment({ ...attachment, url });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open viewer. Please try downloading instead.",
        variant: "destructive"
      });
    } finally {
      setIsResolvingUrl(false);
    }
  };
  const handleDownload = async (attachmentId, name) => {
    try {
      const { url } = await attachmentService.download(attachmentId, "download");
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file.",
        variant: "destructive"
      });
    }
  };
  const getIcon = (attachment) => {
    if (attachment.type === "link") return /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-5 w-5 text-blue-500" });
    if (isImage(attachment.name)) return /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-5 w-5 text-purple-500" });
    if (isVideo(attachment.name)) return /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-5 w-5 text-rose-500" });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(File, { className: "h-5 w-5 text-gray-500" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Search attachments by name or task...",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          className: "pl-9 bg-muted/30 border-muted-foreground/20"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: filteredAttachments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 border-2 border-dashed rounded-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-12 w-12 text-muted-foreground/30 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No attachments found." })
    ] }) : filteredAttachments.map((attachment) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "group hover:border-primary/30 transition-all duration-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0", children: getIcon(attachment) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold truncate group-hover:text-primary transition-colors", children: attachment.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate max-w-[150px]", children: [
            "Task: ",
            attachment.taskTitle
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: attachment.uploadedAt ? format(new Date(attachment.uploadedAt), "MMM d, yyyy") : "N/A" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "h-8 w-8 p-0",
            onClick: () => handleView(attachment),
            disabled: isResolvingUrl,
            children: attachment.type === "link" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }) : isVideo(attachment.name) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
          }
        ),
        attachment.type === "file" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "h-8 w-8 p-0",
            onClick: () => handleDownload(attachment.id, attachment.name),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }) }, `${attachment.id}-${attachment.taskId}`)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewingAttachment, onOpenChange: (open) => !open && setViewingAttachment(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { hideCloseButton: true, className: "sm:max-w-[800px] p-0 overflow-hidden bg-black/90 border-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          className: "absolute top-2 right-2 z-10 text-white hover:bg-white/20",
          onClick: () => setViewingAttachment(null),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center min-h-[400px]", children: [
        viewingAttachment && isImage(viewingAttachment.name) && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: viewingAttachment.url,
            alt: viewingAttachment.name,
            className: "max-w-full max-h-[80vh] object-contain"
          }
        ),
        viewingAttachment && isVideo(viewingAttachment.name) && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "video",
          {
            src: viewingAttachment.url,
            controls: true,
            autoPlay: true,
            className: "max-w-full max-h-[80vh]"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-black/50 backdrop-blur-sm text-white flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate pr-4", children: viewingAttachment?.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "bg-transparent border-white/20 text-white hover:bg-white/10", onClick: () => handleDownload(viewingAttachment?.id, viewingAttachment?.name), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-2" }),
          "Download"
        ] })
      ] })
    ] }) }) })
  ] });
}
function FilePreviewDialog({ open, onOpenChange, file }) {
  if (!file) return null;
  const isImage = (name) => {
    const ext = name.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
  };
  const isVideo = (name) => {
    const ext = name.split(".").pop()?.toLowerCase();
    return ["mp4", "webm", "ogg", "mov"].includes(ext || "");
  };
  const isPdf = (name) => {
    const ext = name.split(".").pop()?.toLowerCase();
    return ext === "pdf";
  };
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const renderPreview = () => {
    if (file.type === "link") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-8 w-8 text-blue-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: "External Link" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground max-w-[300px] mx-auto mt-1", children: file.url })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => window.open(file.url, "_blank"), children: "Open in New Tab" })
      ] });
    }
    if (isImage(file.name)) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center bg-muted/10 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: file.url,
          alt: file.name,
          className: "max-w-full max-h-[70vh] object-contain shadow-xl"
        }
      ) });
    }
    if (isVideo(file.name)) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center bg-black rounded-lg overflow-hidden shadow-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "video",
        {
          src: file.url,
          controls: true,
          autoPlay: true,
          className: "max-w-full max-h-[70vh]"
        }
      ) });
    }
    if (isPdf(file.name)) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-[70vh] rounded-lg overflow-hidden border shadow-inner bg-muted/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "iframe",
        {
          src: `${file.url}#toolbar=0`,
          className: "w-full h-full border-none",
          title: file.name
        }
      ) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/10 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8 text-muted-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: "Preview not available" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "This file type doesn't support in-browser previewing." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleDownload, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-2" }),
        "Download to View"
      ] })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[900px] w-[95vw] p-0 overflow-hidden border-none shadow-2xl bg-background/95 backdrop-blur-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "px-6 py-4 border-b flex flex-row items-center justify-between space-y-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
          "p-2 rounded-lg shrink-0",
          file.type === "link" ? "bg-blue-100 text-blue-600" : isImage(file.name) ? "bg-purple-100 text-purple-600" : isVideo(file.name) ? "bg-rose-100 text-rose-600" : isPdf(file.name) ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-600"
        ), children: file.type === "link" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }) : isImage(file.name) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4" }) : isVideo(file.name) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-base font-bold truncate leading-none mb-1", children: file.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-[10px] uppercase font-black tracking-widest opacity-60", children: file.type === "link" ? "External Link" : "Project Attachment" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pr-8", children: [
        file.type === "file" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handleDownload, className: "h-8 gap-2 font-bold bg-background/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
          "Download"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "icon", onClick: () => onOpenChange(false), className: "h-8 w-8 rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 max-h-[80vh] overflow-y-auto", children: renderPreview() })
  ] }) });
}
function ProjectLevelAttachmentsDialog({
  open,
  onOpenChange,
  project,
  onProjectUpdate
}) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const [newLinkName, setNewLinkName] = reactExports.useState("");
  const [newLinkUrl, setNewLinkUrl] = reactExports.useState("");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const fileInputRef = reactExports.useRef(null);
  const [previewFile, setPreviewFile] = reactExports.useState(null);
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      await projectAttachmentService.uploadFiles(String(project.id), Array.from(files));
      toast({
        title: "Upload Started",
        description: `${files.length} file(s) are being uploaded.`
      });
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload files.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const handleAddLink = async () => {
    if (!newLinkName || !newLinkUrl) return;
    setIsUploading(true);
    try {
      await projectAttachmentService.addLink(String(project.id), newLinkName, newLinkUrl);
      setNewLinkName("");
      setNewLinkUrl("");
      toast({
        title: "Link Added",
        description: "External link has been added to the project."
      });
      onProjectUpdate(project);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add link.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  const handleRemoveAttachment = async (id) => {
    try {
      await projectAttachmentService.delete(id);
      toast({
        title: "Attachment Removed",
        description: "Attachment has been deleted."
      });
      onProjectUpdate(project);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove attachment.",
        variant: "destructive"
      });
    }
  };
  const filteredAttachments = (project.attachments || []).filter(
    (a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.url.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "p-6 pb-4 border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-5 w-5 text-primary" }),
            "Project Files & Links"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
            "Centralized resources for ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: project.name })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "h-9 gap-2 font-semibold",
              onClick: () => fileInputRef.current?.click(),
              disabled: isUploading,
              children: [
                isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
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
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-auto p-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-end bg-muted/20 p-4 rounded-xl border border-dashed border-muted-foreground/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dlgLinkName", className: "text-[10px] text-muted-foreground uppercase font-black tracking-widest", children: "Link Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "dlgLinkName",
                placeholder: "e.g. Figma Design",
                value: newLinkName,
                onChange: (e) => setNewLinkName(e.target.value),
                className: "h-9 bg-background focus:ring-1 focus:ring-primary"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 flex-[2]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "dlgLinkUrl", className: "text-[10px] text-muted-foreground uppercase font-black tracking-widest", children: "URL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "dlgLinkUrl",
                placeholder: "https://...",
                value: newLinkUrl,
                onChange: (e) => setNewLinkUrl(e.target.value),
                className: "h-9 bg-background focus:ring-1 focus:ring-primary"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              className: "h-9 font-bold px-4",
              onClick: handleAddLink,
              disabled: !newLinkName || !newLinkUrl || isUploading,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
                " Add Link"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Search attachments...",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "pl-9 h-10 bg-muted/30 border-muted-foreground/20"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filteredAttachments.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: filteredAttachments.map((attachment) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between p-3 rounded-lg border bg-muted/30 group hover:border-primary/50 hover:bg-background transition-all duration-200 hover:shadow-md",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 overflow-hidden", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
                    "p-2 rounded-lg",
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
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-8 w-8 text-muted-foreground hover:text-primary",
                      onClick: () => setPreviewFile(attachment),
                      title: "Quick Preview",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-8 w-8 text-muted-foreground hover:text-primary",
                      onClick: () => window.open(attachment.url, "_blank"),
                      title: "Open in New Tab",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-8 w-8 text-muted-foreground hover:text-destructive",
                      onClick: () => handleRemoveAttachment(attachment.id),
                      title: "Delete",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                    }
                  )
                ] })
              ]
            },
            attachment.id
          )) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 border-2 border-dashed rounded-xl bg-muted/10 flex flex-col items-center justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-6 w-6 text-muted-foreground/40" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-muted-foreground", children: "No attachments found." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60 mt-1 max-w-[200px] mx-auto text-center", children: "Try a different search or add a new resource above." })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t bg-muted/30 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => onOpenChange(false), children: "Close" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FilePreviewDialog,
      {
        open: !!previewFile,
        onOpenChange: (open2) => !open2 && setPreviewFile(null),
        file: previewFile ? {
          id: previewFile.id,
          name: previewFile.name,
          url: previewFile.url,
          type: previewFile.type
        } : null
      }
    )
  ] });
}
function ProjectKanbanFixed() {
  const { projectId } = useParams();
  const [project, setProject] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const { toast } = useToast();
  reactExports.useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setProject(null);
        return;
      }
      const cachedProject = cacheService.get(`project_${projectId}`);
      if (cachedProject) {
        setProject(cachedProject);
        setLoading(false);
      } else {
        setLoading(true);
      }
      try {
        const allProjects = await projectService.getAll();
        let found = null;
        if (/^\d+$/.test(projectId)) {
          found = allProjects.find((p) => String(p.id) === projectId);
        } else {
          const decoded = decodeURIComponent(projectId);
          found = allProjects.find((p) => p.name === decoded);
          if (!found) {
            const slug = projectId.toLowerCase();
            found = allProjects.find((p) => p.name.toLowerCase().replace(/\s+/g, "-") === slug);
          }
        }
        setProject(found || null);
      } catch (e) {
        console.error(e);
        toast({ title: "Error", description: "Failed to load project", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
    const mainElement = document.querySelector("main.flex-1.p-6.overflow-y-auto");
    const rootDiv = document.querySelector(".min-h-screen");
    if (mainElement) {
      const el = mainElement;
      const originalOverflow = el.style.overflowY;
      const originalPadding = el.style.padding;
      el.style.overflowY = "hidden";
      el.style.padding = "0";
      if (rootDiv) {
        const rootEl = rootDiv;
        const originalHeight = rootEl.style.height;
        const originalRootOverflow = rootEl.style.overflow;
        rootEl.style.height = "100vh";
        rootEl.style.overflow = "hidden";
        return () => {
          el.style.overflowY = originalOverflow;
          el.style.padding = originalPadding;
          rootEl.style.height = originalHeight;
          rootEl.style.overflow = originalRootOverflow;
        };
      }
      return () => {
        el.style.overflowY = originalOverflow;
        el.style.padding = originalPadding;
      };
    }
  }, [projectId]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 border-b bg-background z-10 px-6 py-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row flex-wrap items-start justify-between gap-4 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-64" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-96" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-24" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-32" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-28" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-32" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full overflow-auto p-6 pb-10 bg-muted/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full gap-6", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 w-80 flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full rounded-lg" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [1, 2, 3].map((j) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg border bg-card space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4 rounded-full" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-6 rounded-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-16" })
          ] })
        ] }, j)) })
      ] }, i)) }) }) })
    ] });
  }
  if (!project) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-screen", children: "Project not found" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectBoardContent, { project }, project.id);
}
function ProjectBoardContent({ project: initialProject }) {
  const numericProjectId = initialProject.id ? parseInt(String(initialProject.id), 10) : void 0;
  const [project, setProject] = reactExports.useState(initialProject);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [tasks, setTasks] = reactExports.useState([]);
  const [allTasks, setAllTasks] = reactExports.useState([]);
  const [teamMembers, setTeamMembers] = reactExports.useState([]);
  const [departments, setDepartments] = reactExports.useState([]);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = reactExports.useState(false);
  const [isStageManagementOpen, setIsStageManagementOpen] = reactExports.useState(false);
  const [isStageDialogOpen, setIsStageDialogOpen] = reactExports.useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = reactExports.useState(false);
  const [isReviewTaskDialogOpen, setIsReviewTaskDialogOpen] = reactExports.useState(false);
  const [isPOSelectOpen, setIsPOSelectOpen] = reactExports.useState(false);
  const [isPOViewOpen, setIsPOViewOpen] = reactExports.useState(false);
  const [isInvoiceUploadOpen, setIsInvoiceUploadOpen] = reactExports.useState(false);
  const [isReportsOpen, setIsReportsOpen] = reactExports.useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = reactExports.useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = reactExports.useState(false);
  const [isProjectAttachmentsOpen, setIsProjectAttachmentsOpen] = reactExports.useState(false);
  const [isImportTasksOpen, setIsImportTasksOpen] = reactExports.useState(false);
  const [isImportReviewOpen, setIsImportReviewOpen] = reactExports.useState(false);
  const [importedTasks, setImportedTasks] = reactExports.useState([]);
  const importPollRef = reactExports.useRef(null);
  const openImportReview = reactExports.useCallback((tasks2) => {
    if (importPollRef.current) {
      clearInterval(importPollRef.current);
      importPollRef.current = null;
    }
    setImportedTasks(tasks2);
    setIsImportReviewOpen(true);
  }, []);
  const startImportPolling = reactExports.useCallback((importId) => {
    if (importPollRef.current) clearInterval(importPollRef.current);
    importPollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/projects/${numericProjectId}/task-import/${importId}`);
        if (res.data?.status === "ready" && Array.isArray(res.data.tasks)) {
          if (res.data.tasks.length > 0) {
            openImportReview(res.data.tasks);
          } else {
            clearInterval(importPollRef.current);
            importPollRef.current = null;
            toast({ title: "Import complete", description: "No tasks were extracted from the document.", variant: "destructive" });
          }
        }
      } catch {
      }
    }, 4e3);
    setTimeout(() => {
      if (importPollRef.current) {
        clearInterval(importPollRef.current);
        importPollRef.current = null;
      }
    }, 10 * 60 * 1e3);
  }, [numericProjectId, openImportReview, toast]);
  const navigate = useNavigate();
  const { open } = useSidebar();
  const { currentUser, activeRole } = useUser();
  const { history, addHistoryEntry } = useHistory(numericProjectId ? String(numericProjectId) : void 0);
  const [isUpdatingStatus, setIsUpdatingStatus] = reactExports.useState(false);
  const [reviewTask, setReviewTask] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [editingStage, setEditingStage] = reactExports.useState(null);
  const [editingTask, setEditingTask] = reactExports.useState(null);
  const [preselectedStageId, setPreselectedStageId] = reactExports.useState(void 0);
  const [view, setView] = reactExports.useState("kanban");
  const [isAddSubtaskDialogOpen, setIsAddSubtaskDialogOpen] = reactExports.useState(false);
  const [parentTaskForSubtask, setParentTaskForSubtask] = reactExports.useState(null);
  const handleAddSubtask = (parentTask) => {
    setParentTaskForSubtask(parentTask);
    setIsAddSubtaskDialogOpen(true);
  };
  const loadData = reactExports.useCallback(async (isBackground = false) => {
    if (!numericProjectId) return;
    const cachedProject = cacheService.get(`project_${numericProjectId}`);
    if (cachedProject && !isBackground) {
      setProject(cachedProject);
      setIsLoading(false);
    }
    if (!isBackground) setIsLoading(true);
    try {
      const [currentProject, departmentsData] = await Promise.all([
        projectService.getById(String(numericProjectId)),
        departmentService.getAll()
      ]);
      if (!currentProject) {
        setProject(null);
        if (!isBackground) setIsLoading(false);
        return;
      }
      if (activeRole === "team-lead" || activeRole === "user" || activeRole === "account-manager") {
        const hasMatchingDepartment = String(currentProject.department?.id) === String(currentUser.department);
        const currentDept = departmentsData.find((d) => String(d.id) === String(currentUser.department));
        const isDigitalDept = currentDept?.name.toLowerCase() === "digital";
        const isDesignProject = currentProject.department?.name.toLowerCase() === "design";
        const hasSpecialPermission = isDigitalDept && isDesignProject;
        const isCollaborator = currentProject.collaborators?.some((c) => String(c.id) === String(currentUser.id));
        if (!hasMatchingDepartment && !hasSpecialPermission && !isCollaborator) {
          setProject(null);
          if (!isBackground) setIsLoading(false);
          return;
        }
      }
      setProject(currentProject);
      setDepartments(departmentsData);
      const [tasksData, usersData] = await Promise.all([
        taskService.getAll({ projectId: String(currentProject.id) }),
        userService.getAll()
      ]);
      const projectTasks = tasksData.filter((t) => String(t.projectId) === String(currentProject.id));
      setTasks(projectTasks);
      setAllTasks(projectTasks);
      setTeamMembers(usersData);
      const taskIdParam = searchParams.get("task");
      if (taskIdParam && projectTasks.length > 0) {
        const foundTask = projectTasks.find((t) => String(t.id) === taskIdParam);
        if (foundTask) {
          if (activeRole === "user") {
            const isAssigned = foundTask.assignee === currentUser.name || foundTask.assignedUsers && foundTask.assignedUsers.some((u) => String(u.id) === String(currentUser.id));
            if (isAssigned) {
              navigate(`/user-project/${currentProject.id}/stage/${foundTask.projectStage}?task=${foundTask.id}`);
            } else {
              toast({
                title: "Access Denied",
                description: "You do not have permission to view this task.",
                variant: "destructive"
              });
            }
          } else {
            setTimeout(() => {
              const taskElement = document.getElementById(`task-${foundTask.id}`);
              if (taskElement) {
                taskElement.scrollIntoView({ behavior: "smooth", block: "center" });
                taskElement.classList.add("ring-2", "ring-primary", "shadow-lg");
                setTimeout(() => {
                  taskElement.classList.remove("ring-2", "ring-primary", "shadow-lg");
                }, 3e3);
              }
            }, 500);
          }
          if (activeRole !== "user" || foundTask.assignee !== currentUser.name) {
            searchParams.delete("task");
            setSearchParams(searchParams);
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load project data.", variant: "destructive" });
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, [numericProjectId, currentUser, searchParams, setSearchParams, navigate, toast]);
  reactExports.useEffect(() => {
    const handleProjectAttachments = (e) => {
      const { projectId: eventProjectId } = e.detail;
      if (String(eventProjectId) === String(numericProjectId)) {
        loadData(true);
      }
    };
    window.addEventListener("aura:project-attachments-uploaded", handleProjectAttachments);
    return () => {
      window.removeEventListener("aura:project-attachments-uploaded", handleProjectAttachments);
    };
  }, [numericProjectId, loadData]);
  reactExports.useEffect(() => {
    loadData();
  }, [numericProjectId, currentUser, loadData]);
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
      const updatedProject = await projectService.update(String(project.id), {
        status: newStatus
      });
      setProject(updatedProject);
      addHistoryEntry({
        action: "UPDATE_PROJECT",
        entityId: String(project.id),
        entityType: "project",
        projectId: String(project.id),
        userId: currentUser?.id || "",
        details: {
          from: project.status,
          to: newStatus
        }
      });
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
  const hasPO = !!project.poDocumentUrl || !!project.poNumber;
  const hasActiveGracePeriod = !!project.gracePeriodExpiresAt && new Date(project.gracePeriodExpiresAt) >= /* @__PURE__ */ new Date();
  const hasActiveProvisionalPO = !!project.provisionalPoNumber && !!project.provisionalPoExpiresAt && new Date(project.provisionalPoExpiresAt) >= /* @__PURE__ */ new Date();
  const isProjectActive = !project.isArchived && project.status !== "completed";
  const isProjectBlocked = project.status === "blocked" || project.status === "on-hold";
  const isPORequired = isProjectActive && !project.isInternalProject && project.isLockedByPo && !hasPO && !hasActiveGracePeriod && !hasActiveProvisionalPO;
  const canCreateTasks = isProjectActive && (project.isInternalProject || !project.isLockedByPo || hasPO || hasActiveGracePeriod || hasActiveProvisionalPO);
  const handleAddTaskToStage = (stageId) => {
    if (!canCreateTasks) {
      if (project.isArchived) {
        toast({ title: "Project Archived", description: "Cannot add tasks to an archived project.", variant: "destructive" });
      } else if (project.status === "completed") {
        toast({ title: "Project Completed", description: "Cannot add tasks to a completed project.", variant: "destructive" });
      } else {
        toast({ title: "PO Required", description: "This project requires a Purchase Order (PO) before tasks can be created. Please upload a PO or request a grace period.", variant: "destructive" });
      }
      return;
    }
    setEditingTask(null);
    setPreselectedStageId(stageId);
    setIsTaskDialogOpen(true);
  };
  const handleTaskUpdate = async (taskId, updates) => {
    if (!currentUser || !project) return;
    const taskToUpdate = tasks.find((t) => t.id === taskId);
    if (!taskToUpdate) return;
    try {
      console.log("[KANBAN] Incoming task update", { taskId, updates });
      if (updates.userStatus === "complete" && !updates.projectStage) {
        const currentStage = project.stages.find((s) => s.id === taskToUpdate.projectStage);
        if (currentStage) {
          let targetStageId;
          if (currentStage.linkedReviewStageId) {
            targetStageId = currentStage.linkedReviewStageId;
          } else {
            const ordered = [...project.stages].sort((a, b) => a.order - b.order);
            const idx = ordered.findIndex((s) => s.id === currentStage.id);
            if (idx >= 0 && idx < ordered.length - 1) targetStageId = ordered[idx + 1].id;
          }
          if (targetStageId) {
            const targetStage = project.stages.find((s) => s.id === targetStageId);
            updates.projectStage = targetStageId;
            if (targetStage?.isReviewStage) {
              updates.previousStage = currentStage.id;
              updates.originalAssignee = taskToUpdate.assignee;
              updates.assignee = taskToUpdate.assignee;
              updates.isInSpecificStage = true;
            }
            if (!targetStage?.isReviewStage) {
              updates.userStatus = "pending";
            }
            console.log("[KANBAN] Auto transition after complete", { from: currentStage.id, to: targetStageId, review: !!targetStage?.isReviewStage });
          }
        }
      }
      if (updates.projectStage && updates.projectStage !== taskToUpdate.projectStage) {
        if (!("assignee" in updates) && !taskToUpdate.isAssigneeLocked) {
          const targetStage = project.stages.find((s) => s.id === updates.projectStage);
          if (targetStage?.mainResponsibleId) {
            const mr = teamMembers.find((m) => m.id === targetStage.mainResponsibleId);
            updates.assignee = mr ? mr.name : "";
          } else updates.assignee = "";
        }
        if (!("userStatus" in updates)) updates.userStatus = "pending";
        const sorted = [...project.stages].sort((a, b) => a.order - b.order);
        const last = sorted[sorted.length - 1];
        const currentTags = taskToUpdate.tags || [];
        if (updates.projectStage === last.id) {
          if (!currentTags.includes("Completed")) updates.tags = [...currentTags, "Completed"];
        } else if (currentTags.includes("Completed")) {
          updates.tags = currentTags.filter((t) => t !== "Completed");
        }
        addHistoryEntry({ action: "UPDATE_TASK_STATUS", entityId: taskId, entityType: "task", projectId: String(project.id), userId: currentUser.id, details: { from: taskToUpdate.projectStage, to: updates.projectStage } });
      }
      if (updates.assignee && updates.assignee !== taskToUpdate.assignee) {
        addHistoryEntry({ action: "UPDATE_TASK_ASSIGNEE", entityId: taskId, entityType: "task", projectId: String(project.id), userId: currentUser.id, details: { from: taskToUpdate.assignee, to: updates.assignee } });
      }
      const assigneeId = updates.assignee ? teamMembers.find((m) => m.name === updates.assignee)?.id : void 0;
      const projectStageId = updates.projectStage ? parseInt(String(updates.projectStage), 10) : void 0;
      const { startStageId: startStageIdStr, ...cleanUpdates } = updates;
      const startStageId = startStageIdStr ? parseInt(String(startStageIdStr), 10) : void 0;
      const savedTask = await taskService.update(taskId, {
        ...cleanUpdates,
        assigneeId: assigneeId ? parseInt(String(assigneeId), 10) : void 0,
        projectStageId,
        startStageId
      });
      console.log("[KANBAN] Applied update", { taskId, assigneeId, projectStageId });
      const updateTaskInList = (list) => {
        return list.map((t) => {
          if (t.id === taskId) return savedTask;
          if (t.subtasks && t.subtasks.length > 0) {
            return { ...t, subtasks: updateTaskInList(t.subtasks) };
          }
          return t;
        });
      };
      setTasks((prev) => updateTaskInList(prev));
      setAllTasks((prev) => updateTaskInList(prev));
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to update task.", variant: "destructive" });
    }
  };
  const handleSaveTask = async (task, pendingFiles, pendingLinks) => {
    if (!currentUser || !project) return;
    if (!editingTask && !canCreateTasks) {
      toast({ title: "PO Required", description: "This project requires a Purchase Order (PO) before tasks can be created.", variant: "destructive" });
      return;
    }
    try {
      const assigneeId = task.assigneeId ? parseInt(task.assigneeId) : void 0;
      const assigneeIds = task.assigneeIds?.map((id) => parseInt(id)) || [];
      const projectStageId = task.projectStage ? parseInt(task.projectStage) : void 0;
      const { project: projectName, assignee, projectStage, startStageId: startStageIdStr, ...cleanTask } = task;
      const startStageId = startStageIdStr ? parseInt(startStageIdStr, 10) : void 0;
      const taskPayload = {
        ...cleanTask,
        projectId: project.id,
        assigneeId,
        assigneeIds,
        projectStageId,
        startStageId
      };
      if (editingTask) {
        const updatedTask = await taskService.update(editingTask.id, taskPayload);
        const updateTaskInList = (list) => {
          return list.map((t) => {
            if (t.id === editingTask.id) return updatedTask;
            if (t.subtasks && t.subtasks.length > 0) {
              return { ...t, subtasks: updateTaskInList(t.subtasks) };
            }
            return t;
          });
        };
        setTasks((prev) => updateTaskInList(prev));
        setAllTasks((prev) => updateTaskInList(prev));
        addHistoryEntry({ action: "UPDATE_TASK", entityId: editingTask.id, entityType: "task", projectId: String(project.id), userId: currentUser.id, details: { from: editingTask, to: { ...editingTask, ...task } } });
        toast({ title: "Task updated", description: "Task updated successfully." });
      } else {
        const newTask = await taskService.create(taskPayload);
        if (pendingFiles && pendingFiles.length > 0) {
          try {
            const uploadedAttachments = await attachmentService.uploadFiles(newTask.id, pendingFiles);
            newTask.attachments = [...newTask.attachments || [], ...uploadedAttachments];
          } catch (uploadError) {
            console.error("Failed to upload attachments:", uploadError);
            toast({ title: "Warning", description: "Task created but some attachments failed to upload.", variant: "destructive" });
          }
        }
        if (pendingLinks && pendingLinks.length > 0) {
          try {
            for (const link of pendingLinks) {
              const uploadedLink = await attachmentService.addLink(newTask.id, link.name, link.url);
              newTask.attachments = [...newTask.attachments || [], uploadedLink];
            }
          } catch (linkError) {
            console.error("Failed to add links:", linkError);
            toast({ title: "Warning", description: "Task created but some links failed to add.", variant: "destructive" });
          }
        }
        setTasks([...tasks, newTask]);
        setAllTasks([...allTasks, newTask]);
        addHistoryEntry({ action: "CREATE_TASK", entityId: newTask.id, entityType: "task", projectId: String(project.id), userId: currentUser.id, details: { title: newTask.title } });
        toast({ title: "Task created", description: "Task created successfully." });
        setIsTaskDialogOpen(false);
        setEditingTask(null);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to save task.", variant: "destructive" });
    }
  };
  const [taskToDelete, setTaskToDelete] = reactExports.useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = reactExports.useState(false);
  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };
  const handleTaskDelete = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setIsDeleteDialogOpen(true);
    }
  };
  const confirmDeleteTask = async () => {
    if (!taskToDelete || !project || !currentUser) return;
    try {
      addHistoryEntry({ action: "DELETE_TASK", entityId: taskToDelete.id, entityType: "task", projectId: String(project.id), userId: currentUser.id, details: { title: taskToDelete.title } });
      await taskService.delete(taskToDelete.id);
      setTasks(tasks.filter((t) => t.id !== taskToDelete.id));
      toast({ title: "Task deleted", description: "Task deleted successfully." });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };
  const handleAddStage = () => {
    setEditingStage(null);
    setIsStageDialogOpen(true);
  };
  const handleEditStage = (stage) => {
    setEditingStage(stage);
    setIsStageDialogOpen(true);
  };
  const handleDeleteStage = async (stageId) => {
    if (!project || !currentUser) return;
    const stageToDelete = project.stages.find((s) => s.id === stageId);
    try {
      await stageService.delete(stageId);
      if (stageToDelete) {
        addHistoryEntry({
          action: "DELETE_STAGE",
          entityId: stageId,
          entityType: "stage",
          projectId: String(project.id),
          userId: currentUser.id,
          details: { title: stageToDelete.title }
        });
      }
      const updatedStages = project.stages.filter((s) => s.id !== stageId);
      setProject({ ...project, stages: updatedStages });
      toast({ title: "Stage deleted", description: "Stage deleted successfully." });
    } catch (error) {
      console.error("Error deleting stage:", error);
      const msg = error.response?.data?.message || error.message || "Failed to delete stage.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };
  const handleSaveStage = async (stage) => {
    if (!project || !currentUser) return;
    try {
      if (editingStage) {
        const updatedStage = await stageService.update(editingStage.id, stage);
        const updatedStages = project.stages.map((s) => s.id === editingStage.id ? { ...s, ...updatedStage } : s);
        setProject({ ...project, stages: updatedStages });
        addHistoryEntry({ action: "UPDATE_STAGE", entityId: editingStage.id, entityType: "stage", projectId: String(project.id), userId: currentUser.id, details: { from: editingStage, to: { ...editingStage, ...stage } } });
        toast({ title: "Stage updated", description: "Stage updated successfully." });
      } else {
        const nonArchiveStages = project.stages.filter((s) => s.title.toLowerCase().trim() !== "archive");
        const maxNonArchiveOrder = nonArchiveStages.length > 0 ? Math.max(...nonArchiveStages.map((s) => s.order)) : 1;
        const newOrder = maxNonArchiveOrder + 1;
        const newStage = await stageService.create({
          ...stage,
          order: newOrder,
          project_id: project.id
        });
        const updatedStages = [...project.stages, newStage];
        setProject({ ...project, stages: updatedStages });
        addHistoryEntry({ action: "CREATE_STAGE", entityId: newStage.id, entityType: "stage", projectId: String(project.id), userId: currentUser.id, details: { title: newStage.title } });
        toast({ title: "Stage created", description: "Stage created successfully." });
      }
      setIsStageDialogOpen(false);
      setEditingStage(null);
    } catch (error) {
      console.error("Error saving stage:", error);
      toast({ title: "Error", description: "Failed to save stage.", variant: "destructive" });
    }
  };
  const handleReorderStages = async (newOrderedStages) => {
    if (!project) return;
    const updatedStages = newOrderedStages.map((s, index) => ({
      ...s,
      order: index
    }));
    setProject({ ...project, stages: updatedStages });
    try {
      await Promise.all(updatedStages.map(
        (stage) => api.put(`/stages/${stage.id}`, { order: stage.order })
      ));
      toast({ title: "Success", description: "Stage order updated." });
    } catch (e) {
      console.error("Failed to reorder stages", e);
      toast({ title: "Error", description: "Failed to save stage order.", variant: "destructive" });
    }
  };
  const handleApproveTask = (taskId, targetStageId, comment) => {
    if (!project || !currentUser) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    handleTaskUpdate(taskId, { projectStage: targetStageId, isInSpecificStage: false, previousStage: void 0, originalAssignee: void 0, revisionComment: void 0 });
    if (comment) addHistoryEntry({ action: "UPDATE_TASK_STATUS", entityId: taskId, entityType: "task", projectId: String(project.id), userId: currentUser.id, details: { action: "approved", comment, targetStage: project.stages.find((s) => s.id === targetStageId)?.title || targetStageId } });
    toast({ title: "Task approved", description: `Task moved to ${project.stages.find((s) => s.id === targetStageId)?.title || "selected stage"}.` });
    setIsReviewTaskDialogOpen(false);
    setReviewTask(null);
  };
  const handleRequestRevision = (taskId, targetStageId, comment) => {
    if (!project || !currentUser) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const originalAssignee = task.originalAssignee || task.assignee;
    if (!originalAssignee) {
      toast({ title: "Error", description: "Could not find the task assignee.", variant: "destructive" });
      return;
    }
    const newRevision = { id: Date.now().toString(), comment, requestedBy: currentUser.name, requestedAt: (/* @__PURE__ */ new Date()).toISOString() };
    const updatedRevisionHistory = [...task.revisionHistory || [], newRevision];
    const updatedTags = task.tags ? [...task.tags] : [];
    if (!updatedTags.includes("Redo")) updatedTags.push("Redo");
    handleTaskUpdate(taskId, { projectStage: targetStageId, assignee: originalAssignee, userStatus: "pending", isInSpecificStage: false, revisionComment: comment, revisionHistory: updatedRevisionHistory, tags: updatedTags, previousStage: void 0, originalAssignee: void 0 });
    toast({ title: "Revision requested", description: `Task sent to ${project.stages.find((s) => s.id === targetStageId)?.title || "selected stage"} for ${originalAssignee} with Redo tag.` });
    setIsReviewTaskDialogOpen(false);
    setReviewTask(null);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 border-b bg-background z-10 px-6 py-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row flex-wrap items-start justify-between gap-4 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-64" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-96" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-24" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-32" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-28" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-32" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full overflow-auto p-6 pb-10 bg-muted/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full gap-6", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 w-80 flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full rounded-lg" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [1, 2, 3].map((j) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg border bg-card space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-20" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4 rounded-full" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-6 rounded-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-16" })
          ] })
        ] }, j)) })
      ] }, i)) }) }) })
    ] });
  }
  if (!project) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-screen", children: "Project not found" });
  const handleSaveSubtask = async (subtaskData) => {
    if (!project || !parentTaskForSubtask || !currentUser) return;
    if (!canCreateTasks) {
      toast({ title: "PO Required", description: "This project requires a Purchase Order (PO) before tasks can be created.", variant: "destructive" });
      return;
    }
    try {
      const assigneeId = subtaskData.assigneeId ? subtaskData.assigneeId : subtaskData.assignee ? teamMembers.find((m) => m.name === subtaskData.assignee)?.id : void 0;
      const newTask = await taskService.create({
        title: subtaskData.title,
        description: subtaskData.description,
        projectId: project.id,
        assigneeId: assigneeId ? parseInt(assigneeId) : void 0,
        dueDate: subtaskData.dueDate,
        userStatus: subtaskData.userStatus,
        projectStageId: parentTaskForSubtask.projectStage ? parseInt(parentTaskForSubtask.projectStage) : void 0,
        priority: subtaskData.priority,
        parentId: parentTaskForSubtask.id,
        startDate: subtaskData.startDate,
        tags: subtaskData.tags
      });
      if (subtaskData.pendingFiles && subtaskData.pendingFiles.length > 0) {
        await attachmentService.uploadFiles(newTask.id, subtaskData.pendingFiles);
      }
      if (subtaskData.pendingLinks && subtaskData.pendingLinks.length > 0) {
        for (const link of subtaskData.pendingLinks) {
          await attachmentService.addLink(newTask.id, link.name, link.url);
        }
      }
      toast({ title: "Subtask added", description: "Subtask created successfully." });
      const tasksData = await taskService.getAll({ projectId: String(project.id) });
      setTasks(tasksData.filter((t) => t.projectId === project.id));
    } catch (error) {
      console.error("Failed to add subtask", error);
      toast({ title: "Error", description: "Failed to create subtask.", variant: "destructive" });
    }
  };
  const sortedStages = [...project.stages].sort((a, b) => {
    const getPriority = (s) => {
      const t = s.title.toLowerCase().trim();
      if (t === "suggested" || t === "suggested task") return 0;
      if (t === "pending") return 1;
      if (t === "completed" || t === "complete") return 998;
      if (t === "archive") return 999;
      return 10;
    };
    const pA = getPriority(a);
    const pB = getPriority(b);
    if (pA !== pB) return pA - pB;
    return a.order - b.order;
  });
  const topLevelTasks = tasks.filter((t) => !t.parentId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: `flex-shrink-0 border-b bg-background z-10 px-6 py-5 shadow-sm transition-[padding] duration-200 ${open ? "pr-12" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row flex-wrap items-start justify-between gap-4 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold flex items-center gap-2", children: [
            (project.group?.name || project.department?.name) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground/60 font-medium tracking-tight", children: [
              project.group?.name || project.department?.name,
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 opacity-40", children: "/" })
            ] }),
            project.name,
            project.status === "on-hold" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-[10px] font-bold uppercase tracking-wider bg-orange-500 hover:bg-orange-600 border-none px-2 h-5", children: "Blocked" }),
            project.isInternalProject ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Badge,
              {
                variant: "outline",
                className: "text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border-blue-200 px-2 h-5 flex items-center gap-1",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3 w-3" }),
                  " Internal Project"
                ]
              }
            ) : project.isLockedByPo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", className: "text-[10px] font-bold uppercase tracking-wider bg-red-500 hover:bg-red-600 border-none px-2 h-5 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
                " Awaiting PO"
              ] }),
              (activeRole === "admin" || activeRole === "hr") && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  className: "h-5 text-[10px] px-2 py-0 border-red-500 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950",
                  onClick: () => setIsPOSelectOpen(true),
                  children: "Select PO"
                }
              )
            ] }) : project.poDocumentUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "h-5 text-[10px] px-2 py-0 border-green-600 text-green-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950",
                onClick: () => setIsPOViewOpen(true),
                children: "View PO"
              }
            ) }) : null,
            project.isArchived && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs font-normal", children: "Archived" }),
            (activeRole === "admin" || activeRole === "team-lead" || activeRole === "hr") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 ml-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                disabled: isUpdatingStatus,
                value: project.status || "active",
                onValueChange: handleStatusChange,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 w-[120px] text-[10px] uppercase font-bold tracking-tight bg-muted/30 border-muted-foreground/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Status" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "active", className: "text-[10px] uppercase font-bold", children: "Active" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "on-hold", className: "text-[10px] uppercase font-bold", children: "On Hold" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "blocked", className: "text-[10px] uppercase font-bold", children: "Blocked" }),
                    (activeRole === "admin" || activeRole === "hr") && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "completed", className: "text-[10px] uppercase font-bold", children: "Completed" })
                  ] })
                ]
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mt-1 text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "prose prose-sm dark:prose-invert max-w-none line-clamp-1",
                dangerouslySetInnerHTML: {
                  __html: (() => {
                    const txt = document.createElement("textarea");
                    let val = project.description || "";
                    let lastVal = "";
                    let limit = 0;
                    while (val !== lastVal && limit < 5) {
                      lastVal = val;
                      txt.innerHTML = val;
                      val = txt.value;
                      limit++;
                    }
                    return val;
                  })()
                }
              }
            ),
            project.deadline && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
              "Deadline: ",
              new Date(project.deadline).toLocaleDateString()
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: (activeRole === "admin" || activeRole === "team-lead" || activeRole === "account-manager" || activeRole === "user") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "rounded-xl border-muted-foreground/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4 mr-2" }),
              " More Options"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-56 rounded-xl p-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => navigate(`/project/${project.id}/overview`), className: "rounded-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "mr-2 h-4 w-4 text-muted-foreground" }),
                " Project Overview"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setIsReportsOpen(true), className: "rounded-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mr-2 h-4 w-4 text-indigo-500" }),
                " Reports"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setIsFinanceOpen(true), className: "rounded-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "mr-2 h-4 w-4 text-green-500" }),
                " Finance & Expenses"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setIsProjectAttachmentsOpen(true), className: "rounded-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "mr-2 h-4 w-4 text-primary" }),
                " Project Attachments"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setIsAttachmentsOpen(true), className: "rounded-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "mr-2 h-4 w-4 text-orange-500" }),
                " Task Attachments"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border my-1" }),
              (activeRole === "admin" || activeRole === "team-lead" || activeRole === "account-manager") && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setIsHistoryDialogOpen(true), className: "rounded-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "mr-2 h-4 w-4 text-muted-foreground" }),
                " View History"
              ] }),
              !project.isArchived && project.status !== "on-hold" && (activeRole === "admin" || activeRole === "team-lead") && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setIsStageManagementOpen(true), className: "rounded-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "mr-2 h-4 w-4 text-muted-foreground" }),
                " Manage Stages"
              ] })
            ] })
          ] }),
          !project.isArchived && project.status !== "on-hold" && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: canCreateTasks ? activeRole === "admin" || activeRole === "team-lead" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center ml-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                className: "rounded-xl rounded-r-none border-r-0 shadow-lg shadow-primary/20",
                onClick: () => {
                  setEditingTask(null);
                  setIsTaskDialogOpen(true);
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
                  " Add Task"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "rounded-xl rounded-l-none px-2 border-l border-primary-foreground/20 shadow-lg shadow-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuContent, { align: "end", className: "rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setIsImportTasksOpen(true), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "mr-2 h-4 w-4 text-purple-500" }),
                "Import Tasks from File"
              ] }) })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              className: "rounded-xl shadow-lg shadow-primary/20",
              onClick: () => {
                setEditingTask(null);
                setIsTaskDialogOpen(true);
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
                " Add Task"
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", disabled: true, className: "opacity-80 rounded-xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "mr-2 h-4 w-4" }),
            project.isArchived ? "Archived" : project.status === "completed" ? "Completed" : "PO Required"
          ] }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        ToggleGroup,
        {
          type: "single",
          value: view,
          onValueChange: (v) => v && setView(v),
          className: "bg-muted/50 p-1 rounded-xl border border-border/10",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItem, { value: "kanban", "aria-label": "Kanban view", className: "rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItem, { value: "list", "aria-label": "List view", className: "rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-4 w-4" }) })
          ]
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 flex flex-col overflow-hidden relative", children: [
      isProjectBlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-[1px] pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-destructive/10 text-destructive border border-destructive/20 px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300 pointer-events-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-8 w-8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold uppercase tracking-wider", children: "Project Blocked" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-80", children: "This project is currently on hold or blocked." })
        ] })
      ] }) }),
      isPORequired && !isProjectBlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-[1px] pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-orange-500/10 text-orange-600 border border-orange-500/20 px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300 pointer-events-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold uppercase tracking-wider", children: "PO Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-80 mb-3", children: "This project requires a Purchase Order to continue." }),
          (activeRole === "admin" || activeRole === "hr") && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "border-orange-500 text-orange-600 hover:bg-orange-50",
              onClick: () => setIsPOSelectOpen(true),
              children: "Select PO"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
        "flex-1 overflow-auto pl-6 pr-12 pt-6 pb-12 bg-muted/5 transition-all duration-500 relative",
        (isProjectBlocked || isPORequired) && "grayscale opacity-50 pointer-events-none select-none"
      ), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full", children: view === "kanban" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        KanbanBoard,
        {
          tasks: topLevelTasks,
          stages: sortedStages,
          onTaskUpdate: !project.isArchived && !isProjectBlocked && !isPORequired ? handleTaskUpdate : void 0,
          onTaskEdit: !project.isArchived && !isProjectBlocked && !isPORequired ? handleTaskEdit : void 0,
          onTaskDelete: !project.isArchived && !isProjectBlocked && !isPORequired ? handleTaskDelete : void 0,
          useProjectStages: true,
          canManageTasks: activeRole !== "user" && !project.isArchived && !isProjectBlocked,
          canDragTasks: activeRole !== "user" && activeRole !== "account-manager" && !project.isArchived && !isProjectBlocked,
          disableColumnScroll: false,
          disableBacklogRenaming: false,
          onTaskReview: !project.isArchived && !isProjectBlocked && !isPORequired ? (task) => {
            setReviewTask(task);
            setIsReviewTaskDialogOpen(true);
          } : void 0,
          onAddTaskToStage: !project.isArchived && !isProjectBlocked && canCreateTasks ? handleAddTaskToStage : void 0,
          projectId: String(project.id),
          onAddSubtask: !project.isArchived && !isProjectBlocked && canCreateTasks ? handleAddSubtask : void 0,
          teamMembers,
          departments,
          allTasks,
          onRefresh: loadData
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        TaskListView,
        {
          tasks: topLevelTasks,
          stages: sortedStages,
          onTaskEdit: !project.isArchived && !isProjectBlocked ? handleTaskEdit : void 0,
          onTaskDelete: !project.isArchived && !isProjectBlocked ? handleTaskDelete : void 0,
          onTaskUpdate: !project.isArchived && !isProjectBlocked ? handleTaskUpdate : void 0,
          teamMembers,
          canManage: activeRole !== "user" && !project.isArchived && !isProjectBlocked,
          onTaskReview: !project.isArchived && !isProjectBlocked ? (task) => {
            setReviewTask(task);
            setIsReviewTaskDialogOpen(true);
          } : void 0,
          showReviewButton: (activeRole === "admin" || activeRole === "team-lead") && !project.isArchived && !isProjectBlocked
        }
      ) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      HistoryDialog,
      {
        open: isHistoryDialogOpen,
        onOpenChange: setIsHistoryDialogOpen,
        history,
        teamMembers,
        stages: sortedStages
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TaskDialog,
      {
        open: isTaskDialogOpen,
        onOpenChange: (open2) => {
          setIsTaskDialogOpen(open2);
          if (!open2) {
            setPreselectedStageId(void 0);
            setEditingTask(null);
          }
        },
        onSave: handleSaveTask,
        editTask: editingTask,
        availableStatuses: sortedStages,
        useProjectStages: true,
        availableProjects: [project.name],
        allProjects: [project],
        teamMembers,
        departments,
        allTasks,
        initialStageId: preselectedStageId,
        isStageLocked: !!preselectedStageId,
        currentUser,
        fixedDepartmentId: project.department?.id
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StageManagement,
      {
        open: isStageManagementOpen,
        onOpenChange: setIsStageManagementOpen,
        stages: sortedStages,
        onAddStage: handleAddStage,
        onEditStage: handleEditStage,
        onDeleteStage: handleDeleteStage,
        onReorderStages: handleReorderStages
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isReportsOpen, onOpenChange: setIsReportsOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "p-6 pb-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Project Reports - ",
          project.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Submit and track reports for this project." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto p-6 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectReportsTab, { project }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StageDialog,
      {
        open: isStageDialogOpen,
        onOpenChange: setIsStageDialogOpen,
        onSave: handleSaveStage,
        existingStages: sortedStages,
        editStage: editingStage,
        teamMembers
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReviewTaskDialog,
      {
        open: isReviewTaskDialogOpen,
        onOpenChange: setIsReviewTaskDialogOpen,
        task: reviewTask,
        stages: sortedStages,
        onApprove: handleApproveTask,
        onRequestRevision: handleRequestRevision
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AddSubtaskDialog,
      {
        open: isAddSubtaskDialogOpen,
        onOpenChange: setIsAddSubtaskDialogOpen,
        onSave: handleSaveSubtask,
        teamMembers,
        parentTaskTitle: parentTaskForSubtask?.title || "Task",
        departments,
        currentUser
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Are you sure?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'This action cannot be undone. This will permanently delete the task "',
          taskToDelete?.title,
          '" and remove it from our servers.'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { onClick: () => setIsDeleteDialogOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: confirmDeleteTask, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      POSelectDialog,
      {
        open: isPOSelectOpen,
        onOpenChange: setIsPOSelectOpen,
        project,
        onSuccess: (updatedProject) => setProject(updatedProject)
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isFinanceOpen, onOpenChange: setIsFinanceOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "p-6 pb-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Project Finance - ",
          project.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Manage budget and expenses for this project." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto p-6 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        ProjectFinanceTab,
        {
          project,
          onBudgetUpdate: (budgetAllocated) => setProject((prev) => ({ ...prev, budget_allocated: budgetAllocated ?? void 0 }))
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isAttachmentsOpen, onOpenChange: setIsAttachmentsOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "p-6 pb-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Task Attachments - ",
          project.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "View and download all attachments associated with this project's tasks." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto p-6 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProjectAttachmentsTab, { project, tasks }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProjectLevelAttachmentsDialog,
      {
        open: isProjectAttachmentsOpen,
        onOpenChange: setIsProjectAttachmentsOpen,
        project,
        onProjectUpdate: (updatedProject) => loadData(true)
      }
    ),
    numericProjectId && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ImportTasksDialog,
      {
        open: isImportTasksOpen,
        onOpenChange: setIsImportTasksOpen,
        projectId: numericProjectId,
        projectName: project.name,
        onSubmitted: startImportPolling
      }
    ),
    numericProjectId && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ImportTasksReviewDialog,
      {
        open: isImportReviewOpen,
        onOpenChange: setIsImportReviewOpen,
        tasks: importedTasks,
        projectId: numericProjectId,
        stages: sortedStages,
        teamMembers,
        departments,
        onTasksCreated: () => loadData(true)
      }
    )
  ] });
}
export {
  ProjectKanbanFixed as default
};
