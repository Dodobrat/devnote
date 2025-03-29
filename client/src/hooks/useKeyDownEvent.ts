import { useEffect } from "react";

export function useKeyDownEvent(cb: (e: KeyboardEvent) => void) {
  useEffect(() => {
    const controller = new AbortController();

    document.addEventListener("keydown", cb, {
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [cb]);
}
