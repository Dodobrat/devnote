import { cloneElement } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { CommandPalette } from "../CommandPalette";
import { GlobalKeyboardShortcuts } from "../KeyboardShortcuts";
import { Navigation } from "./Navigation";
import { OnlineIndicator } from "./OnlineIndicator";

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
