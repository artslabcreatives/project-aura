import { F as useToast, l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, ba as UserPlus, O as DialogDescription, Q as Label, Y as Badge, z as cn, X, G as Search, I as Input, A as ScrollArea, $ as Avatar, a0 as AvatarFallback, U as DialogFooter, B as Button, L as LoaderCircle, ax as api } from "./index-C4ZP3eFM.js";
import { C as Checkbox } from "./checkbox-qHm_4cmk.js";
import "./index-D6Uc8srH.js";
function InviteUsersDialog({
  open,
  onOpenChange,
  project,
  allUsers,
  onUpdate
}) {
  const { toast } = useToast();
  const [selectedUserIds, setSelectedUserIds] = reactExports.useState([]);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [currentCollaborators, setCurrentCollaborators] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (open && project) {
      setSelectedUserIds([]);
      setSearchQuery("");
      setCurrentCollaborators(project.collaborators || []);
    }
  }, [open, project]);
  if (!project) return null;
  const existingCollaboratorIds = new Set(currentCollaborators.map((c) => String(c.id)));
  const availableUsers = allUsers.filter((user) => {
    if (user.is_active === false) return false;
    if (existingCollaboratorIds.has(String(user.id))) return false;
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });
  const handleToggleUser = (userId) => {
    setSelectedUserIds(
      (prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };
  const handleInvite = async () => {
    if (selectedUserIds.length === 0) return;
    setIsLoading(true);
    try {
      const response = await api.post(`/projects/${project.id}/collaborators`, {
        user_ids: selectedUserIds.map((id) => parseInt(id, 10))
      });
      setCurrentCollaborators(response.collaborators);
      onUpdate({
        ...project,
        collaborators: response.collaborators
      });
      toast({
        title: "Users invited",
        description: `${selectedUserIds.length} user(s) added to the project.`
      });
      setSelectedUserIds([]);
    } catch (error) {
      console.error("Failed to invite users:", error);
      toast({
        title: "Error",
        description: "Failed to invite users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleRemoveCollaborator = async (userId) => {
    setIsLoading(true);
    try {
      const response = await api.delete(`/projects/${project.id}/collaborators/${userId}`);
      setCurrentCollaborators(response.collaborators);
      onUpdate({
        ...project,
        collaborators: response.collaborators
      });
      toast({
        title: "Collaborator removed"
      });
    } catch (error) {
      console.error("Failed to remove collaborator:", error);
      toast({
        title: "Error",
        description: "Failed to remove collaborator.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-5 w-5" }),
        "Invite Users"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
        "Add collaborators to ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: project.name }),
        ". They will see this project in their sidebar."
      ] })
    ] }),
    currentCollaborators.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-medium", children: "Current Collaborators" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: currentCollaborators.map((collaborator) => {
        const user = allUsers.find((u) => String(u.id) === String(collaborator.id));
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Badge,
          {
            variant: "secondary",
            className: "flex items-center gap-1 py-1 px-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: collaborator.name }),
              user && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
                "text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-normal capitalize",
                user.role === "admin" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : user.role === "team-lead" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : user.role === "account-manager" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              ), children: user.role?.replace("-", " ") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => handleRemoveCollaborator(collaborator.id),
                  className: "ml-1 hover:text-destructive focus:outline-none",
                  disabled: isLoading,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
                }
              )
            ]
          },
          collaborator.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Search users...",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          className: "pl-9"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-64 border rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 space-y-1", children: availableUsers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-8 text-sm", children: searchQuery ? "No users found" : "All users are already collaborators" }) : availableUsers.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "label",
      {
        className: "flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer group",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              checked: selectedUserIds.includes(user.id),
              onCheckedChange: () => handleToggleUser(user.id)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-8 w-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-xs", children: getInitials(user.name) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: user.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-normal capitalize",
                user.role === "admin" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : user.role === "team-lead" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : user.role === "account-manager" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              ), children: user.role?.replace("-", " ") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: user.email })
          ] })
        ]
      },
      user.id
    )) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: handleInvite,
          disabled: selectedUserIds.length === 0 || isLoading,
          children: [
            isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
            "Invite ",
            selectedUserIds.length > 0 && `(${selectedUserIds.length})`
          ]
        }
      )
    ] })
  ] }) });
}
export {
  InviteUsersDialog
};
