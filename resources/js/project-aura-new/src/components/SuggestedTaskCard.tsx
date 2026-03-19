import { SuggestedTask } from "@/types/task";
import { Stage } from "@/types/stage";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageCircle, Plus, Sparkles } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface SuggestedTaskCardProps {
	task: SuggestedTask;
	targetStages: Stage[];
	onAdd: (taskId: string, stageId: string) => void;
}

export function SuggestedTaskCard({ task, targetStages, onAdd }: SuggestedTaskCardProps) {
	const [selectedStage, setSelectedStage] = useState<string>("");

	return (
		<Card className="hover:shadow-md transition-all border-dashed border-2 border-primary/20 bg-primary/5">
			<CardHeader className="p-4 pb-2">
				<div className="flex items-start justify-between gap-2">
					<div className="flex items-center gap-2 flex-1">
						<Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 h-5 px-1.5 gap-1 text-[10px]">
							<Sparkles className="h-2.5 w-2.5" />
							AI Suggestion
						</Badge>
					</div>
					<Badge variant="secondary" className="h-6 w-6 p-0 flex items-center justify-center bg-white shadow-sm">
						{task.source === "whatsapp" ? (
							<MessageCircle className="h-3.5 w-3.5 text-green-600" />
						) : (
							<Mail className="h-3.5 w-3.5 text-blue-600" />
						)}
					</Badge>
				</div>
				<h4 className="font-semibold text-sm leading-tight mt-2">
					{task.title}
				</h4>
				<p className="text-xs text-muted-foreground line-clamp-3 mt-1">
					{task.description}
				</p>
			</CardHeader>
			<CardContent className="p-4 pt-2 space-y-3">
				<div className="text-[10px] text-muted-foreground flex justify-between">
					<span>From: {task.source === 'whatsapp' ? 'WhatsApp' : 'Email'}</span>
					<span>{new Date(task.suggestedAt).toLocaleDateString()}</span>
				</div>
				<div className="flex gap-2">
					<Select value={selectedStage} onValueChange={setSelectedStage}>
						<SelectTrigger className="h-8 text-xs bg-white">
							<SelectValue placeholder="Add to Stage..." />
						</SelectTrigger>
						<SelectContent>
							{targetStages.map((stage) => (
								<SelectItem key={stage.id} value={stage.id}>
									{stage.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						size="sm"
						className="h-8 w-8 px-0 flex-shrink-0"
						disabled={!selectedStage}
						onClick={() => onAdd(task.id, selectedStage)}
						title="Add to Board"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
