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
export function remToPx(rem: number): number {
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  return rem * rootFontSize;
}

export function getCssVarValue(varName: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${varName}`)
    .trim();
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // Convert to hex and pad with zeroes
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function getHexFromCssVar(varName: string): string {
  const hslValue = getCssVarValue(varName);

  // Match and parse the HSL values
  const [h, s, l] = hslValue.match(/\d+(\.\d+)?/g)?.map(Number) || [0, 0, 0];

  return hslToHex(h, s, l);
}

type RangeParams = {
  targetValue: number;
  diff: number;
  value: number;
};

export function getIsInRange({
  targetValue,
  diff,
  value,
}: RangeParams): boolean {
  const lowerBound = targetValue - diff;
  const upperBound = targetValue + diff;

  // Check if the value is within the range
  return value >= lowerBound && value <= upperBound;
}
