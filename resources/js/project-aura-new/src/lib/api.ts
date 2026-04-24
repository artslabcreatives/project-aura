// API client for communicating with Laravel backend

const API_BASE_URL = '/api';
const TOKEN_KEY = 'auth_token';

// Token management
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

export interface ApiResponse<T> {
	data: T;
	message?: string;
}

class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	private async request<T>(
		endpoint: string,
		options?: RequestInit
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const token = getToken();

		// Don't set Content-Type for FormData - browser will set it with boundary
		const isFormData = options?.body instanceof FormData;
		const headers: Record<string, string> = {
			'Accept': 'application/json',
			...(token ? { 'Authorization': `Bearer ${token}` } : {}),
			...options?.headers,
		};

		// Only set Content-Type for non-FormData requests
		if (!isFormData && !headers['Content-Type']) {
			headers['Content-Type'] = 'application/json';
		}

		const config: RequestInit = {
			...options,
			headers,
		};

		try {
			const response = await fetch(url, config);

			if (!response.ok) {
				if (response.status === 401) {
					// Clear invalid token
					removeToken();
					window.location.href = '/';
				}

				// Try to parse error response body
				let errorData;
				try {
					errorData = await response.json();
				} catch {
					errorData = { error: response.statusText };
				}

				const error: any = new Error(errorData.error || `API Error: ${response.statusText}`);
				error.response = {
					status: response.status,
					data: errorData,
				};
				throw error;
			}

			// Handle 204 No Content
			if (response.status === 204) {
				return null as T;
			}

			return await response.json();
		} catch (error) {
			console.error('API Request failed:', error);
			throw error;
		}
	}

	async get<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, { method: 'GET' });
	}

	async post<T>(endpoint: string, data: any, options?: RequestInit): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'POST',
			body: data instanceof FormData ? data : JSON.stringify(data),
			...options,
		});
	}

	async put<T>(endpoint: string, data: any, options?: RequestInit): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PUT',
			body: data instanceof FormData ? data : JSON.stringify(data),
			...options,
		});
	}

	async patch<T>(endpoint: string, data: any, options?: RequestInit): Promise<T> {
		return this.request<T>(endpoint, {
			method: 'PATCH',
			body: data instanceof FormData ? data : JSON.stringify(data),
			...options,
		});
	}

	async delete<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, { method: 'DELETE' });
	}
}

export const api = new ApiClient(API_BASE_URL);
