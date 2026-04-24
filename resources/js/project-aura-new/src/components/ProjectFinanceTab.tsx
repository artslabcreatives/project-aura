import { useEffect, useState, useRef } from 'react';
import { Project } from '@/types/project';
import { ProjectExpense, ProjectBudget } from '@/types/projectExpense';
import { projectExpenseService } from '@/services/projectExpenseService';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { JothikaReimbursementModal } from '@/components/JothikaReimbursementModal';
import {
	Plus,
	Receipt,
	FileText,
	CreditCard,
	MoreHorizontal,
	CheckCircle2,
	XCircle,
	Clock,
	Download,
	Trash2,
	Pencil,
	AlertTriangle,
	Wallet,
	DollarSign,
	TrendingDown,
	Loader2,
	Building2,
	Paperclip,
} from 'lucide-react';

const APPROVER_ROLES = ['admin', 'hr', 'team_lead'];

const TYPE_ICONS: Record<string, React.ReactNode> = {
	receipt: <Receipt className="h-4 w-4" />,
	expense: <CreditCard className="h-4 w-4" />,
	invoice: <FileText className="h-4 w-4" />,
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
	pending: { label: 'Pending Approval', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
	approved: { label: 'Approved', variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
	rejected: { label: 'Rejected', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
};

interface ExpenseFormState {
	type: string;
	amount: string;
	currency: string;
	description: string;
	expense_date: string;
	supplier_id: string;
	is_reimbursable: boolean;
	receipt: File | null;
}

const DEFAULT_FORM: ExpenseFormState = {
	type: 'expense',
	amount: '',
	currency: 'LKR',
	description: '',
	expense_date: new Date().toISOString().split('T')[0],
	supplier_id: '',
	is_reimbursable: false,
	receipt: null,
};

interface ProjectFinanceTabProps {
	project: Project;
	onBudgetUpdate?: (budget_allocated: number | null) => void;
}

export function ProjectFinanceTab({ project, onBudgetUpdate }: ProjectFinanceTabProps) {
	const { currentUser, activeRole } = useUser();
	const { toast } = useToast();

	const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
	const [budget, setBudget] = useState<ProjectBudget | null>(null);
	const [loading, setLoading] = useState(true);

	const [addOpen, setAddOpen] = useState(false);
	const [editExpense, setEditExpense] = useState<ProjectExpense | null>(null);
	const [deleteExpense, setDeleteExpense] = useState<ProjectExpense | null>(null);
	const [rejectExpense, setRejectExpense] = useState<ProjectExpense | null>(null);
	const [rejectReason, setRejectReason] = useState('');
	const [jothikaExpense, setJothikaExpense] = useState<ProjectExpense | null>(null);

	const [form, setForm] = useState<ExpenseFormState>(DEFAULT_FORM);
	const [submitting, setSubmitting] = useState(false);

	// Budget editing
	const [editingBudget, setEditingBudget] = useState(false);
	const [budgetInput, setBudgetInput] = useState('');

	const fileInputRef = useRef<HTMLInputElement>(null);

	const isApprover = currentUser && APPROVER_ROLES.includes(activeRole);
	const clientName = (project as any).client?.company_name ?? 'Client';

	const load = async () => {
		setLoading(true);
		try {
			const data = await projectExpenseService.list(project.id!);
			setExpenses(data.expenses);
			setBudget(data.budget);
		} catch {
			toast({ title: 'Error', description: 'Failed to load expenses.', variant: 'destructive' });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, [project.id]);

	// After creating/approving an expense, check if reimbursable and not yet noted
	const checkReimbursable = (expense: ProjectExpense) => {
		if (expense.is_reimbursable && !expense.reimbursement_noted && expense.status === 'approved') {
			setJothikaExpense(expense);
		}
	};

	// ── Budget Save ──────────────────────────────────────────────────────────────
	const saveBudget = async () => {
		const val = budgetInput === '' ? null : parseFloat(budgetInput);
		try {
			await import('@/lib/api').then(({ api }) =>
				api.put(`/api/projects/${project.id}`, { budget_allocated: val })
			);
			setBudget(prev => prev ? { ...prev, allocated: val !== null ? String(val) : null } : prev);
			onBudgetUpdate?.(val);
			setEditingBudget(false);
			toast({ title: 'Budget updated' });
		} catch {
			toast({ title: 'Error', description: 'Failed to update budget.', variant: 'destructive' });
		}
	};

	// ── Expense Form Submit ──────────────────────────────────────────────────────
	const handleSubmit = async () => {
		if (!form.amount || !form.expense_date || !form.type) {
			toast({ title: 'Validation', description: 'Amount, date and type are required.', variant: 'destructive' });
			return;
		}
		setSubmitting(true);
		try {
			if (editExpense) {
				const updated = await projectExpenseService.update(project.id!, editExpense.id, {
					type: form.type,
					amount: parseFloat(form.amount),
					currency: form.currency,
					description: form.description,
					expense_date: form.expense_date,
					supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
					is_reimbursable: form.is_reimbursable,
					receipt: form.receipt,
				});
				setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
				toast({ title: 'Expense updated' });
			} else {
				const created = await projectExpenseService.create(project.id!, {
					type: form.type,
					amount: parseFloat(form.amount),
					currency: form.currency,
					description: form.description,
					expense_date: form.expense_date,
					supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
					is_reimbursable: form.is_reimbursable,
					receipt: form.receipt,
				});
				setExpenses(prev => [created, ...prev]);
				checkReimbursable(created);
				toast({ title: created.status === 'approved' ? 'Expense added & approved' : 'Expense submitted for approval' });
			}
			// reload budget
			const data = await projectExpenseService.list(project.id!);
			setBudget(data.budget);
			setAddOpen(false);
			setEditExpense(null);
			setForm(DEFAULT_FORM);
		} catch (err: any) {
			const msg = err?.response?.data?.message ?? 'Failed to save expense.';
			toast({ title: 'Error', description: msg, variant: 'destructive' });
		} finally {
			setSubmitting(false);
		}
	};

	const openEdit = (expense: ProjectExpense) => {
		setEditExpense(expense);
		setForm({
			type: expense.type,
			amount: expense.amount,
			currency: expense.currency,
			description: expense.description ?? '',
			expense_date: expense.expense_date,
			supplier_id: expense.supplier_id ? String(expense.supplier_id) : '',
			is_reimbursable: expense.is_reimbursable,
			receipt: null,
		});
		setAddOpen(true);
	};

	const handleApprove = async (expense: ProjectExpense) => {
		try {
			const updated = await projectExpenseService.approve(project.id!, expense.id);
			setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
			const data = await projectExpenseService.list(project.id!);
			setBudget(data.budget);
			toast({ title: 'Expense approved' });
			checkReimbursable(updated);
		} catch {
			toast({ title: 'Error', description: 'Failed to approve.', variant: 'destructive' });
		}
	};

	const handleReject = async () => {
		if (!rejectExpense) return;
		try {
			const updated = await projectExpenseService.reject(project.id!, rejectExpense.id, rejectReason);
			setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
			toast({ title: 'Expense rejected' });
			setRejectExpense(null);
			setRejectReason('');
		} catch {
			toast({ title: 'Error', description: 'Failed to reject.', variant: 'destructive' });
		}
	};

	const handleDelete = async () => {
		if (!deleteExpense) return;
		try {
			await projectExpenseService.delete(project.id!, deleteExpense.id);
			setExpenses(prev => prev.filter(e => e.id !== deleteExpense.id));
			const data = await projectExpenseService.list(project.id!);
			setBudget(data.budget);
			toast({ title: 'Expense deleted' });
			setDeleteExpense(null);
		} catch {
			toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
		}
	};

	// ── Budget bar ──────────────────────────────────────────────────────────────
	const budgetProgress = () => {
		if (!budget?.allocated || !budget?.spent) return 0;
		const pct = (parseFloat(budget.spent) / parseFloat(budget.allocated)) * 100;
		return Math.min(pct, 100);
	};

	const budgetOverrun = budget?.allocated && budget?.spent
		? parseFloat(budget.spent) > parseFloat(budget.allocated)
		: false;

	if (loading) {
		return (
			<div className="space-y-4 p-4">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-16 w-full" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Budget Overview */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base flex items-center gap-2">
							<Wallet className="h-4 w-4" />
							Budget
						</CardTitle>
						{isApprover && !editingBudget && (
							<Button variant="ghost" size="sm" onClick={() => {
								setBudgetInput(budget?.allocated ?? '');
								setEditingBudget(true);
							}}>
								<Pencil className="h-3 w-3 mr-1" /> Set budget
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					{editingBudget ? (
						<div className="flex items-center gap-2">
							<Input
								type="number"
								min="0"
								placeholder="Allocated budget"
								value={budgetInput}
								onChange={e => setBudgetInput(e.target.value)}
								className="w-44"
							/>
							<Button size="sm" onClick={saveBudget}>Save</Button>
							<Button size="sm" variant="ghost" onClick={() => setEditingBudget(false)}>Cancel</Button>
						</div>
					) : (
						<div className="grid grid-cols-3 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground text-xs mb-0.5">Allocated</p>
								<p className="font-semibold text-lg">
									{budget?.allocated ? `${project.currency ?? 'USD'} ${parseFloat(budget.allocated).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs mb-0.5">Spent (approved)</p>
								<p className={`font-semibold text-lg ${budgetOverrun ? 'text-destructive' : ''}`}>
									{project.currency ?? 'USD'} {parseFloat(budget?.spent ?? '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
								</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs mb-0.5">Remaining</p>
								<p className={`font-semibold text-lg ${budgetOverrun ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
									{budget?.remaining != null
										? `${project.currency ?? 'USD'} ${parseFloat(budget.remaining).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
										: '—'}
								</p>
							</div>
						</div>
					)}
					{budget?.allocated && (
						<div className="space-y-1">
							<Progress value={budgetProgress()} className={budgetOverrun ? '[&>div]:bg-destructive' : ''} />
							{budgetOverrun && (
								<p className="text-xs text-destructive flex items-center gap-1">
									<AlertTriangle className="h-3 w-3" /> Budget exceeded
								</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Expense List */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
						Financial Entries
					</h3>
					<Button size="sm" onClick={() => { setForm(DEFAULT_FORM); setEditExpense(null); setAddOpen(true); }}>
						<Plus className="h-4 w-4 mr-1" /> Add Entry
					</Button>
				</div>

				{expenses.length === 0 ? (
					<div className="text-center py-10 text-muted-foreground border rounded-lg">
						<DollarSign className="h-8 w-8 mx-auto mb-2 opacity-40" />
						<p className="text-sm">No financial entries yet</p>
						<p className="text-xs">Add a receipt, expense, or invoice below</p>
					</div>
				) : (
					<div className="space-y-2">
						{expenses.map(expense => {
							const statusCfg = STATUS_CONFIG[expense.status];
							const canApproveReject = isApprover && expense.status === 'pending';
							const canEdit = isApprover || (expense.submitted_by === currentUser?.id && expense.status === 'pending');
							const canDelete = isApprover || (expense.submitted_by === currentUser?.id && expense.status === 'pending');

							return (
								<div key={expense.id} className="flex items-start gap-3 border rounded-lg p-3 hover:bg-muted/30 transition-colors">
									<div className="text-muted-foreground mt-0.5">{TYPE_ICONS[expense.type]}</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											<span className="font-medium text-sm capitalize">{expense.type}</span>
											<Badge variant={statusCfg.variant} className="text-xs flex items-center gap-1 px-1.5">
												{statusCfg.icon}
												{statusCfg.label}
											</Badge>
											{expense.is_reimbursable && (
												<Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
													Reimbursable
												</Badge>
											)}
										</div>
										<p className="text-sm font-semibold mt-0.5">
											{expense.currency} {parseFloat(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
										</p>
										{expense.description && (
											<p className="text-xs text-muted-foreground truncate">{expense.description}</p>
										)}
										<div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
											<span>{new Date(expense.expense_date).toLocaleDateString()}</span>
											{expense.supplier && (
												<span className="flex items-center gap-1">
													<Building2 className="h-3 w-3" />
													{expense.supplier.company_name}
												</span>
											)}
											<span>by {expense.submitted_by_user?.name ?? '—'}</span>
											{expense.receipt_file_url && (
												<a
													href={expense.receipt_file_url}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-1 text-primary hover:underline"
												>
													<Paperclip className="h-3 w-3" /> Receipt
												</a>
											)}
										</div>
										{expense.status === 'rejected' && expense.rejection_reason && (
											<p className="text-xs text-destructive mt-1 flex items-center gap-1">
												<XCircle className="h-3 w-3" /> {expense.rejection_reason}
											</p>
										)}
										{expense.is_reimbursable && expense.status === 'approved' && !expense.reimbursement_noted && (
											<button
												onClick={() => setJothikaExpense(expense)}
												className="text-xs text-amber-600 hover:underline mt-1 flex items-center gap-1"
											>
												<AlertTriangle className="h-3 w-3" /> Create reimbursement in Jothika
											</button>
										)}
									</div>

									{(canApproveReject || canEdit || canDelete) && (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												{canApproveReject && (
													<>
														<DropdownMenuItem onClick={() => handleApprove(expense)} className="text-green-600">
															<CheckCircle2 className="h-4 w-4 mr-2" /> Approve
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => { setRejectExpense(expense); setRejectReason(''); }} className="text-destructive">
															<XCircle className="h-4 w-4 mr-2" /> Reject
														</DropdownMenuItem>
													</>
												)}
												{canEdit && (
													<DropdownMenuItem onClick={() => openEdit(expense)}>
														<Pencil className="h-4 w-4 mr-2" /> Edit
													</DropdownMenuItem>
												)}
												{canDelete && (
													<DropdownMenuItem onClick={() => setDeleteExpense(expense)} className="text-destructive">
														<Trash2 className="h-4 w-4 mr-2" /> Delete
													</DropdownMenuItem>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Add / Edit Dialog */}
			<Dialog open={addOpen} onOpenChange={open => { if (!open) { setAddOpen(false); setEditExpense(null); setForm(DEFAULT_FORM); } }}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>{editExpense ? 'Edit Entry' : 'Add Financial Entry'}</DialogTitle>
						<DialogDescription>
							{editExpense ? 'Update this expense entry.' : 'Add a receipt, expense, or invoice to this project.'}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3">
						<div className="grid grid-cols-2 gap-3">
							<div>
								<Label>Type *</Label>
								<Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
									<SelectTrigger><SelectValue /></SelectTrigger>
									<SelectContent>
										<SelectItem value="receipt">Receipt</SelectItem>
										<SelectItem value="expense">Expense</SelectItem>
										<SelectItem value="invoice">Invoice</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label>Currency</Label>
								<Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
									<SelectTrigger><SelectValue /></SelectTrigger>
									<SelectContent>
										<SelectItem value="LKR">LKR</SelectItem>
										<SelectItem value="USD">USD</SelectItem>
										<SelectItem value="AUD">AUD</SelectItem>
										<SelectItem value="GBP">GBP</SelectItem>
										<SelectItem value="EUR">EUR</SelectItem>
										<SelectItem value="SGD">SGD</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<Label>Amount *</Label>
								<Input
									type="number"
									min="0.01"
									step="0.01"
									placeholder="0.00"
									value={form.amount}
									onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
								/>
							</div>
							<div>
								<Label>Date *</Label>
								<Input
									type="date"
									value={form.expense_date}
									onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))}
								/>
							</div>
						</div>

						<div>
							<Label>Description</Label>
							<Textarea
								placeholder="What is this expense for?"
								rows={2}
								value={form.description}
								onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
							/>
						</div>

						<div>
							<Label>Receipt / Document</Label>
							<div className="mt-1">
								<input
									ref={fileInputRef}
									type="file"
									accept=".jpg,.jpeg,.png,.pdf,.webp,.heic"
									className="hidden"
									onChange={e => setForm(f => ({ ...f, receipt: e.target.files?.[0] ?? null }))}
								/>
								<Button variant="outline" size="sm" type="button" onClick={() => fileInputRef.current?.click()}>
									<Paperclip className="h-4 w-4 mr-2" />
									{form.receipt ? form.receipt.name : (editExpense?.receipt_file_url ? 'Replace file' : 'Upload file')}
								</Button>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<input
								id="is_reimbursable"
								type="checkbox"
								className="rounded border"
								checked={form.is_reimbursable}
								onChange={e => setForm(f => ({ ...f, is_reimbursable: e.target.checked }))}
							/>
							<Label htmlFor="is_reimbursable" className="cursor-pointer">
								I paid this personally (reimbursable)
							</Label>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => { setAddOpen(false); setEditExpense(null); setForm(DEFAULT_FORM); }}>
							Cancel
						</Button>
						<Button onClick={handleSubmit} disabled={submitting}>
							{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
							{editExpense ? 'Save Changes' : 'Add Entry'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reject Dialog */}
			<Dialog open={!!rejectExpense} onOpenChange={open => { if (!open) setRejectExpense(null); }}>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Reject Expense</DialogTitle>
						<DialogDescription>Optionally provide a reason for rejection.</DialogDescription>
					</DialogHeader>
					<Textarea
						placeholder="Reason (optional)"
						value={rejectReason}
						onChange={e => setRejectReason(e.target.value)}
						rows={3}
					/>
					<DialogFooter>
						<Button variant="outline" onClick={() => setRejectExpense(null)}>Cancel</Button>
						<Button variant="destructive" onClick={handleReject}>Reject</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirm */}
			<AlertDialog open={!!deleteExpense} onOpenChange={open => { if (!open) setDeleteExpense(null); }}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Expense?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. The expense entry will be permanently removed.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Jothika Reimbursement Modal */}
			{jothikaExpense && (
				<JothikaReimbursementModal
					open={!!jothikaExpense}
					onClose={() => setJothikaExpense(null)}
					expense={jothikaExpense}
					clientName={clientName}
					projectId={project.id!}
					onNoted={updated => {
						setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
						setJothikaExpense(null);
					}}
				/>
			)}
		</div>
	);
}
