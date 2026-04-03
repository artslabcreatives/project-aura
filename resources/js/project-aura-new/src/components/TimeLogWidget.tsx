import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Clock, Play, Square, Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { format } from 'date-fns';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';

interface TimeLog {
	id: number;
	task_id: number;
	user_id: number;
	user?: {
		id: number;
		name: string;
		email: string;
	};
	started_at: string;
	ended_at: string | null;
	hours_logged: number;
	notes: string | null;
	created_at: string;
	updated_at: string;
}

interface TimeLogWidgetProps {
	taskId: number;
}

export function TimeLogWidget({ taskId }: TimeLogWidgetProps) {
	const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
	const [activeLog, setActiveLog] = useState<TimeLog | null>(null);
	const [loading, setLoading] = useState(true);
	const [isTimerRunning, setIsTimerRunning] = useState(false);
	const [elapsedTime, setElapsedTime] = useState(0);
	const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
	const [manualStartDate, setManualStartDate] = useState('');
	const [manualStartTime, setManualStartTime] = useState('');
	const [manualEndDate, setManualEndDate] = useState('');
	const [manualEndTime, setManualEndTime] = useState('');
	const [manualNotes, setManualNotes] = useState('');
	const { toast } = useToast();

	useEffect(() => {
		fetchTimeLogs();
	}, [taskId]);

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;

		if (isTimerRunning && activeLog) {
			interval = setInterval(() => {
				const start = new Date(activeLog.started_at).getTime();
				const now = new Date().getTime();
				setElapsedTime(Math.floor((now - start) / 1000));
			}, 1000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isTimerRunning, activeLog]);

	const fetchTimeLogs = async () => {
		try {
			setLoading(true);
			const response = await api.get(`/tasks/${taskId}/time-logs`);
			setTimeLogs(response.data);

			// Check if there's an active timer
			const active = response.data.find((log: TimeLog) => !log.ended_at);
			if (active) {
				setActiveLog(active);
				setIsTimerRunning(true);
			}
		} catch (error) {
			console.error('Failed to fetch time logs:', error);
			toast({
				title: 'Error',
				description: 'Failed to load time logs',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const startTimer = async () => {
		try {
			const response = await api.post(`/tasks/${taskId}/time-log`, {
				started_at: new Date().toISOString(),
			});
			setActiveLog(response.data);
			setIsTimerRunning(true);
			toast({
				title: 'Timer Started',
				description: 'Time tracking has begun for this task',
			});
			fetchTimeLogs();
		} catch (error) {
			console.error('Failed to start timer:', error);
			toast({
				title: 'Error',
				description: 'Failed to start timer',
				variant: 'destructive',
			});
		}
	};

	const stopTimer = async () => {
		if (!activeLog) return;

		try {
			await api.patch(`/tasks/${taskId}/time-log/${activeLog.id}`, {
				ended_at: new Date().toISOString(),
			});
			setIsTimerRunning(false);
			setActiveLog(null);
			setElapsedTime(0);
			toast({
				title: 'Timer Stopped',
				description: 'Time has been logged successfully',
			});
			fetchTimeLogs();
		} catch (error) {
			console.error('Failed to stop timer:', error);
			toast({
				title: 'Error',
				description: 'Failed to stop timer',
				variant: 'destructive',
			});
		}
	};

	const handleManualEntry = async () => {
		if (!manualStartDate || !manualStartTime || !manualEndDate || !manualEndTime) {
			toast({
				title: 'Validation Error',
				description: 'Please fill in all date and time fields',
				variant: 'destructive',
			});
			return;
		}

		try {
			const startedAt = `${manualStartDate}T${manualStartTime}:00`;
			const endedAt = `${manualEndDate}T${manualEndTime}:00`;

			await api.post(`/tasks/${taskId}/time-log`, {
				started_at: startedAt,
				ended_at: endedAt,
				notes: manualNotes || null,
			});

			toast({
				title: 'Time Logged',
				description: 'Manual time entry has been saved',
			});

			// Reset form
			setManualStartDate('');
			setManualStartTime('');
			setManualEndDate('');
			setManualEndTime('');
			setManualNotes('');
			setIsManualEntryOpen(false);

			fetchTimeLogs();
		} catch (error: any) {
			console.error('Failed to log time:', error);
			toast({
				title: 'Error',
				description: error.response?.data?.message || 'Failed to log time',
				variant: 'destructive',
			});
		}
	};

	const formatTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const formatDuration = (hours: number) => {
		const h = Math.floor(hours);
		const m = Math.round((hours - h) * 60);
		return `${h}h ${m}m`;
	};

	const totalHours = timeLogs
		.filter((log) => log.ended_at)
		.reduce((sum, log) => sum + log.hours_logged, 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="h-5 w-5" />
					Time Tracking
				</CardTitle>
				<CardDescription>
					Track time spent on this task. Total logged: {formatDuration(totalHours)}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Timer Controls */}
				<div className="flex items-center gap-3 p-4 border rounded-lg bg-accent/50">
					{isTimerRunning ? (
						<>
							<div className="flex-1">
								<div className="text-3xl font-mono font-bold">{formatTime(elapsedTime)}</div>
								<p className="text-sm text-muted-foreground">Timer running...</p>
							</div>
							<Button onClick={stopTimer} variant="destructive" size="lg">
								<Square className="h-4 w-4 mr-2" />
								Stop
							</Button>
						</>
					) : (
						<>
							<Button onClick={startTimer} className="flex-1" size="lg">
								<Play className="h-4 w-4 mr-2" />
								Start Timer
							</Button>
							<Button onClick={() => setIsManualEntryOpen(true)} variant="outline" size="lg">
								<Plus className="h-4 w-4 mr-2" />
								Manual Entry
							</Button>
						</>
					)}
				</div>

				{/* Time Log History */}
				{timeLogs.length > 0 && (
					<div className="space-y-3">
						<h3 className="text-sm font-semibold">Time Log History</h3>
						<div className="space-y-2 max-h-96 overflow-y-auto">
							{timeLogs.map((log) => (
								<div
									key={log.id}
									className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
								>
									<div className="flex-1 space-y-1">
										<div className="flex items-center gap-2">
											<p className="text-sm font-medium">
												{log.user?.name || 'Unknown User'}
											</p>
											{!log.ended_at && (
												<Badge variant="default" className="bg-green-500">
													Active
												</Badge>
											)}
										</div>
										<div className="text-xs text-muted-foreground space-y-0.5">
											<p>
												Started: {format(new Date(log.started_at), 'MMM dd, yyyy hh:mm a')}
											</p>
											{log.ended_at && (
												<p>
													Ended: {format(new Date(log.ended_at), 'MMM dd, yyyy hh:mm a')}
												</p>
											)}
											{log.notes && <p className="italic">Note: {log.notes}</p>}
										</div>
									</div>
									<div className="text-right">
										<p className="text-lg font-bold">
											{log.ended_at ? formatDuration(log.hours_logged) : formatTime(elapsedTime)}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{timeLogs.length === 0 && !loading && (
					<div className="text-center py-8 text-muted-foreground">
						<Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
						<p className="text-sm">No time logged yet</p>
						<p className="text-xs mt-1">Start the timer or add a manual entry</p>
					</div>
				)}
			</CardContent>

			{/* Manual Entry Dialog */}
			<Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Manual Time Entry</DialogTitle>
						<DialogDescription>Add a time log entry for work already completed</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="start-date">Start Date</Label>
								<Input
									id="start-date"
									type="date"
									value={manualStartDate}
									onChange={(e) => setManualStartDate(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="start-time">Start Time</Label>
								<Input
									id="start-time"
									type="time"
									value={manualStartTime}
									onChange={(e) => setManualStartTime(e.target.value)}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="end-date">End Date</Label>
								<Input
									id="end-date"
									type="date"
									value={manualEndDate}
									onChange={(e) => setManualEndDate(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="end-time">End Time</Label>
								<Input
									id="end-time"
									type="time"
									value={manualEndTime}
									onChange={(e) => setManualEndTime(e.target.value)}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="notes">Notes (optional)</Label>
							<Textarea
								id="notes"
								placeholder="Add notes about what you worked on..."
								value={manualNotes}
								onChange={(e) => setManualNotes(e.target.value)}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsManualEntryOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleManualEntry}>Save Entry</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
