import React, { useState, useEffect } from "react";
import { zohoService } from "@/services/zohoService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, User, Calendar, Tag, Link2 } from "lucide-react";
import { format } from "date-fns";

interface EmailDetailViewProps {
  folderId: string;
  messageId: string;
  onBack: () => void;
}

export const EmailDetailView: React.FC<EmailDetailViewProps> = ({ folderId, messageId, onBack }) => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading email content...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground">
        <ArrowLeft className="h-8 w-8 mb-4 cursor-pointer hover:text-primary transition-colors" onClick={onBack} />
        <p>Failed to load email content.</p>
        <Button variant="outline" className="mt-4" onClick={fetchContent}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border">
      {/* Toolbar */}
      <div className="p-4 border-b flex items-center justify-between bg-muted/30 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Email Details</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="gap-2">
            <Link2 className="h-4 w-4" /> Link to Project
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold leading-tight">{content.subject}</h1>
            
            <div className="flex flex-wrap gap-y-4 justify-between items-start border-y py-4 border-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {content.senderName?.[0] || <User className="h-5 w-5" />}
                </div>
                <div>
                  <div className="font-semibold text-sm">{content.senderName}</div>
                  <div className="text-xs text-muted-foreground">{content.fromAddress}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {(() => {
                    try {
                      const timestamp = parseInt(content.receivedTime);
                      if (isNaN(timestamp)) return "Unknown date";
                      return format(new Date(timestamp), "MMMM d, yyyy 'at' h:mm a");
                    } catch (e) {
                      return "Unknown date";
                    }
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {content.content ? (
              <div 
                className="email-content"
                dangerouslySetInnerHTML={{ __html: content.content }} 
              />
            ) : (
              <p className="text-muted-foreground italic">No content found for this message.</p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
