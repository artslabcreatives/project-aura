import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Ensures a value is a valid number, defaulting to 0 if null, undefined, or NaN.
 * Useful for handling API responses where numbers might be returned as strings.
 */
export function normalizeNumber(value: any): number {
	if (value === null || value === undefined) return 0;
	const num = Number(value);
	return isNaN(num) ? 0 : num;
}

