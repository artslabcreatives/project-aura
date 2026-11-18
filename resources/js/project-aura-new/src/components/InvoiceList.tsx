import { useEffect, useState } from 'react';
import { Invoice, InvoiceSource } from '@/types/financial';
import { invoiceService, InvoiceFilters } from '@/services/invoiceService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { BulkPdfActionBar } from './BulkPdfActionBar';
import {
	PdfDownloadDialog,
	PdfDownloadSettings,
	getInvoiceInitialPdfSettings,
} from './PdfDownloadDialog';
import { useToast } from '@/hooks/use-toast';
import {
	FileText,
	DollarSign,
	Calendar,
	Building2,
	FolderOpen,
	AlertCircle,
	RefreshCw,
	Download,
	Plus,
	Eye,
	Edit2,
	Trash2,
} from 'lucide-react';

interface InvoiceListProps {
	projectId?: number;
	clientId?: number;
	showFilters?: boolean;
	onInvoiceClick?: (invoice: Invoice) => void;
	onAddInvoice?: () => void;
	onEditInvoice?: (invoice: Invoice) => void;
	onDeleteInvoice?: (invoice: Invoice) => void;
}

export function InvoiceList({
	projectId,
	clientId,
	showFilters = true,
	onInvoiceClick,
	onAddInvoice,
	onEditInvoice,
	onDeleteInvoice,
}: InvoiceListProps) {
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<InvoiceFilters>({
		projectId,
		clientId,
	});
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [downloadTarget, setDownloadTarget] = useState<Invoice | null>(null);
	const [isDownloading, setIsDownloading] = useState(false);
	const [isBulkDownloading, setIsBulkDownloading] = useState(false);
	const { toast } = useToast();

	const loadInvoices = async () => {
		try {
			setLoading(true);
			setError(null);
			const activeFilters = {
				...filters,
				projectId: filters.projectId ?? projectId,
				clientId: filters.clientId ?? clientId,
			};
			const { data } = await invoiceService.getAll(activeFilters);
			setInvoices(data);
		} catch (err: any) {
			console.error('Failed to load invoices:', err);
			setError(err.response?.data?.message || 'Failed to load invoices');
		} finally {
			setLoading(false);
		}
	};

	const toggleSelection = (id: number) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
		);
	};

	const toggleSelectAll = (visibleIds: number[]) => {
		setSelectedIds((prev) => {
			const allSelected = visibleIds.length > 0 && visibleIds.every((id) => prev.includes(id));
			if (allSelected) {
				return prev.filter((id) => !visibleIds.includes(id));
			}
			const next = new Set(prev);
			visibleIds.forEach((id) => next.add(id));
			return Array.from(next);
		});
	};

	const handleConfirmDownload = async (settings: PdfDownloadSettings) => {
		if (!downloadTarget?.id) return;
		const targetId = downloadTarget.id;
		const num = downloadTarget.invoiceNumber || `INV-${targetId}`;
		setIsDownloading(true);
		try {
			await invoiceService.downloadPdf(
				targetId,
				settings.paymentMode,
				settings.additionalInfo,
				settings.reference,
				settings.dueDays,
				settings.discountType,
				settings.discountValue,
				`Tax_Invoice_${num}.pdf`,
				undefined,
				true
			);
			setInvoices((prev) =>
				prev.map((inv) =>
					inv.id === targetId
						? {
								...inv,
								pdfPaymentMode: settings.paymentMode,
								pdfDueDays: settings.dueDays ? Number(settings.dueDays) : null,
								pdfReference: settings.reference,
								pdfDiscountType: settings.discountType || 'none',
								pdfDiscountValue:
									settings.discountType !== 'none' && settings.discountValue !== ''
										? Number(settings.discountValue)
										: null,
								pdfAdditionalInfo: settings.additionalInfo,
							}
						: inv
				)
			);
			setDownloadTarget(null);
			toast({ title: 'Tax Invoice PDF downloaded.' });
		} catch (err: any) {
			toast({
				title: 'Error',
				description: err?.message || 'Failed to download PDF invoice.',
				variant: 'destructive',
			});
		} finally {
			setIsDownloading(false);
		}
	};

	const handleBulkDownload = async (format: 'zip' | 'pdf') => {
		if (selectedIds.length === 0) return;
		setIsBulkDownloading(true);
		try {
			await invoiceService.bulkDownloadPdf(selectedIds, format);
			toast({ title: `Downloaded ${selectedIds.length} invoice(s).` });
		} catch (err: any) {
			toast({
				title: 'Error',
				description: err?.message || 'Failed to bulk download PDF invoices.',
				variant: 'destructive',
			});
		} finally {
			setIsBulkDownloading(false);
		}
	};

	useEffect(() => {
		loadInvoices();
	}, [projectId, clientId, filters]);

	const formatCurrency = (amount?: number, currency?: string) => {
		if (amount === undefined) return 'N/A';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency || 'LKR',
		}).format(amount);
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const getSourceBadge = (source: InvoiceSource) => {
		if (source === 'xero') {
			return (
				<Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30">
					<Download className="h-3 w-3 mr-1" />
					Xero
				</Badge>
			);
		}
		return (
			<Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/30">
				<FileText className="h-3 w-3 mr-1" />
				Manual
			</Badge>
		);
	};

	const getStatusBadge = (status?: string, xeroStatus?: string) => {
		const displayStatus = xeroStatus || status || 'pending';
		const statusLower = displayStatus.toLowerCase();

		if (statusLower.includes('paid') || statusLower.includes('authorised')) {
			return <Badge className="bg-green-500">{displayStatus}</Badge>;
		}
		if (statusLower.includes('pending') || statusLower.includes('draft')) {
			return <Badge variant="outline">{displayStatus}</Badge>;
		}
		return <Badge variant="secondary">{displayStatus}</Badge>;
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Invoices</CardTitle>
					<CardDescription>Loading invoices...</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="space-y-2 p-4 border rounded-lg">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-6 w-48" />
							<Skeleton className="h-4 w-64" />
						</div>
					))}
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	return (
		<Card className="border-none shadow-md">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-primary" />
							Invoices ({invoices.length})
						</CardTitle>
						<CardDescription>
							View and manage invoices
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">

						{onAddInvoice && (
							<Button variant="outline" size="sm" onClick={onAddInvoice}>
								<Plus className="h-4 w-4 mr-1" />
								Add Invoice
							</Button>
						)}
						<Button variant="outline" size="sm" onClick={loadInvoices}>
							<RefreshCw className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{invoices.length === 0 ? (
					<div className="text-center py-12 text-muted-foreground">
						<FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p className="text-sm">No invoices found</p>
					</div>
				) : (
					<div className="space-y-3">
						<BulkPdfActionBar
							visibleIds={invoices.map((inv) => inv.id)}
							selectedIds={selectedIds}
							onToggleSelectAll={toggleSelectAll}
							onClearSelection={() => setSelectedIds([])}
							onBulkDownload={handleBulkDownload}
							isDownloading={isBulkDownloading}
							selectAllLabel="Select all invoices"
						/>
						{invoices.map((invoice) => {
							const isSelected = selectedIds.includes(invoice.id);
							return (
							<div
								key={invoice.id}
								className={`flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer ${
									isSelected ? 'ring-1 ring-primary/60 bg-primary/[0.02]' : ''
								}`}
								onClick={() => onInvoiceClick?.(invoice)}
							>
								<div
									className="flex items-center mr-3 shrink-0"
									onClick={(e) => e.stopPropagation()}
								>
									<Checkbox
										checked={isSelected}
										onCheckedChange={() => toggleSelection(invoice.id)}
										aria-label={`Select ${invoice.invoiceNumber || `INV-${invoice.id}`}`}
									/>
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-2">
										<span className="font-semibold text-sm">
											{invoice.invoiceNumber || `#${invoice.id}`}
										</span>
										{getStatusBadge(invoice.status, invoice.xeroStatus)}
									</div>

									<div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
										{invoice.project && (
											<div className="flex items-center gap-1">
												<FolderOpen className="h-3 w-3" />
												<span>{invoice.project.name}</span>
											</div>
										)}
										{invoice.client && (
											<div className="flex items-center gap-1">
												<Building2 className="h-3 w-3" />
												<span>{invoice.client.companyName}</span>
											</div>
										)}
										{invoice.issuedAt && (
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												<span>Issued: {formatDate(invoice.issuedAt)}</span>
											</div>
										)}
										{invoice.dueDate && (
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												<span>Due: {formatDate(invoice.dueDate)}</span>
											</div>
										)}
									</div>

									{invoice.description && (
										<p className="text-xs text-muted-foreground mt-1 line-clamp-1">
											{invoice.description}
										</p>
									)}
								</div>

								<div className="flex items-center gap-3 ml-4">
									<div className="text-right">
										<div className="flex items-center gap-1 text-lg font-bold">
											<DollarSign className="h-4 w-4" />
											{formatCurrency(invoice.amount, invoice.currency)}
										</div>
										<p className="text-xs text-muted-foreground">
											{invoice.currency}
										</p>
									</div>
									<div 
										className="p-2 rounded-full hover:bg-primary/10 transition-colors"
										onClick={(e) => {
											e.stopPropagation();
											onInvoiceClick?.(invoice);
										}}
										title="View"
									>
										<Eye className="h-4 w-4 text-primary" />
									</div>
									<div
										className="p-2 rounded-full hover:bg-sky-500/10 transition-colors"
										onClick={(e) => {
											e.stopPropagation();
											setDownloadTarget(invoice);
										}}
										title="Download Tax Invoice"
									>
										<Download className="h-4 w-4 text-sky-500" />
									</div>
									<div 
										className="p-2 rounded-full hover:bg-amber-500/10 transition-colors"
										onClick={(e) => {
											e.stopPropagation();
											onEditInvoice?.(invoice);
										}}
									>
										<Edit2 className="h-4 w-4 text-amber-500" />
									</div>
									<div 
										className="p-2 rounded-full hover:bg-rose-500/10 transition-colors"
										onClick={(e) => {
											e.stopPropagation();
											onDeleteInvoice?.(invoice);
										}}
									>
										<Trash2 className="h-4 w-4 text-rose-500" />
									</div>
								</div>
							</div>
							);
						})}
					</div>
				)}
			</CardContent>

			{downloadTarget && (
				<PdfDownloadDialog
					open={!!downloadTarget}
					onOpenChange={(open) => !open && setDownloadTarget(null)}
					type="invoice"
					currencySymbol={
						downloadTarget.currency === 'LKR'
							? 'Rs. '
							: downloadTarget.currency === 'USD'
							? '$'
							: downloadTarget.currency
							? `${downloadTarget.currency} `
							: 'LKR'
					}
					initialSettings={getInvoiceInitialPdfSettings(downloadTarget)}
					isDownloading={isDownloading}
					onConfirmDownload={handleConfirmDownload}
				/>
			)}
		</Card>
	);
}
