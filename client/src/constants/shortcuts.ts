import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import { getIsMac, getMetaKey } from "~/lib/utils";

export const collapseEditorPanelShortcut = `${getMetaKey()} + Shift + ,`;
export const monacoCollapseEditorPanelShortcut =
  monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Comma;
export function getIsCollapseEditorPanelKeyCombo(e: KeyboardEvent) {
  const isMac = getIsMac();
  return (isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === ",";
}

export const collapsePreviewPanelShortcut = `${getMetaKey()} + Shift + .`;
export const monacoCollapsePreviewPanelShortcut =
  monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Period;
export function getIsCollapsePreviewPanelKeyCombo(e: KeyboardEvent) {
  const isMac = getIsMac();
  return (isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === ".";
}

export const resetEditorPanelSizesShortcut = `${getMetaKey()} + Shift + ;`;
export const monacoResetEditorPanelSizesShortcut =
  monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Semicolon;
export function getIsResetEditorPanelSizesKeyCombo(e: KeyboardEvent) {
  const isMac = getIsMac();
  return (isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === ";";
}

export const toggleSplitViewModeShortcut = `${getMetaKey()} + Shift + M`;
export function getIsToggleSplitViewModeKeyCombo(e: KeyboardEvent) {
  const isMac = getIsMac();
  return (isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === "m";
}

export const toggleSidebarShortcut = `${getMetaKey()} + B`;
export function getIsToggleSidebarKeyCombo(e: KeyboardEvent) {
  const isMac = getIsMac();
  return (isMac ? e.metaKey : e.ctrlKey) && e.key === "b";
}

export const openCommandPaletteVSCodeShortcut = `${getMetaKey()} + Shift + P`;
export function getIsOpenCommandPaletteVSCodeKeyCombo(e: KeyboardEvent) {
  const isMac = getIsMac();
  return (isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === "p";
}

export const openCommandPaletteBrowserShortcut = `${getMetaKey()} + K`;
export function getIsOpenCommandPaletteBrowserKeyCombo(e: KeyboardEvent) {
  const isMac = getIsMac();
  return (isMac ? e.metaKey : e.ctrlKey) && e.key === "k";
}

export const saveCurrentNoteShortcut = `${getMetaKey()} + S`;
export const monacoSaveCurrentNoteShortcut =
  monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS;
export function getIsSaveCurrentNoteKeyCombo(e: KeyboardEvent) {
  const isMac = getIsMac();
  return (isMac ? e.metaKey : e.ctrlKey) && e.key === "s";
}

export const createNewNoteShortcut = `${getMetaKey()} + Enter`;
export const monacoCreateNewNoteShortcut =
  monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter;
export function getIsCreateNewNoteKeyCombo(e: KeyboardEvent) {
  const isMac = getIsMac();
  return (isMac ? e.metaKey : e.ctrlKey) && e.key === "Enter";
}
