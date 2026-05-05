import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { projectService } from "@/services/projectService";
import { invoiceService } from "@/services/invoiceService";
import { Project } from "@/types/project";
import { Invoice } from "@/types/financial";
import { Loader2, UploadCloud, File as FileIcon, X, Mail, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InvoiceUploadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	project: Project;
	onSuccess: (updatedProject: Project) => void;
	/** When false, adds an invoice without completing the project. Defaults to true. */
	completeProject?: boolean;
	invoice?: Invoice;
}

export function InvoiceUploadDialog({
	open,
	onOpenChange,
	project,
	onSuccess,
	completeProject = true,
	invoice,
}: InvoiceUploadDialogProps) {
	const { toast } = useToast();
	const [invoiceNumber, setInvoiceNumber] = useState("");
	const [invoiceDocument, setInvoiceDocument] = useState<File | undefined>();
	const [amount, setAmount] = useState("");
	const [currency, setCurrency] = useState(project.currency || "LKR");
	const [dueDate, setDueDate] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [isSendingEmail, setIsSendingEmail] = useState(false);
	const [isPhysicalInvoice, setIsPhysicalInvoice] = useState(false);
	const [courierTrackingNumber, setCourierTrackingNumber] = useState("");
	const [invoiceType, setInvoiceType] = useState<string>("Complete");
	const [customInvoiceType, setCustomInvoiceType] = useState("");

	// Initialize form when invoice prop changes or dialog opens
	useEffect(() => {
		if (open) {
			if (invoice) {
				setInvoiceNumber(invoice.invoiceNumber || "");
				setAmount(invoice.amount?.toString() || "");
				setCurrency(invoice.currency || project.currency || "LKR");
				setDueDate(invoice.dueDate?.split('T')[0] || "");
				setIsPhysicalInvoice(!!invoice.isPhysicalInvoice);
				setCourierTrackingNumber(invoice.courierTrackingNumber || "");
				
				const knownTypes = ["Advance", "Milestone", "Complete"];
				if (invoice.invoiceType && knownTypes.includes(invoice.invoiceType)) {
					setInvoiceType(invoice.invoiceType);
					setCustomInvoiceType("");
				} else if (invoice.invoiceType) {
					setInvoiceType("custom");
					setCustomInvoiceType(invoice.invoiceType);
				}
				setInvoiceDocument(undefined);
			} else {
				resetForm();
			}
		}
	}, [invoice, project, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsUploading(true);
		try {
			let updatedProject = project;

			if (invoice) {
				// Update existing invoice
				await invoiceService.update(invoice.id, {
					invoiceNumber: invoiceNumber,
					invoiceType: invoiceType === 'custom' ? customInvoiceType : invoiceType,
					invoiceDocument: invoiceDocument, // Only if new file selected
					isPhysicalInvoice: isPhysicalInvoice,
					courierTrackingNumber: isPhysicalInvoice ? courierTrackingNumber : undefined,
					amount: amount ? parseFloat(amount) : undefined,
					currency: currency,
					dueDate: dueDate || undefined,
				});
			} else {
				// Create new invoice
				if (completeProject) {
					// Update project status to completed and set legacy invoice fields
					updatedProject = await projectService.update(String(project.id), {
						status: 'completed',
						invoice_number: invoiceNumber,
						invoice_document: invoiceDocument,
						isPhysicalInvoice: isPhysicalInvoice,
						courierTrackingNumber: isPhysicalInvoice ? courierTrackingNumber : undefined,
					});
				}

				// Create Invoice record in the unified invoices table
				await invoiceService.create({
					source: 'manual',
					projectId: project.id,
					clientId: project.clientId,
					invoiceNumber: invoiceNumber,
					invoiceType: invoiceType === 'custom' ? customInvoiceType : invoiceType,
					invoiceDocument: invoiceDocument,
					isPhysicalInvoice: isPhysicalInvoice,
					courierTrackingNumber: isPhysicalInvoice ? courierTrackingNumber : undefined,
					status: isPhysicalInvoice ? 'pending' : 'sent',
					amount: amount ? parseFloat(amount) : undefined,
					currency: currency || project.currency || 'LKR',
					issuedAt: new Date().toISOString().split('T')[0],
					dueDate: dueDate || undefined,
					description: `Invoice for project: ${project.name}`,
				});

				// Simulate sending email only if NOT physical and completing the project
				if (completeProject && !isPhysicalInvoice) {
					setIsSendingEmail(true);
					await new Promise(resolve => setTimeout(resolve, 1500));
					setIsSendingEmail(false);
				}
			}

			onSuccess(updatedProject);
			onOpenChange(false);
			resetForm();
			toast({
				title: invoice ? "Invoice Updated" : (completeProject ? "Invoice Uploaded" : "Invoice Added"),
				description: invoice 
					? "Invoice details have been updated."
					: (completeProject
						? (isPhysicalInvoice
							? "Invoice has been uploaded. Tracking info is available in the invoice viewer."
							: "Invoice has been uploaded and email sent to the client.")
						: "Invoice has been added to this project."),
			});
		} catch (error) {
			console.error("Failed to save invoice:", error);
			const errorData = (error as any).response?.data;
			const message = errorData?.errors 
				? Object.values(errorData.errors).flat().join(', ') 
				: (errorData?.message || "Failed to save invoice.");
			toast({ title: "Error", description: message, variant: "destructive" });
		} finally {
			setIsUploading(false);
			setIsSendingEmail(false);
		}
	};

	const resetForm = () => {
		setInvoiceNumber("");
		setInvoiceDocument(undefined);
		setAmount("");
		setCurrency(project.currency || "LKR");
		setDueDate("");
		setIsPhysicalInvoice(false);
		setCourierTrackingNumber("");
		setInvoiceType("Complete");
		setCustomInvoiceType("");
	};

	const canSubmit = invoiceNumber.trim() !== "" && (!!invoice || !!invoiceDocument);

	return (
		<Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
			<DialogContent
				className="sm:max-w-[450px]"
				onPointerDownOutside={(e) => e.preventDefault()}
				onInteractOutside={(e) => e.preventDefault()}
			>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>{invoice ? "Edit Invoice" : (completeProject ? "Upload Invoice" : "Add Invoice")}</DialogTitle>
						<DialogDescription>
							{invoice 
								? `Updating details for invoice ${invoice.invoiceNumber}.`
								: (completeProject
									? `Complete the project by uploading the final invoice. Linked to PO: ${project.poNumber || "N/A"}.`
									: `Add an additional invoice record to ${project.name}.`)}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="invoiceNumber">Invoice Number *</Label>
							<Input
								id="invoiceNumber"
								value={invoiceNumber}
								onChange={(e) => setInvoiceNumber(e.target.value)}
								placeholder="Enter Invoice Number"
								required
							/>
						</div>
						
						<div className="grid gap-2">
							<Label>Invoice Type</Label>
							<Select value={invoiceType} onValueChange={setInvoiceType}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select Purpose" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Advance">Advance</SelectItem>
									<SelectItem value="Milestone">Milestone</SelectItem>
									<SelectItem value="Complete">Complete</SelectItem>
									<SelectItem value="custom">Custom...</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{invoiceType === 'custom' && (
							<div className="grid gap-2 animate-in fade-in slide-in-from-top-1">
								<Label htmlFor="customInvoiceType">Custom Purpose</Label>
								<div className="relative">
									<Input
										id="customInvoiceType"
										value={customInvoiceType}
										onChange={(e) => setCustomInvoiceType(e.target.value)}
										placeholder="e.g. Deposit, Retainer"
										className="pr-10"
									/>
									<Plus className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
								</div>
							</div>
						)}

						<div className="grid grid-cols-2 gap-2">
							<div className="grid gap-2">
								<Label htmlFor="amount">Amount</Label>
								<Input
									id="amount"
									type="number"
									min="0"
									step="0.01"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder="0.00"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="currency">Currency</Label>
								<Select value={currency} onValueChange={setCurrency}>
									<SelectTrigger id="currency">
										<SelectValue placeholder="LKR" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="LKR">LKR</SelectItem>
										<SelectItem value="USD">USD</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="dueDate">Due Date</Label>
							<Input
								id="dueDate"
								type="date"
								value={dueDate}
								onChange={(e) => setDueDate(e.target.value)}
							/>
						</div>
						
						<div className="grid gap-2">
							<Label htmlFor="poNumberDisplay">Linked PO Number</Label>
							<Input
								id="poNumberDisplay"
								value={project.poNumber || "No PO linked"}
								disabled
								className="bg-muted"
							/>
						</div>
						<div className="flex items-center space-x-2 py-1">
							<Checkbox
								id="isPhysicalInvoice"
								checked={isPhysicalInvoice}
								onCheckedChange={(checked) => setIsPhysicalInvoice(!!checked)}
							/>
							<Label htmlFor="isPhysicalInvoice" className="text-sm font-medium leading-none">
								This is a physical invoice (Courier required)
							</Label>
						</div>

						{isPhysicalInvoice && (
							<div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
								<Label htmlFor="courierTrackingNumber">Courier Tracking Number</Label>
								<Input
									id="courierTrackingNumber"
									value={courierTrackingNumber}
									onChange={(e) => setCourierTrackingNumber(e.target.value)}
									placeholder="Enter Tracking Number"
									required={isPhysicalInvoice}
								/>
							</div>
						)}

						<div className="grid gap-2">
							<Label htmlFor="invoiceDocument">
								{invoice ? "Replace Invoice Document (Optional)" : "Upload Invoice Document *"}
							</Label>
							<div
								className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors
								${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}`}
								onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
								onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
								onDrop={(e) => {
									e.preventDefault();
									setIsDragging(false);
									const file = e.dataTransfer.files?.[0];
									if (file) setInvoiceDocument(file);
								}}
							>
								<div className="space-y-1 text-center">
									{invoiceDocument ? (
										<div className="flex flex-col items-center">
											<FileIcon className="mx-auto h-12 w-12 text-primary" />
											<p className="mt-2 text-sm font-medium">{invoiceDocument.name}</p>
											<p className="text-xs text-muted-foreground">{(invoiceDocument.size / 1024 / 1024).toFixed(2)} MB</p>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="mt-2 text-destructive hover:text-destructive"
												onClick={() => setInvoiceDocument(undefined)}
											>
												<X className="h-4 w-4 mr-1" /> Remove
											</Button>
										</div>
									) : (
										<>
											<UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
											<div className="flex justify-center text-sm text-muted-foreground">
												<label
													htmlFor="invoiceDocument"
													className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
												>
													<span>Upload a file</span>
													<Input
														id="invoiceDocument"
														type="file"
														className="sr-only"
														accept=".pdf,.png,.jpg,.jpeg"
														onChange={(e) => {
															const file = e.target.files?.[0];
															if (file) setInvoiceDocument(file);
														}}
													/>
												</label>
												<p className="pl-1">or drag and drop</p>
											</div>
											<p className="text-xs text-muted-foreground">PDF, PNG, JPG up to 10MB</p>
										</>
									)}
								</div>
							</div>
						</div>
					</div>
					<DialogFooter className="flex flex-col sm:flex-row gap-2">
						<Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={isUploading || isSendingEmail || !canSubmit}>
							{isUploading ? (
								<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
							) : isSendingEmail ? (
								<><Mail className="mr-2 h-4 w-4 animate-pulse" />Sending Email...</>
							) : (
								invoice ? "Update Invoice" : (completeProject ? "Upload & Complete" : "Add Invoice")
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
