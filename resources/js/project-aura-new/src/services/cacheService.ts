/**
 * Simple cache service using localStorage.
 */
const CACHE_PREFIX = 'aura_cache_';
const DEFAULT_TTL = 3600 * 1000; // 1 hour

export const cacheService = {
	/**
	 * Get item from cache. Returns null if not found or expired.
	 */
	get: <T>(key: string): T | null => {
		try {
			const item = localStorage.getItem(CACHE_PREFIX + key);
			if (!item) return null;

			const parsed = JSON.parse(item);
			if (Date.now() > parsed.expiry) {
				localStorage.removeItem(CACHE_PREFIX + key);
				return null;
			}
			return parsed.value;
		} catch (e) {
			console.error('Cache get error:', e);
			return null;
		}
	},

	/**
	 * Set item in cache with TTL.
	 */
	set: <T>(key: string, value: T, ttl: number = DEFAULT_TTL): void => {
		try {
			const item = {
				value,
				expiry: Date.now() + ttl,
			};
			localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
		} catch (e) {
			console.error('Cache set error:', e);
			// LocalStorage might be full
		}
	},

	/**
	 * Remove item from cache.
	 */
	remove: (key: string): void => {
		localStorage.removeItem(CACHE_PREFIX + key);
	},

	/**
	 * Clear all aura cache items.
	 */
	clear: (): void => {
		Object.keys(localStorage).forEach(key => {
			if (key.startsWith(CACHE_PREFIX)) {
				localStorage.removeItem(key);
			}
		});
	}
};
