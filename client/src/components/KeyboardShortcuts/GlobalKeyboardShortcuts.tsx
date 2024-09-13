import { useNavigate } from "react-router-dom";

import {
  getIsCreateNewNoteKeyCombo,
  getIsToggleSidebarKeyCombo,
} from "~/constants/shortcuts";
import { useActions, useKeyDownEvent } from "~/hooks";
import { AppRoutes } from "~/routes";

export function GlobalKeyboardShortcuts() {
  const navigate = useNavigate();

  const { toggleSidebar } = useActions();

  useKeyDownEvent((e) => {
    if (getIsToggleSidebarKeyCombo(e)) {
      e.preventDefault();
      toggleSidebar();
    }
  });

  useKeyDownEvent((e) => {
    if (getIsCreateNewNoteKeyCombo(e)) {
      e.preventDefault();
      navigate(AppRoutes.Root);
    }
  });

  return null;
}
