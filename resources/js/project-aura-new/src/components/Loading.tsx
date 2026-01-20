import { Loader2 } from "lucide-react";

export function Loading() {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-full bg-background text-muted-foreground animate-in fade-in duration-300">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Loading...</p>
        </div>
    );
}
