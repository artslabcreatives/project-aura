import { useState, useMemo, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { HistoryEntry } from "@/types/history";
import { User } from "@/types/task";
import { format, isValid } from "date-fns";
import { Stage } from "@/types/stage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { historyService } from "@/services/historyService";
import {
	Search,
	FolderPlus,
	FolderGit2,
	Plus,
	Edit,
	Trash2,
	UserPlus,
	Play,
	CheckCircle,
	AlertTriangle,
	Layers,
	Clock,
	HelpCircle,
	History,
	Loader2,
	ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	history: HistoryEntry[];
	teamMembers: User[];
	stages?: Stage[];
	loading?: boolean;
	projectId?: string;
}

export const HistoryDialog = ({ open, onOpenChange, history, teamMembers, stages = [], loading, projectId }: HistoryDialogProps) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [activeTab, setActiveTab] = useState("all");

	// Pagination states
	const [localHistory, setLocalHistory] = useState<HistoryEntry[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const [localLoading, setLocalLoading] = useState(false);
	const [totalCount, setTotalCount] = useState(0);

	// Load first page of history when dialog is opened
	useEffect(() => {
		if (open && projectId) {
			const fetchInitialHistory = async () => {
				setLocalLoading(true);
				try {
					const result = await historyService.getByProjectPaginated(projectId, 1, 15);
					setLocalHistory(result.data);
					setPage(1);
					setHasMore(1 < result.lastPage);
					setTotalCount(result.total);
				} catch (error) {
					console.error("Failed to load initial project history", error);
				} finally {
					setLocalLoading(false);
				}
			};
			fetchInitialHistory();
		}
	}, [open, projectId]);

	const handleLoadMore = async () => {
		if (!projectId || localLoading || !hasMore) return;
		setLocalLoading(true);
		const nextPage = page + 1;
		try {
			const result = await historyService.getByProjectPaginated(projectId, nextPage, 15);
			setLocalHistory(prev => [...prev, ...result.data]);
			setPage(nextPage);
			setHasMore(nextPage < result.lastPage);
			setTotalCount(result.total);
		} catch (error) {
			console.error("Failed to load more project history", error);
		} finally {
			setLocalLoading(false);
		}
	};

	const getUserInfo = (entry: HistoryEntry) => {
		if (entry.user) {
			return {
				name: entry.user.name,
				role: entry.user.role || "Unknown Role",
				avatar: (entry.user as any).avatar || undefined,
				id: entry.user.id
			};
		}
		const user = teamMembers.find(member => member.id === entry.userId);
		return {
			name: user?.name || "Unknown User",
			role: user?.role || "Unknown Role",
			avatar: user?.avatar || undefined,
			id: user?.id
		};
	};

	const getStageName = (stageId: string) => {
		if (!stageId) return "Unknown Stage";
		const stage = stages.find(s => String(s.id) === String(stageId));
		const title = stage ? stage.title : String(stageId);
		if (typeof title !== 'string') return "Unknown Stage";
		return title.toLowerCase().trim() === 'pending' ? 'Backlog' : title;
	};

	const renderDetails = (entry: HistoryEntry) => {
		const { action, details } = entry;
		const d = details as any;

		switch (action) {
			case 'CREATE_PROJECT':
				return `created project "${d.name}"`;
			case 'UPDATE_PROJECT':
				return `updated project status from "${d.from}" to "${d.to}"`;
			case 'CREATE_TASK':
				return `created task "${d.title}"`;
			case 'UPDATE_TASK':
				return `updated task "${d.to?.title || d.title || 'Unknown'}"`;
			case 'DELETE_TASK':
				return `deleted task "${d.title}"`;
			case 'UPDATE_TASK_STATUS':
				if (d.action === 'approved') {
					return `approved task and moved to "${getStageName(d.targetStage)}"`;
				}
				if (d.action === 'revision_requested') {
					return `requested revision and moved task to "${getStageName(d.targetStage)}"`;
				}
				return `moved task from "${getStageName(d.from)}" to "${getStageName(d.to)}"`;
			case 'UPDATE_TASK_ASSIGNEE':
				return `assigned task to ${d.to}`;
			case 'CREATE_STAGE':
				return `created stage "${d.title}"`;
			case 'UPDATE_STAGE':
				return `updated stage "${d.to?.title || 'Unknown'}"`;
			case 'DELETE_STAGE':
				return `deleted stage "${d.title}"`;
			case 'USER_START_TASK':
				return `started task "${d.title}"`;
			case 'USER_COMPLETE_TASK':
				return `completed task "${d.title}"`;
			default:
				return "performed an unknown action";
		}
	};

	const getActionConfig = (action: string, details: any) => {
		switch (action) {
			case 'CREATE_PROJECT':
				return {
					icon: FolderPlus,
					colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
					glowClass: "group-hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]",
				};
			case 'UPDATE_PROJECT':
				return {
					icon: FolderGit2,
					colorClass: "bg-sky-500/10 text-sky-600 border-sky-500/20",
					glowClass: "group-hover:shadow-[0_0_15px_rgba(14,165,233,0.15)]",
				};
			case 'CREATE_TASK':
				return {
					icon: Plus,
					colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
					glowClass: "group-hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]",
				};
			case 'UPDATE_TASK':
				return {
					icon: Edit,
					colorClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
					glowClass: "group-hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]",
				};
			case 'DELETE_TASK':
				return {
					icon: Trash2,
					colorClass: "bg-rose-500/10 text-rose-600 border-rose-500/20",
					glowClass: "group-hover:shadow-[0_0_15px_rgba(244,63,94,0.15)]",
				};
			case 'UPDATE_TASK_STATUS':
				if (details?.action === 'approved') {
					return {
						icon: CheckCircle,
						colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
						glowClass: "group-hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]",
					};
				}
				if (details?.action === 'revision_requested') {
					return {
						icon: AlertTriangle,
						colorClass: "bg-rose-500/10 text-rose-600 border-rose-500/20",
						glowClass: "group-hover:shadow-[0_0_15px_rgba(244,63,94,0.15)]",
					};
				}
				return {
					icon: Layers,
					colorClass: "bg-purple-500/10 text-purple-600 border-purple-500/20",
					glowClass: "group-hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]",
				};
			case 'UPDATE_TASK_ASSIGNEE':
				return {
					icon: UserPlus,
					colorClass: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
					glowClass: "group-hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]",
				};
			case 'CREATE_STAGE':
				return {
					icon: Plus,
					colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
					glowClass: "group-hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]",
				};
			case 'UPDATE_STAGE':
				return {
					icon: Edit,
					colorClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
					glowClass: "group-hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]",
				};
			case 'DELETE_STAGE':
				return {
					icon: Trash2,
					colorClass: "bg-rose-500/10 text-rose-600 border-rose-500/20",
					glowClass: "group-hover:shadow-[0_0_15px_rgba(244,63,94,0.15)]",
				};
			case 'USER_START_TASK':
				return {
					icon: Play,
					colorClass: "bg-teal-500/10 text-teal-600 border-teal-500/20",
					glowClass: "group-hover:shadow-[0_0_15px_rgba(20,184,166,0.15)]",
				};
			case 'USER_COMPLETE_TASK':
				return {
					icon: CheckCircle,
					colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
					glowClass: "group-hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]",
				};
			default:
				return {
					icon: HelpCircle,
					colorClass: "bg-slate-500/10 text-slate-600 border-slate-500/20",
					glowClass: "group-hover:shadow-[0_0_15px_rgba(100,116,139,0.15)]",
				};
		}
	};

	const displayHistory = useMemo(() => {
		return projectId ? localHistory : history;
	}, [projectId, localHistory, history]);

	const filteredHistory = useMemo(() => {
		return displayHistory.filter(entry => {
			const userInfo = getUserInfo(entry);
			const actionDesc = renderDetails(entry);
			const matchesSearch =
				userInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				actionDesc.toLowerCase().includes(searchTerm.toLowerCase());

			if (!matchesSearch) return false;

			if (activeTab === "all") return true;
			if (activeTab === "tasks") {
				return [
					'CREATE_TASK', 'UPDATE_TASK', 'DELETE_TASK',
					'UPDATE_TASK_STATUS', 'UPDATE_TASK_ASSIGNEE',
					'USER_START_TASK', 'USER_COMPLETE_TASK'
				].includes(entry.action);
			}
			if (activeTab === "stages") {
				return ['CREATE_STAGE', 'UPDATE_STAGE', 'DELETE_STAGE'].includes(entry.action);
			}
			if (activeTab === "project") {
				return ['CREATE_PROJECT', 'UPDATE_PROJECT', 'DELETE_PROJECT'].includes(entry.action);
			}
			return true;
		});
	}, [displayHistory, searchTerm, activeTab, teamMembers]);

	const badgeCount = projectId ? totalCount : filteredHistory.length;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
				<DialogHeader className="pb-2">
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle className="text-2xl font-bold tracking-tight">Project History & Milestones</DialogTitle>
							<DialogDescription className="mt-1 text-sm text-muted-foreground">
								A comprehensive vertical timeline tracking all stage updates, tasks, and project events.
							</DialogDescription>
						</div>
						<Badge variant="secondary" className="px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary border-none">
							{badgeCount} Event{badgeCount === 1 ? "" : "s"}
						</Badge>
					</div>
				</DialogHeader>

				{/* Interactive Search & Tab Filters */}
				<div className="flex flex-col sm:flex-row items-center gap-3 py-3 border-b">
					<div className="relative w-full sm:flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by action or user..."
							className="pl-9 h-9"
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
						/>
					</div>
					<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
						<TabsList className="grid grid-cols-4 h-9 p-0.5 bg-muted/60">
							<TabsTrigger value="all" className="text-xs py-1.5 px-3 rounded-md">All</TabsTrigger>
							<TabsTrigger value="tasks" className="text-xs py-1.5 px-3 rounded-md">Tasks</TabsTrigger>
							<TabsTrigger value="stages" className="text-xs py-1.5 px-3 rounded-md">Stages</TabsTrigger>
							<TabsTrigger value="project" className="text-xs py-1.5 px-3 rounded-md">Project</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>

				{/* Visual Milestone Steps Timeline */}
				<div className="h-[60vh] overflow-y-auto mt-4 pr-3">
					{loading && page === 1 && localHistory.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-20 space-y-3">
							<div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
							<p className="text-sm text-muted-foreground">Loading project history...</p>
						</div>
					) : filteredHistory.length > 0 ? (
						<div className="relative pl-10 sm:pl-12 space-y-6 before:absolute before:left-5 sm:before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-border before:via-border/60 before:to-border/10 pb-6 animate-in fade-in duration-300">
							{filteredHistory.map((entry) => {
								const userInfo = getUserInfo(entry);
								const initials = userInfo.name ? userInfo.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "";
								const userAvatarUrl = userInfo.avatar || (userInfo.id ? `/api/users/${userInfo.id}/avatar` : undefined);
								const config = getActionConfig(entry.action, entry.details);
								const IconComponent = config.icon;
								const timestamp = entry.timestamp ? new Date(entry.timestamp) : null;

								return (
									<div
										key={entry.id}
										className="relative group transition-all duration-300 animate-in slide-in-from-bottom-2"
									>
										{/* Step Circular Icon Badge */}
										<div
											className={cn(
												"absolute -left-[34px] sm:-left-[38px] top-1 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300 z-10 border bg-card",
												config.colorClass,
												config.glowClass
											)}
										>
											<IconComponent className="h-3.5 w-3.5" />
										</div>

										{/* Milestone Step Card */}
										<div className="p-4 border rounded-xl bg-card hover:bg-accent/10 hover:border-muted-foreground/20 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md">
											<div className="flex items-center gap-3 min-w-0">
												<Avatar className="h-8 w-8 border border-muted-foreground/10 flex-shrink-0">
													{userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userInfo.name} />}
													<AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
														{initials}
													</AvatarFallback>
												</Avatar>
												<div className="min-w-0">
													<div className="flex items-center gap-2 flex-wrap">
														<span className="font-semibold text-sm text-foreground truncate">{userInfo.name}</span>
														<span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium capitalize">
															{userInfo.role}
														</span>
													</div>
													<p className="text-sm mt-0.5 text-muted-foreground leading-relaxed">
														{renderDetails(entry)}
													</p>
												</div>
											</div>

											{/* Step Timestamp */}
											<div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap self-end sm:self-center shrink-0">
												<Clock className="h-3 w-3" />
												<span>
													{timestamp && isValid(timestamp) ? format(timestamp, "MMM dd, yyyy 'at' hh:mm a") : "Unknown date"}
												</span>
											</div>
										</div>
									</div>
								);
							})}

							{/* Load More Button */}
							{hasMore && (
								<div className="flex justify-center pt-4 pb-2">
									<Button
										variant="outline"
										onClick={handleLoadMore}
										disabled={localLoading}
										className="gap-2 px-6 h-9 rounded-lg hover:bg-primary/5 hover:text-primary transition-all duration-300 font-medium shadow-sm"
									>
										{localLoading ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												Loading more...
											</>
										) : (
											<>
												<ChevronDown className="h-4 w-4" />
												Load More Milestones
											</>
										)}
									</Button>
								</div>
							)}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-20 text-center">
							<History className="h-10 w-10 text-muted-foreground/45 stroke-[1.5] mb-2" />
							<p className="text-sm font-medium text-muted-foreground">No matching history events found.</p>
							<p className="text-xs text-muted-foreground/75 mt-1">Try broadening your search or switching categories.</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};
