import { useCallback } from "react";

import { WELCOME_TEXT } from "~/constants";

import { storeKeys, usePersistQueryStore, useQueryStore } from "./index";

export function useEditorNote() {
  const [note, setNote] = useQueryStore(storeKeys.editorNote, "");

  const setNoteValue = useCallback(
    (v: string | undefined) => setNote(v || ""),
    [setNote],
  );

  return { note, setNote: setNoteValue };
}

export function useEditorNotePrevState() {
  return useQueryStore(storeKeys.editorNotePrevState, "");
}

export function useEditorAutosave() {
  return usePersistQueryStore(storeKeys.editorAutosave, true);
}

export function useEditorContainedWidth() {
  return usePersistQueryStore(storeKeys.editorContainedWidth, false);
}

export function useEditorWelcomeNote() {
  return usePersistQueryStore(storeKeys.editorWelcomeNote, WELCOME_TEXT);
}

export function useEditorPreviewMode() {
  return usePersistQueryStore<"editor" | "preview">(
    storeKeys.editorPreviewMode,
    "editor",
  );
}
