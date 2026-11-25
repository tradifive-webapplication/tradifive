var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// api/create-order.ts
var create_order_exports = {};
__export(create_order_exports, {
  default: () => handler
});
import Razorpay from "file:///C:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/razorpay/dist/razorpay.js";
import dotenv from "file:///C:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/dotenv/lib/main.js";
function sendJson(res, status, data) {
  if (typeof res.status === "function") {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );
  if (req.method === "OPTIONS") {
    if (typeof res.status === "function") {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed. Only POST is supported." });
  }
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    console.error("Razorpay credentials missing from server environment");
    return sendJson(res, 500, { error: "Razorpay credentials not configured on server" });
  }
  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return sendJson(res, 400, { error: "Invalid JSON body" });
      }
    }
    const { amount, currency = "INR", receipt, notes } = body || {};
    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount < 100) {
      return sendJson(res, 400, {
        error: "Invalid amount. Minimum amount is 100 paise (1 INR)."
      });
    }
    const razorpay = new Razorpay({
      key_id,
      key_secret
    });
    const orderOptions = {
      amount: Math.round(numericAmount),
      currency: (currency || "INR").toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: notes || {}
    };
    const order = await razorpay.orders.create(orderOptions);
    return sendJson(res, 200, {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    if (error?.statusCode === 401 || error?.error?.code === "BAD_REQUEST_ERROR" && error?.message?.includes("auth")) {
      return sendJson(res, 401, {
        error: "Razorpay authentication failed. Please verify API keys."
      });
    }
    return sendJson(res, 500, {
      error: error?.error?.description || error?.message || "Failed to create Razorpay order"
    });
  }
}
var init_create_order = __esm({
  "api/create-order.ts"() {
    dotenv.config();
    dotenv.config({ path: ".env.local" });
  }
});

// api/verify-payment.ts
var verify_payment_exports = {};
__export(verify_payment_exports, {
  default: () => handler2
});
import crypto from "crypto";
import dotenv2 from "file:///C:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/dotenv/lib/main.js";
function sendJson2(res, status, data) {
  if (typeof res.status === "function") {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}
async function handler2(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );
  if (req.method === "OPTIONS") {
    if (typeof res.status === "function") {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }
  if (req.method !== "POST") {
    return sendJson2(res, 405, { success: false, error: "Method not allowed. Only POST is supported." });
  }
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) {
    console.error("Razorpay key secret missing from server environment");
    return sendJson2(res, 500, { success: false, error: "Razorpay secret not configured on server" });
  }
  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return sendJson2(res, 400, { success: false, error: "Invalid JSON body" });
      }
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return sendJson2(res, 400, {
        success: false,
        error: "Missing required payment verification parameters (razorpay_order_id, razorpay_payment_id, razorpay_signature)"
      });
    }
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac("sha256", key_secret).update(payload).digest("hex");
    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    const signatureBuffer = Buffer.from(razorpay_signature, "utf-8");
    const isMatch = expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    if (!isMatch) {
      console.warn("Razorpay signature mismatch for order:", razorpay_order_id);
      return sendJson2(res, 400, {
        success: false,
        error: "Payment verification failed: Signature mismatch. Do not fulfill order."
      });
    }
    return sendJson2(res, 200, {
      success: true,
      message: "Payment signature verified successfully",
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return sendJson2(res, 500, {
      success: false,
      error: error?.message || "Internal server error during verification"
    });
  }
}
var init_verify_payment = __esm({
  "api/verify-payment.ts"() {
    dotenv2.config();
    dotenv2.config({ path: ".env.local" });
  }
});

// vite.config.ts
import { defineConfig } from "file:///C:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import dotenv3 from "file:///C:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/dotenv/lib/main.js";
import { componentTagger } from "file:///C:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/lovable-tagger/dist/index.js";
import electron from "file:///C:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/vite-plugin-electron/dist/index.mjs";
import renderer from "file:///C:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/vite-plugin-electron-renderer/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\nikil\\Downloads\\fialgo-connect-main\\fialgo-connect-main";
dotenv3.config();
dotenv3.config({ path: ".env.local" });
function razorpayDevApiPlugin() {
  return {
    name: "razorpay-dev-api-middleware",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url === "/api/create-order" || url === "/api/verify-payment") {
          let bodyStr = "";
          req.on("data", (chunk) => {
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
                const handler3 = (await Promise.resolve().then(() => (init_create_order(), create_order_exports))).default;
                await handler3(req, res);
              } else if (url === "/api/verify-payment") {
                const handler3 = (await Promise.resolve().then(() => (init_verify_payment(), verify_payment_exports))).default;
                await handler3(req, res);
              }
            } catch (err) {
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
    }
  };
}
var vite_config_default = defineConfig(({ mode }) => {
  const buildVersion = Date.now().toString();
  return {
    base: process.env.ELECTRON === "true" ? "./" : "/",
    define: {
      __APP_BUILD_VERSION__: JSON.stringify(buildVersion)
    },
    server: {
      host: true,
      allowedHosts: true,
      port: 8080,
      strictPort: false,
      hmr: {
        overlay: false
      },
      proxy: {
        "/api/economic-calendar": {
          target: "https://nfs.faireconomy.media",
          changeOrigin: true,
          rewrite: () => "/ff_calendar_thisweek.json"
        },
        "/api/market-quote": {
          target: "https://query1.finance.yahoo.com",
          changeOrigin: true,
          rewrite: (p) => {
            const sym = p.replace(/^\/api\/market-quote\//, "");
            return `/v8/finance/chart/${sym}?interval=1d&range=5d`;
          }
        }
      }
    },
    optimizeDeps: {
      include: ["react", "react-dom", "@radix-ui/react-tooltip", "@tanstack/react-query"],
      force: true
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
            source: JSON.stringify({ version: buildVersion })
          });
        }
      },
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
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        "react": path.resolve(__vite_injected_original_dirname, "./node_modules/react"),
        "react-dom": path.resolve(__vite_injected_original_dirname, "./node_modules/react-dom")
      },
      dedupe: ["react", "react-dom"]
    },
    esbuild: {
      drop: mode === "production" ? ["console", "debugger"] : []
    },
    build: {
      sourcemap: false,
      // Explicitly disable sourcemaps for security
      emptyOutDir: process.env.ELECTRON !== "true"
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYXBpL2NyZWF0ZS1vcmRlci50cyIsICJhcGkvdmVyaWZ5LXBheW1lbnQudHMiLCAidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxuaWtpbFxcXFxEb3dubG9hZHNcXFxcZmlhbGdvLWNvbm5lY3QtbWFpblxcXFxmaWFsZ28tY29ubmVjdC1tYWluXFxcXGFwaVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbmlraWxcXFxcRG93bmxvYWRzXFxcXGZpYWxnby1jb25uZWN0LW1haW5cXFxcZmlhbGdvLWNvbm5lY3QtbWFpblxcXFxhcGlcXFxcY3JlYXRlLW9yZGVyLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9uaWtpbC9Eb3dubG9hZHMvZmlhbGdvLWNvbm5lY3QtbWFpbi9maWFsZ28tY29ubmVjdC1tYWluL2FwaS9jcmVhdGUtb3JkZXIudHNcIjtpbXBvcnQgdHlwZSB7IFZlcmNlbFJlcXVlc3QsIFZlcmNlbFJlc3BvbnNlIH0gZnJvbSAnQHZlcmNlbC9ub2RlJztcbmltcG9ydCBSYXpvcnBheSBmcm9tICdyYXpvcnBheSc7XG5pbXBvcnQgZG90ZW52IGZyb20gJ2RvdGVudic7XG5cbmRvdGVudi5jb25maWcoKTtcbmRvdGVudi5jb25maWcoeyBwYXRoOiAnLmVudi5sb2NhbCcgfSk7XG5cbmZ1bmN0aW9uIHNlbmRKc29uKHJlczogVmVyY2VsUmVzcG9uc2UgfCBhbnksIHN0YXR1czogbnVtYmVyLCBkYXRhOiBhbnkpIHtcbiAgaWYgKHR5cGVvZiByZXMuc3RhdHVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoc3RhdHVzKS5qc29uKGRhdGEpO1xuICB9XG4gIHJlcy5zdGF0dXNDb2RlID0gc3RhdHVzO1xuICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICByZXR1cm4gcmVzLmVuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxOiBWZXJjZWxSZXF1ZXN0IHwgYW55LCByZXM6IFZlcmNlbFJlc3BvbnNlIHwgYW55KSB7XG4gIC8vIFNldCBDT1JTIGhlYWRlcnNcbiAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnLCAndHJ1ZScpO1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCAnKicpO1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJywgJ0dFVCxPUFRJT05TLFBBVENILERFTEVURSxQT1NULFBVVCcpO1xuICByZXMuc2V0SGVhZGVyKFxuICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJyxcbiAgICAnWC1DU1JGLVRva2VuLCBYLVJlcXVlc3RlZC1XaXRoLCBBY2NlcHQsIEFjY2VwdC1WZXJzaW9uLCBDb250ZW50LUxlbmd0aCwgQ29udGVudC1NRDUsIENvbnRlbnQtVHlwZSwgRGF0ZSwgWC1BcGktVmVyc2lvbiwgQXV0aG9yaXphdGlvbidcbiAgKTtcblxuICBpZiAocmVxLm1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgaWYgKHR5cGVvZiByZXMuc3RhdHVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmVuZCgpO1xuICAgIH1cbiAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICByZXR1cm4gcmVzLmVuZCgpO1xuICB9XG5cbiAgaWYgKHJlcS5tZXRob2QgIT09ICdQT1NUJykge1xuICAgIHJldHVybiBzZW5kSnNvbihyZXMsIDQwNSwgeyBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZC4gT25seSBQT1NUIGlzIHN1cHBvcnRlZC4nIH0pO1xuICB9XG5cbiAgY29uc3Qga2V5X2lkID0gcHJvY2Vzcy5lbnYuUkFaT1JQQVlfS0VZX0lEIHx8IHByb2Nlc3MuZW52LlZJVEVfUkFaT1JQQVlfS0VZX0lEO1xuICBjb25zdCBrZXlfc2VjcmV0ID0gcHJvY2Vzcy5lbnYuUkFaT1JQQVlfS0VZX1NFQ1JFVDtcblxuICBpZiAoIWtleV9pZCB8fCAha2V5X3NlY3JldCkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1Jhem9ycGF5IGNyZWRlbnRpYWxzIG1pc3NpbmcgZnJvbSBzZXJ2ZXIgZW52aXJvbm1lbnQnKTtcbiAgICByZXR1cm4gc2VuZEpzb24ocmVzLCA1MDAsIHsgZXJyb3I6ICdSYXpvcnBheSBjcmVkZW50aWFscyBub3QgY29uZmlndXJlZCBvbiBzZXJ2ZXInIH0pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBsZXQgYm9keSA9IHJlcS5ib2R5O1xuICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGJvZHkgPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gc2VuZEpzb24ocmVzLCA0MDAsIHsgZXJyb3I6ICdJbnZhbGlkIEpTT04gYm9keScgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgeyBhbW91bnQsIGN1cnJlbmN5ID0gJ0lOUicsIHJlY2VpcHQsIG5vdGVzIH0gPSBib2R5IHx8IHt9O1xuXG4gICAgY29uc3QgbnVtZXJpY0Ftb3VudCA9IE51bWJlcihhbW91bnQpO1xuICAgIGlmICghYW1vdW50IHx8IGlzTmFOKG51bWVyaWNBbW91bnQpIHx8IG51bWVyaWNBbW91bnQgPCAxMDApIHtcbiAgICAgIHJldHVybiBzZW5kSnNvbihyZXMsIDQwMCwge1xuICAgICAgICBlcnJvcjogJ0ludmFsaWQgYW1vdW50LiBNaW5pbXVtIGFtb3VudCBpcyAxMDAgcGFpc2UgKDEgSU5SKS4nXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCByYXpvcnBheSA9IG5ldyBSYXpvcnBheSh7XG4gICAgICBrZXlfaWQsXG4gICAgICBrZXlfc2VjcmV0LFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb3JkZXJPcHRpb25zID0ge1xuICAgICAgYW1vdW50OiBNYXRoLnJvdW5kKG51bWVyaWNBbW91bnQpLFxuICAgICAgY3VycmVuY3k6IChjdXJyZW5jeSB8fCAnSU5SJykudG9VcHBlckNhc2UoKSxcbiAgICAgIHJlY2VpcHQ6IHJlY2VpcHQgfHwgYHJjcHRfJHtEYXRlLm5vdygpfV8ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygyLCA3KX1gLFxuICAgICAgbm90ZXM6IG5vdGVzIHx8IHt9LFxuICAgIH07XG5cbiAgICBjb25zdCBvcmRlciA9IGF3YWl0IHJhem9ycGF5Lm9yZGVycy5jcmVhdGUob3JkZXJPcHRpb25zKTtcblxuICAgIHJldHVybiBzZW5kSnNvbihyZXMsIDIwMCwge1xuICAgICAgb3JkZXJfaWQ6IG9yZGVyLmlkLFxuICAgICAgYW1vdW50OiBvcmRlci5hbW91bnQsXG4gICAgICBjdXJyZW5jeTogb3JkZXIuY3VycmVuY3ksXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdSYXpvcnBheSBvcmRlciBjcmVhdGlvbiBlcnJvcjonLCBlcnJvcik7XG5cbiAgICAvLyBBdXRoIGZhaWx1cmVzXG4gICAgaWYgKGVycm9yPy5zdGF0dXNDb2RlID09PSA0MDEgfHwgKGVycm9yPy5lcnJvcj8uY29kZSA9PT0gJ0JBRF9SRVFVRVNUX0VSUk9SJyAmJiBlcnJvcj8ubWVzc2FnZT8uaW5jbHVkZXMoJ2F1dGgnKSkpIHtcbiAgICAgIHJldHVybiBzZW5kSnNvbihyZXMsIDQwMSwge1xuICAgICAgICBlcnJvcjogJ1Jhem9ycGF5IGF1dGhlbnRpY2F0aW9uIGZhaWxlZC4gUGxlYXNlIHZlcmlmeSBBUEkga2V5cy4nXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VuZEpzb24ocmVzLCA1MDAsIHtcbiAgICAgIGVycm9yOiBlcnJvcj8uZXJyb3I/LmRlc2NyaXB0aW9uIHx8IGVycm9yPy5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gY3JlYXRlIFJhem9ycGF5IG9yZGVyJ1xuICAgIH0pO1xuICB9XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG5pa2lsXFxcXERvd25sb2Fkc1xcXFxmaWFsZ28tY29ubmVjdC1tYWluXFxcXGZpYWxnby1jb25uZWN0LW1haW5cXFxcYXBpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxuaWtpbFxcXFxEb3dubG9hZHNcXFxcZmlhbGdvLWNvbm5lY3QtbWFpblxcXFxmaWFsZ28tY29ubmVjdC1tYWluXFxcXGFwaVxcXFx2ZXJpZnktcGF5bWVudC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvbmlraWwvRG93bmxvYWRzL2ZpYWxnby1jb25uZWN0LW1haW4vZmlhbGdvLWNvbm5lY3QtbWFpbi9hcGkvdmVyaWZ5LXBheW1lbnQudHNcIjtpbXBvcnQgdHlwZSB7IFZlcmNlbFJlcXVlc3QsIFZlcmNlbFJlc3BvbnNlIH0gZnJvbSAnQHZlcmNlbC9ub2RlJztcbmltcG9ydCBjcnlwdG8gZnJvbSAnY3J5cHRvJztcbmltcG9ydCBkb3RlbnYgZnJvbSAnZG90ZW52JztcblxuZG90ZW52LmNvbmZpZygpO1xuZG90ZW52LmNvbmZpZyh7IHBhdGg6ICcuZW52LmxvY2FsJyB9KTtcblxuZnVuY3Rpb24gc2VuZEpzb24ocmVzOiBWZXJjZWxSZXNwb25zZSB8IGFueSwgc3RhdHVzOiBudW1iZXIsIGRhdGE6IGFueSkge1xuICBpZiAodHlwZW9mIHJlcy5zdGF0dXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gcmVzLnN0YXR1cyhzdGF0dXMpLmpzb24oZGF0YSk7XG4gIH1cbiAgcmVzLnN0YXR1c0NvZGUgPSBzdGF0dXM7XG4gIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gIHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXE6IFZlcmNlbFJlcXVlc3QgfCBhbnksIHJlczogVmVyY2VsUmVzcG9uc2UgfCBhbnkpIHtcbiAgLy8gU2V0IENPUlMgaGVhZGVyc1xuICByZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscycsICd0cnVlJyk7XG4gIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsICcqJyk7XG4gIHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnLCAnR0VULE9QVElPTlMsUEFUQ0gsREVMRVRFLFBPU1QsUFVUJyk7XG4gIHJlcy5zZXRIZWFkZXIoXG4gICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnLFxuICAgICdYLUNTUkYtVG9rZW4sIFgtUmVxdWVzdGVkLVdpdGgsIEFjY2VwdCwgQWNjZXB0LVZlcnNpb24sIENvbnRlbnQtTGVuZ3RoLCBDb250ZW50LU1ENSwgQ29udGVudC1UeXBlLCBEYXRlLCBYLUFwaS1WZXJzaW9uLCBBdXRob3JpemF0aW9uJ1xuICApO1xuXG4gIGlmIChyZXEubWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICBpZiAodHlwZW9mIHJlcy5zdGF0dXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiByZXMuc3RhdHVzKDIwMCkuZW5kKCk7XG4gICAgfVxuICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgIHJldHVybiByZXMuZW5kKCk7XG4gIH1cblxuICBpZiAocmVxLm1ldGhvZCAhPT0gJ1BPU1QnKSB7XG4gICAgcmV0dXJuIHNlbmRKc29uKHJlcywgNDA1LCB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ01ldGhvZCBub3QgYWxsb3dlZC4gT25seSBQT1NUIGlzIHN1cHBvcnRlZC4nIH0pO1xuICB9XG5cbiAgY29uc3Qga2V5X3NlY3JldCA9IHByb2Nlc3MuZW52LlJBWk9SUEFZX0tFWV9TRUNSRVQ7XG5cbiAgaWYgKCFrZXlfc2VjcmV0KSB7XG4gICAgY29uc29sZS5lcnJvcignUmF6b3JwYXkga2V5IHNlY3JldCBtaXNzaW5nIGZyb20gc2VydmVyIGVudmlyb25tZW50Jyk7XG4gICAgcmV0dXJuIHNlbmRKc29uKHJlcywgNTAwLCB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ1Jhem9ycGF5IHNlY3JldCBub3QgY29uZmlndXJlZCBvbiBzZXJ2ZXInIH0pO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBsZXQgYm9keSA9IHJlcS5ib2R5O1xuICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGJvZHkgPSBKU09OLnBhcnNlKGJvZHkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gc2VuZEpzb24ocmVzLCA0MDAsIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBKU09OIGJvZHknIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHsgcmF6b3JwYXlfb3JkZXJfaWQsIHJhem9ycGF5X3BheW1lbnRfaWQsIHJhem9ycGF5X3NpZ25hdHVyZSB9ID0gYm9keSB8fCB7fTtcblxuICAgIGlmICghcmF6b3JwYXlfb3JkZXJfaWQgfHwgIXJhem9ycGF5X3BheW1lbnRfaWQgfHwgIXJhem9ycGF5X3NpZ25hdHVyZSkge1xuICAgICAgcmV0dXJuIHNlbmRKc29uKHJlcywgNDAwLCB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ01pc3NpbmcgcmVxdWlyZWQgcGF5bWVudCB2ZXJpZmljYXRpb24gcGFyYW1ldGVycyAocmF6b3JwYXlfb3JkZXJfaWQsIHJhem9ycGF5X3BheW1lbnRfaWQsIHJhem9ycGF5X3NpZ25hdHVyZSknXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBITUFDLVNIQTI1NihvcmRlcl9pZCArIFwifFwiICsgcGF5bWVudF9pZCwgS0VZX1NFQ1JFVClcbiAgICBjb25zdCBwYXlsb2FkID0gYCR7cmF6b3JwYXlfb3JkZXJfaWR9fCR7cmF6b3JwYXlfcGF5bWVudF9pZH1gO1xuICAgIGNvbnN0IGV4cGVjdGVkU2lnbmF0dXJlID0gY3J5cHRvXG4gICAgICAuY3JlYXRlSG1hYygnc2hhMjU2Jywga2V5X3NlY3JldClcbiAgICAgIC51cGRhdGUocGF5bG9hZClcbiAgICAgIC5kaWdlc3QoJ2hleCcpO1xuXG4gICAgY29uc3QgZXhwZWN0ZWRCdWZmZXIgPSBCdWZmZXIuZnJvbShleHBlY3RlZFNpZ25hdHVyZSwgJ3V0Zi04Jyk7XG4gICAgY29uc3Qgc2lnbmF0dXJlQnVmZmVyID0gQnVmZmVyLmZyb20ocmF6b3JwYXlfc2lnbmF0dXJlLCAndXRmLTgnKTtcblxuICAgIGNvbnN0IGlzTWF0Y2ggPVxuICAgICAgZXhwZWN0ZWRCdWZmZXIubGVuZ3RoID09PSBzaWduYXR1cmVCdWZmZXIubGVuZ3RoICYmXG4gICAgICBjcnlwdG8udGltaW5nU2FmZUVxdWFsKGV4cGVjdGVkQnVmZmVyLCBzaWduYXR1cmVCdWZmZXIpO1xuXG4gICAgaWYgKCFpc01hdGNoKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1Jhem9ycGF5IHNpZ25hdHVyZSBtaXNtYXRjaCBmb3Igb3JkZXI6JywgcmF6b3JwYXlfb3JkZXJfaWQpO1xuICAgICAgcmV0dXJuIHNlbmRKc29uKHJlcywgNDAwLCB7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBlcnJvcjogJ1BheW1lbnQgdmVyaWZpY2F0aW9uIGZhaWxlZDogU2lnbmF0dXJlIG1pc21hdGNoLiBEbyBub3QgZnVsZmlsbCBvcmRlci4nXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VuZEpzb24ocmVzLCAyMDAsIHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBtZXNzYWdlOiAnUGF5bWVudCBzaWduYXR1cmUgdmVyaWZpZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICAgIG9yZGVyX2lkOiByYXpvcnBheV9vcmRlcl9pZCxcbiAgICAgIHBheW1lbnRfaWQ6IHJhem9ycGF5X3BheW1lbnRfaWRcbiAgICB9KTtcbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1BheW1lbnQgdmVyaWZpY2F0aW9uIGVycm9yOicsIGVycm9yKTtcbiAgICByZXR1cm4gc2VuZEpzb24ocmVzLCA1MDAsIHtcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgZXJyb3I6IGVycm9yPy5tZXNzYWdlIHx8ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3IgZHVyaW5nIHZlcmlmaWNhdGlvbidcbiAgICB9KTtcbiAgfVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxuaWtpbFxcXFxEb3dubG9hZHNcXFxcZmlhbGdvLWNvbm5lY3QtbWFpblxcXFxmaWFsZ28tY29ubmVjdC1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxuaWtpbFxcXFxEb3dubG9hZHNcXFxcZmlhbGdvLWNvbm5lY3QtbWFpblxcXFxmaWFsZ28tY29ubmVjdC1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9uaWtpbC9Eb3dubG9hZHMvZmlhbGdvLWNvbm5lY3QtbWFpbi9maWFsZ28tY29ubmVjdC1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IGRvdGVudiBmcm9tIFwiZG90ZW52XCI7XHJcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xyXG5pbXBvcnQgZWxlY3Ryb24gZnJvbSBcInZpdGUtcGx1Z2luLWVsZWN0cm9uXCI7XHJcbmltcG9ydCByZW5kZXJlciBmcm9tIFwidml0ZS1wbHVnaW4tZWxlY3Ryb24tcmVuZGVyZXJcIjtcclxuXHJcbmRvdGVudi5jb25maWcoKTtcclxuZG90ZW52LmNvbmZpZyh7IHBhdGg6IFwiLmVudi5sb2NhbFwiIH0pO1xyXG5cclxuZnVuY3Rpb24gcmF6b3JwYXlEZXZBcGlQbHVnaW4oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6IFwicmF6b3JwYXktZGV2LWFwaS1taWRkbGV3YXJlXCIsXHJcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyOiBhbnkpIHtcclxuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxOiBhbnksIHJlczogYW55LCBuZXh0OiBhbnkpID0+IHtcclxuICAgICAgICBjb25zdCB1cmwgPSByZXEudXJsPy5zcGxpdChcIj9cIilbMF07XHJcbiAgICAgICAgaWYgKHVybCA9PT0gXCIvYXBpL2NyZWF0ZS1vcmRlclwiIHx8IHVybCA9PT0gXCIvYXBpL3ZlcmlmeS1wYXltZW50XCIpIHtcclxuICAgICAgICAgIGxldCBib2R5U3RyID0gXCJcIjtcclxuICAgICAgICAgIHJlcS5vbihcImRhdGFcIiwgKGNodW5rOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgYm9keVN0ciArPSBjaHVuaztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmVxLm9uKFwiZW5kXCIsIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICByZXEuYm9keSA9IGJvZHlTdHIgPyBKU09OLnBhcnNlKGJvZHlTdHIpIDoge307XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgIHJlcS5ib2R5ID0ge307XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBpZiAodXJsID09PSBcIi9hcGkvY3JlYXRlLW9yZGVyXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSAoYXdhaXQgaW1wb3J0KFwiLi9hcGkvY3JlYXRlLW9yZGVyLnRzXCIpKS5kZWZhdWx0O1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgaGFuZGxlcihyZXEsIHJlcyk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh1cmwgPT09IFwiL2FwaS92ZXJpZnktcGF5bWVudFwiKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gKGF3YWl0IGltcG9ydChcIi4vYXBpL3ZlcmlmeS1wYXltZW50LnRzXCIpKS5kZWZhdWx0O1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgaGFuZGxlcihyZXEsIHJlcyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJbUmF6b3JwYXkgRGV2IE1pZGRsZXdhcmUgRXJyb3JdOlwiLCBlcnIpO1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogZXJyPy5tZXNzYWdlIHx8IFwiSW50ZXJuYWwgU2VydmVyIEVycm9yXCIgfSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbmV4dCgpO1xyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xyXG4gIGNvbnN0IGJ1aWxkVmVyc2lvbiA9IERhdGUubm93KCkudG9TdHJpbmcoKTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICBiYXNlOiBwcm9jZXNzLmVudi5FTEVDVFJPTiA9PT0gXCJ0cnVlXCIgPyBcIi4vXCIgOiBcIi9cIixcclxuICBkZWZpbmU6IHtcclxuICAgIF9fQVBQX0JVSUxEX1ZFUlNJT05fXzogSlNPTi5zdHJpbmdpZnkoYnVpbGRWZXJzaW9uKSxcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogdHJ1ZSxcclxuICAgIGFsbG93ZWRIb3N0czogdHJ1ZSxcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgICBzdHJpY3RQb3J0OiBmYWxzZSxcclxuICAgIGhtcjoge1xyXG4gICAgICBvdmVybGF5OiBmYWxzZSxcclxuICAgIH0sXHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL2FwaS9lY29ub21pYy1jYWxlbmRhcic6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwczovL25mcy5mYWlyZWNvbm9teS5tZWRpYScsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHJld3JpdGU6ICgpID0+ICcvZmZfY2FsZW5kYXJfdGhpc3dlZWsuanNvbicsXHJcbiAgICAgIH0sXHJcbiAgICAgICcvYXBpL21hcmtldC1xdW90ZSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwczovL3F1ZXJ5MS5maW5hbmNlLnlhaG9vLmNvbScsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHJld3JpdGU6IChwKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBzeW0gPSBwLnJlcGxhY2UoL15cXC9hcGlcXC9tYXJrZXQtcXVvdGVcXC8vLCAnJyk7XHJcbiAgICAgICAgICByZXR1cm4gYC92OC9maW5hbmNlL2NoYXJ0LyR7c3ltfT9pbnRlcnZhbD0xZCZyYW5nZT01ZGA7XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGluY2x1ZGU6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCIsIFwiQHJhZGl4LXVpL3JlYWN0LXRvb2x0aXBcIiwgXCJAdGFuc3RhY2svcmVhY3QtcXVlcnlcIl0sXHJcbiAgICBmb3JjZTogdHJ1ZSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJhem9ycGF5RGV2QXBpUGx1Z2luKCksXHJcbiAgICByZWFjdCgpLCBcclxuICAgIHtcclxuICAgICAgbmFtZTogXCJ0cmFkaWZpdmUtdmVyc2lvbi1qc29uXCIsXHJcbiAgICAgIGdlbmVyYXRlQnVuZGxlKCkge1xyXG4gICAgICAgIHRoaXMuZW1pdEZpbGUoe1xyXG4gICAgICAgICAgdHlwZTogXCJhc3NldFwiLFxyXG4gICAgICAgICAgZmlsZU5hbWU6IFwidmVyc2lvbi5qc29uXCIsXHJcbiAgICAgICAgICBzb3VyY2U6IEpTT04uc3RyaW5naWZ5KHsgdmVyc2lvbjogYnVpbGRWZXJzaW9uIH0pLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKSxcclxuICAgIHByb2Nlc3MuZW52LkVMRUNUUk9OID09PSBcInRydWVcIiAmJiBlbGVjdHJvbihbXHJcbiAgICAgIHtcclxuICAgICAgICBlbnRyeTogJ2VsZWN0cm9uL21haW4udHMnLFxyXG4gICAgICB9LFxyXG4gICAgXSksXHJcbiAgICBwcm9jZXNzLmVudi5FTEVDVFJPTiA9PT0gXCJ0cnVlXCIgJiYgcmVuZGVyZXIoKSxcclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgICAgXCJyZWFjdFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vbm9kZV9tb2R1bGVzL3JlYWN0XCIpLFxyXG4gICAgICBcInJlYWN0LWRvbVwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vbm9kZV9tb2R1bGVzL3JlYWN0LWRvbVwiKSxcclxuICAgIH0sXHJcbiAgICBkZWR1cGU6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCJdLFxyXG4gIH0sXHJcbiAgZXNidWlsZDoge1xyXG4gICAgZHJvcDogbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIgPyBbXCJjb25zb2xlXCIsIFwiZGVidWdnZXJcIl0gOiBbXSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBzb3VyY2VtYXA6IGZhbHNlLCAvLyBFeHBsaWNpdGx5IGRpc2FibGUgc291cmNlbWFwcyBmb3Igc2VjdXJpdHlcclxuICAgIGVtcHR5T3V0RGlyOiBwcm9jZXNzLmVudi5FTEVDVFJPTiAhPT0gXCJ0cnVlXCIsXHJcbiAgfSxcclxufTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDQSxPQUFPLGNBQWM7QUFDckIsT0FBTyxZQUFZO0FBS25CLFNBQVMsU0FBUyxLQUEyQixRQUFnQixNQUFXO0FBQ3RFLE1BQUksT0FBTyxJQUFJLFdBQVcsWUFBWTtBQUNwQyxXQUFPLElBQUksT0FBTyxNQUFNLEVBQUUsS0FBSyxJQUFJO0FBQUEsRUFDckM7QUFDQSxNQUFJLGFBQWE7QUFDakIsTUFBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsU0FBTyxJQUFJLElBQUksS0FBSyxVQUFVLElB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QUFDZixlQUFLLFNBQVM7QUFBQSxZQUNaLE1BQU07QUFBQSxZQUNOLFVBQVU7QUFBQSxZQUNWLFFBQVEsS0FBSyxVQUFVLEVBQUUsU0FBUyxhQUFhLENBQUM7QUFBQSxVQUNsRCxDQUFDO0FBQUEsUUFDSDtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFNBQVMsaUJBQWlCLGdCQUFnQjtBQUFBLE1BQzFDLFFBQVEsSUFBSSxhQUFhLFVBQVUsU0FBUztBQUFBLFFBQzFDO0FBQUEsVUFDRSxPQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BQ0QsUUFBUSxJQUFJLGFBQWEsVUFBVSxTQUFTO0FBQUEsSUFDOUMsRUFBRSxPQUFPLE9BQU87QUFBQSxJQUNoQixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsUUFDcEMsU0FBUyxLQUFLLFFBQVEsa0NBQVcsc0JBQXNCO0FBQUEsUUFDdkQsYUFBYSxLQUFLLFFBQVEsa0NBQVcsMEJBQTBCO0FBQUEsTUFDakU7QUFBQSxNQUNBLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxJQUMvQjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsTUFBTSxTQUFTLGVBQWUsQ0FBQyxXQUFXLFVBQVUsSUFBSSxDQUFDO0FBQUEsSUFDM0Q7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFdBQVc7QUFBQTtBQUFBLE1BQ1gsYUFBYSxRQUFRLElBQUksYUFBYTtBQUFBLElBQ3hDO0FBQUEsRUFDRjtBQUNBLENBQUM7IiwKICAibmFtZXMiOiBbImhhbmRsZXIiLCAiZG90ZW52IiwgInNlbmRKc29uIiwgImRvdGVudiIsICJkb3RlbnYiLCAiaGFuZGxlciJdCn0K
