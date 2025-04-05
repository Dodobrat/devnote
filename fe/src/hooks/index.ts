import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getCssVar } from "~/lib/utils";

export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

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

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const controller = new AbortController();

    window
      .matchMedia(query)
      .addEventListener(
        "change",
        () => setMatches(window.matchMedia(query).matches),
        { signal: controller.signal },
      );

    return () => {
      controller.abort();
    };
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return !useMediaQuery(`(min-width:${getCssVar("--breakpoint-md")})`);
}

export function useOnlineNotification() {
  useEffect(() => {
    const controller = new AbortController();

    window.addEventListener(
      "online",
      () => {
        toast.dismiss("indicator:offline");
        toast.success("You are online", {
          id: "indicator:online",
          closeButton: false,
        });
      },
      { signal: controller.signal },
    );
    window.addEventListener(
      "offline",
      () => {
        toast.dismiss("indicator:online");
        toast.warning("You are offline", {
          id: "indicator:offline",
          closeButton: false,
        });
      },
      { signal: controller.signal },
    );

    return () => {
      controller.abort();
    };
  }, []);
}
