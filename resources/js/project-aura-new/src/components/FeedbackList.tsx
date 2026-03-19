import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Feedback {
    id: number;
    description: string;
    type: string;
    status: string;
    screenshot_path: string | null;
    images: string[] | null;
    created_at: string;
    user: {
        name: string;
        email: string;
    } | null;
    device_info: any;
}

export function FeedbackList() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const { data } = await api.get("/feedback");
                setFeedbacks(data);
            } catch (error) {
                console.error("Failed to fetch feedback", error);
            }
        };
        fetchFeedback();
    }, []);

    const getImageUrl = (path: string) => {
        if (path.startsWith('http')) return path;
        return `/storage/${path}`;
    };

    const allImages = (feedback: Feedback) => {
        const images: string[] = [];
        if (feedback.screenshot_path) images.push(feedback.screenshot_path);
        if (feedback.images && Array.isArray(feedback.images)) {
            feedback.images.forEach(img => {
                if (!images.includes(img)) images.push(img);
            });
        }
        return images;
    };

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Bug Reports & Feedback</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Attachments</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {feedbacks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">No reports found.</TableCell>
                            </TableRow>
                        ) : (
                            feedbacks.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Badge variant={item.type === 'bug_report' ? 'destructive' : 'secondary'}>
                                            {item.type.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={item.description}>
                                        {item.description}
                                    </TableCell>
                                    <TableCell>{item.user?.name || 'Anonymous'}</TableCell>
                                    <TableCell>{format(new Date(item.created_at), "MMM d, yyyy")}</TableCell>
                                    <TableCell>
                                        {allImages(item).length > 0 && (
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedFeedback(item)}>
                                                <Eye className="w-4 h-4 mr-1" /> View ({allImages(item).length})
                                            </Button>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{item.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">{selectedFeedback?.type.replace('_', ' ')} Report</h3>
                            <p className="whitespace-pre-wrap text-sm">{selectedFeedback?.description}</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {selectedFeedback && allImages(selectedFeedback).map((img, idx) => (
                                    <div key={idx} className="border rounded-md overflow-hidden">
                                        <img src={getImageUrl(img)} alt={`Attachment ${idx + 1}`} className="w-full h-auto" />
                                    </div>
                                ))}
                            </div>

                            {selectedFeedback?.device_info && (
                                <div className="mt-4 p-4 bg-muted rounded-md text-xs font-mono">
                                    <h4 className="font-bold mb-2">Device Info</h4>
                                    <pre>{JSON.stringify(selectedFeedback.device_info, null, 2)}</pre>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
