import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/task';
import { api } from '@/lib/api';

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
		try {
			const user = await api.get<User>('/user');
			setCurrentUser(user);
			setIsAuthenticated(true);
			return user;
		} catch (error) {
			console.error('Failed to fetch authenticated user:', error);
			setCurrentUser(null);
			setIsAuthenticated(false);
			throw error;
		}
	};

	const fetchUsers = async () => {
		try {
			const users = await api.get<User[]>('/users');
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
			await fetchUsers();
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		try {
			await api.post('/logout', {});
			setCurrentUser(null);
			setIsAuthenticated(false);
			setTeamMembers([]);
		} catch (error) {
			console.error('Failed to logout:', error);
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
