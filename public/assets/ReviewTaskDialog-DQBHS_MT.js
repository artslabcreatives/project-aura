import { l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, ai as Separator, ag as User, Y as Badge, C as CircleAlert, V as Collapsible, W as CollapsibleTrigger, B as Button, aE as History, _ as CollapsibleContent, Q as Label, U as DialogFooter } from "./index-C4ZP3eFM.js";
import { R as RichTextEditor } from "./rich-text-editor-CK9AOqrB.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { C as Calendar } from "./calendar-B2-LyEnc.js";
import { C as Clock } from "./clock-C-1UQMq-.js";
import { i as isValid, f as format } from "./format-BDODTvac.js";
function ReviewTaskDialog({
  open,
  onOpenChange,
  task,
  stages,
  onApprove,
  onRequestRevision
}) {
  const [action, setAction] = reactExports.useState(null);
  const [targetStageId, setTargetStageId] = reactExports.useState("");
  const [comment, setComment] = reactExports.useState("");
  const [showHistory, setShowHistory] = reactExports.useState(false);
  const currentStage = stages.find((s) => s.id === task?.projectStage);
  reactExports.useEffect(() => {
    if (action === "approve" && currentStage?.approvedTargetStageId) {
      setTargetStageId(currentStage.approvedTargetStageId);
    } else if (action === "revision" && task?.previousStage) {
      setTargetStageId(task.previousStage);
    } else {
      setTargetStageId("");
    }
  }, [action, currentStage, task]);
  const handleSubmit = () => {
    if (!task || !targetStageId) return;
    if (action === "approve") {
      onApprove(task.id, targetStageId, comment || void 0);
      onOpenChange(false);
      resetDialog();
    } else if (action === "revision" && comment.trim()) {
      onRequestRevision(task.id, targetStageId, comment);
      onOpenChange(false);
      resetDialog();
    }
  };
  const resetDialog = () => {
    setAction(null);
    setTargetStageId("");
    setComment("");
    setShowHistory(false);
  };
  const handleOpenChange = (open2) => {
    if (!open2) {
      resetDialog();
    }
    onOpenChange(open2);
  };
  if (!task) return null;
  const priorityColors = {
    low: "bg-priority-low/10 text-priority-low border-priority-low/20",
    medium: "bg-priority-medium/10 text-priority-medium border-priority-medium/20",
    high: "bg-priority-high/10 text-priority-high border-priority-high/20"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: handleOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[600px] max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Specific Stage Task" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Review the task details and approve or request revision." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg", children: task.title }),
        task.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-2", children: task.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Assignee:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: task.assignee || "Unassigned" })
          ] }),
          (() => {
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            return dueDate && isValid(dueDate) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Due Date:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: format(dueDate, "MMM dd, yyyy") })
            ] }) : null;
          })(),
          task.startDate && (() => {
            const startDate = new Date(task.startDate);
            return isValid(startDate) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Start Date:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: format(startDate, "MMM dd, yyyy") })
            ] }) : null;
          })()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Priority:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: `text-xs capitalize ${priorityColors[task.priority]}`,
                children: task.priority
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Project:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: task.project })
          ] })
        ] })
      ] }),
      task.tags && task.tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Tags:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: task.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: tag }, tag)) })
      ] }),
      task.revisionComment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-amber-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-amber-900 dark:text-amber-100", children: "Current Revision Comment:" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-800 dark:text-amber-200", children: task.revisionComment })
      ] }),
      task.revisionHistory && task.revisionHistory.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible, { open: showHistory, onOpenChange: setShowHistory, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-4 w-4" }),
          showHistory ? "Hide" : "Show",
          " Revision History (",
          task.revisionHistory.length,
          ")"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContent, { className: "mt-3 space-y-2", children: [...task.revisionHistory].reverse().map((revision, index) => {
          const requestedDate = revision.requestedAt ? new Date(revision.requestedAt) : null;
          const resolvedDate = revision.resolvedAt ? new Date(revision.resolvedAt) : null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "p-3 bg-muted rounded-lg border",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-muted-foreground", children: [
                    "Revision #",
                    task.revisionHistory.length - index
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: requestedDate && isValid(requestedDate) ? format(requestedDate, "MMM dd, yyyy 'at' hh:mm a") : "Unknown date" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mb-2", children: revision.comment }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Requested by: ",
                    revision.requestedBy
                  ] }),
                  resolvedDate && isValid(resolvedDate) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-600", children: [
                    "✓ Resolved ",
                    format(resolvedDate, "MMM dd")
                  ] })
                ] })
              ]
            },
            revision.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
      action === null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Choose an action:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => setAction("approve"),
              className: "flex-1",
              variant: "default",
              children: "Approve"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => setAction("revision"),
              className: "flex-1",
              variant: "outline",
              children: "Request Revision"
            }
          )
        ] })
      ] }),
      action === "approve" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "approve-stage", className: "text-sm font-medium", children: "Move to Stage *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: targetStageId, onValueChange: setTargetStageId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "approve-stage", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select target stage" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: stages.filter((s) => s.id !== task.projectStage).map((stage) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: stage.id, children: stage.title }, stage.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "approve-comment", className: "text-sm font-medium", children: "Comment (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            RichTextEditor,
            {
              id: "approve-comment",
              value: comment,
              onChange: (value) => setComment(value),
              placeholder: "Add any notes about this approval..."
            }
          )
        ] })
      ] }),
      action === "revision" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "revision-stage", className: "text-sm font-medium", children: "Move to Stage *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: targetStageId, onValueChange: setTargetStageId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "revision-stage", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select target stage" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: stages.filter((s) => s.id !== task.projectStage).map((stage) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: stage.id, children: stage.title }, stage.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "revision-comment", className: "text-sm font-medium", children: "Revision Comment *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            RichTextEditor,
            {
              id: "revision-comment",
              value: comment,
              onChange: (value) => setComment(value),
              placeholder: "Explain what needs to be revised..."
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "The task will be sent back to ",
            task.assignee || "the assignee",
            " with your comments."
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: action !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          onClick: () => setAction(null),
          children: "Back"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleSubmit,
          disabled: !targetStageId || action === "revision" && !comment.trim(),
          children: action === "approve" ? "Confirm Approval" : "Submit Revision"
        }
      )
    ] }) })
  ] }) });
}
export {
  ReviewTaskDialog as R
};
