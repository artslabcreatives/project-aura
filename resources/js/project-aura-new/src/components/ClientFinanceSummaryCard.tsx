import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import {
	BarChart3,
	DollarSign,
	TrendingUp,
	TrendingDown,
	Wallet,
	FileText,
	AlertCircle,
	CheckCircle2,
	Receipt,
} from 'lucide-react';
import { financialService } from '@/services/financialService';
import { ClientFinancialDashboard } from '@/types/financial';
import { Project } from '@/types/project';
import { cn } from '@/lib/utils';

interface Props {
	/** Numeric client ID. When omitted (internal projects), stats are derived from `projects` directly. */
	clientId?: number;
	projects: Project[];
}

interface Stats {
	totalRevenue: number;
	totalCost: number;
	totalProfit: number;
	profitMarginPct: number;
	totalProjects: number;
	totalBudget: number;
	invoiced: number;
	paid: number;
	outstanding: number;
	pendingCount: number;
}

function deriveFromProjects(projects: Project[]): Stats {
	const totalRevenue = projects.reduce((s, p) => s + (p.totalRevenue ?? 0), 0);
	const totalCost = projects.reduce((s, p) => s + (p.totalCost ?? 0), 0);
	const totalProfit = projects.reduce((s, p) => s + (p.actualProfit ?? (p.totalRevenue ?? 0) - (p.totalCost ?? 0)), 0);
	const profitMarginPct = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
	const totalBudget = projects.reduce((s, p) => s + (p.budget_allocated ?? 0), 0);
	return {
		totalRevenue,
		totalCost,
		totalProfit,
		profitMarginPct,
		totalProjects: projects.length,
		totalBudget,
		invoiced: 0,
		paid: 0,
		outstanding: 0,
		pendingCount: 0,
	};
}

function deriveFromDashboard(dashboard: ClientFinancialDashboard, projects: Project[]): Stats {
	const { profitability, invoices } = dashboard;
	return {
		totalRevenue: profitability.totalRevenue,
		totalCost: profitability.totalCost,
		totalProfit: profitability.totalProfit,
		profitMarginPct: profitability.profitMarginPercentage,
		totalProjects: profitability.totalProjects,
		totalBudget: projects.reduce((s, p) => s + (p.budget_allocated ?? 0), 0),
		invoiced: invoices.totalInvoiced,
		paid: invoices.totalPaid,
		outstanding: invoices.totalOutstanding,
		pendingCount: invoices.pendingCount,
	};
}

export function ClientFinanceSummaryCard({ clientId, projects }: Props) {
	const [dashboard, setDashboard] = useState<ClientFinancialDashboard | null>(null);
	const [loading, setLoading] = useState(!!clientId);

	useEffect(() => {
		if (!clientId) return;
		setLoading(true);
		financialService
			.getClientFinancialDashboard(clientId)
			.then(setDashboard)
			.catch(console.error)
			.finally(() => setLoading(false));
	}, [clientId]);

	const fmt = (n: number) =>
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0,
		}).format(n);

	if (loading) {
		return (
			<Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
				<CardHeader className="pb-4">
					<Skeleton className="h-6 w-52" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} className="h-20 w-full rounded-xl" />
						))}
					</div>
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<div className="grid grid-cols-3 gap-3 pt-2">
						{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
					</div>
				</CardContent>
			</Card>
		);
	}

	const stats: Stats = clientId && dashboard
		? deriveFromDashboard(dashboard, projects)
		: deriveFromProjects(projects);

	const { totalRevenue, totalCost, totalProfit, profitMarginPct, totalProjects, totalBudget,
		invoiced, paid, outstanding, pendingCount } = stats;

	const isProfit = totalProfit >= 0;
	const hasInvoices = invoiced > 0;

	const budgetPct = totalBudget > 0 ? Math.min((totalCost / totalBudget) * 100, 100) : 0;
	const collectedPct = invoiced > 0 ? Math.min((paid / invoiced) * 100, 100) : 0;
	const budgetBarColor = budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-orange-400' : 'bg-primary';

	return (
		<Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
			<CardHeader className="pb-4">
				<CardTitle className="text-xl font-semibold flex items-center gap-2">
					<BarChart3 className="h-5 w-5 text-primary" />
					Financial Overview
					<Badge
						variant={isProfit ? 'default' : 'destructive'}
						className="ml-auto text-xs font-normal"
					>
						{isProfit ? '+' : ''}{profitMarginPct.toFixed(1)}% margin
					</Badge>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5">
				{/* Primary stat tiles */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					<StatTile
						label="Total Revenue"
						value={fmt(totalRevenue)}
						icon={<DollarSign className="h-4 w-4 text-primary" />}
						sub={`${totalProjects} project${totalProjects !== 1 ? 's' : ''}`}
					/>
					<StatTile
						label="Budget Allocated"
						value={totalBudget > 0 ? fmt(totalBudget) : '—'}
						icon={<Wallet className="h-4 w-4 text-blue-500" />}
						sub="across all projects"
					/>
					<StatTile
						label="Total Costs"
						value={fmt(totalCost)}
						icon={<Receipt className="h-4 w-4 text-orange-500" />}
						sub="labor & expenses"
					/>
					<StatTile
						label="Net Profit"
						value={fmt(totalProfit)}
						icon={
							isProfit
								? <TrendingUp className="h-4 w-4 text-green-500" />
								: <TrendingDown className="h-4 w-4 text-red-500" />
						}
						sub={`${profitMarginPct.toFixed(1)}% margin`}
						valueClass={isProfit
							? 'text-green-600 dark:text-green-400'
							: 'text-red-600 dark:text-red-400'}
					/>
				</div>

				{/* Progress bars */}
				<div className="space-y-3">
					{totalBudget > 0 && (
						<ProgressRow
							label="Budget Utilization"
							right={`${budgetPct.toFixed(0)}% used`}
							pct={budgetPct}
							barClass={budgetBarColor}
						/>
					)}
					{hasInvoices && (
						<ProgressRow
							label="Invoice Collection"
							right={`${fmt(paid)} of ${fmt(invoiced)}`}
							pct={collectedPct}
							barClass="bg-green-500"
						/>
					)}
				</div>

				{/* Invoice strip — only shown when invoice data is available */}
				{hasInvoices && (
					<div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
						<InvoiceTile
							label="Invoiced"
							value={fmt(invoiced)}
							icon={<FileText className="h-3.5 w-3.5 text-muted-foreground" />}
						/>
						<InvoiceTile
							label="Collected"
							value={fmt(paid)}
							icon={<CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
						/>
						<InvoiceTile
							label="Outstanding"
							value={fmt(outstanding)}
							icon={<AlertCircle className="h-3.5 w-3.5 text-orange-500" />}
							sub={pendingCount > 0 ? `${pendingCount} pending` : undefined}
							valueClass={outstanding > 0 ? 'text-orange-600 dark:text-orange-400' : ''}
						/>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function StatTile({
	label, value, icon, sub, valueClass,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
	sub?: string;
	valueClass?: string;
}) {
	return (
		<div className="rounded-xl bg-background/60 border border-border/40 p-3 space-y-1">
			<div className="flex items-center justify-between">
				<p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide leading-none">
					{label}
				</p>
				{icon}
			</div>
			<p className={cn('text-lg font-bold leading-tight tabular-nums', valueClass)}>{value}</p>
			{sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
		</div>
	);
}

function ProgressRow({
	label, right, pct, barClass,
}: {
	label: string;
	right: string;
	pct: number;
	barClass: string;
}) {
	return (
		<div className="space-y-1.5">
			<div className="flex justify-between text-xs text-muted-foreground">
				<span>{label}</span>
				<span>{right}</span>
			</div>
			<div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
				<div
					className={cn('h-full rounded-full transition-all', barClass)}
					style={{ width: `${pct}%` }}
				/>
			</div>
		</div>
	);
}

function InvoiceTile({
	label, value, icon, sub, valueClass,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
	sub?: string;
	valueClass?: string;
}) {
	return (
		<div className="text-center space-y-1">
			<div className="flex items-center justify-center gap-1.5">
				{icon}
				<p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
					{label}
				</p>
			</div>
			<p className={cn('text-sm font-bold tabular-nums', valueClass)}>{value}</p>
			{sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
		</div>
	);
}
