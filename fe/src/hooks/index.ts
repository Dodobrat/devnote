import { useEffect, useState } from "react";

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
      .addEventListener("change", () =>
        setMatches(window.matchMedia(query).matches),
      );

    return () => {
      controller.abort();
    };
  }, [query]);

  return matches;
}
