import { useEffect, useState } from 'react';
import { Invoice, InvoiceSource } from '@/types/financial';
import { invoiceService, InvoiceFilters } from '@/services/invoiceService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
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
		source: 'manual',
	});

	const loadInvoices = async () => {
		try {
			setLoading(true);
			setError(null);
			const { data } = await invoiceService.getAll(filters);
			setInvoices(data);
		} catch (err: any) {
			console.error('Failed to load invoices:', err);
			setError(err.response?.data?.message || 'Failed to load invoices');
		} finally {
			setLoading(false);
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
							View and manage manual invoices
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
						{invoices.map((invoice) => (
							<div
								key={invoice.id}
								className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
								onClick={() => onInvoiceClick?.(invoice)}
							>
								<div className="flex-1">
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

								<div className="flex items-center gap-4 ml-4">
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
									>
										<Eye className="h-4 w-4 text-primary" />
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
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
