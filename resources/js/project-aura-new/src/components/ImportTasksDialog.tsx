import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { Loader2, UploadCloud, File as FileIcon, X, Sparkles } from "lucide-react";

interface ImportTasksDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectId: number;
	projectName: string;
	/** Called with the import_id once the file is accepted, so the parent can start polling */
	onSubmitted: (importId: string) => void;
}

const ACCEPTED_TYPES = ".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg";

export function ImportTasksDialog({ open, onOpenChange, projectId, projectName, onSubmitted }: ImportTasksDialogProps) {
	const { toast } = useToast();
	const [file, setFile] = useState<File | undefined>();
	const [isDragging, setIsDragging] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file) return;

		setIsSubmitting(true);
		try {
			const form = new FormData();
			form.append("file", file);

			const res = await api.post(`/projects/${projectId}/upload-tasks`, form, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			const importId: string = res.data?.import_id;

			toast({
				title: "File submitted",
				description: "AI is extracting tasks. A review popup will appear automatically when ready.",
			});

			setFile(undefined);
			onOpenChange(false);
			if (importId) onSubmitted(importId);
		} catch (err: any) {
			const msg = err.response?.data?.error || "Failed to submit file for processing.";
			toast({ title: "Error", description: msg, variant: "destructive" });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const dropped = e.dataTransfer.files?.[0];
		if (dropped) setFile(dropped);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-[480px]"
				onPointerDownOutside={(e) => e.preventDefault()}
				onInteractOutside={(e) => e.preventDefault()}
			>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Sparkles className="h-5 w-5 text-primary" />
							Import Tasks from File
						</DialogTitle>
						<DialogDescription>
							Upload a document for <span className="font-medium">{projectName}</span>. AI will extract tasks,
							descriptions and deadlines — you'll review everything before anything is created.
						</DialogDescription>
					</DialogHeader>

					<div className="py-4 space-y-4">
						<div className="space-y-2">
							<Label>Document</Label>
							<div
								className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors cursor-pointer ${
									isDragging
										? "border-primary bg-primary/10"
										: "border-muted-foreground/25 hover:border-primary/50"
								}`}
								onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
								onDragLeave={() => setIsDragging(false)}
								onDrop={handleDrop}
								onClick={() => !file && document.getElementById("import-file-input")?.click()}
							>
								<div className="space-y-2 text-center">
									{file ? (
										<div className="flex flex-col items-center">
											<FileIcon className="mx-auto h-10 w-10 text-primary" />
											<p className="mt-2 text-sm font-medium">{file.name}</p>
											<p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="mt-2 text-destructive hover:text-destructive"
												onClick={(ev) => { ev.stopPropagation(); setFile(undefined); }}
											>
												<X className="h-4 w-4 mr-1" /> Remove
											</Button>
										</div>
									) : (
										<>
											<UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
											<div className="text-sm text-muted-foreground">
												<label
													htmlFor="import-file-input"
													className="cursor-pointer font-medium text-primary hover:text-primary/80"
													onClick={(ev) => ev.stopPropagation()}
												>
													Click to upload
													<Input
														id="import-file-input"
														type="file"
														className="sr-only"
														accept={ACCEPTED_TYPES}
														onChange={(ev) => {
															const f = ev.target.files?.[0];
															if (f) setFile(f);
															ev.target.value = "";
														}}
													/>
												</label>
												{" "}or drag and drop
											</div>
											<p className="text-xs text-muted-foreground">
												PDF, Word, Excel, TXT, CSV, or image — up to 20 MB
											</p>
										</>
									)}
								</div>
							</div>
						</div>

						<div className="rounded-md bg-muted/50 border px-4 py-3 text-xs text-muted-foreground space-y-1">
							<p className="font-medium text-foreground">What happens next?</p>
							<p>1. The file is sent to an AI pipeline that extracts tasks, descriptions &amp; due dates.</p>
							<p>2. Processing may take a moment. This dialog closes immediately after upload.</p>
							<p>3. A review popup <span className="font-medium text-foreground">opens automatically</span> when results arrive — you can bulk-assign stages &amp; team members before any task is created.</p>
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={!file || isSubmitting}>
							{isSubmitting ? (
								<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</>
							) : (
								<><Sparkles className="mr-2 h-4 w-4" /> Extract Tasks</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
