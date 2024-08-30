import { createContext, useContext, useEffect } from "react";
import {
  TernaryDarkMode,
  useMediaQuery,
  useTernaryDarkMode,
} from "usehooks-ts";

type ThemeProviderState = {
  theme: TernaryDarkMode;
  setTheme: (theme: TernaryDarkMode) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const { ternaryDarkMode, setTernaryDarkMode } = useTernaryDarkMode({
    defaultValue: "system",
    localStorageKey: "devnote_theme",
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (ternaryDarkMode === "system") {
      root.classList.add(prefersDark ? "dark" : "light");
      return;
    }

    root.classList.add(ternaryDarkMode);
  }, [ternaryDarkMode, prefersDark]);

  const value: ThemeProviderState = {
    theme: ternaryDarkMode,
    setTheme: setTernaryDarkMode,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
