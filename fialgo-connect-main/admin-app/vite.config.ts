import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.ELECTRON === "true" ? "./" : "/",
  server: {
    host: "::",
    port: 8082,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    process.env.ELECTRON === "true" && electron([
      {
        entry: 'electron/main.ts',
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
      }
    ]),
    process.env.ELECTRON === "true" && renderer(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
