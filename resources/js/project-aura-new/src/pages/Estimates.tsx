import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Estimate, EstimateStatus } from "@/types/estimate";
import { Client } from "@/types/client";
import { estimateService } from "@/services/estimateService";
import { clientService } from "@/services/clientService";
import { projectService } from "@/services/projectService";
import { Project } from "@/types/project";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { EstimateDialog } from "@/components/EstimateDialog";
import { Plus, Search, FileText, Trash2, Edit, Eye, Building2, RefreshCw, ExternalLink, CheckCircle2 } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const statusConfig: Record<EstimateStatus, { label: string; className: string }> = {
	draft: { label: "Draft", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
	sent: { label: "Sent", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
	approved: { label: "Approved", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
	rejected: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
};

export default function Estimates() {
	const [estimates, setEstimates] = useState<Estimate[]>([]);
	const [clients, setClients] = useState<Client[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<EstimateStatus | "all">("all");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editEstimate, setEditEstimate] = useState<Estimate | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Estimate | null>(null);
	const [isSyncingXero, setIsSyncingXero] = useState(false);
	const [xeroConnected, setXeroConnected] = useState<boolean | null>(null);
	const { toast } = useToast();
	const navigate = useNavigate();
	const { currentUser } = useUser();

	const fetchEstimates = async () => {
		setLoading(true);
		try {
			const data = await estimateService.getAll();
			setEstimates(data);
		} catch {
			toast({ title: "Error", description: "Failed to load estimates.", variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const fetchClients = async () => {
			try {
				const data = await clientService.getAll();
				setClients(data);
			} catch (error) {
				console.error("Failed to load clients for estimate form:", error);
			}
		};
		const fetchProjects = async () => {
			try {
				const data = await projectService.getAll();
				setProjects(data);
			} catch (error) {
				console.error("Failed to load projects for estimate form:", error);
			}
		};
		const checkXero = async () => {
			try {
				const status = await estimateService.xeroStatus();
				setXeroConnected(status.connected);
			} catch {
				setXeroConnected(false);
			}
		};
		fetchClients();
		fetchProjects();
		fetchEstimates();
		checkXero();
	}, []);

	const handleSave = async (payload: Omit<Estimate, 'id' | 'created_at' | 'updated_at' | 'client'>) => {
		try {
			if (editEstimate?.id) {
				await estimateService.update(editEstimate.id, payload);
				toast({ title: "Estimate updated successfully." });
			} else {
				await estimateService.create(payload);
				toast({ title: "Estimate created successfully." });
			}
			setEditEstimate(null);
			fetchEstimates();
		} catch {
			toast({ title: "Error", description: "Failed to save estimate.", variant: "destructive" });
		}
	};

	const handleXeroSync = async () => {
		setIsSyncingXero(true);
		try {
			const result = await estimateService.syncFromXero();
			toast({
				title: "Xero sync complete",
				description: `${result.created} created · ${result.updated} updated · ${result.skipped} skipped`,
			});
			fetchEstimates();
		} catch (err: any) {
			toast({
				title: "Xero sync failed",
				description: err?.response?.data?.message ?? "Please check your Xero connection.",
				variant: "destructive",
			});
		} finally {
			setIsSyncingXero(false);
		}
	};

	const handleConnectXero = async () => {
		try {
			const { url } = await estimateService.xeroAuthUrl();
			window.location.href = url;
		} catch {
			toast({ title: "Error", description: "Failed to get Xero auth URL.", variant: "destructive" });
		}
	};

	const handleDelete = async () => {
		if (!deleteTarget?.id) return;
		try {
			await estimateService.delete(deleteTarget.id);
			toast({ title: "Estimate deleted." });
			fetchEstimates();
		} catch {
			toast({ title: "Error", description: "Failed to delete estimate.", variant: "destructive" });
		} finally {
			setDeleteTarget(null);
		}
	};

	const filtered = estimates.filter(e => {
		const matchesSearch =
			e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(e.client?.company_name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
			(e.estimate_number ?? "").toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = statusFilter === "all" || e.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	// Summary counts
	const counts = estimates.reduce(
		(acc, e) => { acc[e.status] = (acc[e.status] ?? 0) + 1; return acc; },
		{} as Record<EstimateStatus, number>
	);

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Estimates</h1>
					<p className="text-muted-foreground text-sm mt-0.5">Manage client quotations — synced from Xero</p>
				</div>
				<div className="flex gap-2">
					{xeroConnected === false && (currentUser?.role === 'admin' || currentUser?.role === 'hr') && (
						<Button variant="outline" onClick={handleConnectXero}>
							<ExternalLink className="h-4 w-4 mr-2" /> Connect Xero
						</Button>
					)}
					{xeroConnected && (currentUser?.role === 'admin' || currentUser?.role === 'hr') && (
						<Button variant="outline" onClick={handleXeroSync} disabled={isSyncingXero}>
							<RefreshCw className={`h-4 w-4 mr-2 ${isSyncingXero ? 'animate-spin' : ''}`} />
							{isSyncingXero ? 'Syncing...' : 'Sync from Xero'}
						</Button>
					)}
					<Button onClick={() => { setEditEstimate(null); setIsDialogOpen(true); }}>
						<Plus className="h-4 w-4 mr-2" /> New Estimate
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				{(["draft", "sent", "approved", "rejected"] as EstimateStatus[]).map(status => (
					<Card
						key={status}
						className="cursor-pointer hover:shadow-md transition-shadow"
						onClick={() => setStatusFilter(prev => prev === status ? "all" : status)}
					>
						<CardContent className="p-4">
							<div className="text-2xl font-bold">{counts[status] ?? 0}</div>
							<Badge className={`${statusConfig[status].className} mt-1 capitalize text-xs`}>
								{statusConfig[status].label}
							</Badge>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Filters */}
			<div className="flex gap-3">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search estimates..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EstimateStatus | "all")}>
					<SelectTrigger className="w-[140px]">
						<SelectValue placeholder="Filter status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="draft">Draft</SelectItem>
						<SelectItem value="sent">Sent</SelectItem>
						<SelectItem value="approved">Approved</SelectItem>
						<SelectItem value="rejected">Rejected</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Estimate List */}
			{loading ? (
				<div className="space-y-3">
					{[1, 2, 3].map(i => (
						<Skeleton key={i} className="h-20 w-full rounded-lg" />
					))}
				</div>
			) : filtered.length === 0 ? (
				<div className="text-center py-16">
					<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
					<h3 className="text-lg font-semibold text-muted-foreground">
						{searchQuery || statusFilter !== "all" ? "No estimates match your filters" : "No estimates yet"}
					</h3>
					{!searchQuery && statusFilter === "all" && (
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => { setEditEstimate(null); setIsDialogOpen(true); }}
						>
							<Plus className="h-4 w-4 mr-2" /> Create your first estimate
						</Button>
					)}
				</div>
			) : (
				<div className="space-y-3">
					{filtered.map(estimate => (
						<Card key={estimate.id} className="hover:shadow-md transition-shadow">
							<CardContent className="p-4">
								<div className="flex items-center justify-between gap-4">
									<div
										className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
										onClick={() => navigate(`/estimates/${estimate.id}`)}
									>
										<div className="p-2 rounded-md bg-muted shrink-0">
											<FileText className="h-4 w-4 text-muted-foreground" />
										</div>
										<div className="min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<span className="font-semibold truncate">{estimate.title}</span>
												{estimate.estimate_number && (
													<span className="text-xs text-muted-foreground font-mono">
														#{estimate.estimate_number}
													</span>
												)}
												<Badge className={`${statusConfig[estimate.status].className} text-xs`}>
													{statusConfig[estimate.status].label}
												</Badge>
												{estimate.xero_estimate_id && (
													<Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 text-[10px] px-1.5 py-0.5 flex items-center gap-1">
														<CheckCircle2 className="h-2.5 w-2.5" /> Xero
													</Badge>
												)}
											</div>
											<div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
												<Building2 className="h-3 w-3" />
												<span className="truncate">{estimate.client?.company_name ?? "Unknown client"}</span>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-4 shrink-0">
										{estimate.total_amount !== undefined && (
											<span className="font-semibold text-right hidden sm:block">
												{estimate.currency === "LKR" ? "Rs. " : "$"}{estimate.total_amount.toFixed(2)}
											</span>
										)}
										{estimate.valid_until && (
											<span className="text-xs text-muted-foreground hidden md:block">
												Valid until {new Date(estimate.valid_until).toLocaleDateString()}
											</span>
										)}
										<div className="flex gap-1">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => navigate(`/estimates/${estimate.id}`)}
												title="View"
											>
												<Eye className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => { setEditEstimate(estimate); setIsDialogOpen(true); }}
												title="Edit"
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => setDeleteTarget(estimate)}
												title="Delete"
												className="hover:text-destructive"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Create / Edit Dialog */}
			<EstimateDialog
				open={isDialogOpen}
				onOpenChange={(open) => {
					setIsDialogOpen(open);
					if (!open) setEditEstimate(null);
				}}
				onSave={handleSave}
				editEstimate={editEstimate}
				clients={clients}
				projects={projects}
			/>

			{/* Delete Confirmation */}
			<AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Estimate</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
