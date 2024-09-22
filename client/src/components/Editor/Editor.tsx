import {
  getIsCollapseEditorPanelKeyCombo,
  getIsCollapsePreviewPanelKeyCombo,
  getIsResetEditorPanelSizesKeyCombo,
  getIsToggleSplitViewModeKeyCombo,
} from "~/constants/shortcuts";
import { MonacoInstanceProvider } from "~/context";
import { useActions, useKeyDownEvent } from "~/hooks";

import { Page } from "../Layout";
import {
  EditorOutput,
  EditorOutputResizePanel,
  EditorResizableGroup,
  EditorResizeHandle,
  EditorResizePanel,
  MonacoEditor,
} from "./components";

export function Editor() {
  return (
    <Page>
      <EditorResizableGroup>
        <MonacoInstanceProvider>
          <EditorResizePanel>
            <MonacoEditor />
          </EditorResizePanel>

          <EditorResizeHandle />
        </MonacoInstanceProvider>

        <EditorOutputResizePanel>
          <EditorOutput />
        </EditorOutputResizePanel>
      </EditorResizableGroup>

      <EditorKeyboardShortcuts />
    </Page>
  );
}

function EditorKeyboardShortcuts() {
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
