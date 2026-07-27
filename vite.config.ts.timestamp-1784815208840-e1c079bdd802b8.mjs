// vite.config.ts
import { defineConfig } from "file:///C:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/lovable-tagger/dist/index.js";
import electron from "file:///C:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/vite-plugin-electron/dist/index.mjs";
import renderer from "file:///C:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/vite-plugin-electron-renderer/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\nikil\\Downloads\\fialgo-connect-main\\fialgo-connect-main";
var vite_config_default = defineConfig(({ mode }) => ({
  base: process.env.ELECTRON === "true" ? "./" : "/",
  server: {
    host: true,
    allowedHosts: true,
    port: 8080,
    strictPort: false,
    hmr: {
      overlay: false
    }
  },
  optimizeDeps: { force: true },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    process.env.ELECTRON === "true" && electron([
      {
        entry: "electron/main.ts"
      }
    ]),
    process.env.ELECTRON === "true" && renderer()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : []
  },
  build: {
    sourcemap: false,
    // Explicitly disable sourcemaps for security
    emptyOutDir: process.env.ELECTRON !== "true"
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxuaWtpbFxcXFxEb3dubG9hZHNcXFxcZmlhbGdvLWNvbm5lY3QtbWFpblxcXFxmaWFsZ28tY29ubmVjdC1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxuaWtpbFxcXFxEb3dubG9hZHNcXFxcZmlhbGdvLWNvbm5lY3QtbWFpblxcXFxmaWFsZ28tY29ubmVjdC1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9uaWtpbC9Eb3dubG9hZHMvZmlhbGdvLWNvbm5lY3QtbWFpbi9maWFsZ28tY29ubmVjdC1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5pbXBvcnQgZWxlY3Ryb24gZnJvbSBcInZpdGUtcGx1Z2luLWVsZWN0cm9uXCI7XG5pbXBvcnQgcmVuZGVyZXIgZnJvbSBcInZpdGUtcGx1Z2luLWVsZWN0cm9uLXJlbmRlcmVyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBiYXNlOiBwcm9jZXNzLmVudi5FTEVDVFJPTiA9PT0gXCJ0cnVlXCIgPyBcIi4vXCIgOiBcIi9cIixcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogdHJ1ZSxcbiAgICBhbGxvd2VkSG9zdHM6IHRydWUsXG4gICAgcG9ydDogODA4MCxcbiAgICBzdHJpY3RQb3J0OiBmYWxzZSxcbiAgICBobXI6IHtcbiAgICAgIG92ZXJsYXk6IGZhbHNlLFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczogeyBmb3JjZTogdHJ1ZSB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSwgXG4gICAgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgIHByb2Nlc3MuZW52LkVMRUNUUk9OID09PSBcInRydWVcIiAmJiBlbGVjdHJvbihbXG4gICAgICB7XG4gICAgICAgIGVudHJ5OiAnZWxlY3Ryb24vbWFpbi50cycsXG4gICAgICB9LFxuICAgIF0pLFxuICAgIHByb2Nlc3MuZW52LkVMRUNUUk9OID09PSBcInRydWVcIiAmJiByZW5kZXJlcigpLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxuICBlc2J1aWxkOiB7XG4gICAgZHJvcDogbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBbXCJjb25zb2xlXCIsIFwiZGVidWdnZXJcIl0gOiBbXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBzb3VyY2VtYXA6IGZhbHNlLCAvLyBFeHBsaWNpdGx5IGRpc2FibGUgc291cmNlbWFwcyBmb3Igc2VjdXJpdHlcbiAgICBlbXB0eU91dERpcjogcHJvY2Vzcy5lbnYuRUxFQ1RST04gIT09IFwidHJ1ZVwiLFxuICB9LFxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThYLFNBQVMsb0JBQW9CO0FBQzNaLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFDaEMsT0FBTyxjQUFjO0FBQ3JCLE9BQU8sY0FBYztBQUxyQixJQUFNLG1DQUFtQztBQVF6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLE1BQU0sUUFBUSxJQUFJLGFBQWEsU0FBUyxPQUFPO0FBQUEsRUFDL0MsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLElBQ2QsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osS0FBSztBQUFBLE1BQ0gsU0FBUztBQUFBLElBQ1g7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjLEVBQUUsT0FBTyxLQUFLO0FBQUEsRUFDNUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUEsSUFDMUMsUUFBUSxJQUFJLGFBQWEsVUFBVSxTQUFTO0FBQUEsTUFDMUM7QUFBQSxRQUNFLE9BQU87QUFBQSxNQUNUO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxRQUFRLElBQUksYUFBYSxVQUFVLFNBQVM7QUFBQSxFQUM5QyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU0sU0FBUyxlQUFlLENBQUMsV0FBVyxVQUFVLElBQUksQ0FBQztBQUFBLEVBQzNEO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUE7QUFBQSxJQUNYLGFBQWEsUUFBUSxJQUFJLGFBQWE7QUFBQSxFQUN4QztBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
