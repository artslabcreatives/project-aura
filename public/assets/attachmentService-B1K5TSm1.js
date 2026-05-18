import { ad as createLucideIcon, l as reactExports, F as useToast, ax as api, j as jsxRuntimeExports, B as Button, be as Square, P as Plus, Y as Badge, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, Q as Label, I as Input, ae as Textarea, U as DialogFooter, b as api$1, aH as uploadManager } from "./index-C4ZP3eFM.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-5_9pbgKs.js";
import { C as Clock } from "./clock-C-1UQMq-.js";
import { P as Play } from "./play-BwxbIHvy.js";
import { f as format } from "./format-BDODTvac.js";
const Tag = createLucideIcon("Tag", [
  [
    "path",
    {
      d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
      key: "vktsd0"
    }
  ],
  ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]
]);
function TimeLogWidget({ taskId }) {
  const [timeLogs, setTimeLogs] = reactExports.useState([]);
  const [activeLog, setActiveLog] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [isTimerRunning, setIsTimerRunning] = reactExports.useState(false);
  const [elapsedTime, setElapsedTime] = reactExports.useState(0);
  const [isManualEntryOpen, setIsManualEntryOpen] = reactExports.useState(false);
  const [manualStartDate, setManualStartDate] = reactExports.useState("");
  const [manualStartTime, setManualStartTime] = reactExports.useState("");
  const [manualEndDate, setManualEndDate] = reactExports.useState("");
  const [manualEndTime, setManualEndTime] = reactExports.useState("");
  const [manualNotes, setManualNotes] = reactExports.useState("");
  const { toast } = useToast();
  reactExports.useEffect(() => {
    fetchTimeLogs();
  }, [taskId]);
  reactExports.useEffect(() => {
    let interval = null;
    if (isTimerRunning && activeLog) {
      interval = setInterval(() => {
        const start = new Date(activeLog.started_at).getTime();
        const now = (/* @__PURE__ */ new Date()).getTime();
        setElapsedTime(Math.floor((now - start) / 1e3));
      }, 1e3);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeLog]);
  const fetchTimeLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tasks/${taskId}/time-logs`);
      setTimeLogs(response);
      const active = response.find((log) => !log.ended_at);
      if (active) {
        setActiveLog(active);
        setIsTimerRunning(true);
      }
    } catch (error) {
      console.error("Failed to fetch time logs:", error);
      toast({
        title: "Error",
        description: "Failed to load time logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const startTimer = async () => {
    try {
      const response = await api.post(`/tasks/${taskId}/time-log`, {
        started_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      setActiveLog(response);
      setIsTimerRunning(true);
      toast({
        title: "Timer Started",
        description: "Time tracking has begun for this task"
      });
      fetchTimeLogs();
    } catch (error) {
      console.error("Failed to start timer:", error);
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive"
      });
    }
  };
  const stopTimer = async () => {
    if (!activeLog) return;
    try {
      await api.patch(`/tasks/${taskId}/time-log/${activeLog.id}`, {
        ended_at: (/* @__PURE__ */ new Date()).toISOString()
      });
      setIsTimerRunning(false);
      setActiveLog(null);
      setElapsedTime(0);
      toast({
        title: "Timer Stopped",
        description: "Time has been logged successfully"
      });
      fetchTimeLogs();
    } catch (error) {
      console.error("Failed to stop timer:", error);
      toast({
        title: "Error",
        description: "Failed to stop timer",
        variant: "destructive"
      });
    }
  };
  const handleManualEntry = async () => {
    if (!manualStartDate || !manualStartTime || !manualEndDate || !manualEndTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all date and time fields",
        variant: "destructive"
      });
      return;
    }
    try {
      const startedAt = `${manualStartDate}T${manualStartTime}:00`;
      const endedAt = `${manualEndDate}T${manualEndTime}:00`;
      await api.post(`/tasks/${taskId}/time-log`, {
        started_at: startedAt,
        ended_at: endedAt,
        notes: manualNotes || null
      });
      toast({
        title: "Time Logged",
        description: "Manual time entry has been saved"
      });
      setManualStartDate("");
      setManualStartTime("");
      setManualEndDate("");
      setManualEndTime("");
      setManualNotes("");
      setIsManualEntryOpen(false);
      fetchTimeLogs();
    } catch (error) {
      console.error("Failed to log time:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to log time",
        variant: "destructive"
      });
    }
  };
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };
  const totalHours = timeLogs.filter((log) => log.ended_at).reduce((sum, log) => sum + log.hours_logged, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5" }),
        "Time Tracking"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
        "Track time spent on this task. Total logged: ",
        formatDuration(totalHours)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3 p-4 border rounded-lg bg-accent/50", children: isTimerRunning ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-mono font-bold", children: formatTime(elapsedTime) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Timer running..." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: stopTimer, variant: "destructive", size: "lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-4 w-4 mr-2" }),
          "Stop"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: startTimer, className: "flex-1", size: "lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 mr-2" }),
          "Start Timer"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setIsManualEntryOpen(true), variant: "outline", size: "lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Manual Entry"
        ] })
      ] }) }),
      timeLogs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Time Log History" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: timeLogs.map((log) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: log.user?.name || "Unknown User" }),
                  !log.ended_at && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "default", className: "bg-green-500", children: "Active" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-y-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    "Started: ",
                    format(new Date(log.started_at), "MMM dd, yyyy hh:mm a")
                  ] }),
                  log.ended_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    "Ended: ",
                    format(new Date(log.ended_at), "MMM dd, yyyy hh:mm a")
                  ] }),
                  log.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "italic", children: [
                    "Note: ",
                    log.notes
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold", children: log.ended_at ? formatDuration(log.hours_logged) : formatTime(elapsedTime) }) })
            ]
          },
          log.id
        )) })
      ] }),
      timeLogs.length === 0 && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-12 w-12 mx-auto mb-3 opacity-50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No time logged yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Start the timer or add a manual entry" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isManualEntryOpen, onOpenChange: setIsManualEntryOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Manual Time Entry" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Add a time log entry for work already completed" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "start-date", children: "Start Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "start-date",
                type: "date",
                value: manualStartDate,
                onChange: (e) => setManualStartDate(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "start-time", children: "Start Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "start-time",
                type: "time",
                value: manualStartTime,
                onChange: (e) => setManualStartTime(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "end-date", children: "End Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "end-date",
                type: "date",
                value: manualEndDate,
                onChange: (e) => setManualEndDate(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "end-time", children: "End Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "end-time",
                type: "time",
                value: manualEndTime,
                onChange: (e) => setManualEndTime(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notes", children: "Notes (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              id: "notes",
              placeholder: "Add notes about what you worked on...",
              value: manualNotes,
              onChange: (e) => setManualNotes(e.target.value),
              rows: 3
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setIsManualEntryOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleManualEntry, children: "Save Entry" })
      ] })
    ] }) })
  ] });
}
function mapAttachment(raw) {
  return {
    id: String(raw.id),
    name: raw.name,
    url: raw.url,
    type: raw.type,
    uploadedAt: raw.created_at
  };
}
const attachmentService = {
  /**
   * Upload a file attachment to a task
   */
  uploadFile: async (taskId, file) => {
    const [attachment] = await uploadManager.attachFilesToTask(taskId, [file]);
    return attachment;
  },
  /**
   * Add a link attachment to a task
   */
  addLink: async (taskId, name, url) => {
    const { data } = await api$1.post("/task-attachments", {
      task_id: taskId,
      name,
      url,
      type: "link"
    });
    return mapAttachment(data);
  },
  /**
   * Get all attachments for a task
   */
  getByTaskId: async (taskId) => {
    const { data } = await api$1.get("/task-attachments", {
      params: { task_id: taskId }
    });
    return Array.isArray(data) ? data.map(mapAttachment) : [];
  },
  /**
   * Delete an attachment
   */
  delete: async (attachmentId) => {
    await api$1.delete(`/task-attachments/${attachmentId}`);
  },
  /**
   * Upload multiple files to a task
   */
  uploadFiles: async (taskId, files) => {
    return uploadManager.attachFilesToTask(taskId, files);
  },
  /**
   * Get secure download URL
   */
  download: async (attachmentId, mode = "download") => {
    const { data } = await api$1.get(`/task-attachments/${attachmentId}/download`, {
      params: { mode }
    });
    return data;
  }
};
export {
  Tag as T,
  attachmentService as a,
  TimeLogWidget as b
};
