import { ad as createLucideIcon, ax as api, bI as normalizeNumber } from "./index-C4ZP3eFM.js";
const Target = createLucideIcon("Target", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]
]);
const mapUserEfficiency = (raw) => ({
  userId: raw.user_id,
  userName: raw.user_name,
  totalTasks: raw.total_tasks,
  totalHoursWorked: normalizeNumber(raw.total_hours_worked),
  totalHoursEstimated: normalizeNumber(raw.total_hours_estimated),
  averageEfficiency: normalizeNumber(raw.average_efficiency),
  tasks: raw.tasks.map((task) => ({
    taskId: task.task_id,
    taskName: task.task_name,
    projectName: task.project_name ?? "No project linked",
    estimatedHours: normalizeNumber(task.estimated_hours),
    userHoursWorked: normalizeNumber(task.user_hours_worked),
    efficiencyPercentage: normalizeNumber(task.efficiency_percentage)
  }))
});
const mapDepartmentEfficiency = (raw) => ({
  departmentId: raw.department_id,
  totalUsers: raw.total_users,
  totalTasks: raw.total_tasks,
  totalHoursWorked: normalizeNumber(raw.total_hours_worked),
  totalHoursEstimated: normalizeNumber(raw.total_hours_estimated),
  averageEfficiency: normalizeNumber(raw.average_efficiency),
  users: raw.users.map((user) => ({
    userId: user.user_id,
    userName: user.user_name,
    efficiency: normalizeNumber(user.efficiency),
    tasksCompleted: user.tasks_completed
  }))
});
const efficiencyService = {
  getUserEfficiency: async (userId) => {
    const response = await api.get(`/users/${userId}/efficiency`);
    return mapUserEfficiency(response);
  },
  getDepartmentEfficiency: async (departmentId) => {
    const response = await api.get(`/departments/${departmentId}/efficiency`);
    return mapDepartmentEfficiency(response);
  }
};
export {
  Target as T,
  efficiencyService as e
};
