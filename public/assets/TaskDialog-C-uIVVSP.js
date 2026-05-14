import { b as api, F as useToast, v as useUser, l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, aq as Lock, q as Check, z as cn, ai as Separator, Q as Label, I as Input, C as CircleAlert, Y as Badge, X, P as Plus, B as Button, af as Upload, U as DialogFooter, s as ChevronRight, L as LoaderCircle } from "./index-C4ZP3eFM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { S as SearchableSelect } from "./searchable-select-BMuxGeaS.js";
import { C as Checkbox } from "./checkbox-qHm_4cmk.js";
import { a as attachmentService } from "./attachmentService-B1K5TSm1.js";
import { R as RichTextEditor } from "./rich-text-editor-CK9AOqrB.js";
import { L as Link } from "./link-CjUUS0B-.js";
import { C as ChevronLeft } from "./chevron-left-zAeTltYW.js";
const tagService = {
  getAll: async (departmentId) => {
    const params = departmentId ? { department_id: departmentId } : {};
    const response = await api.get("/tags", { params });
    return response.data;
  },
  create: async (name, departmentId) => {
    const response = await api.post("/tags", {
      name,
      department_id: departmentId
    });
    return response.data;
  }
};
function TaskDialog({
  open,
  onOpenChange,
  onSave,
  editTask,
  availableProjects,
  availableStatuses,
  useProjectStages = false,
  teamMembers,
  departments,
  allTasks = [],
  allProjects,
  initialStageId,
  isStageLocked = false,
  currentUser,
  fixedDepartmentId,
  disableBacklogRenaming = false
}) {
  const { toast } = useToast();
  const { activeRole } = useUser();
  const fileInputRef = reactExports.useRef(null);
  const prevEditTaskIdRef = reactExports.useRef(void 0);
  const prevOpenRef = reactExports.useRef(false);
  const projects = availableProjects || [];
  const isTaskLocked = editTask?.isLocked === true;
  const [formData, setFormData] = reactExports.useState({
    title: "",
    description: "",
    project: "",
    assignee: "",
    // Legacy/Display name of primary assignee
    assigneeIds: [],
    // IDs of all assignees
    dueDate: "",
    dueTime: "",
    userStatus: "pending",
    projectStage: "",
    startStageId: "",
    // Stage to move to when start time arrives
    priority: "medium",
    startDate: "",
    startTime: "",
    isAssigneeLocked: false
  });
  const [tags, setTags] = reactExports.useState([]);
  const [newTag, setNewTag] = reactExports.useState("");
  const [noStartDate, setNoStartDate] = reactExports.useState(false);
  const [noEndDate, setNoEndDate] = reactExports.useState(false);
  const [attachments, setAttachments] = reactExports.useState([]);
  const [pendingFiles, setPendingFiles] = reactExports.useState([]);
  const [pendingLinks, setPendingLinks] = reactExports.useState([]);
  const [newLinkName, setNewLinkName] = reactExports.useState("");
  const [newLinkUrl, setNewLinkUrl] = reactExports.useState("");
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const [availableTags, setAvailableTags] = reactExports.useState([]);
  const [tagDepartmentId, setTagDepartmentId] = reactExports.useState("");
  const [currentStep, setCurrentStep] = reactExports.useState(1);
  const [errors, setErrors] = reactExports.useState({});
  const getTaskCountForAssignee = (assigneeName) => {
    return allTasks.filter((task) => task.assignee === assigneeName).length;
  };
  reactExports.useEffect(() => {
    if (open) {
      if (fixedDepartmentId) {
        setTagDepartmentId(fixedDepartmentId);
      } else if (currentUser) {
        if (activeRole === "team-lead" || activeRole === "account-manager") {
          setTagDepartmentId(currentUser.department);
        } else if (activeRole === "admin") {
          setTagDepartmentId(currentUser.department);
        } else {
          setTagDepartmentId(currentUser.department);
        }
      }
    }
  }, [open, currentUser, fixedDepartmentId]);
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
  reactExports.useEffect(() => {
    const openedNow = open && !prevOpenRef.current;
    const taskIdChanged = editTask?.id !== prevEditTaskIdRef.current;
    prevOpenRef.current = open;
    prevEditTaskIdRef.current = editTask?.id;
    if (!openedNow && !taskIdChanged) return;
    if (editTask) {
      let ids = [];
      if (editTask.assignedUsers && editTask.assignedUsers.length > 0) {
        ids = editTask.assignedUsers.map((u) => u.id);
      } else if (editTask.assignee) {
        const user = teamMembers.find((u) => u.name === editTask.assignee);
        if (user) ids = [user.id];
      }
      setFormData({
        title: editTask.title,
        description: editTask.description,
        project: editTask.project,
        assignee: editTask.assignee,
        assigneeIds: ids,
        dueDate: editTask.dueDate.split("T")[0],
        dueTime: editTask.dueDate.split("T")[1]?.substring(0, 5) || "",
        userStatus: editTask.userStatus,
        projectStage: editTask.projectStage || "",
        startStageId: editTask.startStageId || "",
        priority: editTask.priority,
        startDate: editTask.startDate ? editTask.startDate.split("T")[0] : "",
        startTime: editTask.startDate ? editTask.startDate.split("T")[1]?.substring(0, 5) || "" : "",
        isAssigneeLocked: editTask.isAssigneeLocked || false
      });
      setTags(editTask.tags || []);
      setAttachments(editTask.attachments || []);
      setPendingFiles([]);
      setPendingLinks([]);
      setNoStartDate(!editTask.startDate);
      setNoEndDate(!editTask.dueDate);
    } else {
      let defaultStage = "";
      if (initialStageId) {
        defaultStage = initialStageId;
      } else if (useProjectStages && availableStatuses.length > 0) {
        const pendingStage = availableStatuses.find((s) => s.title === "Pending");
        if (pendingStage) {
          defaultStage = pendingStage.id;
        } else {
          const validStage = availableStatuses.find((s) => s.title !== "Specific Stage" && s.title !== "Suggested Task");
          defaultStage = (validStage || availableStatuses[0]).id;
        }
      }
      const slTime = (/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Colombo" });
      const today = new Date(slTime);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const hours = String(today.getHours()).padStart(2, "0");
      const minutes = String(today.getMinutes()).padStart(2, "0");
      const slTimeString = `${hours}:${minutes}`;
      setFormData({
        title: "",
        description: "",
        project: projects.length === 1 ? projects[0] : "",
        assignee: "",
        assigneeIds: [],
        dueDate: tomorrow.toISOString().split("T")[0],
        dueTime: "17:00",
        userStatus: "pending",
        projectStage: defaultStage,
        startStageId: "",
        priority: "medium",
        startDate: today.toISOString().split("T")[0],
        startTime: slTimeString,
        isAssigneeLocked: false
      });
      setTags([]);
      setAttachments([]);
      setPendingFiles([]);
      setPendingLinks([]);
      setNewTag("");
      setNewLinkName("");
      setNewLinkUrl("");
      setNoStartDate(false);
      setNoEndDate(false);
    }
  }, [editTask?.id, open]);
  reactExports.useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setErrors({});
    }
  }, [open]);
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.project) newErrors.project = "Project is required";
    if (formData.assigneeIds.length === 0) newErrors.assignee = "Assignee is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validateStep2 = () => {
    const newErrors = {};
    if (!noEndDate && !formData.dueDate) newErrors.dueDate = "End date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  const allowsTaskCreation = (projectName) => {
    if (!allProjects) return true;
    const project = allProjects.find((p) => p.name === projectName);
    if (!project) return true;
    const hasPO = !!project.poDocumentUrl || !!project.poNumber;
    const hasActiveGracePeriod = !!project.gracePeriodExpiresAt && new Date(project.gracePeriodExpiresAt) >= /* @__PURE__ */ new Date();
    const hasActiveProvisionalPO = !!project.provisionalPoNumber && !!project.provisionalPoExpiresAt && new Date(project.provisionalPoExpiresAt) >= /* @__PURE__ */ new Date();
    return project.isInternalProject || !project.isLockedByPo || hasPO || hasActiveGracePeriod || hasActiveProvisionalPO;
  };
  const getAssignmentRestriction = () => {
    if (!allProjects || !formData.project) return null;
    const project = allProjects.find((p) => p.name === formData.project);
    if (project) {
      if (project.status === "on-hold") {
        return "Project is paused. Assignments are restricted.";
      }
    }
    return null;
  };
  const assignmentRestriction = getAssignmentRestriction();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (validateStep1()) {
        if (!editTask && !allowsTaskCreation(formData.project)) {
          toast({
            title: "PO Required",
            description: "This project requires a Purchase Order (PO) before tasks can be created.",
            variant: "destructive"
          });
          return;
        }
        nextStep();
      }
      return;
    }
    if (currentStep === 2) {
      if (validateStep2()) nextStep();
      return;
    }
    if (currentStep !== 3) return;
    const dueDateTime = noEndDate ? null : formData.dueDate ? `${formData.dueDate}T${formData.dueTime || "00:00"}:00` : (/* @__PURE__ */ new Date()).toISOString();
    const startDateTime = noStartDate ? null : formData.startDate ? `${formData.startDate}T${formData.startTime || "00:00"}:00` : void 0;
    const effectivePendingLinks = [...pendingLinks];
    if (newLinkName && newLinkUrl) {
      effectivePendingLinks.push({ name: newLinkName, url: newLinkUrl });
    }
    let primaryAssigneeName = formData.assignee;
    let primaryAssigneeId = void 0;
    if (formData.assigneeIds.length > 0) {
      const firstUserId = formData.assigneeIds[0];
      const user = teamMembers.find((u) => u.id === firstUserId);
      if (user) {
        primaryAssigneeName = user.name;
        primaryAssigneeId = user.id;
      }
    }
    if (editTask && (pendingFiles.length > 0 || effectivePendingLinks.length > 0)) {
      setIsUploading(true);
      try {
        const uploadedAttachments = [...attachments];
        for (const pendingFile of pendingFiles) {
          const uploaded = await attachmentService.uploadFile(editTask.id, pendingFile.file);
          uploadedAttachments.push(uploaded);
        }
        for (const link of effectivePendingLinks) {
          const uploaded = await attachmentService.addLink(editTask.id, link.name, link.url);
          uploadedAttachments.push(uploaded);
        }
        onSave({
          ...formData,
          assignee: primaryAssigneeName,
          assigneeId: primaryAssigneeId,
          assigneeIds: formData.assigneeIds,
          dueDate: dueDateTime,
          projectStage: formData.projectStage || void 0,
          userStatus: formData.userStatus,
          tags: tags.length > 0 ? tags : void 0,
          startDate: startDateTime,
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : void 0,
          isAssigneeLocked: formData.isAssigneeLocked
        });
        toast({
          title: "Files uploaded",
          description: `${pendingFiles.length + effectivePendingLinks.length} attachment(s) uploaded successfully.`
        });
        setNewLinkName("");
        setNewLinkUrl("");
      } catch (error) {
        console.error("Failed to upload attachments:", error);
        toast({
          title: "Upload failed",
          description: "Some attachments could not be uploaded. Please try again.",
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else {
      const filesToUpload = pendingFiles.map((pf) => pf.file);
      onSave(
        {
          ...formData,
          assignee: primaryAssigneeName,
          assigneeId: primaryAssigneeId,
          assigneeIds: formData.assigneeIds,
          dueDate: dueDateTime,
          projectStage: formData.projectStage || void 0,
          userStatus: formData.userStatus,
          tags: tags.length > 0 ? tags : void 0,
          startDate: startDateTime,
          attachments: attachments.length > 0 ? attachments : void 0,
          isAssigneeLocked: formData.isAssigneeLocked
        },
        filesToUpload.length > 0 ? filesToUpload : void 0,
        effectivePendingLinks.length > 0 ? effectivePendingLinks : void 0
      );
      setNewLinkName("");
      setNewLinkUrl("");
    }
    onOpenChange(false);
  };
  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag("");
    }
  };
  const handleCreateTag = async () => {
    if (!newTag || !tagDepartmentId) return;
    try {
      const createdTag = await tagService.create(newTag, tagDepartmentId);
      setAvailableTags((prev) => [...prev, createdTag]);
      addTag(createdTag.name);
      toast({
        title: "Tag created",
        description: "New tag added to " + getDepartmentName(tagDepartmentId)
      });
    } catch (error) {
      console.error("Failed to create tag:", error);
      toast({
        title: "Error",
        description: "Failed to create tag. You might not be authorized.",
        variant: "destructive"
      });
    }
  };
  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };
  const addLink = () => {
    if (newLinkName && newLinkUrl) {
      if (editTask) {
        setPendingLinks([...pendingLinks, { name: newLinkName, url: newLinkUrl }]);
      } else {
        setPendingLinks([...pendingLinks, { name: newLinkName, url: newLinkUrl }]);
      }
      setNewLinkName("");
      setNewLinkUrl("");
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const removeAttachment = async (id) => {
    if (id.startsWith("pending-")) {
      setPendingFiles(pendingFiles.filter((pf) => pf.id !== id));
      return;
    }
    const attachment = attachments.find((att) => att.id === id);
    if (attachment) {
      try {
        await attachmentService.delete(id);
        setAttachments(attachments.filter((att) => att.id !== id));
        toast({
          title: "Attachment removed",
          description: "The attachment has been deleted."
        });
      } catch (error) {
        console.error("Failed to delete attachment:", error);
        toast({
          title: "Delete failed",
          description: "Could not delete the attachment. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  const removePendingLink = (index) => {
    setPendingLinks(pendingLinks.filter((_, i) => i !== index));
  };
  const getDepartmentName = (departmentId) => {
    return departments.find((dep) => dep.id === departmentId)?.name || "Uncategorized";
  };
  const memberOptions = teamMembers.filter((member) => member.is_active !== false || formData.assigneeIds.includes(member.id)).map((member) => {
    const departmentName = getDepartmentName(member.department);
    const taskCount = getTaskCountForAssignee(member.name);
    return {
      value: member.id,
      // Use ID as value
      label: `${member.name} (${taskCount})` + (member.is_active === false ? " (Deactivated)" : ""),
      group: departmentName
    };
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogContent,
    {
      className: "sm:max-w-[700px] max-h-[95vh] p-0 flex flex-col gap-0 overflow-hidden",
      onPointerDownOutside: (e) => e.preventDefault(),
      onEscapeKeyDown: (e) => e.preventDefault(),
      onInteractOutside: (e) => e.preventDefault(),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col h-full max-h-[95vh] overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 pb-4 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editTask ? "Edit Task" : "Create New Task" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editTask ? "Make changes to the task details below." : "Add a new task to your project. Fill in the details below." })
          ] }),
          isTaskLocked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-orange-900 dark:text-orange-100", children: "Task is Locked" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-orange-700 dark:text-orange-300 mt-1", children: [
                "This task is locked due to the project status. Editing is disabled until the project is reactivated.",
                editTask?.previousStatus && ` Previous status: ${editTask.previousStatus}`
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mt-6", children: [1, 2, 3].map((step) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center flex-1 last:flex-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
              currentStep === step ? "border-primary bg-primary text-primary-foreground scale-110" : currentStep > step ? "border-primary bg-primary/20 text-primary" : "border-muted text-muted-foreground"
            ), children: currentStep > step ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) : step }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 px-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: cn(
                "text-[10px] uppercase tracking-wider font-bold mb-0.5",
                currentStep === step ? "text-primary" : "text-muted-foreground"
              ), children: [
                "Step ",
                step
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold whitespace-nowrap", children: step === 1 ? "Basics" : step === 2 ? "Schedule" : "Attachments" })
            ] }),
            step < 3 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-[2px] flex-1 mx-2", currentStep > step ? "bg-primary" : "bg-muted") })
          ] }, step)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-6", children: [
          currentStep === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 animate-in fade-in slide-in-from-right-2 duration-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "title", className: errors.title ? "text-destructive" : "", children: "Title *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "title",
                  value: formData.title,
                  onChange: (e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: "" });
                  },
                  placeholder: "Enter task title",
                  className: errors.title ? "border-destructive focus-visible:ring-destructive" : "",
                  disabled: isTaskLocked
                }
              ),
              errors.title && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-destructive", children: errors.title })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "description", children: "Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                RichTextEditor,
                {
                  id: "description",
                  value: formData.description,
                  onChange: (value) => setFormData({ ...formData, description: value }),
                  placeholder: "Enter task description",
                  disabled: isTaskLocked
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "project", className: errors.project ? "text-destructive" : "", children: "Project *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SearchableSelect,
                  {
                    value: formData.project,
                    onValueChange: (value) => {
                      setFormData({ ...formData, project: value });
                      if (errors.project) setErrors({ ...errors, project: "" });
                    },
                    options: [
                      ...(allProjects || []).map((project) => ({
                        value: project.name,
                        label: project.name,
                        group: project.department ? project.department.name : "Uncategorized"
                      }))
                    ],
                    placeholder: "Select project",
                    disabled: projects.length === 1 || isTaskLocked
                  }
                ),
                errors.project && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-destructive", children: errors.project })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "assignee", className: errors.assignee ? "text-destructive" : "", children: "Assign To *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SearchableSelect,
                  {
                    value: formData.assigneeIds[0],
                    onValueChange: (value) => {
                      setFormData({ ...formData, assigneeIds: value ? [value] : [] });
                      if (errors.assignee) setErrors({ ...errors, assignee: "" });
                    },
                    options: memberOptions,
                    placeholder: "Select member",
                    disabled: !!assignmentRestriction || isTaskLocked
                  }
                ),
                assignmentRestriction ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-700 animate-in fade-in slide-in-from-top-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5 flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: assignmentRestriction })
                ] }) : errors.assignee && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-destructive", children: errors.assignee }),
                (activeRole === "admin" || activeRole === "team-lead" || activeRole === "account-manager") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Checkbox,
                    {
                      id: "isAssigneeLocked",
                      checked: formData.isAssigneeLocked,
                      onCheckedChange: (checked) => setFormData({ ...formData, isAssigneeLocked: checked })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "isAssigneeLocked", className: "text-xs font-normal text-muted-foreground", children: "Keep Assigning this user" })
                ] })
              ] })
            ] })
          ] }),
          currentStep === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 animate-in fade-in slide-in-from-right-2 duration-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "status", children: "Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: useProjectStages ? formData.projectStage : formData.userStatus,
                    onValueChange: (value) => {
                      const updates = {};
                      if (useProjectStages) {
                        updates.projectStage = value;
                        const selectedStage = availableStatuses.find((s) => s.id === value);
                        if (selectedStage) {
                          const title = selectedStage.title.toLowerCase();
                          if (title === "pending") updates.userStatus = "pending";
                          else if (title.includes("complete")) updates.userStatus = "complete";
                          else updates.userStatus = "in-progress";
                        }
                      } else {
                        updates.userStatus = value;
                        if (allProjects && formData.project) {
                          const project = allProjects.find((p) => p.name === formData.project);
                          if (project && project.stages) {
                            let mappedStage;
                            if (value === "pending") {
                              mappedStage = project.stages.find((s) => s.title.toLowerCase() === "pending");
                            } else if (value === "complete") {
                              mappedStage = project.stages.find((s) => ["complete", "completed"].includes(s.title.toLowerCase()));
                            } else ;
                            if (mappedStage) {
                              updates.projectStage = String(mappedStage.id);
                            } else {
                              updates.projectStage = "";
                            }
                          }
                        }
                      }
                      setFormData((prev) => ({ ...prev, ...updates }));
                    },
                    disabled: isStageLocked,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "status", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (useProjectStages && allProjects && formData.project ? allProjects.find((p) => p.name === formData.project)?.stages || availableStatuses : availableStatuses).filter((status) => status.title !== "Specific Stage").slice().sort((a, b) => {
                        return a.order - b.order;
                      }).map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: status.id, children: status.title === "Pending" && !disableBacklogRenaming ? "Backlog" : status.title }, status.id)) })
                    ]
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
            (() => {
              if (!formData.project) return null;
              let currentProjectStages = [];
              if (allProjects) {
                const proj = allProjects.find((p) => p.name === formData.project);
                if (proj) currentProjectStages = proj.stages;
              }
              if (currentProjectStages.length === 0 && useProjectStages) {
                currentProjectStages = availableStatuses;
              }
              if (currentProjectStages.length === 0) return null;
              const currentStageId = formData.projectStage;
              const currentStage = currentProjectStages.find((s) => String(s.id) === String(currentStageId));
              let isBacklog = false;
              if (currentStage) {
                isBacklog = currentStage.title.toLowerCase() === "backlog";
              } else if (formData.userStatus === "pending") {
                const backlogStage = currentProjectStages.find((s) => s.title.toLowerCase() === "backlog");
                if (backlogStage) {
                  isBacklog = true;
                }
              }
              if (!isBacklog) return null;
              const startStageOptions = currentProjectStages.filter((s) => s.title.toLowerCase() !== "backlog" && s.title !== "Suggested Task" && s.title !== "Specific Stage").sort((a, b) => a.order - b.order);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "startStage", children: "Start Stage (Auto-move)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: formData.startStageId || void 0,
                    onValueChange: (value) => setFormData({ ...formData, startStageId: value || "" }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "startStage", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "None (Stay in Backlog)" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: startStageOptions.map((stage) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(stage.id), children: stage.title.toLowerCase().trim() === "pending" ? "Backlog" : stage.title }, stage.id)) })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Task will automatically move to this stage when the start time arrives" })
              ] });
            })(),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "startDate", children: "Start Date" }),
                  (activeRole === "admin" || activeRole === "team-lead" || activeRole === "account-manager") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
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
                  (activeRole === "admin" || activeRole === "team-lead" || activeRole === "account-manager") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
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
            ] })
          ] }),
          currentStep === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 animate-in fade-in slide-in-from-right-2 duration-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tags" }),
                activeRole === "admin" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: tagDepartmentId, onValueChange: setTagDepartmentId, disabled: !!fixedDepartmentId, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-[180px] h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Filter by Department" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: departments.map((dept) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: dept.id, children: dept.name }, dept.id)) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "gap-1", children: [
                tag,
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  X,
                  {
                    className: "h-3 w-3 cursor-pointer",
                    onClick: () => removeTag(tag)
                  }
                )
              ] }, tag)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: availableTags.filter((tag) => !tags.includes(tag.name)).map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Badge,
                {
                  variant: "outline",
                  className: "cursor-pointer hover:bg-secondary",
                  onClick: () => addTag(tag.name),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
                    tag.name
                  ]
                },
                tag.id
              )) }),
              (activeRole === "admin" || activeRole === "team-lead") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    placeholder: "New tag name...",
                    value: newTag,
                    onChange: (e) => setNewTag(e.target.value),
                    onKeyPress: (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateTag();
                      }
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    variant: "outline",
                    size: "icon",
                    onClick: handleCreateTag,
                    disabled: !newTag || !tagDepartmentId,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Attachments" }),
              attachments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 mb-2", children: attachments.map((attachment) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center justify-between p-2 border rounded-md",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      attachment.type === "link" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-4 w-4 text-blue-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4 text-green-500" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "a",
                        {
                          href: attachment.url,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          className: "text-sm truncate max-w-[200px] hover:underline",
                          children: attachment.name
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "icon",
                        className: "h-6 w-6",
                        onClick: () => removeAttachment(attachment.id),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
                      }
                    )
                  ]
                },
                attachment.id
              )) }),
              pendingFiles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 mb-2", children: pendingFiles.map((pendingFile) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center justify-between p-2 border border-dashed rounded-md bg-muted/50",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4 text-orange-500" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm truncate max-w-[200px]", children: pendingFile.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: "Pending upload" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "icon",
                        className: "h-6 w-6",
                        onClick: () => removeAttachment(pendingFile.id),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
                      }
                    )
                  ]
                },
                pendingFile.id
              )) }),
              pendingLinks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 mb-2", children: pendingLinks.map((link, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center justify-between p-2 border border-dashed rounded-md bg-muted/50",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-4 w-4 text-orange-500" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm truncate max-w-[200px]", children: link.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: "Pending" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        variant: "ghost",
                        size: "icon",
                        className: "h-6 w-6",
                        onClick: () => removePendingLink(index),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
                      }
                    )
                  ]
                },
                `pending-link-${index}`
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    ref: fileInputRef,
                    type: "file",
                    multiple: true,
                    onChange: handleFileUpload,
                    className: "file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      placeholder: "Link name...",
                      value: newLinkName,
                      onChange: (e) => setNewLinkName(e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      placeholder: "URL...",
                      value: newLinkUrl,
                      onChange: (e) => setNewLinkUrl(e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      type: "button",
                      variant: "outline",
                      size: "icon",
                      onClick: addLink,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-4 w-4" })
                    }
                  )
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 pt-4 shrink-0 border-t mt-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:justify-between sm:gap-0", children: [
          currentStep > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", onClick: prevStep, className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
            " Back"
          ] }, "back-btn") : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => onOpenChange(false), children: "Cancel" }, "cancel-btn"),
          currentStep < 3 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: nextStep, className: "gap-2", children: [
            "Next ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
          ] }, "next-btn") : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: isUploading || isTaskLocked, className: "gap-2", children: isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
            "Uploading..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            editTask ? "Update Task" : "Create Task",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" })
          ] }) }, "submit-btn")
        ] }) })
      ] })
    }
  ) });
}
export {
  TaskDialog as T,
  tagService as t
};
