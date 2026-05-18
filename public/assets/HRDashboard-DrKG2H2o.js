import { ad as createLucideIcon, j as jsxRuntimeExports, bf as FolderKanban, C as CircleAlert, az as TriangleAlert, l as reactExports, u as useNavigate, y as endOfMonth, B as Button, s as ChevronRight, z as cn, A as ScrollArea, Y as Badge, S as Skeleton, G as Search, I as Input, x as projectService } from "./index-C4ZP3eFM.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./card-5_9pbgKs.js";
import { A as Activity } from "./activity-D4R4frf9.js";
import { a as startOfDay, s as startOfWeek, f as format } from "./format-BDODTvac.js";
import { a as addDays, s as startOfMonth, e as endOfWeek, i as isSameMonth, b as addMonths } from "./isSameMonth-fupOC6M2.js";
import { p as parseISO } from "./parseISO-BZpuPkuQ.js";
import { i as isWithinInterval } from "./isWithinInterval-BCwcG1Bq.js";
import { C as Calendar } from "./calendar-B2-LyEnc.js";
import { C as ChevronLeft } from "./chevron-left-zAeTltYW.js";
import { e as eachDayOfInterval } from "./eachDayOfInterval-VBBDUvgV.js";
import { i as isSameDay, a as isToday } from "./isToday-RL2Fg3s3.js";
import { s as subMonths } from "./subMonths-BheFHfWm.js";
import { B as Briefcase } from "./briefcase-CJBZhMcz.js";
const CalendarClock = createLucideIcon("CalendarClock", [
  ["path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5", key: "1osxxc" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M3 10h5", key: "r794hk" }],
  ["path", { d: "M17.5 17.5 16 16.3V14", key: "akvzfd" }],
  ["circle", { cx: "16", cy: "16", r: "6", key: "qoo3c4" }]
]);
function HRDashboardStats({ projects, onCardClick }) {
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active" && !p.isArchived).length;
  const onHoldProjects = projects.filter((p) => p.status === "on-hold" && !p.isArchived).length;
  const today = startOfDay(/* @__PURE__ */ new Date());
  const fourteenDaysFromNow = addDays(today, 14);
  const upcomingDeadlines = projects.filter((p) => {
    if (!p.deadline || p.isArchived || p.status === "on-hold") return false;
    try {
      const deadlineDate = parseISO(p.deadline);
      return isWithinInterval(deadlineDate, { start: today, end: fourteenDaysFromNow });
    } catch (e) {
      return false;
    }
  }).length;
  const missingDeadlines = projects.filter((p) => !p.deadline && !p.isArchived).length;
  const stats = [
    {
      type: "total",
      title: "Total Projects",
      value: totalProjects,
      icon: FolderKanban,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Total projects in system"
    },
    {
      type: "active",
      title: "Active Projects",
      value: activeProjects,
      icon: Activity,
      iconColor: "text-green-500",
      bgColor: "bg-green-500/10",
      description: "Currently ongoing"
    },
    {
      type: "on-hold",
      title: "On Hold",
      value: onHoldProjects,
      icon: CircleAlert,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-400/10",
      description: "Projects paused"
    },
    {
      type: "upcoming",
      title: "Upcoming Deadlines",
      value: upcomingDeadlines,
      icon: CalendarClock,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-500/10",
      description: "Excludes on-hold"
    },
    {
      type: "missing",
      title: "Missing Deadlines",
      value: missingDeadlines,
      icon: TriangleAlert,
      iconColor: "text-rose-500",
      bgColor: "bg-rose-500/10",
      description: "Non-archived projects"
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-5", children: stats.map((stat) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: "hover:shadow-md transition-all border-none shadow-sm bg-card/60 backdrop-blur-sm cursor-pointer hover:bg-white/5 active:scale-95",
      onClick: () => onCardClick?.(stat.type, stat.title),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground uppercase tracking-wider", children: stat.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-2 rounded-lg ${stat.bgColor}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(stat.icon, { className: `h-4 w-4 ${stat.iconColor}` }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold", children: stat.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: stat.description })
        ] })
      ]
    },
    stat.title
  )) });
}
function DeadlineCalendar({ projects }) {
  const [currentMonth, setCurrentMonth] = reactExports.useState(/* @__PURE__ */ new Date());
  const [selectedDate, setSelectedDate] = reactExports.useState(/* @__PURE__ */ new Date());
  const navigate = useNavigate();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const getProjectsForDate = (date) => {
    return projects.filter(
      (project) => project.deadline && project.status !== "on-hold" && isSameDay(parseISO(project.deadline), date)
    );
  };
  const selectedDateProjects = getProjectsForDate(selectedDate);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row gap-6 h-[750px] lg:h-[650px] animate-in fade-in slide-in-from-bottom-4 duration-700", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full lg:w-2/3 bg-card/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl flex flex-col h-full overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-6 border-b border-white/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/20 p-2.5 rounded-xl border border-primary/20 shadow-inner", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-5 w-5 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-2xl tracking-tight", children: format(currentMonth, "MMMM yyyy") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "icon",
              onClick: prevMonth,
              className: "rounded-lg hover:bg-white/5 border-white/10 h-9 w-9",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "secondary",
              size: "sm",
              onClick: () => {
                setCurrentMonth(/* @__PURE__ */ new Date());
                setSelectedDate(/* @__PURE__ */ new Date());
              },
              className: "font-medium px-4 h-9",
              children: "Today"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "icon",
              onClick: nextMonth,
              className: "rounded-lg hover:bg-white/5 border-white/10 h-9 w-9",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 bg-muted/30", children: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]", children: day }, day)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 flex-1 auto-rows-fr", children: calendarDays.map((day, dayIdx) => {
        const dayProjects = getProjectsForDate(day);
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, currentMonth);
        const isTodayDate = isToday(day);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            onClick: () => setSelectedDate(day),
            className: cn(
              "min-h-[100px] p-3 border-b border-r border-white/5 relative cursor-pointer transition-all hover:bg-primary/5 group select-none flex flex-col items-center",
              !isCurrentMonth && "opacity-20",
              isSelected && "bg-primary/10 z-10 shadow-[inset_0_0_20px_rgba(var(--primary),0.05)]",
              dayIdx % 7 === 6 && "border-r-0"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
                "text-sm font-semibold h-8 w-8 flex items-center justify-center rounded-full transition-all group-hover:scale-110",
                isTodayDate ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "text-muted-foreground group-hover:text-foreground",
                isSelected && !isTodayDate && "ring-2 ring-primary/50 text-foreground"
              ), children: format(day, "d") }),
              dayProjects.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] animate-pulse" })
            ]
          },
          day.toString()
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full lg:w-1/3 flex flex-col gap-4 h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl flex-1 flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-white/5 bg-white/5 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-xl tracking-tight", children: format(selectedDate, "EEEE, MMMM do") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1 font-medium", children: selectedDateProjects.length === 1 ? "1 Project Deadline" : `${selectedDateProjects.length} Project Deadlines` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4", children: "Scheduled Deadlines" }),
        selectedDateProjects.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-2 border-dashed border-white/5 rounded-2xl bg-white/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-12 w-12 mb-4 opacity-10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium opacity-50", children: "No deadlines scheduled for this day" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: selectedDateProjects.map((project) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            onClick: () => navigate(`/project/${project.id}/overview`),
            className: "group relative p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer overflow-hidden",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 w-1 h-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all group-hover:w-1.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-foreground group-hover:text-primary transition-colors leading-tight", children: project.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] uppercase font-bold tracking-wider py-0 px-2 h-5 border-white/10 bg-white/5 text-muted-foreground group-hover:text-foreground transition-colors", children: project.status || "Active" }),
                    project.client?.company_name && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground truncate max-w-[120px]", children: project.client.company_name })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8 shrink-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) })
              ] })
            ]
          },
          project.id
        )) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 mt-auto border-t border-white/5 bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "secondary",
          className: "w-full group font-bold",
          onClick: () => navigate("/clients"),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FolderKanban, { className: "h-4 w-4 mr-2 group-hover:scale-110 transition-transform" }),
            "View All Projects"
          ]
        }
      ) })
    ] }) })
  ] });
}
const HRDashboard = () => {
  const [projects, setProjects] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [view, setView] = reactExports.useState("summary");
  const [filterType, setFilterType] = reactExports.useState(null);
  const [filterTitle, setFilterTitle] = reactExports.useState("");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const projectsData = await projectService.getAll();
        setProjects(projectsData);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const filteredProjects = projects.filter((p) => {
    if (!filterType) return false;
    let matchesType = false;
    const today = startOfDay(/* @__PURE__ */ new Date());
    const fourteenDaysFromNow = addDays(today, 14);
    if (filterType === "total") matchesType = true;
    else if (filterType === "active") matchesType = p.status === "active";
    else if (filterType === "on-hold") matchesType = p.status === "on-hold";
    else if (filterType === "upcoming") {
      if (!p.deadline || p.status === "on-hold") matchesType = false;
      else {
        try {
          const deadlineDate = parseISO(p.deadline);
          matchesType = isWithinInterval(deadlineDate, { start: today, end: fourteenDaysFromNow });
        } catch (e) {
          matchesType = false;
        }
      }
    } else if (filterType === "missing") matchesType = !p.deadline && !p.isArchived;
    if (!matchesType) return false;
    if (searchQuery) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.client?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });
  const handleCardClick = (type, title) => {
    setFilterType(type);
    setFilterTitle(title);
    setSearchQuery("");
    setView("project-list");
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 p-8 max-w-[1600px] mx-auto animate-pulse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-64 rounded-xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-48 rounded-lg" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32 rounded-2xl" }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-[600px] w-full rounded-2xl" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8 p-8 max-w-[1600px] mx-auto fade-in h-full flex flex-col", children: view === "summary" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 shadow-2xl shadow-indigo-500/20 ring-1 ring-white/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "w-8 h-8 text-white" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-black text-white tracking-tighter", children: "Strategic Overview" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/80 font-medium tracking-wide", children: "HR Project Intelligence & Deadline Tracking" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      HRDashboardStats,
      {
        projects,
        onCardClick: handleCardClick
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeadlineCalendar, { projects }) })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-8 h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            onClick: () => setView("summary"),
            className: "rounded-2xl h-12 w-12 border-white/10 hover:bg-white/5 shadow-xl transition-all",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-6 w-6 rotate-180" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-4xl font-black tracking-tighter text-foreground flex items-center gap-3", children: [
            filterTitle,
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-primary/20 text-primary border-primary/20 py-1 px-4 text-sm font-bold rounded-full tabular-nums", children: filteredProjects.length })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-medium mt-1", children: "Exploring filtered projects based on your selection" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group w-full md:w-[400px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search project name or client...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "pl-14 h-14 bg-card/60 border-white/10 rounded-2xl focus:ring-primary/20 text-lg shadow-xl"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar", children: filteredProjects.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-40 text-center opacity-40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FolderKanban, { className: "h-24 w-24 mb-6 stroke-[1]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold italic tracking-tight", children: "No projects found for current criteria" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "link",
          onClick: () => setSearchQuery(""),
          className: "mt-2 text-primary text-lg",
          children: "Clear Search"
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: filteredProjects.map((project) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick: () => navigate(`/project/${project.id}/overview`),
        className: "group relative p-8 rounded-3xl border border-white/5 bg-card/40 backdrop-blur-sm hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between shadow-lg hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.98]",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6 overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FolderKanban, { className: "h-8 w-8 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-extrabold text-2xl text-foreground group-hover:text-primary transition-colors truncate tracking-tight", children: project.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] uppercase font-black tracking-widest py-0.5 px-3 h-6 border-white/10 bg-white/5 text-muted-foreground whitespace-nowrap w-fit", children: (project.status || "Active").replace("-", " ") }),
                project.client?.company_name && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-muted-foreground truncate opacity-70", children: project.client.company_name })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6 shrink-0", children: [
            project.deadline && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right hidden sm:block", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] uppercase font-black text-muted-foreground tracking-widest opacity-40", children: "Deadline" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-black tabular-nums tracking-tighter", children: format(parseISO(project.deadline), "MMM dd, yyyy") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 shadow-lg border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-6 w-6" }) })
          ] })
        ]
      },
      project.id
    )) }) })
  ] }) });
};
export {
  HRDashboard as default
};
