import { useCallback } from "react";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { WELCOME_TEXT } from "~/constants";
import { type ThemeModeKey } from "~/context";

export const storeKeys = {
  theme: "devnote.theme",
  editorLayout: "devnote.editor.layout",
  editorShowPreview: "devnote.editor.showPreview",
  editorAutosave: "devnote.editor.autosave",
  editorLastOpenedNote: "devnote.editor.lastOpenedNote",
  editorWelcomeNote: "devnote.editor.note.welcome",
  editorContainedWidth: "devnote.editor.containedWidth",
  editorPreviewMode: "devnote.editor.preview.mode",
} as const;

const autosaveAtom = atomWithStorage(storeKeys.editorAutosave, true);
export function useEditorAutosaveAtom() {
  return useAtom(autosaveAtom);
}

const themeAtom = atomWithStorage<ThemeModeKey>(storeKeys.theme, "system");
export function useThemeAtom() {
  return useAtom(themeAtom);
}

const lastOpenedNoteAtom = atomWithStorage(storeKeys.editorLastOpenedNote, "");
export function useLastOpenedNoteAtom() {
  return useAtom(lastOpenedNoteAtom);
}

// prettier-ignore
const showEditorPreviewAtom = atomWithStorage(storeKeys.editorShowPreview, false);
export function useShowEditorPreviewAtom() {
  return useAtom(showEditorPreviewAtom);
}

// prettier-ignore
const containedWidthAtom = atomWithStorage(storeKeys.editorContainedWidth, false);
export function useEditorContainedWidthAtom() {
  return useAtom(containedWidthAtom);
}

// prettier-ignore
const welcomeNoteAtom = atomWithStorage(storeKeys.editorWelcomeNote, WELCOME_TEXT);
export function useEditorWelcomeNoteAtom() {
  return useAtom(welcomeNoteAtom);
}

// prettier-ignore
const previewModeAtom = atomWithStorage<"editor" | "preview">(storeKeys.editorPreviewMode, "editor");
export function useEditorPreviewModeAtom() {
  return useAtom(previewModeAtom);
}

const noteAtom = atom("");
export function useEditorNoteAtom() {
  const [note, setNote] = useAtom(noteAtom);

  const setNoteValue = useCallback(
    (v: string | undefined) => setNote(v || ""),
    [setNote],
  );

  return { note, setNote: setNoteValue };
}

const notePrevStateAtom = atom("");
export function useEditorNotePrevStateAtom() {
  return useAtom(notePrevStateAtom);
}

const commandPaletteOpenAtom = atom(false);
export function useCommandPaletteOpenAtom() {
  return useAtom(commandPaletteOpenAtom);
}
