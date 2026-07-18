import { app as o, BrowserWindow as i } from "electron";
import n from "node:path";
import { fileURLToPath as c } from "node:url";
const d = n.dirname(c(import.meta.url));
process.env.DIST = n.join(d, "../dist");
process.env.VITE_PUBLIC = o.isPackaged ? process.env.DIST : n.join(process.env.DIST, "../public");
let e;
const t = process.env.VITE_DEV_SERVER_URL;
function s() {
  e = new i({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: n.join(process.env.VITE_PUBLIC, "favicon.png"),
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0
    },
    titleBarStyle: "hidden",
    // Make it look modern like Discord
    titleBarOverlay: {
      color: "#000000",
      symbolColor: "#ffffff"
    }
  }), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), e.webContents.on("console-message", (p, f, r, l, a) => {
    console.log(`[Renderer] ${r} (${a}:${l})`);
  }), e.webContents.openDevTools(), t ? e.loadURL(t) : e.loadFile(n.join(process.env.DIST, "index.html"));
}
o.on("window-all-closed", () => {
  process.platform !== "darwin" && (o.quit(), e = null);
});
o.on("activate", () => {
  i.getAllWindows().length === 0 && s();
});
o.whenReady().then(s);
