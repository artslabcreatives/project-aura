import { l as reactExports, v as useUser, F as useToast, j as jsxRuntimeExports, ay as ClipboardList, G as Search, I as Input, C as CircleAlert, Y as Badge, bU as LayoutDashboard, J as Dialog, K as DialogContent, N as DialogTitle, z as cn, B as Button, X, q as Check, A as ScrollArea, Q as Label, aE as History, L as LoaderCircle, aD as MessageSquare, M as DialogHeader, O as DialogDescription, ae as Textarea, U as DialogFooter, a as CircleCheck, aj as FileText } from "./index-C4ZP3eFM.js";
import { r as reportService } from "./reportService-DNtsOblX.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-DRavPKwG.js";
import { D as Download } from "./download-qf94484n.js";
import { f as format } from "./format-BDODTvac.js";
function ReportManagement() {
  const [reports, setReports] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [selectedReport, setSelectedReport] = reactExports.useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = reactExports.useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = reactExports.useState(false);
  const [approvalAction, setApprovalAction] = reactExports.useState("approve");
  const [comment, setComment] = reactExports.useState("");
  const [newComment, setNewComment] = reactExports.useState("");
  const [processing, setProcessing] = reactExports.useState(false);
  const { currentUser, activeRole } = useUser();
  const { toast } = useToast();
  reactExports.useEffect(() => {
    loadReports();
  }, []);
  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getReports();
      setReports(data);
    } catch (error) {
      console.error("Failed to load reports:", error);
      toast({ title: "Error", description: "Failed to load reports.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const filteredReports = reactExports.useMemo(() => {
    return reports.filter(
      (report) => report.title.toLowerCase().includes(searchQuery.toLowerCase()) || report.project?.name.toLowerCase().includes(searchQuery.toLowerCase()) || report.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reports, searchQuery]);
  const pendingMyApproval = reactExports.useMemo(() => {
    if (!currentUser) return [];
    return filteredReports.filter((report) => {
      if (activeRole === "team-lead") {
        return report.status === "submitted" && String(report.user?.department_id) === String(currentUser.department);
      }
      if (activeRole === "hr" || activeRole === "admin") {
        return report.status === "tl_approved";
      }
      if (activeRole === "user" || activeRole === "account-manager") {
        return (report.status === "submitted" || report.status === "tl_approved") && String(report.user_id) === String(currentUser.id);
      }
      return false;
    });
  }, [filteredReports, currentUser]);
  const handleAction = async () => {
    if (!selectedReport) return;
    if (approvalAction === "reject" && !comment) {
      toast({ title: "Required", description: "Comment is required for rejection.", variant: "destructive" });
      return;
    }
    try {
      setProcessing(true);
      const isHR = activeRole === "hr" || activeRole === "admin";
      const isTL = activeRole === "team-lead";
      if (approvalAction === "reject") {
        await reportService.reject(String(selectedReport.id), comment);
        toast({ title: "Rejected", description: "Report has been rejected." });
      } else {
        if (isHR) {
          await reportService.hrApprove(String(selectedReport.id), comment);
          toast({ title: "Approved", description: "Report has been given final approval." });
        } else if (isTL) {
          await reportService.tlApprove(String(selectedReport.id), comment);
          toast({ title: "Approved", description: "Report has been approved by Team Lead." });
        }
      }
      setIsApprovalOpen(false);
      setComment("");
      loadReports();
      if (isDetailsOpen) {
        const updated = await reportService.getReport(String(selectedReport.id));
        setSelectedReport(updated);
      }
    } catch (error) {
      console.error("Failed to process action:", error);
      toast({ title: "Error", description: "Failed to process approval.", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };
  const handleAddComment = async () => {
    if (!selectedReport || !newComment) return;
    try {
      setProcessing(true);
      await reportService.addComment(String(selectedReport.id), newComment);
      setNewComment("");
      const updated = await reportService.getReport(String(selectedReport.id));
      setSelectedReport(updated);
      loadReports();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setProcessing(false);
    }
  };
  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return { color: "bg-green-500", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 mr-1" }), label: "Approved" };
      case "tl_approved":
        return { color: "bg-indigo-500", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 mr-1" }), label: "Pending Review from HR" };
      case "submitted":
        return { color: "bg-blue-500", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 mr-1 animate-spin" }), label: "Pending Review From Team Lead" };
      case "rejected":
        return { color: "bg-red-500", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3 mr-1" }), label: "Rejected" };
      default:
        return { color: "bg-gray-500", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3 mr-1" }), label: "Draft" };
    }
  };
  const ReportTable = ({ data }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-3", children: "Report Details" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: "Project" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-4", children: "Status" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: "Date" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1 text-right", children: "Actions" })
    ] }),
    data.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "No reports found." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: data.map((report) => {
      const config = getStatusConfig(report.status);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors cursor-pointer", onClick: () => {
        setSelectedReport(report);
        setIsDetailsOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold truncate", children: report.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground truncate", children: [
              "by ",
              report.user?.name
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-sm truncate font-medium text-blue-600 dark:text-blue-400", children: report.project?.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: `${config.color} text-white whitespace-nowrap px-3 py-1 ring-1 ring-white/10`, children: [
          config.icon,
          config.label
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-xs text-muted-foreground", children: format(new Date(report.created_at), "MMM d, yyyy") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", asChild: true, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: report.file_url || "#", target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }) }) }) })
      ] }, report.id);
    }) })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-6 w-6 text-indigo-600" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Report Management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Approve and track project submission reports." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full md:w-72", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Search reports...",
            className: "pl-9",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value)
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "pending", className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "bg-muted/50 p-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "pending", className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
          "Pending Approval",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "ml-1 h-5 px-1.5", children: pendingMyApproval.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "all", className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "h-4 w-4" }),
          "All Reports"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "pending", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportTable, { data: pendingMyApproval }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "all", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReportTable, { data: filteredReports }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isDetailsOpen, onOpenChange: setIsDetailsOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "sm:max-w-[700px] max-h-[85vh] flex flex-col p-0", children: selectedReport && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 pb-4 border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-xl mb-1", children: selectedReport.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "by ",
                selectedReport.user?.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Project: ",
                selectedReport.project?.name
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: cn(getStatusConfig(selectedReport.status).color, "text-white"), children: getStatusConfig(selectedReport.status).label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "flex-1", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: selectedReport.file_url || "#", target: "_blank", rel: "noreferrer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-2" }),
            " Download Report"
          ] }) }),
          (activeRole === "team-lead" && selectedReport.status === "submitted" && String(selectedReport.user?.department_id) === String(currentUser?.department) || (activeRole === "hr" || activeRole === "admin") && selectedReport.status === "tl_approved") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-red-600 h-9", onClick: () => {
              setApprovalAction("reject");
              setIsApprovalOpen(true);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 mr-1" }),
              " Reject"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "bg-indigo-600 hover:bg-indigo-700 h-9", onClick: () => {
              setApprovalAction("approve");
              setIsApprovalOpen(true);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 mr-1" }),
              " Approve"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-8", children: [
        selectedReport.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm bg-muted/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-950", children: selectedReport.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-3 w-3" }),
            " History & Comments"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: selectedReport.activities?.map((activity) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative pl-6 pb-4 border-l-2 border-muted last:pb-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
              "absolute left-[-9px] top-0 h-4 w-4 rounded-full border-2 border-background",
              activity.activity_type === "status_change" ? "bg-indigo-500" : "bg-gray-400"
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: activity.user.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: format(new Date(activity.created_at), "MMM d, h:mm a") })
            ] }),
            activity.activity_type === "status_change" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] h-4 px-1 leading-none", children: activity.from_status || "Draft" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "→" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] h-4 px-1 leading-none border-indigo-200 text-indigo-600", children: activity.to_status })
            ] }),
            activity.comment && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-1 italic", children: [
              '"',
              activity.comment,
              '"'
            ] })
          ] }, activity.id)) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t bg-muted/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "Add a comment...",
            value: newComment,
            onChange: (e) => setNewComment(e.target.value),
            onKeyPress: (e) => e.key === "Enter" && handleAddComment()
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", disabled: !newComment || processing, onClick: handleAddComment, children: processing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-white" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4" }) })
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: isApprovalOpen, onOpenChange: setIsApprovalOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[400px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: cn(approvalAction === "approve" ? "text-green-600" : "text-red-600"), children: approvalAction === "approve" ? "Approve Report" : "Reject Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: approvalAction === "approve" ? "Add an optional comment for your approval." : "Please provide a reason for the rejection." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          placeholder: "Add your comments here...",
          value: comment,
          onChange: (e) => setComment(e.target.value),
          className: "min-h-[100px]"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setIsApprovalOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: approvalAction === "approve" ? "default" : "destructive",
            className: cn(approvalAction === "approve" ? "bg-green-600 hover:bg-green-700" : ""),
            onClick: handleAction,
            disabled: processing || approvalAction === "reject" && !comment,
            children: [
              processing && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-2" }),
              approvalAction === "approve" ? "Confirm Approval" : "Confirm Rejection"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  ReportManagement as default
};
