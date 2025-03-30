import { getCssVar } from "~/lib/utils";

import { useMediaQuery } from "./index";

export function useIsMobile() {
  return !useMediaQuery(`(min-width:${getCssVar("--breakpoint-md")})`);
}
