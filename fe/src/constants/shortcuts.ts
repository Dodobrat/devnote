import { getAltKey, getIsAppleDevice, getMetaKey } from "~/lib/utils";

export const openCommandPaletteVSCodeShortcut = `${getMetaKey()} + Shift + P`;
export function getIsOpenCommandPaletteVSCodeKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.code === "KeyP";
}

export const openCommandPaletteBrowserShortcut = `${getMetaKey()} + K`;
export function getIsOpenCommandPaletteBrowserKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.code === "KeyK";
}

export const saveCurrentNoteShortcut = `${getMetaKey()} + S`;
export function getIsSaveCurrentNoteKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.code === "KeyS";
}

export const createNewNoteShortcut = `${getMetaKey()} + Enter`;
export function getIsCreateNewNoteKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.key === "Enter";
}

export const showEditorPreviewShortcut = `${getMetaKey()} + Shift + .`;
export function getIsShowEditorPreviewKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.code === "Period";
}

export const selectSelectionMatchesShortcut = `${getMetaKey()} + Shift + L`;
export const addCursorAboveShortcut = `${getMetaKey()} + ${getAltKey()} + ArrowUp`;
export const addCursorBelowShortcut = `${getMetaKey()} + ${getAltKey()} + ArrowDown`;
export const selectLineShortcut = `${getMetaKey()} + L`;
