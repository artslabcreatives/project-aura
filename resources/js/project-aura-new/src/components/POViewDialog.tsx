import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, FileText, Link as LinkIcon, Building2, ChevronRight, Info } from "lucide-react";
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";

interface POViewDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	project: Project | null;
}

interface UnifiedPOItem {
	id: string | number;
	poNumber: string;
	type: 'manual' | 'xero' | 'other';
	url?: string;
	xeroPoId?: string;
	amount?: number;
	currency?: string;
	status?: string;
	notes?: string;
}

export function POViewDialog({ open, onOpenChange, project }: POViewDialogProps) {
	const [selectedItemId, setSelectedItemId] = useState<string | number>("");

	// Build unified list of purchase orders
	const poItems: UnifiedPOItem[] = [];

	if (project) {
		const xeroNumbers = new Set<string>();

		// 1. Multi-assigned Xero POs
		if (Array.isArray(project.purchaseOrders)) {
			project.purchaseOrders.forEach((po) => {
				poItems.push({
					id: po.id,
					poNumber: po.poNumber,
					type: po.xeroPoId ? "xero" : "other",
					xeroPoId: po.xeroPoId,
					amount: po.amount,
					currency: po.currency,
					status: po.status,
					notes: po.notes,
				});
				xeroNumbers.add(po.poNumber.toLowerCase().trim());
			});
		}

		// 2. Manually uploaded PO (Primary PO)
		if (project.poNumber) {
			const isAlreadyInXero = xeroNumbers.has(project.poNumber.toLowerCase().trim());
			if (project.poDocumentUrl || !isAlreadyInXero) {
				poItems.push({
					id: "manual",
					poNumber: project.poNumber,
					type: "manual",
					url: project.poDocumentUrl,
					notes: "Primary PO (Manually Uploaded PDF/Image)",
				});
			}
		}
	}

	// Sync selection when dialog opens or items change
	useEffect(() => {
		if (open && poItems.length > 0) {
			// Maintain selection if possible, otherwise pick first
			const exists = poItems.some((item) => item.id === selectedItemId);
			if (!exists) {
				setSelectedItemId(poItems[0].id);
			}
		}
	}, [open, project]);

	if (!project || poItems.length === 0) return null;

	const selectedItem = poItems.find((item) => item.id === selectedItemId) || poItems[0];

	const handleViewXeroPO = (xeroPoId: string, poNumber: string) => {
		const url = poNumber.toLowerCase().includes('qt') 
			? `https://go.xero.com/Quotes/View/${xeroPoId}` 
			: `https://go.xero.com/PO/View/${xeroPoId}`;
		window.open(url, '_blank', 'noopener,noreferrer');
	};

	const isPDF = selectedItem.url?.toLowerCase().includes('.pdf') || selectedItem.url?.includes('data:application/pdf');

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent 
				className="max-w-5xl w-[95vw] h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl border border-border/40 bg-background shadow-2xl"
				onPointerDownOutside={(e) => e.preventDefault()}
				onInteractOutside={(e) => e.preventDefault()}
			>
				<DialogHeader className="p-5 border-b bg-muted/20 flex flex-row items-center justify-between space-y-0">
					<div className="flex flex-col gap-0.5">
						<DialogTitle className="text-lg font-bold tracking-tight">
							Purchase Orders
						</DialogTitle>
						<p className="text-xs text-muted-foreground">
							{project.name}
						</p>
					</div>
				</DialogHeader>

				<div className="flex-1 flex overflow-hidden min-h-0">
					{/* Sidebar (only if multiple POs) */}
					{poItems.length > 1 && (
						<div className="w-64 border-r bg-muted/10 flex flex-col overflow-y-auto p-3 gap-1.5 shrink-0">
							<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
								Linked POs ({poItems.length})
							</span>
							{poItems.map((item) => {
								const isSelected = item.id === selectedItem.id;
								return (
									<button
										key={item.id}
										onClick={() => setSelectedItemId(item.id)}
										className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group ${
											isSelected
												? "border-green-600 bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-400 font-semibold shadow-sm"
												: "border-transparent hover:bg-muted/50 text-foreground"
										}`}
									>
										<div className="flex flex-col gap-0.5 min-w-0 pr-2">
											<span className="text-xs truncate block">{item.poNumber}</span>
											<span className="text-[10px] text-muted-foreground capitalize flex items-center gap-1">
												{item.type === "xero" ? (
													<Badge variant="outline" className="h-4 px-1 text-[8px] bg-blue-500/10 text-blue-700 border-none">
														Xero
													</Badge>
												) : item.type === "manual" ? (
													<Badge variant="outline" className="h-4 px-1 text-[8px] bg-green-500/10 text-green-700 border-none">
														Manual
													</Badge>
												) : (
													<Badge variant="outline" className="h-4 px-1 text-[8px] bg-gray-500/10 text-gray-700 border-none">
														Other
													</Badge>
												)}
												{item.amount !== undefined && (
													<span className="truncate">
														{item.currency || 'USD'} {Number(item.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
													</span>
												)}
											</span>
										</div>
										<ChevronRight className={`h-3.5 w-3.5 transition-transform shrink-0 ${
											isSelected ? "text-green-600 translate-x-0.5" : "text-muted-foreground opacity-0 group-hover:opacity-100"
										}`} />
									</button>
								);
							})}
						</div>
					)}

					{/* Main Viewer Area */}
					<div className="flex-1 flex flex-col overflow-hidden bg-muted/5">
						{/* Top toolbar */}
						<div className="flex items-center justify-between p-3 border-b bg-background/50 backdrop-blur-sm shrink-0">
							<div className="flex items-center gap-2">
								<span className="font-bold text-sm">
									{selectedItem.poNumber}
								</span>
								{selectedItem.type === "xero" && (
									<Badge className="bg-blue-500 hover:bg-blue-600 text-white font-bold border-none text-[9px] h-5 uppercase tracking-wide">
										Xero Synced
									</Badge>
								)}
								{selectedItem.type === "manual" && (
									<Badge className="bg-green-600 hover:bg-green-700 text-white font-bold border-none text-[9px] h-5 uppercase tracking-wide">
										Manual PDF
									</Badge>
								)}
							</div>

							<div className="flex items-center gap-2">
								{selectedItem.type === "manual" && selectedItem.url && (
									<>
										<Button
											variant="outline"
											size="sm"
											className="h-8 gap-1.5 text-xs"
											onClick={() => window.open(selectedItem.url, '_blank')}
										>
											<ExternalLink className="h-3.5 w-3.5" />
											Open in New Tab
										</Button>
										<a 
											href={selectedItem.url} 
											download 
											className="inline-flex items-center justify-center rounded-md text-xs font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 gap-1.5"
										>
											<Download className="h-3.5 w-3.5" />
											Download PDF
										</a>
									</>
								)}
								{selectedItem.type === "xero" && selectedItem.xeroPoId && (
									<Button
										variant="default"
										size="sm"
										className="h-8 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white border-none font-bold"
										onClick={() => handleViewXeroPO(selectedItem.xeroPoId!, selectedItem.poNumber)}
									>
										<ExternalLink className="h-3.5 w-3.5" />
										Open in Xero
									</Button>
								)}
							</div>
						</div>

						{/* Document Viewer Content */}
						<div className="flex-1 p-5 overflow-auto flex flex-col justify-center min-h-0">
							{selectedItem.type === "xero" ? (
								<div className="max-w-xl w-full mx-auto p-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/30 to-white shadow-xl dark:from-slate-900/50 dark:to-slate-950 dark:border-blue-950/40">
									<div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-blue-50 dark:border-blue-950/40">
										<div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
											<Building2 className="h-7 w-7" />
										</div>
										<div>
											<h3 className="text-base font-bold text-foreground">
												Xero Purchase Order
											</h3>
											<p className="text-xs text-muted-foreground">
												Synchronized quote or purchase order
											</p>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4 mb-6">
										<div className="flex flex-col p-3 rounded-xl bg-muted/30 border">
											<span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">
												PO Number
											</span>
											<span className="text-sm font-semibold text-foreground">
												{selectedItem.poNumber}
											</span>
										</div>

										<div className="flex flex-col p-3 rounded-xl bg-muted/30 border">
											<span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">
												Status
											</span>
											<div>
												<Badge className={`text-[10px] font-bold uppercase ${
													selectedItem.status === 'AUTHORISED' || selectedItem.status === 'APPROVED'
														? 'bg-green-500/10 text-green-700 dark:text-green-400 border-none'
														: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-none'
												}`}>
													{selectedItem.status || 'SYNCED'}
												</Badge>
											</div>
										</div>

										{selectedItem.amount !== undefined && (
											<div className="flex flex-col p-3 rounded-xl bg-muted/30 border col-span-2">
												<span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">
													Total Amount
												</span>
												<span className="text-lg font-bold text-foreground">
													{selectedItem.currency || 'USD'} {Number(selectedItem.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
												</span>
											</div>
										)}
									</div>

									{selectedItem.notes && (
										<div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-100/50 dark:border-blue-950/20 text-xs text-muted-foreground flex gap-2">
											<Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
											<div className="flex flex-col gap-0.5">
												<span className="font-semibold text-foreground">Integration Notes</span>
												<span className="leading-relaxed">{selectedItem.notes}</span>
											</div>
										</div>
									)}

									<div className="mt-8 flex justify-center">
										<Button
											variant="outline"
											size="lg"
											className="w-full h-11 border-blue-200 text-blue-600 hover:bg-blue-50/50 hover:text-blue-700 dark:border-blue-900 dark:hover:bg-blue-950/30 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-sm"
											onClick={() => handleViewXeroPO(selectedItem.xeroPoId!, selectedItem.poNumber)}
										>
											<ExternalLink className="h-4 w-4" />
											View Details directly in Xero
										</Button>
									</div>
								</div>
							) : (
								<div className="w-full h-full relative flex items-center justify-center min-h-[400px]">
									{selectedItem.url ? (
										isPDF ? (
											<iframe 
												src={`${selectedItem.url}#view=FitH`}
												className="w-full h-full rounded-xl shadow-lg border bg-white"
												title="PO Document Viewer"
											/>
										) : (
											<div className="w-full h-full overflow-auto flex items-center justify-center">
												<img 
													src={selectedItem.url} 
													alt="PO Document" 
													className="max-w-full max-h-full object-contain rounded-xl shadow-lg bg-white"
												/>
											</div>
										)
									) : (
										<div className="flex flex-col items-center justify-center gap-3 text-muted-foreground p-8 border border-dashed rounded-2xl w-full max-w-md mx-auto">
											<FileText className="h-10 w-10 stroke-1" />
											<p className="text-sm font-medium">No PDF file attached to this manual PO.</p>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
