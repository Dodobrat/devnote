import tailwindTypographyPlugin from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import tailwindCssAnimatePlugin from "tailwindcss-animate";
import tailwindCssSafeAreaPlugin from "tailwindcss-safe-area";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        coarse: { raw: "(pointer: coarse)" },
        fine: { raw: "(pointer: fine)" },
        "display-browser": { raw: "(display-mode: browser)" },
        "display-standalone": { raw: "(display-mode: standalone)" },
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "gravity-bounce": {
          "0%": { transform: "scale(1, 1) translateY(0)" },
          "2.5%": { transform: "scale(1.01, 0.99) translateY(0)" }, // 0.1s
          "7.5%": { transform: "scale(0.99, 1.01) translateY(-0.375rem)" }, // 0.3s
          "12.5%": { transform: "scale(1.005, 0.995) translateY(0)" }, // 0.5s
          "14.25%": { transform: "scale(1, 1) translateY(-0.0125rem)" }, // 0.57s
          "16%": { transform: "scale(1, 1) translateY(0)" }, // 0.64s
          "25%": { transform: "scale(1, 1) translateY(0)" }, // 1s
          "100%": { transform: "scale(1, 1) translateY(0)" }, // 4s
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gravity-bounce":
          "gravity-bounce 4s cubic-bezier(0.280, 0.840, 0.420, 1) infinite",
      },
    },
  },
  plugins: [
    tailwindCssAnimatePlugin,
    tailwindTypographyPlugin,
    tailwindCssSafeAreaPlugin,
  ],
} satisfies Config;
