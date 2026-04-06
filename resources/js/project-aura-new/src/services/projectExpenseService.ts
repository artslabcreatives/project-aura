import { api } from '@/lib/api';
import { ProjectExpense, ProjectExpensesResponse } from '@/types/projectExpense';

export const projectExpenseService = {
	async list(projectId: number): Promise<ProjectExpensesResponse> {
		const res = await api.get(`/projects/${projectId}/expenses`);
		return res.data;
	},

	async create(
		projectId: number,
		data: {
			type: string;
			amount: number;
			currency?: string;
			description?: string;
			expense_date: string;
			supplier_id?: number | null;
			is_reimbursable?: boolean;
			receipt?: File | null;
		}
	): Promise<ProjectExpense> {
		const form = new FormData();
		form.append('type', data.type);
		form.append('amount', String(data.amount));
		form.append('expense_date', data.expense_date);
		if (data.currency) form.append('currency', data.currency);
		if (data.description) form.append('description', data.description);
		if (data.supplier_id != null) form.append('supplier_id', String(data.supplier_id));
		if (data.is_reimbursable != null) form.append('is_reimbursable', data.is_reimbursable ? '1' : '0');
		if (data.receipt) form.append('receipt', data.receipt);

		const res = await api.post(`/projects/${projectId}/expenses`, form, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		return res.data;
	},

	async update(
		projectId: number,
		expenseId: number,
		data: Partial<{
			type: string;
			amount: number;
			currency: string;
			description: string;
			expense_date: string;
			supplier_id: number | null;
			is_reimbursable: boolean;
			reimbursement_noted: boolean;
			receipt: File | null;
		}>
	): Promise<ProjectExpense> {
		const form = new FormData();
		if (data.type !== undefined) form.append('type', data.type);
		if (data.amount !== undefined) form.append('amount', String(data.amount));
		if (data.currency !== undefined) form.append('currency', data.currency);
		if (data.description !== undefined) form.append('description', data.description);
		if (data.expense_date !== undefined) form.append('expense_date', data.expense_date);
		if (data.supplier_id != null) form.append('supplier_id', String(data.supplier_id));
		if (data.is_reimbursable != null) form.append('is_reimbursable', data.is_reimbursable ? '1' : '0');
		if (data.reimbursement_noted != null) form.append('reimbursement_noted', data.reimbursement_noted ? '1' : '0');
		if (data.receipt) form.append('receipt', data.receipt);

		const res = await api.post(`/projects/${projectId}/expenses/${expenseId}`, form, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		return res.data;
	},

	async approve(projectId: number, expenseId: number): Promise<ProjectExpense> {
		const res = await api.post(`/projects/${projectId}/expenses/${expenseId}/approve`);
		return res.data;
	},

	async reject(projectId: number, expenseId: number, reason?: string): Promise<ProjectExpense> {
		const res = await api.post(`/projects/${projectId}/expenses/${expenseId}/reject`, { reason });
		return res.data;
	},

	async delete(projectId: number, expenseId: number): Promise<void> {
		await api.delete(`/projects/${projectId}/expenses/${expenseId}`);
	},

	async markReimbursementNoted(projectId: number, expenseId: number): Promise<ProjectExpense> {
		return this.update(projectId, expenseId, { reimbursement_noted: true });
	},
};
