import { api } from '@/lib/api';
import { Invoice, InvoiceSource } from '@/types/financial';

// Raw API response types
type RawInvoice = {
	id: number;
	source: InvoiceSource;
	project_id?: number;
	client_id?: number;
	invoice_number?: string;
	invoice_type?: string;
	status?: string;
	amount?: number;
	currency: string;
	issued_at?: string;
	due_date?: string;
	xero_invoice_id?: string;
	xero_status?: string;
	description?: string;
	created_at: string;
	updated_at: string;
	project?: {
		id: number;
		name: string;
	};
	client?: {
		id: number;
		company_name: string;
		tax_number?: string;
		email?: string;
		phone?: string;
		address?: string;
	};
	invoice_document?: string;
	invoice_document_url?: string;
	is_physical_invoice?: boolean | number;
	courier_tracking_number?: string;
	courier_delivery_status?: string;
};

// Transform snake_case API response to camelCase
const transformInvoice = (raw: RawInvoice): Invoice => ({
	id: raw.id,
	source: raw.source,
	projectId: raw.project_id,
	clientId: raw.client_id,
	invoiceNumber: raw.invoice_number,
	invoiceType: raw.invoice_type,
	status: raw.status,
	amount: raw.amount,
	currency: raw.currency,
	issuedAt: raw.issued_at,
	dueDate: raw.due_date,
	xeroInvoiceId: raw.xero_invoice_id,
	xeroStatus: raw.xero_status,
	description: raw.description,
	createdAt: raw.created_at,
	updatedAt: raw.updated_at,
	project: raw.project,
	client: raw.client ? {
		id: raw.client.id,
		companyName: raw.client.company_name,
		company_name: raw.client.company_name,
		tax_number: raw.client.tax_number,
		email: raw.client.email,
		phone: raw.client.phone,
		address: raw.client.address,
	} as any : undefined,
	invoiceDocument: raw.invoice_document_url || raw.invoice_document,
	isPhysicalInvoice: Boolean(raw.is_physical_invoice),
	courierTrackingNumber: raw.courier_tracking_number,
	courierDeliveryStatus: raw.courier_delivery_status,
});

export interface InvoiceFilters {
	source?: InvoiceSource;
	projectId?: number;
	clientId?: number;
	status?: string;
	search?: string;
	page?: number;
	perPage?: number;
}

export interface CreateInvoiceData {
	source: InvoiceSource;
	projectId?: number;
	clientId?: number;
	invoiceNumber?: string;
	invoiceType?: string;
	status?: string;
	amount?: number;
	currency?: string;
	issuedAt?: string;
	dueDate?: string;
	xeroInvoiceId?: string;
	xeroStatus?: string;
	description?: string;
	invoiceDocument?: File | string;
	isPhysicalInvoice?: boolean;
	courierTrackingNumber?: string;
	courierDeliveryStatus?: string;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> { }

export const invoiceService = {
	/**
	 * Get all invoices with optional filters
	 */
	async getAll(filters?: InvoiceFilters): Promise<{
		data: Invoice[];
		total: number;
		currentPage: number;
		lastPage: number;
		from: number;
		to: number;
	}> {
		const params = new URLSearchParams();

		if (filters?.source) params.append('source', filters.source);
		if (filters?.projectId) params.append('project_id', String(filters.projectId));
		if (filters?.clientId) params.append('client_id', String(filters.clientId));
		if (filters?.status) params.append('status', filters.status);
		if (filters?.search) params.append('search', filters.search);
		if (filters?.page) params.append('page', String(filters.page));
		if (filters?.perPage) params.append('per_page', String(filters.perPage));

		const response = await api.get<any>(`/invoices?${params.toString()}`);

		return {
			data: (response.data || []).map(transformInvoice),
			total: response.total ?? (response.data?.length || 0),
			currentPage: response.current_page ?? 1,
			lastPage: response.last_page ?? 1,
			from: response.from ?? 1,
			to: response.to ?? (response.data?.length || 0),
		};
	},

	/**
	 * Get invoice statistics
	 */
	async getStats(): Promise<{
		paid: number;
		authorised: number;
		draft: number;
		voided: number;
		total: number;
		total_amount: number;
	}> {
		return await api.get<any>('/invoices/stats');
	},

	/**
	 * Trigger manual sync of Xero Invoices into local database
	 */
	async syncFromXero(): Promise<{ message: string; synced: number; skipped?: number }> {
		return await api.post<any>('/xero/sync-invoices', {});
	},

	/**
	 * Get invoices for a specific project
	 */
	async getByProject(projectId: number): Promise<Invoice[]> {
		const response = await api.get<any>(`/invoices?project_id=${projectId}`);
		return response.data.map(transformInvoice);
	},

	/**
	 * Get invoices for a specific client
	 */
	async getByClient(clientId: number): Promise<Invoice[]> {
		const response = await api.get<any>(`/invoices?client_id=${clientId}`);
		return response.data.map(transformInvoice);
	},

	/**
	 * Get a single invoice by ID
	 */
	async getById(id: number | string): Promise<any> {
		const response = await api.get<any>(`/invoices/${id}`);
		const transformed = transformInvoice(response as any);
		return {
			...transformed,
			items: response.items || [],
			subtotal: response.subtotal ?? transformed.amount,
			total_tax: response.total_tax ?? 0,
			total: response.total ?? transformed.amount,
			xeroDetail: response.xero_detail,
			raw: response,
		};
	},

	/**
	 * Update invoice status
	 */
	async updateStatus(id: number | string, status: string): Promise<any> {
		return await api.put<any>(`/invoices/${id}`, { status });
	},

	/**
	 * Download Tax Invoice PDF
	 */
	async downloadPdf(
		id: number | string,
		paymentMode?: string,
		additionalInfo?: string,
		reference?: string,
		dueDays?: string,
		discountType?: string,
		discountValue?: number | string,
		filename = 'invoice.pdf',
		purchaserDetails?: {
			tin?: string;
			address?: string;
			phone?: string;
		}
	): Promise<void> {
		const params = new URLSearchParams();
		if (paymentMode) params.append('payment_mode', paymentMode);
		if (additionalInfo) params.append('additional_info', additionalInfo);
		if (reference) params.append('reference', reference);
		if (dueDays) params.append('due_days', dueDays);
		if (discountType && discountType !== 'none') params.append('discount_type', discountType);
		if (discountValue !== undefined && discountValue !== '') params.append('discount_value', String(discountValue));
		if (purchaserDetails?.tin) params.append('purchaser_tin', purchaserDetails.tin);
		if (purchaserDetails?.address) params.append('purchaser_address', purchaserDetails.address);
		if (purchaserDetails?.phone) params.append('purchaser_phone', purchaserDetails.phone);

		const token = localStorage.getItem('auth_token');
		const res = await fetch(`/api/invoices/${id}/download-pdf?${params.toString()}`, {
			headers: {
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				Accept: 'application/pdf',
			},
		});

		if (!res.ok) {
			let errorMsg = 'Failed to download PDF invoice';
			try {
				const json = await res.json();
				if (json.message) errorMsg = json.message;
			} catch {}
			throw new Error(errorMsg);
		}

		const blob = await res.blob();
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', filename);
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
	},

	/**
	 * Create a new invoice
	 */
	async create(data: any): Promise<Invoice> {
		const isFormData = data.invoiceDocument instanceof File;
		let payload: any;

		if (isFormData) {
			payload = new FormData();
			payload.append('source', data.source);
			if (data.projectId) payload.append('project_id', String(data.projectId));
			if (data.clientId) payload.append('client_id', String(data.clientId));
			if (data.invoiceNumber) payload.append('invoice_number', data.invoiceNumber);
			if (data.invoiceType) payload.append('invoice_type', data.invoiceType);
			if (data.status) payload.append('status', data.status);
			if (data.amount !== undefined) payload.append('amount', String(data.amount));
			if (data.currency) payload.append('currency', data.currency);
			if (data.issuedAt) payload.append('issued_at', data.issuedAt);
			if (data.dueDate) payload.append('due_date', data.dueDate);
			if (data.description) payload.append('description', data.description);
			if (data.invoiceDocument) payload.append('invoice_document', data.invoiceDocument);
			if (data.isPhysicalInvoice !== undefined) payload.append('is_physical_invoice', data.isPhysicalInvoice ? '1' : '0');
			if (data.courierTrackingNumber) payload.append('courier_tracking_number', data.courierTrackingNumber);
		} else {
			payload = {
				source: data.source,
				project_id: data.projectId,
				client_id: data.clientId,
				invoice_number: data.invoiceNumber,
				invoice_type: data.invoiceType,
				status: data.status,
				amount: data.amount,
				currency: data.currency,
				issued_at: data.issuedAt,
				due_date: data.dueDate,
				xero_invoice_id: data.xeroInvoiceId,
				xero_status: data.xeroStatus,
				description: data.description,
				is_physical_invoice: data.isPhysicalInvoice,
				courier_tracking_number: data.courierTrackingNumber,
			};
		}

		const response = await api.post<any>('/invoices', payload);
		return transformInvoice(response as any);
	},

	/**
	 * Update an existing invoice
	 */
	async update(id: number, data: UpdateInvoiceData): Promise<Invoice> {
		const payload: any = {};

		if (data.source) payload.source = data.source;
		if (data.projectId !== undefined) payload.project_id = data.projectId;
		if (data.clientId !== undefined) payload.client_id = data.clientId;
		if (data.invoiceNumber !== undefined) payload.invoice_number = data.invoiceNumber;
		if (data.invoiceType !== undefined) payload.invoice_type = data.invoiceType;
		if (data.status !== undefined) payload.status = data.status;
		if (data.amount !== undefined) payload.amount = data.amount;
		if (data.currency !== undefined) payload.currency = data.currency;
		if (data.issuedAt !== undefined) payload.issued_at = data.issuedAt;
		if (data.dueDate !== undefined) payload.due_date = data.dueDate;
		if (data.xeroInvoiceId !== undefined) payload.xero_invoice_id = data.xeroInvoiceId;
		if (data.xeroStatus !== undefined) payload.xero_status = data.xeroStatus;
		if (data.description !== undefined) payload.description = data.description;
		if (data.isPhysicalInvoice !== undefined) payload.is_physical_invoice = data.isPhysicalInvoice;
		if (data.courierTrackingNumber !== undefined) payload.courier_tracking_number = data.courierTrackingNumber;
		if (data.courierDeliveryStatus !== undefined) payload.courier_delivery_status = data.courierDeliveryStatus;

		const response = await api.put<any>(`/invoices/${id}`, payload);
		return transformInvoice(response as any);
	},

	/**
	 * Delete an invoice
	 */
	async delete(id: number): Promise<void> {
		await api.delete(`/invoices/${id}`);
	},
};
