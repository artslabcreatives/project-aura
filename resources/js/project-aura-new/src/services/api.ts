import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://auraai.dev.artslabcreatives.com/api';

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
	},
	withCredentials: true, // Enable credentials for session-based auth
});

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			// Handle unauthorized - redirect to login
			window.location.href = '/';
		}
		return Promise.reject(error);
	}
);
