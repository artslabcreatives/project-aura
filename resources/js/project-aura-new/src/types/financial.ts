export interface ProjectProfitability {
	revenue: number;
	cost: number;
	profit: number;
	profitMarginPercentage: number;
}

export interface TaskProfitabilityBreakdown {
	taskId: number;
	taskName: string;
	estimatedHours: number;
	actualHours: number;
	hourlyRate: number;
	estimatedCost: number;
	actualCost: number;
	variance: number;
	efficiencyPercentage: number;
}

export interface ClientProfitability {
	clientId: number;
	totalProjects: number;
	totalRevenue: number;
	totalCost: number;
	totalProfit: number;
	profitMarginPercentage: number;
	projects: Array<{
		id: number;
		name: string;
		revenue: number;
		cost: number;
		profit: number;
		profitMargin: number;
	}>;
}

export interface InvoiceInfo {
	projectId: number;
	projectName: string;
	invoiceNumber: string;
	amount: number;
	currency: string;
	isPhysical: boolean;
	deliveryStatus: string;
	isPaid: boolean;
}

export interface InvoiceSummary {
	totalInvoiced: number;
	totalPaid: number;
	totalOutstanding: number;
	pendingCount: number;
	completedCount: number;
	pendingInvoices: InvoiceInfo[];
	completedInvoices: InvoiceInfo[];
}

export interface ProjectStatusBreakdown {
	totalProjects: number;
	statusCounts: Record<string, number>;
	statusPercentages: Record<string, number>;
}

export interface ClientFinancialDashboard {
	clientId: number;
	clientName: string;
	profitability: ClientProfitability;
	invoices: InvoiceSummary;
	projectStatus: ProjectStatusBreakdown;
}

export interface FinancialAggregation {
	totalClients: number;
	totalRevenue: number;
	totalCost: number;
	totalProfit: number;
	totalInvoiced: number;
	totalOutstanding: number;
	clientsBreakdown: Array<{
		clientId: number;
		clientName: string;
		revenue: number;
		profit: number;
		profitMargin: number;
		outstandingInvoices: number;
	}>;
}

export interface XeroStatus {
	connected: boolean;
	tenantId?: string;
	tokenExpiresAt?: string;
	lastSyncedAt?: string;
}
