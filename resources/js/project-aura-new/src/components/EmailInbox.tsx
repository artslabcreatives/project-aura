import React, { useState, useEffect } from "react";
import { zohoService } from "@/services/zohoService";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Inbox, Send, Archive, Trash2, Folder, Loader2, ChevronRight, RefreshCw, Plus, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { EmailDetailView } from "./EmailDetailView";

interface Folder {
  folderId: string;
  folderName: string;
  unreadCount: number;
}

interface Message {
  messageId: string;
  subject: string;
  sender: string;
  receivedTime: string;
  summary: string;
}

export const EmailInbox: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const { folders } = await zohoService.getFolders();
      setFolders(folders || []);
      if (folders && folders.length > 0 && !selectedFolder) {
        handleFolderSelect(folders[0].folderId);
      }
    } catch (error) {
      console.error("Failed to fetch folders", error);
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleFolderSelect = async (folderId: string) => {
    setSelectedFolder(folderId);
    setCurrentPage(1);
    fetchMessages(folderId, 1);
  };

  const fetchMessages = async (folderId: string, page: number) => {
    setLoadingMessages(true);
    try {
      const start = (page - 1) * pageSize + 1;
      const { messages } = await zohoService.getMessages(folderId, { start, limit: pageSize });
      setMessages(messages || []);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchMessages(selectedFolder!, nextPage);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchMessages(selectedFolder!, prevPage);
    }
  };

  const getFolderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "inbox": return <Inbox className="h-4 w-4" />;
      case "sent": return <Send className="h-4 w-4" />;
      case "archive": return <Archive className="h-4 w-4" />;
      case "trash": return <Trash2 className="h-4 w-4" />;
      default: return <Folder className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Sidebar - Folders */}
      <Card className="w-64 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">Mailbox</h2>
          <Button variant="ghost" size="icon" onClick={fetchFolders}>
            <RefreshCw className={cn("h-4 w-4", loadingFolders && "animate-spin")} />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {folders && folders.map((folder) => (
              <button
                key={folder.folderId}
                onClick={() => handleFolderSelect(folder.folderId)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  selectedFolder === folder.folderId
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {getFolderIcon(folder.folderName)}
                <span className="flex-1 text-left">{folder.folderName}</span>
                {folder.unreadCount > 0 && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full",
                    selectedFolder === folder.folderId ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                  )}>
                    {folder.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t mt-auto">
          <Button className="w-full gap-2">
            <Plus className="h-4 w-4" /> Compose
          </Button>
        </div>
      </Card>

      {/* Main Content Area: Message List or Detail View */}
      <div className="flex-1 min-w-0">
        {selectedMessageId ? (
          <EmailDetailView 
            folderId={selectedFolder || ""} 
            messageId={selectedMessageId} 
            onBack={() => setSelectedMessageId(null)} 
          />
        ) : (
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                {folders.find(f => f.folderId === selectedFolder)?.folderName || "Messages"}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{messages.length} messages</span>
              </div>
            </div>
            <ScrollArea className="flex-1">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length > 0 ? (
                <>
                  <div className="divide-y flex-1">
                    {messages.map((message) => (
                      <div
                        key={message.messageId}
                        onClick={() => setSelectedMessageId(message.messageId)}
                        className="p-4 hover:bg-muted/50 cursor-pointer transition-colors group relative"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm text-primary">{message.sender}</span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                            {(() => {
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
                            })()}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{message.subject}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{message.summary}</p>
                        <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="p-4 border-t flex items-center justify-between sticky bottom-0 bg-background z-10">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePrevPage} 
                      disabled={currentPage === 1 || loadingMessages}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <span className="text-xs text-muted-foreground font-medium">
                      Page {currentPage}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleNextPage} 
                      disabled={messages.length < pageSize || loadingMessages}
                      className="gap-1"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Mail className="h-12 w-12 mb-2 opacity-20" />
                  <p>No messages in this folder.</p>
                </div>
              )}
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
};
