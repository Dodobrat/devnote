import { useEffect } from "react";

export function useKeyDownEvent(cb: (e: KeyboardEvent) => void) {
  useEffect(() => {
    document.addEventListener("keydown", cb);
    return () => {
      document.removeEventListener("keydown", cb);
    };
  }, [cb]);

  return null;
}
