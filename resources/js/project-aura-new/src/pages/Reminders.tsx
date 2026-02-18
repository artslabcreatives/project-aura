import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reminderService, Reminder } from "@/services/reminderService";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Bell,
    Trash2,
    Check,
    Clock,
    Plus,
    Calendar as CalendarIcon,
    RefreshCw,
} from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const Reminders = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDataOpen, setIsDataOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [newReminder, setNewReminder] = useState({
        title: "",
        description: "",
        reminder_at: "",
    });

    const { data: reminders = [], isLoading } = useQuery({
        queryKey: ["reminders"],
        queryFn: reminderService.getAll,
    });

    const createMutation = useMutation({
        mutationFn: reminderService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reminders"] });
            handleCloseDialog();
            toast({ title: "Reminder set successfully" });
        },
        onError: () => {
            toast({ title: "Failed to create reminder", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            reminderService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reminders"] });
            handleCloseDialog();
            toast({ title: "Reminder updated" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: reminderService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reminders"] });
            toast({ title: "Reminder deleted" });
        },
    });

    const markReadMutation = useMutation({
        mutationFn: reminderService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reminders"] });
        },
    });

    const handleCloseDialog = () => {
        setIsDataOpen(false);
        setEditingReminder(null);
        setNewReminder({ title: "", description: "", reminder_at: "" });
    };

    const handleEdit = (reminder: Reminder) => {
        setEditingReminder(reminder);

        // Convert ISO string back to local datetime-local format (YYYY-MM-DDTHH:mm)
        // new Date(isoString) gets date object in local time
        const date = new Date(reminder.reminder_at);
        // Format to YYYY-MM-DDTHH:mm by using offsets
        // Or simpler: date.getFullYear() ... etc, OR date-fns format
        // date-fns format(date, "yyyy-MM-dd'T'HH:mm") uses local time by default
        const localDateTime = format(date, "yyyy-MM-dd'T'HH:mm");

        setNewReminder({
            title: reminder.title,
            description: reminder.description || "",
            reminder_at: localDateTime,
        });
        setIsDataOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReminder.title || !newReminder.reminder_at) return;

        const isoDate = new Date(newReminder.reminder_at).toISOString();

        if (editingReminder) {
            updateMutation.mutate({
                id: editingReminder.id,
                data: {
                    ...newReminder,
                    reminder_at: isoDate,
                },
            });
        } else {
            createMutation.mutate({
                ...newReminder,
                reminder_at: isoDate,
            });
        }
    };

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const lkrTime = currentTime.toLocaleTimeString("en-US", {
        timeZone: "Asia/Colombo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    // Request notification permission
    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Bell className="h-8 w-8 text-primary" />
                        My Reminders
                    </h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        Manage your personal reminders.
                        <span className="inline-flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded text-xs font-medium text-secondary-foreground">
                            <Clock className="h-3 w-3" />
                            Local Time: {lkrTime}
                        </span>
                    </p>
                </div>
                <Dialog open={isDataOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 shadow-lg hover:shadow-xl transition-all" onClick={() => setIsDataOpen(true)}>
                            <Plus className="h-4 w-4" />
                            Add Reminder
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingReminder ? "Edit Reminder" : "Set New Reminder"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Call Client"
                                    value={newReminder.title}
                                    onChange={(e) =>
                                        setNewReminder({ ...newReminder, title: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="datetime">Time</Label>
                                <Input
                                    id="datetime"
                                    type="datetime-local"
                                    required
                                    value={newReminder.reminder_at}
                                    onChange={(e) =>
                                        setNewReminder({
                                            ...newReminder,
                                            reminder_at: e.target.value,
                                        })
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Select time. Reminders will trigger based on your local time setting.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Details..."
                                    value={newReminder.description}
                                    onChange={(e) =>
                                        setNewReminder({
                                            ...newReminder,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Reminder"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-10">
                {/* Active Reminders Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground/80">
                        <Clock className="h-5 w-5" />
                        Active Reminders
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            <div className="col-span-full flex justify-center py-12 text-muted-foreground">
                                <RefreshCw className="h-6 w-6 animate-spin" />
                            </div>
                        ) : reminders.filter(r => !r.is_read).length === 0 ? (
                            <div className="col-span-full text-center py-12 border rounded-lg bg-muted/20 border-dashed">
                                <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium">No active reminders</h3>
                                <p className="text-muted-foreground">
                                    You're all caught up!
                                </p>
                            </div>
                        ) : (
                            reminders
                                .filter(r => !r.is_read)
                                .sort((a, b) => new Date(a.reminder_at).getTime() - new Date(b.reminder_at).getTime()) // ASC (Soonest first)
                                .map((reminder) => {
                                    const isExpired = isPast(new Date(reminder.reminder_at));

                                    return (
                                        <Card
                                            key={reminder.id}
                                            className="transition-all hover:shadow-md bg-card border-l-4 border-l-primary"
                                        >
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start gap-2">
                                                    <CardTitle className="text-lg font-semibold leading-tight">
                                                        {reminder.title}
                                                    </CardTitle>
                                                    {isExpired && (
                                                        <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">Overdue</span>
                                                    )}
                                                </div>
                                                <CardDescription className="flex items-center gap-1.5 text-xs">
                                                    <CalendarIcon className="h-3.5 w-3.5" />
                                                    {format(new Date(reminder.reminder_at), "PPP p")} (
                                                    {format(new Date(reminder.reminder_at), "z")})
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pb-2">
                                                {reminder.description && (
                                                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                                                        {reminder.description}
                                                    </p>
                                                )}
                                            </CardContent>
                                            <CardFooter className="pt-2 flex justify-end gap-2 border-t mt-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-primary hover:text-primary/90 hover:bg-primary/10 h-8"
                                                    onClick={() => markReadMutation.mutate(reminder.id)}
                                                >
                                                    <Check className="h-4 w-4 mr-1.5" />
                                                    Done
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-foreground hover:bg-muted h-8"
                                                    onClick={() => handleEdit(reminder)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                                    onClick={() => deleteMutation.mutate(reminder.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    );
                                })
                        )}
                    </div>
                </div>

                {/* Completed Reminders Section */}
                {reminders.some(r => r.is_read) && (
                    <div className="space-y-4 pt-6 border-t">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-muted-foreground">
                            <Check className="h-5 w-5" />
                            Completed
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                            {reminders
                                .filter(r => r.is_read)
                                .sort((a, b) => new Date(b.reminder_at).getTime() - new Date(a.reminder_at).getTime()) // DESC (Most recent first)
                                .map((reminder) => (
                                    <Card
                                        key={reminder.id}
                                        className="transition-all hover:shadow-md bg-muted/40"
                                    >
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start gap-2">
                                                <CardTitle className="text-lg font-semibold leading-tight line-through text-muted-foreground">
                                                    {reminder.title}
                                                </CardTitle>
                                            </div>
                                            <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <CalendarIcon className="h-3.5 w-3.5" />
                                                {format(new Date(reminder.reminder_at), "PPP p")}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            {reminder.description && (
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {reminder.description}
                                                </p>
                                            )}
                                        </CardContent>
                                        <CardFooter className="pt-2 flex justify-end gap-2 border-t mt-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                                onClick={() => deleteMutation.mutate(reminder.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reminders;
