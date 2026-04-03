import { api } from '@/lib/api';
import { ClientFinancialDashboard } from '@/types/financial';

type RawClientFinancialDashboard = {
	client_id: number;
	client_name: string;
	profitability: {
		client_id: number;
		total_projects: number;
		total_revenue: number;
		total_cost: number;
		total_profit: number;
		profit_margin_percentage: number;
		projects: Array<{
			id: number;
			name: string;
			revenue: number;
			cost: number;
			profit: number | null;
			profit_margin: number | null;
		}>;
	};
	invoices: {
		total_invoiced: number;
		total_paid: number;
		total_outstanding: number;
		pending_count: number;
		completed_count: number;
		pending_invoices: Array<{
			project_id: number;
			project_name: string;
			invoice_number: string;
			amount: number;
			currency: string;
			is_physical: boolean;
			delivery_status: string;
			is_paid: boolean;
		}>;
		completed_invoices: Array<{
			project_id: number;
			project_name: string;
			invoice_number: string;
			amount: number;
			currency: string;
			is_physical: boolean;
			delivery_status: string;
			is_paid: boolean;
		}>;
	};
	project_status: {
		total_projects: number;
		status_counts: Record<string, number>;
		status_percentages: Record<string, number>;
	};
};

const mapInvoice = (invoice: RawClientFinancialDashboard['invoices']['pending_invoices'][number]) => ({
	projectId: invoice.project_id,
	projectName: invoice.project_name,
	invoiceNumber: invoice.invoice_number,
	amount: invoice.amount,
	currency: invoice.currency,
	isPhysical: invoice.is_physical,
	deliveryStatus: invoice.delivery_status,
	isPaid: invoice.is_paid,
});

const normalizeNumber = (value: number | null | undefined) => value ?? 0;

const mapClientFinancialDashboard = (raw: RawClientFinancialDashboard): ClientFinancialDashboard => ({
	clientId: raw.client_id,
	clientName: raw.client_name,
	profitability: {
		clientId: raw.profitability.client_id,
		totalProjects: raw.profitability.total_projects,
		totalRevenue: raw.profitability.total_revenue,
		totalCost: raw.profitability.total_cost,
		totalProfit: raw.profitability.total_profit,
		profitMarginPercentage: raw.profitability.profit_margin_percentage,
		projects: raw.profitability.projects.map((project) => ({
			id: project.id,
			name: project.name,
			revenue: project.revenue,
			cost: project.cost,
			profit: normalizeNumber(project.profit),
			profitMargin: normalizeNumber(project.profit_margin),
		})),
	},
	invoices: {
		totalInvoiced: raw.invoices.total_invoiced,
		totalPaid: raw.invoices.total_paid,
		totalOutstanding: raw.invoices.total_outstanding,
		pendingCount: raw.invoices.pending_count,
		completedCount: raw.invoices.completed_count,
		pendingInvoices: raw.invoices.pending_invoices.map(mapInvoice),
		completedInvoices: raw.invoices.completed_invoices.map(mapInvoice),
	},
	projectStatus: {
		totalProjects: raw.project_status.total_projects,
		statusCounts: raw.project_status.status_counts,
		statusPercentages: raw.project_status.status_percentages,
	},
});

export const financialService = {
	getClientFinancialDashboard: async (clientId: number): Promise<ClientFinancialDashboard> => {
		const response = await api.get<RawClientFinancialDashboard>(`/clients/${clientId}/financial-dashboard`);
		return mapClientFinancialDashboard(response);
	},
};
