import { getCssVar } from "~/lib/utils";

import { useMediaQuery } from "../useMediaQuery";
import { storeKeys, usePersisQueryStore } from "./index";

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
