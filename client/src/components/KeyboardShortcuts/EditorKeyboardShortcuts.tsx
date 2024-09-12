import { DEFAULT_RESIZE_PANEL_SIZE } from "~/constants";
import { useKeyDownEvent } from "~/hooks";
import {
  useEditorLayoutState,
  useEditorPanelHandle,
  usePreviewPanelHandle,
} from "~/hooks/store/editor";

export function EditorKeyboardShortcuts() {
  return (
    <>
      <EditorKeyboardShortcutCollapseEditorPanel />
      <EditorKeyboardShortcutToggleSplitViewMode />
      <EditorKeyboardShortcutResetSplitView />
      <EditorKeyboardShortcutCollapsePreviewPanel />
    </>
  );
}

function EditorKeyboardShortcutCollapseEditorPanel() {
  const [editorPanelHandle] = useEditorPanelHandle();

  useKeyDownEvent((e, isMac) => {
    if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === ",") {
      e.preventDefault();
      editorPanelHandle?.collapse();
    }
  });

  return null;
}

function EditorKeyboardShortcutToggleSplitViewMode() {
  const [, setState] = useEditorLayoutState();

  useKeyDownEvent((e, isMac) => {
    if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === "m") {
      e.preventDefault();
      setState((v) => ({
        ...v,
        isDisabled: false,
        direction: v.direction === "horizontal" ? "vertical" : "horizontal",
      }));
    }
  });

  return null;
}

function EditorKeyboardShortcutResetSplitView() {
  const [editorPanelHandle] = useEditorPanelHandle();

  useKeyDownEvent((e, isMac) => {
    if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === ";") {
      e.preventDefault();
      editorPanelHandle?.resize(DEFAULT_RESIZE_PANEL_SIZE);
    }
  });

  return null;
}

function EditorKeyboardShortcutCollapsePreviewPanel() {
  const [previewPanelHandle] = usePreviewPanelHandle();

  useKeyDownEvent((e, isMac) => {
    if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === ".") {
      e.preventDefault();
      previewPanelHandle?.collapse();
    }
  });

  return null;
}
