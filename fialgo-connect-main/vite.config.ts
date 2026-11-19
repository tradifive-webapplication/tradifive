import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dotenv from "dotenv";
import { componentTagger } from "lovable-tagger";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

dotenv.config();
dotenv.config({ path: ".env.local" });

function razorpayDevApiPlugin() {
  return {
    name: "razorpay-dev-api-middleware",
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url?.split("?")[0];
        if (url === "/api/create-order" || url === "/api/verify-payment") {
          let bodyStr = "";
          req.on("data", (chunk: any) => {
            bodyStr += chunk;
          });
          req.on("end", async () => {
            try {
              req.body = bodyStr ? JSON.parse(bodyStr) : {};
            } catch {
              req.body = {};
            }
            try {
              if (url === "/api/create-order") {
                const handler = (await import("./api/create-order.ts")).default;
                await handler(req, res);
              } else if (url === "/api/verify-payment") {
                const handler = (await import("./api/verify-payment.ts")).default;
                await handler(req, res);
              }
            } catch (err: any) {
              console.error("[Razorpay Dev Middleware Error]:", err);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: err?.message || "Internal Server Error" }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

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
  optimizeDeps: {
    include: ["react", "react-dom", "@radix-ui/react-tooltip", "@tanstack/react-query"],
    force: true,
  },
  plugins: [
    razorpayDevApiPlugin(),
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
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"],
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
