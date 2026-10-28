import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useTrading } from "@/contexts/TradingContext";
import logoOnly from "@/assets/logo-only.png";
import { UsernameSetup } from "./UsernameSetup";

const loadingSteps = [
  "Connecting to servers",
  "Loading your portfolio",
  "Syncing market data",
  "Preparing dashboard",
  "Almost ready",
];

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showBar, setShowBar] = useState(() => {
    // If the session is already active in this tab session, start immediately without showing a spinner
    return sessionStorage.getItem("fialgo_loaded") !== "true";
  });
  const [barDone, setBarDone] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [setupInitialStep, setSetupInitialStep] = useState<'username' | 'market'>('username');
  const [sessionUser, setSessionUser] = useState<any>(null);
  const navigate = useNavigate();
  const { userSubscription } = useTrading();
  const isMounted = useRef(true);

  // Handle initial theme application
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    const checkSession = async () => {
      try {
        // Use getSession() — it reads from local storage without acquiring
        // the auth lock. This avoids NavigatorLockAcquireTimeoutError when
        // multiple components (AuthGuard, useDashboardData, AppSidebar)
        // all try to call getUser() simultaneously on mount.
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (isMounted.current) {
            sessionStorage.removeItem("fialgo_loaded");
            navigate("/login");
          }
          return;
        }

        // ── Send "New sign-in detected" email for OAuth logins ──────────────
        // This runs in checkSession (not onAuthStateChange) because for OAuth redirects,
        // Supabase fires SIGNED_IN BEFORE React's useEffect registers the listener.
        // Here we reliably have the session available.
        const isFreshOAuthLogin = sessionStorage.getItem("fresh_login") === "true";
        const provider = session.user?.app_metadata?.provider;

        if (isFreshOAuthLogin && (provider === "google" || provider === "apple")) {
          // Clear immediately — prevents duplicate sends on fast re-renders
          sessionStorage.removeItem("fresh_login");

          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (supabaseUrl && session.access_token) {
            const method = provider === "google" ? "Google" : "Apple";
            fetch(`${supabaseUrl}/functions/v1/send-login-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ method }),
            }).catch(() => {/* Non-critical */ });
          }
        }
        // ───────────────────────────────────────────────────────────────────

        // Ensure a profile row exists for OAuth users (Google, GitHub)
        if (session?.user) {
          const user = session.user;
          setSessionUser(user);
          const profileChecked = sessionStorage.getItem(`fialgo_profile_checked_${user.id}`) === "true";
          const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

          if (!profileChecked && isValidUUID) {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id, username, has_chosen_username, is_banned, full_name, preferred_market')
              .eq('id', user.id)
              .maybeSingle();


            if (existingProfile && (existingProfile.is_banned || existingProfile.is_frozen)) {
              // User is banned or restricted
              sessionStorage.removeItem("fialgo_loaded");
              if (isMounted.current) {
                navigate("/account-frozen");
              }
              return;
            }

            if (!existingProfile) {
              // Allow the app to proceed; if they need a profile, the database trigger
              // or OAuth fallback below will create it. We don't want to suspend them just because
              // the profile is temporarily missing.

              // First-time OAuth user — create a profile from auth metadata
              const meta = user.user_metadata || {};
              const emailUsername = user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || "trader";
              const resolvedName = meta.full_name || meta.name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || emailUsername;
              const resolvedUsername = emailUsername + Math.floor(100 + Math.random() * 900);

              await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                first_name: meta.first_name || resolvedName.split(' ')[0] || "",
                last_name: meta.last_name || resolvedName.split(' ').slice(1).join(' ') || "",
                full_name: resolvedName,
                display_name: resolvedName,
                username: resolvedUsername,
                avatar_url: meta.avatar_url || meta.picture || "/default-avatar.svg",
                xp_total: 0,
                xp_level: 1,
                streak_days: 0,
                created_at: new Date().toISOString(),
              }, { onConflict: 'id' });
            } else {
              if (existingProfile.has_chosen_username === false || existingProfile.has_chosen_username === null) {
                setSetupInitialStep('username');
                setRequiresSetup(true);
              } else if (!existingProfile.preferred_market) {
                setSetupInitialStep('market');
                setRequiresSetup(true);
              }
            }
            sessionStorage.setItem(`fialgo_profile_checked_${user.id}`, "true");
          } else {
            // Even if already checked in session, ensure we catch UUID usernames on page reloads
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('username, has_chosen_username, is_banned, full_name, preferred_market')
              .eq('id', user.id)
              .maybeSingle();


            if (existingProfile && (existingProfile.is_banned || existingProfile.is_frozen)) {
              // User is banned or restricted, kick them out.
              sessionStorage.removeItem("fialgo_loaded");
              if (isMounted.current) {
                navigate("/account-frozen");
              }
              return;
            }

            if (!existingProfile) {
              // Profile is missing, allow them through so the app/trigger can recreate it
              // Do not kick them out as suspended.
            } else {
              if (existingProfile.has_chosen_username === false || existingProfile.has_chosen_username === null) {
                setSetupInitialStep('username');
                setRequiresSetup(true);
              } else if (!existingProfile.preferred_market) {
                setSetupInitialStep('market');
                setRequiresSetup(true);
              }
            }
          }
        }

        if (!isMounted.current) return;

        // If bypass loading screen is active, just let it render immediately
        if (sessionStorage.getItem("fialgo_loaded") === "true") {
          setBarDone(true);
        }

        // ── Realtime Listener for Profile Status Changes ──
        const profileChannel = supabase.channel(`authguard_profile_${session.user.id}`)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${session.user.id}`
          }, async (payload) => {
            const updatedProfile = payload.new;
            if (updatedProfile && (updatedProfile.is_banned || updatedProfile.is_frozen)) {
              sessionStorage.removeItem("fialgo_loaded");
              if (isMounted.current) {
                navigate("/account-frozen");
              }
            }
          })
          .subscribe();

        // ──────────────────────────────────────────────────

        setIsLoading(false);
      } catch (err) {
        if (isMounted.current) {
          const isElectron = navigator.userAgent.toLowerCase().includes('electron');
          navigate(isElectron ? "/login" : "/");
        }
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only redirect on an explicit user-initiated sign out.
      // Ignore transient events like TOKEN_REFRESHED or INITIAL_SESSION
      // that can briefly produce a null session during token refresh.
      if (event === "SIGNED_OUT" && !session) {
        if (isMounted.current) {
          sessionStorage.removeItem("fialgo_loaded");
          const isElectron = navigator.userAgent.toLowerCase().includes('electron');
          navigate(isElectron ? "/login" : "/");
        }
      }

      // Send "New sign-in detected" security email for OAuth logins (Google, Apple).
      // fresh_login marker is set by finalizeLogin (email/password) — exclude those 
      // since they already call the Edge Function directly.
      // For OAuth, the page reloads so we detect via SIGNED_IN event + provider check.
      if (event === "SIGNED_IN" && session) {
        const provider = session.user?.app_metadata?.provider;
        const isFreshLogin = sessionStorage.getItem("fresh_login") === "true";

        if ((provider === "google" || provider === "apple") && isFreshLogin) {
          // Clear the marker immediately to prevent duplicate sends
          sessionStorage.removeItem("fresh_login");

          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (supabaseUrl && session.access_token) {
            const method = provider === "google" ? "Google" : "Apple";
            fetch(`${supabaseUrl}/functions/v1/send-login-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ method }),
            }).catch(() => {/* Non-critical */ });
          }
        }
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();

      // Clean up the realtime channel
      supabase.getChannels().forEach(channel => {
        if (channel.topic.startsWith('realtime:authguard_profile_')) {
          supabase.removeChannel(channel);
        }
      });
    };
  }, [navigate]);

  useEffect(() => {
    if (!showBar || barDone) return;

    let currentProgress = 0;
    let stuckTimer = 0;

    const interval = setInterval(() => {
      if (stuckTimer > 0) {
        stuckTimer -= 50;
        return;
      }

      // Determine dynamic organic increment step
      let increment = 0;
      if (currentProgress < 30) {
        // Fast start
        increment = Math.random() * 3 + 2.0;
      } else if (currentProgress >= 30 && currentProgress < 34) {
        // Stuck/stutter at first checkpoint (30-34%)
        if (Math.random() < 0.2) {
          stuckTimer = 500; // pause for 500ms
        }
        increment = Math.random() * 0.8 + 0.1;
      } else if (currentProgress >= 34 && currentProgress < 75) {
        // Normal pace
        increment = Math.random() * 4 + 1.2;
      } else if (currentProgress >= 75 && currentProgress < 79) {
        // Stuck/stutter at second checkpoint (75-79%)
        if (Math.random() < 0.25) {
          stuckTimer = 700; // pause for 700ms
        }
        increment = Math.random() * 0.5 + 0.1;
      } else if (currentProgress >= 79 && currentProgress < 95) {
        // Normal pace
        increment = Math.random() * 2 + 0.5;
      } else if (currentProgress >= 95 && currentProgress < 99) {
        // Slow down slightly near the end
        if (Math.random() < 0.15) {
          stuckTimer = 400; // pause for 400ms
        }
        increment = 0.25;
      } else {
        // Final push to 100%
        increment = 1.0;
      }

      currentProgress = Math.min(currentProgress + increment, 100);
      setProgress(currentProgress);

      const stepProgress = 100 / loadingSteps.length;
      const currentStep = Math.min(Math.floor(currentProgress / stepProgress), loadingSteps.length - 1);
      setStepIndex(currentStep);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setBarDone(true);
          sessionStorage.setItem("fialgo_loaded", "true");
        }, 400); // Smooth fade transition
      }
    }, 50);

    return () => clearInterval(interval);
  }, [showBar, barDone]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-[#D6E4FF] dark:border-[#333333] border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (showBar && !barDone) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#ffffff] flex flex-col items-center justify-center transition-colors duration-500">
        <div className="w-full max-w-[300px] flex flex-col items-center">
          <p
            key={stepIndex}
            className="text-[10px] text-slate-900 font-bold tracking-[0.3em] uppercase mb-8 animate-[fadeInUp_0.4s_ease-out] text-center animate-pulse"
          >
            {loadingSteps[stepIndex]}
          </p>

          <div className="relative w-full">
            {/* The Bar Track - slightly fatter in height */}
            <div className="w-full h-2 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
              {/* Progress Fill */}
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {requiresSetup && sessionUser && (
        <UsernameSetup
          user={sessionUser}
          initialStep={setupInitialStep}
          onComplete={() => setRequiresSetup(false)}
        />
      )}
      {children}
    </>
  );
};





