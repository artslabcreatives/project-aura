import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/task';
import { api, getToken, removeToken } from '@/lib/api';

interface UserContextType {
	currentUser: User | null;
	teamMembers: User[];
	isLoading: boolean;
	isAuthenticated: boolean;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
	const [teamMembers, setTeamMembers] = useState<User[]>([]);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const fetchAuthenticatedUser = async () => {
		// Check if we have a token first
		if (!getToken()) {
			setCurrentUser(null);
			setIsAuthenticated(false);
			throw new Error('No token');
		}

		try {
			const response = await api.get<any>('/user');
			// Map backend response to frontend User type
			const user: User = {
				id: String(response.id),
				name: response.name,
				email: response.email,
				role: response.role,
				department: response.department_id ? String(response.department_id) : '',
			};
			setCurrentUser(user);
			setIsAuthenticated(true);
			return user;
		} catch (error) {
			console.error('Failed to fetch authenticated user:', error);
			removeToken();
			setCurrentUser(null);
			setIsAuthenticated(false);
			throw error;
		}
	};

	const fetchUsers = async () => {
		try {
			const response = await api.get<any[]>('/users');
			// Map backend response to frontend User type
			const users: User[] = response.map((u: any) => ({
				id: String(u.id),
				name: u.name,
				email: u.email,
				role: u.role,
				department: u.department_id ? String(u.department_id) : '',
			}));
			setTeamMembers(users);
		} catch (error) {
			console.error('Failed to fetch users:', error);
			setTeamMembers([]);
		}
	};

	const refreshUser = async () => {
		setIsLoading(true);
		try {
			await fetchAuthenticatedUser();
			// Fetch users in background, don't block login if it fails
			try {
				await fetchUsers();
			} catch (error) {
				console.error('Failed to fetch team members (non-critical):', error);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		try {
			await api.post('/logout', {});
		} catch (error) {
			console.error('Failed to logout:', error);
		} finally {
			// Always clear local state
			removeToken();
			setCurrentUser(null);
			setIsAuthenticated(false);
			setTeamMembers([]);
		}
	};

	useEffect(() => {
		const initAuth = async () => {
			try {
				setIsLoading(true);
				await fetchAuthenticatedUser();
				await fetchUsers();
			} catch (error) {
				// User is not authenticated
			} finally {
				setIsLoading(false);
			}
		};

		initAuth();
	}, []);

	return (
		<UserContext.Provider value={{ currentUser, teamMembers, isLoading, isAuthenticated, logout, refreshUser }}>
			{children}
		</UserContext.Provider>
	);
}

export function useUser() {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
}
