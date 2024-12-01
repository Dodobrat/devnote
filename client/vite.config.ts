import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
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
            src: "/desktop-notes.png",
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
            src: "/mobile-notes.png",
            sizes: "640x1136",
            type: "image/png",
          },
        ],
      },
    }),
    visualizer({
      template: "flamegraph",
    }),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/highlight.js")) {
            return "highlight-js";
          }
        },
      },
    },
  },
});
