import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),

    VitePWA({
      devOptions: {
        enabled: true,
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000, // ~5mb
      },
      includeAssets: [
        "/favicon.ico",
        "/robots.txt",
        "/safari-pinned-tab.svg",
        "/apple-touch-icon.png",
        "/favicon-16x16.png",
        "/favicon-32x32.png",
        "/android-chrome-192x192.png",
        "/android-chrome-512x512.png",
        "/favicon.svg",
      ],
      manifest: {
        name: "DevNote",
        short_name: "DevNote",
        theme_color: "#000000",
        background_color: "#000000",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/desktop-welcome.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "/desktop-note.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "/mobile-welcome.png",
            sizes: "640x1136",
            type: "image/png",
          },
          {
            src: "/mobile-note.png",
            sizes: "640x1136",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    open: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
});
