import { useEffect, useState } from "react";
import { Estimate } from "@/types/estimate";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";

export interface PdfDownloadSettings {
	paymentMode: string;
	dueDays: string;
	reference: string;
	discountType: string;
	discountValue: string;
	additionalInfo: string;
}

export function getInvoiceInitialPdfSettings(invoice: any): PdfDownloadSettings {
	const xeroReference = invoice?.xeroInvoiceId ? (invoice?.description || "").trim() : "";
	const defaultRef = xeroReference || invoice?.invoiceNumber || invoice?.description || "";
	const hasSavedRef = invoice?.pdfReference !== undefined && invoice?.pdfReference !== null;
	const discountType = invoice?.pdfDiscountType || "none";

	return {
		paymentMode: invoice?.pdfPaymentMode || "Bank Transfer",
		dueDays:
			invoice?.pdfDueDays !== undefined && invoice?.pdfDueDays !== null
				? String(invoice.pdfDueDays)
				: "15",
		reference: hasSavedRef ? String(invoice.pdfReference) : defaultRef,
		discountType,
		discountValue:
			discountType !== "none" &&
			invoice?.pdfDiscountValue !== undefined &&
			invoice?.pdfDiscountValue !== null
				? String(invoice.pdfDiscountValue)
				: "",
		additionalInfo: invoice?.pdfAdditionalInfo ?? "",
	};
}

export function getEstimateInitialPdfSettings(estimate: Estimate): PdfDownloadSettings {
	const defaultRef = estimate?.reference || estimate?.estimate_number || "";
	const hasSavedRef = estimate?.pdf_reference !== undefined && estimate?.pdf_reference !== null;
	const discountType = estimate?.pdf_discount_type || "none";

	return {
		paymentMode: estimate?.pdf_payment_mode || "Bank Transfer",
		dueDays:
			estimate?.pdf_due_days !== undefined && estimate?.pdf_due_days !== null
				? String(estimate.pdf_due_days)
				: "15",
		reference: hasSavedRef ? String(estimate.pdf_reference) : defaultRef,
		discountType,
		discountValue:
			discountType !== "none" &&
			estimate?.pdf_discount_value !== undefined &&
			estimate?.pdf_discount_value !== null
				? String(estimate.pdf_discount_value)
				: "",
		additionalInfo: estimate?.pdf_additional_info ?? "",
	};
}

interface PdfDownloadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	type: "invoice" | "quotation";
	currencySymbol?: string;
	initialSettings: PdfDownloadSettings;
	isDownloading?: boolean;
	onConfirmDownload: (settings: PdfDownloadSettings) => Promise<void> | void;
}

export function PdfDownloadDialog({
	open,
	onOpenChange,
	type,
	currencySymbol = "LKR",
	initialSettings,
	isDownloading = false,
	onConfirmDownload,
}: PdfDownloadDialogProps) {
	const [paymentMode, setPaymentMode] = useState(initialSettings.paymentMode);
	const [dueDays, setDueDays] = useState(initialSettings.dueDays);
	const [reference, setReference] = useState(initialSettings.reference);
	const [discountType, setDiscountType] = useState(initialSettings.discountType);
	const [discountValue, setDiscountValue] = useState(initialSettings.discountValue);
	const [additionalInfo, setAdditionalInfo] = useState(initialSettings.additionalInfo);

	useEffect(() => {
		if (open) {
			setPaymentMode(initialSettings.paymentMode);
			setDueDays(initialSettings.dueDays);
			setReference(initialSettings.reference);
			setDiscountType(initialSettings.discountType);
			setDiscountValue(initialSettings.discountValue);
			setAdditionalInfo(initialSettings.additionalInfo);
		}
	}, [open, initialSettings]);

	const handleSubmit = async () => {
		await onConfirmDownload({
			paymentMode,
			dueDays,
			reference,
			discountType,
			discountValue: discountType === "none" ? "" : discountValue,
			additionalInfo,
		});
	};

	const isInvoice = type === "invoice";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{isInvoice ? "Download Tax Invoice" : "Download Quotation"}
					</DialogTitle>
					<DialogDescription>
						{isInvoice
							? "Customize payment terms and optional discount before generating the PDF invoice. Saved settings are remembered for future downloads."
							: "Customize payment terms and optional discount before generating the quotation PDF. Saved settings are remembered for future downloads."}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					<div className="space-y-2">
						<Label htmlFor="pdf-payment-mode">Mode of Payment</Label>
						<Select value={paymentMode} onValueChange={setPaymentMode}>
							<SelectTrigger id="pdf-payment-mode">
								<SelectValue placeholder="Select Payment Mode" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
								<SelectItem value="Cash">Cash</SelectItem>
								<SelectItem value="Cheque">Cheque</SelectItem>
								<SelectItem value="Credit Card">Credit Card</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="pdf-due-days">Payment Due (Days)</Label>
						<Input
							id="pdf-due-days"
							type="number"
							min="0"
							value={dueDays}
							onChange={(e) => setDueDays(e.target.value)}
							placeholder="15"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="pdf-reference-num">Reference Number / PO Number</Label>
						<Input
							id="pdf-reference-num"
							value={reference}
							onChange={(e) => setReference(e.target.value)}
							placeholder="e.g. PO-12345 or Ref #"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="pdf-discount-type">Discount Type</Label>
							<Select value={discountType} onValueChange={setDiscountType}>
								<SelectTrigger id="pdf-discount-type">
									<SelectValue placeholder="Select Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No Discount</SelectItem>
									<SelectItem value="percentage">Percentage (%)</SelectItem>
									<SelectItem value="fixed">Fixed Amount ({currencySymbol})</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{discountType !== "none" && (
							<div className="space-y-2">
								<Label htmlFor="pdf-discount-val">
									{discountType === "percentage"
										? "Percentage (%)"
										: `Amount (${currencySymbol})`}
								</Label>
								<Input
									id="pdf-discount-val"
									type="number"
									min="0"
									step={discountType === "percentage" ? "1" : "0.01"}
									value={discountValue}
									onChange={(e) => setDiscountValue(e.target.value)}
									placeholder={discountType === "percentage" ? "10" : "500.00"}
								/>
							</div>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="pdf-additional-info">Additional Notes / Terms</Label>
						<Input
							id="pdf-additional-info"
							value={additionalInfo}
							onChange={(e) => setAdditionalInfo(e.target.value)}
							placeholder="Optional additional notes"
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDownloading}
					>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isDownloading}>
						<Download className="h-4 w-4 mr-2" />
						{isDownloading ? "Downloading..." : "Download PDF"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
