import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const webStorage = {
  getItem<TData>(key: string) {
    try {
      const stored = localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : undefined;
      return parsed as TData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  },
  setItem<TData>(key: string, value: TData | ((prev: TData) => TData)) {
    try {
      const stored = localStorage.getItem(key);
      const parsed = stored ? JSON.parse(stored) : undefined;
      if (value instanceof Function) {
        const result = value(parsed);
        localStorage.setItem(key, JSON.stringify(result));
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(error);
    }
  },
  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(error);
    }
  },
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(error);
    }
  },
};

export function formatRelativeDateTime(date: Date) {
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
