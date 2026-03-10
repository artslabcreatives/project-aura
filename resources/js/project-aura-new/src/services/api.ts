import axios from 'axios';
import { getToken, removeToken } from '@/lib/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Accept': 'application/json',
	},
});

// Request interceptor to add bearer token
api.interceptors.request.use(
	(config) => {
		const token = getToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			removeToken();
			window.location.href = '/';
		}
		return Promise.reject(error);
	}
);
