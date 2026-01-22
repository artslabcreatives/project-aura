import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from "@/components/ui/scroll-area"
import { notificationService, Notification } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { echo } from '@/services/echoService';
import { useUser } from '@/hooks/use-user';
import { useToast } from "@/hooks/use-toast";

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useUser();
    const { toast } = useToast();

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

                // Add to list optimistically
                const newNotification: Notification = {
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
            });

            return () => {
                console.log(`Unsubscribing from notifications for user ${currentUser.id}`);
                echo.leave(`App.Models.User.${currentUser.id}`);
            };
        }

        const interval = setInterval(fetchNotifications, 60000); // Poll every minute as backup
        return () => clearInterval(interval);
    }, [currentUser]);

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

    const handleNotificationClick = (notification: Notification) => {
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
