import { F as useToast, l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, Q as Label, I as Input, U as DialogFooter, B as Button, H as useParams, v as useUser, an as useSearchParams, ap as useHistory, S as Skeleton, aN as TooltipProvider, aO as Tooltip, aP as TooltipTrigger, X, aD as MessageSquare, aQ as TooltipContent, P as Plus, b as api, D as userService, E as departmentService, x as projectService, w as taskService } from "./index-C4ZP3eFM.js";
import { T as ToggleGroup, a as ToggleGroupItem, L as LayoutGrid, K as KanbanBoard, b as TaskListView } from "./toggle-group-CaAmqKYR.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { S as StageManagement } from "./StageManagement-DDF_sr3i.js";
import { T as TaskDialog } from "./TaskDialog-C-uIVVSP.js";
import { L as List } from "./list-CgjYpKvJ.js";
import { M as Maximize2 } from "./maximize-2-BDFf7e8i.js";
import "./TaskCard-DsczT6D6.js";
import "./attachmentService-B1K5TSm1.js";
import "./card-5_9pbgKs.js";
import "./clock-C-1UQMq-.js";
import "./play-BwxbIHvy.js";
import "./format-BDODTvac.js";
import "./square-pen-Dr9mhwBZ.js";
import "./calendar-B2-LyEnc.js";
import "./paperclip-DDW-rwXv.js";
import "./download-qf94484n.js";
import "./arrow-right-TrnDYsFi.js";
import "./checkbox-qHm_4cmk.js";
import "./index-D6Uc8srH.js";
import "./circle-check-big-Cwck6DPV.js";
import "./link-CjUUS0B-.js";
import "./globe-CuQXKfU6.js";
import "./list-todo-B9y_ixvA.js";
import "./isToday-RL2Fg3s3.js";
import "./rich-text-editor-CK9AOqrB.js";
import "./searchable-select-BMuxGeaS.js";
import "./chevrons-up-down-DISs2Pfx.js";
import "./calendar-BErN999l.js";
import "./isThisMonth-C4UtR1WR.js";
import "./isSameMonth-fupOC6M2.js";
import "./chevron-left-zAeTltYW.js";
import "./info-BO35z3vl.js";
import "./ellipsis-vertical-DaSxVRLi.js";
import "./isWithinInterval-BCwcG1Bq.js";
import "./parseISO-BZpuPkuQ.js";
import "./subMonths-BheFHfWm.js";
import "./table-D5Ybxpto.js";
import "./sortable.esm-JHVIV_qM.js";
const colorOptions = [
  { value: "bg-gray-500", label: "Gray", class: "bg-gray-500" },
  { value: "bg-blue-500", label: "Blue", class: "bg-blue-500" },
  { value: "bg-green-500", label: "Green", class: "bg-green-500" },
  { value: "bg-red-500", label: "Red", class: "bg-red-500" },
  { value: "bg-orange-500", label: "Orange", class: "bg-orange-500" },
  { value: "bg-purple-500", label: "Purple", class: "bg-purple-500" },
  { value: "bg-yellow-500", label: "Yellow", class: "bg-yellow-500" },
  { value: "bg-pink-500", label: "Pink", class: "bg-pink-500" },
  { value: "bg-cyan-500", label: "Cyan", class: "bg-cyan-500" },
  { value: "bg-indigo-500", label: "Indigo", class: "bg-indigo-500" }
];
function UserStageDialog({
  open,
  onOpenChange,
  onSave,
  existingStages,
  editStage
}) {
  const { toast } = useToast();
  const [formData, setFormData] = reactExports.useState({
    title: "",
    color: "bg-blue-500"
  });
  reactExports.useEffect(() => {
    if (open) {
      if (editStage) {
        setFormData({
          title: editStage.title,
          color: editStage.color
        });
      } else {
        setFormData({
          title: "",
          color: "bg-blue-500"
        });
      }
    }
  }, [open, editStage]);
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
    const stageId = editStage ? editStage.id : formData.title.toLowerCase().replace(/\s+/g, "-");
    const completeStage = existingStages.find((s) => s.id === "complete");
    const order = editStage ? editStage.order : completeStage ? completeStage.order : existingStages.length;
    onSave({
      id: stageId,
      title: formData.title,
      color: formData.color,
      type: "user",
      order
    });
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "sm:max-w-[425px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editStage ? "Edit Stage" : "Create Custom Stage" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editStage ? "Update your custom stage details." : 'Add a custom stage between "Pending" and "Complete" to organize your tasks.' })
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
            placeholder: "e.g., In Progress, Review, Testing",
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
                    className: `h-3 w-3 rounded-full ${option.class}`
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: option.label })
              ] }) }, option.value)) })
            ]
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
const getDefaultUserTaskStages = () => [
  { id: "pending", title: "Pending", color: "bg-status-todo", order: 0, type: "user" },
  { id: "complete", title: "Complete", color: "bg-status-done", order: 999, type: "user" }
];
function UserProjectStageTasks() {
  const { projectId, stageId } = useParams();
  const numericProjectId = projectId ? parseInt(projectId, 10) : null;
  const { currentUser } = useUser();
  const { toast } = useToast();
  const [tasks, setTasks] = reactExports.useState([]);
  const [allTasks, setAllTasks] = reactExports.useState([]);
  const [project, setProject] = reactExports.useState(null);
  const [stage, setStage] = reactExports.useState(null);
  const [userStages, setUserStages] = reactExports.useState(getDefaultUserTaskStages());
  const [isStageDialogOpen, setIsStageDialogOpen] = reactExports.useState(false);
  const [editingStage, setEditingStage] = reactExports.useState(null);
  const [isStageManagementOpen, setIsStageManagementOpen] = reactExports.useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = reactExports.useState(false);
  const [editingTask, setEditingTask] = reactExports.useState(null);
  const [teamMembers, setTeamMembers] = reactExports.useState([]);
  const [departments, setDepartments] = reactExports.useState([]);
  const [view, setView] = reactExports.useState("kanban");
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = reactExports.useState(true);
  const [showChat, setShowChat] = reactExports.useState(false);
  const [autoLoginUrl, setAutoLoginUrl] = reactExports.useState("");
  const [chatLoading, setChatLoading] = reactExports.useState(false);
  const [isChatFullscreen, setIsChatFullscreen] = reactExports.useState(false);
  const fetchUserStages = async () => {
    if (!currentUser) return;
    try {
      const { data } = await api.get("/stages", { params: { type: "user", project_id: numericProjectId, context_stage_id: stageId } });
      const customStages = data.map((s) => ({
        id: String(s.id),
        title: s.title,
        color: s.color,
        order: s.order,
        type: "user",
        isReviewStage: s.is_review_stage
      }));
      const defaultStages = getDefaultUserTaskStages();
      const pending = defaultStages.find((s) => s.id === "pending");
      const complete = defaultStages.find((s) => s.id === "complete");
      customStages.sort((a, b) => a.order - b.order);
      setUserStages([pending, ...customStages, complete]);
    } catch (e) {
      console.error("Failed to load user stages", e);
      setUserStages(getDefaultUserTaskStages());
    }
  };
  reactExports.useEffect(() => {
    fetchUserStages();
  }, [currentUser, numericProjectId, stageId]);
  reactExports.useEffect(() => {
    const taskIdParam = searchParams.get("task");
    if (taskIdParam && tasks.length > 0) {
      setTimeout(() => {
        const taskElement = document.getElementById(`task-${taskIdParam}`);
        if (taskElement) {
          taskElement.scrollIntoView({ behavior: "smooth", block: "center" });
          taskElement.classList.add("ring-2", "ring-primary", "shadow-lg");
          setTimeout(() => {
            taskElement.classList.remove("ring-2", "ring-primary", "shadow-lg");
          }, 3e3);
          searchParams.delete("task");
          setSearchParams(searchParams);
        }
      }, 500);
    }
  }, [tasks, searchParams]);
  reactExports.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [usersData, departmentsData] = await Promise.all([
          userService.getAll(),
          departmentService.getAll()
        ]);
        setTeamMembers(usersData);
        setDepartments(departmentsData);
        if (!numericProjectId || !stageId) return;
        const proj = await projectService.getById(projectId || "");
        setProject(proj || null);
        const projStage = proj?.stages.find((s) => String(s.id) === String(stageId)) || null;
        setStage(projStage);
        const tasksData = await taskService.getAll({ projectId });
        setAllTasks(tasksData);
        if (proj?.status === "on-hold") {
          setTasks([]);
          return;
        }
        const filtered = tasksData.filter((t) => {
          const isAssigned = t.assignee === (currentUser?.name || "") || t.assignedUsers && t.assignedUsers.some((u) => String(u.id) === String(currentUser?.id));
          const myAssignment = t.assignedUsers?.find((u) => String(u.id) === String(currentUser?.id));
          const isMyPartComplete = myAssignment?.status === "complete";
          const hasSubtasks = t.subtasks && t.subtasks.length > 0;
          const allSubtasksComplete = hasSubtasks && t.subtasks.every((st) => st.userStatus === "complete");
          return String(t.projectId) === String(projectId) && String(t.projectStage) === String(stageId) && isAssigned && t.userStatus !== "complete" && !isMyPartComplete && !allSubtasksComplete;
        });
        setTasks(filtered);
      } catch (error) {
        console.error("Error loading user stage tasks:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please refresh.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [projectId, stageId, currentUser]);
  reactExports.useEffect(() => {
    if (showChat && !autoLoginUrl && currentUser?.email) {
      setChatLoading(true);
      const email = encodeURIComponent(currentUser.email);
      const redirectTo = encodeURIComponent("/artslab-creatives/channels/town-square");
      const url = `https://collab.artslabcreatives.com/email_login?email=${email}&redirect_to=${redirectTo}`;
      console.log("Kanban Chat: Building URL for", email);
      console.log("Kanban Chat: URL =", url);
      setAutoLoginUrl(url);
      setChatLoading(false);
    }
  }, [showChat, currentUser]);
  const { addHistoryEntry } = useHistory(projectId ? String(projectId) : void 0);
  const handleTaskUpdate = (taskId, updates) => {
    const taskToUpdate = tasks.find((t) => t.id === taskId);
    if (taskToUpdate && projectId && currentUser) {
      if (updates.userStatus && taskToUpdate.userStatus === "pending" && updates.userStatus !== "pending" && updates.userStatus !== "complete") {
        addHistoryEntry({
          action: "USER_START_TASK",
          entityId: taskId,
          entityType: "task",
          projectId,
          userId: currentUser.id,
          details: { title: taskToUpdate.title }
        });
      }
      if (updates.userStatus === "complete" && taskToUpdate.userStatus !== "complete") {
        addHistoryEntry({
          action: "USER_COMPLETE_TASK",
          entityId: taskId,
          entityType: "task",
          projectId,
          userId: currentUser.id,
          details: { title: taskToUpdate.title }
        });
      }
    }
    const updateTaskRecursively = (list) => {
      return list.map((task) => {
        if (task.id === taskId) return { ...task, ...updates };
        if (task.subtasks && task.subtasks.length > 0) {
          return { ...task, subtasks: updateTaskRecursively(task.subtasks) };
        }
        return task;
      });
    };
    setTasks((prevTasks) => updateTaskRecursively(prevTasks));
    if (updates.userStatus === "complete") {
      console.log(`Task ${taskId} marked as complete, scheduling removal in 10s`);
      setTimeout(() => {
        setTasks((currentTasks) => {
          const task = currentTasks.find((t) => String(t.id) === String(taskId));
          console.log(`[UserProjectStageTasks] Checking task ${taskId} for removal. Found: ${!!task}, Status: ${task?.userStatus}`);
          if (task && task.userStatus === "complete") {
            console.log(`Removing completed task ${taskId} from view`);
            return currentTasks.filter((t) => String(t.id) !== String(taskId));
          }
          return currentTasks;
        });
      }, 1e4);
    }
    try {
      const task = tasks.find((t) => t.id === taskId);
      const projectId2 = task?.projectId || (project ? project.id : void 0);
      const assigneeName = updates.assignee;
      const assigneeId = assigneeName ? teamMembers.find((m) => m.name === assigneeName)?.id : void 0;
      const projectStageId = updates.projectStage ? parseInt(String(updates.projectStage), 10) : void 0;
      if (projectId2) {
        void taskService.update(taskId, {
          projectId: projectId2,
          assigneeId: assigneeId ? parseInt(String(assigneeId), 10) : void 0,
          projectStageId,
          userStatus: updates.userStatus,
          previousStage: updates.previousStage,
          revisionComment: updates.revisionComment,
          isInSpecificStage: updates.isInSpecificStage
        });
      }
    } catch (e) {
      console.error("Failed to persist task update", e);
    }
  };
  const handleSaveTask = async (taskData, pendingFiles, pendingLinks) => {
    if (editingTask) {
      const updatedTask = await taskService.update(editingTask.id, taskData);
      const updateTaskRecursively = (list) => {
        return list.map((task) => {
          if (task.id === editingTask.id) return updatedTask;
          if (task.subtasks && task.subtasks.length > 0) {
            return { ...task, subtasks: updateTaskRecursively(task.subtasks) };
          }
          return task;
        });
      };
      setTasks((prev) => updateTaskRecursively(prev));
      toast({
        title: "Task updated",
        description: "The task has been updated successfully."
      });
    }
    setIsTaskDialogOpen(false);
    setEditingTask(null);
  };
  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setIsTaskDialogOpen(true);
  };
  const handleTaskDelete = async (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    await taskService.delete(taskId);
    toast({
      title: "Task deleted",
      description: "The task has been deleted successfully."
    });
  };
  const handleSaveStage = async (newStage) => {
    if (!currentUser) return;
    try {
      if (editingStage) {
        await api.put(`/stages/${editingStage.id}`, {
          title: newStage.title,
          color: newStage.color,
          order: editingStage.order
        });
        toast({
          title: "Stage updated",
          description: `"${newStage.title}" has been updated.`
        });
      } else {
        const customStages = userStages.filter((s) => s.id !== "pending" && s.id !== "complete");
        const maxOrder = customStages.length > 0 ? Math.max(...customStages.map((s) => s.order)) : 0;
        await api.post("/stages", {
          title: newStage.title,
          color: newStage.color,
          order: maxOrder + 1,
          type: "user",
          is_review_stage: false,
          project_id: numericProjectId,
          context_stage_id: stageId
        });
        toast({
          title: "Stage created",
          description: `"${newStage.title}" has been added to your workflow.`
        });
      }
      setEditingStage(null);
      fetchUserStages();
    } catch (error) {
      console.error("Failed to save stage:", error);
      toast({
        title: "Error",
        description: "Failed to save stage.",
        variant: "destructive"
      });
    }
  };
  const handleEditStage = (stage2) => {
    setEditingStage(stage2);
    setIsStageDialogOpen(true);
  };
  const handleDeleteStage = async (stageIdToDelete) => {
    if (!currentUser) return;
    const stageToDelete = userStages.find((s) => s.id === stageIdToDelete);
    if (!stageToDelete) return;
    const stageTasks = tasks.filter((task) => task.userStatus === stageIdToDelete);
    if (stageTasks.length > 0) {
      toast({
        title: "Cannot delete stage",
        description: `"${stageToDelete.title}" has ${stageTasks.length} task(s). Move them first.`,
        variant: "destructive"
      });
      return;
    }
    try {
      await api.delete(`/stages/${stageIdToDelete}`);
      toast({
        title: "Stage deleted",
        description: `"${stageToDelete.title}" has been removed.`
      });
      fetchUserStages();
    } catch (error) {
      console.error("Failed to delete stage:", error);
      toast({
        title: "Error",
        description: "Failed to delete stage.",
        variant: "destructive"
      });
    }
  };
  const handleDialogClose = (open) => {
    setIsStageDialogOpen(open);
    if (!open) {
      setEditingStage(null);
    }
  };
  const tasksForListView = reactExports.useMemo(() => {
    return tasks.map((task) => ({
      ...task,
      projectStage: task.userStatus
    }));
  }, [tasks]);
  const handleTaskCompleteWithDetails = async (taskId, stageId2, data) => {
    try {
      console.log("[uppy] user project stage tasks completion handler", {
        taskId,
        stageId: stageId2,
        fileCount: data.files.length,
        files: data.files.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type
        })),
        linkCount: data.links.length,
        hasComment: Boolean(data.comment)
      });
      await taskService.complete(taskId, {
        status: "complete",
        comment: data.comment,
        links: data.links,
        files: data.files
      });
      console.log("[uppy] user project stage tasks completion handler resolved", { taskId, stageId: stageId2 });
      const task = tasks.find((t) => t.id === taskId);
      if (task && projectId && currentUser) {
        addHistoryEntry({
          action: "USER_COMPLETE_TASK",
          entityId: taskId,
          entityType: "task",
          projectId,
          userId: currentUser.id,
          details: { title: task.title }
        });
      }
      const updateTaskRecursively = (list) => {
        return list.map((t) => {
          if (t.id === taskId) return { ...t, userStatus: "complete" };
          if (t.subtasks && t.subtasks.length > 0) {
            return { ...t, subtasks: updateTaskRecursively(t.subtasks) };
          }
          return t;
        });
      };
      setTasks((prev) => updateTaskRecursively(prev));
      toast({
        title: "Task completed",
        description: "Task marked as complete with details."
      });
      setTimeout(() => {
        setTasks((currentTasks) => {
          const task2 = currentTasks.find((t) => String(t.id) === String(taskId));
          if (task2 && task2.userStatus === "complete") {
            return currentTasks.filter((t) => String(t.id) !== String(taskId));
          }
          return currentTasks;
        });
      }, 1e4);
    } catch (error) {
      console.error("[uppy] user project stage tasks completion handler failed", { taskId, stageId: stageId2, error });
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "Failed to complete task.",
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-64" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-96" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-24" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-32" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 w-80 flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full rounded-lg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg border bg-card space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-20" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4 rounded-full" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-6 rounded-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-16" })
            ] })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 w-80 flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full rounded-lg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [1].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg border bg-card space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-20" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4 rounded-full" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-6 rounded-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-16" })
            ] })
          ] }, i)) })
        ] })
      ] })
    ] });
  }
  if (!project || !stage) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Project or Stage not found." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-bold", children: [
          project.name,
          " - ",
          stage.title
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
          "Tasks assigned to ",
          currentUser?.name,
          " in this stage."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        !showChat && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          ToggleGroup,
          {
            type: "single",
            value: view,
            onValueChange: (value) => {
              if (value) setView(value);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItem, { value: "kanban", "aria-label": "Kanban view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItem, { value: "list", "aria-label": "List view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-4 w-4" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => setShowChat(!showChat),
              variant: showChat ? "default" : "outline",
              disabled: !project?.mattermostChannelId,
              children: showChat ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 mr-2" }),
                "Close Chat"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4 mr-2" }),
                "Chat"
              ] })
            }
          ) }) }),
          !project?.mattermostChannelId && /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Please select or create a Mattermost channel for this project" }) })
        ] }) }),
        showChat && !isChatFullscreen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "icon",
            onClick: () => setIsChatFullscreen(true),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Open fullscreen" })
            ]
          }
        ),
        !showChat && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setIsStageManagementOpen(true), variant: "outline", disabled: project?.status === "on-hold", children: "Manage Stages" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
            setEditingStage(null);
            setIsStageDialogOpen(true);
          }, size: "sm", disabled: project?.status === "on-hold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
            "Add Stage"
          ] })
        ] })
      ] })
    ] }),
    showChat ? isChatFullscreen ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 bg-background flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium", children: [
            "Chat - ",
            project?.name
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-8 w-8",
            onClick: () => setIsChatFullscreen(false),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Exit fullscreen" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-hidden", children: chatLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading chat..." }) }) : autoLoginUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "iframe",
        {
          src: autoLoginUrl,
          className: "w-full h-full",
          title: "Chat",
          allow: "microphone; camera"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: "Failed to load chat" }) }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-[calc(100vh-12rem)] border rounded-lg overflow-hidden", children: chatLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading chat..." }) }) : autoLoginUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "iframe",
      {
        src: autoLoginUrl,
        className: "w-full h-full",
        title: "Chat",
        allow: "microphone; camera"
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive", children: "Failed to load chat" }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: view === "kanban" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      KanbanBoard,
      {
        tasks,
        stages: userStages,
        onTaskUpdate: handleTaskUpdate,
        onTaskEdit: handleTaskEdit,
        onTaskDelete: handleTaskDelete,
        useProjectStages: false,
        canManageStages: false,
        canManageTasks: false,
        canDragTasks: true,
        projectId,
        onTaskComplete: handleTaskCompleteWithDetails,
        disableBacklogRenaming: true,
        useSubtasksGrouping: true,
        allTasks,
        teamMembers,
        departments
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      TaskListView,
      {
        tasks: tasksForListView,
        stages: userStages,
        onTaskEdit: handleTaskEdit,
        onTaskDelete: handleTaskDelete,
        onTaskUpdate: handleTaskUpdate,
        teamMembers,
        showAssigneeColumn: false,
        canManage: false,
        canUpdateStage: true
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StageManagement,
      {
        open: isStageManagementOpen,
        onOpenChange: setIsStageManagementOpen,
        stages: userStages.filter((s) => s.id !== "pending" && s.id !== "complete"),
        onAddStage: () => {
          setIsStageManagementOpen(false);
          setEditingStage(null);
          setIsStageDialogOpen(true);
        },
        onEditStage: (stage2) => {
          setIsStageManagementOpen(false);
          handleEditStage(stage2);
        },
        onDeleteStage: handleDeleteStage
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      UserStageDialog,
      {
        open: isStageDialogOpen,
        onOpenChange: handleDialogClose,
        onSave: handleSaveStage,
        existingStages: userStages,
        editStage: editingStage
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TaskDialog,
      {
        open: isTaskDialogOpen,
        onOpenChange: (open) => {
          setIsTaskDialogOpen(open);
          if (!open) setEditingTask(null);
        },
        onSave: handleSaveTask,
        editTask: editingTask,
        availableProjects: [project.name],
        availableStatuses: userStages,
        useProjectStages: false,
        teamMembers,
        departments,
        allTasks,
        currentUser,
        fixedDepartmentId: project.department?.id,
        disableBacklogRenaming: true
      }
    )
  ] });
}
export {
  UserProjectStageTasks as default
};
