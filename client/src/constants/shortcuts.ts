import { getIsAppleDevice, getMetaKey } from "~/lib/utils";

// TODO: make it work with different languages, check keyCode or something else

export const toggleSidebarShortcut = `${getMetaKey()} + B`;
export function getIsToggleSidebarKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.key === "b";
}

export const openCommandPaletteVSCodeShortcut = `${getMetaKey()} + Shift + P`;
export function getIsOpenCommandPaletteVSCodeKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === "p";
}

export const openCommandPaletteBrowserShortcut = `${getMetaKey()} + K`;
export function getIsOpenCommandPaletteBrowserKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.key === "k";
}

export const saveCurrentNoteShortcut = `${getMetaKey()} + S`;
export function getIsSaveCurrentNoteKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.key === "s";
}

export const createNewNoteShortcut = `${getMetaKey()} + Enter`;
export function getIsCreateNewNoteKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.key === "Enter";
}
