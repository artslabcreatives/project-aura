import React, { useEffect, useState } from "react";
import { EmailInbox } from "@/components/EmailInbox";
import { ZohoMailSettings } from "@/components/ZohoMailSettings";
import { zohoService } from "@/services/zohoService";
import { Loader2 } from "lucide-react";

const Emails: React.FC = () => {
    const [connected, setConnected] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const { connected } = await zohoService.getStatus();
                setConnected(connected);
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
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Email Communication</h1>
            </div>

            {connected ? (
                <EmailInbox />
            ) : (
                <div className="max-w-2xl mx-auto mt-12">
                    <ZohoMailSettings />
                </div>
            )}
        </div>
    );
};

export default Emails;
