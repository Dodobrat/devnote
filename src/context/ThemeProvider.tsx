import { createContext, useContext, useEffect } from "react";

import { useMediaQuery } from "~/hooks";
import { useThemeAtom } from "~/hooks/store";
import { getCssVar } from "~/lib/utils";

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
    const getBgCssVar = () => getCssVar("--background").trim();
    const hex = oklchToHex(getBgCssVar());

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", hex);
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

// Generated with chat GPT, no idea how this works
function oklchToHex(oklch: string): string {
  const m = oklch.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!m) throw new Error("Invalid format");
  const L = +m[1],
    C = +m[2],
    H = (+m[3] * Math.PI) / 180;
  const a = Math.cos(H) * C,
    b = Math.sin(H) * C;
  const l = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s = L - 0.0894841775 * a - 1.291485548 * b;
  const [l3, m3, s3] = [l, m_, s].map((v) => v * v * v);

  let R = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let G = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let B = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

  const gamma = (v: number) =>
    v <= 0.0031308
      ? 12.92 * v
      : 1.055 * Math.pow(Math.min(Math.max(v, 0), 1), 1 / 2.4) - 0.055;

  R = gamma(R);
  G = gamma(G);
  B = gamma(B);

  const toHex = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(R)}${toHex(G)}${toHex(B)}`;
}
