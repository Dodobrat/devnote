import { useCallback } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

import { ResizablePanelGroupProps } from "~/components/ui";

import { storeKeys, usePersisQueryStore, useQueryStore } from "./index";

export type EditorResizablePanelsLayout = {
  direction: ResizablePanelGroupProps["direction"];
  editorCollapsed: boolean;
  editorSize: number;
  previewCollapsed: boolean;
  previewSize: number;
  isReset: boolean;
  isDisabled: boolean;
  isDragging: boolean;
};

export const defaultResizeState: EditorResizablePanelsLayout = {
  direction: "horizontal",
  editorCollapsed: false,
  editorSize: 50,
  previewCollapsed: false,
  previewSize: 50,
  isReset: true,
  isDisabled: false,
  isDragging: false,
};

export function useEditorLayoutState() {
  return usePersisQueryStore(storeKeys.editorLayout, defaultResizeState);
}

export function useEditorPanelHandle() {
  return useQueryStore<ImperativePanelHandle | null>(
    storeKeys.editorLayoutEditorPanel,
    null,
  );
}

export function usePreviewPanelHandle() {
  return useQueryStore<ImperativePanelHandle | null>(
    storeKeys.editorLayoutPreviewPanel,
    null,
  );
}

export function useEditorNote() {
  const [note, setNote] = useQueryStore(storeKeys.editorNote, "");

  const setNoteValue = useCallback(
    (v: string | undefined) => setNote(v || ""),
    [setNote],
  );

  return { note, setNote: setNoteValue };
}

export function useEditorAutosave() {
  return usePersisQueryStore(storeKeys.editorAutosave, true);
}
