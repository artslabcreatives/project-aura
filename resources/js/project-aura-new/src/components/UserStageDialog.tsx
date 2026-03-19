import { useState, useEffect } from "react";
import { Stage } from "@/types/stage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface UserStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (stage: Stage) => void;
  existingStages: Stage[];
  editStage?: Stage | null; // Optional: stage to edit
}

const colorOptions = [
  { value: "bg-gray-500", label: "Gray", class: "bg-gray-500" },
  { value: "bg-blue-500", label: "Blue", class: "bg-blue-500" },
  { value: "bg-green-500", label: "Green", class: "bg-green-500" },
  { value: "bg-red-500", label: "Red", class: "bg-red-500" },
  { value: "bg-orange-500", label: "Orange", class: "bg-orange-500" },
  { value: "bg-purple-500", label: "Purple", class: "bg-purple-500" },
  { value: "bg-yellow-500", label: "Yellow", class: "bg-yellow-500" },
  { value: "bg-pink-500", label: "Pink", class: "bg-pink-500" },
  { value: "bg-cyan-500", label: "Cyan", class: "bg-cyan-500" },
  { value: "bg-indigo-500", label: "Indigo", class: "bg-indigo-500" },
];

export function UserStageDialog({
  open,
  onOpenChange,
  onSave,
  existingStages,
  editStage,
}: UserStageDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    color: "bg-blue-500",
  });

  useEffect(() => {
    if (open) {
      if (editStage) {
        setFormData({
          title: editStage.title,
          color: editStage.color,
        });
      } else {
        setFormData({
          title: "",
          color: "bg-blue-500",
        });
      }
    }
  }, [open, editStage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.title.trim().length === 0) {
      toast({
        title: "Validation Error",
        description: "Stage title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const isDuplicate = existingStages.some(
      (stage) =>
        stage.title.toLowerCase() === formData.title.toLowerCase() &&
        stage.id !== editStage?.id
    );

    if (isDuplicate) {
      toast({
        title: "Validation Error",
        description: "A stage with this name already exists",
        variant: "destructive",
      });
      return;
    }

    const stageId = editStage
      ? editStage.id
      : formData.title.toLowerCase().replace(/\s+/g, "-");

    // Calculate order: insert between pending (0) and complete (last)
    const completeStage = existingStages.find(s => s.id === "complete");
    const order = editStage
      ? editStage.order
      : (completeStage ? completeStage.order : existingStages.length);

    onSave({
      id: stageId,
      title: formData.title,
      color: formData.color,
      type: "user",
      order,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editStage ? "Edit Stage" : "Create Custom Stage"}</DialogTitle>
            <DialogDescription>
              {editStage
                ? "Update your custom stage details."
                : "Add a custom stage between \"Pending\" and \"Complete\" to organize your tasks."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Stage Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., In Progress, Review, Testing"
                maxLength={30}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <Select
                value={formData.color}
                onValueChange={(value) =>
                  setFormData({ ...formData, color: value })
                }
              >
                <SelectTrigger id="color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${option.class}`}
                        />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editStage ? "Save Changes" : "Create Stage"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
