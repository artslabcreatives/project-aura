import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Estimate, EstimateStatus } from "@/types/estimate";
import { estimateService } from "@/services/estimateService";
import { clientService } from "@/services/clientService";
import { Client } from "@/types/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { EstimateDialog } from "@/components/EstimateDialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Building2,
    Calendar,
    FileText,
    CheckCircle2,
    FolderPlus,
} from "lucide-react";

const statusConfig: Record<EstimateStatus, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
    sent: { label: "Sent", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
    approved: { label: "Approved", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
};

export default function EstimateDetail() {
    const { estimateId } = useParams<{ estimateId: string }>();
    const [estimate, setEstimate] = useState<Estimate | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const fetchEstimate = async () => {
        if (!estimateId) return;
        setLoading(true);
        try {
            const data = await estimateService.getById(estimateId);
            setEstimate(data);
        } catch {
            toast({ title: "Error", description: "Failed to load estimate.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEstimate();
        clientService.getAll().then(setClients).catch(() => {});
    }, [estimateId]);

    const handleStatusChange = async (status: EstimateStatus) => {
        if (!estimate?.id) return;
        try {
            const updated = await estimateService.updateStatus(estimate.id, status);
            setEstimate(updated);
            toast({ title: "Status updated." });
        } catch {
            toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
        }
    };

    const handleSave = async (payload: Omit<Estimate, 'id' | 'created_at' | 'updated_at' | 'client'>) => {
        if (!estimate?.id) return;
        try {
            const updated = await estimateService.update(estimate.id, payload);
            setEstimate(updated);
            toast({ title: "Estimate updated successfully." });
        } catch {
            toast({ title: "Error", description: "Failed to update estimate.", variant: "destructive" });
        }
    };

    const handleDelete = async () => {
        if (!estimate?.id) return;
        try {
            await estimateService.delete(estimate.id);
            toast({ title: "Estimate deleted." });
            navigate("/estimates");
        } catch {
            toast({ title: "Error", description: "Failed to delete estimate.", variant: "destructive" });
        }
    };

    const handleConvertToProject = async () => {
        if (!estimate?.id) return;
        setIsConverting(true);
        try {
            const result = await estimateService.convertToProject(estimate.id);
            toast({ title: "Project created from estimate." });
            navigate(`/project/${result.project_id}`);
        } catch {
            toast({ title: "Error", description: "Failed to create project from estimate.", variant: "destructive" });
        } finally {
            setIsConverting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!estimate) {
        return (
            <div className="p-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h2 className="text-lg font-semibold">Estimate not found</h2>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/estimates")}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Estimates
                </Button>
            </div>
        );
    }

    const lineItems = estimate.items ?? [];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/estimates")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-bold">{estimate.title}</h1>
                            {estimate.estimate_number && (
                                <span className="text-sm text-muted-foreground font-mono">
                                    #{estimate.estimate_number}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {estimate.client?.company_name ?? "Unknown Client"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Status change */}
                    <Select value={estimate.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>

                    {estimate.status === "approved" && !estimate.project_id && (
                        <Button
                            onClick={handleConvertToProject}
                            disabled={isConverting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <FolderPlus className="h-4 w-4 mr-2" />
                            {isConverting ? "Creating..." : "Create Project"}
                        </Button>
                    )}

                    {estimate.project_id && (
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/project/${estimate.project_id}`)}
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            View Project
                        </Button>
                    )}

                    <Button variant="outline" size="icon" onClick={() => setIsEditOpen(true)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsDeleteOpen(true)}
                        className="hover:text-destructive hover:border-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Status Banner */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${statusConfig[estimate.status].className}`}>
                <Badge className={`${statusConfig[estimate.status].className} mr-1`}>
                    {statusConfig[estimate.status].label}
                </Badge>
                {estimate.valid_until && (
                    <span className="flex items-center gap-1 text-xs opacity-80">
                        <Calendar className="h-3 w-3" />
                        Valid until {new Date(estimate.valid_until).toLocaleDateString()}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    {estimate.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">{estimate.description}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Line Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Line Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lineItems.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No line items added.</p>
                            ) : (
                                <div className="space-y-1">
                                    {/* Header Row */}
                                    <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground pb-2 border-b">
                                        <div className="col-span-6">Description</div>
                                        <div className="col-span-2 text-right">Qty</div>
                                        <div className="col-span-2 text-right">Unit Price</div>
                                        <div className="col-span-2 text-right">Total</div>
                                    </div>
                                    {lineItems.map((item, i) => (
                                        <div key={i} className="grid grid-cols-12 gap-2 py-2 border-b last:border-b-0 text-sm">
                                            <div className="col-span-6">{item.description}</div>
                                            <div className="col-span-2 text-right">{item.quantity}</div>
                                            <div className="col-span-2 text-right">{estimate.currency === "LKR" ? "Rs. " : "$"}{item.unit_price.toFixed(2)}</div>
                                            <div className="col-span-2 text-right font-medium">
                                                {estimate.currency === "LKR" ? "Rs. " : "$"}{(item.quantity * item.unit_price).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Totals */}
                            <div className="mt-4 space-y-1 text-sm">
                                <Separator />
                                <div className="flex justify-between pt-2">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{estimate.currency === "LKR" ? "Rs. " : "$"}{(estimate.subtotal ?? 0).toFixed(2)}</span>
                                </div>
                                {estimate.tax_rate !== undefined && estimate.tax_rate > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax ({estimate.tax_rate}%)</span>
                                        <span>{estimate.currency === "LKR" ? "Rs. " : "$"}{(estimate.tax_amount ?? 0).toFixed(2)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between font-semibold text-base pt-1">
                                    <span>Total</span>
                                    <span>{estimate.currency === "LKR" ? "Rs. " : "$"}{(estimate.total_amount ?? 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {estimate.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">{estimate.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                <div>
                                    <div className="text-xs text-muted-foreground">Client</div>
                                    <div className="font-medium">{estimate.client?.company_name ?? "—"}</div>
                                </div>
                            </div>
                            {estimate.estimate_number && (
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Estimate #</div>
                                        <div className="font-mono font-medium">{estimate.estimate_number}</div>
                                    </div>
                                </div>
                            )}
                            {estimate.valid_until && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Valid Until</div>
                                        <div className="font-medium">{new Date(estimate.valid_until).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            )}
                            {estimate.created_at && (
                                <div>
                                    <div className="text-xs text-muted-foreground">Created</div>
                                    <div className="font-medium">{new Date(estimate.created_at).toLocaleDateString()}</div>
                                </div>
                            )}
                            {estimate.project_id && (
                                <div className="pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => navigate(`/project/${estimate.project_id}`)}
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-green-600" />
                                        Linked Project
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Dialog */}
            <EstimateDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onSave={handleSave}
                editEstimate={estimate}
                clients={clients}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Estimate</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{estimate.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
