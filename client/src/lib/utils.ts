import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "../../tailwind.config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const config = resolveConfig(tailwindConfig);

export function getTwSize(size: string, appendPx = true) {
  const sum =
    parseInt(config.theme.width[size] || "1") *
    parseInt(document.documentElement.style.fontSize);

  if (appendPx) return `${sum}px`;
  return sum;
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
