import { supabase } from "@/lib/supabase";

/**
 * Centrally and completely terminates the user session across Supabase auth,
 * removes all browser storage tokens (localStorage, sessionStorage),
 * and performs a full window navigation to prevent stale memory state
 * or automatic re-authentication.
 */
export async function performAppLogout(redirectTo: string = "/login?logout=true") {
  try {
    // 1. Mark explicit logout intent in sessionStorage
    try {
      sessionStorage.setItem("fialgo_logged_out", "true");
    } catch (_) {}

    // 2. Perform local Supabase sign-out first (guarantees local token destruction even if offline)
    try {
      await (supabase.auth as any).signOut({ scope: "local" });
    } catch (localErr) {
      console.warn("Local signOut notice:", localErr);
    }

    // 3. Attempt global/server Supabase sign-out to revoke refresh tokens on backend
    try {
      await supabase.auth.signOut();
    } catch (globalErr) {
      console.warn("Global signOut notice:", globalErr);
    }

    // 4. Forcefully purge all Supabase auth tokens, cached credentials, user metadata from localStorage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const k = key.toLowerCase();
          if (
            k.startsWith("sb-") ||
            k.startsWith("tradifive_") ||
            k.startsWith("fialgo_") ||
            k.includes("supabase") ||
            k.includes("auth") ||
            k.includes("token") ||
            k === "user_subscription" ||
            k === "activeworkspace" ||
            k === "active_workspace"
          ) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (storageErr) {
      console.warn("LocalStorage cleanup error:", storageErr);
    }

    // 5. Purge sessionStorage completely, but restore the logout marker so Login.tsx respects it
    try {
      sessionStorage.clear();
      sessionStorage.setItem("fialgo_logged_out", "true");
    } catch (_) {}

    // 6. Hard redirect with window.location.replace
    // This destroys the existing JavaScript heap, closes in-memory Supabase listeners,
    // resets React Query client caches, and prevents browser back-button resumption.
    window.location.replace(redirectTo);
  } catch (err) {
    console.error("Critical logout error:", err);
    try {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem("fialgo_logged_out", "true");
    } catch (_) {}
    window.location.replace(redirectTo);
  }
}
