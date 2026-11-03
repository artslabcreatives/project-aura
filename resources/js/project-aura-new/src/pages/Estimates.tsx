import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Estimate, EstimateStatus } from "@/types/estimate";
import { Invoice } from "@/types/financial";
import { Client } from "@/types/client";
import { Project } from "@/types/project";
import { estimateService } from "@/services/estimateService";
import { invoiceService } from "@/services/invoiceService";
import { clientService } from "@/services/clientService";
import { projectService } from "@/services/projectService";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent } from "@/components/ui/card";
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
import { InvoiceUploadDialog } from "@/components/InvoiceUploadDialog";
import { InvoiceViewDialog } from "@/components/InvoiceViewDialog";
import {
	Plus,
	Search,
	FileText,
	Receipt,
	Trash2,
	Edit,
	Eye,
	Building2,
	FolderOpen,
	RefreshCw,
	ExternalLink,
	CheckCircle2,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Download,
} from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

// ── Estimate Status Config ──────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; className: string }> = {
	draft: { label: "Draft", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
	sent: { label: "Sent", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
	approved: { label: "Approved", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
	accepted: { label: "Accepted", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
	invoiced: { label: "Invoiced", className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
	rejected: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
	deleted: { label: "Deleted", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
};

const getStatusConfig = (status: string) => {
	return statusConfig[status] || {
		label: status.charAt(0).toUpperCase() + status.slice(1),
		className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
	};
};

// ── Invoice Status Config ───────────────────────────────────────────────────
const invoiceStatusConfig: Record<string, { label: string; className: string }> = {
	paid: { label: "Paid", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
	authorised: { label: "Authorised", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
	draft: { label: "Draft", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
	voided: { label: "Voided", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
	deleted: { label: "Deleted", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
};

const getInvoiceStatusConfig = (status?: string, xeroStatus?: string) => {
	const raw = (xeroStatus || status || "draft").toLowerCase();
	return invoiceStatusConfig[raw] || {
		label: raw.charAt(0).toUpperCase() + raw.slice(1),
		className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
	};
};

// ── Pagination Interface & Component ─────────────────────────────────────────
interface PaginationMeta {
	current_page: number;
	last_page: number;
	total: number;
	from: number | null;
	to: number | null;
}

function PaginationBar({ meta, onPageChange }: { meta: PaginationMeta; onPageChange: (page: number) => void }) {
	if (meta.last_page <= 1) return null;

	const { current_page, last_page, total, from, to } = meta;

	const pages: (number | "…")[] = [];
	if (last_page <= 7) {
		for (let i = 1; i <= last_page; i++) pages.push(i);
	} else {
		pages.push(1);
		if (current_page > 3) pages.push("…");
		for (let i = Math.max(2, current_page - 1); i <= Math.min(last_page - 1, current_page + 1); i++) {
			pages.push(i);
		}
		if (current_page < last_page - 2) pages.push("…");
		pages.push(last_page);
	}

	return (
		<div className="flex items-center justify-between pt-3">
			<p className="text-sm text-muted-foreground">
				{from && to ? `Showing ${from}–${to} of ${total}` : `${total} total`}
			</p>
			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					disabled={current_page === 1}
					onClick={() => onPageChange(current_page - 1)}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				{pages.map((p, i) =>
					p === "…" ? (
						<span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">
							…
						</span>
					) : (
						<Button
							key={p}
							variant={p === current_page ? "default" : "outline"}
							size="icon"
							className="h-8 w-8 text-xs"
							onClick={() => onPageChange(p)}
						>
							{p}
						</Button>
					)
				)}
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					disabled={current_page === last_page}
					onClick={() => onPageChange(current_page + 1)}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}

export default function Estimates() {
	const [searchParams, setSearchParams] = useSearchParams();
	const initialTab = searchParams.get("tab") === "invoices" ? "invoices" : "quotations";
	const [activeTab, setActiveTab] = useState<"quotations" | "invoices">(initialTab);

	// ── Quotations (Estimates) State ──────────────────────────────────────────
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

	// ── Invoices State ────────────────────────────────────────────────────────
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [invoicesLoading, setInvoicesLoading] = useState(false);
	const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
	const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("all");
	const [invoicePage, setInvoicePage] = useState(1);
	const [invoiceMeta, setInvoiceMeta] = useState<PaginationMeta>({
		current_page: 1,
		last_page: 1,
		total: 0,
		from: null,
		to: null,
	});
	const [invoiceStats, setInvoiceStats] = useState<{
		paid: number;
		authorised: number;
		draft: number;
		voided: number;
		total: number;
		total_amount: number;
	} | null>(null);
	const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);
	const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<Invoice | null>(null);
	const [deleteInvoiceTarget, setDeleteInvoiceTarget] = useState<Invoice | null>(null);
	const [isInvoiceUploadOpen, setIsInvoiceUploadOpen] = useState(false);
	const [isSyncingInvoices, setIsSyncingInvoices] = useState(false);

	const { toast } = useToast();
	const navigate = useNavigate();
	const { activeRole } = useUser();

	const handleTabChange = (tab: "quotations" | "invoices") => {
		setActiveTab(tab);
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.set("tab", tab);
				return next;
			},
			{ replace: true }
		);
	};

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

	const fetchInvoices = async (
		search = invoiceSearchQuery,
		status = invoiceStatusFilter,
		page = invoicePage
	) => {
		setInvoicesLoading(true);
		try {
			const filters: any = {
				page,
				perPage: 15,
			};
			if (search.trim()) filters.search = search.trim();
			if (status !== "all") filters.status = status;

			const res = await invoiceService.getAll(filters);
			setInvoices(res.data);
			setInvoiceMeta({
				current_page: res.currentPage,
				last_page: res.lastPage,
				total: res.total,
				from: res.from,
				to: res.to,
			});
		} catch {
			toast({ title: "Error", description: "Failed to load invoices.", variant: "destructive" });
		} finally {
			setInvoicesLoading(false);
		}
	};

	const fetchInvoiceStats = async () => {
		try {
			const stats = await invoiceService.getStats();
			setInvoiceStats(stats);
		} catch (error) {
			console.error("Failed to load invoice stats:", error);
		}
	};

	useEffect(() => {
		const fetchClients = async () => {
			try {
				const data = await clientService.getAll();
				setClients(data);
			} catch (error) {
				console.error("Failed to load clients:", error);
			}
		};
		const fetchProjects = async () => {
			try {
				const data = await projectService.getAll();
				setProjects(data);
			} catch (error) {
				console.error("Failed to load projects:", error);
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
		fetchInvoiceStats();
		checkXero();
	}, []);

	// Debounce invoice search and reload when filters change
	useEffect(() => {
		if (activeTab === "invoices") {
			const timer = setTimeout(() => {
				fetchInvoices(invoiceSearchQuery, invoiceStatusFilter, invoicePage);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [activeTab, invoiceSearchQuery, invoiceStatusFilter, invoicePage]);

	// ── Quotations Actions ────────────────────────────────────────────────────
	const handleSave = async (payload: Omit<Estimate, "id" | "created_at" | "updated_at" | "client">) => {
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

	// ── Invoices Actions ──────────────────────────────────────────────────────
	const handleInvoiceXeroSync = async () => {
		setIsSyncingInvoices(true);
		try {
			const result = await invoiceService.syncFromXero();
			toast({
				title: "Xero invoices sync complete",
				description: `Synced ${result.synced ?? 0} invoices from Xero`,
			});
			fetchInvoices();
			fetchInvoiceStats();
		} catch (err: any) {
			toast({
				title: "Xero invoice sync failed",
				description: err?.response?.data?.message ?? "Please check your Xero connection.",
				variant: "destructive",
			});
		} finally {
			setIsSyncingInvoices(false);
		}
	};

	const handleDeleteInvoice = async () => {
		if (!deleteInvoiceTarget?.id) return;
		try {
			await invoiceService.delete(deleteInvoiceTarget.id);
			toast({ title: "Invoice deleted successfully." });
			fetchInvoices();
			fetchInvoiceStats();
		} catch {
			toast({ title: "Error", description: "Failed to delete invoice.", variant: "destructive" });
		} finally {
			setDeleteInvoiceTarget(null);
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

	// Filtered estimates for in-memory display
	const filteredEstimates = estimates.filter((e) => {
		const matchesSearch =
			e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(e.client?.company_name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
			(e.estimate_number ?? "").toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = statusFilter === "all" || e.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	// Estimate summary counts
	const estimateCounts = estimates.reduce(
		(acc, e) => {
			acc[e.status] = (acc[e.status] ?? 0) + 1;
			return acc;
		},
		{} as Record<EstimateStatus, number>
	);

	const formatDisplayDate = (dateStr?: string) => {
		if (!dateStr) return null;
		try {
			return new Date(dateStr).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		} catch {
			return dateStr;
		}
	};

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-3 flex-wrap">
						<h1 className="text-2xl font-bold">
							{activeTab === "quotations" ? "Estimates" : "Invoices"}
						</h1>

						{/* Toggle Switch */}
						<div className="inline-flex items-center p-1 bg-muted/80 rounded-lg border border-border shadow-sm">
							<button
								type="button"
								onClick={() => handleTabChange("quotations")}
								className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
									activeTab === "quotations"
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								<FileText className="h-4 w-4" />
								<span>Quotations</span>
								<Badge variant="secondary" className="text-[11px] px-1.5 py-0 h-5 font-mono">
									{estimates.length}
								</Badge>
							</button>
							<button
								type="button"
								onClick={() => handleTabChange("invoices")}
								className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
									activeTab === "invoices"
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								<Receipt className="h-4 w-4" />
								<span>Invoices</span>
								<Badge variant="secondary" className="text-[11px] px-1.5 py-0 h-5 font-mono">
									{invoiceStats ? invoiceStats.total.toLocaleString() : "..."}
								</Badge>
							</button>
						</div>
					</div>

					<p className="text-muted-foreground text-sm mt-1">
						{activeTab === "quotations"
							? "Manage client quotations — synced from Xero"
							: "Manage client invoices — synced from Xero"}
					</p>
				</div>

				<div className="flex gap-2 flex-wrap items-center">
					{xeroConnected === false && (activeRole === "admin" || activeRole === "hr") && (
						<Button variant="outline" onClick={handleConnectXero}>
							<ExternalLink className="h-4 w-4 mr-2" /> Connect Xero
						</Button>
					)}
					{xeroConnected && (activeRole === "admin" || activeRole === "hr") && (
						<Button
							variant="outline"
							onClick={activeTab === "quotations" ? handleXeroSync : handleInvoiceXeroSync}
							disabled={activeTab === "quotations" ? isSyncingXero : isSyncingInvoices}
						>
							<RefreshCw
								className={`h-4 w-4 mr-2 ${
									(activeTab === "quotations" ? isSyncingXero : isSyncingInvoices)
										? "animate-spin"
										: ""
								}`}
							/>
							{activeTab === "quotations"
								? isSyncingXero
									? "Syncing..."
									: "Sync from Xero"
								: isSyncingInvoices
								? "Syncing Invoices..."
								: "Sync from Xero"}
						</Button>
					)}
					{activeTab === "quotations" ? (
						<Button
							onClick={() => {
								setEditEstimate(null);
								setIsDialogOpen(true);
							}}
						>
							<Plus className="h-4 w-4 mr-2" /> New Estimate
						</Button>
					) : (
						<Button
							onClick={() => {
								setSelectedInvoiceForEdit(null);
								setIsInvoiceUploadOpen(true);
							}}
						>
							<Plus className="h-4 w-4 mr-2" /> New Invoice
						</Button>
					)}
				</div>
			</div>

			{/* ── QUOTATIONS VIEW ──────────────────────────────────────────────── */}
			{activeTab === "quotations" && (
				<>
					{/* Summary Cards */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						{(["draft", "sent", "approved", "rejected"] as EstimateStatus[]).map((status) => (
							<Card
								key={status}
								className={`cursor-pointer transition-all ${
									statusFilter === status
										? "ring-2 ring-primary shadow-md"
										: "hover:shadow-md"
								}`}
								onClick={() => setStatusFilter((prev) => (prev === status ? "all" : status))}
							>
								<CardContent className="p-4">
									<div className="text-2xl font-bold">{estimateCounts[status] ?? 0}</div>
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
						<Select
							value={statusFilter}
							onValueChange={(v) => setStatusFilter(v as EstimateStatus | "all")}
						>
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
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-20 w-full rounded-lg" />
							))}
						</div>
					) : filteredEstimates.length === 0 ? (
						<div className="text-center py-16">
							<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
							<h3 className="text-lg font-semibold text-muted-foreground">
								{searchQuery || statusFilter !== "all"
									? "No estimates match your filters"
									: "No estimates yet"}
							</h3>
							{!searchQuery && statusFilter === "all" && (
								<Button
									variant="outline"
									className="mt-4"
									onClick={() => {
										setEditEstimate(null);
										setIsDialogOpen(true);
									}}
								>
									<Plus className="h-4 w-4 mr-2" /> Create your first estimate
								</Button>
							)}
						</div>
					) : (
						<div className="space-y-3">
							{filteredEstimates.map((estimate) => (
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
														<Badge
															className={`${
																getStatusConfig(estimate.status).className
															} text-xs`}
														>
															{getStatusConfig(estimate.status).label}
														</Badge>
														{estimate.xero_estimate_id && (
															<Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 text-[10px] px-1.5 py-0.5 flex items-center gap-1">
																<CheckCircle2 className="h-2.5 w-2.5" /> Xero
															</Badge>
														)}
													</div>
													<div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
														<Building2 className="h-3 w-3" />
														<span className="truncate">
															{estimate.client?.company_name ?? "Unknown client"}
														</span>
													</div>
												</div>
											</div>

											<div className="flex items-center gap-4 shrink-0">
												{estimate.total_amount !== undefined && (
													<span className="font-semibold text-right hidden sm:block">
														{estimate.currency === "LKR" ? "Rs. " : "$"}
														{estimate.total_amount.toFixed(2)}
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
														onClick={() => {
															setEditEstimate(estimate);
															setIsDialogOpen(true);
														}}
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
				</>
			)}

			{/* ── INVOICES VIEW ────────────────────────────────────────────────── */}
			{activeTab === "invoices" && (
				<>
					{/* Summary Cards */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						<Card
							className={`cursor-pointer transition-all ${
								invoiceStatusFilter === "paid"
									? "ring-2 ring-primary shadow-md"
									: "hover:shadow-md"
							}`}
							onClick={() => {
								setInvoiceStatusFilter((prev) => (prev === "paid" ? "all" : "paid"));
								setInvoicePage(1);
							}}
						>
							<CardContent className="p-4">
								<div className="text-2xl font-bold">{invoiceStats?.paid ?? 0}</div>
								<Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 mt-1 capitalize text-xs">
									Paid
								</Badge>
							</CardContent>
						</Card>

						<Card
							className={`cursor-pointer transition-all ${
								invoiceStatusFilter === "authorised"
									? "ring-2 ring-primary shadow-md"
									: "hover:shadow-md"
							}`}
							onClick={() => {
								setInvoiceStatusFilter((prev) => (prev === "authorised" ? "all" : "authorised"));
								setInvoicePage(1);
							}}
						>
							<CardContent className="p-4">
								<div className="text-2xl font-bold">{invoiceStats?.authorised ?? 0}</div>
								<Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 mt-1 capitalize text-xs">
									Authorised
								</Badge>
							</CardContent>
						</Card>

						<Card
							className={`cursor-pointer transition-all ${
								invoiceStatusFilter === "draft"
									? "ring-2 ring-primary shadow-md"
									: "hover:shadow-md"
							}`}
							onClick={() => {
								setInvoiceStatusFilter((prev) => (prev === "draft" ? "all" : "draft"));
								setInvoicePage(1);
							}}
						>
							<CardContent className="p-4">
								<div className="text-2xl font-bold">{invoiceStats?.draft ?? 0}</div>
								<Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 mt-1 capitalize text-xs">
									Draft
								</Badge>
							</CardContent>
						</Card>

						<Card
							className={`cursor-pointer transition-all ${
								invoiceStatusFilter === "voided"
									? "ring-2 ring-primary shadow-md"
									: "hover:shadow-md"
							}`}
							onClick={() => {
								setInvoiceStatusFilter((prev) => (prev === "voided" ? "all" : "voided"));
								setInvoicePage(1);
							}}
						>
							<CardContent className="p-4">
								<div className="text-2xl font-bold">{invoiceStats?.voided ?? 0}</div>
								<Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 mt-1 capitalize text-xs">
									Voided / Deleted
								</Badge>
							</CardContent>
						</Card>
					</div>

					{/* Filters */}
					<div className="flex gap-3">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search invoices by number, client, project..."
								value={invoiceSearchQuery}
								onChange={(e) => {
									setInvoiceSearchQuery(e.target.value);
									setInvoicePage(1);
								}}
								className="pl-9"
							/>
						</div>
						<Select
							value={invoiceStatusFilter}
							onValueChange={(v) => {
								setInvoiceStatusFilter(v);
								setInvoicePage(1);
							}}
						>
							<SelectTrigger className="w-[160px]">
								<SelectValue placeholder="Filter status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="paid">Paid</SelectItem>
								<SelectItem value="authorised">Authorised</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="voided">Voided / Deleted</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Invoices List */}
					{invoicesLoading ? (
						<div className="space-y-3">
							{[1, 2, 3, 4].map((i) => (
								<Skeleton key={i} className="h-20 w-full rounded-lg" />
							))}
						</div>
					) : invoices.length === 0 ? (
						<div className="text-center py-16">
							<Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
							<h3 className="text-lg font-semibold text-muted-foreground">
								{invoiceSearchQuery || invoiceStatusFilter !== "all"
									? "No invoices match your filters"
									: "No invoices yet"}
							</h3>
							{!invoiceSearchQuery && invoiceStatusFilter === "all" && (
								<Button
									variant="outline"
									className="mt-4"
									onClick={() => {
										setSelectedInvoiceForEdit(null);
										setIsInvoiceUploadOpen(true);
									}}
								>
									<Plus className="h-4 w-4 mr-2" /> Create your first invoice
								</Button>
							)}
						</div>
					) : (
						<div className="space-y-3">
							{invoices.map((inv) => {
								const statusCfg = getInvoiceStatusConfig(inv.status, inv.xeroStatus);
								return (
									<Card key={inv.id} className="hover:shadow-md transition-shadow">
										<CardContent className="p-4">
											<div className="flex items-center justify-between gap-4">
												<div
													className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
													onClick={() => navigate(`/invoices/${inv.id}`)}
												>
													<div className="p-2 rounded-md bg-muted shrink-0">
														<Receipt className="h-4 w-4 text-muted-foreground" />
													</div>
													<div className="min-w-0">
														<div className="flex items-center gap-2 flex-wrap">
															<span className="font-semibold truncate">
																{inv.invoiceNumber || `#INV-${inv.id}`}
															</span>
															<Badge className={`${statusCfg.className} text-xs capitalize`}>
																{statusCfg.label}
															</Badge>
															{inv.source === "xero" || inv.xeroInvoiceId ? (
																<Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 text-[10px] px-1.5 py-0.5 flex items-center gap-1">
																	<CheckCircle2 className="h-2.5 w-2.5" /> Xero
																</Badge>
															) : (
																<Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-[10px] px-1.5 py-0.5">
																	Manual
																</Badge>
															)}
															{inv.project && (
																<span className="text-xs text-muted-foreground flex items-center gap-1 font-normal">
																	<FolderOpen className="h-3 w-3" />
																	{inv.project.name}
																</span>
															)}
														</div>
														<div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5 flex-wrap">
															<div className="flex items-center gap-1">
																<Building2 className="h-3 w-3" />
																<span className="truncate">
																	{inv.client?.companyName ?? "Unknown client"}
																</span>
															</div>
															{inv.issuedAt && (
																<div className="flex items-center gap-1 text-xs">
																	<Calendar className="h-3 w-3" />
																	<span>Issued: {formatDisplayDate(inv.issuedAt)}</span>
																</div>
															)}
															{inv.dueDate && (
																<div className="flex items-center gap-1 text-xs">
																	<Calendar className="h-3 w-3" />
																	<span>Due: {formatDisplayDate(inv.dueDate)}</span>
																</div>
															)}
														</div>
													</div>
												</div>

												<div className="flex items-center gap-4 shrink-0">
													{inv.amount !== undefined && (
														<span className="font-semibold text-right hidden sm:block">
															{inv.currency === "LKR"
																? "Rs. "
																: inv.currency === "USD"
																? "$"
																: `${inv.currency} `}
															{Number(inv.amount).toFixed(2)}
														</span>
													)}
													<div className="flex gap-1">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => navigate(`/invoices/${inv.id}`)}
															title="View Details"
														>
															<Eye className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={async () => {
																try {
																	toast({ title: "Downloading Tax Invoice..." });
																	const num = inv.invoiceNumber || `INV-${inv.id}`;
																	await invoiceService.downloadPdf(
																		inv.id,
																		undefined,
																		undefined,
																		undefined,
																		undefined,
																		undefined,
																		undefined,
																		`Tax_Invoice_${num}.pdf`
																	);
																	toast({ title: "Tax Invoice PDF downloaded." });
																} catch (err: any) {
																	toast({
																		title: "Error",
																		description: err?.message || "Failed to download PDF invoice.",
																		variant: "destructive",
																	});
																}
															}}
															title="Download Tax Invoice"
														>
															<Download className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => {
																setSelectedInvoiceForEdit(inv);
																setIsInvoiceUploadOpen(true);
															}}
															title="Edit"
														>
															<Edit className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => setDeleteInvoiceTarget(inv)}
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
								);
							})}
						</div>
					)}

					{/* Pagination Bar */}
					<PaginationBar
						meta={invoiceMeta}
						onPageChange={(page) => setInvoicePage(page)}
					/>
				</>
			)}

			{/* ── Estimate Create / Edit Dialog ─────────────────────────────────── */}
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

			{/* ── Invoice Create / Edit Dialog ──────────────────────────────────── */}
			{isInvoiceUploadOpen && (
				<InvoiceUploadDialog
					open={isInvoiceUploadOpen}
					onOpenChange={(open) => {
						setIsInvoiceUploadOpen(open);
						if (!open) setSelectedInvoiceForEdit(null);
					}}
					projects={projects}
					invoice={selectedInvoiceForEdit || undefined}
					completeProject={false}
					onSuccess={() => {
						fetchInvoices();
						fetchInvoiceStats();
					}}
				/>
			)}

			{/* ── Invoice View Dialog ───────────────────────────────────────────── */}
			{selectedInvoiceForView && (
				<InvoiceViewDialog
					open={!!selectedInvoiceForView}
					onOpenChange={(open) => !open && setSelectedInvoiceForView(null)}
					invoice={selectedInvoiceForView}
					onSuccess={() => {
						fetchInvoices();
						fetchInvoiceStats();
					}}
				/>
			)}

			{/* ── Delete Estimate Confirmation ─────────────────────────────────── */}
			<AlertDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Estimate</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* ── Delete Invoice Confirmation ──────────────────────────────────── */}
			<AlertDialog
				open={!!deleteInvoiceTarget}
				onOpenChange={(open) => !open && setDeleteInvoiceTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Invoice</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete invoice "
							{deleteInvoiceTarget?.invoiceNumber || `#INV-${deleteInvoiceTarget?.id}`}"? This
							action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteInvoice}
							className="bg-destructive hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
