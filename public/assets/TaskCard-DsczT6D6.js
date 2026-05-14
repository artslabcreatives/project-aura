import { ad as createLucideIcon, u as useNavigate, F as useToast, l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, B as Button, C as CircleAlert, ai as Separator, Y as Badge, ag as User, z as cn, ak as ExternalLink, al as Eye, U as DialogFooter, X, bc as useQuery, O as DialogDescription, L as LoaderCircle, A as ScrollArea, aj as FileText, w as taskService, az as TriangleAlert, Q as Label, i as isPast, v as useUser, ab as useLocation, aS as Popover, aT as PopoverTrigger, aU as PopoverContent, bd as Users, aN as TooltipProvider, aO as Tooltip, aP as TooltipTrigger, aQ as TooltipContent, aR as Copy, a2 as Trash2, aq as Lock, aE as History, P as Plus, q as Check, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription } from "./index-C4ZP3eFM.js";
import { T as Tag, b as TimeLogWidget, a as attachmentService } from "./attachmentService-B1K5TSm1.js";
import { S as SquarePen } from "./square-pen-Dr9mhwBZ.js";
import { i as isValid, f as format } from "./format-BDODTvac.js";
import { C as Clock } from "./clock-C-1UQMq-.js";
import { C as Calendar } from "./calendar-B2-LyEnc.js";
import { P as Paperclip } from "./paperclip-DDW-rwXv.js";
import { P as Play } from "./play-BwxbIHvy.js";
import { D as Download } from "./download-qf94484n.js";
import { A as ArrowRight } from "./arrow-right-TrnDYsFi.js";
import { C as Card, a as CardHeader, c as CardContent } from "./card-5_9pbgKs.js";
import { C as Checkbox } from "./checkbox-qHm_4cmk.js";
import { C as CircleCheckBig } from "./circle-check-big-Cwck6DPV.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { L as Link } from "./link-CjUUS0B-.js";
import { G as Globe } from "./globe-CuQXKfU6.js";
import { L as ListTodo } from "./list-todo-B9y_ixvA.js";
import { a as isToday } from "./isToday-RL2Fg3s3.js";
const ClipboardCheck = createLucideIcon("ClipboardCheck", [
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      key: "116196"
    }
  ],
  ["path", { d: "m9 14 2 2 4-4", key: "df797q" }]
]);
const ScrollText = createLucideIcon("ScrollText", [
  ["path", { d: "M15 12h-5", key: "r7krc0" }],
  ["path", { d: "M15 8h-5", key: "1khuty" }],
  ["path", { d: "M19 17V5a2 2 0 0 0-2-2H4", key: "zz82l3" }],
  [
    "path",
    {
      d: "M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",
      key: "1ph1d7"
    }
  ]
]);
const Share2 = createLucideIcon("Share2", [
  ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }],
  ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }],
  ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }],
  ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" }],
  ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" }]
]);
const SquareCheckBig = createLucideIcon("SquareCheckBig", [
  ["path", { d: "M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5", key: "1uzm8b" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
]);
const Zap = createLucideIcon("Zap", [
  [
    "path",
    {
      d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      key: "1xq2db"
    }
  ]
]);
function TaskDetailsDialog({ task, open, onOpenChange, onTaskUpdate, onEdit }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewingAttachment, setViewingAttachment] = reactExports.useState(null);
  const [isResolvingUrl, setIsResolvingUrl] = reactExports.useState(false);
  if (!task) return null;
  const isVideo = (name) => {
    const ext = name.split(".").pop()?.toLowerCase();
    return ["mp4", "webm", "ogg", "mov", "m4v"].includes(ext || "");
  };
  const isImage = (name) => {
    const ext = name.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
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
  const handleView = async (attachment) => {
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
  const priorityColors = {
    low: "bg-priority-low/10 text-priority-low border-priority-low/20",
    medium: "bg-priority-medium/10 text-priority-medium border-priority-medium/20",
    high: "bg-priority-high/10 text-priority-high border-priority-high/20"
  };
  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    "in-progress": "bg-blue-500/10 text-blue-700 border-blue-500/20",
    complete: "bg-green-500/10 text-green-700 border-green-500/20"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[650px] max-h-[90vh] overflow-y-auto flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-2xl font-bold flex-1 pr-4", children: task.title }),
        onEdit && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: onEdit, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4 mr-2" }),
          "Edit"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 flex-1", children: [
        task.revisionComment && task.tags?.includes("Redo") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500 dark:border-amber-600 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2", children: "Revision Requested" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-800 dark:text-amber-200 whitespace-pre-wrap", children: task.revisionComment })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {})
        ] }),
        task.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-2", children: "Description" }),
          /<\/?[a-z][\s\S]*>/i.test(task.description) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5",
              dangerouslySetInnerHTML: { __html: task.description }
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap", children: task.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-2", children: "Project" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-sm", children: task.project })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-2 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }),
              "Assigned To"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: task.assignee })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-2", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: cn("text-sm capitalize", statusColors[task.userStatus]),
                children: task.userStatus.replace("-", " ")
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-2", children: "Priority" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: cn("text-sm capitalize", priorityColors[task.priority]),
                children: task.priority || "Medium"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Timeline" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            task.startDate && (() => {
              const dateTimeParts = task.startDate.split("T");
              const datePart = dateTimeParts[0];
              const timePart = dateTimeParts[1]?.substring(0, 5) || "00:00";
              const startDate = /* @__PURE__ */ new Date(`${datePart}T${timePart}`);
              return isValid(startDate) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-muted-foreground" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Start:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: format(startDate, "MMM dd, yyyy 'at' hh:mm a") })
              ] }) : null;
            })(),
            (() => {
              const dateTimeParts = task.dueDate?.split("T") || [];
              const datePart = dateTimeParts[0];
              const timePart = dateTimeParts[1]?.substring(0, 5) || "00:00";
              const dueDate = datePart ? /* @__PURE__ */ new Date(`${datePart}T${timePart}`) : null;
              return dueDate && isValid(dueDate) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "End:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: format(dueDate, "MMM dd, yyyy 'at' hh:mm a") })
              ] }) : null;
            })(),
            (() => {
              const createdAt = task.createdAt ? new Date(task.createdAt) : null;
              return createdAt && isValid(createdAt) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Created:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: format(createdAt, "MMM dd, yyyy 'at' hh:mm a") })
              ] }) : null;
            })()
          ] })
        ] }),
        task.tags && task.tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "h-4 w-4" }),
            "Tags"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: task.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "secondary",
              className: cn(
                tag === "Redo" && "bg-amber-500/10 text-amber-700 border-amber-500/20"
              ),
              children: tag
            },
            tag
          )) })
        ] }),
        task.attachments && task.attachments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4" }),
            "Attachments (",
            task.attachments.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: task.attachments.map((attachment) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between p-3 border rounded-md hover:bg-accent transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [
                  attachment.type === "link" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 text-muted-foreground flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4 text-muted-foreground flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: attachment.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: (() => {
                      const uploadedAt = attachment.uploadedAt ? new Date(attachment.uploadedAt) : null;
                      return uploadedAt && isValid(uploadedAt) ? format(uploadedAt, "MMM dd, yyyy") : "Unknown date";
                    })() })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                  (isImage(attachment.name) || isVideo(attachment.name)) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      onClick: () => handleView(attachment),
                      disabled: isResolvingUrl,
                      children: [
                        isVideo(attachment.name) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 mr-1" }),
                        "View"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "sm",
                      onClick: () => handleDownload(attachment.id, attachment.name),
                      children: attachment.type === "link" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
                        "Open"
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
                        "Download"
                      ] })
                    }
                  )
                ] })
              ]
            },
            attachment.id
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TimeLogWidget, { taskId: parseInt(task.id) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { className: "mt-6 sm:justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          className: "w-full sm:w-auto",
          onClick: () => {
            onOpenChange(false);
            navigate(`/tasks/${task.id}`);
          },
          children: [
            "View Full Details ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewingAttachment, onOpenChange: (open2) => !open2 && setViewingAttachment(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { hideCloseButton: true, className: "sm:max-w-[800px] p-0 overflow-hidden bg-black/90 border-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
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
function TaskHistoryDialog({ taskId, open, onOpenChange, taskTitle }) {
  const { data, isLoading } = useQuery({
    queryKey: ["taskHistory", taskId],
    queryFn: () => taskService.getHistory(taskId),
    enabled: open
  });
  const getActionIcon = (action) => {
    switch (action) {
      case "created":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4 text-green-500" });
      case "completed":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4 text-green-600" });
      case "updated":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4 text-blue-500" });
      case "stage_changed":
      case "moved_to_review_stage":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 text-orange-500" });
      case "attachment_added":
      case "attachment_removed":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4 text-purple-500" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-gray-500" });
    }
  };
  const getActionLabel = (action) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[600px] max-h-[80vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Task History" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "History for task: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: taskTitle })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-hidden mt-4", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[60vh] pr-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6 pl-2", children: data && data.data.length > 0 ? data.data.map((history, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex gap-4 pb-2", children: [
      index !== data.data.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-[0.95rem] top-8 bottom-[-1.5rem] w-px bg-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm"
      ), children: getActionIcon(history.action) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: getActionLabel(history.action) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] font-normal text-muted-foreground", children: format(new Date(history.createdAt), "MMM d, yyyy 'at' h:mm a") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: history.details }),
        history.user && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mt-1 text-xs text-muted-foreground bg-muted/50 w-fit px-2 py-0.5 rounded-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: history.user.name })
        ] }),
        history.previousDetails && history.action === "updated" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xs bg-muted/50 p-2 rounded border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium mb-1", children: "Changes:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-disc list-inside space-y-0.5", children: Object.entries(history.previousDetails).map(([key, value]) => {
            if (key.startsWith("old_")) return null;
            if (key.startsWith("new_")) {
              const fieldName = key.replace("new_", "");
              const oldValue = history.previousDetails["old_" + fieldName];
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "break-all", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                  fieldName,
                  ":"
                ] }),
                " ",
                String(oldValue),
                " → ",
                String(value)
              ] }, key);
            }
            return null;
          }) })
        ] })
      ] })
    ] }, history.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-10 text-muted-foreground", children: "No history recorded for this task." }) }) }) })
  ] }) });
}
function EarlyStartDialog({
  task,
  stages,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false
}) {
  const [acknowledged, setAcknowledged] = reactExports.useState(false);
  const [selectedStageId, setSelectedStageId] = reactExports.useState("");
  const availableStages = stages.filter((stage) => {
    const title = stage.title.toLowerCase();
    const isPending = title === "pending" || title === "backlog";
    const isComplete = title.includes("complete") || title.includes("archive") || title.includes("done");
    const isSuggested = title.includes("suggested");
    return !stage.isReviewStage && !isPending && !isComplete && !isSuggested;
  });
  const handleConfirm = () => {
    if (acknowledged && selectedStageId) {
      onConfirm(selectedStageId);
    }
  };
  const resetState = () => {
    setAcknowledged(false);
    setSelectedStageId("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (val) => {
    if (!val) resetState();
    onOpenChange(val);
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-full bg-amber-100 dark:bg-amber-900/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-5 w-5 text-amber-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Early Task Start" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "text-amber-700 dark:text-amber-400 font-medium", children: [
        "Project: ",
        task.project
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-amber-600 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-800 dark:text-amber-200", children: "Before proceeding, please inform your team lead or authorized person that you are going to start this task early." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Checkbox,
          {
            id: "acknowledge",
            checked: acknowledged,
            onCheckedChange: (checked) => setAcknowledged(checked)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "acknowledge",
            className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            children: "I have informed my team lead or authorized person."
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "stage", className: "text-sm font-medium", children: "Select Start Stage" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: selectedStageId,
            onValueChange: setSelectedStageId,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "stage", className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose a stage..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: availableStages.map((stage) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: stage.id, children: stage.title }, stage.id)) })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          onClick: () => onOpenChange(false),
          disabled: isLoading,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleConfirm,
          disabled: !acknowledged || !selectedStageId || isLoading,
          className: "bg-amber-600 hover:bg-amber-700 text-white",
          children: isLoading ? "Starting..." : "Early Start"
        }
      )
    ] })
  ] }) });
}
function TaskCard({
  task,
  onDragStart,
  onEdit,
  onDelete,
  onView,
  onReviewTask,
  canManage = true,
  currentStage,
  canDrag = true,
  projectId,
  onAddSubtask,
  onViewSubtask,
  onTaskUpdate,
  allStages = [],
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  onRefresh
}) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isValidDueDate = dueDate && isValid(dueDate);
  const isCompleteStage = currentStage?.title?.toLowerCase() === "complete" || currentStage?.title?.toLowerCase() === "completed" || currentStage?.title?.toLowerCase() === "archive";
  const isTaskComplete = task.userStatus === "complete" || isCompleteStage;
  const isOverdue = isValidDueDate && isPast(dueDate) && !isToday(dueDate) && !isTaskComplete;
  const [showRevisionHistoryDialog, setShowRevisionHistoryDialog] = reactExports.useState(false);
  const [showTaskHistoryDialog, setShowTaskHistoryDialog] = reactExports.useState(false);
  const [showSubtasks, setShowSubtasks] = reactExports.useState(false);
  const [isEarlyStartDialogOpen, setIsEarlyStartDialogOpen] = reactExports.useState(false);
  const [isEarlyStarting, setIsEarlyStarting] = reactExports.useState(false);
  const [timeLeft, setTimeLeft] = reactExports.useState("");
  const [isShareOpen, setIsShareOpen] = reactExports.useState(false);
  const { toast } = useToast();
  const { currentUser, activeRole } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDuplicating, setIsDuplicating] = reactExports.useState(false);
  const [subtaskToDelete, setSubtaskToDelete] = reactExports.useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = reactExports.useState(false);
  const isProjectView = location.pathname.includes("/project/");
  const hasStartedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (currentStage?.title !== "Pending" || !task.startDate || !projectId) {
      setTimeLeft("");
      return;
    }
    const calculateTimeLeft = () => {
      if (!task.startDate) return;
      const dateStr = task.startDate;
      const parts = dateStr.split("T");
      const datePart = parts[0];
      const timePart = parts[1] ? parts[1].substring(0, 8) : "00:00:00";
      const targetDateStr = `${datePart}T${timePart}+05:30`;
      const start = new Date(targetDateStr);
      const now = /* @__PURE__ */ new Date();
      const diff = start.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft("Starting...");
        if (!hasStartedRef.current) {
          if (activeRole === "admin" || activeRole === "team-lead") {
            hasStartedRef.current = true;
            taskService.start(task.id).then((updatedTask) => {
              toast({
                title: "Task Started",
                description: "Task has been moved to the active stage."
              });
              if (onTaskUpdate) {
                onTaskUpdate(updatedTask.id, updatedTask);
              }
            }).catch((err) => {
              console.error("Failed to auto-start task:", err);
              hasStartedRef.current = false;
            });
          }
        }
        return;
      }
      const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
      const hours = Math.floor(diff % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60));
      const minutes = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
      const seconds = Math.floor(diff % (1e3 * 60) / 1e3);
      const timeParts = [];
      if (days > 0) timeParts.push(`${days}d`);
      if (hours > 0) timeParts.push(`${hours}h`);
      timeParts.push(`${minutes}m`);
      timeParts.push(`${seconds}s`);
      setTimeLeft(timeParts.join(" "));
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1e3);
    return () => clearInterval(timer);
  }, [task.startDate, currentStage, task.id, toast, onView, projectId]);
  const handleCopyLink = () => {
    const pId = projectId || task.projectId;
    if (!pId) {
      toast({ title: "Error", description: "Project ID not available", variant: "destructive" });
      return;
    }
    const url = `${window.location.protocol}//${window.location.host}/project/${pId}?task=${task.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: "Task link copied to clipboard" });
    setIsShareOpen(false);
  };
  const handleEarlyStartConfirm = async (stageId) => {
    setIsEarlyStarting(true);
    try {
      const updatedTask = await taskService.earlyStart(task.id, stageId);
      toast({
        title: "Early Start Success",
        description: `Task has been moved to early start stage.`
      });
      if (onTaskUpdate) {
        onTaskUpdate(updatedTask.id, updatedTask);
      }
      setIsEarlyStartDialogOpen(false);
    } catch (error) {
      console.error("Early start failed:", error);
      toast({
        title: "Error",
        description: "Failed to start task early. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEarlyStarting(false);
    }
  };
  const handleDuplicate = async (e) => {
    e.stopPropagation();
    if (isDuplicating) return;
    setIsDuplicating(true);
    try {
      await taskService.duplicate(task.id);
      toast({
        title: "Task duplicated",
        description: `Created copy of "${task.title}"`
      });
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Duplication failed:", error);
      const message = error.response?.data?.message || "Failed to duplicate task.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsDuplicating(false);
    }
  };
  const priorityColors = {
    low: "bg-priority-low/10 text-priority-low border-priority-low/20",
    medium: "bg-priority-medium/10 text-priority-medium border-priority-medium/20",
    high: "bg-priority-high/10 text-priority-high border-priority-high/20"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      id: `task-${task.id}`,
      draggable: canDrag,
      onDragStart: canDrag ? onDragStart : void 0,
      className: cn(
        "hover:shadow-md transition-all group relative",
        canDrag && !isSelectionMode && "cursor-move hover:scale-[1.02]",
        (isSelectionMode || !canDrag) && "cursor-default",
        isOverdue && "border-destructive/50 bg-destructive/5",
        isSelected && "ring-2 ring-primary border-primary bg-primary/5 shadow-inner"
      ),
      onClick: () => {
        if (isSelectionMode && onToggleSelection) {
          onToggleSelection(task.id);
        }
      },
      children: [
        isSelectionMode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 left-2 z-20", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Checkbox,
          {
            checked: isSelected,
            onCheckedChange: () => onToggleSelection?.(task.id),
            className: "h-5 w-5 bg-card border-2"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "p-4 pb-2 relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-sm leading-tight w-full pr-2", children: task.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-card/90 backdrop-blur-[2px] rounded-md border shadow-sm p-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open: isShareOpen, onOpenChange: setIsShareOpen, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7",
                  onClick: (e) => e.stopPropagation(),
                  title: "Share task",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-56 p-1", align: "end", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", className: "justify-start h-9 text-xs font-normal", onClick: handleCopyLink, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-3.5 w-3.5 mr-2" }),
                  "Copy link to Clipboard"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", className: "justify-start h-9 text-xs font-normal", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5 mr-2" }),
                  "Internal Share"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", className: "justify-start h-9 text-xs font-normal", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3.5 w-3.5 mr-2" }),
                  "External Share"
                ] })
              ] }) })
            ] }),
            !isProjectView && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7",
                onClick: (e) => {
                  e.stopPropagation();
                  const pId = projectId || task.projectId;
                  if (pId) {
                    navigate(`/project/${pId}?task=${task.id}`);
                  }
                },
                title: "Go to Project Board",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7",
                onClick: (e) => {
                  e.stopPropagation();
                  onView();
                },
                title: "View details",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" })
              }
            ),
            currentStage?.isReviewStage && onReviewTask && (activeRole === "admin" || activeRole === "team-lead" || activeRole === "account-manager" && (task.assignee === currentUser?.name || task.assignedUsers && task.assignedUsers.some((u) => String(u.id) === String(currentUser?.id)))) && /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50",
                  onClick: (e) => {
                    e.stopPropagation();
                    onReviewTask();
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "h-3.5 w-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Review Task" }) })
            ] }) }),
            (activeRole === "admin" || activeRole === "team-lead") && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7",
                onClick: (e) => {
                  e.stopPropagation();
                  setShowTaskHistoryDialog(true);
                },
                title: "View Task History",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollText, { className: "h-3.5 w-3.5" })
              }
            ),
            currentStage?.title === "Pending" && currentStage?.type === "project" && (activeRole === "user" || activeRole === "account-manager") && /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50",
                  onClick: (e) => {
                    e.stopPropagation();
                    setIsEarlyStartDialogOpen(true);
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5", fill: "currentColor" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Early Start" }) })
            ] }) }),
            canManage && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7",
                  onClick: (e) => {
                    e.stopPropagation();
                    onEdit();
                  },
                  title: "Edit task",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-3.5 w-3.5" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: cn("h-7 w-7", isDuplicating && "animate-pulse"),
                  onClick: handleDuplicate,
                  disabled: isDuplicating,
                  title: "Duplicate task",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: cn("h-3.5 w-3.5", isDuplicating && "text-primary") })
                }
              ),
              activeRole !== "account-manager" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7 hover:bg-destructive/10 hover:text-destructive",
                  onClick: (e) => {
                    e.stopPropagation();
                    onDelete();
                  },
                  title: "Delete task",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                }
              )
            ] })
          ] }),
          task.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 mt-1", children: task.description.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 pt-2 space-y-2", children: [
          timeLeft && projectId && currentStage?.title === "Pending" && (activeRole === "admin" || activeRole === "team-lead") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 p-1.5 rounded-md border border-blue-100 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Starts in: ",
              timeLeft
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: cn(
                  isOverdue && "text-status-overdue font-medium",
                  isValidDueDate && isToday(dueDate) && "text-primary font-medium"
                ),
                children: isValidDueDate ? format(dueDate, "MMM dd, yyyy") : "No due date"
              }
            )
          ] }),
          task.assignedUsers && task.assignedUsers.length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 mt-1 pt-1 border-t border-dashed", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-medium px-1", children: "Assignees" }),
            task.assignedUsers.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
              "flex items-center gap-2 text-xs p-1 rounded transition-colors",
              u.status === "complete" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "text-muted-foreground hover:bg-muted"
            ), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate", children: u.name }),
              u.status === "complete" && /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "h-3 w-3 text-green-600 dark:text-green-400" })
            ] }, u.id))
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: task.assignedUsers && task.assignedUsers.length === 1 ? task.assignedUsers[0].name : task.assignee })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            !isProjectView && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: cn("text-xs cursor-pointer hover:bg-muted hover:text-primary transition-colors"),
                onClick: (e) => {
                  e.stopPropagation();
                  const pId = projectId || task.projectId;
                  if (pId) {
                    navigate(`/project/${pId}`);
                  }
                },
                title: "Go to Project",
                children: task.project
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: cn("text-xs capitalize", priorityColors[task.priority]),
                children: task.priority
              }
            ),
            task.isLocked && /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Badge,
                {
                  variant: "outline",
                  className: "text-xs bg-orange-500/10 text-orange-700 border-orange-500/20 flex items-center gap-1",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
                    "Locked"
                  ]
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                "Task is locked due to project status",
                task.previousStatus ? ` (was: ${task.previousStatus})` : ""
              ] }) })
            ] }) })
          ] }),
          task.tags && task.tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: task.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Badge,
            {
              variant: "secondary",
              className: cn(
                "text-xs",
                tag === "Redo" && "bg-amber-500/10 text-amber-700 border-amber-500/20"
              ),
              children: tag
            },
            tag
          )) }),
          task.revisionComment && task.tags?.includes("Redo") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-amber-900 dark:text-amber-100", children: "Revision Requested" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-700 dark:text-amber-300 line-clamp-2 mt-0.5", children: task.revisionComment })
            ] }),
            task.revisionHistory && task.revisionHistory.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-6 w-6 flex-shrink-0",
                onClick: (e) => {
                  e.stopPropagation();
                  setShowRevisionHistoryDialog(true);
                },
                title: "View revision history",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-3.5 w-3.5" })
              }
            )
          ] }) }),
          (task.subtasks && task.subtasks.length > 0 || onAddSubtask) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 pt-3 border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-muted-foreground flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListTodo, { className: "h-3 w-3" }),
                " Subtasks"
              ] }),
              canManage && onAddSubtask && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-5 px-1.5 text-[10px]",
                  onClick: (e) => {
                    e.stopPropagation();
                    onAddSubtask();
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3 mr-1" }),
                    " Add"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              task.subtasks?.filter((st) => {
                const isAdminOrTL = activeRole === "admin" || activeRole === "team-lead";
                const isAssignee = st.assignee === currentUser?.name || st.assignedUsers?.some((u) => String(u.id) === String(currentUser?.id));
                if (isAdminOrTL || isAssignee) return true;
                return st.userStatus !== "complete";
              }).map((subtask) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "flex items-center gap-2 text-xs p-1 hover:bg-muted/50 rounded group/subtask cursor-pointer",
                  onClick: (e) => {
                    e.stopPropagation();
                    if (onViewSubtask) onViewSubtask(subtask);
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: cn(
                          "h-4 w-4 border rounded-full flex items-center justify-center transition-colors cursor-pointer hover:border-primary",
                          subtask.userStatus === "complete" ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/50"
                        ),
                        onClick: async (e) => {
                          e.stopPropagation();
                          const isAdminOrTL = activeRole === "admin" || activeRole === "team-lead";
                          const isSubtaskAssignee = subtask.assignee === currentUser?.name || subtask.assignedUsers?.some((u) => String(u.id) === String(currentUser?.id));
                          const isParentAssignee = task.assignee === currentUser?.name || task.assignedUsers?.some((u) => String(u.id) === String(currentUser?.id));
                          if (!isAdminOrTL && !isSubtaskAssignee && !isParentAssignee) return;
                          const newStatus = subtask.userStatus === "complete" ? "pending" : "complete";
                          try {
                            await taskService.update(subtask.id, { userStatus: newStatus });
                            if (onTaskUpdate) {
                              const updatedSubtasks = task.subtasks?.map(
                                (st) => st.id === subtask.id ? { ...st, userStatus: newStatus } : st
                              ) || [];
                              onTaskUpdate(task.id, { subtasks: updatedSubtasks });
                            }
                            toast({
                              title: newStatus === "complete" ? "Subtask Completed" : "Subtask Reopened",
                              description: "Task updated successfully."
                            });
                          } catch (error) {
                            console.error("Failed to toggle subtask", error);
                            toast({
                              title: "Error",
                              description: "Failed to update subtask.",
                              variant: "destructive"
                            });
                          }
                        },
                        children: subtask.userStatus === "complete" && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-2.5 w-2.5" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
                      "flex-1 truncate select-none",
                      subtask.userStatus === "complete" && "line-through text-muted-foreground"
                    ), children: subtask.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground bg-muted px-1 rounded", children: subtask.assignee.split(" ")[0] }),
                    (activeRole === "admin" || activeRole === "team-lead") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "opacity-0 group-hover/subtask:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        variant: "ghost",
                        size: "icon",
                        className: "h-5 w-5 hover:bg-destructive/10 hover:text-destructive",
                        onClick: (e) => {
                          e.stopPropagation();
                          setSubtaskToDelete(subtask);
                          setIsDeleteDialogOpen(true);
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
                      }
                    ) })
                  ]
                },
                subtask.id
              )),
              (!task.subtasks || task.subtasks.length === 0) && onAddSubtask && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground italic px-1", children: "No subtasks" })
            ] })
          ] })
        ] }),
        isOverdue && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "absolute bottom-2 right-2 text-[10px] h-5 px-1.5 animate-pulse shadow-sm", children: "Overdue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showRevisionHistoryDialog, onOpenChange: setShowRevisionHistoryDialog, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[500px] max-h-[80vh] overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Revision History" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "All revision requests for this task" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 py-4", children: task.revisionHistory && task.revisionHistory.length > 0 ? [...task.revisionHistory].reverse().map((revision, index) => {
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
          }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "No revision history available" }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Are you sure?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
              'This action cannot be undone. This will permanently delete the subtask "',
              subtaskToDelete?.title,
              '".'
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsDeleteDialogOpen(false), children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "destructive",
                onClick: async () => {
                  if (!subtaskToDelete) return;
                  try {
                    await taskService.delete(subtaskToDelete.id);
                    if (onTaskUpdate) {
                      const updatedSubtasks = task.subtasks?.filter((st) => st.id !== subtaskToDelete.id) || [];
                      onTaskUpdate(task.id, { subtasks: updatedSubtasks });
                    }
                    toast({
                      title: "Subtask deleted",
                      description: "Subtask has been permanently deleted."
                    });
                  } catch (error) {
                    console.error("Failed to delete subtask", error);
                    toast({
                      title: "Error",
                      description: "Failed to delete subtask.",
                      variant: "destructive"
                    });
                  } finally {
                    setIsDeleteDialogOpen(false);
                    setSubtaskToDelete(null);
                  }
                },
                children: "Delete"
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TaskHistoryDialog,
          {
            taskId: task.id,
            open: showTaskHistoryDialog,
            onOpenChange: setShowTaskHistoryDialog,
            taskTitle: task.title
          }
        ),
        isEarlyStartDialogOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
          EarlyStartDialog,
          {
            task,
            stages: allStages,
            open: isEarlyStartDialogOpen,
            onOpenChange: setIsEarlyStartDialogOpen,
            onConfirm: handleEarlyStartConfirm,
            isLoading: isEarlyStarting
          }
        )
      ]
    }
  );
}
export {
  TaskDetailsDialog as T,
  TaskCard as a
};
