import { useEffect, useMemo, useState } from 'react';
import { Building2, Clock, TrendingUp } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Department } from '@/types/department';
import { departmentService } from '@/services/departmentService';
import { DepartmentEfficiencyDashboard } from '@/components/DepartmentEfficiencyDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const SELECTABLE_ROLES = ['admin', 'hr'];

export default function DepartmentEfficiency() {
	const { currentUser } = useUser();
	const [departments, setDepartments] = useState<Department[]>([]);
	const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
	const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

	const canSelectDepartment = currentUser ? SELECTABLE_ROLES.includes(currentUser.role) : false;

	useEffect(() => {
		if (!currentUser) {
			return;
		}

		setSelectedDepartmentId(currentUser.department || '');
	}, [currentUser]);

	useEffect(() => {
		if (!currentUser || !canSelectDepartment) {
			return;
		}

		const loadDepartments = async () => {
			try {
				setIsLoadingDepartments(true);
				const response = await departmentService.getAll();
				setDepartments(response);
			} catch (error) {
				console.error('Failed to load departments:', error);
			} finally {
				setIsLoadingDepartments(false);
			}
		};

		void loadDepartments();
	}, [canSelectDepartment, currentUser]);

	useEffect(() => {
		if (selectedDepartmentId || departments.length === 0) {
			return;
		}

		const firstDepartmentId = departments[0]?.id;
		const isUserDepartmentValid = !!currentUser?.department && departments.some((department) => department.id === currentUser.department);
		const defaultDepartmentId = isUserDepartmentValid
			? currentUser.department
			: firstDepartmentId;

		if (!defaultDepartmentId) {
			return;
		}

		setSelectedDepartmentId(defaultDepartmentId);
	}, [currentUser?.department, departments, selectedDepartmentId]);

	const selectedDepartmentName = useMemo(() => {
		if (selectedDepartmentId === currentUser?.department) {
			return departments.find((department) => department.id === selectedDepartmentId)?.name || 'Your Department';
		}

		return departments.find((department) => department.id === selectedDepartmentId)?.name || 'Department';
	}, [currentUser?.department, departments, selectedDepartmentId]);

	if (!currentUser) return null;

	if (!selectedDepartmentId && canSelectDepartment) {
		return (
			<div className="space-y-6 fade-in">
				<div className="flex items-center gap-3">
					<div className="p-3 rounded-xl bg-primary/10 text-primary">
						<Building2 className="h-8 w-8" />
					</div>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Department Efficiency</h1>
						<p className="text-muted-foreground">
							{isLoadingDepartments ? 'Loading departments...' : 'No departments are available yet.'}
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (!selectedDepartmentId) {
		return (
			<div className="space-y-6 fade-in">
				<div className="flex items-center gap-3">
					<div className="p-3 rounded-xl bg-primary/10 text-primary">
						<Building2 className="h-8 w-8" />
					</div>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Department Efficiency</h1>
						<p className="text-muted-foreground">No department is assigned to your account yet.</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 fade-in">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<div className="p-3 rounded-xl bg-primary/10 text-primary">
						<Building2 className="h-8 w-8" />
					</div>
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Department Efficiency</h1>
						<p className="text-muted-foreground">
							Monitor team-wide completion performance for {selectedDepartmentName}.
						</p>
					</div>
				</div>

				{canSelectDepartment && (
					<div className="w-full md:w-72">
						<Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
							<SelectTrigger>
								<SelectValue placeholder={isLoadingDepartments ? 'Loading departments...' : 'Select department'} />
							</SelectTrigger>
							<SelectContent>
								{departments.map((department) => (
									<SelectItem key={department.id} value={department.id}>
										{department.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5 text-primary" />
						Department Metrics
					</CardTitle>
				</CardHeader>
				<CardContent>
					<DepartmentEfficiencyDashboard departmentId={selectedDepartmentId} />
				</CardContent>
			</Card>

			<Card className="bg-muted/50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Clock className="h-5 w-5 text-muted-foreground" />
						How Department Efficiency Works
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					<p>
						<strong>Department Efficiency:</strong> (Combined estimated hours / combined logged hours) × 100
					</p>
					<p>
						• <strong>Above 100%:</strong> The department is completing tracked work ahead of estimate
					</p>
					<p>
						• <strong>Around 100%:</strong> The department is tracking close to plan
					</p>
					<p>
						• <strong>Below 100%:</strong> Logged work is taking longer than estimated
					</p>
					<p className="mt-4 text-xs">
						Only completed tasks with logged time are included, matching the backend efficiency rules.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
