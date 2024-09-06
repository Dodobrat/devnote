import { useEffect, useState } from "react";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const handler = () => setMatches(window.matchMedia(query).matches);
    window.matchMedia(query).addEventListener("change", handler);
    return () => {
      window.matchMedia(query).removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}
