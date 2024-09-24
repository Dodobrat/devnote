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

export function remToPx(rem: number): number {
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  return rem * rootFontSize;
}

export function getCssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

export function hslToHex(h: number, s: number, l: number) {
  h = h % 360;
  if (h < 0) h += 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];

  if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
  else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
  else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
  else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
  else if (300 <= h && h < 360) [r, g, b] = [c, 0, x];

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  const toHex = (n: number) => n.toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hslToNumberValues(hslStr: string) {
  const matches = hslStr.match(/[\d.]+/g);
  return matches ? matches.map(Number) : [];
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

export function getIsAppleDevice() {
  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  // Check for iOS devices (iPhone, iPod, iPad)
  const isIOS = /iphone|ipod|ipad/.test(userAgent);

  // Check for macOS devices
  const isMac = platform.includes("mac");

  // Check for iPadOS devices (iPads that identify as macOS)
  const isTouchDevice = "ontouchend" in document;
  const isIPadOS = isMac && isTouchDevice;

  return isIOS || isIPadOS || isMac;
}

export function isMobileOrTabletDevice() {
  const isTouchDevice =
    navigator.maxTouchPoints > 0 ||
    "ontouchstart" in window ||
    window.TouchEvent !== undefined;

  const userAgent =
    navigator.userAgent ||
    navigator.vendor ||
    ("opera" in window ? (window.opera as string) : "");

  const mobileOrTabletRegex =
    /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  const isMobileOrTablet = mobileOrTabletRegex.test(userAgent);

  return isMobileOrTablet && isTouchDevice;
}

export function getMetaKey() {
  return getIsAppleDevice() ? "⌘" : "Ctrl";
}
