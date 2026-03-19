import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getToken } from '@/lib/api';

// Make Pusher available globally for Echo
(window as any).Pusher = Pusher;

// Initialize Echo
export const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    // Add authorization header
    auth: {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    },
});

// Helper to update token if it changes (e.g. login/logout)
export const updateEchoToken = (token: string | null) => {
    echo.connector.options.auth.headers.Authorization = token ? `Bearer ${token}` : '';
};
