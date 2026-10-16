import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { type AdminRole } from "../lib/rbac";

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  avatar_url?: string;
}

interface AdminAuthContextType {
  adminUser: AdminProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  viewRole: AdminRole | null;
  setViewRole: (role: AdminRole | null) => void;
  activeRole: AdminRole | null;
  is2FAVerified: boolean;
  setIs2FAVerified: (verified: boolean, keyId?: string) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminProfile | null>(null);
  const [viewRole, setViewRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Track 2FA state from localStorage so it survives new tabs
  const [is2FAVerified, setIs2FAVerifiedState] = useState<boolean>(() => {
    return localStorage.getItem("admin_2fa_verified") === "true";
  });

  // Track which 2FA key ID was used
  const [usedKeyId, setUsedKeyIdState] = useState<string | null>(() => {
    return localStorage.getItem("admin_2fa_key_id");
  });

  const [activeSessionLogId, setActiveSessionLogId] = useState<string | null>(() => {
    return localStorage.getItem("active_session_log_id");
  });

  const setUsedKeyId = (id: string | null) => {
    setUsedKeyIdState(id);
    if (id) {
      localStorage.setItem("admin_2fa_key_id", id);
    } else {
      localStorage.removeItem("admin_2fa_key_id");
    }
  };

  const setIs2FAVerified = (verified: boolean, keyId?: string) => {
    setIs2FAVerifiedState(verified);
    if (verified) {
      localStorage.setItem("admin_2fa_verified", "true");
      if (keyId) setUsedKeyId(keyId);
    } else {
      localStorage.removeItem("admin_2fa_verified");
      setUsedKeyId(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Load existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        loadProfile(session.user.id, session.user.email ?? "").finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
        setIs2FAVerified(false);
      }
    });

    // 2. React to auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT") {
        setAdminUser(null);
        setViewRole(null);
        setIs2FAVerified(false);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setLoading(true);
        loadProfile(session.user.id, session.user.email ?? "").finally(() => {
          if (mounted) setLoading(false);
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Session tracking: Create a session log when adminUser & 2FA become verified
  useEffect(() => {
    if (adminUser && is2FAVerified && !activeSessionLogId) {
      // Find the user's department for logging (derived from their role in rbac)
      // Since rbac doesn't have a direct reverse lookup, we will just store their role label
      const createSession = async () => {
        const deptLabels: Record<string, string> = {
          "ceo": "Executive",
          "technical_lead": "Technology",
          "operations_executive": "Operations",
          "risk_executive": "Trading & Risk",
          "finance_executive": "Finance & Compliance",
          "community_manager": "Content & Marketing",
          "hr_manager": "HR & People",
          "support_executive": "Support",
          "sales_executive": "Sales"
        };
        const dept = deptLabels[adminUser.role] || "Unknown";

        const { data } = await supabase.from("hr_session_logs").insert({
          user_id: adminUser.id,
          full_name: adminUser.full_name,
          department: dept,
          login_time: new Date().toISOString()
        }).select("id").single();

        if (data) {
          setActiveSessionLogId(data.id);
          localStorage.setItem("active_session_log_id", data.id);
          
          // Also automatically mark them as present for the day in the Daily Attendance tracker
          const today = new Date().toISOString().split("T")[0];
          await supabase.from("hr_attendance").upsert({
            employee_id: adminUser.id,
            date: today,
            status: "present",
            check_in: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          }, { onConflict: 'employee_id, date' });
        }
      };
      createSession();
    }
  }, [adminUser, is2FAVerified, activeSessionLogId]);

  // Heartbeat — update last_login_at, check 2FA key validity, and update session logout_time every 15 seconds
  useEffect(() => {
    if (!adminUser || !is2FAVerified) return;
    const interval = setInterval(async () => {
      // 1. Check if their specific 2FA key was revoked (if they didn't use the CEO override)
      if (usedKeyId) {
        const { data } = await supabase
          .from("department_access_keys")
          .select("is_active")
          .eq("id", usedKeyId)
          .maybeSingle();

        if (data && data.is_active === false) {
          // KEY WAS REVOKED! Instantly kick them out!
          await signOut();
          window.dispatchEvent(new CustomEvent("toast-notification", { detail: { message: "Your access key was revoked by the CEO.", type: "error" } }));
          return;
        }
      }

      // 2. Update last seen status
      const now = new Date().toISOString();
      supabase
        .from("admin_profiles")
        .update({ last_login_at: now })
        .eq("id", adminUser.id)
        .then(() => {});

    }, 15_000); // Check every 15 seconds for faster kick-out

    return () => clearInterval(interval);
  }, [adminUser, is2FAVerified, usedKeyId, activeSessionLogId]);

  async function loadProfile(userId: string, email: string) {
    const { data, error } = await supabase
      .from("admin_profiles")
      .select("role, full_name, avatar_url")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.warn("No admin profile found for user:", userId, error?.message);
      return;
    }

    setAdminUser({
      id: userId,
      email,
      full_name: data.full_name || email,
      role: data.role as AdminRole,
      avatar_url: data.avatar_url,
    });
    setViewRole(data.role as AdminRole);
  }

  async function signOut() {
    if (activeSessionLogId) {
      const now = new Date().toISOString();
      await supabase.from("hr_session_logs").update({ logout_time: now }).eq("id", activeSessionLogId);
      // We also calculate duration in a Postgres trigger ideally, but we can do it directly:
      // Since it's hard to calculate duration precisely here without reading the row first,
      // we'll fetch the row, compute diff, and update.
      const { data } = await supabase.from("hr_session_logs").select("login_time").eq("id", activeSessionLogId).single();
      if (data && data.login_time) {
        const start = new Date(data.login_time).getTime();
        const end = new Date(now).getTime();
        const diffMinutes = Math.floor((end - start) / 60000);
        await supabase.from("hr_session_logs").update({ duration_minutes: diffMinutes }).eq("id", activeSessionLogId);
      }
    }

    setIs2FAVerified(false);
    setActiveSessionLogId(null);
    localStorage.removeItem("active_session_log_id");
    setAdminUser(null);
    setViewRole(null);
    await supabase.auth.signOut();
  }

  const activeRole = viewRole ?? adminUser?.role ?? null;

  return (
    <AdminAuthContext.Provider value={{ adminUser, loading, signOut, viewRole, setViewRole, activeRole, is2FAVerified, setIs2FAVerified }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
