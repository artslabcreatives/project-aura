import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { DollarSign, TrendingUp, TrendingDown, FileText, Package } from 'lucide-react';
import api from '../lib/api';
import { ClientFinancialDashboard } from '../types/financial';

interface ClientFinancialDashboardProps {
	clientId: number;
}

export function ClientFinancialDashboardComponent({ clientId }: ClientFinancialDashboardProps) {
	const [dashboard, setDashboard] = useState<ClientFinancialDashboard | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboard = async () => {
			try {
				setLoading(true);
				const response = await api.get(`/api/clients/${clientId}/financial-dashboard`);
				setDashboard(response.data);
			} catch (error) {
				console.error('Failed to fetch financial dashboard:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboard();
	}, [clientId]);

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Card key={i}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Loading...</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">-</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (!dashboard) {
		return <div>Failed to load financial dashboard</div>;
	}

	const formatCurrency = (amount: number, currency = 'USD') => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency,
		}).format(amount);
	};

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(dashboard.profitability.totalRevenue)}
						</div>
						<p className="text-xs text-muted-foreground">
							From {dashboard.profitability.totalProjects} projects
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Profit</CardTitle>
						{dashboard.profitability.totalProfit >= 0 ? (
							<TrendingUp className="h-4 w-4 text-green-500" />
						) : (
							<TrendingDown className="h-4 w-4 text-red-500" />
						)}
					</CardHeader>
					<CardContent>
						<div
							className={`text-2xl font-bold ${
								dashboard.profitability.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
							}`}
						>
							{formatCurrency(dashboard.profitability.totalProfit)}
						</div>
						<p className="text-xs text-muted-foreground">
							{dashboard.profitability.profitMarginPercentage.toFixed(2)}% margin
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(dashboard.invoices.totalInvoiced)}
						</div>
						<p className="text-xs text-muted-foreground">
							{dashboard.invoices.completedCount} paid, {dashboard.invoices.pendingCount} pending
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Outstanding</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-orange-600">
							{formatCurrency(dashboard.invoices.totalOutstanding)}
						</div>
						<p className="text-xs text-muted-foreground">
							{dashboard.invoices.pendingCount} pending invoices
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="profitability" className="w-full">
				<TabsList>
					<TabsTrigger value="profitability">Profitability</TabsTrigger>
					<TabsTrigger value="invoices">Invoices</TabsTrigger>
					<TabsTrigger value="projects">Projects</TabsTrigger>
				</TabsList>

				<TabsContent value="profitability" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Project Profitability</CardTitle>
							<CardDescription>Revenue and profit breakdown by project</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{dashboard.profitability.projects.map((project) => (
									<div
										key={project.id}
										className="flex items-center justify-between border-b pb-4 last:border-0"
									>
										<div>
											<p className="font-medium">{project.name}</p>
											<div className="flex gap-4 text-sm text-muted-foreground">
												<span>Revenue: {formatCurrency(project.revenue)}</span>
												<span>Cost: {formatCurrency(project.cost)}</span>
											</div>
										</div>
										<div className="text-right">
											<p
												className={`font-bold ${
													project.profit >= 0 ? 'text-green-600' : 'text-red-600'
												}`}
											>
												{formatCurrency(project.profit)}
											</p>
											<p className="text-sm text-muted-foreground">
												{project.profitMargin?.toFixed(2)}% margin
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="invoices" className="space-y-4">
					{dashboard.invoices.pendingInvoices.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Pending Invoices</CardTitle>
								<CardDescription>{dashboard.invoices.pendingCount} invoices awaiting payment</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{dashboard.invoices.pendingInvoices.map((invoice) => (
										<div
											key={invoice.projectId}
											className="flex items-center justify-between border-b pb-4 last:border-0"
										>
											<div>
												<p className="font-medium">{invoice.projectName}</p>
												<p className="text-sm text-muted-foreground">
													Invoice #{invoice.invoiceNumber}
												</p>
												{invoice.isPhysical && (
													<Badge variant="outline" className="mt-1">
														Physical - {invoice.deliveryStatus}
													</Badge>
												)}
											</div>
											<div className="text-right">
												<p className="font-bold">
													{formatCurrency(invoice.amount, invoice.currency)}
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{dashboard.invoices.completedInvoices.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Paid Invoices</CardTitle>
								<CardDescription>{dashboard.invoices.completedCount} completed payments</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{dashboard.invoices.completedInvoices.map((invoice) => (
										<div
											key={invoice.projectId}
											className="flex items-center justify-between border-b pb-4 last:border-0"
										>
											<div>
												<p className="font-medium">{invoice.projectName}</p>
												<p className="text-sm text-muted-foreground">
													Invoice #{invoice.invoiceNumber}
												</p>
											</div>
											<div className="text-right">
												<p className="font-bold text-green-600">
													{formatCurrency(invoice.amount, invoice.currency)}
												</p>
												<Badge variant="default" className="bg-green-500 mt-1">
													Paid
												</Badge>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="projects" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Project Status</CardTitle>
							<CardDescription>Overview of all projects for this client</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{Object.entries(dashboard.projectStatus.statusCounts).map(([status, count]) => (
									<div key={status} className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Badge variant="outline">{status}</Badge>
										</div>
										<div className="flex items-center gap-4">
											<span className="text-sm text-muted-foreground">{count} projects</span>
											<span className="font-bold">
												{dashboard.projectStatus.statusPercentages[status].toFixed(1)}%
											</span>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
