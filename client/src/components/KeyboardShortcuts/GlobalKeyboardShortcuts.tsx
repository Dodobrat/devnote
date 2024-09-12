import { useNavigate } from "react-router-dom";

import { useKeyDownEvent } from "~/hooks";
import { SidebarState, useSidebarStateStore } from "~/hooks/store/layout";
import { AppRoutes } from "~/routes";

export function GlobalKeyboardShortcuts() {
  return (
    <>
      <GlobalKeyboardShortcutToggleSidebar />
      <GlobalKeyboardShortcutNewNote />
    </>
  );
}

function GlobalKeyboardShortcutToggleSidebar() {
  const [, setSidebarState] = useSidebarStateStore();

  useKeyDownEvent((e, isMac) => {
    // if key combination is ctrl / cmd + b
    if ((isMac ? e.metaKey : e.ctrlKey) && e.key === "b") {
      e.preventDefault();
      setSidebarState((v) =>
        v === SidebarState.Expanded
          ? SidebarState.Minimized
          : SidebarState.Expanded,
      );
    }
  });

  return null;
}

function GlobalKeyboardShortcutNewNote() {
  const navigate = useNavigate();

  useKeyDownEvent((e, isMac) => {
    // if key combination is ctrl / cmd + Enter
    if ((isMac ? e.metaKey : e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      navigate(AppRoutes.Root);
    }
  });

  return null;
}
