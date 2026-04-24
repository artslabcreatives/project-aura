import { api } from '@/lib/api';
import { Invoice, InvoiceSource } from '@/types/financial';

// Raw API response types
type RawInvoice = {
	id: number;
	source: InvoiceSource;
	project_id?: number;
	client_id?: number;
	invoice_number?: string;
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
	};
};

// Transform snake_case API response to camelCase
const transformInvoice = (raw: RawInvoice): Invoice => ({
	id: raw.id,
	source: raw.source,
	projectId: raw.project_id,
	clientId: raw.client_id,
	invoiceNumber: raw.invoice_number,
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
	} : undefined,
});

export interface InvoiceFilters {
	source?: InvoiceSource;
	projectId?: number;
	clientId?: number;
	status?: string;
	page?: number;
	perPage?: number;
}

export interface CreateInvoiceData {
	source: InvoiceSource;
	projectId?: number;
	clientId?: number;
	invoiceNumber?: string;
	status?: string;
	amount?: number;
	currency?: string;
	issuedAt?: string;
	dueDate?: string;
	xeroInvoiceId?: string;
	xeroStatus?: string;
	description?: string;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> { }

export const invoiceService = {
	/**
	 * Get all invoices with optional filters
	 */
	async getAll(filters?: InvoiceFilters): Promise<{ data: Invoice[]; total: number }> {
		const params = new URLSearchParams();

		if (filters?.source) params.append('source', filters.source);
		if (filters?.projectId) params.append('project_id', String(filters.projectId));
		if (filters?.clientId) params.append('client_id', String(filters.clientId));
		if (filters?.status) params.append('status', filters.status);
		if (filters?.page) params.append('page', String(filters.page));
		if (filters?.perPage) params.append('per_page', String(filters.perPage));

		const response = await api.get(`/invoices?${params.toString()}`);

		return {
			data: response.data.map(transformInvoice),
			total: response.total || response.data.length,
		};
	},

	/**
	 * Get invoices for a specific project
	 */
	async getByProject(projectId: number): Promise<Invoice[]> {
		const response = await api.get(`/invoices?project_id=${projectId}`);
		return response.data.map(transformInvoice);
	},

	/**
	 * Get invoices for a specific client
	 */
	async getByClient(clientId: number): Promise<Invoice[]> {
		const response = await api.get(`/invoices?client_id=${clientId}`);
		return response.data.map(transformInvoice);
	},

	/**
	 * Get a single invoice by ID
	 */
	async getById(id: number): Promise<Invoice> {
		const response = await api.get(`/invoices/${id}`);
		return transformInvoice(response);
	},

	/**
	 * Create a new invoice
	 */
	async create(data: CreateInvoiceData): Promise<Invoice> {
		const payload = {
			source: data.source,
			project_id: data.projectId,
			client_id: data.clientId,
			invoice_number: data.invoiceNumber,
			status: data.status,
			amount: data.amount,
			currency: data.currency,
			issued_at: data.issuedAt,
			due_date: data.dueDate,
			xero_invoice_id: data.xeroInvoiceId,
			xero_status: data.xeroStatus,
			description: data.description,
		};

		const response = await api.post('/invoices', payload);
		return transformInvoice(response);
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
		if (data.status !== undefined) payload.status = data.status;
		if (data.amount !== undefined) payload.amount = data.amount;
		if (data.currency !== undefined) payload.currency = data.currency;
		if (data.issuedAt !== undefined) payload.issued_at = data.issuedAt;
		if (data.dueDate !== undefined) payload.due_date = data.dueDate;
		if (data.xeroInvoiceId !== undefined) payload.xero_invoice_id = data.xeroInvoiceId;
		if (data.xeroStatus !== undefined) payload.xero_status = data.xeroStatus;
		if (data.description !== undefined) payload.description = data.description;

		const response = await api.put(`/invoices/${id}`, payload);
		return transformInvoice(response);
	},

	/**
	 * Delete an invoice
	 */
	async delete(id: number): Promise<void> {
		await api.delete(`/invoices/${id}`);
	},
};
