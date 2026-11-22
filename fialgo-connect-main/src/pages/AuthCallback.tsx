import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const MOTIVATIONAL_MESSAGES = [
  "CALM MIND. CLEAR EXECUTION.",
  "CONSISTENCY BEATS INTENSITY. EVERY SINGLE TIME.",
  "YOUR EDGE IS DISCIPLINE, NOT PREDICTION.",
  "THE MARKET REWARDS PATIENCE, NOT IMPULSE.",
  "RISK MANAGED TODAY IS CAPITAL SAVED FOR TOMORROW.",
  "DISCIPLINE IS THE REAL ALPHA."
];

export default function AuthCallback() {
  const navigate = useNavigate();
  const [deepLinkTarget, setDeepLinkTarget] = useState('');
  const [buttonLabel, setButtonLabel] = useState('Open TradiFive App');
  const [isExpoTarget, setIsExpoTarget] = useState(false);
  const [showWebFallback, setShowWebFallback] = useState(false);
  const [isProcessingWeb, setIsProcessingWeb] = useState(false);

  const quote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
    return MOTIVATIONAL_MESSAGES[randomIndex] || "CALM MIND. CLEAR EXECUTION.";
  }, []);

  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    const urlParams = new URLSearchParams(search);
    const returnTo = urlParams.get('return_to');

    // ─────────────────────────────────────────────────────────────
    // 0. PASSWORD RECOVERY REDIRECT
    // ─────────────────────────────────────────────────────────────
    const isRecovery = search.includes('type=recovery') || hash.includes('type=recovery');
    if (isRecovery) {
      navigate(`/reset-password${search}${hash}`, { replace: true });
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // 1. MOBILE NATIVE APP BRIDGE (Expo Go or Standalone APK)
    // ─────────────────────────────────────────────────────────────
    const isNativeSource = search.includes('source=mobileapp') || search.includes('mobileapp=true') || !!returnTo;

    if (isNativeSource) {
      const code = urlParams.get('code');
      const error = urlParams.get('error') || urlParams.get('error_description');

      let targetUrl = returnTo || 'mobileapp://auth-callback';
      const delimiter = targetUrl.includes('?') ? '&' : '?';
      const params: string[] = [];
      if (code) params.push(`code=${encodeURIComponent(code)}`);
      if (error) params.push(`error=${encodeURIComponent(error)}`);
      if (params.length > 0) targetUrl += delimiter + params.join('&');
      if (hash) targetUrl += hash;

      const isExpo = targetUrl.startsWith('exp://');
      setIsExpoTarget(isExpo);
      setDeepLinkTarget(targetUrl);
      setButtonLabel(isExpo ? 'Open in Expo Go' : 'Open TradiFive App');
      setShowWebFallback(true);

      try {
        if (isExpo) {
          window.location.replace(targetUrl);
        } else if (isAndroid) {
          const queryPart = targetUrl.split('?')[1] || '';
          const androidIntent = `intent://auth-callback?${queryPart}#Intent;scheme=mobileapp;package=com.tradifive;end`;
          window.location.replace(androidIntent);
          setTimeout(() => { window.location.replace(targetUrl); }, 400);
        } else {
          window.location.replace(targetUrl);
        }
      } catch (e) {
        console.warn('[AuthCallback Native Redirect Error]:', e);
      }
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // 2. STANDARD WEB FLOW (Desktop and Mobile Browser)
    // ─────────────────────────────────────────────────────────────
    const handleWebAuth = async () => {
      try {
        if (search.includes('error=') || hash.includes('error=')) {
          const params = new URLSearchParams((search || hash).replace(/^#/, '?'));
          const errorDesc = params.get('error_description') || params.get('error');
          console.error('[OAuth Error]:', errorDesc);
          navigate(`/login?oauth_error=${encodeURIComponent(errorDesc || 'Authentication failed')}`, { replace: true });
          return;
        }

        let { data: { session } } = await supabase.auth.getSession();

        if (!session && (search.includes('code=') || hash.includes('access_token='))) {
          session = await new Promise((resolve) => {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
              if (s && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
                subscription.unsubscribe();
                resolve(s);
              }
            });

            if (search.includes('code=')) {
              const code = urlParams.get('code');
              if (code) {
                supabase.auth.exchangeCodeForSession(code).then(({ data }) => {
                  if (data?.session) {
                    subscription.unsubscribe();
                    resolve(data.session);
                  }
                }).catch(() => {});
              }
            }

            // Quick timeout fallback (1.8s max instead of 4s) so user is never stuck
            setTimeout(() => {
              subscription.unsubscribe();
              resolve(null);
            }, 1800);
          });
        }

        if (session) {
          sessionStorage.setItem('fresh_login', 'true');
          sessionStorage.setItem('fialgo_loaded', 'true');

          const { data: prof } = await supabase
            .from('profiles')
            .select('has_chosen_username')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!prof || prof.has_chosen_username === false || prof.has_chosen_username === null) {
            navigate('/onboarding', { replace: true });
          } else {
            navigate('/home', { replace: true });
          }
        } else {
          console.warn('[AuthCallback Web] No session established, returning to login');
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('[AuthCallback Web Error]:', err);
        navigate('/login', { replace: true });
      }
    };

    handleWebAuth();
  }, [navigate]);

  const handleManualWebContinue = async () => {
    setIsProcessingWeb(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) console.warn('[Manual Web Exchange Warning]:', error.message);
      }
      navigate('/home', { replace: true });
    } catch (e) {
      navigate('/home', { replace: true });
    }
  };

  const handleLaunchNative = () => {
    if (!deepLinkTarget) return;
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isExpoTarget) {
      window.location.href = deepLinkTarget;
    } else if (isAndroid) {
      const queryPart = deepLinkTarget.split('?')[1] || '';
      const androidIntent = `intent://auth-callback?${queryPart}#Intent;scheme=mobileapp;package=com.tradifive;end`;
      window.location.href = androidIntent;
      setTimeout(() => {
        window.location.href = deepLinkTarget;
      }, 450);
    } else {
      window.location.href = deepLinkTarget;
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#0A0A0A] flex flex-col items-center justify-center select-none font-sans w-screen h-screen">
      <div className="w-full max-w-[320px] flex flex-col items-center justify-center px-4">
        {/* Up: Motivational Message (Image 2 style) */}
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em] mb-7 text-center leading-relaxed">
          {quote}
        </p>

        {/* Middle: Loading Bar (Image 2 style) */}
        <div className="relative w-full">
          <div className="w-full h-2 bg-[#1E1E1E] border border-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full"
              initial={{ width: "10%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Down: Authenticating Status (Image 2 style) */}
        <p className="text-[10.5px] text-slate-500 font-semibold tracking-[0.2em] uppercase mt-6 text-center animate-pulse">
          {deepLinkTarget ? "SIGN IN SUCCESSFUL" : "AUTHENTICATING..."}
        </p>

        {/* Deep link action buttons if redirecting to mobile native app */}
        {deepLinkTarget ? (
          <div className="mt-8 flex flex-col gap-2.5 w-full">
            <a
              href={deepLinkTarget}
              onClick={(e) => {
                e.preventDefault();
                handleLaunchNative();
              }}
              className="w-full py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 text-center transition-all active:scale-[0.98]"
            >
              {buttonLabel}
            </a>

            {showWebFallback && (
              <button
                type="button"
                disabled={isProcessingWeb}
                onClick={handleManualWebContinue}
                className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-medium text-xs border border-white/10 text-center transition-all"
              >
                {isProcessingWeb ? 'Opening...' : 'Continue in Browser'}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
