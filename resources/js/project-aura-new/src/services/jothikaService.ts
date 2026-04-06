import { api } from '@/lib/api';

export interface JothikaTokenStatus {
	has_token: boolean;
	is_valid: boolean;
}

export interface ReimbursementResponse {
	message: string;
	jothika_id?: number;
	status?: string;
}

export interface ReimbursementData {
	amount: number;
	currency: string;
	description: string;
	expense_date: string;
	client_name?: string;
	is_cost_of_sales?: boolean;
	reference?: string;
}

class JothikaService {
	/**
	 * Check if current user has a valid Jothika token
	 */
	async getTokenStatus(): Promise<JothikaTokenStatus> {
		return await api.get<JothikaTokenStatus>('/api/jothika/token/status');
	}

	/**
	 * Store a Jothika API token for current user
	 */
	async storeToken(token: string, expiresAt?: string): Promise<{ message: string; has_token: boolean }> {
		return await api.post<{ message: string; has_token: boolean }>('/api/jothika/token', {
			token,
			expires_at: expiresAt,
		});
	}

	/**
	 * Revoke/disconnect Jothika token for current user
	 */
	async revokeToken(): Promise<{ message: string }> {
		return await api.delete<{ message: string }>('/api/jothika/token');
	}

	/**
	 * Create a reimbursement in Jothika from a project expense
	 */
	async createReimbursementFromExpense(
		projectId: number,
		expenseId: number
	): Promise<ReimbursementResponse> {
		return await api.post<ReimbursementResponse>(
			'/api/jothika/reimbursement/create-from-expense',
			{
				project_id: projectId,
				expense_id: expenseId,
			}
		);
	}

	/**
	 * Create a custom reimbursement in Jothika
	 */
	async createReimbursement(data: ReimbursementData): Promise<ReimbursementResponse> {
		return await api.post<ReimbursementResponse>('/api/jothika/reimbursement', data);
	}
}

export const jothikaService = new JothikaService();
