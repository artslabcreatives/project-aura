import { ad as createLucideIcon, b as api, l as reactExports, j as jsxRuntimeExports, J as Dialog, K as DialogContent, M as DialogHeader, N as DialogTitle, z as cn, B as Button, L as LoaderCircle, aj as FileText, a2 as Trash2, A as ScrollArea, U as DialogFooter, aI as ue, aJ as RefreshCw, aK as LogOut, P as Plus, s as ChevronRight, aC as Mail, aL as Archive, aM as Inbox, F as useToast } from "./index-C4ZP3eFM.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-5_9pbgKs.js";
import { S as Send } from "./send-C-kJJjyu.js";
import { B as Bold, I as Italic, L as List, a as ListOrdered } from "./list-CgjYpKvJ.js";
import { L as Link } from "./link-CjUUS0B-.js";
import { P as Paperclip } from "./paperclip-DDW-rwXv.js";
import { A as ArrowLeft } from "./arrow-left-84kdjEmA.js";
import { L as Link2 } from "./link-2-qOcW-qoJ.js";
import { C as Calendar } from "./calendar-B2-LyEnc.js";
import { f as format } from "./format-BDODTvac.js";
import { C as ChevronLeft } from "./chevron-left-zAeTltYW.js";
import { F as Folder } from "./folder-BURaer1R.js";
import { C as CircleCheckBig } from "./circle-check-big-Cwck6DPV.js";
import { C as CircleX } from "./circle-x-BkjZsnQk.js";
const Forward = createLucideIcon("Forward", [
  ["polyline", { points: "15 17 20 12 15 7", key: "1w3sku" }],
  ["path", { d: "M4 18v-2a4 4 0 0 1 4-4h12", key: "jmiej9" }]
]);
const Reply = createLucideIcon("Reply", [
  ["polyline", { points: "9 17 4 12 9 7", key: "hvgpf2" }],
  ["path", { d: "M20 18v-2a4 4 0 0 0-4-4H4", key: "5vmcpk" }]
]);
const Type = createLucideIcon("Type", [
  ["polyline", { points: "4 7 4 4 20 4 20 7", key: "1nosan" }],
  ["line", { x1: "9", x2: "15", y1: "20", y2: "20", key: "swin9y" }],
  ["line", { x1: "12", x2: "12", y1: "4", y2: "20", key: "1tx1rr" }]
]);
const Underline = createLucideIcon("Underline", [
  ["path", { d: "M6 4v6a6 6 0 0 0 12 0V4", key: "9kb039" }],
  ["line", { x1: "4", x2: "20", y1: "20", y2: "20", key: "nun2al" }]
]);
const zohoService = {
  getAuthUrl: async () => {
    const response = await api.get("/zoho/auth-url");
    return response.data;
  },
  getStatus: async () => {
    const response = await api.get("/zoho/status");
    return response.data;
  },
  getFolders: async (accountId) => {
    const response = await api.get("/zoho/folders", {
      params: { account_id: accountId }
    });
    return response.data;
  },
  getMessages: async (folderId, params = {}) => {
    const response = await api.get(`/zoho/folders/${folderId}/messages`, {
      params
    });
    return response.data;
  },
  getMessageContent: async (folderId, messageId) => {
    const response = await api.get(`/zoho/folders/${folderId}/messages/${messageId}/content`);
    return response.data;
  },
  sendMessage: async (data) => {
    const response = await api.post("/zoho/messages", data);
    return response.data;
  },
  deleteMessage: async (folderId, messageId) => {
    const response = await api.delete(`/zoho/folders/${folderId}/messages/${messageId}`);
    return response.data;
  },
  uploadAttachment: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/zoho/messages/attachments", formData);
    return response.data;
  },
  handleCallback: async (code) => {
    const response = await api.get("/zoho/callback", {
      params: { code }
    });
    return response.data;
  },
  unlinkZoho: async () => {
    const response = await api.post("/zoho/unlink");
    return response.data;
  }
};
const ComposeEmailDialog = ({
  open,
  onOpenChange,
  onSuccess,
  initialData
}) => {
  const [loading, setLoading] = reactExports.useState(false);
  const [uploadingFile, setUploadingFile] = reactExports.useState(false);
  const [showCc, setShowCc] = reactExports.useState(false);
  const [showBcc, setShowBcc] = reactExports.useState(false);
  const [fromAddress, setFromAddress] = reactExports.useState("");
  const [attachments, setAttachments] = reactExports.useState([]);
  const contentRef = reactExports.useRef(null);
  const fileInputRef = reactExports.useRef(null);
  const [formData, setFormData] = reactExports.useState({
    toAddress: "",
    ccAddress: "",
    bccAddress: "",
    subject: ""
  });
  reactExports.useEffect(() => {
    if (open) {
      fetchStatus();
      if (initialData) {
        setFormData({
          toAddress: initialData.toAddress || "",
          ccAddress: "",
          bccAddress: "",
          subject: initialData.subject || ""
        });
        if (contentRef.current && initialData.content) {
          contentRef.current.innerHTML = initialData.content;
        }
      }
    }
  }, [open, initialData]);
  const fetchStatus = async () => {
    try {
      const status = await zohoService.getStatus();
      if (status.accounts && status.accounts.length > 0) {
        setFromAddress(status.accounts[0].accountAddress);
      }
    } catch (error) {
      console.error("Failed to fetch zoom status", error);
    }
  };
  const execCommand = (command, value = void 0) => {
    document.execCommand(command, false, value);
    if (contentRef.current) {
      contentRef.current.focus();
    }
  };
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const response = await zohoService.uploadAttachment(file);
      if (response.attachment) {
        setAttachments((prev) => [...prev, {
          ...response.attachment,
          size: file.size
        }]);
        ue.success(`File "${file.name}" uploaded`);
      }
    } catch (error) {
      console.error("Upload failed", error);
      ue.error(`Failed to upload "${file.name}"`);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSend = async () => {
    if (!formData.toAddress) {
      ue.error("Please enter a recipient");
      return;
    }
    const htmlContent = contentRef.current?.innerHTML || "";
    if (!htmlContent.trim() || htmlContent === "<br>") {
      ue.error("Please enter a message");
      return;
    }
    setLoading(true);
    try {
      await zohoService.sendMessage({
        toAddress: formData.toAddress,
        ccAddress: formData.ccAddress,
        bccAddress: formData.bccAddress,
        subject: formData.subject,
        content: htmlContent,
        mailFormat: "html",
        attachments: attachments.map(({ storeName, attachmentName, attachmentPath }) => ({
          storeName,
          attachmentName,
          attachmentPath
        }))
      });
      ue.success("Email sent successfully!");
      onOpenChange(false);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to send email", error);
      ue.error("Failed to send email. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setFormData({ toAddress: "", ccAddress: "", bccAddress: "", subject: "" });
    setAttachments([]);
    setShowCc(false);
    setShowBcc(false);
    if (contentRef.current) contentRef.current.innerHTML = "";
  };
  const addLink = () => {
    const url = prompt("Enter the URL:");
    if (url) execCommand("createLink", url);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "sm:max-w-[1200px] h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-none shadow-2xl",
      onPointerDownOutside: (e) => e.preventDefault(),
      onEscapeKeyDown: (e) => e.preventDefault(),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "p-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0 text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2 text-lg font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 p-1.5 rounded-lg text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) }),
          "New Message"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-hidden flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-1 bg-muted/10 border-b", children: [
            fromAddress && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center py-1.5 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-12 text-muted-foreground", children: "From" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground px-2 py-0.5 bg-muted rounded border border-muted-foreground/10", children: fromAddress })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-b border-transparent hover:border-muted-foreground/20 focus-within:border-primary/50 transition-colors py-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-12 text-sm text-muted-foreground", children: "To" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  className: "flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 px-2 outline-none",
                  placeholder: "recipient@example.com",
                  value: formData.toAddress,
                  onChange: (e) => setFormData({ ...formData, toAddress: e.target.value })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setShowCc(!showCc),
                    className: cn("text-xs font-semibold hover:text-primary transition-colors", showCc ? "text-primary" : "text-muted-foreground"),
                    children: "Cc"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setShowBcc(!showBcc),
                    className: cn("text-xs font-semibold hover:text-primary transition-colors", showBcc ? "text-primary" : "text-muted-foreground"),
                    children: "Bcc"
                  }
                )
              ] })
            ] }),
            showCc && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-b border-transparent hover:border-muted-foreground/20 focus-within:border-primary/50 transition-colors py-1 animate-in slide-in-from-top-1 duration-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-12 text-sm text-muted-foreground", children: "Cc" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  className: "flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 px-2 outline-none",
                  placeholder: "Cc recipients",
                  value: formData.ccAddress,
                  onChange: (e) => setFormData({ ...formData, ccAddress: e.target.value })
                }
              )
            ] }),
            showBcc && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-b border-transparent hover:border-muted-foreground/20 focus-within:border-primary/50 transition-colors py-1 animate-in slide-in-from-top-1 duration-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-12 text-sm text-muted-foreground", children: "Bcc" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  className: "flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 px-2 outline-none",
                  placeholder: "Bcc recipients",
                  value: formData.bccAddress,
                  onChange: (e) => setFormData({ ...formData, bccAddress: e.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-b border-transparent hover:border-muted-foreground/20 focus-within:border-primary/50 transition-colors py-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-12 text-sm text-muted-foreground", children: "Subject" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  className: "flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-1 px-2 outline-none",
                  placeholder: "Enter subject",
                  value: formData.subject,
                  onChange: (e) => setFormData({ ...formData, subject: e.target.value })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 p-2 bg-muted/20 border-b overflow-x-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => execCommand("bold"), title: "Bold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bold, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => execCommand("italic"), title: "Italic", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Italic, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => execCommand("underline"), title: "Underline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Underline, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-4 bg-muted-foreground/20 mx-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => execCommand("insertUnorderedList"), title: "Bullet List", children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => execCommand("insertOrderedList"), title: "Numbered List", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListOrdered, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-4 bg-muted-foreground/20 mx-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: addLink, title: "Insert Link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => execCommand("removeFormat"), title: "Clear Formatting", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Type, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-4 bg-muted-foreground/20 mx-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: () => fileInputRef.current?.click(), title: "Attach File", disabled: uploadingFile, children: uploadingFile ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                ref: fileInputRef,
                className: "hidden",
                onChange: handleFileUpload
              }
            )
          ] }),
          attachments.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 flex flex-wrap gap-2 border-b bg-muted/5", children: attachments.map((file, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-muted px-2 py-1 rounded border border-muted-foreground/10 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-[150px] truncate font-medium", children: file.attachmentName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeAttachment(index), className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
          ] }, index)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1 p-4 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              ref: contentRef,
              contentEditable: true,
              className: "min-h-[300px] outline-none prose prose-sm dark:prose-invert max-w-none text-foreground",
              onKeyDown: (e) => {
                if (e.key === "Tab") {
                  e.preventDefault();
                  document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
                }
              }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "p-4 border-t bg-muted/30 flex flex-row items-center justify-between sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                onClick: () => onOpenChange(false),
                disabled: loading,
                className: "text-muted-foreground hover:text-foreground",
                children: "Discard"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                onClick: handleSend,
                disabled: loading || uploadingFile,
                className: "gap-2 px-6 shadow-lg shadow-primary/20",
                children: [
                  loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
                  "Send Now"
                ]
              }
            )
          ] })
        ] })
      ]
    }
  ) });
};
const EmailDetailView = ({ folderId, messageId, onBack }) => {
  const [content, setContent] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [deleting, setDeleting] = reactExports.useState(false);
  const [composeOpen, setComposeOpen] = reactExports.useState(false);
  const [composeInitialData, setComposeInitialData] = reactExports.useState(null);
  reactExports.useEffect(() => {
    fetchContent();
  }, [messageId]);
  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await zohoService.getMessageContent(folderId, messageId);
      setContent(response.content);
    } catch (error) {
      console.error("Failed to fetch email content", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this email?")) return;
    setDeleting(true);
    try {
      await zohoService.deleteMessage(folderId, messageId);
      ue.success("Email deleted successfully");
      onBack();
    } catch (error) {
      console.error("Failed to delete email", error);
      ue.error("Failed to delete email");
    } finally {
      setDeleting(false);
    }
  };
  const handleReply = () => {
    setComposeInitialData({
      toAddress: content.fromAddress || content.sender,
      subject: content.subject.startsWith("Re:") ? content.subject : `Re: ${content.subject}`,
      content: `<br><br>--- Original Message ---<br>From: ${content.sender}<br>Sent: ${format(new Date(parseInt(content.receivedTime?.toString().substring(0, 13))), "PPPP 'at' p")}<br>Subject: ${content.subject}<br><br>${content.content}`
    });
    setComposeOpen(true);
  };
  const handleForward = () => {
    setComposeInitialData({
      toAddress: "",
      subject: content.subject.startsWith("Fwd:") ? content.subject : `Fwd: ${content.subject}`,
      content: `<br><br>--- Forwarded Message ---<br>From: ${content.sender}<br>Sent: ${format(new Date(parseInt(content.receivedTime?.toString().substring(0, 13))), "PPPP 'at' p")}<br>Subject: ${content.subject}<br><br>${content.content}`
    });
    setComposeOpen(true);
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full p-8 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Loading email content..." })
    ] });
  }
  if (!content) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full p-8 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-8 w-8 mb-4 cursor-pointer hover:text-primary transition-colors", onClick: onBack }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Failed to load email content." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "mt-4", onClick: fetchContent, children: "Try Again" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full bg-background rounded-lg border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b flex items-center justify-between bg-muted/30 sticky top-0 z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: onBack, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2", onClick: handleReply, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Reply, { className: "h-4 w-4" }),
              " Reply"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2", onClick: handleForward, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Forward, { className: "h-4 w-4" }),
              " Forward"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "gap-2 text-destructive hover:text-destructive hover:bg-destructive/10",
                onClick: handleDelete,
                disabled: deleting,
                children: [
                  deleting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
                  "Delete"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-4 w-4" }),
          " Link to Project"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 max-w-4xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold leading-tight", children: content.subject }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-y-4 justify-between items-start border-y py-4 border-muted/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold", children: content.senderName?.[0] || content.sender?.[0] || content.fromAddress?.[0] || "U" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: content.senderName || content.sender || "Unknown Sender" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: content.fromAddress || content.sender })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: (() => {
                try {
                  let timeStr = content.receivedTime?.toString();
                  if (!timeStr) return "Unknown date";
                  if (timeStr.length > 13) timeStr = timeStr.substring(0, 13);
                  const timestamp = parseInt(timeStr);
                  if (isNaN(timestamp)) return "Unknown date";
                  return format(new Date(timestamp), "MMMM d, yyyy 'at' h:mm a");
                } catch (e) {
                  return "Unknown date";
                }
              })() })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose prose-sm dark:prose-invert max-w-none", children: content.content ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "email-content",
            dangerouslySetInnerHTML: { __html: content.content }
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground italic", children: "No content found for this message." }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ComposeEmailDialog,
      {
        open: composeOpen,
        onOpenChange: setComposeOpen,
        initialData: composeInitialData
      }
    )
  ] });
};
const EmailInbox = () => {
  const [folders, setFolders] = reactExports.useState([]);
  const [messages, setMessages] = reactExports.useState([]);
  const [selectedFolder, setSelectedFolder] = reactExports.useState(null);
  const [selectedMessageId, setSelectedMessageId] = reactExports.useState(null);
  const [loadingFolders, setLoadingFolders] = reactExports.useState(true);
  const [loadingMessages, setLoadingMessages] = reactExports.useState(false);
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const [isComposeOpen, setIsComposeOpen] = reactExports.useState(false);
  const [unlinking, setUnlinking] = reactExports.useState(false);
  const pageSize = 50;
  reactExports.useEffect(() => {
    fetchFolders();
  }, []);
  const handleUnlink = async () => {
    if (!confirm("Are you sure you want to disconnect your Zoho account? You will need to re-authenticate to view your emails.")) return;
    setUnlinking(true);
    try {
      await zohoService.unlinkZoho();
      ue.success("Zoho account disconnected");
      window.location.reload();
    } catch (error) {
      console.error("Failed to unlink Zoho", error);
      ue.error("Failed to disconnect Zoho");
    } finally {
      setUnlinking(false);
    }
  };
  const fetchFolders = async () => {
    try {
      const { folders: folders2 } = await zohoService.getFolders();
      setFolders(folders2 || []);
      if (folders2 && folders2.length > 0 && !selectedFolder) {
        handleFolderSelect(folders2[0].folderId);
      }
    } catch (error) {
      console.error("Failed to fetch folders", error);
    } finally {
      setLoadingFolders(false);
    }
  };
  const handleFolderSelect = async (folderId) => {
    setSelectedFolder(folderId);
    setSelectedMessageId(null);
    setCurrentPage(1);
    fetchMessages(folderId, 1);
  };
  const fetchMessages = async (folderId, page) => {
    setLoadingMessages(true);
    try {
      const start = (page - 1) * pageSize + 1;
      const { messages: messages2 } = await zohoService.getMessages(folderId, { start, limit: pageSize });
      setMessages(messages2 || []);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoadingMessages(false);
    }
  };
  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchMessages(selectedFolder, nextPage);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchMessages(selectedFolder, prevPage);
    }
  };
  const getFolderIcon = (name) => {
    switch (name.toLowerCase()) {
      case "inbox":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { className: "h-4 w-4" });
      case "sent":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" });
      case "archive":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "h-4 w-4" });
      case "trash":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { className: "h-4 w-4" });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-[calc(100vh-200px)] gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-64 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-lg", children: "Mailbox" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: fetchFolders, disabled: loadingFolders, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("h-4 w-4", loadingFolders && "animate-spin") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: handleUnlink, disabled: unlinking, className: "text-destructive hover:text-destructive hover:bg-destructive/10", title: "Unlink Zoho", children: unlinking ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 space-y-1", children: folders && folders.map((folder) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => handleFolderSelect(folder.folderId),
          className: cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            selectedFolder === folder.folderId ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          ),
          children: [
            getFolderIcon(folder.folderName),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-left", children: folder.folderName }),
            folder.unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
              "text-[10px] px-1.5 py-0.5 rounded-full",
              selectedFolder === folder.folderId ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
            ), children: folder.unreadCount })
          ]
        },
        folder.folderId
      )) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t mt-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full gap-2", onClick: () => setIsComposeOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Compose"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: selectedMessageId ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmailDetailView,
      {
        folderId: selectedFolder || "",
        messageId: selectedMessageId,
        onBack: () => {
          setSelectedMessageId(null);
          if (selectedFolder) fetchMessages(selectedFolder, currentPage);
        }
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "h-full flex flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-lg", children: folders.find((f) => f.folderId === selectedFolder)?.folderName || "Messages" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          messages.length,
          " messages"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1", children: loadingMessages ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : messages.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y flex-1", children: messages.map((message) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            onClick: () => setSelectedMessageId(message.messageId),
            className: "p-4 hover:bg-muted/50 cursor-pointer transition-colors group relative",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-primary", children: message.sender }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground whitespace-nowrap ml-2", children: (() => {
                  try {
                    let timeStr = message.receivedTime?.toString();
                    if (!timeStr) return "";
                    if (timeStr.length > 13) timeStr = timeStr.substring(0, 13);
                    const timestamp = parseInt(timeStr);
                    if (isNaN(timestamp)) return "";
                    return format(new Date(timestamp), "MMM d, h:mm a");
                  } catch (e) {
                    return "";
                  }
                })() })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-1 line-clamp-1", children: message.subject }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: message.summary }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" })
            ]
          },
          message.messageId
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t flex items-center justify-between sticky bottom-0 bg-background z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: handlePrevPage,
              disabled: currentPage === 1 || loadingMessages,
              className: "gap-1",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
                " Previous"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-medium", children: [
            "Page ",
            currentPage
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: handleNextPage,
              disabled: messages.length < pageSize || loadingMessages,
              className: "gap-1",
              children: [
                "Next ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
              ]
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-64 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-12 w-12 mb-2 opacity-20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No messages in this folder." })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ComposeEmailDialog,
      {
        open: isComposeOpen,
        onOpenChange: setIsComposeOpen
      }
    )
  ] });
};
const ZohoMailSettings = () => {
  const [status, setStatus] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [connecting, setConnecting] = reactExports.useState(false);
  const { toast } = useToast();
  reactExports.useEffect(() => {
    fetchStatus();
  }, []);
  const fetchStatus = async () => {
    try {
      const data = await zohoService.getStatus();
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch Zoho status", error);
    } finally {
      setLoading(false);
    }
  };
  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { url } = await zohoService.getAuthUrl();
      window.location.href = url;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize Zoho connection.",
        variant: "destructive"
      });
      setConnecting(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-6 w-6 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Zoho Mail Integration" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Connect your Zoho Mail account to sync emails with projects and tasks." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: status?.connected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-green-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
          "Connected to ",
          status.email
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Your Zoho Mail account is successfully linked. You can now view and manage emails within the platform." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", className: "text-destructive border-destructive hover:bg-destructive/10", children: "Disconnect Account" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Not Connected" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Linking your Zoho Mail account allows you to track communications, resolve issues, and stay synchronized with your team directly from Aura." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleConnect, disabled: connecting, children: [
        connecting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        "Connect Zoho Mail"
      ] })
    ] }) })
  ] });
};
const Emails = () => {
  const [connected, setConnected] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const checkStatus = async () => {
      try {
        const { connected: connected2 } = await zohoService.getStatus();
        setConnected(connected2);
      } catch (error) {
        console.error("Failed to check Zoho status", error);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto p-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Email Communication" }) }),
    connected ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmailInbox, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl mx-auto mt-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZohoMailSettings, {}) })
  ] });
};
export {
  Emails as default
};
