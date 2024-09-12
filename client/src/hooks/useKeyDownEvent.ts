import { useEffect } from "react";

import { getIsMac } from "~/lib/utils";

export function useKeyDownEvent(
  cb: (e: KeyboardEvent, isMac: boolean) => void,
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = getIsMac();
      cb(e, Boolean(isMac));
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [cb]);

  return null;
}
