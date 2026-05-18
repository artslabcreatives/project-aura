import { l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, B as Button, P as Plus, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription, a8 as AlertDialogFooter, a9 as AlertDialogCancel, aa as AlertDialogAction, v as useUser, z as cn, a1 as Pencil, a2 as Trash2 } from "./index-C4ZP3eFM.js";
import { u as useSensors, a as useSensor, s as sortableKeyboardCoordinates, K as KeyboardSensor, P as PointerSensor, D as DndContext, c as closestCenter, S as SortableContext, v as verticalListSortingStrategy, b as arrayMove, d as useSortable, C as CSS, G as GripVertical } from "./sortable.esm-JHVIV_qM.js";
function SortableStageRow({ stage, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: stage.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: setNodeRef,
      style,
      className: "flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ...attributes, ...listeners, className: "cursor-grab text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-4 w-4 rounded-full flex-shrink-0", stage.color) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium truncate", children: stage.title }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => onEdit(stage), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive hover:text-destructive", onClick: () => onDelete(stage.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ]
    }
  );
}
function FixedStageRow({ stage }) {
  const { currentUser, activeRole } = useUser();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg border bg-muted/50 text-muted-foreground opacity-80", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4" }),
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-4 w-4 rounded-full flex-shrink-0", stage.color) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium truncate", children: [
      stage.title.toLowerCase().trim() === "pending" ? "Backlog" : stage.title,
      " (System)"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[72px]" })
  ] });
}
function StageManagement({
  open,
  onOpenChange,
  stages,
  onAddStage,
  onEditStage,
  onDeleteStage,
  onReorderStages
}) {
  const [deleteStageId, setDeleteStageId] = reactExports.useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  const { topStages, middleStages, bottomStages } = reactExports.useMemo(() => {
    const top = [];
    const bot = [];
    const mid = [];
    stages.forEach((s) => {
      const t = s.title?.toLowerCase().trim();
      if (!t) return;
      if (t === "suggested" || t === "suggested task" || t === "pending") {
        top.push(s);
      } else if (t === "completed" || t === "complete" || t === "archive") {
        bot.push(s);
      } else {
        mid.push(s);
      }
    });
    top.sort((a, b) => {
      const getP = (s) => s.includes("suggested") ? 0 : 1;
      return getP(a.title.toLowerCase()) - getP(b.title.toLowerCase());
    });
    bot.sort((a, b) => {
      const getP = (s) => s.includes("archive") ? 1 : 0;
      return getP(a.title.toLowerCase()) - getP(b.title.toLowerCase());
    });
    return { topStages: top, middleStages: mid, bottomStages: bot };
  }, [stages]);
  const handleDragEnd = (event) => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Manage Stages" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Add, edit, or remove stages for your kanban board." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-4 max-h-[60vh] overflow-y-auto", children: [
        topStages.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(FixedStageRow, { stage: s }, s.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DndContext,
          {
            sensors,
            collisionDetection: closestCenter,
            onDragEnd: handleDragEnd,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              SortableContext,
              {
                items: middleStages.map((s) => s.id),
                strategy: verticalListSortingStrategy,
                children: middleStages.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  SortableStageRow,
                  {
                    stage: s,
                    onEdit: onEditStage,
                    onDelete: (id) => setDeleteStageId(id)
                  },
                  s.id
                ))
              }
            )
          }
        ),
        bottomStages.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(FixedStageRow, { stage: s }, s.id)),
        stages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No stages yet." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onAddStage, className: "w-full gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        "Add New Stage"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!deleteStageId, onOpenChange: (open2) => !open2 && setDeleteStageId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Stage" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Are you sure you want to delete this stage? Tasks in this stage will need to be moved to another stage." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDelete, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete" })
      ] })
    ] }) })
  ] });
}
export {
  StageManagement as S
};
