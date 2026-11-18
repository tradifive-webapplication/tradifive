import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const buildVersion = Date.now().toString();

  return {
  base: process.env.ELECTRON === "true" ? "./" : "/",
  define: {
    __APP_BUILD_VERSION__: JSON.stringify(buildVersion),
  },
  server: {
    host: true,
    allowedHosts: true,
    port: 8080,
    strictPort: false,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api/economic-calendar': {
        target: 'https://nfs.faireconomy.media',
        changeOrigin: true,
        rewrite: () => '/ff_calendar_thisweek.json',
      },
      '/api/market-quote': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (p) => {
          const sym = p.replace(/^\/api\/market-quote\//, '');
          return `/v8/finance/chart/${sym}?interval=1d&range=5d`;
        },
      },
    },
  },
  optimizeDeps: { force: true },
  plugins: [
    react(), 
    {
      name: "tradifive-version-json",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "version.json",
          source: JSON.stringify({ version: buildVersion }),
        });
      },
    },
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
};
});
