import { j as jsxRuntimeExports, G as Search, I as Input, H as useParams, v as useUser, l as reactExports, F as useToast, S as Skeleton, B as Button, P as Plus, x as projectService, w as taskService, D as userService, E as departmentService } from "./index-C4ZP3eFM.js";
import { T as ToggleGroup, a as ToggleGroupItem, L as LayoutGrid, K as KanbanBoard, b as TaskListView } from "./toggle-group-CaAmqKYR.js";
import { T as TaskDialog } from "./TaskDialog-C-uIVVSP.js";
import { S as SearchableSelect } from "./searchable-select-BMuxGeaS.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { a as attachmentService } from "./attachmentService-B1K5TSm1.js";
import { L as List } from "./list-CgjYpKvJ.js";
import "./TaskCard-DsczT6D6.js";
import "./square-pen-Dr9mhwBZ.js";
import "./format-BDODTvac.js";
import "./clock-C-1UQMq-.js";
import "./calendar-B2-LyEnc.js";
import "./paperclip-DDW-rwXv.js";
import "./play-BwxbIHvy.js";
import "./download-qf94484n.js";
import "./arrow-right-TrnDYsFi.js";
import "./card-5_9pbgKs.js";
import "./checkbox-qHm_4cmk.js";
import "./index-D6Uc8srH.js";
import "./circle-check-big-Cwck6DPV.js";
import "./link-CjUUS0B-.js";
import "./globe-CuQXKfU6.js";
import "./list-todo-B9y_ixvA.js";
import "./isToday-RL2Fg3s3.js";
import "./rich-text-editor-CK9AOqrB.js";
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
import "./chevrons-up-down-DISs2Pfx.js";
const userStages = [
  { id: "pending", title: "Pending", color: "bg-status-todo", order: 0, type: "user" },
  { id: "in-progress", title: "In Progress", color: "bg-status-progress", order: 1, type: "user" },
  { id: "complete", title: "Complete", color: "bg-status-done", order: 2, type: "user" }
];
function TaskFilters({
  searchQuery,
  onSearchChange,
  selectedProject,
  onProjectChange,
  selectedStatus,
  onStatusChange,
  selectedAssignee = "all",
  onAssigneeChange,
  selectedTag = "all",
  onTagChange,
  availableProjects,
  availableStatuses,
  teamMembers = [],
  departments = [],
  allTasks = [],
  selectedDateFilter,
  onDateFilterChange
}) {
  const getTaskCountForAssignee = (assigneeName) => {
    return allTasks.filter((task) => {
      const isPrimary = task.assignee === assigneeName;
      const isSecondary = task.assignedUsers?.some((u) => u.name === assigneeName);
      return isPrimary || isSecondary;
    }).length;
  };
  const getDepartmentName = (departmentId) => {
    if (!departmentId) return "Uncategorized";
    const id = departmentId.toString();
    const dept = departments.find((d) => d.id.toString() === id);
    return dept ? dept.name : "Uncategorized";
  };
  const projectOptions = [
    { value: "all", label: "All Projects" },
    ...availableProjects.map((project) => ({
      value: project.name,
      // Using name as value to match existing logic
      label: project.name,
      group: project.department ? project.department.name : "Uncategorized"
    }))
  ];
  const assigneeOptions = [
    { value: "all", label: "All Assignees" },
    ...teamMembers.map((member) => {
      const taskCount = getTaskCountForAssignee(member.name);
      return {
        value: member.name,
        label: `${member.name} (${taskCount})`,
        group: getDepartmentName(member.department)
      };
    })
  ];
  const availableTags = Array.from(
    new Set(
      allTasks.flatMap((task) => task.tags || [])
    )
  ).sort();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-4 flex-wrap", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Search tasks...",
          value: searchQuery,
          onChange: (e) => onSearchChange(e.target.value),
          className: "pl-9"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full sm:w-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SearchableSelect,
      {
        value: selectedProject,
        onValueChange: onProjectChange,
        options: projectOptions,
        placeholder: "Select Project"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full sm:w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedStatus, onValueChange: onStatusChange, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Status" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Status" }),
        availableStatuses.map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: status.id, children: status.title }, status.id))
      ] })
    ] }) }),
    onAssigneeChange && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full sm:w-[200px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SearchableSelect,
      {
        value: selectedAssignee,
        onValueChange: onAssigneeChange,
        options: assigneeOptions,
        placeholder: "Select Assignee"
      }
    ) }),
    onTagChange && availableTags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full sm:w-[180px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedTag, onValueChange: onTagChange, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Tags" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Tags" }),
        availableTags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: tag, children: tag }, tag))
      ] })
    ] }) }),
    onDateFilterChange && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full sm:w-[150px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedDateFilter || "all", onValueChange: onDateFilterChange, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All Time" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "today", children: "Today" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "tomorrow", children: "Tomorrow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "this-week", children: "This Week" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "this-month", children: "This Month" })
      ] })
    ] }) })
  ] });
}
const fixedKanbanStages = [
  { id: "pending", title: "Pending", color: "bg-status-todo", order: 0, type: "user" },
  { id: "in-progress", title: "In Progress", color: "bg-status-progress", order: 1, type: "user" },
  { id: "complete", title: "Completed", color: "bg-status-done", order: 2, type: "user" }
];
function Tasks() {
  const { projectId } = useParams();
  const numericProjectId = projectId ? parseInt(projectId, 10) : null;
  const { currentUser, activeRole } = useUser();
  const [allTasks, setAllTasks] = reactExports.useState([]);
  const [allProjects, setAllProjects] = reactExports.useState([]);
  const [teamMembers, setTeamMembers] = reactExports.useState([]);
  const [departments, setDepartments] = reactExports.useState([]);
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [editingTask, setEditingTask] = reactExports.useState(null);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [selectedProject, setSelectedProject] = reactExports.useState("all");
  const [selectedStatus, setSelectedStatus] = reactExports.useState("all");
  const [selectedAssignee, setSelectedAssignee] = reactExports.useState("all");
  const [selectedTag, setSelectedTag] = reactExports.useState("all");
  const [selectedDateFilter, setSelectedDateFilter] = reactExports.useState("this-week");
  const { toast } = useToast();
  const [view, setView] = reactExports.useState("kanban");
  const [loading, setLoading] = reactExports.useState(true);
  const loadData = async () => {
    setLoading(true);
    try {
      const projectsData = await projectService.getAll();
      setAllProjects(projectsData);
      const tasksData = await taskService.getAll();
      setAllTasks(tasksData);
      const usersData = await userService.getAll();
      setTeamMembers(usersData);
      const departmentsData = await departmentService.getAll();
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    loadData();
  }, []);
  reactExports.useEffect(() => {
    if (numericProjectId && allProjects.length > 0) {
      const proj = allProjects.find((p) => p.id === numericProjectId);
      setSelectedProject(proj ? proj.name : "all");
    } else {
      setSelectedProject("all");
    }
  }, [numericProjectId, allProjects]);
  const currentProjectObj = reactExports.useMemo(() => {
    if (selectedProject === "all") return null;
    return allProjects.find((p) => p.name === selectedProject);
  }, [selectedProject, allProjects]);
  const canCreateTask = reactExports.useMemo(() => {
    if (!currentProjectObj) return true;
    const hasPO = !!currentProjectObj.poDocumentUrl || !!currentProjectObj.poNumber;
    const hasActiveGracePeriod = !!currentProjectObj.gracePeriodExpiresAt && new Date(currentProjectObj.gracePeriodExpiresAt) >= /* @__PURE__ */ new Date();
    const hasActiveProvisionalPO = !!currentProjectObj.provisionalPoNumber && !!currentProjectObj.provisionalPoExpiresAt && new Date(currentProjectObj.provisionalPoExpiresAt) >= /* @__PURE__ */ new Date();
    return !currentProjectObj.isLockedByPo || hasPO || hasActiveGracePeriod || hasActiveProvisionalPO;
  }, [currentProjectObj]);
  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const task = allTasks.find((t) => t.id === taskId);
      if (!task) return;
      const finalUpdates = { ...updates };
      if (updates.projectStage && ["pending", "in-progress", "complete"].includes(updates.projectStage)) {
        const targetColumn = updates.projectStage;
        finalUpdates.userStatus = targetColumn;
        const project2 = allProjects.find((p) => p.name === task.project);
        if (project2) {
          let mappedStage;
          if (targetColumn === "pending") {
            mappedStage = project2.stages.find(
              (s) => s.title.toLowerCase().trim() === "pending"
            );
          } else if (targetColumn === "complete") {
            mappedStage = project2.stages.find(
              (s) => ["completed", "complete"].includes(s.title.toLowerCase().trim())
            );
          } else if (targetColumn === "in-progress") {
            const systemTitles = [
              "suggested",
              "suggested task",
              "pending",
              "complete",
              "completed",
              "archive"
            ];
            mappedStage = project2.stages.find(
              (s) => !systemTitles.includes(s.title.toLowerCase().trim())
            );
          }
          if (mappedStage) {
            finalUpdates.projectStage = mappedStage.id;
          } else {
            delete finalUpdates.projectStage;
          }
        } else {
          delete finalUpdates.projectStage;
        }
      }
      const updatedTask = { ...task, ...finalUpdates };
      if (finalUpdates.userStatus === "complete" && task.userStatus !== "complete") {
        const reviewingTag = "Specific Stage";
        const currentTags = updatedTask.tags || [];
        if (!currentTags.includes(reviewingTag)) {
          updatedTask.tags = [...currentTags, reviewingTag];
        }
        updatedTask.isInSpecificStage = true;
        updatedTask.completedAt = (/* @__PURE__ */ new Date()).toISOString();
        const taskProject = allProjects.find((p) => p.id === (task.projectId ?? -1)) || allProjects.find((p) => p.name === task.project);
        if (taskProject) {
          const reviewStage = taskProject.stages.find(
            (s) => s.title === "Specific Stage"
          );
          if (reviewStage) {
            updatedTask.projectStage = reviewStage.id;
          }
        }
      }
      const {
        project,
        assignee,
        projectStage,
        startStageId: startStageIdStr,
        assignedUsers,
        ...cleanUpdates
      } = updatedTask;
      const updatePayload = {
        ...cleanUpdates,
        projectId: updatedTask.projectId,
        assigneeId: updatedTask.assignee ? parseInt(teamMembers.find((m) => m.name === updatedTask.assignee)?.id || "0", 10) : void 0,
        projectStageId: updatedTask.projectStage ? parseInt(String(updatedTask.projectStage), 10) : void 0,
        startStageId: startStageIdStr ? parseInt(String(startStageIdStr), 10) : void 0
      };
      const savedTask = await taskService.update(taskId, updatePayload);
      setAllTasks((prev) => prev.map((t) => t.id === taskId ? savedTask : t));
      toast({
        title: "Task updated",
        description: "The task has been updated successfully."
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleTaskSave = async (taskData, pendingFiles, pendingLinks) => {
    try {
      const projectId2 = allProjects.find((p) => p.name === taskData.project)?.id;
      const assigneeIdRaw = teamMembers.find((m) => m.name === taskData.assignee)?.id;
      const assigneeId = assigneeIdRaw ? parseInt(assigneeIdRaw, 10) : void 0;
      const projectStageId = taskData.projectStage ? parseInt(String(taskData.projectStage), 10) : void 0;
      const startStageId = taskData.startStageId ? parseInt(String(taskData.startStageId), 10) : void 0;
      const {
        project,
        assignee,
        projectStage,
        startStageId: _startStageIdStr,
        assignedUsers,
        ...cleanTaskData
      } = taskData;
      const payload = {
        ...cleanTaskData,
        projectId: projectId2,
        assigneeId,
        projectStageId,
        startStageId
      };
      if (editingTask) {
        const savedTask = await taskService.update(editingTask.id, payload);
        setAllTasks(
          (prev) => prev.map(
            (task) => task.id === editingTask.id ? savedTask : task
          )
        );
        toast({ title: "Task updated", description: "The task has been updated successfully." });
      } else {
        const newTask = await taskService.create({
          ...payload,
          userStatus: "pending"
        });
        if (pendingFiles?.length) {
          try {
            const uploadedAttachments = await attachmentService.uploadFiles(
              newTask.id,
              pendingFiles
            );
            newTask.attachments = [...newTask.attachments || [], ...uploadedAttachments];
          } catch (uploadError) {
            console.error("Failed to upload attachments:", uploadError);
            toast({
              title: "Warning",
              description: "Task created but some attachments failed to upload.",
              variant: "destructive"
            });
          }
        }
        if (pendingLinks?.length) {
          try {
            for (const link of pendingLinks) {
              const uploadedLink = await attachmentService.addLink(
                newTask.id,
                link.name,
                link.url
              );
              newTask.attachments = [...newTask.attachments || [], uploadedLink];
            }
          } catch (linkError) {
            console.error("Failed to add links:", linkError);
            toast({
              title: "Warning",
              description: "Task created but some links failed to add.",
              variant: "destructive"
            });
          }
        }
        setAllTasks((prev) => [...prev, newTask]);
        toast({ title: "Task created", description: "The task has been created successfully." });
      }
      setEditingTask(null);
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: "Failed to save task. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleTaskEdit = (task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };
  const handleTaskDelete = async (taskId) => {
    try {
      await taskService.delete(taskId);
      setAllTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast({ title: "Task deleted", description: "The task has been deleted successfully." });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive"
      });
    }
  };
  const allCategorizedTasks = reactExports.useMemo(() => {
    const isTaskCompleted = (task) => {
      if (task.userStatus === "complete") return true;
      let stage = void 0;
      if (task.projectId && allProjects.length > 0) {
        const project = allProjects.find((p) => String(p.id) === String(task.projectId));
        if (project && task.projectStage) {
          stage = project.stages.find((s) => String(s.id) === String(task.projectStage));
        }
      }
      if (!stage && task.projectStage && allProjects.length > 0) {
        const project = allProjects.find((p) => p.stages.some((s) => String(s.id) === String(task.projectStage)));
        stage = project?.stages.find((s) => String(s.id) === String(task.projectStage));
      }
      if (stage) {
        const title = stage.title.toLowerCase().trim();
        return ["complete", "completed", "archive", "done", "finished", "closed"].includes(title);
      }
      return false;
    };
    const excludedProjectIds = new Set(
      allProjects.filter((p) => p.isArchived || p.status === "on-hold").map((p) => p.id)
    );
    let tasksToProcess = allTasks.filter((task) => {
      const isCompleted = isTaskCompleted(task);
      const isExcludedProject = task.projectId && excludedProjectIds.has(task.projectId);
      return isCompleted || !isExcludedProject;
    });
    if (activeRole === "team-lead") {
      const departmentMembers = teamMembers.filter((member) => member.department === currentUser.department).map((member) => member.name);
      const currentDept = departments.find((d) => d.id === currentUser.department);
      const isDigitalDept = currentDept?.name.toLowerCase() === "digital";
      let allAllowedMembers = departmentMembers;
      if (isDigitalDept) {
        const designDept = departments.find((d) => d.name.toLowerCase() === "design");
        if (designDept) {
          const designMembers = teamMembers.filter((member) => member.department === designDept.id).map((member) => member.name);
          allAllowedMembers = [...departmentMembers, ...designMembers];
        }
      }
      tasksToProcess = tasksToProcess.filter((task) => {
        const isAssignedToDepartment = allAllowedMembers.includes(task.assignee);
        const taskProject = allProjects.find((p) => p.id === (task.projectId ?? -1)) || allProjects.find((p) => p.name === task.project);
        const isProjectInDepartment = taskProject?.department?.id === currentUser.department;
        const isDesignProject = isDigitalDept && taskProject?.department?.name.toLowerCase() === "design";
        return isAssignedToDepartment || isProjectInDepartment || isDesignProject;
      });
    } else if (activeRole === "account-manager") {
      const departmentMembers = teamMembers.filter((member) => member.department === currentUser.department).map((member) => member.name);
      tasksToProcess = tasksToProcess.filter((task) => {
        const isAssignedToDepartment = departmentMembers.includes(task.assignee);
        const taskProject = allProjects.find((p) => p.id === (task.projectId ?? -1)) || allProjects.find((p) => p.name === task.project);
        const isProjectInDepartment = taskProject?.department?.id === currentUser.department;
        return isAssignedToDepartment || isProjectInDepartment;
      });
    }
    return tasksToProcess.map((task) => {
      let fixedStageId = null;
      const project = allProjects.find((p) => p.name === task.project);
      const stage = project?.stages.find((s) => s.id === task.projectStage);
      if (stage) {
        const title = stage.title.toLowerCase().trim();
        if (title === "pending") fixedStageId = "pending";
        else if (title === "completed" || title === "complete") fixedStageId = "complete";
        else if (title.includes("suggested") || title === "archive") fixedStageId = null;
        else fixedStageId = "in-progress";
      } else {
        if (task.userStatus === "complete") fixedStageId = "complete";
        else if (task.userStatus === "pending") fixedStageId = "pending";
        else fixedStageId = "in-progress";
      }
      return { ...task, fixedStageId };
    }).filter((t) => t.fixedStageId !== null);
  }, [allTasks, allProjects, currentUser, teamMembers, departments]);
  const filteredTasks = reactExports.useMemo(() => {
    let tasksToFilter = allCategorizedTasks;
    if (selectedProject !== "all") {
      tasksToFilter = tasksToFilter.filter((task) => task.project === selectedProject);
    }
    if (selectedAssignee !== "all") {
      tasksToFilter = tasksToFilter.filter((task) => {
        const isPrimaryAssignee = task.assignee === selectedAssignee;
        const isSecondaryAssignee = task.assignedUsers?.some((u) => u.name === selectedAssignee);
        return isPrimaryAssignee || isSecondaryAssignee;
      });
    }
    if (selectedTag !== "all") {
      tasksToFilter = tasksToFilter.filter((task) => task.tags && task.tags.includes(selectedTag));
    }
    tasksToFilter = tasksToFilter.filter(
      (task) => task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (selectedStatus !== "all") {
      tasksToFilter = tasksToFilter.filter((task) => task.fixedStageId === selectedStatus);
    }
    if (selectedDateFilter !== "all") {
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      tasksToFilter = tasksToFilter.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (selectedDateFilter === "today") {
          return dueDate.getTime() === today.getTime();
        } else if (selectedDateFilter === "tomorrow") {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return dueDate.getTime() === tomorrow.getTime();
        } else if (selectedDateFilter === "this-week") {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return dueDate >= startOfWeek && dueDate <= endOfWeek;
        } else if (selectedDateFilter === "this-month") {
          return dueDate.getMonth() === today.getMonth() && dueDate.getFullYear() === today.getFullYear();
        }
        return true;
      });
    }
    return tasksToFilter;
  }, [allCategorizedTasks, selectedProject, selectedAssignee, selectedTag, searchQuery, selectedStatus, selectedDateFilter]);
  const tasksForKanban = reactExports.useMemo(() => {
    return filteredTasks.map((task) => ({
      ...task,
      projectStage: task.fixedStageId
    }));
  }, [filteredTasks]);
  const tasksForList = reactExports.useMemo(() => {
    return filteredTasks.map((task) => ({
      ...task,
      projectStage: task.fixedStageId
    }));
  }, [filteredTasks]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 h-full flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-48" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-64" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-24" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-32" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-64" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-32" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-32" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-32" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full gap-6 overflow-auto pb-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 w-80 flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full rounded-lg" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [1, 2, 3].map((j) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg border bg-card space-y-3", children: [
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
        ] }, j)) })
      ] }, i)) }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 h-full flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: selectedProject !== "all" ? selectedProject : "All Tasks" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: selectedProject !== "all" ? `Manage tasks for ${selectedProject} project` : "Manage and organize your tasks" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          ToggleGroup,
          {
            type: "single",
            value: view,
            onValueChange: (value) => value && setView(value),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItem, { value: "kanban", "aria-label": "Kanban view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ToggleGroupItem, { value: "list", "aria-label": "List view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-4 w-4" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => {
              if (!canCreateTask) {
                toast({
                  title: "PO Required",
                  description: "This project requires a Purchase Order (PO) before tasks can be created.",
                  variant: "destructive"
                });
                return;
              }
              setEditingTask(null);
              setIsDialogOpen(true);
            },
            className: "gap-2",
            variant: canCreateTask ? "default" : "destructive",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
              "New Task"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TaskFilters,
      {
        searchQuery,
        onSearchChange: setSearchQuery,
        selectedProject,
        onProjectChange: setSelectedProject,
        selectedStatus,
        onStatusChange: setSelectedStatus,
        selectedAssignee,
        onAssigneeChange: setSelectedAssignee,
        selectedTag,
        onTagChange: setSelectedTag,
        availableProjects: allProjects.filter((p) => !p.isArchived).filter((p) => {
          if (activeRole === "admin") return true;
          if (activeRole === "team-lead" || activeRole === "account-manager") {
            return p.department?.id === currentUser.department;
          }
          return true;
        }),
        availableStatuses: fixedKanbanStages,
        teamMembers,
        departments,
        allTasks,
        selectedDateFilter,
        onDateFilterChange: setSelectedDateFilter
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto", children: view === "kanban" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      KanbanBoard,
      {
        tasks: tasksForKanban,
        stages: fixedKanbanStages,
        useProjectStages: true,
        onTaskUpdate: handleTaskUpdate,
        onTaskEdit: handleTaskEdit,
        onTaskDelete: handleTaskDelete,
        canManageTasks: activeRole !== "user",
        canDragTasks: false,
        disableBacklogRenaming: true,
        teamMembers,
        departments,
        allTasks,
        onRefresh: loadData
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      TaskListView,
      {
        tasks: tasksForList,
        stages: fixedKanbanStages,
        onTaskEdit: handleTaskEdit,
        onTaskDelete: handleTaskDelete,
        onTaskUpdate: handleTaskUpdate,
        teamMembers,
        departments,
        canManage: activeRole !== "user",
        showProjectColumn: true
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TaskDialog,
      {
        open: isDialogOpen,
        onOpenChange: (open) => {
          setIsDialogOpen(open);
          if (!open) setEditingTask(null);
        },
        onSave: handleTaskSave,
        editTask: editingTask,
        availableProjects: allProjects.filter((p) => !p.isArchived).map((p) => p.name),
        allProjects: allProjects.filter((p) => !p.isArchived),
        availableStatuses: userStages,
        useProjectStages: false,
        teamMembers,
        departments,
        allTasks,
        currentUser,
        fixedDepartmentId: allProjects.find((p) => p.name === selectedProject)?.department?.id
      }
    )
  ] });
}
export {
  Tasks as default
};
