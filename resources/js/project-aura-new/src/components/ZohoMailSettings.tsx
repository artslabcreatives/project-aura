import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Loader2, CheckCircle, XCircle } from "lucide-react";
import { zohoService } from "@/services/zohoService";
import { useToast } from "@/components/ui/use-toast";

export const ZohoMailSettings: React.FC = () => {
  const [status, setStatus] = useState<{ connected: boolean; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          <CardTitle>Zoho Mail Integration</CardTitle>
        </div>
        <CardDescription>
          Connect your Zoho Mail account to sync emails with projects and tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Connected to {status.email}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your Zoho Mail account is successfully linked. You can now view and manage emails
              within the platform.
            </p>
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10">
              Disconnect Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Not Connected</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Linking your Zoho Mail account allows you to track communications, resolve issues,
              and stay synchronized with your team directly from Aura.
            </p>
            <Button onClick={handleConnect} disabled={connecting}>
              {connecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Connect Zoho Mail
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
