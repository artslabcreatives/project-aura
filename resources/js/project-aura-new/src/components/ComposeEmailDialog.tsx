import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zohoService } from "@/services/zohoService";
import { 
  Loader2, 
  Send, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Type, 
  Maximize2, 
  X,
  ChevronDown,
  ChevronUp,
  Paperclip,
  FileText,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Attachment {
  storeName: string;
  attachmentName: string;
  attachmentPath: string;
  size?: number;
}

interface ComposeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: {
    toAddress?: string;
    subject?: string;
    content?: string;
  };
}

export const ComposeEmailDialog: React.FC<ComposeEmailDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [fromAddress, setFromAddress] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    toAddress: "",
    ccAddress: "",
    bccAddress: "",
    subject: "",
  });

  useEffect(() => {
    if (open) {
      fetchStatus();
      if (initialData) {
        setFormData({
          toAddress: initialData.toAddress || "",
          ccAddress: "",
          bccAddress: "",
          subject: initialData.subject || "",
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

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (contentRef.current) {
        contentRef.current.focus();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const response = await zohoService.uploadAttachment(file);
      if (response.attachment) {
        setAttachments(prev => [...prev, {
          ...response.attachment,
          size: file.size
        }]);
        toast.success(`File "${file.name}" uploaded`);
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error(`Failed to upload "${file.name}"`);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!formData.toAddress) {
      toast.error("Please enter a recipient");
      return;
    }

    const htmlContent = contentRef.current?.innerHTML || "";
    if (!htmlContent.trim() || htmlContent === "<br>") {
        toast.error("Please enter a message");
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
      toast.success("Email sent successfully!");
      onOpenChange(false);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to send email", error);
      toast.error("Failed to send email. Please try again.");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[1200px] h-[90vh] flex flex-col p-0 overflow-hidden bg-background border-none shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
              <Send className="h-4 w-4" />
            </div>
            New Message
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Header Fields */}
          <div className="p-4 space-y-1 bg-muted/10 border-b">
            {fromAddress && (
                <div className="flex items-center py-1.5 text-xs">
                    <span className="w-12 text-muted-foreground">From</span>
                    <span className="font-medium text-foreground px-2 py-0.5 bg-muted rounded border border-muted-foreground/10">{fromAddress}</span>
                </div>
            )}
            
            <div className="flex items-center border-b border-transparent hover:border-muted-foreground/20 focus-within:border-primary/50 transition-colors py-1">
              <span className="w-12 text-sm text-muted-foreground">To</span>
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 px-2 outline-none"
                placeholder="recipient@example.com"
                value={formData.toAddress}
                onChange={(e) => setFormData({ ...formData, toAddress: e.target.value })}
              />
              <div className="flex items-center gap-2 px-2">
                <button 
                    onClick={() => setShowCc(!showCc)} 
                    className={cn("text-xs font-semibold hover:text-primary transition-colors", showCc ? "text-primary" : "text-muted-foreground")}
                >
                    Cc
                </button>
                <button 
                    onClick={() => setShowBcc(!showBcc)} 
                    className={cn("text-xs font-semibold hover:text-primary transition-colors", showBcc ? "text-primary" : "text-muted-foreground")}
                >
                    Bcc
                </button>
              </div>
            </div>

            {showCc && (
                <div className="flex items-center border-b border-transparent hover:border-muted-foreground/20 focus-within:border-primary/50 transition-colors py-1 animate-in slide-in-from-top-1 duration-200">
                    <span className="w-12 text-sm text-muted-foreground">Cc</span>
                    <input
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 px-2 outline-none"
                        placeholder="Cc recipients"
                        value={formData.ccAddress}
                        onChange={(e) => setFormData({ ...formData, ccAddress: e.target.value })}
                    />
                </div>
            )}

            {showBcc && (
                <div className="flex items-center border-b border-transparent hover:border-muted-foreground/20 focus-within:border-primary/50 transition-colors py-1 animate-in slide-in-from-top-1 duration-200">
                    <span className="w-12 text-sm text-muted-foreground">Bcc</span>
                    <input
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 px-2 outline-none"
                        placeholder="Bcc recipients"
                        value={formData.bccAddress}
                        onChange={(e) => setFormData({ ...formData, bccAddress: e.target.value })}
                    />
                </div>
            )}

            <div className="flex items-center border-b border-transparent hover:border-muted-foreground/20 focus-within:border-primary/50 transition-colors py-1">
              <span className="w-12 text-sm text-muted-foreground">Subject</span>
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-1 px-2 outline-none"
                placeholder="Enter subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 bg-muted/20 border-b overflow-x-auto">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand("bold")} title="Bold">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand("italic")} title="Italic">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand("underline")} title="Underline">
              <Underline className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-muted-foreground/20 mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand("insertUnorderedList")} title="Bullet List">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand("insertOrderedList")} title="Numbered List">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-muted-foreground/20 mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={addLink} title="Insert Link">
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand("removeFormat")} title="Clear Formatting">
              <Type className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-muted-foreground/20 mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()} title="Attach File" disabled={uploadingFile}>
              {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="p-2 flex flex-wrap gap-2 border-b bg-muted/5">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted px-2 py-1 rounded border border-muted-foreground/10 text-xs">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="max-w-[150px] truncate font-medium">{file.attachmentName}</span>
                  <button onClick={() => removeAttachment(index)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Editor Area */}
          <ScrollArea className="flex-1 p-4 bg-background">
            <div
              ref={contentRef}
              contentEditable
              className="min-h-[300px] outline-none prose prose-sm dark:prose-invert max-w-none text-foreground"
              onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                      e.preventDefault();
                      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
                  }
              }}
            />
          </ScrollArea>
        </div>

        <DialogFooter className="p-4 border-t bg-muted/30 flex flex-row items-center justify-between sm:justify-between">
          <div className="flex items-center gap-2">
            {/* Any extra footer actions */}
          </div>
          <div className="flex items-center gap-3">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="text-muted-foreground hover:text-foreground"
            >
                Discard
            </Button>
            <Button 
                onClick={handleSend} 
                disabled={loading || uploadingFile} 
                className="gap-2 px-6 shadow-lg shadow-primary/20"
            >
                {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                <Send className="h-4 w-4" />
                )}
                Send Now
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
