import { b as api, l as reactExports, F as useToast, v as useUser, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, Q as Label, I as Input, U as DialogFooter, B as Button, L as LoaderCircle, aH as uploadManager, af as Upload, aj as FileText, Y as Badge, al as Eye, a2 as Trash2, ag as User, a3 as AlertDialog, a4 as AlertDialogContent, a5 as AlertDialogHeader, a6 as AlertDialogTitle, a7 as AlertDialogDescription, a8 as AlertDialogFooter, a9 as AlertDialogCancel, aa as AlertDialogAction, X } from "./index-C4ZP3eFM.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-5_9pbgKs.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-DRavPKwG.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Beq9iUV3.js";
import { C as CloudUpload } from "./cloud-upload-CSttdRmy.js";
import { C as CircleCheckBig } from "./circle-check-big-Cwck6DPV.js";
import { C as Clock } from "./clock-C-1UQMq-.js";
import { P as Play } from "./play-BwxbIHvy.js";
import { D as Download } from "./download-qf94484n.js";
import { C as CircleX } from "./circle-x-BkjZsnQk.js";
import "./index-D6Uc8srH.js";
const documentService = {
  list: async (status = "approved") => {
    const response = await api.get(`/documents?status=${status}`);
    return response.data;
  },
  upload: async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("department_id", String(data.department_id));
    if (data.upload_key) formData.append("upload_key", data.upload_key);
    if (data.file) formData.append("file", data.file);
    const response = await api.post("/documents", formData);
    return response.data;
  },
  approve: async (id) => {
    const response = await api.post(`/documents/${id}/approve`);
    return response.data;
  },
  reject: async (id, reason) => {
    const response = await api.post(`/documents/${id}/reject`, { reason });
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/documents/${id}`);
  },
  download: async (id, mode = "download") => {
    const response = await api.get(`/documents/${id}/download?mode=${mode}`);
    return response.data;
  }
};
function DocumentUploadDialog({
  open,
  onOpenChange,
  onSuccess
}) {
  const [name, setName] = reactExports.useState("");
  const [departmentId, setDepartmentId] = reactExports.useState("");
  const [file, setFile] = reactExports.useState(null);
  const [departments, setDepartments] = reactExports.useState([]);
  const [isUploading, setIsUploading] = reactExports.useState(false);
  const { toast } = useToast();
  const { currentUser } = useUser();
  const isRestricted = ["user", "account-manager"].includes(currentUser?.role || "");
  reactExports.useEffect(() => {
    if (open && currentUser) {
      fetchDepartments();
      if (isRestricted && currentUser.department) {
        setDepartmentId(String(currentUser.department));
      }
    }
  }, [open, isRestricted, currentUser]);
  const fetchDepartments = async () => {
    try {
      const { data } = await api.get("/departments");
      setDepartments(data);
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };
  const handleUpload = async () => {
    if (!name || !departmentId || !file) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select a file.",
        variant: "destructive"
      });
      return;
    }
    setIsUploading(true);
    try {
      await uploadManager.uploadDocument({
        name,
        departmentId: parseInt(departmentId),
        file
      });
      toast({
        title: "Upload started",
        description: "Your document is being uploaded in the background."
      });
      onSuccess();
      onOpenChange(false);
      setName("");
      setDepartmentId("");
      setFile(null);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-[425px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Upload Document" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "doc-name", children: "Document Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "doc-name",
            value: name,
            onChange: (e) => setName(e.target.value),
            placeholder: "Enter document name"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "doc-dept", children: "Department" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: departmentId,
            onValueChange: setDepartmentId,
            disabled: isRestricted && !!departmentId,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { id: "doc-dept", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select department" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: departments.map((dept) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(dept.id), children: dept.name }, dept.id)) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "doc-file", children: "File" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors",
            onClick: () => document.getElementById("doc-file")?.click(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUpload, { className: "h-8 w-8 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: file ? file.name : "Click to select or drag and drop" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "doc-file",
                  type: "file",
                  className: "hidden",
                  onChange: handleFileChange
                }
              )
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleUpload, disabled: isUploading, children: [
        isUploading && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Upload"
      ] })
    ] })
  ] }) });
}
function Documents() {
  const { currentUser: user } = useUser();
  const [activeTab, setActiveTab] = reactExports.useState("approved");
  const [groupedDocs, setGroupedDocs] = reactExports.useState({});
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isUploadOpen, setIsUploadOpen] = reactExports.useState(false);
  const [docToDelete, setDocToDelete] = reactExports.useState(null);
  const [viewingDoc, setViewingDoc] = reactExports.useState(null);
  const { toast } = useToast();
  const isVideo = (name) => {
    const ext = name.split(".").pop()?.toLowerCase();
    return ["mp4", "webm", "ogg", "mov", "m4v"].includes(ext || "");
  };
  const isImage = (name) => {
    const ext = name.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
  };
  const isApprover = ["admin", "hr", "team-lead"].includes(user?.role || "");
  reactExports.useEffect(() => {
    fetchDocuments();
    const handleUploaded = () => fetchDocuments();
    window.addEventListener("aura:document-uploaded", handleUploaded);
    return () => window.removeEventListener("aura:document-uploaded", handleUploaded);
  }, [activeTab]);
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await documentService.list(activeTab);
      setGroupedDocs(data);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleApprove = async (docId) => {
    try {
      await documentService.approve(docId);
      toast({ title: "Document approved" });
      fetchDocuments();
    } catch (error) {
      toast({ title: "Approval failed", variant: "destructive" });
    }
  };
  const handleReject = async (docId) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    try {
      await documentService.reject(docId, reason || "No reason provided");
      toast({ title: "Document rejected" });
      fetchDocuments();
    } catch (error) {
      toast({ title: "Rejection failed", variant: "destructive" });
    }
  };
  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      await documentService.delete(docToDelete.id);
      toast({ title: "Document deleted" });
      fetchDocuments();
    } catch (error) {
      toast({ title: "Deletion failed", variant: "destructive" });
    } finally {
      setDocToDelete(null);
    }
  };
  const handleDownload = async (docId, name) => {
    try {
      const { url } = await documentService.download(docId, "download");
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };
  const handleView = async (doc) => {
    if (isImage(doc.name) || isVideo(doc.name)) {
      try {
        const { url } = await documentService.download(doc.id, "view");
        setViewingDoc({ ...doc, url });
      } catch (error) {
        toast({ title: "Could not open viewer", variant: "destructive" });
      }
      return;
    }
    try {
      const { url } = await documentService.download(doc.id, "view");
      window.open(url, "_blank");
    } catch (error) {
      toast({ title: "Could not open viewer", variant: "destructive" });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto py-8 space-y-8 animate-in fade-in duration-500", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Documents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Manage departmental documents and approvals." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setIsUploadOpen(true), className: "gap-2 shadow-lg hover:shadow-xl transition-all", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
        "Upload Document"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: (v) => setActiveTab(v), className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "bg-muted/50 p-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "approved", className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4" }),
          "Approved"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "pending", className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
          "Pending"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: activeTab, className: "space-y-8", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "animate-pulse", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-40 bg-muted rounded-t-lg" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-2/3 bg-muted rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-1/2 bg-muted rounded" })
        ] })
      ] }, i)) }) : Object.keys(groupedDocs).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/20 rounded-2xl border-2 border-dashed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-background rounded-full shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-12 w-12 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: "No documents found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Documents in this category will appear here." })
        ] })
      ] }) : Object.entries(groupedDocs).map(([deptName, docs]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-lg px-3 py-1 bg-primary/5 text-primary border-primary/20", children: deptName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground font-normal", children: [
            "(",
            docs.length,
            " ",
            docs.length === 1 ? "document" : "documents",
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: docs.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "group hover:shadow-md transition-all border-muted/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 bg-primary/5 rounded-lg text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-6 w-6" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    title: "View Document",
                    onClick: () => handleView(doc),
                    children: isVideo(doc.name) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    title: "Download",
                    onClick: () => handleDownload(doc.id, doc.name),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" })
                  }
                ),
                (String(doc.uploaded_by) === String(user?.id) || user?.role === "admin") && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "text-destructive hover:text-destructive hover:bg-destructive/10",
                    onClick: () => setDocToDelete(doc),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "mt-2 text-lg truncate", title: doc.name, children: doc.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { className: "flex items-center gap-1 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }),
              "Uploaded by ",
              doc.uploader?.name || "Unknown"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: new Date(doc.created_at).toLocaleDateString() }),
            activeTab === "pending" && isApprover && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2 border-t", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  className: "flex-1 gap-1 bg-green-600 hover:bg-green-700",
                  onClick: () => handleApprove(doc.id),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3 w-3" }),
                    "Approve"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "flex-1 gap-1 text-destructive hover:bg-destructive/5",
                  onClick: () => handleReject(doc.id),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" }),
                    "Reject"
                  ]
                }
              )
            ] }),
            doc.status === "rejected" && doc.rejection_reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 bg-destructive/5 rounded border border-destructive/20 text-xs text-destructive", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Rejected:" }),
              " ",
              doc.rejection_reason
            ] })
          ] }) })
        ] }, doc.id)) })
      ] }, deptName)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DocumentUploadDialog,
      {
        open: isUploadOpen,
        onOpenChange: setIsUploadOpen,
        onSuccess: fetchDocuments
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialog, { open: !!docToDelete, onOpenChange: (o) => !o && setDocToDelete(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Document" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
          'Are you sure you want to delete "',
          docToDelete?.name,
          '"? This action cannot be undone.'
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: handleDelete, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewingDoc, onOpenChange: (open) => !open && setViewingDoc(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { hideCloseButton: true, className: "sm:max-w-[800px] p-0 overflow-hidden bg-black/90 border-none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "sr-only", children: "Document Viewer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "absolute top-2 right-2 z-10 text-white hover:bg-white/20",
            onClick: () => setViewingDoc(null),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center min-h-[400px]", children: [
          viewingDoc && isImage(viewingDoc.name) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: viewingDoc.url,
              alt: viewingDoc.name,
              className: "max-w-full max-h-[80vh] object-contain"
            }
          ),
          viewingDoc && isVideo(viewingDoc.name) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "video",
            {
              src: viewingDoc.url,
              controls: true,
              autoPlay: true,
              className: "max-w-full max-h-[80vh]"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-black/50 backdrop-blur-sm text-white flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate pr-4", children: viewingDoc?.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "bg-transparent border-white/20 text-white hover:bg-white/10", onClick: () => handleDownload(viewingDoc?.id, viewingDoc?.name), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-2" }),
            "Download"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Documents as default
};
