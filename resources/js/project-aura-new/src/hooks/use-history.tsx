
import { useState, useEffect, useCallback } from 'react';
import { HistoryEntry } from '../types/history';
import { historyService } from '../services/historyService';

const HISTORY_STORAGE_KEY = 'taskflow_history';

export const useHistory = (projectId?: string) => {
	const [history, setHistory] = useState<HistoryEntry[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const loadHistory = async () => {
			setLoading(true);
			try {
				// Try to load from API
				const entries = projectId
					? await historyService.getByProject(projectId)
					: await historyService.getAll();
				setHistory(entries);
			} catch (error) {
				console.error('Failed to load history from API', error);
			} finally {
				setLoading(false);
			}
		};

		loadHistory();
	}, [projectId]);

	const addHistoryEntry = useCallback(async (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
		try {
			// Save to API
			const newEntry = await historyService.create(entry);

			// Update local state (prepend to show as latest)
			if ((projectId && entry.projectId === projectId) || !projectId) {
				setHistory(prev => [newEntry, ...prev]);
			}
		} catch (error) {
			console.error('Failed to save history to API', error);
		}
	}, [projectId]);

	return {
		history,
		addHistoryEntry,
		loading
	};
};
