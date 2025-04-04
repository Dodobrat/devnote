import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
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

export function getMetaKey() {
  return getIsAppleDevice() ? "⌘" : "Ctrl";
}

export function getAltKey() {
  return getIsAppleDevice() ? "⌥" : "Alt";
}

export function deriveTitle(markdownContent: string) {
  const lines = markdownContent.split("\n");
  const firstLineWithWords = lines.find((line) => /\w+/.test(line)) || "";
  const withoutHtmlTags = firstLineWithWords.replace(/<\/?[^>]+(>|$)/g, "");
  const cleanTitle = withoutHtmlTags.replace(/[^\w\s]/g, "");
  return cleanTitle.trim();
}

export function getPrettyDate(date: Date, locale: string = "en-GB") {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const getPartValue = (type: string) => {
    return parts.find((part) => part.type === type)?.value || "";
  };

  const day = getPartValue("day");
  const month = getPartValue("month");
  const year = getPartValue("year");
  const hour = getPartValue("hour");
  const minute = getPartValue("minute");
  const second = getPartValue("second");

  // "12 Mar 2025, 23:59:59"
  return `${day} ${month} ${year}, ${hour}:${minute}:${second}`;
}
