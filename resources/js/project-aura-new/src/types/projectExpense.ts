export type ExpenseType = 'receipt' | 'expense' | 'invoice';
export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

export interface ProjectExpense {
  id: number;
  project_id: number;
  supplier_id?: number | null;
  submitted_by: number;
  approved_by?: number | null;
  type: ExpenseType;
  amount: string; // decimal from API
  currency: string;
  description?: string | null;
  expense_date: string; // ISO date
  receipt_file_path?: string | null;
  receipt_file_url?: string | null;
  status: ExpenseStatus;
  approved_at?: string | null;
  rejection_reason?: string | null;
  is_reimbursable: boolean;
  reimbursement_noted: boolean;
  xero_expense_id?: string | null;
  created_at?: string;
  updated_at?: string;

  // eager-loaded relations
  submitted_by_user?: { id: number; name: string; email: string } | null;
  approved_by_user?: { id: number; name: string; email: string } | null;
  supplier?: { id: number; company_name: string } | null;
}

export interface ProjectBudget {
  allocated: string | null;
  spent: string;
  remaining: string | null;
}

export interface ProjectExpensesResponse {
  expenses: ProjectExpense[];
  budget: ProjectBudget;
}
