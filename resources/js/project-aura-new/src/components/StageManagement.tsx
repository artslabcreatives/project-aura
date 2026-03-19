import { Stage } from "@/types/stage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUser } from "@/hooks/use-user";

interface StageManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: Stage[];
  onAddStage: () => void;
  onEditStage: (stage: Stage) => void;
  onDeleteStage: (stageId: string) => void;
  onReorderStages?: (stages: Stage[]) => void;
}

function SortableStageRow({ stage, onEdit, onDelete }: { stage: Stage; onEdit: (s: Stage) => void; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className={cn("h-4 w-4 rounded-full flex-shrink-0", stage.color)} />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{stage.title}</p>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(stage)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(stage.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}



function FixedStageRow({ stage }: { stage: Stage }) {
  const { currentUser } = useUser();

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 text-muted-foreground opacity-80">
      <div className="w-4" /> {/* Spacer for grip */}
      <div className={cn("h-4 w-4 rounded-full flex-shrink-0", stage.color)} />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {stage.title === "Pending" && (currentUser?.role === 'admin' || currentUser?.role === 'team-lead')
            ? "Backlog"
            : stage.title} (System)
        </p>
      </div>
      {/* No actions for system stages */}
      <div className="w-[72px]" />
    </div>
  );
}

export function StageManagement({
  open,
  onOpenChange,
  stages,
  onAddStage,
  onEditStage,
  onDeleteStage,
  onReorderStages,
}: StageManagementProps) {
  const [deleteStageId, setDeleteStageId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Split stages
  const { topStages, middleStages, bottomStages } = useMemo(() => {
    const top: Stage[] = [];
    const bot: Stage[] = [];
    const mid: Stage[] = [];

    stages.forEach(s => {
      const t = s.title?.toLowerCase().trim();
      if (!t) return;
      if (t === 'suggested' || t === 'suggested task' || t === 'pending') {
        top.push(s);
      } else if (t === 'completed' || t === 'complete' || t === 'archive') {
        bot.push(s);
      } else {
        mid.push(s);
      }
    });

    // Ensure internal sort of Fixed stages
    top.sort((a, b) => {
      const getP = (s: string) => (s.includes('suggested') ? 0 : 1);
      return getP(a.title.toLowerCase()) - getP(b.title.toLowerCase());
    });

    bot.sort((a, b) => {
      const getP = (s: string) => (s.includes('archive') ? 1 : 0);
      return getP(a.title.toLowerCase()) - getP(b.title.toLowerCase());
    });

    return { topStages: top, middleStages: mid, bottomStages: bot };
  }, [stages]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && onReorderStages) {
      const oldIndex = middleStages.findIndex((s) => s.id === active.id);
      const newIndex = middleStages.findIndex((s) => s.id === over?.id);

      const newMiddle = arrayMove(middleStages, oldIndex, newIndex);
      const newAllStages = [...topStages, ...newMiddle, ...bottomStages];

      onReorderStages(newAllStages);
    }
  };

  const handleDelete = () => {
    if (deleteStageId) {
      onDeleteStage(deleteStageId);
      setDeleteStageId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Stages</DialogTitle>
            <DialogDescription>
              Add, edit, or remove stages for your kanban board.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto">
            {topStages.map(s => <FixedStageRow key={s.id} stage={s} />)}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={middleStages.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {middleStages.map(s => (
                  <SortableStageRow
                    key={s.id}
                    stage={s}
                    onEdit={onEditStage}
                    onDelete={(id) => setDeleteStageId(id)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {bottomStages.map(s => <FixedStageRow key={s.id} stage={s} />)}

            {stages.length === 0 && <div className="text-center py-8 text-muted-foreground">No stages yet.</div>}
          </div>

          <Button onClick={onAddStage} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add New Stage
          </Button>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteStageId} onOpenChange={(open) => !open && setDeleteStageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this stage? Tasks in this stage will need to be moved to another stage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
