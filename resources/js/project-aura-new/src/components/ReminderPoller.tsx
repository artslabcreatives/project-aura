import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reminderService } from '@/services/reminderService';
import { isPast } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function ReminderPoller() {
    const { toast } = useToast();

    // Fetch all reminders every 30 seconds
    const { data: reminders = [] } = useQuery({
        queryKey: ['reminders-poll'],
        queryFn: reminderService.getAll,
        refetchInterval: 30000,
        staleTime: 10000,
    });

    useEffect(() => {
        // Request permission on mount if default
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        if (!reminders.length) return;

        reminders.forEach((reminder: any) => {
            // Skip if already read/done
            if (reminder.is_read) return;

            const reminderTime = new Date(reminder.reminder_at);

            // Check if it's time to notify
            // Logic: It is past the reminder time
            if (isPast(reminderTime)) {
                const storageKey = `reminder-notified-${reminder.id}`;
                const hasNotified = localStorage.getItem(storageKey);

                if (!hasNotified) {
                    // Send Desktop Notification
                    if ("Notification" in window && Notification.permission === "granted") {
                        try {
                            const n = new Notification(reminder.title, {
                                body: reminder.description || `It's time! (${new Date(reminder.reminder_at).toLocaleTimeString()})`,
                                icon: "/favicon.ico", // Ensure this exists or use logo
                                tag: `reminder-${reminder.id}`, // Replaces older notification with same tag
                                requireInteraction: true,
                            });

                            n.onclick = () => {
                                window.focus();
                                window.location.href = '/reminders';
                                n.close();
                            };
                        } catch (e) {
                            console.error("Notification error:", e);
                        }
                    }

                    // Also show in-app toast as fallback
                    toast({
                        title: "Reminder: " + reminder.title,
                        description: reminder.description,
                        duration: 10000,
                        action: <div onClick={() => window.location.href = '/reminders'} className="cursor-pointer font-bold">View</div>
                    });

                    // Mark as notified in local storage to avoid loop
                    localStorage.setItem(storageKey, 'true');
                }
            }
        });
    }, [reminders, toast]);

    return null;
}
