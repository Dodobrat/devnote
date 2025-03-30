import { useCallback } from "react";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { WELCOME_TEXT } from "~/constants";
import { type ThemeModeKey } from "~/context";

const storeKeys = {
  theme: "devnote.theme",
  editorAutosave: "devnote.editor.autosave",
  editorLastOpenedNote: "devnote.editor.lastOpenedNote",
  editorWelcomeNote: "devnote.editor.note.welcome",
  editorContainedWidth: "devnote.editor.containedWidth",
  editorPreviewMode: "devnote.editor.preview.mode",
} as const;

const themeAtom = atomWithStorage<ThemeModeKey>(storeKeys.theme, "system");
const autosaveAtom = atomWithStorage(storeKeys.editorAutosave, true);
const lastOpenedNoteAtom = atomWithStorage(storeKeys.editorLastOpenedNote, "");
const welcomeNoteAtom = atomWithStorage(
  storeKeys.editorWelcomeNote,
  WELCOME_TEXT,
);
const containedWidthAtom = atomWithStorage(
  storeKeys.editorContainedWidth,
  false,
);
const previewModeAtom = atomWithStorage<"editor" | "preview">(
  storeKeys.editorPreviewMode,
  "editor",
);

const noteAtom = atom("");
const notePrevStateAtom = atom("");
const commandPaletteOpenAtom = atom(false);

export function useEditorNote() {
  const [note, setNote] = useAtom(noteAtom);

  const setNoteValue = useCallback(
    (v: string | undefined) => setNote(v || ""),
    [setNote],
  );

  return { note, setNote: setNoteValue };
}

export function useEditorNotePrevState() {
  return useAtom(notePrevStateAtom);
}

export function useEditorAutosave() {
  return useAtom(autosaveAtom);
}

export function useLastOpenedNote() {
  return useAtom(lastOpenedNoteAtom);
}

export function useEditorContainedWidth() {
  return useAtom(containedWidthAtom);
}

export function useEditorWelcomeNote() {
  return useAtom(welcomeNoteAtom);
}

export function useEditorPreviewMode() {
  return useAtom(previewModeAtom);
}

export function useCommandPaletteOpenStore() {
  return useAtom(commandPaletteOpenAtom);
}

export function useThemeAtom() {
  return useAtom(themeAtom);
}
