import { getCssVar } from "~/lib/utils";

import { useMediaQuery } from "../useMediaQuery";
import { storeKeys, usePersisQueryStore, useQueryStore } from "./index";

export enum SidebarState {
  Minimized = "minimized",
  Expanded = "expanded",
}

export function useSidebarStateStore() {
  const isLargerThanLg = useMediaQuery(getCssVar("--screen-lg"));

  return usePersisQueryStore(
    storeKeys.sidebarState,
    isLargerThanLg ? SidebarState.Expanded : SidebarState.Minimized,
  );
}

export function useCommandPaletteOpenStore() {
  return useQueryStore(storeKeys.commandPaletteOpenState, false);
}

export function useMobileOptimizationMessageSeenStore() {
  return useQueryStore(storeKeys.mobileOptimizationMessageSeen, false);
}
