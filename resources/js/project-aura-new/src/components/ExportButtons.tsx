import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { api } from '../lib/api';
import { useToast } from '../hooks/use-toast';

interface ExportButtonsProps {
	type: 'client-financial' | 'project-profitability' | 'department-efficiency';
	id: number;
}

export function ExportButtons({ type, id }: ExportButtonsProps) {
	const { toast } = useToast();

	const handleExportCSV = async () => {
		try {
			let data: any;
			let filename: string;

			switch (type) {
				case 'client-financial':
					const clientResponse = await api.get(`/api/clients/${id}/financial-dashboard`);
					data = clientResponse.data;
					filename = `client-${id}-financial-report.csv`;
					break;
				case 'project-profitability':
					const projectResponse = await api.get(`/api/projects/${id}/profitability`);
					data = projectResponse.data;
					filename = `project-${id}-profitability.csv`;
					break;
				case 'department-efficiency':
					const deptResponse = await api.get(`/api/departments/${id}/efficiency`);
					data = deptResponse.data;
					filename = `department-${id}-efficiency.csv`;
					break;
			}

			const csv = convertToCSV(data, type);
			downloadCSV(csv, filename);

			toast({
				title: 'Export Successful',
				description: 'Report has been downloaded',
			});
		} catch (error) {
			console.error('Export failed:', error);
			toast({
				title: 'Export Failed',
				description: 'Failed to export report',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className="flex gap-2">
			<Button onClick={handleExportCSV} variant="outline" size="sm">
				<Download className="h-4 w-4 mr-2" />
				Export CSV
			</Button>
		</div>
	);
}

function convertToCSV(data: any, type: string): string {
	let rows: string[][] = [];

	switch (type) {
		case 'client-financial':
			rows.push(['Metric', 'Value']);
			rows.push(['Client Name', data.client_name || '']);
			rows.push(['Total Revenue', data.profitability.total_revenue.toString()]);
			rows.push(['Total Cost', data.profitability.total_cost.toString()]);
			rows.push(['Total Profit', data.profitability.total_profit.toString()]);
			rows.push(['Profit Margin %', data.profitability.profit_margin_percentage.toString()]);
			rows.push(['Total Invoiced', data.invoices.total_invoiced.toString()]);
			rows.push(['Total Outstanding', data.invoices.total_outstanding.toString()]);
			rows.push([]);
			rows.push(['Project Breakdown']);
			rows.push(['Project Name', 'Revenue', 'Cost', 'Profit', 'Profit Margin %']);
			data.profitability.projects.forEach((project: any) => {
				rows.push([
					project.name,
					project.revenue.toString(),
					project.cost.toString(),
					project.profit.toString(),
					project.profit_margin?.toString() || '0',
				]);
			});
			break;

		case 'project-profitability':
			rows.push(['Project Profitability Report']);
			rows.push(['Project', data.project_name]);
			rows.push([]);
			rows.push(['Metric', 'Value']);
			rows.push(['Revenue', data.profitability.revenue.toString()]);
			rows.push(['Cost', data.profitability.cost.toString()]);
			rows.push(['Profit', data.profitability.profit.toString()]);
			rows.push(['Profit Margin %', data.profitability.profit_margin_percentage.toString()]);
			rows.push([]);
			rows.push(['Task Breakdown']);
			rows.push(['Task', 'Estimated Hours', 'Actual Hours', 'Rate', 'Estimated Cost', 'Actual Cost', 'Variance', 'Efficiency %']);
			data.task_breakdown.forEach((task: any) => {
				rows.push([
					task.task_name,
					task.estimated_hours.toString(),
					task.actual_hours.toString(),
					task.hourly_rate.toString(),
					task.estimated_cost.toString(),
					task.actual_cost.toString(),
					task.variance.toString(),
					task.efficiency_percentage.toString(),
				]);
			});
			break;

		case 'department-efficiency':
			rows.push(['Department Efficiency Report']);
			rows.push(['Metric', 'Value']);
			if (data.overall_efficiency !== undefined) {
				rows.push(['Overall Efficiency', data.overall_efficiency.toString() + '%']);
			}
			if (data.total_tasks !== undefined) {
				rows.push(['Total Tasks', data.total_tasks.toString()]);
			}
			if (data.avg_completion_time !== undefined) {
				rows.push(['Avg Completion Time', data.avg_completion_time.toString() + ' hours']);
			}
			break;
	}

	return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

function downloadCSV(csv: string, filename: string) {
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', filename);
	link.style.visibility = 'hidden';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
