// import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import { getIsAppleDevice, getMetaKey } from "~/lib/utils";

export const collapseEditorPanelShortcut = `${getMetaKey()} + Shift + ,`;
// export const monacoCollapseEditorPanelShortcut =
//   monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Comma;
export const monacoCollapseEditorPanelShortcut = 3159;
export function getIsCollapseEditorPanelKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === ",";
}

export const collapsePreviewPanelShortcut = `${getMetaKey()} + Shift + .`;
// export const monacoCollapsePreviewPanelShortcut =
//   monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Period;
export const monacoCollapsePreviewPanelShortcut = 3161;
export function getIsCollapsePreviewPanelKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === ".";
}

export const resetEditorPanelSizesShortcut = `${getMetaKey()} + Shift + ;`;
// export const monacoResetEditorPanelSizesShortcut =
//   monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Semicolon;
export const monacoResetEditorPanelSizesShortcut = 3157;
export function getIsResetEditorPanelSizesKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === ";";
}

export const toggleSplitViewModeShortcut = `${getMetaKey()} + Shift + M`;
export function getIsToggleSplitViewModeKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === "m";
}

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
// export const monacoOpenCommandPaletteBrowserShortcut =
//   monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK;
export const monacoOpenCommandPaletteBrowserShortcut = 2089;
export function getIsOpenCommandPaletteBrowserKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.key === "k";
}

export const saveCurrentNoteShortcut = `${getMetaKey()} + S`;
// export const monacoSaveCurrentNoteShortcut =
//   monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS;
export const monacoSaveCurrentNoteShortcut = 2097;
export function getIsSaveCurrentNoteKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.key === "s";
}

export const createNewNoteShortcut = `${getMetaKey()} + Enter`;
// export const monacoCreateNewNoteShortcut =
//   monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter;
export const monacoCreateNewNoteShortcut = 2051;
export function getIsCreateNewNoteKeyCombo(e: KeyboardEvent) {
  const isMac = getIsAppleDevice();
  return (isMac ? e.metaKey : e.ctrlKey) && e.key === "Enter";
}
