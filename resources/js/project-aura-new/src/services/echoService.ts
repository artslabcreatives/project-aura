import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getToken } from '@/lib/api';

// Make Pusher available globally for Echo
(window as any).Pusher = Pusher;

// Initialize Echo
export const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
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
