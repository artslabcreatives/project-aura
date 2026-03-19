import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, Download } from "lucide-react";

interface POViewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    url: string;
    poNumber?: string;
}

export function POViewDialog({ open, onOpenChange, url, poNumber }: POViewDialogProps) {
    if (!url) return null;

    const isPDF = url.toLowerCase().includes('.pdf') || url.includes('data:application/pdf');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0 overflow-hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                    <div>
                        <DialogTitle className="text-xl font-bold">
                            Purchase Order {poNumber ? `: ${poNumber}` : ""}
                        </DialogTitle>
                    </div>
                    <div className="flex items-center gap-2 pr-8">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => window.open(url, '_blank')}
                        >
                            <ExternalLink className="h-4 w-4" />
                            Open in New Tab
                        </Button>
                        <a 
                            href={url} 
                            download 
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </a>
                    </div>
                </DialogHeader>
                
                <div className="flex-1 bg-muted/30 relative flex items-center justify-center p-4">
                    {isPDF ? (
                        <iframe 
                            src={`${url}#view=FitH`}
                            className="w-full h-full rounded-md shadow-sm border bg-white"
                            title="PO Document Viewer"
                        />
                    ) : (
                        <div className="w-full h-full overflow-auto flex items-center justify-center">
                            <img 
                                src={url} 
                                alt="PO Document" 
                                className="max-w-full max-h-full object-contain rounded-md shadow-md bg-white"
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
