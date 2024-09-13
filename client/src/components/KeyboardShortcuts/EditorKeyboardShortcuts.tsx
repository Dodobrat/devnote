import {
  getIsCollapseEditorPanelKeyCombo,
  getIsCollapsePreviewPanelKeyCombo,
  getIsResetEditorPanelSizesKeyCombo,
  getIsToggleSplitViewModeKeyCombo,
} from "~/constants/shortcuts";
import { useActions, useKeyDownEvent } from "~/hooks";

export function EditorKeyboardShortcuts() {
  const {
    collapseEditorPanel,
    collapsePreviewPanel,
    toggleSplitViewMode,
    resetPanelSizes,
  } = useActions();

  useKeyDownEvent((e) => {
    if (getIsCollapseEditorPanelKeyCombo(e)) {
      e.preventDefault();
      collapseEditorPanel();
    }
  });

  useKeyDownEvent((e) => {
    if (getIsToggleSplitViewModeKeyCombo(e)) {
      e.preventDefault();
      toggleSplitViewMode();
    }
  });

  useKeyDownEvent((e) => {
    if (getIsResetEditorPanelSizesKeyCombo(e)) {
      e.preventDefault();
      resetPanelSizes();
    }
  });

  useKeyDownEvent((e) => {
    if (getIsCollapsePreviewPanelKeyCombo(e)) {
      e.preventDefault();
      collapsePreviewPanel();
    }
  });

  return null;
}
