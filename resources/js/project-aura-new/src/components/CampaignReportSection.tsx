import React, { useState } from 'react';
import { Project } from '@/types/project';
import { projectService } from '@/services/projectService';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';

interface CampaignReportSectionProps {
	project: Project;
	onSuccess: (updatedProject: Project) => void;
}

export function CampaignReportSection({ project, onSuccess }: CampaignReportSectionProps) {
	const [uploading, setUploading] = useState(false);
	const [approving, setApproving] = useState(false);
	const { currentUser } = useUser();
	const { toast } = useToast();

	const isDigitalMarketing = project.department?.name === 'Digital Marketing';
	if (!isDigitalMarketing) return null;

	const isDigitalTeam = project.department?.name === 'Digital Marketing'; // For now, assume users in the department are digital team
	const isHR = currentUser?.role === 'hr' || currentUser?.department === 'HR'; // Adjust based on how HR is identified
	const isAdmin = currentUser?.role === 'admin';

	const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setUploading(true);
		try {
			const updatedProject = await projectService.uploadCampaignReport(String(project.id), file);
			onSuccess(updatedProject);
			toast({
				title: "Report Uploaded",
				description: "Campaign report has been uploaded and is pending approval.",
			});
		} catch (error) {
			console.error("Failed to upload report:", error);
			toast({
				title: "Upload Failed",
				description: "Failed to upload the campaign report. Please try again.",
				variant: "destructive",
			});
		} finally {
			setUploading(false);
		}
	};

	const handleApprove = async () => {
		setApproving(true);
		try {
			const updatedProject = await projectService.approveCampaignReport(String(project.id));
			onSuccess(updatedProject);
			toast({
				title: "Report Approved",
				description: "Campaign report has been approved. Invoice functionality is now enabled.",
			});
		} catch (error) {
			console.error("Failed to approve report:", error);
			toast({
				title: "Approval Failed",
				description: "Failed to approve the campaign report. Please try again.",
				variant: "destructive",
			});
		} finally {
			setApproving(false);
		}
	};

	const getStatusBadge = () => {
		switch (project.campaign_report_status) {
			case 'approved':
				return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
			case 'pending':
				return <Badge className="bg-orange-500 hover:bg-orange-600"><AlertCircle className="h-3 w-3 mr-1" /> Pending Approval</Badge>;
			default:
				return <Badge variant="outline">Not Uploaded</Badge>;
		}
	};

	return (
		<Card className="border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20">
			<CardHeader className="pb-3">
				<div className="flex justify-between items-start">
					<div className="space-y-1">
						<CardTitle className="text-lg flex items-center gap-2">
							<FileText className="h-5 w-5 text-indigo-500" />
							Campaign Report
						</CardTitle>
						<CardDescription>
							A campaign report is required before invoices can be processed for Digital Marketing projects.
						</CardDescription>
					</div>
					{getStatusBadge()}
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col sm:flex-row items-center gap-4">
					{project.campaign_report_document_url ? (
						<div className="flex-1 flex items-center gap-3 p-3 rounded-md bg-background border">
							<FileText className="h-8 w-8 text-muted-foreground" />
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">Campaign Report Document</p>
								<p className="text-xs text-muted-foreground">
									{project.campaign_report_approved_at 
										? `Approved on ${new Date(project.campaign_report_approved_at).toLocaleDateString()}` 
										: 'Uploaded, awaiting approval'}
								</p>
							</div>
							<Button variant="ghost" size="sm" asChild>
								<a href={project.campaign_report_document_url} target="_blank" rel="noreferrer">
									<Download className="h-4 w-4 mr-2" /> Download
								</a>
							</Button>
						</div>
					) : (
						<div className="flex-1 text-center py-6 border-2 border-dashed rounded-md border-indigo-200 dark:border-indigo-800">
							<p className="text-sm text-muted-foreground mb-4">No report uploaded yet</p>
							{isDigitalTeam && (
								<div className="relative inline-block">
									<input
										type="file"
										id="report-upload"
										className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
										onChange={handleFileUpload}
										disabled={uploading}
									/>
									<Button variant="outline" className="border-indigo-400 text-indigo-600 hover:bg-indigo-50" disabled={uploading}>
										{uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
										Upload Report
									</Button>
								</div>
							)}
						</div>
					)}

					{project.campaign_report_status === 'pending' && (isAdmin || isHR) && (
						<Button 
							onClick={handleApprove} 
							disabled={approving}
							className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
						>
							{approving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
							Approve Report
						</Button>
					)}

					{project.campaign_report_status === 'approved' && (
						<div className="flex items-center gap-2 text-green-600 font-medium text-sm border border-green-200 bg-green-50 px-4 py-2 rounded-md">
							<CheckCircle2 className="h-5 w-5" />
							Report Approved
						</div>
					) }
				</div>
			</CardContent>
		</Card>
	);
}
