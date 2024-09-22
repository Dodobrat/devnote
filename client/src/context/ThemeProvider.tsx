import { createContext, useContext, useEffect } from "react";

import { useMediaQuery } from "~/hooks";
import { storeKeys, usePersisQueryStore } from "~/hooks/store";

export enum ThemeMode {
  Light = "light",
  Dark = "dark",
  System = "system",
}

type ThemeProviderState = {
  resolvedTheme: ThemeMode;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isPreferredDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [theme, setTheme] = usePersisQueryStore<ThemeMode>(
    storeKeys.theme,
    ThemeMode.System,
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(ThemeMode.Light, ThemeMode.Dark);

    if (theme === ThemeMode.System) {
      const systemTheme = isPreferredDark ? ThemeMode.Dark : ThemeMode.Light;
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [isPreferredDark, theme]);

  const resolvedTheme =
    theme === ThemeMode.System
      ? isPreferredDark
        ? ThemeMode.Dark
        : ThemeMode.Light
      : theme;

  const value: ThemeProviderState = {
    resolvedTheme,
    theme,
    setTheme,
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
