import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HistoryEntry } from "@/types/history";
import { User } from "@/types/task";
import { format, isValid } from "date-fns";

import { Stage } from "@/types/stage";

interface HistoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	history: HistoryEntry[];
	teamMembers: User[];
	stages?: Stage[];
	loading?: boolean;
}

export const HistoryDialog = ({ open, onOpenChange, history, teamMembers, stages = [], loading }: HistoryDialogProps) => {
	const getUserInfo = (entry: HistoryEntry) => {
		if (entry.user) {
			return {
				name: entry.user.name,
				role: entry.user.role || "Unknown Role",
			};
		}
		const user = teamMembers.find(member => member.id === entry.userId);
		return {
			name: user?.name || "Unknown User",
			role: user?.role || "Unknown Role",
		};
	};

	const getStageName = (stageId: string) => {
		const stage = stages.find(s => String(s.id) === String(stageId));
		return stage ? stage.title : stageId;
	};

	const renderDetails = (entry: HistoryEntry) => {
		const { action, details } = entry;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const d = details as any;

		switch (action) {
			case 'CREATE_PROJECT':
				return `created project "${d.name}"`;
			case 'CREATE_TASK':
				return `created task "${d.title}"`;
			case 'UPDATE_TASK':
				return `updated task "${d.to?.title || d.title || 'Unknown'}"`;
			case 'DELETE_TASK':
				return `deleted task "${d.title}"`;
			case 'UPDATE_TASK_STATUS':
				return `moved task from "${getStageName(d.from)}" to "${getStageName(d.to)}"`;
			case 'UPDATE_TASK_ASSIGNEE':
				const assigneeInfo = entry.user || teamMembers.find(m => m.id === d.to);
				// Actually details.to is usually the name or ID. If it's ID, we look it up.
				// But previously code assumed d.to is the ID/Name?
				// In ProjectKanban: details: { from: taskToUpdate.assignee, to: updates.assignee },
				// updates.assignee is a NAME string in handleTaskUpdate.
				// So d.to is a NAME.
				return `assigned task to ${d.to}`;
			case 'CREATE_STAGE':
				return `created stage "${d.title}"`;
			case 'UPDATE_STAGE':
				return `updated stage "${d.to?.title || 'Unknown'}"`;
			case 'DELETE_STAGE':
				return `deleted stage "${d.title}"`;
			case 'USER_START_TASK':
				return `started task "${d.title}"`;
			case 'USER_COMPLETE_TASK':
				// Handle both potentially
				return `completed task "${d.title}"`;
			default:
				return "performed an unknown action";
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>Project History</DialogTitle>
					<DialogDescription>
						A log of all changes made to this project.
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="h-[60vh] p-4 border rounded-md">
					<div className="space-y-4">
						{history.length > 0 ? history.map((entry) => {
							const userInfo = getUserInfo(entry);
							return (
								<div key={entry.id} className="flex items-start gap-4">
									<div className="flex-shrink-0 w-20 text-xs text-muted-foreground">
										{(() => {
											const timestamp = entry.timestamp ? new Date(entry.timestamp) : null;
											return timestamp && isValid(timestamp) ? format(timestamp, "PPpp") : "Unknown date";
										})()}
									</div>
									<div className="flex-1">
										<span className="font-semibold">{userInfo.name}</span>{' '}
										<span className="text-xs text-muted-foreground">({userInfo.role})</span>{' '}
										{renderDetails(entry)}
									</div>
								</div>
							);
						}) : (
							<div className="text-center pt-6 pb-2 text-xs text-muted-foreground/50">
								No history records found.
							</div>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};
