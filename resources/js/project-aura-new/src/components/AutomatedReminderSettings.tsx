import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { automatedReminderService, AutomatedReminderSetting, ProjectWithOverride, AuditLog } from "@/services/automatedReminderService";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";
import { Settings, History, Save, AlertTriangle, Info, Plus, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export const AutomatedReminderSettings = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [editingProject, setEditingProject] = useState<ProjectWithOverride | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["automatedReminderSettings"],
        queryFn: () => automatedReminderService.getData(),
    });

    const { data: auditLogs, isLoading: logsLoading } = useQuery({
        queryKey: ["automatedReminderAuditLogs"],
        queryFn: () => automatedReminderService.getAuditLogs(),
    });

    const updateSettingMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<AutomatedReminderSetting> }) =>
            automatedReminderService.updateSetting(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["automatedReminderSettings"] });
            queryClient.invalidateQueries({ queryKey: ["automatedReminderAuditLogs"] });
            toast({ title: "Setting updated successfully" });
        },
    });

    const updateOverrideMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            automatedReminderService.updateProjectOverride(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["automatedReminderSettings"] });
            queryClient.invalidateQueries({ queryKey: ["automatedReminderAuditLogs"] });
            setEditingProject(null);
            toast({ title: "Project override updated" });
        },
    });

    const handleSettingChange = (id: number, field: string, value: any) => {
        updateSettingMutation.mutate({ id, data: { [field]: value } });
    };

    const handleDaysChange = (id: number, rawValue: string) => {
        const days = rawValue.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
        handleSettingChange(id, 'days_before', days);
    };

    if (isLoading) return <div>Loading settings...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Card className="border-l-4 border-l-indigo-500 bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-500" />
                        <CardTitle>Global Automated Reminder Settings</CardTitle>
                    </div>
                    <CardDescription>
                        Configure default periods for system-wide reminders. Enter comma-separated days before (e.g., 7, 3, 1).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Reminder Type</TableHead>
                                <TableHead>Trigger Days (Days Before)</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.settings.map((setting) => (
                                <TableRow key={setting.id}>
                                    <TableCell className="font-semibold">{setting.label}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    className="max-w-[300px]"
                                                    defaultValue={Array.isArray(setting.days_before) ? setting.days_before.join(', ') : setting.days_before}
                                                    onBlur={(e) => handleDaysChange(setting.id, e.target.value)}
                                                    placeholder="e.g. 7, 3, 1"
                                                />
                                                <span className="text-sm text-muted-foreground whitespace-nowrap">days before</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(setting.days_before) && setting.days_before.map((day) => (
                                                    <Badge key={day} variant="secondary" className="text-[10px]">
                                                        {day}d before
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={setting.is_active}
                                            onCheckedChange={(checked) => handleSettingChange(setting.id, 'is_active', checked)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-violet-500 bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-violet-500" />
                        <CardTitle>Project Manual Overrides</CardTitle>
                    </div>
                    <CardDescription>
                        Manually set specific reminder dates or custom day sequences for active projects.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project</TableHead>
                                <TableHead>Grace Period Expiry</TableHead>
                                <TableHead>Override Mode</TableHead>
                                <TableHead>Days / Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.projects_with_overrides.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{project.name}</span>
                                            <span className="text-xs text-muted-foreground tabular-nums">{project.project_code}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="tabular-nums">
                                        {format(parseISO(project.grace_period_expires_at), 'PPP')}
                                    </TableCell>
                                    <TableCell>
                                        {project.manual_reminder_date ? (
                                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Fixed Date</Badge>
                                        ) : project.manual_reminder_days ? (
                                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500">Custom Sequence</Badge>
                                        ) : (
                                            <Badge variant="secondary">Global Default</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {project.manual_reminder_date ? (
                                            <span className="font-medium text-primary">
                                                {format(parseISO(project.manual_reminder_date), 'PPP')}
                                            </span>
                                        ) : project.manual_reminder_days ? (
                                            <div className="flex flex-wrap gap-1">
                                                {project.manual_reminder_days.map(day => (
                                                    <Badge key={day} variant="outline" className="text-[10px]">{day}d</Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic text-sm">System default</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" onClick={() => setEditingProject(project)}>
                                            Override
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-purple-500" />
                        <CardTitle>Audit Logs</CardTitle>
                    </div>
                    <CardDescription>
                        Track all manual changes and overrides to automated reminders.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {logsLoading ? (
                            <div>Loading logs...</div>
                        ) : auditLogs?.map((log) => (
                            <div key={log.id} className="p-4 rounded-xl bg-muted/40 border border-white/5 space-y-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-bold bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                                        {log.action.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                    <span className="text-xs text-muted-foreground tabular-nums">
                                        {format(parseISO(log.created_at), 'PPP p')}
                                    </span>
                                </div>
                                <p className="text-sm">
                                    <span className="font-semibold text-primary">{log.user.name}</span> modified reminder settings.
                                </p>
                                <div className="grid grid-cols-2 gap-4 mt-2 p-2 rounded-lg bg-card/50 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                    <div>
                                        <p className="mb-1 opacity-50">Previous Value</p>
                                        <pre className="p-2 rounded bg-destructive/10 text-destructive font-mono lowercase">
                                            {JSON.stringify(log.details.old, null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <p className="mb-1 opacity-50">New Value</p>
                                        <pre className="p-2 rounded bg-green-500/10 text-green-500 font-mono lowercase">
                                            {JSON.stringify(log.details.new, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Override Reminder for {editingProject?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label>Manual Reminder Date (Fixed)</Label>
                            <Input
                                type="date"
                                defaultValue={editingProject?.manual_reminder_date || ''}
                                onChange={(e) => setEditingProject(prev => prev ? { ...prev, manual_reminder_date: e.target.value, manual_reminder_days: null } : null)}
                            />
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                Setting this will trigger a reminder ONLY after this specific date.
                            </p>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">OR</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Custom Day sequence (Days Before Expiry)</Label>
                            <Input
                                placeholder="e.g. 14, 7, 1"
                                defaultValue={Array.isArray(editingProject?.manual_reminder_days) ? editingProject?.manual_reminder_days.join(', ') : ''}
                                onChange={(e) => {
                                    const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
                                    setEditingProject(prev => prev ? { ...prev, manual_reminder_days: days, manual_reminder_date: null } : null);
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter comma-separated numbers for days before expiry.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingProject(null)}>Cancel</Button>
                        <Button
                            onClick={() => {
                                if (editingProject) {
                                    updateOverrideMutation.mutate({
                                        id: editingProject.id,
                                        data: {
                                            manual_reminder_date: editingProject.manual_reminder_date,
                                            manual_reminder_days: editingProject.manual_reminder_days,
                                        }
                                    });
                                }
                            }}
                        >
                            Save Override
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
