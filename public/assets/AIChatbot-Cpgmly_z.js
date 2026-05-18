import { ad as createLucideIcon, b as api, l as reactExports, j as jsxRuntimeExports, bY as Bot, B as Button, L as LoaderCircle, P as Plus, bj as Shield, A as ScrollArea, s as ChevronRight, a as CircleCheck, bf as FolderKanban, bd as Users, az as TriangleAlert, aj as FileText, bJ as ChartColumn, ae as Textarea } from "./index-C4ZP3eFM.js";
import { C as Clock } from "./clock-C-1UQMq-.js";
import { L as ListTodo } from "./list-todo-B9y_ixvA.js";
import { T as TrendingDown } from "./trending-down-DJZzQmVx.js";
import { S as Send } from "./send-C-kJJjyu.js";
const BookOpen = createLucideIcon("BookOpen", [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
]);
const chatbotService = {
  async getSessions() {
    const { data } = await api.get("/ai-chatbot/sessions");
    return data;
  },
  async createSession() {
    const { data } = await api.post("/ai-chatbot/sessions");
    return data;
  },
  async getSession(id) {
    const { data } = await api.get(`/ai-chatbot/sessions/${id}`);
    return data;
  },
  async sendMessage(sessionId, message) {
    const { data } = await api.post(`/ai-chatbot/sessions/${sessionId}/messages`, { message });
    return data;
  },
  async completeSession(sessionId) {
    await api.post(`/ai-chatbot/sessions/${sessionId}/complete`);
  },
  async refreshContext(sessionId) {
    const { data } = await api.post(`/ai-chatbot/sessions/${sessionId}/refresh-context`);
    return data;
  },
  async getPolicies() {
    const { data } = await api.get("/ai-chatbot/policies");
    return data;
  },
  async updatePolicy(id, updates) {
    const { data } = await api.put(`/ai-chatbot/policies/${id}`, updates);
    return data;
  }
};
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-semibold text-foreground", children: part.slice(2, -2) }, i);
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-muted px-1 py-0.5 rounded text-xs font-mono", children: part.slice(1, -1) }, i);
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: part }, i);
  });
}
function MessageContent({ content }) {
  const lines = content.split("\n");
  const nodes = [];
  let listItems = [];
  let listType = null;
  let inBlockquote = [];
  const flushList = () => {
    if (listItems.length === 0) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    const cls = listType === "ol" ? "list-decimal pl-5 mb-2 space-y-0.5" : "list-disc pl-5 mb-2 space-y-0.5";
    nodes.push(/* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: cls, children: listItems }, nodes.length));
    listItems = [];
    listType = null;
  };
  const flushBlockquote = () => {
    if (inBlockquote.length === 0) return;
    nodes.push(
      /* @__PURE__ */ jsxRuntimeExports.jsx("blockquote", { className: "border-l-4 border-emerald-500 pl-3 py-1.5 my-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-r text-sm space-y-0.5", children: inBlockquote.map((line, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: renderInline(line) }, i)) }, nodes.length)
    );
    inBlockquote = [];
  };
  lines.forEach((line, idx) => {
    if (line.startsWith("> ")) {
      flushList();
      inBlockquote.push(line.slice(2));
      return;
    } else {
      flushBlockquote();
    }
    if (line.startsWith("## ")) {
      flushList();
      nodes.push(/* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold mt-3 mb-1 text-foreground", children: renderInline(line.slice(3)) }, idx));
      return;
    }
    if (line.startsWith("### ")) {
      flushList();
      nodes.push(/* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mt-2 mb-0.5 text-foreground", children: renderInline(line.slice(4)) }, idx));
      return;
    }
    if (/^[-*] /.test(line)) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(/* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm", children: renderInline(line.slice(2)) }, idx));
      return;
    }
    if (/^\d+\. /.test(line)) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      listItems.push(/* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-sm", children: renderInline(line.replace(/^\d+\. /, "")) }, idx));
      return;
    }
    if (/^---+$/.test(line.trim())) {
      flushList();
      nodes.push(/* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "my-2 border-border" }, idx));
      return;
    }
    if (line.trim() === "") {
      flushList();
      nodes.push(/* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5" }, idx));
      return;
    }
    flushList();
    nodes.push(/* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed", children: renderInline(line) }, idx));
  });
  flushList();
  flushBlockquote();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0.5 leading-relaxed", children: nodes });
}
function StatBadge({ icon: Icon, label, value, variant }) {
  const colors = {
    default: "bg-muted text-muted-foreground",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${colors[variant ?? "default"]}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      value,
      " ",
      label
    ] })
  ] });
}
function PolicyCard({ policy, onActivate }) {
  const statusColor = {
    draft: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    archived: "bg-muted text-muted-foreground"
  }[policy.status];
  const boundaries = typeof policy.boundaries === "object" && policy.boundaries !== null ? policy.boundaries : {};
  const notifications = typeof policy.notifications === "object" && policy.notifications !== null ? policy.notifications : {};
  const reactions = typeof policy.reactions === "object" && policy.reactions !== null ? policy.reactions : {};
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-lg p-3 space-y-2 bg-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium text-foreground leading-tight", children: policy.scenario_title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${statusColor}`, children: policy.status })
    ] }),
    boundaries.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Boundary: " }),
      boundaries.description
    ] }),
    notifications.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Notify: " }),
      notifications.description
    ] }),
    notifications.escalation && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Escalate: " }),
      notifications.escalation
    ] }),
    reactions.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "React: " }),
      reactions.description
    ] }),
    policy.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "outline",
        size: "sm",
        className: "w-full h-6 text-xs",
        onClick: () => onActivate(policy.id),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 mr-1" }),
          "Activate Policy"
        ]
      }
    )
  ] });
}
function AIChatbot() {
  const [sessions, setSessions] = reactExports.useState([]);
  const [activeSession, setActiveSession] = reactExports.useState(null);
  const [policies, setPolicies] = reactExports.useState([]);
  const [messages, setMessages] = reactExports.useState([]);
  const [input, setInput] = reactExports.useState("");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [isCreating, setIsCreating] = reactExports.useState(false);
  const [activeTab, setActiveTab] = reactExports.useState("chat");
  const messagesEndRef = reactExports.useRef(null);
  const textareaRef = reactExports.useRef(null);
  const scrollToBottom = reactExports.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  reactExports.useEffect(() => {
    loadSessions();
    loadPolicies();
  }, []);
  reactExports.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  async function loadSessions() {
    try {
      const data = await chatbotService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to load sessions", err);
    }
  }
  async function loadPolicies() {
    try {
      const data = await chatbotService.getPolicies();
      setPolicies(data);
    } catch (err) {
      console.error("Failed to load policies", err);
    }
  }
  async function openSession(id) {
    setIsLoading(true);
    try {
      const session = await chatbotService.getSession(id);
      setActiveSession(session);
      setMessages(session.messages);
    } catch (err) {
      console.error("Failed to load session", err);
    } finally {
      setIsLoading(false);
    }
  }
  async function startNewSession() {
    setIsCreating(true);
    setActiveSession(null);
    setMessages([]);
    try {
      const session = await chatbotService.createSession();
      setActiveSession(session);
      setMessages(session.messages);
      setSessions((prev) => [
        { id: session.id, title: session.title, status: session.status, messages: [] },
        ...prev
      ]);
    } catch (err) {
      console.error("Failed to create session", err);
    } finally {
      setIsCreating(false);
    }
  }
  async function sendMessage() {
    if (!input.trim() || !activeSession || isLoading) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const reply = await chatbotService.sendMessage(activeSession.id, userMsg.content);
      setMessages((prev) => [...prev, { role: "assistant", content: reply.content, created_at: reply.created_at }]);
      if (reply.content.includes("✅")) {
        await loadPolicies();
      }
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  }
  async function activatePolicy(id) {
    try {
      await chatbotService.updatePolicy(id, { status: "active" });
      setPolicies((prev) => prev.map((p) => p.id === id ? { ...p, status: "active" } : p));
    } catch (err) {
      console.error("Failed to activate policy", err);
    }
  }
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
  const stats = activeSession?.stats;
  const activePolicies = policies.filter((p) => p.status === "active").length;
  const draftPolicies = policies.filter((p) => p.status === "draft").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-[calc(100vh-5rem)] flex gap-0 -m-6 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-72 shrink-0 border-r border-border flex flex-col bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 bg-violet-100 dark:bg-violet-950/50 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-4 w-4 text-violet-600 dark:text-violet-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "AI Scenario Analyst" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Policy discovery assistant" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            className: "w-full h-8 text-xs gap-1.5",
            onClick: startNewSession,
            disabled: isCreating,
            children: isCreating ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
              " Analyzing database…"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
              " New Discovery Session"
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex border-b border-border", children: ["chat", "policies"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setActiveTab(tab),
          className: `flex-1 py-2 text-xs font-medium transition-colors ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`,
          children: tab === "chat" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-3 w-3" }),
            " Sessions"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3 w-3" }),
            " Policies",
            draftPolicies > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 px-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded text-[10px] font-semibold", children: draftPolicies })
          ] })
        },
        tab
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: activeTab === "chat" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 space-y-1", children: [
        sessions.length === 0 && !isCreating && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center py-8 px-4", children: "Start a new session to let Claude analyze your database and discover scenarios." }),
        sessions.map((session) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => openSession(session.id),
            className: `w-full text-left px-3 py-2 rounded-md text-xs transition-colors flex items-start gap-2 ${activeSession?.id === session.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-foreground"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium truncate leading-tight", children: session.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-0.5", children: session.status })
              ] }),
              activeSession?.id === session.id && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 mt-0.5 shrink-0 ml-auto text-muted-foreground" })
            ]
          },
          session.id
        ))
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 space-y-2", children: [
        policies.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center py-8 px-4", children: "No policies yet. Complete a discovery session to define system policies." }),
        policies.map((policy) => /* @__PURE__ */ jsxRuntimeExports.jsx(PolicyCard, { policy, onActivate: activatePolicy }, policy.id))
      ] }) }),
      policies.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 border-t border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 text-emerald-500" }),
          activePolicies,
          " active"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 text-amber-500" }),
          draftPolicies,
          " draft"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          policies.length,
          " total"
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex flex-col min-w-0 bg-background", children: !activeSession && !isCreating ? (
      /* Empty state */
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center gap-6 p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-violet-100 dark:bg-violet-950/30 rounded-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-10 w-10 text-violet-600 dark:text-violet-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: "AI Scenario Discovery" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: "Claude will autonomously read your entire database — projects, tasks, team data, and financials — then surface real patterns and scenarios, asking you to define how the system should respond to each one." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 w-full max-w-md text-xs text-muted-foreground", children: [
          { icon: FolderKanban, text: "Project & deadline risks" },
          { icon: Users, text: "Team workload patterns" },
          { icon: ListTodo, text: "Task issue scenarios" },
          { icon: TrendingDown, text: "Budget & finance alerts" }
        ].map(({ icon: Icon, text }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-violet-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: text })
        ] }, text)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: startNewSession, disabled: isCreating, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-4 w-4" }),
          "Start Scenario Discovery"
        ] })
      ] })
    ) : isCreating ? (
      /* Loading / analyzing state */
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-violet-100 dark:bg-violet-950/30 rounded-2xl animate-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-10 w-10 text-violet-600 dark:text-violet-400" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Analyzing your database…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Reading projects, tasks, team data, and financial records" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-1.5 items-center text-xs text-muted-foreground", children: ["Reading project data", "Analyzing team workload", "Identifying issue patterns", "Generating scenario analysis"].map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin", style: { animationDelay: `${i * 300}ms` } }),
          step
        ] }, step)) })
      ] })
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      stats && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border px-4 py-2 bg-card/50 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground mr-1", children: "Live snapshot:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatBadge, { icon: FolderKanban, label: "projects", value: stats.active_projects }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatBadge, { icon: ListTodo, label: "tasks", value: stats.total_tasks }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatBadge,
          {
            icon: TriangleAlert,
            label: "overdue",
            value: stats.overdue_tasks_total,
            variant: stats.overdue_tasks_total > 0 ? "danger" : "default"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatBadge,
          {
            icon: Users,
            label: "overworked",
            value: stats.overworked_users,
            variant: stats.overworked_users > 0 ? "warning" : "default"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatBadge,
          {
            icon: FileText,
            label: "unassigned",
            value: stats.unassigned_tasks_total,
            variant: stats.unassigned_tasks_total > 0 ? "warning" : "default"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatBadge, { icon: ChartColumn, label: "blocked", value: stats.blocked_tasks_total })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 space-y-4 max-w-3xl mx-auto", children: [
        messages.filter((m) => m.role !== "system").map((msg, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`,
            children: [
              msg.role === "assistant" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 bg-violet-100 dark:bg-violet-950/50 rounded-lg h-fit mt-0.5 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-3.5 w-3.5 text-violet-600 dark:text-violet-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `max-w-[85%] rounded-xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-card border border-border text-foreground"}`,
                  children: msg.role === "user" ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: msg.content }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MessageContent, { content: msg.content })
                }
              )
            ]
          },
          idx
        )),
        isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 justify-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-1.5 bg-violet-100 dark:bg-violet-950/50 rounded-lg h-fit mt-0.5 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-3.5 w-3.5 text-violet-600 dark:text-violet-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-xl px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 items-center h-4", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce",
              style: { animationDelay: `${i * 150}ms` }
            },
            i
          )) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: messagesEndRef })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border p-4 bg-card/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto", children: [
        activeSession?.status === "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-500" }),
          "This session is completed. Start a new one to continue discovery."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              ref: textareaRef,
              value: input,
              onChange: (e) => setInput(e.target.value),
              onKeyDown: handleKeyDown,
              placeholder: "Answer Claude's questions, define boundaries, or ask about scenarios… (Enter to send)",
              className: "min-h-[60px] max-h-[160px] resize-none text-sm",
              disabled: isLoading
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                onClick: sendMessage,
                disabled: !input.trim() || isLoading,
                className: "h-10 w-10 shrink-0",
                children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" })
              }
            ),
            activeSession && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "outline",
                title: "Complete session",
                onClick: async () => {
                  await chatbotService.completeSession(activeSession.id);
                  setActiveSession((prev) => prev ? { ...prev, status: "completed" } : prev);
                  setSessions(
                    (prev) => prev.map((s) => s.id === activeSession.id ? { ...s, status: "completed" } : s)
                  );
                },
                className: "h-10 w-10 shrink-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1.5", children: "Shift+Enter for new line · Enter to send · Policies are auto-saved when Claude confirms them" })
      ] }) })
    ] }) })
  ] });
}
export {
  AIChatbot as default
};
