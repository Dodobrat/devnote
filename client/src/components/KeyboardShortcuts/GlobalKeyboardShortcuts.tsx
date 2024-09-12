import { useNavigate } from "react-router-dom";

import { useActions, useKeyDownEvent } from "~/hooks";
import { AppRoutes } from "~/routes";

export function GlobalKeyboardShortcuts() {
  const navigate = useNavigate();

  const { toggleSidebar } = useActions();

  useKeyDownEvent((e, isMac) => {
    if ((isMac ? e.metaKey : e.ctrlKey) && e.key === "b") {
      e.preventDefault();
      toggleSidebar();
    }
  });

  useKeyDownEvent((e, isMac) => {
    // if key combination is ctrl / cmd + Enter
    if ((isMac ? e.metaKey : e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      navigate(AppRoutes.Root);
    }
  });

  return null;
}
