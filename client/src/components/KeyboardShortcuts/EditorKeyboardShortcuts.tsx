import { useActions, useKeyDownEvent } from "~/hooks";

export function EditorKeyboardShortcuts() {
  const {
    collapseEditorPanel,
    collapsePreviewPanel,
    toggleSplitViewMode,
    resetPanelSizes,
  } = useActions();

  useKeyDownEvent((e, isMac) => {
    if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === ",") {
      e.preventDefault();
      collapseEditorPanel();
    }
  });

  useKeyDownEvent((e, isMac) => {
    if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === "m") {
      e.preventDefault();
      toggleSplitViewMode();
    }
  });

  useKeyDownEvent((e, isMac) => {
    if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === ";") {
      e.preventDefault();
      resetPanelSizes();
    }
  });

  useKeyDownEvent((e, isMac) => {
    if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === ".") {
      e.preventDefault();
      collapsePreviewPanel();
    }
  });

  return null;
}
