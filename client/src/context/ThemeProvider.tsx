import { createContext, useContext, useEffect } from "react";

import { useMediaQuery } from "~/hooks";
import { useThemeAtom } from "~/hooks/store";

export const ThemeMode = {
  Light: "light",
  Dark: "dark",
  System: "system",
} as const;

export type ThemeModeKey = (typeof ThemeMode)[keyof typeof ThemeMode];

type ThemeProviderState = {
  resolvedTheme: Exclude<ThemeModeKey, typeof ThemeMode.System>;
  theme: ThemeModeKey;
  setTheme: (theme: ThemeModeKey) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined,
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isPreferredDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [theme, setTheme] = useThemeAtom();

  const resolvedTheme: ThemeProviderState["resolvedTheme"] =
    theme === ThemeMode.System
      ? isPreferredDark
        ? ThemeMode.Dark
        : ThemeMode.Light
      : theme;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(ThemeMode.Light, ThemeMode.Dark);
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    // const getBgCssVar = () => getCssVar("--background").trim();
    // const hsl = hslToNumberValues(getBgCssVar());
    // const hex = hsl.length ? hslToHex(hsl[0], hsl[1], hsl[2]) : "#000000";

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      // TODO: update color
      // metaThemeColor.setAttribute("content", hex);
    }
  }, [resolvedTheme]);

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
