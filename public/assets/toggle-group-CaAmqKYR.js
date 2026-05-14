import { ad as createLucideIcon, l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, Q as Label, I as Input, B as Button, P as Plus, A as ScrollArea, X, af as Upload, aj as FileText, U as DialogFooter, ai as Separator, C as CircleAlert, F as useToast, v as useUser, z as cn, Y as Badge, aN as TooltipProvider, aO as Tooltip, aP as TooltipTrigger, aQ as TooltipContent, q as Check, aR as Copy, G as Search, aS as Popover, aT as PopoverTrigger, aU as PopoverContent, ar as DropdownMenu, as as DropdownMenuTrigger, au as DropdownMenuContent, av as DropdownMenuItem, a1 as Pencil, a2 as Trash2, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription, a8 as AlertDialogFooter, a9 as AlertDialogCancel, aa as AlertDialogAction, aV as endOfDay, w as taskService, i as isPast, aq as Lock, al as Eye, aW as useControllableState, aX as Primitive, aY as composeEventHandlers, R as React, aZ as Item, a_ as createRovingFocusGroupScope, a$ as useDirection, b0 as Root$1, b1 as createContextScope, b2 as cva } from "./index-C4ZP3eFM.js";
import { a as TaskCard, T as TaskDetailsDialog } from "./TaskCard-DsczT6D6.js";
import { R as RichTextEditor } from "./rich-text-editor-CK9AOqrB.js";
import { L as Link } from "./link-CjUUS0B-.js";
import { S as SearchableSelect } from "./searchable-select-BMuxGeaS.js";
import { C as Checkbox } from "./checkbox-qHm_4cmk.js";
import { C as Calendar } from "./calendar-B2-LyEnc.js";
import { C as Clock } from "./clock-C-1UQMq-.js";
import { S as Select, a as SelectTrigger, c as SelectContent, d as SelectItem, b as SelectValue } from "./select-Beq9iUV3.js";
import { F as Filter, C as Calendar$1, i as isThisWeek, a as isAfter } from "./calendar-BErN999l.js";
import { I as Info } from "./info-BO35z3vl.js";
import { E as EllipsisVertical } from "./ellipsis-vertical-DaSxVRLi.js";
import { L as List } from "./list-CgjYpKvJ.js";
import { i as isWithinInterval } from "./isWithinInterval-BCwcG1Bq.js";
import { p as parseISO } from "./parseISO-BZpuPkuQ.js";
import { a as isToday } from "./isToday-RL2Fg3s3.js";
import { i as isThisMonth } from "./isThisMonth-C4UtR1WR.js";
import { s as subMonths } from "./subMonths-BheFHfWm.js";
import { a as startOfDay, f as format } from "./format-BDODTvac.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-D5Ybxpto.js";
import { S as SquarePen } from "./square-pen-Dr9mhwBZ.js";
const ArrowDown = createLucideIcon("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
const ArrowUpDown = createLucideIcon("ArrowUpDown", [
  ["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }],
  ["path", { d: "M17 20V4", key: "1ejh1v" }],
  ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
  ["path", { d: "M7 4v16", key: "1glfcx" }]
]);
const ArrowUp = createLucideIcon("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
const LayoutGrid = createLucideIcon("LayoutGrid", [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
]);
function TaskCompletionDialog({
  open,
  onOpenChange,
  onConfirm,
  taskTitle
}) {
  const [comment, setComment] = reactExports.useState("");
  const [links, setLinks] = reactExports.useState([]);
  const [currentLink, setCurrentLink] = reactExports.useState("");
  const [files, setFiles] = reactExports.useState([]);
  const normalizeSafeUrl = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }
    const tryParse = (value) => {
      try {
        return new URL(value);
      } catch {
        return null;
      }
    };
    let url = tryParse(trimmed);
    if (!url) {
      url = tryParse("https://" + trimmed);
    }
    if (!url) {
      return null;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  };
  const handleAddLink = () => {
    const normalized = normalizeSafeUrl(currentLink);
    if (normalized && !links.includes(normalized)) {
      setLinks([...links, normalized]);
    }
    setCurrentLink("");
  };
  const handleRemoveLink = (linkToRemove) => {
    setLinks(links.filter((link) => link !== linkToRemove));
  };
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };
  const handleRemoveFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };
  const handleSubmit = () => {
    console.log("[uppy] task completion dialog submit", {
      commentLength: comment.trim().length,
      linkCount: links.length,
      fileCount: files.length,
      files: files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    });
    onConfirm({
      comment: comment.trim() || void 0,
      links,
      files
    });
    setComment("");
    setLinks([]);
    setFiles([]);
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Complete Task" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        taskTitle ? `"${taskTitle}"` : "This task",
        " is being moved to complete. Would you like to add any closing comments or resources?"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "comment", children: "Closing Comment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          RichTextEditor,
          {
            id: "comment",
            placeholder: "Add a summary or closing note...",
            value: comment,
            onChange: (value) => setComment(value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Resources (Links)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "https://...",
                value: currentLink,
                onChange: (e) => setCurrentLink(e.target.value),
                className: "pl-9",
                onKeyDown: (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLink();
                  }
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "icon", variant: "outline", onClick: handleAddLink, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
        ] }),
        links.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-24 rounded-md border p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: links.map((link, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: link, target: "_blank", rel: "noopener noreferrer", className: "truncate hover:underline text-blue-500 flex-1 min-w-0", children: link }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-6 w-6 text-muted-foreground hover:text-destructive",
              onClick: () => handleRemoveLink(link),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
            }
          )
        ] }, index)) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Attachments" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "file-upload", className: "cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4 mr-2" }),
          "Upload Files",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "file-upload", type: "file", multiple: true, className: "hidden", onChange: handleFileChange })
        ] }) }),
        files.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-24 rounded-md border p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: files.map((file, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 truncate", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: file.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "(",
              (file.size / 1024).toFixed(0),
              "KB)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "icon",
              className: "h-6 w-6 text-muted-foreground hover:text-destructive",
              onClick: () => handleRemoveFile(index),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
            }
          )
        ] }, index)) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSubmit, children: "Complete Task" })
    ] })
  ] }) });
}
function BulkEditDialog({
  open,
  onOpenChange,
  onSave,
  teamMembers,
  selectedCount,
  departments
}) {
  const [assigneeId, setAssigneeId] = reactExports.useState("");
  const [dueDate, setDueDate] = reactExports.useState("");
  const [dueTime, setDueTime] = reactExports.useState("17:00");
  const [extendDays, setExtendDays] = reactExports.useState("");
  const [clearDueDate, setClearDueDate] = reactExports.useState(false);
  const [updateAssignee, setUpdateAssignee] = reactExports.useState(false);
  const [updateDueDate, setUpdateDueDate] = reactExports.useState(false);
  const [dateMode, setDateMode] = reactExports.useState("set");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (open) {
      setAssigneeId("");
      setDueDate("");
      setDueTime("17:00");
      setExtendDays("");
      setClearDueDate(false);
      setUpdateAssignee(false);
      setUpdateDueDate(false);
      setDateMode("set");
      setIsSubmitting(false);
    }
  }, [open]);
  const handleSave = async () => {
    if (!updateAssignee && !updateDueDate) return;
    setIsSubmitting(true);
    try {
      const updates = {};
      if (updateAssignee && assigneeId) {
        updates.assigneeId = parseInt(assigneeId);
      }
      if (updateDueDate) {
        if (dateMode === "clear") {
          updates.clearDueDate = true;
        } else if (dateMode === "extend" && extendDays) {
          updates.extendDays = parseInt(extendDays);
        } else if (dateMode === "set" && dueDate) {
          updates.dueDate = `${dueDate}T${dueTime || "00:00"}:00`;
        }
      }
      await onSave(updates);
      onOpenChange(false);
    } catch (error) {
      console.error("Bulk update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const getDepartmentName = (id) => {
    return departments.find((d) => d.id === id)?.name || "Uncategorized";
  };
  const memberOptions = teamMembers.filter((member) => member.is_active !== false).map((member) => ({
    value: member.id,
    label: member.name,
    group: getDepartmentName(member.department)
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Bulk Edit Tasks" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "Update ",
        selectedCount,
        " selected task",
        selectedCount !== 1 ? "s" : "",
        " at once."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              id: "updateAssignee",
              checked: updateAssignee,
              onCheckedChange: (checked) => setUpdateAssignee(checked)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "updateAssignee", className: "font-semibold cursor-pointer", children: "Update Assignee" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `pl-6 space-y-2 transition-all ${updateAssignee ? "opacity-100" : "opacity-40 pointer-events-none"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SearchableSelect,
          {
            value: assigneeId,
            onValueChange: setAssigneeId,
            options: memberOptions,
            placeholder: "Select new assignee"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                id: "updateDueDate",
                checked: updateDueDate,
                onCheckedChange: (checked) => {
                  setUpdateDueDate(checked);
                  if (checked) setClearDueDate(false);
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "updateDueDate", className: "font-semibold cursor-pointer", children: "Update Due Date" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                id: "clearDueDate",
                checked: clearDueDate,
                onCheckedChange: (checked) => {
                  setClearDueDate(checked);
                  if (checked) {
                    setUpdateDueDate(true);
                    setExtendDays("");
                    setDueDate("");
                  }
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "clearDueDate", className: "text-xs cursor-pointer text-muted-foreground", children: "No Date" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `pl-6 space-y-4 transition-all ${updateDueDate ? "opacity-100" : "opacity-40 pointer-events-none"}`, children: [
          !clearDueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Specific Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "date",
                      className: "pl-9",
                      value: dueDate,
                      onChange: (e) => {
                        setDueDate(e.target.value);
                        setExtendDays("");
                      }
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Time" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "time",
                      className: "pl-9",
                      value: dueTime,
                      onChange: (e) => setDueTime(e.target.value)
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[10px] uppercase tracking-wider font-bold text-muted-foreground", children: "Or Extend Deadline By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "secondary",
                    size: "sm",
                    className: "h-8 text-[10px] font-bold",
                    onClick: () => {
                      setExtendDays("1");
                      setDueDate("");
                    },
                    children: "+1 DAY"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "secondary",
                    size: "sm",
                    className: "h-8 text-[10px] font-bold",
                    onClick: () => {
                      setExtendDays("7");
                      setDueDate("");
                    },
                    children: "+1 WEEK"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "number",
                      placeholder: "Days",
                      className: "h-8 w-24 text-xs pr-12",
                      value: extendDays,
                      onChange: (e) => {
                        setExtendDays(e.target.value);
                        setDueDate("");
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold uppercase", children: "Days" })
                ] })
              ] })
            ] })
          ] }),
          clearDueDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-orange-50 border border-orange-100 rounded-md flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-orange-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-orange-700 font-medium", children: "This will clear existing due dates for all selected tasks." })
          ] })
        ] })
      ] }),
      updateAssignee || updateDueDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-100 p-3 rounded-md flex items-start gap-2 animate-in fade-in slide-in-from-top-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-blue-600 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-700", children: [
          "This will apply the selected changes to all ",
          selectedCount,
          " tasks. This action can be tracked in task history."
        ] })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleSave,
          disabled: isSubmitting || !updateAssignee && !updateDueDate,
          children: isSubmitting ? "Updating..." : `Apply to ${selectedCount} Tasks`
        }
      )
    ] })
  ] }) });
}
function KanbanBoard({
  tasks,
  stages,
  onTaskUpdate,
  onTaskEdit,
  onTaskDelete,
  useProjectStages = false,
  onStageEdit,
  onStageDelete,
  canManageStages = false,
  canManageTasks = true,
  canDragTasks = true,
  disableColumnScroll = false,
  onTaskReview,
  onAddTaskToStage,
  projectId,
  onAddSubtask,
  onTaskComplete,
  disableBacklogRenaming = false,
  useSubtasksGrouping = false,
  allTasks = [],
  teamMembers = [],
  departments = [],
  onRefresh
}) {
  const [draggedTask, setDraggedTask] = reactExports.useState(null);
  const [draggedOverColumn, setDraggedOverColumn] = reactExports.useState(
    null
  );
  const [viewTask, setViewTask] = reactExports.useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = reactExports.useState(false);
  const [copied, setCopied] = reactExports.useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = reactExports.useState(false);
  const [pendingComplete, setPendingComplete] = reactExports.useState(null);
  const [selectionModeStageIds, setSelectionModeStageIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [selectedTaskIds, setSelectedTaskIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = reactExports.useState(false);
  const [bulkEditStageId, setBulkEditStageId] = reactExports.useState(null);
  const [isUpdating, setIsUpdating] = reactExports.useState(false);
  const { toast } = useToast();
  const [columnSearchQueries, setColumnSearchQueries] = reactExports.useState({});
  const [columnSearchOpen, setColumnSearchOpen] = reactExports.useState({});
  const [columnDateFilters, setColumnDateFilters] = reactExports.useState({});
  const [columnCustomDateRanges, setColumnCustomDateRanges] = reactExports.useState({});
  const { currentUser, activeRole } = useUser();
  const [stageToDelete, setStageToDelete] = reactExports.useState(null);
  const boardRef = reactExports.useRef(null);
  const scrollIntervalRef = reactExports.useRef(null);
  const mouseCoords = reactExports.useRef(null);
  const confirmDeleteStage = () => {
    if (stageToDelete && onStageDelete) {
      onStageDelete(stageToDelete);
    }
    setStageToDelete(null);
  };
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText("+94 78 538 4672");
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  const handleDragStart = (task) => {
    if (!canDragTasks) return;
    setDraggedTask(task);
  };
  const handleDragOver = (e, columnId) => {
    if (!canDragTasks) return;
    e.preventDefault();
    setDraggedOverColumn(columnId);
  };
  reactExports.useEffect(() => {
    if (!draggedTask) return;
    const handleWindowDragOver = (e) => {
      e.preventDefault();
      mouseCoords.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("dragover", handleWindowDragOver);
    return () => window.removeEventListener("dragover", handleWindowDragOver);
  }, [draggedTask]);
  reactExports.useEffect(() => {
    if (!draggedTask) {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      return;
    }
    const scrollContainer = boardRef.current?.parentElement;
    if (!scrollContainer) return;
    const checkAndScroll = () => {
      if (!mouseCoords.current) return;
      const x = mouseCoords.current.x;
      const viewportWidth = window.innerWidth;
      const threshold = 180;
      const baseSpeed = 8;
      const maxSpeed = 35;
      if (x > viewportWidth - threshold) {
        const intensity = Math.min(1, (x - (viewportWidth - threshold)) / threshold);
        const speed = baseSpeed + intensity * (maxSpeed - baseSpeed);
        scrollContainer.scrollLeft += speed;
      } else if (x < threshold) {
        const intensity = Math.min(1, (threshold - x) / threshold);
        const speed = baseSpeed + intensity * (maxSpeed - baseSpeed);
        scrollContainer.scrollLeft -= speed;
      }
    };
    scrollIntervalRef.current = window.setInterval(checkAndScroll, 16);
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [draggedTask]);
  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };
  const handleDrop = (columnId) => {
    if (!canDragTasks) return;
    if (!draggedTask) return;
    let isCompleting = false;
    if (useProjectStages) {
      const stage = stages.find((s) => s.id === columnId);
      if (stage && (stage.title.toLowerCase() === "completed" || stage.title.toLowerCase() === "archive")) {
        isCompleting = true;
      }
    } else {
      if (columnId === "complete") isCompleting = true;
    }
    if (isCompleting && onTaskComplete) {
      setPendingComplete({ taskId: draggedTask.id, stageId: columnId });
      setShowCompletionDialog(true);
      setDraggedTask(null);
      setDraggedOverColumn(null);
      return;
    }
    if (useProjectStages) {
      if (draggedTask.projectStage !== columnId) {
        onTaskUpdate(draggedTask.id, { projectStage: columnId });
      }
    } else {
      const newUserStatus = columnId;
      if (draggedTask.userStatus !== newUserStatus) {
        onTaskUpdate(draggedTask.id, { userStatus: newUserStatus });
      }
    }
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };
  const handleConfirmation = (data) => {
    console.log("[uppy] kanban confirmation handler", {
      pendingComplete,
      fileCount: data.files.length,
      files: data.files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type
      })),
      linkCount: data.links.length,
      hasComment: Boolean(data.comment)
    });
    if (pendingComplete && onTaskComplete) {
      onTaskComplete(pendingComplete.taskId, pendingComplete.stageId, data);
    } else {
      console.warn("[uppy] kanban confirmation has no pending completion target", {
        pendingComplete,
        hasOnTaskComplete: Boolean(onTaskComplete)
      });
    }
    setShowCompletionDialog(false);
    setPendingComplete(null);
  };
  const toggleSelectionMode = (stageId) => {
    setSelectionModeStageIds((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
        const stageTasks = getColumnTasks(stageId).map((t) => t.id);
        setSelectedTaskIds((current) => {
          const updated = new Set(current);
          stageTasks.forEach((id) => updated.delete(id));
          return updated;
        });
      } else {
        next.add(stageId);
      }
      return next;
    });
  };
  const toggleTaskSelection = (taskId) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };
  const toggleSelectAll = (stageId) => {
    const stageTasks = getColumnTasks(stageId).map((t) => t.id);
    const allSelected = stageTasks.every((id) => selectedTaskIds.has(id));
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        stageTasks.forEach((id) => next.delete(id));
      } else {
        stageTasks.forEach((id) => next.add(id));
      }
      return next;
    });
  };
  const handleBulkEdit = (stageId) => {
    setBulkEditStageId(stageId);
    setIsBulkEditDialogOpen(true);
  };
  const onBulkSave = async (updates) => {
    if (!bulkEditStageId) return;
    const stageTaskIds = Array.from(selectedTaskIds).filter((id) => {
      const task = tasks.find((t) => t.id === id) || allTasks?.find((t) => t.id === id);
      if (!task) return false;
      if (useProjectStages) {
        return task.projectStage === bulkEditStageId;
      } else {
        return task.userStatus === bulkEditStageId;
      }
    });
    if (stageTaskIds.length === 0) return;
    setIsUpdating(true);
    try {
      const result = await taskService.bulkUpdate(stageTaskIds, updates);
      toast({
        title: "Tasks updated",
        description: `Successfully updated ${result.updated_count || stageTaskIds.length} tasks.`
      });
      toggleSelectionMode(bulkEditStageId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Bulk update failed:", error);
      toast({
        title: "Update failed",
        description: "Failed to update some tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
      setIsBulkEditDialogOpen(false);
      setBulkEditStageId(null);
    }
  };
  const getColumnTasks = (stageId) => {
    let filtered = tasks.filter((task) => {
      if (useProjectStages) {
        return task.projectStage === stageId;
      } else {
        return task.userStatus === stageId;
      }
    });
    const stage = stages.find((s) => s.id === stageId);
    const isCompletedStage = stage && (stage.title.toLowerCase().includes("completed") || stage.title.toLowerCase().includes("complete") || stage.title.toLowerCase().includes("archive"));
    const dateFilter = columnDateFilters[stageId] || (isCompletedStage ? "week" : "all");
    if (dateFilter !== "all") {
      filtered = filtered.filter((task) => {
        const dateStr = task.completedAt || task.createdAt;
        if (!dateStr) return false;
        const date = parseISO(dateStr);
        if (dateFilter === "today") return isToday(date);
        if (dateFilter === "week") return isThisWeek(date, { weekStartsOn: 1 });
        if (dateFilter === "month") return isThisMonth(date);
        if (dateFilter === "2months") {
          const twoMonthsAgo = subMonths(/* @__PURE__ */ new Date(), 2);
          return isAfter(date, twoMonthsAgo);
        }
        if (dateFilter === "custom") {
          const range = columnCustomDateRanges[stageId];
          if (!range?.from) return true;
          const start = startOfDay(range.from);
          const end = range.to ? endOfDay(range.to) : endOfDay(range.from);
          return isWithinInterval(date, { start, end });
        }
        return true;
      });
    }
    const searchQuery = columnSearchQueries[stageId];
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(lowerQuery) || t.description.toLowerCase().includes(lowerQuery)
      );
    }
    return filtered;
  };
  const visibleStages = stages.filter((stage) => {
    if (stage.title.toLowerCase().includes("suggested")) {
      const hasTasks = tasks.some((task) => {
        if (useProjectStages) {
          return task.projectStage === stage.id;
        } else {
          return task.userStatus === stage.id;
        }
      });
      return hasTasks;
    }
    return true;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: boardRef,
      className: cn("grid gap-4", !disableColumnScroll && "h-full"),
      style: {
        gridTemplateColumns: `repeat(${visibleStages.length}, minmax(400px, 1fr))`
      },
      children: [
        visibleStages.map((column) => {
          const columnTasks = getColumnTasks(column.id);
          draggedOverColumn === column.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: cn(
                "flex flex-col flex-shrink-0 rounded-lg border bg-muted/50",
                !disableColumnScroll && "max-h-full",
                draggedOverColumn === column.id && "ring-2 ring-primary/20 bg-muted",
                column.isReviewStage && "border-indigo-200 bg-indigo-50/30 dark:border-indigo-800 dark:bg-indigo-950/10"
              ),
              onDragOver: (e) => handleDragOver(e, column.id),
              onDragLeave: handleDragLeave,
              onDrop: (e) => {
                e.preventDefault();
                handleDrop(column.id);
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
                  "p-3 font-medium text-sm flex items-center justify-between border-b bg-background/50 backdrop-blur-sm rounded-t-lg group/column-header relative",
                  column.isReviewStage && "bg-indigo-50/50 dark:bg-indigo-950/20",
                  disableColumnScroll && "sticky top-0 z-10 bg-background/80 backdrop-blur-md shadow-sm"
                ), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0 mr-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-2 w-2 rounded-full shrink-0", column.color) }),
                    !columnSearchOpen[column.id] && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate whitespace-nowrap", children: column.title.toLowerCase().trim() === "pending" && !disableBacklogRenaming ? "Backlog" : column.title }),
                    !columnSearchOpen[column.id] && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "ml-1 text-xs font-normal shrink-0", children: columnTasks.length }),
                    column.isReviewStage && !columnSearchOpen[column.id] && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "ml-1 text-[10px] h-5 border-indigo-200 text-indigo-700 bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:bg-indigo-950/30 shrink-0", children: "Review" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
                    "flex items-center gap-1 transition-all duration-200 z-30",
                    !columnSearchOpen[column.id] && !selectionModeStageIds.has(column.id) ? "opacity-0 group-hover/column-header:opacity-100 absolute right-2 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm p-1 rounded-md border shadow-sm" : "opacity-100 relative"
                  ), children: [
                    (column.title === "Suggested Task" || column.title === "Suggested") && /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { delayDuration: 300, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 text-muted-foreground hover:text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-4 w-4" }) }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "top", className: "max-w-[280px] p-4 z-[100]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Client Requests" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "This stage shows tasks suggested via WhatsApp and Email clients." }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2 bg-muted rounded-md border text-xs", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono flex-1", children: "+94 78 538 4672" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              variant: "ghost",
                              size: "icon",
                              className: "h-6 w-6 hover:bg-background",
                              onClick: handleCopy,
                              children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3 text-green-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3" })
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Add this number to the WhatsApp group to receive suggestions." })
                      ] }) })
                    ] }) }),
                    canManageTasks && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex items-center transition-all duration-300 ease-in-out", columnSearchOpen[column.id] ? "w-[180px]" : "w-auto"), children: columnSearchOpen[column.id] ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full flex items-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          value: columnSearchQueries[column.id] || "",
                          onChange: (e) => setColumnSearchQueries((prev) => ({ ...prev, [column.id]: e.target.value })),
                          placeholder: "Search...",
                          className: "h-7 text-xs pr-6",
                          autoFocus: true,
                          onClick: (e) => e.stopPropagation()
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "ghost",
                          size: "icon",
                          className: "h-5 w-5 absolute right-1 hover:bg-transparent",
                          onClick: (e) => {
                            e.stopPropagation();
                            setColumnSearchQueries((prev) => ({ ...prev, [column.id]: "" }));
                            setColumnSearchOpen((prev) => ({ ...prev, [column.id]: false }));
                          },
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3 text-muted-foreground" })
                        }
                      )
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "ghost",
                        size: "icon",
                        className: "h-6 w-6",
                        onClick: (e) => {
                          e.stopPropagation();
                          setColumnSearchOpen((prev) => ({ ...prev, [column.id]: true }));
                        },
                        title: "Search tasks in this stage",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" })
                      }
                    ) }),
                    (column.title.toLowerCase().includes("completed") || column.title.toLowerCase().includes("complete") || column.title.toLowerCase().includes("archive")) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: columnDateFilters[column.id] || "week", onValueChange: (val) => setColumnDateFilters((prev) => ({ ...prev, [column.id]: val })), children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-6 w-6 p-0 border-none bg-transparent hover:bg-accent focus:ring-0 [&>svg]:hidden flex items-center justify-center hover:[&_svg]:text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-full h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-4 w-4 text-muted-foreground transition-colors" }) }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Time" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "today", children: "Today" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "week", children: "This Week" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "month", children: "This Month" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "2months", children: "This 2 Months" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "custom", children: "Custom Time Period" })
                        ] })
                      ] }),
                      columnDateFilters[column.id] === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 ml-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3 text-muted-foreground" }) }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Calendar$1,
                          {
                            initialFocus: true,
                            mode: "range",
                            defaultMonth: columnCustomDateRanges[column.id]?.from,
                            selected: columnCustomDateRanges[column.id],
                            onSelect: (range) => setColumnCustomDateRanges((prev) => ({ ...prev, [column.id]: range })),
                            numberOfMonths: 2
                          }
                        ) })
                      ] })
                    ] }),
                    canManageTasks && onAddTaskToStage && column.title.toLowerCase() !== "archive" && column.title !== "Suggested Task" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "ghost",
                        size: "icon",
                        className: "h-6 w-6",
                        onClick: () => onAddTaskToStage(column.id),
                        title: "Add task to this stage",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" })
                      }
                    ),
                    canManageStages && column.id !== "pending" && column.id !== "complete" && onStageEdit && onStageDelete && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EllipsisVertical, { className: "h-4 w-4" }) }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => onStageEdit(column), children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4 mr-2" }),
                          "Edit Stage"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          DropdownMenuItem,
                          {
                            onClick: () => setStageToDelete(column.id),
                            className: "text-destructive",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                              "Delete Stage"
                            ]
                          }
                        )
                      ] })
                    ] }),
                    (activeRole === "admin" || activeRole === "team-lead") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center border-l ml-1 pl-1 gap-1", children: selectionModeStageIds.has(column.id) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "ghost",
                          size: "sm",
                          className: "h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/10",
                          onClick: () => toggleSelectAll(column.id),
                          children: getColumnTasks(column.id).every((t) => selectedTaskIds.has(t.id)) ? "Deselect All" : "Select All"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Button,
                        {
                          variant: "default",
                          size: "sm",
                          className: "h-7 px-2 text-[10px] font-bold",
                          disabled: getColumnTasks(column.id).filter((t) => selectedTaskIds.has(t.id)).length === 0,
                          onClick: () => handleBulkEdit(column.id),
                          children: [
                            "Edit (",
                            getColumnTasks(column.id).filter((t) => selectedTaskIds.has(t.id)).length,
                            ")"
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Button,
                        {
                          variant: "ghost",
                          size: "icon",
                          className: "h-6 w-6 text-muted-foreground hover:text-destructive",
                          onClick: () => toggleSelectionMode(column.id),
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                        }
                      )
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Button,
                      {
                        variant: "ghost",
                        size: "sm",
                        className: "h-7 px-2 text-[10px] font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 group/bulk",
                        onClick: () => toggleSelectionMode(column.id),
                        title: "Bulk Edit Tasks",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-3.5 w-3.5 mr-1" }),
                          "Bulk Edit"
                        ]
                      }
                    ) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex-1 p-4 space-y-3 min-h-[400px]", !disableColumnScroll && "overflow-y-auto"), children: columnTasks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-32 text-sm text-muted-foreground", children: columnSearchQueries[column.id] ? "No matching tasks" : "No tasks" }) : useSubtasksGrouping ? Object.values(columnTasks.reduce((acc, task) => {
                  const parentId = task.parentId || task.id;
                  if (!acc[parentId]) acc[parentId] = [];
                  acc[parentId].push(task);
                  return acc;
                }, {})).map((groupTasks) => {
                  const parentId = groupTasks[0].parentId || groupTasks[0].id;
                  const isSubtaskGroup = groupTasks.some((t) => t.parentId === parentId);
                  if (isSubtaskGroup) {
                    const parentTask = allTasks.find((t) => t.id === parentId) || tasks.find((t) => t.id === parentId);
                    const parentInColumn = groupTasks.find((t) => t.id === parentId);
                    const subtasks = groupTasks.filter((t) => t.parentId === parentId);
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md p-2 bg-card/40 dark:bg-card/20 space-y-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2 pb-2 border-b border-border/50", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 p-1 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-3 w-3 text-primary" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-muted-foreground truncate", title: parentTask?.title, children: parentTask?.title || "Parent Task" })
                      ] }),
                      parentInColumn && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        TaskCard,
                        {
                          task: parentInColumn,
                          onDragStart: () => handleDragStart(parentInColumn),
                          onEdit: () => onTaskEdit(parentInColumn),
                          onDelete: () => onTaskDelete(parentInColumn.id),
                          onView: () => {
                            setViewTask(parentInColumn);
                            setIsViewDialogOpen(true);
                          },
                          onReviewTask: onTaskReview ? () => onTaskReview(parentInColumn) : void 0,
                          canManage: canManageTasks,
                          canDrag: canDragTasks,
                          currentStage: column,
                          projectId,
                          onAddSubtask: onAddSubtask ? () => onAddSubtask(parentInColumn) : void 0,
                          onViewSubtask: (subtask) => {
                            setViewTask(subtask);
                            setIsViewDialogOpen(true);
                          },
                          onTaskUpdate,
                          allStages: stages,
                          isSelectionMode: selectionModeStageIds.has(column.id),
                          isSelected: selectedTaskIds.has(parentInColumn.id),
                          onToggleSelection: toggleTaskSelection,
                          onRefresh
                        },
                        parentInColumn.id
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 pl-2 border-l-2 border-primary/20", children: subtasks.map((task) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        TaskCard,
                        {
                          task,
                          onDragStart: () => handleDragStart(task),
                          onEdit: () => onTaskEdit(task),
                          onDelete: () => onTaskDelete(task.id),
                          onView: () => {
                            setViewTask(task);
                            setIsViewDialogOpen(true);
                          },
                          onReviewTask: onTaskReview ? () => onTaskReview(task) : void 0,
                          canManage: canManageTasks,
                          canDrag: canDragTasks,
                          currentStage: column,
                          projectId,
                          onAddSubtask: onAddSubtask ? () => onAddSubtask(task) : void 0,
                          onViewSubtask: (subtask) => {
                            setViewTask(subtask);
                            setIsViewDialogOpen(true);
                          },
                          onTaskUpdate,
                          allStages: stages,
                          isSelectionMode: selectionModeStageIds.has(column.id),
                          isSelected: selectedTaskIds.has(task.id),
                          onToggleSelection: toggleTaskSelection,
                          onRefresh
                        },
                        task.id
                      )) })
                    ] }, `group-${parentId}`);
                  } else {
                    return groupTasks.map((task) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                      TaskCard,
                      {
                        task,
                        onDragStart: () => handleDragStart(task),
                        onEdit: () => onTaskEdit(task),
                        onDelete: () => onTaskDelete(task.id),
                        onView: () => {
                          setViewTask(task);
                          setIsViewDialogOpen(true);
                        },
                        onReviewTask: onTaskReview ? () => onTaskReview(task) : void 0,
                        canManage: canManageTasks,
                        canDrag: canDragTasks,
                        currentStage: column,
                        projectId,
                        onAddSubtask: onAddSubtask ? () => onAddSubtask(task) : void 0,
                        onViewSubtask: (subtask) => {
                          setViewTask(subtask);
                          setIsViewDialogOpen(true);
                        },
                        onTaskUpdate,
                        allStages: stages,
                        isSelectionMode: selectionModeStageIds.has(column.id),
                        isSelected: selectedTaskIds.has(task.id),
                        onToggleSelection: toggleTaskSelection,
                        onRefresh
                      },
                      task.id
                    ));
                  }
                }) : columnTasks.map((task) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TaskCard,
                  {
                    task,
                    onDragStart: () => handleDragStart(task),
                    onEdit: () => onTaskEdit(task),
                    onDelete: () => onTaskDelete(task.id),
                    onView: () => {
                      setViewTask(task);
                      setIsViewDialogOpen(true);
                    },
                    onReviewTask: onTaskReview ? () => onTaskReview(task) : void 0,
                    canManage: canManageTasks,
                    canDrag: canDragTasks,
                    currentStage: column,
                    projectId,
                    onAddSubtask: onAddSubtask ? () => onAddSubtask(task) : void 0,
                    onViewSubtask: (subtask) => {
                      setViewTask(subtask);
                      setIsViewDialogOpen(true);
                    },
                    onTaskUpdate,
                    allStages: stages,
                    isSelectionMode: selectionModeStageIds.has(column.id),
                    isSelected: selectedTaskIds.has(task.id),
                    onToggleSelection: toggleTaskSelection,
                    onRefresh
                  },
                  task.id
                )) })
              ]
            },
            column.id
          );
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TaskDetailsDialog,
          {
            task: viewTask,
            open: isViewDialogOpen,
            onOpenChange: setIsViewDialogOpen,
            onEdit: canManageTasks && viewTask ? () => {
              setIsViewDialogOpen(false);
              onTaskEdit(viewTask);
            } : void 0
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TaskCompletionDialog,
          {
            open: showCompletionDialog,
            onOpenChange: setShowCompletionDialog,
            onConfirm: handleConfirmation,
            taskTitle: pendingComplete ? tasks.find((t) => t.id === pendingComplete.taskId)?.title : void 0
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!stageToDelete, onOpenChange: (open) => !open && setStageToDelete(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Stage" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Are you sure you want to delete this stage? Tasks in this stage will need to be moved to another stage." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                onClick: confirmDeleteStage,
                className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                children: "Delete"
              }
            )
          ] })
        ] }) }),
        bulkEditStageId && /* @__PURE__ */ jsxRuntimeExports.jsx(
          BulkEditDialog,
          {
            open: isBulkEditDialogOpen,
            onOpenChange: setIsBulkEditDialogOpen,
            onSave: onBulkSave,
            selectedCount: getColumnTasks(bulkEditStageId).filter((t) => selectedTaskIds.has(t.id)).length,
            teamMembers: teamMembers || [],
            departments: departments || []
          }
        )
      ]
    }
  );
}
const priorities = ["low", "medium", "high"];
function TaskListView({
  tasks,
  stages,
  teamMembers,
  departments = [],
  onTaskEdit,
  onTaskDelete,
  onTaskUpdate,
  showAssigneeColumn = true,
  showProjectColumn = false,
  canManage = true,
  canUpdateStage,
  // If not provided, defaults to canManage value
  onTaskReview,
  showReviewButton = false
}) {
  const allowStageUpdate = canUpdateStage !== void 0 ? canUpdateStage : canManage;
  const { currentUser, activeRole } = useUser();
  const canEditDate = activeRole === "admin" || activeRole === "team-lead" || activeRole === "account-manager";
  const [viewTask, setViewTask] = reactExports.useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = reactExports.useState(false);
  const [sortConfig, setSortConfig] = reactExports.useState({ key: null, direction: null });
  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current.key === key) {
        if (current.direction === "asc") return { key, direction: "desc" };
        if (current.direction === "desc") return { key: null, direction: null };
        return { key, direction: "asc" };
      }
      return { key, direction: "asc" };
    });
  };
  const getDepartmentName = (departmentId) => {
    return departments.find((dep) => dep.id === departmentId)?.name || "Uncategorized";
  };
  const memberOptions = reactExports.useMemo(() => {
    const options = teamMembers.filter((member) => member.is_active !== false).map((member) => ({
      value: String(member.id),
      label: member.name,
      group: getDepartmentName(member.department)
    }));
    options.unshift({
      value: "unassigned",
      label: "Unassigned",
      group: "General"
    });
    return options;
  }, [teamMembers, departments]);
  const sortedTasks = reactExports.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return tasks;
    return [...tasks].sort((a, b) => {
      const direction = sortConfig.direction === "asc" ? 1 : -1;
      switch (sortConfig.key) {
        case "title":
          return direction * a.title.localeCompare(b.title);
        case "project":
          return direction * (a.project || "").localeCompare(b.project || "");
        case "assignee":
          return direction * (a.assignee || "").localeCompare(b.assignee || "");
        case "dueDate":
          return direction * (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        case "priority": {
          const priorityMap = { high: 3, medium: 2, low: 1 };
          const pA = priorityMap[a.priority] || 0;
          const pB = priorityMap[b.priority] || 0;
          return direction * (pA - pB);
        }
        case "stage": {
          const stageA = stages.find((s) => s.id === a.projectStage)?.title || "";
          const stageB = stages.find((s) => s.id === b.projectStage)?.title || "";
          return direction * stageA.localeCompare(stageB);
        }
        default:
          return 0;
      }
    });
  }, [tasks, sortConfig, stages]);
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "ml-2 h-4 w-4 opacity-50" });
    if (sortConfig.direction === "asc") return /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "ml-2 h-4 w-4" });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "ml-2 h-4 w-4" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TableHead,
          {
            className: "cursor-pointer hover:bg-muted/50 transition-colors",
            onClick: () => handleSort("title"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              "Title",
              /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { columnKey: "title" })
            ] })
          }
        ),
        showProjectColumn && /* @__PURE__ */ jsxRuntimeExports.jsx(
          TableHead,
          {
            className: "cursor-pointer hover:bg-muted/50 transition-colors",
            onClick: () => handleSort("project"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              "Project",
              /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { columnKey: "project" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TableHead,
          {
            className: "cursor-pointer hover:bg-muted/50 transition-colors",
            onClick: () => handleSort("priority"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              "Priority",
              /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { columnKey: "priority" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TableHead,
          {
            className: "cursor-pointer hover:bg-muted/50 transition-colors",
            onClick: () => handleSort("stage"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              "Stage",
              /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { columnKey: "stage" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TableHead,
          {
            className: "cursor-pointer hover:bg-muted/50 transition-colors",
            onClick: () => handleSort("dueDate"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              "Due Date",
              /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { columnKey: "dueDate" })
            ] })
          }
        ),
        showAssigneeColumn && /* @__PURE__ */ jsxRuntimeExports.jsx(
          TableHead,
          {
            className: "cursor-pointer hover:bg-muted/50 transition-colors",
            onClick: () => handleSort("assignee"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              "Assignee",
              /* @__PURE__ */ jsxRuntimeExports.jsx(SortIcon, { columnKey: "assignee" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sortedTasks.map((task) => {
        const rawDueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isDateValid = rawDueDate && !isNaN(rawDueDate.getTime());
        const dueDate = isDateValid ? rawDueDate : null;
        const currentStage = stages.find((s) => s.id === task.projectStage);
        const isStageCompleted = currentStage?.title === "Completed" || currentStage?.title === "Complete";
        const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && task.userStatus !== "complete" && !isStageCompleted;
        const currentAssigneeUser = teamMembers.find((u) => u.name === task.assignee);
        const currentAssigneeValue = currentAssigneeUser ? String(currentAssigneeUser.id) : task.assignee ? void 0 : "unassigned";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "h-12", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "font-medium py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: task.title }),
              task.isLocked && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-700 border border-orange-500/20", title: `Task is locked due to project status${task.previousStatus ? ` (was: ${task.previousStatus})` : ""}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
                "Locked"
              ] })
            ] }),
            task.tags && task.tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: task.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: cn(
                  "text-xs px-1.5 py-0.5 rounded bg-secondary",
                  tag === "Redo" && "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                ),
                children: tag
              },
              tag
            )) }),
            task.revisionComment && task.tags?.includes("Redo") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-1.5 rounded", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Revision: " }),
              task.revisionComment
            ] })
          ] }) }),
          showProjectColumn && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: task.project }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: task.priority,
              onValueChange: (value) => onTaskUpdate(task.id, { priority: value }),
              disabled: !canManage,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select priority" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: priorities.map((priority) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: priority, children: priority }, priority)) })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: task.projectStage || "",
              onValueChange: (value) => onTaskUpdate(task.id, { projectStage: value }),
              disabled: !allowStageUpdate,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 [&>span]:truncate", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select stage" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: stages.map((stage) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: stage.id, children: stage.title.toLowerCase().trim() === "pending" ? "Backlog" : stage.title }, stage.id)) })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: canEditDate ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                className: cn(
                  "w-[180px] h-8 justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground",
                  isOverdue && "text-status-overdue",
                  dueDate && isToday(dueDate) && "text-primary"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "mr-2 h-4 w-4" }),
                  dueDate ? format(dueDate, "MMM dd, yyyy") : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pick a date" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-auto p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Calendar$1,
              {
                mode: "single",
                selected: dueDate || void 0,
                onSelect: (date) => onTaskUpdate(task.id, {
                  dueDate: date?.toISOString()
                }),
                initialFocus: true
              }
            ) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                isOverdue && "text-status-overdue font-medium",
                dueDate && isToday(dueDate) && "text-primary font-medium"
              ),
              children: dueDate ? format(dueDate, "MMM dd, yyyy") : "No date"
            }
          ) }),
          showAssigneeColumn && /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2 max-w-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SearchableSelect,
            {
              value: currentAssigneeValue,
              onValueChange: (value) => {
                let newAssigneeName = "";
                if (value !== "unassigned") {
                  const selectedMember = teamMembers.find((m) => String(m.id) === value);
                  if (selectedMember) newAssigneeName = selectedMember.name;
                }
                onTaskUpdate(task.id, { assignee: newAssigneeName });
              },
              options: (() => {
                if (currentAssigneeUser && currentAssigneeUser.is_active === false) {
                  return [...memberOptions, {
                    value: String(currentAssigneeUser.id),
                    label: currentAssigneeUser.name + " (Deactivated)",
                    group: "Deactivated"
                  }];
                }
                return memberOptions;
              })(),
              placeholder: "Unassigned",
              disabled: !canManage,
              className: "h-8"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-8 w-8",
                onClick: () => {
                  setViewTask(task);
                  setIsViewDialogOpen(true);
                },
                title: "View details",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
              }
            ),
            showReviewButton && task.isInSpecificStage && onTaskReview && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "h-8",
                onClick: () => onTaskReview(task),
                title: "Review task",
                children: "Review Task"
              }
            ),
            canManage && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8",
                  onClick: () => onTaskEdit(task),
                  title: "Edit task",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8",
                  onClick: () => onTaskDelete(task.id),
                  title: "Delete task",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                }
              )
            ] })
          ] }) })
        ] }, task.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TaskDetailsDialog,
      {
        task: viewTask,
        open: isViewDialogOpen,
        onOpenChange: setIsViewDialogOpen
      }
    )
  ] });
}
var NAME = "Toggle";
var Toggle$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { pressed: pressedProp, defaultPressed, onPressedChange, ...buttonProps } = props;
  const [pressed, setPressed] = useControllableState({
    prop: pressedProp,
    onChange: onPressedChange,
    defaultProp: defaultPressed ?? false,
    caller: NAME
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.button,
    {
      type: "button",
      "aria-pressed": pressed,
      "data-state": pressed ? "on" : "off",
      "data-disabled": props.disabled ? "" : void 0,
      ...buttonProps,
      ref: forwardedRef,
      onClick: composeEventHandlers(props.onClick, () => {
        if (!props.disabled) {
          setPressed(!pressed);
        }
      })
    }
  );
});
Toggle$1.displayName = NAME;
var Root = Toggle$1;
var TOGGLE_GROUP_NAME = "ToggleGroup";
var [createToggleGroupContext] = createContextScope(TOGGLE_GROUP_NAME, [
  createRovingFocusGroupScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var ToggleGroup$1 = React.forwardRef((props, forwardedRef) => {
  const { type, ...toggleGroupProps } = props;
  if (type === "single") {
    const singleProps = toggleGroupProps;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupImplSingle, { ...singleProps, ref: forwardedRef });
  }
  if (type === "multiple") {
    const multipleProps = toggleGroupProps;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupImplMultiple, { ...multipleProps, ref: forwardedRef });
  }
  throw new Error(`Missing prop \`type\` expected on \`${TOGGLE_GROUP_NAME}\``);
});
ToggleGroup$1.displayName = TOGGLE_GROUP_NAME;
var [ToggleGroupValueProvider, useToggleGroupValueContext] = createToggleGroupContext(TOGGLE_GROUP_NAME);
var ToggleGroupImplSingle = React.forwardRef((props, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange = () => {
    },
    ...toggleGroupSingleProps
  } = props;
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? "",
    onChange: onValueChange,
    caller: TOGGLE_GROUP_NAME
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ToggleGroupValueProvider,
    {
      scope: props.__scopeToggleGroup,
      type: "single",
      value: React.useMemo(() => value ? [value] : [], [value]),
      onItemActivate: setValue,
      onItemDeactivate: React.useCallback(() => setValue(""), [setValue]),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupImpl, { ...toggleGroupSingleProps, ref: forwardedRef })
    }
  );
});
var ToggleGroupImplMultiple = React.forwardRef((props, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange = () => {
    },
    ...toggleGroupMultipleProps
  } = props;
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? [],
    onChange: onValueChange,
    caller: TOGGLE_GROUP_NAME
  });
  const handleButtonActivate = React.useCallback(
    (itemValue) => setValue((prevValue = []) => [...prevValue, itemValue]),
    [setValue]
  );
  const handleButtonDeactivate = React.useCallback(
    (itemValue) => setValue((prevValue = []) => prevValue.filter((value2) => value2 !== itemValue)),
    [setValue]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ToggleGroupValueProvider,
    {
      scope: props.__scopeToggleGroup,
      type: "multiple",
      value,
      onItemActivate: handleButtonActivate,
      onItemDeactivate: handleButtonDeactivate,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupImpl, { ...toggleGroupMultipleProps, ref: forwardedRef })
    }
  );
});
ToggleGroup$1.displayName = TOGGLE_GROUP_NAME;
var [ToggleGroupContext$1, useToggleGroupContext] = createToggleGroupContext(TOGGLE_GROUP_NAME);
var ToggleGroupImpl = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeToggleGroup,
      disabled = false,
      rovingFocus = true,
      orientation,
      dir,
      loop = true,
      ...toggleGroupProps
    } = props;
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeToggleGroup);
    const direction = useDirection(dir);
    const commonProps = { role: "group", dir: direction, ...toggleGroupProps };
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupContext$1, { scope: __scopeToggleGroup, rovingFocus, disabled, children: rovingFocus ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Root$1,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation,
        dir: direction,
        loop,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { ...commonProps, ref: forwardedRef })
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { ...commonProps, ref: forwardedRef }) });
  }
);
var ITEM_NAME = "ToggleGroupItem";
var ToggleGroupItem$1 = React.forwardRef(
  (props, forwardedRef) => {
    const valueContext = useToggleGroupValueContext(ITEM_NAME, props.__scopeToggleGroup);
    const context = useToggleGroupContext(ITEM_NAME, props.__scopeToggleGroup);
    const rovingFocusGroupScope = useRovingFocusGroupScope(props.__scopeToggleGroup);
    const pressed = valueContext.value.includes(props.value);
    const disabled = context.disabled || props.disabled;
    const commonProps = { ...props, pressed, disabled };
    const ref = React.useRef(null);
    return context.rovingFocus ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: pressed,
        ref,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItemImpl, { ...commonProps, ref: forwardedRef })
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItemImpl, { ...commonProps, ref: forwardedRef });
  }
);
ToggleGroupItem$1.displayName = ITEM_NAME;
var ToggleGroupItemImpl = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeToggleGroup, value, ...itemProps } = props;
    const valueContext = useToggleGroupValueContext(ITEM_NAME, __scopeToggleGroup);
    const singleProps = { role: "radio", "aria-checked": props.pressed, "aria-pressed": void 0 };
    const typeProps = valueContext.type === "single" ? singleProps : void 0;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Toggle$1,
      {
        ...typeProps,
        ...itemProps,
        ref: forwardedRef,
        onPressedChange: (pressed) => {
          if (pressed) {
            valueContext.onItemActivate(value);
          } else {
            valueContext.onItemDeactivate(value);
          }
        }
      }
    );
  }
);
var Root2 = ToggleGroup$1;
var Item2 = ToggleGroupItem$1;
const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Toggle = reactExports.forwardRef(({ className, variant, size, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { ref, className: cn(toggleVariants({ variant, size, className })), ...props }));
Toggle.displayName = Root.displayName;
const ToggleGroupContext = reactExports.createContext({
  size: "default",
  variant: "default"
});
const ToggleGroup = reactExports.forwardRef(({ className, variant, size, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Root2, { ref, className: cn("flex items-center justify-center gap-1", className), ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupContext.Provider, { value: { variant, size }, children }) }));
ToggleGroup.displayName = Root2.displayName;
const ToggleGroupItem = reactExports.forwardRef(({ className, children, variant, size, ...props }, ref) => {
  const context = reactExports.useContext(ToggleGroupContext);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Item2,
    {
      ref,
      className: cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size
        }),
        className
      ),
      ...props,
      children
    }
  );
});
ToggleGroupItem.displayName = Item2.displayName;
export {
  KanbanBoard as K,
  LayoutGrid as L,
  ToggleGroup as T,
  ToggleGroupItem as a,
  TaskListView as b
};
