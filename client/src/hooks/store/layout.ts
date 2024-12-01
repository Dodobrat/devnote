import { getCssVar } from "~/lib/utils";

import { useMediaQuery } from "../useMediaQuery";
import { storeKeys, usePersistQueryStore, useQueryStore } from "./index";

export enum SidebarState {
  Minimized = "minimized",
  Expanded = "expanded",
}

export function useSidebarStateStore() {
  const isLargerThanLg = useMediaQuery(getCssVar("--screen-lg"));

  return usePersistQueryStore(
    storeKeys.sidebarState,
    isLargerThanLg ? SidebarState.Expanded : SidebarState.Minimized,
  );
}

export function useCommandPaletteOpenStore() {
  return useQueryStore(storeKeys.commandPaletteOpenState, false);
}
