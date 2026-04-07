import React, { useState, useEffect, useMemo } from 'react';
import { ProjectReport, ReportStatus } from '@/types/report';
import { reportService } from '@/services/reportService';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { 
    FileText, CheckCircle2, AlertCircle, Loader2, Download, 
    MessageSquare, History, Check, X, Search, Filter,
    LayoutDashboard, ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

export default function ReportManagement() {
    const [reports, setReports] = useState<ProjectReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedReport, setSelectedReport] = useState<ProjectReport | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isApprovalOpen, setIsApprovalOpen] = useState(false);
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
    const [comment, setComment] = useState("");
    const [newComment, setNewComment] = useState("");
    const [processing, setProcessing] = useState(false);
    const { currentUser } = useUser();
    const { toast } = useToast();

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            setLoading(true);
            const data = await reportService.getReports();
            setReports(data);
        } catch (error) {
            console.error("Failed to load reports:", error);
            toast({ title: "Error", description: "Failed to load reports.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = useMemo(() => {
        return reports.filter(report => 
            report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.project?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [reports, searchQuery]);

    const pendingMyApproval = useMemo(() => {
        if (!currentUser) return [];
        return filteredReports.filter(report => {
            if (currentUser.role === 'team-lead') {
                return report.status === 'submitted' && String(report.user?.department_id) === String(currentUser.department);
            }
            if (currentUser.role === 'hr' || currentUser.role === 'admin') {
                return report.status === 'tl_approved';
            }
            if (currentUser.role === 'user' || currentUser.role === 'account-manager') {
                return (report.status === 'submitted' || report.status === 'tl_approved') && String(report.user_id) === String(currentUser.id);
            }
            return false;
        });
    }, [filteredReports, currentUser]);

    const handleAction = async () => {
        if (!selectedReport) return;
        if (approvalAction === 'reject' && !comment) {
            toast({ title: "Required", description: "Comment is required for rejection.", variant: "destructive" });
            return;
        }

        try {
            setProcessing(true);
            const isHR = currentUser?.role === 'hr' || currentUser?.role === 'admin';
            const isTL = currentUser?.role === 'team-lead';

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
            loadReports();
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

    const ReportTable = ({ data }: { data: ProjectReport[] }) => (
        <div className="rounded-md border bg-card overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-3">Report Details</div>
                <div className="col-span-2">Project</div>
                <div className="col-span-4">Status</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1 text-right">Actions</div>
            </div>
            {data.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No reports found.
                </div>
            ) : (
                <div className="divide-y">
                    {data.map(report => {
                        const config = getStatusConfig(report.status);
                        return (
                            <div key={report.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setSelectedReport(report); setIsDetailsOpen(true); }}>
                                <div className="col-span-3 flex items-center gap-3 min-w-0">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-semibold truncate">{report.title}</h4>
                                        <p className="text-xs text-muted-foreground truncate">by {report.user?.name}</p>
                                    </div>
                                </div>
                                <div className="col-span-2 text-sm truncate font-medium text-blue-600 dark:text-blue-400">
                                    {report.project?.name}
                                </div>
                                <div className="col-span-4">
                                    <Badge className={`${config.color} text-white whitespace-nowrap px-3 py-1 ring-1 ring-white/10`}>
                                        {config.icon}
                                        {config.label}
                                    </Badge>
                                </div>
                                <div className="col-span-2 text-xs text-muted-foreground">
                                    {format(new Date(report.created_at), 'MMM d, yyyy')}
                                </div>
                                <div className="col-span-1 text-right">
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
        </div>
    );

    return (
        <div className="p-6 space-y-6 fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <ClipboardList className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Report Management</h1>
                        <p className="text-muted-foreground">Approve and track project submission reports.</p>
                    </div>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search reports..." 
                        className="pl-9" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Pending Approval
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5">{pendingMyApproval.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="all" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        All Reports
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    <ReportTable data={pendingMyApproval} />
                </TabsContent>
                
                <TabsContent value="all" className="mt-6">
                    <ReportTable data={filteredReports} />
                </TabsContent>
            </Tabs>

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
                                            <span>Project: {selectedReport.project?.name}</span>
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
                                    {((currentUser?.role === 'team-lead' && selectedReport.status === 'submitted' && String(selectedReport.user?.department_id) === String(currentUser?.department)) || 
                                      ((currentUser?.role === 'hr' || currentUser?.role === 'admin') && selectedReport.status === 'tl_approved')) && (
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
                                            <History className="h-3 w-3" /> History & Comments
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
                                : 'Please provide a reason for the rejection.'}
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
