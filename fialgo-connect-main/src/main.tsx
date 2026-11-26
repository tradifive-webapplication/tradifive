import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

// Recover cleanly when a new Vercel deploy invalidates an open tab's CSS/JS preload chunk
window.addEventListener("vite:preloadError", (event) => {
  const key = "vite_preload_retry";
  if (!sessionStorage.getItem(key)) {
    event.preventDefault();
    sessionStorage.setItem(key, "1");
    window.location.reload();
  }
});

if (import.meta.env.PROD) {
  console.log = () => { };
  console.warn = () => { };
  console.error = () => { };
  console.info = () => { };
  console.debug = () => { };

  // Disable right-click context menu
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // Disable developer shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C" || e.key === "i" || e.key === "j" || e.key === "c")) ||
      (e.ctrlKey && (e.key === "U" || e.key === "u"))
    ) {
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
