import { l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, Q as Label, aS as Popover, aT as PopoverTrigger, B as Button, aU as PopoverContent, bL as Command, bM as CommandInput, bZ as CommandList, bN as CommandEmpty, bO as CommandGroup, bP as CommandItem, q as Check, z as cn, a1 as Pencil, a2 as Trash2, P as Plus, I as Input, U as DialogFooter, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription, a8 as AlertDialogFooter, a9 as AlertDialogCancel, aa as AlertDialogAction } from "./index-C4ZP3eFM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { C as ChevronsUpDown } from "./chevrons-up-down-DISs2Pfx.js";
import { F as Folder } from "./folder-BURaer1R.js";
import "./index-D6Uc8srH.js";
function AssignGroupDialog({
  open,
  onOpenChange,
  project,
  availableGroups,
  onAssign,
  onUpdateGroup,
  onDeleteGroup
}) {
  const [selectedGroupId, setSelectedGroupId] = reactExports.useState("none");
  const [newGroupName, setNewGroupName] = reactExports.useState("");
  const [newGroupParentId, setNewGroupParentId] = reactExports.useState("none");
  const [isSubmitting, setIsSubmitting] = reactExports.useState(false);
  const [comboboxOpen, setComboboxOpen] = reactExports.useState(false);
  const [groupToEdit, setGroupToEdit] = reactExports.useState(null);
  const [editGroupName, setEditGroupName] = reactExports.useState("");
  const [groupToDelete, setGroupToDelete] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (open && project) {
      setSelectedGroupId(project.group?.id || "none");
      setNewGroupName("");
      setNewGroupParentId("none");
    }
  }, [open, project]);
  const handleSave = async () => {
    if (!project) return;
    setIsSubmitting(true);
    try {
      await onAssign(
        project,
        selectedGroupId === "none" || selectedGroupId === "new" ? null : selectedGroupId,
        selectedGroupId === "new" ? newGroupName : void 0,
        selectedGroupId === "new" && newGroupParentId !== "none" ? newGroupParentId : void 0
      );
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEditSave = async () => {
    if (!groupToEdit || !onUpdateGroup) return;
    try {
      await onUpdateGroup(groupToEdit.id, editGroupName);
      setGroupToEdit(null);
      setEditGroupName("");
    } catch (error) {
      console.error(error);
    }
  };
  const handleDeleteConfirm = async () => {
    if (!groupToDelete || !onDeleteGroup) return;
    try {
      await onDeleteGroup(groupToDelete.id);
      if (selectedGroupId === groupToDelete.id) {
        setSelectedGroupId("none");
      }
      setGroupToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };
  if (!project) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Organize ",
          project.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          "Assign this project to a group within the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: project.department?.name || "Unknown" }),
          " department."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "group", children: "Project Group" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover, { open: comboboxOpen, onOpenChange: setComboboxOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                role: "combobox",
                "aria-expanded": comboboxOpen,
                className: "w-full justify-between font-normal",
                children: [
                  selectedGroupId === "none" ? "No Group (Uncategorized)" : selectedGroupId === "new" ? `+ Create New Group${newGroupName ? `: ${newGroupName}` : ""}` : availableGroups.find((g) => g.id === selectedGroupId)?.name || "Select group...",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Command, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CommandInput, { placeholder: "Search group..." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CommandEmpty, { children: "No group found." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandGroup, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CommandItem,
                    {
                      value: "none",
                      onSelect: () => {
                        setSelectedGroupId("none");
                        setComboboxOpen(false);
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Check,
                          {
                            className: cn(
                              "mr-2 h-4 w-4",
                              selectedGroupId === "none" ? "opacity-100" : "opacity-0"
                            )
                          }
                        ),
                        "No Group (Uncategorized)"
                      ]
                    }
                  ),
                  availableGroups.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CommandItem,
                    {
                      value: group.name,
                      onSelect: () => {
                        setSelectedGroupId(group.id);
                        setComboboxOpen(false);
                      },
                      className: "group flex items-center justify-between",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Check,
                            {
                              className: cn(
                                "mr-2 h-4 w-4",
                                selectedGroupId === group.id ? "opacity-100" : "opacity-0"
                              )
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "mr-2 h-4 w-4 text-muted-foreground" }),
                          group.name
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                          onUpdateGroup && /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              variant: "ghost",
                              size: "icon",
                              className: "h-6 w-6",
                              onClick: (e) => {
                                e.stopPropagation();
                                setGroupToEdit(group);
                                setEditGroupName(group.name);
                              },
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" })
                            }
                          ),
                          onDeleteGroup && /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Button,
                            {
                              variant: "ghost",
                              size: "icon",
                              className: "h-6 w-6 text-destructive hover:text-destructive",
                              onClick: (e) => {
                                e.stopPropagation();
                                setGroupToDelete(group);
                              },
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
                            }
                          )
                        ] })
                      ]
                    },
                    group.id
                  )),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    CommandItem,
                    {
                      value: "new",
                      onSelect: () => {
                        setSelectedGroupId("new");
                        setComboboxOpen(false);
                      },
                      className: "font-medium text-primary",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
                        "Create New Group"
                      ]
                    }
                  )
                ] })
              ] })
            ] }) })
          ] })
        ] }),
        selectedGroupId === "new" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 animate-in fade-in slide-in-from-top-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "new-group-name", children: "New Group Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "new-group-name",
                value: newGroupName,
                onChange: (e) => setNewGroupName(e.target.value),
                placeholder: "e.g. Marketing Campaign Q1",
                autoFocus: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 animate-in fade-in slide-in-from-top-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "parent-group", children: "Parent Group (Optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: newGroupParentId,
                onValueChange: (value) => setNewGroupParentId(value),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a parent group" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "none", children: "No Parent (Root Group)" }),
                    availableGroups.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g.id, children: g.name }, g.id))
                  ] })
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), disabled: isSubmitting, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleSave,
            disabled: isSubmitting || selectedGroupId === "new" && !newGroupName.trim(),
            children: isSubmitting ? "Saving..." : "Save Changes"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!groupToEdit, onOpenChange: (open2) => !open2 && setGroupToEdit(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "Edit Group: ",
          groupToEdit?.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Rename the group." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "edit-group-name", children: "Group Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "edit-group-name",
            value: editGroupName,
            onChange: (e) => setEditGroupName(e.target.value),
            className: "mt-2"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setGroupToEdit(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleEditSave, disabled: !editGroupName.trim(), children: "Save" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!groupToDelete, onOpenChange: (open2) => !open2 && setGroupToDelete(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Group?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'Are you sure you want to delete the group "',
          groupToDelete?.name,
          '"? ',
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "If this group has projects assigned, you must unassign them first."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDeleteConfirm, className: "bg-destructive hover:bg-destructive/90", children: "Delete" })
      ] })
    ] }) })
  ] });
}
export {
  AssignGroupDialog
};
