import { lazy, Suspense } from "react";

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
  MonacoEditorFallback,
} from "./components";

const MonacoEditor = lazy(async () => {
  const res = await import("./components/MonacoEditor");
  return { default: res.MonacoEditor };
});

export function Editor() {
  return (
    <Page>
      <EditorResizableGroup>
        <MonacoInstanceProvider>
          <EditorResizePanel>
            <Suspense fallback={<MonacoEditorFallback />}>
              <MonacoEditor />
            </Suspense>
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
