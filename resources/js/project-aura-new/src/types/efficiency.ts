export interface TaskTimeLog {
	id: number;
	taskId: number;
	userId: number;
	startedAt: string;
	endedAt?: string;
	hoursLogged?: number;
	notes?: string;
	user?: {
		id: number;
		name: string;
		email: string;
	};
	createdAt?: string;
	updatedAt?: string;
}

export interface TaskEfficiencyMetrics {
	taskId: number;
	taskName: string;
	estimatedHours: number;
	actualHours: number;
	efficiencyPercentage: number;
	varianceHours: number;
	assignee?: {
		id: number;
		name: string;
	};
}

export interface ProjectEfficiency {
	totalTasks: number;
	averageEfficiency: number;
	onTimeCount: number;
	delayedCount: number;
	onTimePercentage: number;
	tasks: TaskEfficiencyMetrics[];
}

export interface UserEfficiency {
	userId: number;
	userName: string;
	totalTasks: number;
	totalHoursWorked: number;
	totalHoursEstimated: number;
	averageEfficiency: number;
	tasks: Array<{
		taskId: number;
		taskName: string;
		projectName: string;
		estimatedHours: number;
		userHoursWorked: number;
		efficiencyPercentage: number;
	}>;
}

export interface EfficiencyTrend {
	date: string;
	hoursWorked: number;
	hoursEstimated: number;
	efficiencyPercentage: number;
}

export interface UserEfficiencyTrends {
	userId: number;
	userName: string;
	periodDays: number;
	trends: EfficiencyTrend[];
}

export interface DepartmentEfficiency {
	departmentId: number;
	totalUsers: number;
	totalTasks: number;
	totalHoursWorked: number;
	totalHoursEstimated: number;
	averageEfficiency: number;
	users: Array<{
		userId: number;
		userName: string;
		efficiency: number;
		tasksCompleted: number;
	}>;
}
