import { createContext, useContext, useEffect, useState } from "react";

import { storeKeys } from "~/hooks/store";
import { webStorage } from "~/lib/utils";

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
  const [theme, setTheme] = useState<ThemeMode>(
    () =>
      (webStorage.getItem(storeKeys.theme) as ThemeMode) || ThemeMode.System,
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove(ThemeMode.Light, ThemeMode.Dark);

    if (theme === ThemeMode.System) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? ThemeMode.Dark
        : ThemeMode.Light;

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const resolvedTheme =
    theme === ThemeMode.System
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? ThemeMode.Dark
        : ThemeMode.Light
      : theme;

  const value: ThemeProviderState = {
    resolvedTheme,
    theme,
    setTheme: (theme: ThemeMode) => {
      webStorage.setItem(storeKeys.theme, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}
