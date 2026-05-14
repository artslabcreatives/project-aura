import { v as useUser, F as useToast, l as reactExports, ap as useHistory, j as jsxRuntimeExports, S as Skeleton, bb as FileCog, w as taskService, x as projectService, D as userService } from "./index-C4ZP3eFM.js";
import { a as TaskCard, T as TaskDetailsDialog } from "./TaskCard-DsczT6D6.js";
import { R as ReviewTaskDialog } from "./ReviewTaskDialog-DQBHS_MT.js";
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
import "./select-Beq9iUV3.js";
import "./link-CjUUS0B-.js";
import "./globe-CuQXKfU6.js";
import "./list-todo-B9y_ixvA.js";
import "./isToday-RL2Fg3s3.js";
import "./rich-text-editor-CK9AOqrB.js";
import "./list-CgjYpKvJ.js";
function ReviewNeededPage() {
  const { currentUser } = useUser();
  const { toast } = useToast();
  const [tasks, setTasks] = reactExports.useState([]);
  const [projects, setProjects] = reactExports.useState([]);
  const [viewTask, setViewTask] = reactExports.useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = reactExports.useState(false);
  const [reviewTask, setReviewTask] = reactExports.useState(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  const { addHistoryEntry } = useHistory();
  const [teamMembers, setTeamMembers] = reactExports.useState([]);
  const fetchData = async () => {
    try {
      const [tasksData, projectsData, usersData] = await Promise.all([
        taskService.getAll(),
        projectService.getAll(),
        userService.getAll()
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      setTeamMembers(usersData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    fetchData();
  }, []);
  const reviewNeededTasks = reactExports.useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter((task) => {
      const isAssigned = task.assignee === currentUser.name || task.assignedUsers && task.assignedUsers.some((u) => String(u.id) === String(currentUser.id));
      if (!isAssigned) return false;
      const project = projects.find((p) => p.name === task.project);
      if (!project) return false;
      const stage = project.stages.find((s) => s.id === task.projectStage);
      if (!stage) return false;
      const isReview = stage.isReviewStage || stage.title.toLowerCase().includes("review");
      return isReview && task.userStatus !== "complete";
    });
  }, [tasks, projects, currentUser]);
  const handleApproveTask = async (taskId, targetStageId, comment) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const project = projects.find((p) => p.name === task.project);
    const projectId = project ? String(project.id) : void 0;
    const targetStage = project?.stages.find((s) => String(s.id) === String(targetStageId));
    try {
      const updates = {
        projectStage: targetStageId,
        projectStageId: parseInt(targetStageId),
        isInSpecificStage: false,
        previousStage: void 0,
        originalAssignee: void 0,
        revisionComment: void 0
      };
      if (targetStage?.title.toLowerCase().includes("complete")) {
        updates.userStatus = "complete";
      } else {
        updates.userStatus = "pending";
      }
      if (targetStage?.mainResponsibleId) {
        const mr = teamMembers.find((m) => m.id === targetStage.mainResponsibleId);
        if (mr) {
          updates.assignee = mr.name;
          updates.assigneeId = parseInt(mr.id);
        } else {
          updates.assignee = "";
          updates.assigneeId = null;
        }
      } else {
        updates.assignee = "";
        updates.assigneeId = null;
      }
      await taskService.update(taskId, updates);
      const updateTaskRecursively = (list) => {
        return list.map((t) => {
          if (t.id === taskId) return { ...t, ...updates };
          if (t.subtasks && t.subtasks.length > 0) {
            return { ...t, subtasks: updateTaskRecursively(t.subtasks) };
          }
          return t;
        });
      };
      setTasks((prev) => updateTaskRecursively(prev));
      if (currentUser && projectId) {
        addHistoryEntry({
          action: "UPDATE_TASK_STATUS",
          entityId: taskId,
          entityType: "task",
          projectId,
          userId: currentUser.id,
          details: {
            action: "approved",
            comment,
            targetStage: targetStage?.title || targetStageId,
            newAssignee: updates.assignee || "Unassigned"
          }
        });
      }
      toast({ title: "Task approved", description: `Task moved to ${targetStage?.title || "selected stage"}.` });
    } catch (error) {
      console.error("Failed to approve task:", error);
      toast({ title: "Error", description: "Failed to approve task.", variant: "destructive" });
    }
  };
  const handleRequestRevision = async (taskId, targetStageId, comment) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const project = projects.find((p) => p.name === task.project);
    const projectId = project ? String(project.id) : void 0;
    const targetStage = project?.stages.find((s) => s.id === targetStageId);
    const originalAssigneeName = task.originalAssignee || task.assignee;
    if (!originalAssigneeName) {
      toast({ title: "Error", description: "Could not find the task assignee.", variant: "destructive" });
      return;
    }
    const newRevision = {
      id: Date.now().toString(),
      comment,
      requestedBy: currentUser?.name || "Unknown",
      requestedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const updatedRevisionHistory = [...task.revisionHistory || [], newRevision];
    const updatedTags = task.tags ? [...task.tags] : [];
    if (!updatedTags.includes("Redo")) updatedTags.push("Redo");
    const originalAssigneeUser = teamMembers.find((u) => u.name === originalAssigneeName);
    const updates = {
      projectStage: targetStageId,
      projectStageId: parseInt(targetStageId),
      userStatus: "pending",
      isInSpecificStage: false,
      revisionComment: comment,
      revisionHistory: updatedRevisionHistory,
      tags: updatedTags,
      previousStage: void 0,
      originalAssignee: void 0
    };
    if (originalAssigneeUser) {
      updates.assignee = originalAssigneeName;
      updates.assigneeId = parseInt(originalAssigneeUser.id);
    }
    try {
      await taskService.update(taskId, updates);
      const localUpdates = { ...updates };
      delete localUpdates.assigneeId;
      const updateTaskRecursively = (list) => {
        return list.map((t) => {
          if (t.id === taskId) return { ...t, ...localUpdates };
          if (t.subtasks && t.subtasks.length > 0) {
            return { ...t, subtasks: updateTaskRecursively(t.subtasks) };
          }
          return t;
        });
      };
      setTasks((prev) => updateTaskRecursively(prev));
      if (currentUser && projectId) {
        addHistoryEntry({
          // Using generic addHistoryEntry from generic useHistory hook
          action: "UPDATE_TASK_STATUS",
          entityId: taskId,
          entityType: "task",
          projectId,
          userId: currentUser.id,
          details: {
            action: "revision_requested",
            comment,
            targetStage: targetStage?.title || targetStageId,
            assignedTo: originalAssigneeName
          }
        });
      }
      toast({ title: "Revision requested", description: `Task returned for revision.` });
    } catch (error) {
      console.error("Failed to request revision:", error);
      toast({ title: "Error", description: "Failed to request revision.", variant: "destructive" });
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 fade-in p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-12 rounded-lg" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-48" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-64" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: [1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg border bg-card space-y-3", children: [
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
      ] }, i)) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 fade-in p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-primary/10 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileCog, { className: "h-6 w-6 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Review Needed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Tasks assigned to you that require review and approval." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: reviewNeededTasks.length > 0 ? reviewNeededTasks.map((task) => {
      const project = projects.find((p) => p.name === task.project);
      const stage = project?.stages.find((s) => s.id === task.projectStage);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        TaskCard,
        {
          task,
          onDragStart: () => {
          },
          onEdit: () => {
          },
          onDelete: () => {
          },
          onView: () => {
            setViewTask(task);
            setIsViewDialogOpen(true);
          },
          onReviewTask: () => {
            setReviewTask(task);
            setIsReviewDialogOpen(true);
          },
          canManage: false,
          currentStage: stage,
          canDrag: false
        },
        task.id
      );
    }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileCog, { className: "h-10 w-10 mb-3 opacity-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No tasks waiting for review." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TaskDetailsDialog,
      {
        task: viewTask,
        open: isViewDialogOpen,
        onOpenChange: setIsViewDialogOpen
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ReviewTaskDialog,
      {
        open: isReviewDialogOpen,
        onOpenChange: setIsReviewDialogOpen,
        task: reviewTask,
        stages: (() => {
          if (!reviewTask) return [];
          const proj = projects.find((p) => p.name === reviewTask.project);
          return proj?.stages || [];
        })(),
        onApprove: handleApproveTask,
        onRequestRevision: handleRequestRevision
      }
    )
  ] });
}
export {
  ReviewNeededPage as default
};
