import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { WELCOME_TEXT } from "~/constants";
import { type ThemeModeKey } from "~/context";
import { type NoteSchemaType } from "~/types/notes";

// MARK: Store keys

export const storeKeys = {
  theme: "devnote.theme",
  sidebar: "devnote.sidebar",
  sidebarVariant: "devnote.sidebar.variant",
  editorLayout: "devnote.editor.layout",
  editorShowPreview: "devnote.editor.showPreview",
  editorAutosave: "devnote.editor.autosave",
  editorSyncScroll: "devnote.editor.syncScroll",
  editorLastOpenedNote: "devnote.editor.lastOpenedNote",
  editorWelcomeNote: "devnote.editor.note.welcome",
  editorContainedWidth: "devnote.editor.containedWidth",
} as const;

// MARK: Persisting Atoms

const themeAtom = atomWithStorage<ThemeModeKey>(storeKeys.theme, "system");
export function useThemeAtom() {
  return useAtom(themeAtom);
}

const sidebarAtom = atomWithStorage(storeKeys.sidebar, true);
export function useSidebarAtom() {
  return useAtom(sidebarAtom);
}

// prettier-ignore
const sidebarVariantAtom = atomWithStorage<"default" | "minimal" | "dense">(storeKeys.sidebarVariant, "default");
export function useSidebarVariantAtom() {
  return useAtom(sidebarVariantAtom);
}

const autosaveAtom = atomWithStorage(storeKeys.editorAutosave, true);
export function useEditorAutosaveAtom() {
  return useAtom(autosaveAtom);
}

const syncScrollAtom = atomWithStorage(storeKeys.editorSyncScroll, true);
export function useEditorSyncScrollAtom() {
  return useAtom(syncScrollAtom);
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
const containedWidthAtom = atomWithStorage(storeKeys.editorContainedWidth, true);
export function useEditorContainedWidthAtom() {
  return useAtom(containedWidthAtom);
}

// prettier-ignore
const welcomeNoteAtom = atomWithStorage(storeKeys.editorWelcomeNote, WELCOME_TEXT);
export function useEditorWelcomeNoteAtom() {
  return useAtom(welcomeNoteAtom);
}

// MARK: Temporary Atoms

const noteAtom = atom("");
export function useEditorNoteAtom() {
  return useAtom(noteAtom);
}

const notePrevStateAtom = atom("");
export function useEditorNotePrevStateAtom() {
  return useAtom(notePrevStateAtom);
}

const commandPaletteOpenAtom = atom(false);
export function useCommandPaletteOpenAtom() {
  return useAtom(commandPaletteOpenAtom);
}

const bulkDeleteNotesModeEnabledAtom = atom(false);
export function useBulkDeleteNotesModeEnabledAtom() {
  return useAtom(bulkDeleteNotesModeEnabledAtom);
}
const bulkDeleteNotesAtom = atom<Set<string>>(new Set<string>());
export function useBulkDeleteNotesAtom() {
  return useAtom(bulkDeleteNotesAtom);
}

const exportNotesModeEnabledAtom = atom(false);
export function useExportNotesModeEnabledAtom() {
  return useAtom(exportNotesModeEnabledAtom);
}
const toExportNotesAtom = atom<Record<string, NoteSchemaType>>({});
export function useToExportNotesAtom() {
  return useAtom(toExportNotesAtom);
}
