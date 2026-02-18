import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserRole } from "@/types/task";
import { useEffect, useState } from "react";

interface VideoGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: UserRole;
    isWelcome?: boolean;
}

const VIDEO_IDS: Record<string, string> = {
    'admin': 'V2OtNx7abn0',
    'team-lead': 'uAphXchdHE8',
    'account-manager': 'jFZSwXh-ENE',
    'user': 'VTKip0rqIl4',
    // Fallback for HR to user video for now, or could be empty
    'hr': 'VTKip0rqIl4'
};

const VIDEO_TITLES: Record<string, string> = {
    'admin': 'Admin Guide',
    'team-lead': 'Team Lead Guide',
    'account-manager': 'Account Manager Guide',
    'user': 'User Guide',
    'hr': 'HR Guide'
};

export function VideoGuideModal({ isOpen, onClose, role, isWelcome = false }: VideoGuideModalProps) {
    const videoId = VIDEO_IDS[role] || VIDEO_IDS['user'];
    const title = VIDEO_TITLES[role] || 'Guide';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black/95 border-zinc-800">
                <DialogHeader className="p-4 bg-zinc-900/50 absolute top-0 left-0 right-0 z-10 backdrop-blur-sm">
                    <DialogTitle className="text-zinc-100 flex items-center gap-2">
                        {isWelcome ? `Welcome to Project Aura!` : title}
                        {isWelcome && <span className="text-xs font-normal text-zinc-400 ml-2">(Introduction Guide)</span>}
                    </DialogTitle>
                    {isWelcome && (
                        <DialogDescription className="text-zinc-400">
                            Please watch this short video to get started with your new dashboard.
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="relative pt-[56.25%] w-full bg-black">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=${isOpen ? 1 : 0}&rel=0`}
                        title={title}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </DialogContent>
        </Dialog>
    );
}
