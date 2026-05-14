import { H as useParams, an as useSearchParams, u as useNavigate, v as useUser, l as reactExports, aV as endOfDay, i as isPast, j as jsxRuntimeExports, S as Skeleton, B as Button, aS as Popover, aT as PopoverTrigger, aU as PopoverContent, w as taskService, x as projectService, D as userService, E as departmentService } from "./index-C4ZP3eFM.js";
import { a as TaskCard, T as TaskDetailsDialog } from "./TaskCard-DsczT6D6.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { i as isThisWeek, F as Filter, C as Calendar$1 } from "./calendar-BErN999l.js";
import { A as ArrowLeft } from "./arrow-left-84kdjEmA.js";
import { C as Calendar } from "./calendar-B2-LyEnc.js";
import { p as parseISO } from "./parseISO-BZpuPkuQ.js";
import { a as isToday } from "./isToday-RL2Fg3s3.js";
import { i as isThisMonth } from "./isThisMonth-C4UtR1WR.js";
import { a as startOfDay, f as format } from "./format-BDODTvac.js";
import { i as isWithinInterval } from "./isWithinInterval-BCwcG1Bq.js";
import { a as addDays } from "./isSameMonth-fupOC6M2.js";
import { i as isFuture } from "./isFuture-CwVXNIni.js";
import "./attachmentService-B1K5TSm1.js";
import "./card-5_9pbgKs.js";
import "./clock-C-1UQMq-.js";
import "./play-BwxbIHvy.js";
import "./square-pen-Dr9mhwBZ.js";
import "./paperclip-DDW-rwXv.js";
import "./download-qf94484n.js";
import "./arrow-right-TrnDYsFi.js";
import "./checkbox-qHm_4cmk.js";
import "./index-D6Uc8srH.js";
import "./circle-check-big-Cwck6DPV.js";
import "./link-CjUUS0B-.js";
import "./globe-CuQXKfU6.js";
import "./list-todo-B9y_ixvA.js";
import "./chevron-left-zAeTltYW.js";
function FilteredTasksPage() {
  const { filterType } = useParams();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const navigate = useNavigate();
  const { currentUser, activeRole } = useUser();
  const [tasks, setTasks] = reactExports.useState([]);
  const [projects, setProjects] = reactExports.useState([]);
  const [teamMembers, setTeamMembers] = reactExports.useState([]);
  const [departments, setDepartments] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [dateFilter, setDateFilter] = reactExports.useState("month");
  const [customDateRange, setCustomDateRange] = reactExports.useState(void 0);
  reactExports.useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData, projectsData, usersData, departmentsData] = await Promise.all([
          taskService.getAll(),
          projectService.getAll(),
          userService.getAll(),
          departmentService.getAll()
        ]);
        setTasks(tasksData);
        setProjects(projectsData);
        setTeamMembers(usersData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const filteredTasks = reactExports.useMemo(() => {
    if (!filterType) return [];
    const flattenTasks = (taskList) => {
      const flattened = [];
      const seenIds = /* @__PURE__ */ new Set();
      const recurse = (items) => {
        for (const item of items) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            flattened.push(item);
            if (item.subtasks && item.subtasks.length > 0) {
              recurse(item.subtasks);
            }
          }
        }
      };
      recurse(taskList);
      return flattened;
    };
    const allFlatTasks = flattenTasks(tasks);
    const today = /* @__PURE__ */ new Date();
    const isTaskCompleted = (t) => {
      if (t.userStatus === "complete") return true;
      let stage = void 0;
      if (t.projectId && projects.length > 0) {
        const project = projects.find((p) => String(p.id) === String(t.projectId));
        if (project && t.projectStage) {
          stage = project.stages.find((s) => String(s.id) === String(t.projectStage));
        }
      }
      if (!stage && t.projectStage && projects.length > 0) {
        const project = projects.find((p) => p.stages.some((s) => String(s.id) === String(t.projectStage)));
        stage = project?.stages.find((s) => String(s.id) === String(t.projectStage));
      }
      if (stage) {
        const title = stage.title.toLowerCase().trim();
        return ["complete", "completed", "archive", "done", "finished", "closed"].includes(title);
      }
      return false;
    };
    return allFlatTasks.filter((task) => {
      if (task.parentId) return false;
      const excludedProjectIds = new Set(
        projects.filter((p) => p.isArchived || p.status === "on-hold").map((p) => p.id)
      );
      const isExcludedProject = task.projectId && excludedProjectIds.has(task.projectId);
      const isCompleted = isTaskCompleted(task);
      if (isExcludedProject && !isCompleted) return false;
      if (userId) {
        const targetUser = teamMembers.find((u) => String(u.id) === String(userId));
        if (targetUser) {
          const isAssigned = task.assignee === targetUser.name || task.assignedUsers && task.assignedUsers.some((u) => String(u.id) === String(userId));
          if (!isAssigned) return false;
        }
      } else if (currentUser) {
        if (activeRole === "user" || activeRole === "account-manager") {
          const isAssigned = task.assignee === currentUser.name || task.assignedUsers && task.assignedUsers.some((u) => String(u.id) === String(currentUser.id));
          if (!isAssigned) return false;
        } else if (activeRole === "team-lead") {
          const departmentMembers = teamMembers.filter((member) => member.department === currentUser.department).map((member) => member.name);
          const isAssignedToDepartment = departmentMembers.includes(task.assignee) || task.assignedUsers && task.assignedUsers.some((u) => departmentMembers.includes(u.name));
          const taskProject = projects.find((p) => p.id === task.projectId || p.name === task.project);
          const isProjectInDepartment = taskProject?.department?.id === currentUser.department;
          if (!isAssignedToDepartment && !isProjectInDepartment) {
            return false;
          }
        }
      }
      if (projects && task.projectStage) {
        const project = projects.find((p) => String(p.id) === String(task.projectId));
        if (project) {
          const stage = project.stages.find((s) => String(s.id) === String(task.projectStage));
          if (stage && ["suggested", "suggested task"].includes(stage.title.toLowerCase().trim())) {
            return false;
          }
        }
      }
      switch (filterType) {
        case "due-today":
          return !isTaskCompleted(task) && task.dueDate && isToday(new Date(task.dueDate));
        case "overdue":
          return !isTaskCompleted(task) && task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
        case "today-workload":
          return !isTaskCompleted(task) && task.dueDate && new Date(task.dueDate) <= endOfDay(today);
        // Includes today and past (overdue)
        case "upcoming":
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          const nextWeek = addDays(today, 7);
          return !isTaskCompleted(task) && isFuture(dueDate) && dueDate <= nextWeek;
        case "completed":
          if (!isTaskCompleted(task)) return false;
          if (dateFilter !== "all") {
            const dateStr = task.completedAt || task.createdAt;
            if (!dateStr) return dateFilter === "all";
            const taskDate = parseISO(dateStr);
            if (dateFilter === "today") {
              return isToday(taskDate);
            } else if (dateFilter === "week") {
              return isThisWeek(taskDate, { weekStartsOn: 1 });
            } else if (dateFilter === "month") {
              return isThisMonth(taskDate);
            } else if (dateFilter === "custom" && customDateRange?.from) {
              const start = startOfDay(customDateRange.from);
              const end = customDateRange.to ? endOfDay(customDateRange.to) : endOfDay(customDateRange.from);
              return isWithinInterval(taskDate, { start, end });
            }
          }
          return true;
        default:
          return true;
      }
    });
  }, [tasks, projects, filterType, currentUser, dateFilter, customDateRange]);
  const getPageTitle = () => {
    switch (filterType) {
      case "due-today":
        return "Due Today";
      case "overdue":
        return "Overdue Tasks";
      case "upcoming":
        return "Upcoming Tasks (7 Days)";
      case "completed":
        return "Completed Tasks";
      case "today-workload": {
        const targetUser = teamMembers.find((u) => String(u.id) === String(userId));
        return targetUser ? `${targetUser.name}'s Today Workload` : "Today Workload";
      }
      default:
        return "Tasks";
    }
  };
  const systemStages = [
    { id: "pending", title: "Pending", color: "bg-status-todo", order: 0, type: "user" },
    { id: "in-progress", title: "In Progress", color: "bg-status-progress", order: 1, type: "user" },
    { id: "complete", title: "Completed", color: "bg-status-done", order: 2, type: "user" }
  ];
  const [viewTask, setViewTask] = reactExports.useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = reactExports.useState(false);
  const handleViewTask = (task) => {
    setViewTask(task);
    setIsViewDialogOpen(true);
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-10 rounded-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-48 mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-32" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg border bg-card space-y-3", children: [
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => navigate(-1), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: getPageTitle() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
            filteredTasks.length,
            " tasks found"
          ] })
        ] })
      ] }),
      filterType === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: dateFilter, onValueChange: setDateFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectTrigger, { className: "w-[180px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-4 w-4 mr-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Filter by date" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Time" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "today", children: "Today" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "week", children: "This Week" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "month", children: "This Month" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "custom", children: "Custom Range" })
          ] })
        ] }),
        dateFilter === "custom" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
            customDateRange?.from ? customDateRange.to ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              format(customDateRange.from, "MMM d"),
              " - ",
              format(customDateRange.to, "MMM d, yyyy")
            ] }) : format(customDateRange.from, "MMM d, yyyy") : "Select dates"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-auto p-0", align: "end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Calendar$1,
            {
              initialFocus: true,
              mode: "range",
              defaultMonth: customDateRange?.from,
              selected: customDateRange,
              onSelect: setCustomDateRange,
              numberOfMonths: 2
            }
          ) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: [
      filteredTasks.map((task) => {
        let taskStage;
        if (task.projectStage && projects) {
          const project = projects.find((p) => p.stages.some((s) => s.id === task.projectStage));
          const stage = project?.stages.find((s) => s.id === task.projectStage);
          if (stage) {
            taskStage = stage;
          }
        }
        if (task.userStatus === "complete" && !taskStage) {
          taskStage = systemStages[2];
        }
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
            onView: () => handleViewTask(task),
            canManage: false,
            canDrag: false,
            currentStage: taskStage
          },
          task.id
        );
      }),
      filteredTasks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No tasks found for this category." }) })
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
export {
  FilteredTasksPage as default
};
