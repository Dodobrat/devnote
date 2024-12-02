import { useCallback, useMemo } from "react";

import { ThemeMode, useTheme } from "~/context";

import { useEditorAutosave, useEditorContainedWidth } from "./store/editor";
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
      toggleSidebar,
      toggleEditorAutosave,
      toggleEditorContainedWidth,
    }),
    [
      setDarkTheme,
      setLightTheme,
      setSystemTheme,
      toggleEditorAutosave,
      toggleEditorContainedWidth,
      toggleSidebar,
    ],
  );
}
