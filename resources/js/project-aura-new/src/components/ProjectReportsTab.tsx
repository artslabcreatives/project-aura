import React, { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { ProjectReport, ReportActivity, ReportStatus } from '@/types/report';
import { reportService } from '@/services/reportService';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, Upload, CheckCircle2, AlertCircle, Loader2, Download, 
    MessageSquare, History, Check, X, Pencil, MoreVertical
} from 'lucide-react';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProjectReportsTabProps {
    project: Project;
}

export function ProjectReportsTab({ project }: ProjectReportsTabProps) {
    const [reports, setReports] = useState<ProjectReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<ProjectReport | null>(null);
    const [selectedReport, setSelectedReport] = useState<ProjectReport | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isApprovalOpen, setIsApprovalOpen] = useState(false);
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
    const [comment, setComment] = useState("");
    const [newComment, setNewComment] = useState("");
    const [processing, setProcessing] = useState(false);
    const { currentUser, activeRole } = useUser();
    const { toast } = useToast();

    useEffect(() => {
        loadReports();
    }, [project.id]);

    const loadReports = async () => {
        try {
            setLoading(true);
            const data = await reportService.getReports(String(project.id));
            setReports(data);
        } catch (error) {
            console.error("Failed to load reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
        const file = fileInput.files?.[0];

        if (!title || (!file && !editingReport)) {
            toast({
                title: "Error",
                description: "Title and File are required.",
                variant: "destructive"
            });
            return;
        }

        try {
            setProcessing(true);
            if (editingReport) {
                await reportService.updateReport(String(editingReport.id), { 
                    title, 
                    description, 
                    report_file: file || undefined 
                });
                toast({ title: "Updated", description: "Report has been updated and re-submitted." });
            } else {
                await reportService.uploadReport({ 
                    project_id: String(project.id), 
                    title, 
                    description, 
                    report_file: file as File 
                });
                toast({ title: "Submitted", description: "Report has been submitted for approval." });
            }
            setIsUploadOpen(false);
            setEditingReport(null);
            loadReports();
        } catch (error) {
            console.error("Failed to process report:", error);
            toast({ title: "Error", description: "Failed to process the report.", variant: "destructive" });
        } finally {
            setProcessing(false);
        }
    };

    const handleAction = async () => {
        if (!selectedReport) return;
        if (approvalAction === 'reject' && !comment) {
            toast({ title: "Required", description: "Comment is required for rejection.", variant: "destructive" });
            return;
        }

        try {
            setProcessing(true);
            const isHR = activeRole === 'hr' || activeRole === 'admin';
            const isTL = activeRole === 'team-lead';

            if (approvalAction === 'reject') {
                await reportService.reject(String(selectedReport.id), comment);
                toast({ title: "Rejected", description: "Report has been rejected." });
            } else {
                if (isHR) {
                    await reportService.hrApprove(String(selectedReport.id), comment);
                    toast({ title: "Approved", description: "Report has been given final approval." });
                } else if (isTL) {
                    await reportService.tlApprove(String(selectedReport.id), comment);
                    toast({ title: "Approved", description: "Report has been approved by Team Lead." });
                }
            }
            setIsApprovalOpen(false);
            setComment("");
            loadReports();
            if (isDetailsOpen) {
                const updated = await reportService.getReport(String(selectedReport.id));
                setSelectedReport(updated);
            }
        } catch (error) {
            console.error("Failed to process action:", error);
            toast({ title: "Error", description: "Failed to process approval.", variant: "destructive" });
        } finally {
            setProcessing(false);
        }
    };

    const handleAddComment = async () => {
        if (!selectedReport || !newComment) return;
        try {
            setProcessing(true);
            await reportService.addComment(String(selectedReport.id), newComment);
            setNewComment("");
            const updated = await reportService.getReport(String(selectedReport.id));
            setSelectedReport(updated);
            loadReports(); // Update list too
        } catch (error) {
            console.error("Failed to add comment:", error);
        } finally {
            setProcessing(false);
        }
    };

    const getStatusConfig = (status: ReportStatus) => {
        switch (status) {
            case 'approved': return { color: 'bg-green-500', icon: <CheckCircle2 className="h-3 w-3 mr-1" />, label: 'Approved' };
            case 'tl_approved': return { color: 'bg-indigo-500', icon: <CheckCircle2 className="h-3 w-3 mr-1" />, label: 'Pending Review from HR' };
            case 'submitted': return { color: 'bg-blue-500', icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />, label: 'Pending Review From Team Lead' };
            case 'rejected': return { color: 'bg-red-500', icon: <AlertCircle className="h-3 w-3 mr-1" />, label: 'Rejected' };
            default: return { color: 'bg-gray-500', icon: <AlertCircle className="h-3 w-3 mr-1" />, label: 'Draft' };
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/10">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            Project Reports
                        </CardTitle>
                        <CardDescription>
                            Manage and track report approvals for this project.
                        </CardDescription>
                    </div>
                    {(activeRole === 'user' || activeRole === 'account-manager') && (
                        <Button size="sm" onClick={() => { setEditingReport(null); setIsUploadOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Report
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">No reports uploaded yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {reports.map((report) => {
                                const config = getStatusConfig(report.status);
                                const isHR = activeRole === 'hr' || activeRole === 'admin';
                                const isTL = activeRole === 'team-lead' && String(report.user?.department_id) === String(currentUser?.department);
                                const canApprove = (isTL && report.status === 'submitted') || (isHR && report.status === 'tl_approved');
                                const isOwner = String(report.user_id) === String(currentUser?.id);
                                const canEdit = isOwner && report.status !== 'approved';

                                return (
                                    <div key={report.id} className="flex items-center gap-4 p-4 rounded-lg bg-background border hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => { setSelectedReport(report); setIsDetailsOpen(true); }}>
                                        <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-semibold truncate">{report.title}</h4>
                                                <Badge className={cn(config.color, "text-white whitespace-nowrap")}>
                                                    {config.icon} {config.label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span>by {report.user?.name}</span>
                                                <span>•</span>
                                                <span>{format(new Date(report.created_at), 'MMMM d, yyyy')}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {canApprove && (
                                                <Button size="sm" variant="outline" className="h-8 border-indigo-200 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={(e) => { e.stopPropagation(); setSelectedReport(report); setApprovalAction('approve'); setIsApprovalOpen(true); }}>
                                                    <CheckCircle2 className="h-4 w-4 mr-1" /> Review
                                                </Button>
                                            )}
                                            {canEdit && (
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); setEditingReport(report); setIsUploadOpen(true); }}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild onClick={(e) => e.stopPropagation()}>
                                                <a href={report.file_url || '#'} target="_blank" rel="noreferrer">
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upload/Edit Dialog */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleUpload}>
                        <DialogHeader>
                            <DialogTitle>{editingReport ? 'Edit Report' : 'Upload New Report'}</DialogTitle>
                            <DialogDescription>
                                {editingReport ? 'Modifying a report after Team Lead approval will restart the approval process.' : 'Submit a report for approval. It will go to the Team Lead first.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Report Title *</Label>
                                <Input id="title" name="title" defaultValue={editingReport?.title} placeholder="e.g., Monthly Digital Marketing Report - March" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea id="description" name="description" defaultValue={editingReport?.description || ""} placeholder="Add any details or context..." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="report_file">Report File {editingReport ? '(Optional if keeping same file)' : '*'}</Label>
                                <Input id="report_file" type="file" required={!editingReport} className="file:bg-indigo-50 file:text-indigo-600" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                {editingReport ? 'Update & Re-Submit' : 'Submit for Approval'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0">
                    {selectedReport && (
                        <>
                            <div className="p-6 pb-4 border-b">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <DialogTitle className="text-xl mb-1">{selectedReport.title}</DialogTitle>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>by {selectedReport.user?.name}</span>
                                            <span>•</span>
                                            <span>Project: {project.name}</span>
                                        </div>
                                    </div>
                                    <Badge className={cn(getStatusConfig(selectedReport.status).color, "text-white")}>
                                        {getStatusConfig(selectedReport.status).label}
                                    </Badge>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <Button size="sm" variant="outline" className="flex-1" asChild>
                                        <a href={selectedReport.file_url || '#'} target="_blank" rel="noreferrer">
                                            <Download className="h-4 w-4 mr-2" /> Download Report
                                        </a>
                                    </Button>
                                    {(activeRole === 'hr' || activeRole === 'admin' || (activeRole === 'team-lead' && selectedReport.user?.department === currentUser?.department)) && (
                                        <div className="flex gap-2 shrink-0">
                                            <Button size="sm" variant="outline" className="text-red-600 h-9" onClick={() => { setApprovalAction('reject'); setIsApprovalOpen(true); }}>
                                                <X className="h-4 w-4 mr-1" /> Reject
                                            </Button>
                                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-9" onClick={() => { setApprovalAction('approve'); setIsApprovalOpen(true); }}>
                                                <Check className="h-4 w-4 mr-1" /> Approve
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <ScrollArea className="flex-1">
                                <div className="p-6 space-y-8">
                                    {selectedReport.description && (
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
                                            <p className="text-sm bg-muted/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-950">{selectedReport.description}</p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <History className="h-3 w-3" /> Approval History & Comments
                                        </Label>
                                        
                                        <div className="space-y-4">
                                            {selectedReport.activities?.map((activity) => (
                                                <div key={activity.id} className="relative pl-6 pb-4 border-l-2 border-muted last:pb-0">
                                                    <div className={cn(
                                                        "absolute left-[-9px] top-0 h-4 w-4 rounded-full border-2 border-background",
                                                        activity.activity_type === 'status_change' ? "bg-indigo-500" : "bg-gray-400"
                                                    )} />
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-semibold">{activity.user.name}</span>
                                                        <span className="text-[10px] text-muted-foreground">{format(new Date(activity.created_at), 'MMM d, h:mm a')}</span>
                                                    </div>
                                                    {activity.activity_type === 'status_change' && (
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-[10px] h-4 px-1 leading-none">{activity.from_status || 'Draft'}</Badge>
                                                            <span className="text-[10px] text-muted-foreground">→</span>
                                                            <Badge variant="outline" className="text-[10px] h-4 px-1 leading-none border-indigo-200 text-indigo-600">{activity.to_status}</Badge>
                                                        </div>
                                                    )}
                                                    {activity.comment && (
                                                        <p className="text-sm text-muted-foreground mt-1 italic">"{activity.comment}"</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>

                            <div className="p-4 border-t bg-muted/10">
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Add a comment..." 
                                        value={newComment} 
                                        onChange={(e) => setNewComment(e.target.value)} 
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                    />
                                    <Button size="icon" disabled={!newComment || processing} onClick={handleAddComment}>
                                        {processing ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <MessageSquare className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Approval/Rejection Comment Dialog */}
            <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className={cn(approvalAction === 'approve' ? "text-green-600" : "text-red-600")}>
                            {approvalAction === 'approve' ? 'Approve Report' : 'Reject Report'}
                        </DialogTitle>
                        <DialogDescription>
                            {approvalAction === 'approve' 
                                ? 'Add an optional comment for your approval.' 
                                : 'Please provide a reason for the rejection. The staff user will be able to see this and resubmit.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Textarea 
                            placeholder="Add your comments here..." 
                            value={comment} 
                            onChange={(e) => setComment(e.target.value)} 
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsApprovalOpen(false)}>Cancel</Button>
                        <Button 
                            variant={approvalAction === 'approve' ? 'default' : 'destructive'} 
                            className={cn(approvalAction === 'approve' ? "bg-green-600 hover:bg-green-700" : "")}
                            onClick={handleAction}
                            disabled={processing || (approvalAction === 'reject' && !comment)}
                        >
                            {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {approvalAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
