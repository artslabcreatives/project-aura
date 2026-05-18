import { v as useUser, l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, O as DialogDescription, Q as Label, I as Input, B as Button, P as Plus, U as DialogFooter, F as useToast, u as useNavigate, S as Skeleton, V as Collapsible, W as CollapsibleTrigger, Y as Badge, Z as ChevronDown, _ as CollapsibleContent, $ as Avatar, a0 as AvatarFallback, a1 as Pencil, a2 as Trash2, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription, a8 as AlertDialogFooter, a9 as AlertDialogCancel, aa as AlertDialogAction, D as userService, E as departmentService } from "./index-C4ZP3eFM.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./card-5_9pbgKs.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import "./index-D6Uc8srH.js";
function TeamDialog({
  open,
  onOpenChange,
  onSave,
  editUser,
  departments,
  onAddDepartment,
  currentUser
}) {
  const { activeRole } = useUser();
  const [formData, setFormData] = reactExports.useState({
    name: "",
    email: "",
    department: "",
    role: "user"
  });
  reactExports.useEffect(() => {
    if (editUser) {
      setFormData({
        name: editUser.name,
        email: editUser.email,
        department: editUser.department,
        role: editUser.role
      });
    } else {
      if (activeRole === "team-lead" || activeRole === "account-manager") {
        setFormData({
          name: "",
          email: "",
          department: currentUser.department,
          role: "user"
        });
      } else {
        setFormData({
          name: "",
          email: "",
          department: "",
          role: "user"
        });
      }
    }
  }, [editUser, open, currentUser]);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data on Submit:", formData);
    onSave({
      ...formData
    });
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "sm:max-w-[425px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editUser ? "Edit Team Member" : "Add New Team Member" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editUser ? "Edit the details of the team member." : "Add a new member to your team." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "name",
            value: formData.name,
            onChange: (e) => setFormData({ ...formData, name: e.target.value }),
            placeholder: "John Doe",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "email",
            type: "email",
            value: formData.email,
            onChange: (e) => setFormData({ ...formData, email: e.target.value }),
            placeholder: "john.doe@example.com",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "department", children: "Department" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: formData.department,
              onValueChange: (value) => setFormData({ ...formData, department: value }),
              required: true,
              disabled: activeRole === "team-lead" || activeRole === "account-manager",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "department", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select department" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: departments.map((dep) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: dep.id, children: dep.name }, dep.id)) })
              ]
            }
          ),
          activeRole === "admin" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", size: "icon", onClick: onAddDepartment, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
        ] }),
        (activeRole === "team-lead" || activeRole === "account-manager") && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Team members will be added to your department" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "role", children: "Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: formData.role,
            onValueChange: (value) => setFormData({ ...formData, role: value }),
            required: true,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "role", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select role" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "user", children: "User" }),
                activeRole === "admin" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "team-lead", children: "Team Lead" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "account-manager", children: "Account Manager" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "admin", children: "Admin" })
                ] })
              ] })
            ]
          }
        ),
        (activeRole === "team-lead" || activeRole === "account-manager") && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Only users can be added by team leads" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: editUser ? "Save Changes" : "Add Member" })
    ] })
  ] }) }) });
}
function DepartmentDialog({
  open,
  onOpenChange,
  onSave,
  existingDepartments
}) {
  const [name, setName] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Department name is required");
      return;
    }
    if (existingDepartments.some((dep) => dep.toLowerCase() === name.toLowerCase())) {
      setError("This department already exists");
      return;
    }
    onSave(name);
    onOpenChange(false);
    setName("");
    setError("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "sm:max-w-[425px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Create New Department" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Add a new department to the list." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", children: "Department Name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "name",
          value: name,
          onChange: (e) => setName(e.target.value),
          placeholder: "e.g. Engineering"
        }
      ),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: error })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", children: "Save" })
    ] })
  ] }) }) });
}
function Team() {
  const [teamMembers, setTeamMembers] = reactExports.useState([]);
  const [departments, setDepartments] = reactExports.useState([]);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = reactExports.useState(false);
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = reactExports.useState(false);
  const [editingUser, setEditingUser] = reactExports.useState(null);
  const [userToDelete, setUserToDelete] = reactExports.useState(null);
  const [expandedDepartments, setExpandedDepartments] = reactExports.useState(/* @__PURE__ */ new Set());
  const { toast } = useToast();
  const [loading, setLoading] = reactExports.useState(true);
  const { currentUser, activeRole } = useUser();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [usersData, departmentsData] = await Promise.all([
          userService.getAll(),
          departmentService.getAll()
        ]);
        const activeMembers = usersData.filter(
          (user) => user.is_active !== false && user.email !== "system@artslabcreatives.com" && user.email !== "systemadmin@artslabcreatives.com"
        );
        setTeamMembers(activeMembers);
        setDepartments(departmentsData);
        setExpandedDepartments(new Set(departmentsData.map((d) => d.id).concat(["uncategorized"])));
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load team data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const handleTeamMemberSave = async (userData) => {
    try {
      if (editingUser) {
        const updatedUser = await userService.update(editingUser.id, userData);
        const updatedTeamMembers = teamMembers.map(
          (member) => member.id === editingUser.id ? updatedUser : member
        );
        setTeamMembers(updatedTeamMembers);
        toast({
          title: "Team member updated",
          description: `${userData.name} has been updated successfully.`
        });
        setEditingUser(null);
      } else {
        const newMember = await userService.create(userData);
        const updatedTeamMembers = [...teamMembers, newMember];
        setTeamMembers(updatedTeamMembers);
        toast({
          title: "Team member added",
          description: `${newMember.name} has been added to the team.`
        });
      }
    } catch (error) {
      console.error("Error saving team member:", error);
      toast({
        title: "Error",
        description: "Failed to save team member. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsTeamDialogOpen(true);
  };
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await userService.delete(userToDelete.id);
      const updatedTeamMembers = teamMembers.filter((member) => member.id !== userToDelete.id);
      setTeamMembers(updatedTeamMembers);
      toast({
        title: "Team member deleted",
        description: `${userToDelete.name} has been removed from the team.`,
        variant: "destructive"
      });
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast({
        title: "Error",
        description: "Failed to delete team member. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleDepartmentSave = async (name) => {
    try {
      const newDepartment = await departmentService.create({ name });
      const updatedDepartments = [...departments, newDepartment];
      setDepartments(updatedDepartments);
      toast({ title: "Department created", description: `${newDepartment.name} has been created.` });
    } catch (error) {
      console.error("Error creating department:", error);
      toast({
        title: "Error",
        description: "Failed to create department. Please try again.",
        variant: "destructive"
      });
    }
  };
  const getInitials = (name) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };
  const getDepartmentName = (departmentId) => {
    return departments.find((dep) => dep.id === departmentId)?.name || "N/A";
  };
  const toggleDepartmentExpanded = (departmentId) => {
    setExpandedDepartments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(departmentId)) {
        newSet.delete(departmentId);
      } else {
        newSet.add(departmentId);
      }
      return newSet;
    });
  };
  const teamMembersByDepartment = reactExports.useMemo(() => {
    const grouped = teamMembers.reduce((acc, member) => {
      const deptId = member.department || "uncategorized";
      const deptName = getDepartmentName(deptId);
      if (!acc[deptId]) {
        acc[deptId] = {
          id: deptId,
          name: deptName,
          members: []
        };
      }
      acc[deptId].members.push(member);
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => {
      if (a.id === "uncategorized") return 1;
      if (b.id === "uncategorized") return -1;
      return a.name.localeCompare(b.name);
    });
  }, [teamMembers, getDepartmentName]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-32" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-64" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-40" })
      ] }),
      [1, 2].map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-32" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-20 rounded-full" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border flex-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-5" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: [1, 2, 3].map((member) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-card text-card-foreground shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 flex flex-row items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-12 rounded-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-32" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-48" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 pt-0 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-24 rounded-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-16" })
          ] })
        ] }, member)) })
      ] }, group))
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Team" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: activeRole === "admin" || activeRole === "hr" ? "View and manage team members across all departments" : "View team members in your department and their task progress" })
      ] }),
      (activeRole === "admin" || activeRole === "team-lead" || activeRole === "account-manager") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setIsTeamDialogOpen(true), className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        "Add Team Member"
      ] })
    ] }),
    teamMembersByDepartment.map((departmentGroup) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Collapsible,
      {
        open: expandedDepartments.has(departmentGroup.id),
        onOpenChange: () => toggleDepartmentExpanded(departmentGroup.id),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold group-hover:text-primary transition-colors", children: departmentGroup.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
                departmentGroup.members.length,
                " members"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border flex-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ChevronDown,
              {
                className: `h-5 w-5 transition-transform ${expandedDepartments.has(departmentGroup.id) ? "rotate-0" : "-rotate-90"}`
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: departmentGroup.members.map((member) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "hover:shadow-md transition-shadow group relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "h-12 w-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "bg-primary text-primary-foreground", children: getInitials(member.name) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  CardTitle,
                  {
                    className: "text-base hover:text-primary cursor-pointer transition-colors",
                    onClick: () => navigate(`/tasks/filter/today-workload?userId=${member.id}`),
                    children: member.name
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: member.email })
              ] }),
              (activeRole === "admin" || (activeRole === "team-lead" || activeRole === "account-manager") && member.department === currentUser.department) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "opacity-0 group-hover:opacity-100 transition-opacity flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-8 w-8",
                    onClick: () => handleEditUser(member),
                    title: "Edit member",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-8 w-8 text-destructive hover:text-destructive",
                    onClick: () => setUserToDelete(member),
                    title: "Delete member",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                  }
                )
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: member.role }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors flex items-center gap-2",
                  onClick: () => navigate(`/tasks/filter/today-workload?userId=${member.id}`),
                  children: [
                    member.todayTaskCount || 0,
                    " tasks today"
                  ]
                }
              )
            ] }) })
          ] }, member.id)) }) })
        ] })
      },
      departmentGroup.id
    )),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TeamDialog,
      {
        open: isTeamDialogOpen,
        onOpenChange: (open) => {
          setIsTeamDialogOpen(open);
          if (!open) setEditingUser(null);
        },
        onSave: handleTeamMemberSave,
        editUser: editingUser,
        departments,
        onAddDepartment: () => setIsDepartmentDialogOpen(true),
        currentUser
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DepartmentDialog,
      {
        open: isDepartmentDialogOpen,
        onOpenChange: setIsDepartmentDialogOpen,
        onSave: handleDepartmentSave,
        existingDepartments: departments.map((d) => d.name)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!userToDelete, onOpenChange: (open) => !open && setUserToDelete(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Team Member" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'Are you sure you want to delete "',
          userToDelete?.name,
          '"? This action cannot be undone.'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDeleteUser, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete" })
      ] })
    ] }) })
  ] });
}
export {
  Team as default
};
