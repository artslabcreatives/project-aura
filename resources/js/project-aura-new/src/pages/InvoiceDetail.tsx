import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoiceService } from "@/services/invoiceService";
import { projectService } from "@/services/projectService";
import { Project } from "@/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { InvoiceUploadDialog } from "@/components/InvoiceUploadDialog";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	ArrowLeft,
	Edit,
	Trash2,
	Building2,
	Calendar,
	Receipt,
	CheckCircle2,
	Download,
	FolderOpen,
} from "lucide-react";

const invoiceStatusConfig: Record<string, { label: string; className: string }> = {
	paid: { label: "Paid", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
	authorised: { label: "Authorised", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
	draft: { label: "Draft", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
	voided: { label: "Voided", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
	deleted: { label: "Deleted", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
};

const getInvoiceStatusConfig = (status?: string, xeroStatus?: string) => {
	const raw = (xeroStatus || status || "draft").toLowerCase();
	return (
		invoiceStatusConfig[raw] || {
			label: raw.charAt(0).toUpperCase() + raw.slice(1),
			className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
		}
	);
};

export default function InvoiceDetail() {
	const { invoiceId } = useParams<{ invoiceId: string }>();
	const [invoice, setInvoice] = useState<any | null>(null);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const { toast } = useToast();
	const navigate = useNavigate();

	// Tax Invoice Download Dialog State
	const [isPaymentModeOpen, setIsPaymentModeOpen] = useState(false);
	const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>("Bank Transfer");
	const [dueDays, setDueDays] = useState<string>("15");
	const [additionalInfo, setAdditionalInfo] = useState<string>("");
	const [referenceNumber, setReferenceNumber] = useState<string>("");
	const [discountType, setDiscountType] = useState<string>("none");
	const [discountValue, setDiscountValue] = useState<string>("");

	useEffect(() => {
		if (isPaymentModeOpen && invoice) {
			// Xero invoices keep the PO number in their Reference (synced into description),
			// so prefer it; fall back to the invoice number when there is no PO.
			const xeroReference = invoice.xeroInvoiceId ? (invoice.description || "").trim() : "";
			setReferenceNumber(xeroReference || invoice.invoiceNumber || invoice.description || "");
		}
	}, [isPaymentModeOpen, invoice]);

	const fetchInvoice = async () => {
		if (!invoiceId) return;
		setLoading(true);
		try {
			const data = await invoiceService.getById(invoiceId);
			setInvoice(data);
		} catch {
			toast({ title: "Error", description: "Failed to load invoice details.", variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInvoice();
		projectService.getAll().then(setProjects).catch(() => { });
	}, [invoiceId]);

	const handleStatusChange = async (newStatus: string) => {
		if (!invoice?.id) return;
		try {
			await invoiceService.updateStatus(invoice.id, newStatus);
			setInvoice((prev: any) => ({ ...prev, status: newStatus }));
			toast({ title: "Status updated successfully." });
		} catch {
			toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
		}
	};

	const handleDelete = async () => {
		if (!invoice?.id) return;
		try {
			await invoiceService.delete(invoice.id);
			toast({ title: "Invoice deleted." });
			navigate("/estimates?tab=invoices");
		} catch {
			toast({ title: "Error", description: "Failed to delete invoice.", variant: "destructive" });
		}
	};

	const handleDownloadPdf = async (
		paymentMode: string,
		additionalInfoStr?: string,
		referenceStr?: string,
		dueDaysStr?: string,
		discountTypeStr?: string,
		discountValueStr?: string
	) => {
		if (!invoice?.id) return;
		setIsDownloading(true);
		try {
			const num = invoice.invoiceNumber || `INV-${invoice.id}`;
			await invoiceService.downloadPdf(
				invoice.id,
				paymentMode,
				additionalInfoStr,
				referenceStr,
				dueDaysStr,
				discountTypeStr,
				discountValueStr,
				`Tax_Invoice_${num}.pdf`
			);
			toast({ title: "Tax Invoice PDF downloaded." });
		} catch (err: any) {
			toast({
				title: "Error",
				description: err?.message || "Failed to download PDF invoice.",
				variant: "destructive",
			});
		} finally {
			setIsDownloading(false);
		}
	};

	if (loading) {
		return (
			<div className="p-6 space-y-6">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-40 w-full" />
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	if (!invoice) {
		return (
			<div className="p-6 text-center">
				<Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
				<h2 className="text-lg font-semibold">Invoice not found</h2>
				<Button variant="outline" className="mt-4" onClick={() => navigate("/estimates?tab=invoices")}>
					<ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
				</Button>
			</div>
		);
	}

	const statusCfg = getInvoiceStatusConfig(invoice.status, invoice.xeroStatus);
	const lineItems = invoice.items || [];
	const currencySymbol = invoice.currency === "LKR" ? "Rs. " : invoice.currency === "USD" ? "$" : `${invoice.currency} `;

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between gap-4 flex-wrap">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" onClick={() => navigate("/estimates?tab=invoices")}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<div className="flex items-center gap-2 flex-wrap">
							<h1 className="text-2xl font-bold">
								{invoice.invoiceNumber || `#INV-${invoice.id}`}
							</h1>
							{invoice.source === "xero" || invoice.xeroInvoiceId ? (
								<Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 text-xs px-2 py-0.5 flex items-center gap-1">
									<CheckCircle2 className="h-3 w-3" /> Xero
								</Badge>
							) : (
								<Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs px-2 py-0.5">
									Manual
								</Badge>
							)}
						</div>
						<div className="flex items-center gap-2 mt-1">
							<Building2 className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">
								{invoice.client?.companyName || invoice.client?.company_name || "Unknown Client"}
							</span>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2 flex-wrap">
					{/* Status change select */}
					<Select value={invoice.status || "draft"} onValueChange={handleStatusChange}>
						<SelectTrigger className="w-[140px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="draft">Draft</SelectItem>
							<SelectItem value="authorised">Authorised</SelectItem>
							<SelectItem value="paid">Paid</SelectItem>
							<SelectItem value="voided">Voided</SelectItem>
						</SelectContent>
					</Select>

					{invoice.projectId && (
						<Button variant="outline" onClick={() => navigate(`/project/${invoice.projectId}`)}>
							<FolderOpen className="h-4 w-4 mr-2 text-primary" />
							View Project
						</Button>
					)}

					{/* Download Tax Invoice button */}
					<Button
						variant="outline"
						onClick={() => setIsPaymentModeOpen(true)}
						disabled={isDownloading}
					>
						<Download className="h-4 w-4 mr-2" />
						{isDownloading ? "Downloading..." : "Download Tax Invoice"}
					</Button>

					<Button variant="outline" size="icon" onClick={() => setIsEditOpen(true)}>
						<Edit className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={() => setIsDeleteOpen(true)}
						className="hover:text-destructive hover:border-destructive"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Status Banner */}
			<div className={`flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-medium ${statusCfg.className}`}>
				<div className="flex items-center gap-2">
					<Badge className={`${statusCfg.className} mr-1 font-semibold`}>
						{statusCfg.label}
					</Badge>
					{invoice.xeroStatus && invoice.xeroStatus.toLowerCase() !== invoice.status && (
						<span className="text-xs opacity-80">(Xero: {invoice.xeroStatus})</span>
					)}
				</div>
				<div className="flex items-center gap-4 text-xs opacity-80 flex-wrap">
					{invoice.issuedAt && (
						<span className="flex items-center gap-1">
							<Calendar className="h-3.5 w-3.5" />
							Issued: {new Date(invoice.issuedAt).toLocaleDateString()}
						</span>
					)}
					{invoice.dueDate && (
						<span className="flex items-center gap-1">
							<Calendar className="h-3.5 w-3.5" />
							Due: {new Date(invoice.dueDate).toLocaleDateString()}
						</span>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content (Line Items) */}
				<div className="lg:col-span-2 space-y-6">
					{invoice.description && (
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Description / Reference</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground whitespace-pre-line">
									{invoice.description}
								</p>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle className="text-base">Line Items</CardTitle>
						</CardHeader>
						<CardContent>
							{lineItems.length === 0 ? (
								<p className="text-sm text-muted-foreground">No line items added.</p>
							) : (
								<div className="space-y-1">
									{/* Header Row */}
									<div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground pb-2 border-b">
										<div className="col-span-6">Description</div>
										<div className="col-span-2 text-right">Qty</div>
										<div className="col-span-2 text-right">Unit Price</div>
										<div className="col-span-2 text-right">Total</div>
									</div>
									{lineItems.map((item: any, i: number) => {
										const lineTotal =
											item.total !== undefined ? item.total : item.quantity * item.unit_price;
										return (
											<div
												key={item.id ?? i}
												className="grid grid-cols-12 gap-2 py-2 text-sm border-b last:border-0 items-center"
											>
												<div className="col-span-6 font-medium">{item.description}</div>
												<div className="col-span-2 text-right text-muted-foreground">
													{item.quantity}
												</div>
												<div className="col-span-2 text-right text-muted-foreground">
													{currencySymbol}
													{Number(item.unit_price).toFixed(2)}
												</div>
												<div className="col-span-2 text-right font-medium">
													{currencySymbol}
													{Number(lineTotal).toFixed(2)}
												</div>
											</div>
										);
									})}
								</div>
							)}

							<Separator className="my-4" />

							{/* Totals */}
							<div className="space-y-1.5 text-sm max-w-xs ml-auto">
								<div className="flex justify-between text-muted-foreground">
									<span>Subtotal</span>
									<span>
										{currencySymbol}
										{Number(invoice.subtotal ?? invoice.amount).toFixed(2)}
									</span>
								</div>
								{Boolean(invoice.total_tax) && (
									<div className="flex justify-between text-muted-foreground">
										<span>Tax</span>
										<span>
											{currencySymbol}
											{Number(invoice.total_tax).toFixed(2)}
										</span>
									</div>
								)}
								<Separator className="my-1" />
								<div className="flex justify-between font-bold text-base">
									<span>Total</span>
									<span>
										{currencySymbol}
										{Number(invoice.total ?? invoice.amount).toFixed(2)}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar Details */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-sm">
							<div>
								<span className="text-muted-foreground text-xs uppercase font-semibold">Client</span>
								<div className="flex items-center gap-2 mt-1">
									<Building2 className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">
										{invoice.client?.companyName || invoice.client?.company_name || "Unknown Client"}
									</span>
								</div>
								{invoice.client?.tax_number && (
									<p className="text-xs text-muted-foreground mt-0.5">VAT: {invoice.client.tax_number}</p>
								)}
								{invoice.client?.address && (
									<p className="text-xs text-muted-foreground mt-0.5">{invoice.client.address}</p>
								)}
								{invoice.client?.phone && (
									<p className="text-xs text-muted-foreground mt-0.5">Tel: {invoice.client.phone}</p>
								)}
								{invoice.client?.email && (
									<p className="text-xs text-muted-foreground mt-0.5">{invoice.client.email}</p>
								)}
							</div>

							<Separator />

							<div>
								<span className="text-muted-foreground text-xs uppercase font-semibold">
									Invoice Number
								</span>
								<p className="font-medium mt-1 font-mono">
									{invoice.invoiceNumber || `#INV-${invoice.id}`}
								</p>
							</div>

							{invoice.issuedAt && (
								<>
									<Separator />
									<div>
										<span className="text-muted-foreground text-xs uppercase font-semibold">
											Issued Date
										</span>
										<div className="flex items-center gap-2 mt-1">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<p className="font-medium">
												{new Date(invoice.issuedAt).toLocaleDateString()}
											</p>
										</div>
									</div>
								</>
							)}

							{invoice.dueDate && (
								<>
									<Separator />
									<div>
										<span className="text-muted-foreground text-xs uppercase font-semibold">
											Due Date
										</span>
										<div className="flex items-center gap-2 mt-1">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<p className="font-medium">
												{new Date(invoice.dueDate).toLocaleDateString()}
											</p>
										</div>
									</div>
								</>
							)}

							{invoice.project && (
								<>
									<Separator />
									<div>
										<span className="text-muted-foreground text-xs uppercase font-semibold">
											Project
										</span>
										<div className="flex items-center gap-2 mt-1">
											<FolderOpen className="h-4 w-4 text-muted-foreground" />
											<button
												onClick={() => navigate(`/project/${invoice.project.id}`)}
												className="font-medium text-primary hover:underline text-left"
											>
												{invoice.project.name}
											</button>
										</div>
									</div>
								</>
							)}

							<Separator />

							<div>
								<span className="text-muted-foreground text-xs uppercase font-semibold">Source</span>
								<div className="flex items-center gap-2 mt-1">
									{invoice.source === "xero" || invoice.xeroInvoiceId ? (
										<Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 text-xs">
											Xero Accounting
										</Badge>
									) : (
										<Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs">
											Manual Entry
										</Badge>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* ── Payment Mode / Tax Invoice Modal ───────────────────────────── */}
			<Dialog open={isPaymentModeOpen} onOpenChange={setIsPaymentModeOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Download Tax Invoice</DialogTitle>
						<DialogDescription>
							Customize payment terms and optional discount before generating the PDF invoice.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2">
						<div className="space-y-2">
							<Label htmlFor="inv-payment-mode">Mode of Payment</Label>
							<Select value={selectedPaymentMode} onValueChange={setSelectedPaymentMode}>
								<SelectTrigger id="inv-payment-mode">
									<SelectValue placeholder="Select Payment Mode" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
									<SelectItem value="Cash">Cash</SelectItem>
									<SelectItem value="Cheque">Cheque</SelectItem>
									<SelectItem value="Credit Card">Credit Card</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="inv-due-days">Payment Due (Days)</Label>
							<Input
								id="inv-due-days"
								type="number"
								min="0"
								value={dueDays}
								onChange={(e) => setDueDays(e.target.value)}
								placeholder="15"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="inv-reference-num">Reference Number / PO Number</Label>
							<Input
								id="inv-reference-num"
								value={referenceNumber}
								onChange={(e) => setReferenceNumber(e.target.value)}
								placeholder="e.g. PO-12345 or Ref #"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="inv-discount-type">Discount Type</Label>
								<Select value={discountType} onValueChange={setDiscountType}>
									<SelectTrigger id="inv-discount-type">
										<SelectValue placeholder="Select Type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">No Discount</SelectItem>
										<SelectItem value="percentage">Percentage (%)</SelectItem>
										<SelectItem value="fixed">Fixed Amount ({currencySymbol})</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{discountType !== "none" && (
								<div className="space-y-2">
									<Label htmlFor="inv-discount-val">
										{discountType === "percentage" ? "Percentage (%)" : `Amount (${currencySymbol})`}
									</Label>
									<Input
										id="inv-discount-val"
										type="number"
										min="0"
										step={discountType === "percentage" ? "1" : "0.01"}
										value={discountValue}
										onChange={(e) => setDiscountValue(e.target.value)}
										placeholder={discountType === "percentage" ? "10" : "500.00"}
									/>
								</div>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="inv-additional-info">Additional Notes / Terms</Label>
							<Input
								id="inv-additional-info"
								value={additionalInfo}
								onChange={(e) => setAdditionalInfo(e.target.value)}
								placeholder="Optional additional notes"
							/>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsPaymentModeOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								setIsPaymentModeOpen(false);
								handleDownloadPdf(
									selectedPaymentMode,
									additionalInfo,
									referenceNumber,
									dueDays,
									discountType,
									discountValue
								);
							}}
							disabled={isDownloading}
						>
							<Download className="h-4 w-4 mr-2" />
							{isDownloading ? "Downloading..." : "Download PDF"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* ── Edit Dialog ────────────────────────────────────────────────── */}
			{isEditOpen && (
				<InvoiceUploadDialog
					open={isEditOpen}
					onOpenChange={setIsEditOpen}
					projects={projects}
					invoice={invoice}
					completeProject={false}
					onSuccess={() => {
						setIsEditOpen(false);
						fetchInvoice();
					}}
				/>
			)}

			{/* ── Delete Confirmation ────────────────────────────────────────── */}
			<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Invoice</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete invoice "
							{invoice.invoiceNumber || `#INV-${invoice.id}`}"? This action cannot be undone.
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

