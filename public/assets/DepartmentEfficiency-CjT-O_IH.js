import { l as reactExports, j as jsxRuntimeExports, bd as Users, T as TrendingUp, Y as Badge, v as useUser, aB as Building2, E as departmentService } from "./index-C4ZP3eFM.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent, d as CardDescription } from "./card-5_9pbgKs.js";
import { T as Target, e as efficiencyService } from "./efficiencyService-BCS2n9DI.js";
import { C as Clock } from "./clock-C-1UQMq-.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import "./index-D6Uc8srH.js";
function DepartmentEfficiencyDashboard({ departmentId }) {
  const [efficiency, setEfficiency] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const fetchEfficiency = async () => {
      try {
        setLoading(true);
        const response = await efficiencyService.getDepartmentEfficiency(departmentId);
        setEfficiency(response);
      } catch (error) {
        console.error("Failed to fetch department efficiency data:", error);
        setEfficiency(null);
      } finally {
        setLoading(false);
      }
    };
    void fetchEfficiency();
  }, [departmentId]);
  const getEfficiencyBadge = (efficiencyPercentage) => {
    if (efficiencyPercentage >= 100) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-500", children: "On Time" });
    }
    if (efficiencyPercentage >= 80) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-yellow-500", children: "Nearly On Time" });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", children: "Delayed" });
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Loading..." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: "-" }) })
    ] }, i)) });
  }
  if (!efficiency) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "No department efficiency data available" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Tracked Users" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: efficiency.totalUsers }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Team members in this department" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Completed Tasks" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: efficiency.totalTasks }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Tasks with logged time" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Hours Worked" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold", children: [
            efficiency.totalHoursWorked.toFixed(1),
            "h"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Est: ",
            efficiency.totalHoursEstimated.toFixed(1),
            "h"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium", children: "Average Efficiency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-bold", children: [
            efficiency.averageEfficiency.toFixed(1),
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Based on logged department time" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Department Breakdown" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Efficiency metrics for each tracked team member" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        efficiency.users.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between border-b pb-4 last:border-0",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: user.userName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
                  user.tasksCompleted,
                  " completed tasks with logged time"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-lg", children: [
                  user.efficiency.toFixed(1),
                  "%"
                ] }) }),
                getEfficiencyBadge(user.efficiency)
              ] })
            ]
          },
          user.userId
        )),
        efficiency.users.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No department efficiency data available yet" })
      ] }) })
    ] })
  ] });
}
const SELECTABLE_ROLES = ["admin", "hr"];
function DepartmentEfficiency() {
  const { currentUser, activeRole } = useUser();
  const [departments, setDepartments] = reactExports.useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = reactExports.useState("");
  const [isLoadingDepartments, setIsLoadingDepartments] = reactExports.useState(false);
  const canSelectDepartment = activeRole && SELECTABLE_ROLES.includes(activeRole);
  reactExports.useEffect(() => {
    if (!currentUser) {
      return;
    }
    setSelectedDepartmentId(currentUser.department || "");
  }, [currentUser]);
  reactExports.useEffect(() => {
    if (!currentUser || !canSelectDepartment) {
      return;
    }
    const loadDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        const response = await departmentService.getAll();
        setDepartments(response);
      } catch (error) {
        console.error("Failed to load departments:", error);
      } finally {
        setIsLoadingDepartments(false);
      }
    };
    void loadDepartments();
  }, [canSelectDepartment, currentUser]);
  reactExports.useEffect(() => {
    if (selectedDepartmentId || departments.length === 0) {
      return;
    }
    const firstDepartmentId = departments[0]?.id;
    const isUserDepartmentValid = !!currentUser?.department && departments.some((department) => department.id === currentUser.department);
    const defaultDepartmentId = isUserDepartmentValid ? currentUser.department : firstDepartmentId;
    if (!defaultDepartmentId) {
      return;
    }
    setSelectedDepartmentId(defaultDepartmentId);
  }, [currentUser?.department, departments, selectedDepartmentId]);
  const selectedDepartmentName = reactExports.useMemo(() => {
    if (selectedDepartmentId === currentUser?.department) {
      return departments.find((department) => department.id === selectedDepartmentId)?.name || "Your Department";
    }
    return departments.find((department) => department.id === selectedDepartmentId)?.name || "Department";
  }, [currentUser?.department, departments, selectedDepartmentId]);
  if (!currentUser) return null;
  if (!selectedDepartmentId && canSelectDepartment) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6 fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Department Efficiency" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: isLoadingDepartments ? "Loading departments..." : "No departments are available yet." })
      ] })
    ] }) });
  }
  if (!selectedDepartmentId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6 fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Department Efficiency" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No department is assigned to your account yet." })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-8 w-8" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Department Efficiency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
            "Monitor team-wide completion performance for ",
            selectedDepartmentName,
            "."
          ] })
        ] })
      ] }),
      canSelectDepartment && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full md:w-72", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedDepartmentId, onValueChange: setSelectedDepartmentId, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: isLoadingDepartments ? "Loading departments..." : "Select department" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: departments.map((department) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: department.id, children: department.name }, department.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5 text-primary" }),
        "Department Metrics"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DepartmentEfficiencyDashboard, { departmentId: selectedDepartmentId }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "bg-muted/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 text-muted-foreground" }),
        "How Department Efficiency Works"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Department Efficiency:" }),
          " (Combined estimated hours / combined logged hours) × 100"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "• ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Above 100%:" }),
          " The department is completing tracked work ahead of estimate"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "• ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Around 100%:" }),
          " The department is tracking close to plan"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "• ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Below 100%:" }),
          " Logged work is taking longer than estimated"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-xs", children: "Only completed tasks with logged time are included, matching the backend efficiency rules." })
      ] })
    ] })
  ] });
}
export {
  DepartmentEfficiency as default
};
