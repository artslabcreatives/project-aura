import { api } from '@/lib/api';
import { DepartmentEfficiency, UserEfficiency } from '@/types/efficiency';

type RawUserEfficiency = {
	user_id: number;
	user_name: string;
	total_tasks: number;
	total_hours_worked: number;
	total_hours_estimated: number;
	average_efficiency: number;
	tasks: Array<{
		task_id: number;
		task_name: string;
		project_name: string | null;
		estimated_hours: number;
		user_hours_worked: number;
		efficiency_percentage: number;
	}>;
};

type RawDepartmentEfficiency = {
	department_id: number;
	total_users: number;
	total_tasks: number;
	total_hours_worked: number;
	total_hours_estimated: number;
	average_efficiency: number;
	users: Array<{
		user_id: number;
		user_name: string;
		efficiency: number;
		tasks_completed: number;
	}>;
};

const mapUserEfficiency = (raw: RawUserEfficiency): UserEfficiency => ({
	userId: raw.user_id,
	userName: raw.user_name,
	totalTasks: raw.total_tasks,
	totalHoursWorked: raw.total_hours_worked,
	totalHoursEstimated: raw.total_hours_estimated,
	averageEfficiency: raw.average_efficiency,
	tasks: raw.tasks.map((task) => ({
		taskId: task.task_id,
		taskName: task.task_name,
		projectName: task.project_name ?? 'No project linked',
		estimatedHours: task.estimated_hours,
		userHoursWorked: task.user_hours_worked,
		efficiencyPercentage: task.efficiency_percentage,
	})),
});

const mapDepartmentEfficiency = (raw: RawDepartmentEfficiency): DepartmentEfficiency => ({
	departmentId: raw.department_id,
	totalUsers: raw.total_users,
	totalTasks: raw.total_tasks,
	totalHoursWorked: raw.total_hours_worked,
	totalHoursEstimated: raw.total_hours_estimated,
	averageEfficiency: raw.average_efficiency,
	users: raw.users.map((user) => ({
		userId: user.user_id,
		userName: user.user_name,
		efficiency: user.efficiency,
		tasksCompleted: user.tasks_completed,
	})),
});

export const efficiencyService = {
	getUserEfficiency: async (userId: number | string): Promise<UserEfficiency> => {
		const response = await api.get<RawUserEfficiency>(`/users/${userId}/efficiency`);
		return mapUserEfficiency(response);
	},

	getDepartmentEfficiency: async (departmentId: number | string): Promise<DepartmentEfficiency> => {
		const response = await api.get<RawDepartmentEfficiency>(`/departments/${departmentId}/efficiency`);
		return mapDepartmentEfficiency(response);
	},
};
