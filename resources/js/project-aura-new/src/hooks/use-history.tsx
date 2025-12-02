
import { useState, useEffect, useCallback } from 'react';
import { HistoryEntry } from '../types/history';
import { historyService } from '../services/historyService';

const HISTORY_STORAGE_KEY = 'taskflow_history';

export const useHistory = (projectId?: string) => {
	const [history, setHistory] = useState<HistoryEntry[]>([]);

	useEffect(() => {
		const loadHistory = async () => {
			try {
				// Try to load from API
				const entries = projectId
					? await historyService.getByProject(projectId)
					: await historyService.getAll();
				setHistory(entries);
			} catch (error) {
				console.error('Failed to load history from API, falling back to localStorage', error);
				// Fallback to localStorage if API fails
				try {
					const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
					if (storedHistory) {
						const allHistory: HistoryEntry[] = JSON.parse(storedHistory);
						if (projectId) {
							setHistory(allHistory.filter(entry => entry.projectId === projectId));
						} else {
							setHistory(allHistory);
						}
					}
				} catch (localError) {
					console.error('Failed to load history from localStorage', localError);
				}
			}
		};

		loadHistory();
	}, [projectId]);

	const addHistoryEntry = useCallback(async (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
		try {
			// Save to API
			const newEntry = await historyService.create(entry);

			// Update local state
			if (projectId && entry.projectId === projectId) {
				setHistory(prev => [...prev, newEntry]);
			} else if (!projectId) {
				setHistory(prev => [...prev, newEntry]);
			}

			// Also save to localStorage as backup
			try {
				const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
				const allHistory: HistoryEntry[] = storedHistory ? JSON.parse(storedHistory) : [];
				const updatedHistory = [...allHistory, newEntry];
				localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
			} catch (localError) {
				console.error('Failed to save history to localStorage', localError);
			}
		} catch (error) {
			console.error('Failed to save history to API, saving to localStorage only', error);
			// Fallback to localStorage only
			try {
				const newEntry: HistoryEntry = {
					...entry,
					id: `hist-${Date.now()}`,
					timestamp: new Date().toISOString(),
				};
				const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
				const allHistory: HistoryEntry[] = storedHistory ? JSON.parse(storedHistory) : [];
				const updatedHistory = [...allHistory, newEntry];

				localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

				if (projectId && entry.projectId === projectId) {
					setHistory(prev => [...prev, newEntry]);
				} else if (!projectId) {
					setHistory(prev => [...prev, newEntry]);
				}
			} catch (localError) {
				console.error('Failed to save history to localStorage', localError);
			}
		}
	}, [projectId]);

	return { history, addHistoryEntry };
};
