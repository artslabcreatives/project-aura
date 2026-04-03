import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getToken } from '@/lib/api';

// Make Pusher available globally for Echo
(window as any).Pusher = Pusher;

const appKey = import.meta.env.VITE_REVERB_APP_KEY || import.meta.env.VITE_PUSHER_APP_KEY;
const host = import.meta.env.VITE_REVERB_HOST || import.meta.env.VITE_PUSHER_HOST || window.location.hostname;
const scheme = import.meta.env.VITE_REVERB_SCHEME || import.meta.env.VITE_PUSHER_SCHEME || window.location.protocol.replace(':', '');
const normalizedScheme = scheme.replace(':', '');
const port = Number(import.meta.env.VITE_REVERB_PORT || import.meta.env.VITE_PUSHER_PORT || (normalizedScheme === 'https' ? 443 : 80));

// Initialize Echo
export const echo = appKey ? new Echo({
    broadcaster: 'reverb',
    key: appKey,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: normalizedScheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    },
}) : null;

// Helper to update token if it changes (e.g. login/logout)
export const updateEchoToken = (token: string | null) => {
    if (!echo) {
        return;
    }

    echo.connector.options.auth.headers.Authorization = token ? `Bearer ${token}` : '';
};
