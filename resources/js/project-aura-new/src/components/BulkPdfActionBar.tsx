import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText } from "lucide-react";

interface BulkPdfActionBarProps {
	visibleIds: number[];
	selectedIds: number[];
	onToggleSelectAll: (visibleIds: number[]) => void;
	onClearSelection: () => void;
	onBulkDownload: (format: "zip" | "pdf") => void;
	isDownloading?: boolean;
	selectAllLabel?: string;
	itemLabel?: string;
}

export function BulkPdfActionBar({
	visibleIds,
	selectedIds,
	onToggleSelectAll,
	onClearSelection,
	onBulkDownload,
	isDownloading = false,
	selectAllLabel = "Select all",
	itemLabel = "selected",
}: BulkPdfActionBarProps) {
	if (visibleIds.length === 0 && selectedIds.length === 0) {
		return null;
	}

	const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length;
	const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
	const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

	return (
		<div className="flex items-center justify-between gap-3 flex-wrap px-4 py-2.5 rounded-lg border bg-muted/40">
			<div className="flex items-center gap-3">
				{visibleIds.length > 0 && (
					<label className="flex items-center gap-2 text-sm cursor-pointer select-none">
						<Checkbox
							checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
							onCheckedChange={() => onToggleSelectAll(visibleIds)}
						/>
						<span className="text-muted-foreground font-medium">{selectAllLabel}</span>
					</label>
				)}
				{selectedIds.length > 0 && (
					<span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
						{selectedIds.length} {itemLabel}
					</span>
				)}
			</div>

			{selectedIds.length > 0 && (
				<div className="flex items-center gap-2 flex-wrap">
					<Button
						size="sm"
						onClick={() => onBulkDownload("zip")}
						disabled={isDownloading}
					>
						<Download className="h-3.5 w-3.5 mr-1.5" />
						{isDownloading ? "Preparing..." : `Download ZIP (${selectedIds.length})`}
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={() => onBulkDownload("pdf")}
						disabled={isDownloading}
					>
						<FileText className="h-3.5 w-3.5 mr-1.5" />
						Combined PDF ({selectedIds.length})
					</Button>
					<Button
						size="sm"
						variant="ghost"
						onClick={onClearSelection}
						disabled={isDownloading}
					>
						Clear
					</Button>
				</div>
			)}
		</div>
	);
}
