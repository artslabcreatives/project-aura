import { v as useUser, F as useToast, l as reactExports, j as jsxRuntimeExports, S as Skeleton, $ as Avatar, bh as AvatarImage, a0 as AvatarFallback, bi as Camera, Y as Badge, aB as Building2, ag as User, Q as Label, aC as Mail, bj as Shield, T as TrendingUp, E as departmentService, D as userService } from "./index-C4ZP3eFM.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-5_9pbgKs.js";
import { T as TaskEfficiencyDashboard } from "./TaskEfficiencyDashboard-CqftGdSJ.js";
import { B as Briefcase } from "./briefcase-CJBZhMcz.js";
import { C as Calendar } from "./calendar-B2-LyEnc.js";
import { f as format } from "./format-BDODTvac.js";
import { p as parseISO } from "./parseISO-BZpuPkuQ.js";
import "./efficiencyService-BCS2n9DI.js";
import "./clock-C-1UQMq-.js";
import "./trending-down-DJZzQmVx.js";
function Profile() {
  const { currentUser, refreshUser } = useUser();
  const { toast } = useToast();
  const [departmentName, setDepartmentName] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(true);
  const [uploading, setUploading] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const fetchDepartment = async () => {
      if (currentUser?.department) {
        try {
          const depts = await departmentService.getAll();
          const dept = depts.find((d) => d.id === currentUser.department);
          if (dept) setDepartmentName(dept.name);
        } catch (error) {
          console.error("Failed to fetch department", error);
        }
      }
      setLoading(false);
    };
    fetchDepartment();
  }, [currentUser]);
  if (!currentUser) return null;
  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  const handleAvatarClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;
    setUploading(true);
    try {
      await userService.uploadAvatar(currentUser.id, file);
      await refreshUser();
      toast({
        title: "Success",
        description: "Profile picture updated successfully."
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 rounded-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-48" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-primary/90 via-primary to-primary/70 shadow-xl text-primary-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group cursor-pointer", onClick: handleAvatarClick, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: `h-32 w-32 border-4 border-white/20 shadow-2xl transition-all ${uploading ? "opacity-50" : "group-hover:opacity-90"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: currentUser.avatar, alt: currentUser.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-4xl font-bold bg-white text-primary", children: getInitials(currentUser.name) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-8 w-8 text-white" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              ref: fileInputRef,
              className: "hidden",
              accept: "image/*",
              onChange: handleFileChange,
              disabled: uploading
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-center md:text-left pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: currentUser.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-center md:justify-start gap-3 text-primary-foreground/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "px-3 py-1 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "mr-2 h-3.5 w-3.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: currentUser.role.replace("-", " ") })
            ] }),
            departmentName && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "px-3 py-1 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "mr-2 h-3.5 w-3.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                departmentName,
                " Department"
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-5 w-5 text-primary" }),
            "Personal Information"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Your personal contact details." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Email Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg border bg-muted/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: currentUser.email })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg border bg-muted/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium capitalize", children: currentUser.role.replace("-", " ") })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "h-5 w-5 text-primary" }),
            "Work Details"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Department and employment information." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Department" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg border bg-muted/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: departmentName || "Unassigned" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Account Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-green-700 dark:text-green-400", children: "Active" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-muted-foreground", children: "Member Since" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg border bg-muted/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: currentUser.createdAt ? format(parseISO(currentUser.createdAt), "MMMM yyyy") : "Not available" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5 text-primary" }),
          "Task Efficiency"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Your performance metrics and task completion efficiency." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TaskEfficiencyDashboard, { userId: currentUser.id }) })
    ] })
  ] });
}
export {
  Profile as default
};
