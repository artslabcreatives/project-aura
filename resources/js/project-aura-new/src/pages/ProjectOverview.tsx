import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Project } from "@/types/project";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { Task } from "@/types/task";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ProjectOverviewContent } from "@/components/ProjectOverviewContent";

export default function ProjectOverview() {
	const { projectId } = useParams<{ projectId: string }>();
	const [project, setProject] = useState<Project | null>(null);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			if (!projectId) return;
			setLoading(true);
			try {
				let found: Project | null = null;
				const allProjects = await projectService.getAll();

				if (/^\d+$/.test(projectId)) {
					found = allProjects.find(p => String(p.id) === projectId) || null;
				} else {
					const decoded = decodeURIComponent(projectId);
					found = allProjects.find(p => p.name === decoded) || null;
					if (!found) {
						const slug = projectId.toLowerCase();
						found = allProjects.find(p => p.name.toLowerCase().replace(/\s+/g, '-') === slug) || null;
					}
				}

				if (found) {
					setProject(found);
					const projectTasks = await taskService.getAll({ projectId: String(found.id) });
					setTasks(projectTasks);
				}
			} catch (error) {
				console.error("Failed to fetch project overview data:", error);
				toast({ title: "Error", description: "Failed to load project details", variant: "destructive" });
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [projectId, toast]);

	if (loading) {
		return (
			<div className="p-8 space-y-6">
				<div className="flex justify-between items-start">
					<div className="space-y-2">
						<Skeleton className="h-10 w-64" />
						<Skeleton className="h-4 w-96" />
					</div>
					<Skeleton className="h-6 w-24" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Skeleton className="h-40 w-full" />
					<Skeleton className="h-40 w-full" />
					<Skeleton className="h-40 w-full" />
				</div>
				<Skeleton className="h-80 w-full" />
			</div>
		);
	}

	if (!project) {
		return (
			<div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
				<AlertCircle className="h-12 w-12 text-muted-foreground" />
				<h2 className="text-xl font-semibold">Project Not Found</h2>
				<button
					onClick={() => navigate("/")}
					className="text-primary hover:underline"
				>
					Back to Dashboard
				</button>
			</div>
		);
	}

	return (
		<div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
			<ProjectOverviewContent
				project={project}
				tasks={tasks}
				onProjectUpdate={setProject}
				showBackButton
				showKanbanButton
			/>
		</div>
	);
}
