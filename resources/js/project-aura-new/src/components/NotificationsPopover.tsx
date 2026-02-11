import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from "@/components/ui/scroll-area"
import { notificationService, type Notification as AppNotification } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { echo } from '@/services/echoService';
import { useUser } from '@/hooks/use-user';
import { useToast } from "@/hooks/use-toast";

// Notification sound URL
const NOTIFICATION_SOUND_URL = '/sounds/notification.mp3';

// Create audio element outside component to persist across re-renders
let notificationAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

// Initialize audio element
const initAudio = () => {
    if (!notificationAudio) {
        notificationAudio = new Audio(NOTIFICATION_SOUND_URL);
        notificationAudio.volume = 0.5;
        notificationAudio.preload = 'auto';
    }
    return notificationAudio;
};

// Unlock audio on user interaction (required by browsers)
const unlockAudio = () => {
    if (audioUnlocked) return;

    const audio = initAudio();

    // Play a silent/quick sound to unlock
    const originalVolume = audio.volume;
    audio.volume = 0.01; // Nearly silent

    audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = originalVolume;
        audioUnlocked = true;
        console.log('🔔 Notification audio unlocked successfully!');
        // Remove listeners once unlocked
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    }).catch(() => {
        audio.volume = originalVolume;
        // Keep trying on next interaction
    });
};

// Add listeners when module loads - will keep trying until successful
if (typeof document !== 'undefined') {
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
}

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [soundPromptShown, setSoundPromptShown] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useUser();
    const { toast } = useToast();

    // Try to unlock audio when component mounts (in case user already interacted)
    useEffect(() => {
        unlockAudio();
    }, []);

    // Handle enabling sounds when user clicks the enable button
    const handleEnableSounds = useCallback(() => {
        const audio = initAudio();
        audio.currentTime = 0;
        audio.play().then(() => {
            audioUnlocked = true;
            console.log('🔔 Notification sounds enabled!');
            toast({
                title: "🔔 Sounds Enabled",
                description: "You will now hear notification sounds.",
            });
        }).catch(err => {
            console.log('Still could not play:', err.message);
        });
    }, [toast]);

    // Play notification sound
    const playNotificationSound = useCallback(() => {
        try {
            const audio = initAudio();
            // Reset to beginning if already playing
            audio.currentTime = 0;
            audio.play().catch(err => {
                console.log('🔇 Could not play notification sound:', err.message);
                // Show prompt to enable sounds (only once per session)
                if (!soundPromptShown) {
                    setSoundPromptShown(true);
                    toast({
                        title: "🔔 Enable Notification Sounds?",
                        description: "Click the button below to enable notification sounds.",
                        action: (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleEnableSounds}
                                className="ml-2"
                            >
                                Enable Sounds
                            </Button>
                        ),
                        duration: 10000, // Show for 10 seconds
                    });
                }
            });
        } catch (error) {
            console.log('Error playing notification sound:', error);
        }
    }, [soundPromptShown, toast, handleEnableSounds]);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getAll();
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Listen for real-time notifications
        if (currentUser) {
            console.log(`Subscribing to notifications for user ${currentUser.id}`);
            const channel = echo.private(`App.Models.User.${currentUser.id}`);

            channel.notification((notification: any) => {
                console.log('Real-time notification received:', notification);

                // Play notification sound
                playNotificationSound();

                // Add to list optimistically
                const newNotification: AppNotification = {
                    id: notification.id,
                    type: notification.type,
                    data: {
                        title: notification.title,
                        message: notification.message,
                        link: notification.link
                    },
                    read_at: null,
                    created_at: new Date().toISOString(),
                };

                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);

                toast({
                    title: notification.title,
                    description: notification.message,
                });

                // Desktop Push Notification
                const savedSettings = localStorage.getItem('user_notifications');
                if (savedSettings) {
                    const settings = JSON.parse(savedSettings);
                    if (settings.push && "Notification" in window && Notification.permission === "granted") {
                        try {
                            const n = new Notification(notification.title, {
                                body: notification.message,
                                icon: '/favicon.ico', // Adjust path if needed
                                tag: notification.id // Prevent duplicates
                            });
                            n.onclick = function () {
                                window.focus();
                                handleNotificationClick({ ...newNotification, id: notification.id } as AppNotification);
                            };
                        } catch (e) {
                            console.error("Failed to send desktop notification", e);
                        }
                    }
                }
            });

            return () => {
                console.log(`Unsubscribing from notifications for user ${currentUser.id}`);
                echo.leave(`App.Models.User.${currentUser.id}`);
            };
        }

        const interval = setInterval(fetchNotifications, 60000); // Poll every minute as backup
        return () => clearInterval(interval);
    }, [currentUser, playNotificationSound]);


    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            fetchNotifications();
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (e) {
            fetchNotifications();
        }
    };

    const handleNotificationClick = (notification: AppNotification) => {
        if (!notification.read_at) {
            handleMarkAsRead(notification.id);
        }
        if (notification.data.link) {
            navigate(notification.data.link);
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 transition-colors">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs h-auto py-1 px-2">
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    className={`flex flex-col items-start gap-1 p-4 text-left hover:bg-muted/50 transition-colors border-b last:border-0 ${!notification.read_at ? 'bg-muted/10' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex w-full justify-between items-start gap-2">
                                        <span className={`text-sm font-medium ${!notification.read_at ? 'text-primary' : ''}`}>
                                            {notification.data.title}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                        {notification.data.message}
                                    </p>
                                    {!notification.read_at && (
                                        <div className="w-full flex justify-end mt-1">
                                            <span
                                                className="text-[10px] text-primary hover:underline cursor-pointer font-medium"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notification.id);
                                                }}
                                            >
                                                Mark as read
                                            </span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
