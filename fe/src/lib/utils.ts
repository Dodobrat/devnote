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
