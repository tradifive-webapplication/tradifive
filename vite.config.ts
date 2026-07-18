import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.ELECTRON === "true" ? "./" : "/",
  server: {
    host: true,
    allowedHosts: true,
    port: 8080,
    strictPort: false,
    hmr: {
      overlay: false,
    },
  },
  optimizeDeps: { force: true },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    process.env.ELECTRON === "true" && electron([
      {
        entry: 'electron/main.ts',
      },
    ]),
    process.env.ELECTRON === "true" && renderer(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  build: {
    sourcemap: false, // Explicitly disable sourcemaps for security
    emptyOutDir: process.env.ELECTRON !== "true",
  },
}));
