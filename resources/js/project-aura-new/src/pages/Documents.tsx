import React, { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user';
import { documentService } from '@/services/documentService';
import { Document, DocumentGrouped } from '@/types/document';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    FileText,
    Upload,
    CheckCircle,
    XCircle,
    Download,
    Trash2,
    Clock,
    User,
    Eye,
} from 'lucide-react';
import { DocumentUploadDialog } from '@/components/documents/DocumentUploadDialog';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
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

export default function Documents() {
    const { currentUser: user } = useUser();
    const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');
    const [groupedDocs, setGroupedDocs] = useState<DocumentGrouped>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<Document | null>(null);
    const { toast } = useToast();

    const isApprover = ['admin', 'hr', 'team-lead'].includes(user?.role || '');

    useEffect(() => {
        fetchDocuments();
        
        // Refresh when a document is uploaded via event
        const handleUploaded = () => fetchDocuments();
        window.addEventListener('aura:document-uploaded', handleUploaded);
        return () => window.removeEventListener('aura:document-uploaded', handleUploaded);
    }, [activeTab]);

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const data = await documentService.list(activeTab);
            setGroupedDocs(data);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (docId: string) => {
        try {
            await documentService.approve(docId);
            toast({ title: 'Document approved' });
            fetchDocuments();
        } catch (error) {
            toast({ title: 'Approval failed', variant: 'destructive' });
        }
    };

    const handleReject = async (docId: string) => {
        const reason = window.prompt('Reason for rejection:');
        if (reason === null) return;
        
        try {
            await documentService.reject(docId, reason || 'No reason provided');
            toast({ title: 'Document rejected' });
            fetchDocuments();
        } catch (error) {
            toast({ title: 'Rejection failed', variant: 'destructive' });
        }
    };

    const handleDelete = async () => {
        if (!docToDelete) return;
        try {
            await documentService.delete(docToDelete.id);
            toast({ title: 'Document deleted' });
            fetchDocuments();
        } catch (error) {
            toast({ title: 'Deletion failed', variant: 'destructive' });
        } finally {
            setDocToDelete(null);
        }
    };

    const handleDownload = async (docId: string, name: string) => {
        try {
            const { url } = await documentService.download(docId, 'download');
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast({ title: 'Download failed', variant: 'destructive' });
        }
    };

    const handleView = async (docId: string) => {
        try {
            const { url } = await documentService.download(docId, 'view');
            window.open(url, '_blank');
        } catch (error) {
            toast({ title: 'Could not open viewer', variant: 'destructive' });
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                    <p className="text-muted-foreground">Manage departmental documents and approvals.</p>
                </div>
                <Button onClick={() => setIsUploadOpen(true)} className="gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Upload className="h-4 w-4" />
                    Upload Document
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="approved" className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Approved
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="gap-2">
                        <Clock className="h-4 w-4" />
                        Pending
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-8">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="animate-pulse">
                                    <div className="h-40 bg-muted rounded-t-lg" />
                                    <CardHeader>
                                        <div className="h-6 w-2/3 bg-muted rounded" />
                                        <div className="h-4 w-1/2 bg-muted rounded" />
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    ) : Object.keys(groupedDocs).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-2xl border-2 border-dashed">
                            <div className="p-4 bg-background rounded-full shadow-sm">
                                <FileText className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium">No documents found</h3>
                                <p className="text-muted-foreground">Documents in this category will appear here.</p>
                            </div>
                        </div>
                    ) : (
                        Object.entries(groupedDocs).map(([deptName, docs]) => (
                            <section key={deptName} className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Badge variant="outline" className="text-lg px-3 py-1 bg-primary/5 text-primary border-primary/20">
                                        {deptName}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground font-normal">
                                        ({docs.length} {docs.length === 1 ? 'document' : 'documents'})
                                    </span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {docs.map((doc) => (
                                        <Card key={doc.id} className="group hover:shadow-md transition-all border-muted/60">
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            title="View Document"
                                                            onClick={() => handleView(doc.id)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            title="Download"
                                                            onClick={() => handleDownload(doc.id, doc.name)}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                        {(String(doc.uploaded_by) === String(user?.id) || user?.role === 'admin') && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => setDocToDelete(doc)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <CardTitle className="mt-2 text-lg truncate" title={doc.name}>
                                                    {doc.name}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <User className="h-3 w-3" />
                                                    Uploaded by {doc.uploader?.name || 'Unknown'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-col gap-3">
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(doc.created_at).toLocaleDateString()}
                                                    </div>
                                                    
                                                    {activeTab === 'pending' && isApprover && (
                                                        <div className="flex gap-2 pt-2 border-t">
                                                            <Button 
                                                                size="sm" 
                                                                className="flex-1 gap-1 bg-green-600 hover:bg-green-700"
                                                                onClick={() => handleApprove(doc.id)}
                                                            >
                                                                <CheckCircle className="h-3 w-3" />
                                                                Approve
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline" 
                                                                className="flex-1 gap-1 text-destructive hover:bg-destructive/5"
                                                                onClick={() => handleReject(doc.id)}
                                                            >
                                                                <XCircle className="h-3 w-3" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
                                                    
                                                    {doc.status === 'rejected' && doc.rejection_reason && (
                                                        <div className="p-2 bg-destructive/5 rounded border border-destructive/20 text-xs text-destructive">
                                                            <strong>Rejected:</strong> {doc.rejection_reason}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        ))
                    )}
                </TabsContent>
            </Tabs>

            <DocumentUploadDialog
                open={isUploadOpen}
                onOpenChange={setIsUploadOpen}
                onSuccess={fetchDocuments}
            />

            <AlertDialog open={!!docToDelete} onOpenChange={(o) => !o && setDocToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Document</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{docToDelete?.name}"? This action cannot be undone.
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
        </div>
    );
}
