import { useCallback, useMemo } from "react";

import { DEFAULT_RESIZE_PANEL_SIZE } from "~/constants";
import { ThemeMode, useTheme } from "~/context";

import {
  useEditorAutosave,
  useEditorContainedWidth,
  useEditorLayoutState,
  useEditorPanelHandle,
  usePreviewPanelHandle,
} from "./store/editor";
import { SidebarState, useSidebarStateStore } from "./store/layout";

export function useActions() {
  const [, setSidebarState] = useSidebarStateStore();
  const toggleSidebar = useCallback(
    () =>
      setSidebarState((v) =>
        v === SidebarState.Expanded
          ? SidebarState.Minimized
          : SidebarState.Expanded,
      ),
    [setSidebarState],
  );

  const [, setEditorAutosave] = useEditorAutosave();
  const toggleEditorAutosave = useCallback(
    () => setEditorAutosave((v) => !v),
    [setEditorAutosave],
  );

  const [, setEditorContainedWidth] = useEditorContainedWidth();
  const toggleEditorContainedWidth = useCallback(
    () => setEditorContainedWidth((v) => !v),
    [setEditorContainedWidth],
  );

  const [, setState] = useEditorLayoutState();
  const [editorPanelHandle] = useEditorPanelHandle();
  const [previewPanelHandle] = usePreviewPanelHandle();
  const collapseEditorPanel = useCallback(
    () => editorPanelHandle?.collapse(),
    [editorPanelHandle],
  );
  const collapsePreviewPanel = useCallback(
    () => previewPanelHandle?.collapse(),
    [previewPanelHandle],
  );
  const resetPanelSizes = useCallback(
    () => editorPanelHandle?.resize(DEFAULT_RESIZE_PANEL_SIZE),
    [editorPanelHandle],
  );
  const toggleSplitViewMode = useCallback(
    () =>
      setState((v) => ({
        ...v,
        isDisabled: false,
        direction: v.direction === "horizontal" ? "vertical" : "horizontal",
      })),
    [setState],
  );

  const { setTheme } = useTheme();
  const setLightTheme = useCallback(
    () => setTheme(ThemeMode.Light),
    [setTheme],
  );
  const setDarkTheme = useCallback(() => setTheme(ThemeMode.Dark), [setTheme]);
  const setSystemTheme = useCallback(
    () => setTheme(ThemeMode.System),
    [setTheme],
  );

  return useMemo(
    () => ({
      setLightTheme,
      setDarkTheme,
      setSystemTheme,
      collapseEditorPanel,
      collapsePreviewPanel,
      resetPanelSizes,
      toggleSplitViewMode,
      toggleSidebar,
      toggleEditorAutosave,
      toggleEditorContainedWidth,
    }),
    [
      collapseEditorPanel,
      collapsePreviewPanel,
      resetPanelSizes,
      setDarkTheme,
      setLightTheme,
      setSystemTheme,
      toggleEditorAutosave,
      toggleEditorContainedWidth,
      toggleSidebar,
      toggleSplitViewMode,
    ],
  );
}
