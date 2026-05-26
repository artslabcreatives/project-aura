import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task } from "@/types/task";
import { Stage } from "@/types/stage";
import { AlertTriangle, Zap } from "lucide-react";

interface EarlyStartDialogProps {
  task: Task;
  stages: Stage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (stageId: string) => void;
  isLoading?: boolean;
}

export function EarlyStartDialog({
  task,
  stages,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: EarlyStartDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>("");

  // Filter stages based on requirements:
  // - Exclude review stages (isReviewStage: true)
  // - Exclude completion/archive stages (based on title)
  // - Exclude current stage (Pending)
  const availableStages = stages.filter((stage) => {
    const title = stage.title.toLowerCase();
    const isPending = title === "pending" || title === "backlog";
    const isComplete = title.includes("complete") || title.includes("archive") || title.includes("done");
    const isSuggested = title.includes("suggested");
    
    return !stage.isReviewStage && !isPending && !isComplete && !isSuggested;
  });

  const handleConfirm = () => {
    if (acknowledged && selectedStageId) {
      onConfirm(selectedStageId);
    }
  };

  const resetState = () => {
    setAcknowledged(false);
    setSelectedStageId("");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) resetState();
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle>Early Task Start</DialogTitle>
          </div>
          <DialogDescription className="text-amber-700 dark:text-amber-400 font-medium">
            Project: {task.project}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Before proceeding, please inform your team lead or authorized person that you are going to start this task early.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
            />
            <Label
              htmlFor="acknowledge"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have informed my team lead or authorized person.
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage" className="text-sm font-medium">
              Select Start Stage
            </Label>
            <Select
              value={selectedStageId}
              onValueChange={setSelectedStageId}
            >
              <SelectTrigger id="stage" className="w-full">
                <SelectValue placeholder="Choose a stage..." />
              </SelectTrigger>
              <SelectContent>
                {availableStages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!acknowledged || !selectedStageId || isLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isLoading ? "Starting..." : "Early Start"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
