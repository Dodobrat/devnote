import { cloneElement, useEffect } from "react";
import { useLocation, useNavigate, useOutlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { WifiIcon, WifiOffIcon } from "lucide-react";
import { ExternalToast, toast } from "sonner";

import {
  getIsCreateNewNoteKeyCombo,
  getIsToggleSidebarKeyCombo,
} from "~/constants/shortcuts";
import { useActions, useKeyDownEvent } from "~/hooks";
import { AppRoutes } from "~/routes";

import { CommandPalette } from "../CommandPalette";
import { Navigation } from "./Navigation";

function AnimatedOutlet() {
  const location = useLocation();
  const element = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={true}>
      {element && cloneElement(element, { key: location.pathname })}
    </AnimatePresence>
  );
}

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <GlobalKeyboardShortcuts />
      <OnlineIndicator />

      <CommandPalette />

      <Navigation />

      <AnimatedOutlet />
    </div>
  );
}

function GlobalKeyboardShortcuts() {
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

const commonOnlineIndicatorOptions: ExternalToast = {
  id: "online-indicator",
  duration: 1000 * 30,
  closeButton: true,
};

function OnlineIndicator() {
  useEffect(() => {
    const handleOnline = () => {
      toast.info("You are online", {
        icon: <WifiIcon />,
        ...commonOnlineIndicatorOptions,
      });
    };

    const handleOffline = () => {
      toast.info("You are offline", {
        icon: <WifiOffIcon />,
        ...commonOnlineIndicatorOptions,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return null;
}
