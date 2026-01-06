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
import { User } from "@/types/task";

import { SearchableSelect, SearchableOption } from "@/components/ui/searchable-select";
import { departmentService } from "@/services/departmentService";
import { Department } from "@/types/department";

interface StageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (stage: Omit<Stage, "order">) => void;
  editStage?: Stage | null;
  existingStages: Stage[];
  teamMembers: User[];
}

const colorOptions = [
  { value: "bg-slate-200", label: "Gray", hex: "#e2e8f0" },
  { value: "bg-blue-500", label: "Blue", hex: "#3b82f6" },
  { value: "bg-green-500", label: "Green", hex: "#22c55e" },
  { value: "bg-red-500", label: "Red", hex: "#ef4444" },
  { value: "bg-orange-500", label: "Orange", hex: "#f97316" },
  { value: "bg-purple-500", label: "Purple", hex: "#a855f7" },
  { value: "bg-slate-500", label: "Accent", hex: "#64748b" },
];

export function StageDialog({
  open,
  onOpenChange,
  onSave,
  editStage,
  existingStages,
  teamMembers,
}: StageDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    color: "bg-slate-200",
    mainResponsibleId: undefined as string | undefined,
    backupResponsibleId1: undefined as string | undefined,
    backupResponsibleId2: undefined as string | undefined,
  });
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    departmentService.getAll().then(setDepartments).catch(console.error);
  }, []);

  useEffect(() => {
    if (editStage) {
      setFormData({
        id: editStage.id,
        title: editStage.title,
        color: editStage.color,
        mainResponsibleId: editStage.mainResponsibleId,
        backupResponsibleId1: editStage.backupResponsibleId1,
        backupResponsibleId2: editStage.backupResponsibleId2,
      });
    } else {
      setFormData({
        id: "",
        title: "",
        color: "bg-slate-200",
        mainResponsibleId: undefined,
        backupResponsibleId1: undefined,
        backupResponsibleId2: undefined,
      });
    }
  }, [editStage, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate title
    if (formData.title.trim().length === 0) {
      toast({
        title: "Validation Error",
        description: "Stage title cannot be empty",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate titles
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
      ? formData.id
      : formData.title.toLowerCase().replace(/\s+/g, "-");

    onSave({
      id: stageId,
      title: formData.title,
      color: formData.color,
      type: "project",
      mainResponsibleId: formData.mainResponsibleId,
      backupResponsibleId1: formData.backupResponsibleId1,
      backupResponsibleId2: formData.backupResponsibleId2,
    });
    onOpenChange(false);
  };

  const memberOptions: SearchableOption[] = teamMembers.map(member => {
    const deptName = departments.find(d => d.id === member.department)?.name || "Other";
    return {
      value: member.id,
      label: member.name,
      group: deptName
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editStage ? "Edit Stage" : "Create New Stage"}
            </DialogTitle>
            <DialogDescription>
              {editStage
                ? "Update the stage details below."
                : "Add a new stage to your kanban board."}
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
                placeholder="e.g., Review, Testing"
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
                          className={`h-3 w-3 rounded-full ${option.value}`}
                        />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="main-responsible">Main Responsible</Label>
              <SearchableSelect
                value={formData.mainResponsibleId}
                onValueChange={(value) =>
                  setFormData({ ...formData, mainResponsibleId: value })
                }
                options={memberOptions.filter(o => o.value !== formData.backupResponsibleId1 && o.value !== formData.backupResponsibleId2)}
                placeholder="Select main responsible"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="backup1-responsible">Backup Responsible 1</Label>
              <SearchableSelect
                value={formData.backupResponsibleId1}
                onValueChange={(value) =>
                  setFormData({ ...formData, backupResponsibleId1: value })
                }
                options={memberOptions.filter(o => o.value !== formData.mainResponsibleId && o.value !== formData.backupResponsibleId2)}
                placeholder="Select backup responsible 1"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="backup2-responsible">Backup Responsible 2</Label>
              <SearchableSelect
                value={formData.backupResponsibleId2}
                onValueChange={(value) =>
                  setFormData({ ...formData, backupResponsibleId2: value })
                }
                options={memberOptions.filter(o => o.value !== formData.mainResponsibleId && o.value !== formData.backupResponsibleId1)}
                placeholder="Select backup responsible 2"
              />
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
