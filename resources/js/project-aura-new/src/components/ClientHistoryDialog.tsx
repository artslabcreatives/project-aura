import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClientHistory } from "@/types/client";
import { clientService } from "@/services/clientService";
import { format } from "date-fns";
import { History, User, Building2, UserPlus, Pencil, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface ClientHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClientHistoryDialog({
    open,
    onOpenChange,
}: ClientHistoryDialogProps) {
    const [history, setHistory] = useState<ClientHistory[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await clientService.getHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch client history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchHistory();
        }
    }, [open]);

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'created_client': return <Plus className="h-4 w-4 text-green-500" />;
            case 'updated_client': return <Pencil className="h-4 w-4 text-blue-500" />;
            case 'deleted_client': return <Trash2 className="h-4 w-4 text-red-500" />;
            case 'added_contact': return <UserPlus className="h-4 w-4 text-green-500" />;
            case 'updated_contact': return <Pencil className="h-4 w-4 text-blue-500" />;
            case 'deleted_contact': return <Trash2 className="h-4 w-4 text-red-500" />;
            default: return <History className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getActionLabel = (action: string) => {
        return action.replace('_', ' ').toUpperCase();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Client Activity Logs
                    </DialogTitle>
                    <DialogDescription>
                        Recent actions performed in the Client Management Module.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] mt-4 pr-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No activity logs found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((item) => (
                                <div key={item.id} className="flex gap-4 p-3 rounded-lg border bg-card/50 text-sm">
                                    <div className="mt-0.5">
                                        {getActionIcon(item.action)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-primary">
                                                {getActionLabel(item.action)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(item.created_at), "MMM d, yyyy HH:mm")}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground">
                                            <span className="font-medium text-foreground">{item.user?.name}</span>
                                            {item.action.includes('client') ? ' for company ' : ' for contact '}
                                            <span className="font-medium text-foreground">{item.target_name}</span>
                                            {item.details?.company && ` (${item.details.company})`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
