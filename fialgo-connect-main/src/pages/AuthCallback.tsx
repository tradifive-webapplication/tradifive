import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [deepLinkTarget, setDeepLinkTarget] = useState('');
  const [buttonLabel, setButtonLabel] = useState('Open TradiFive App');
  const [isExpoTarget, setIsExpoTarget] = useState(false);
  const [showWebFallback, setShowWebFallback] = useState(false);
  const [isProcessingWeb, setIsProcessingWeb] = useState(false);

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
    <div className="fixed inset-0 z-[99999] bg-[#0A0A0A] flex flex-col items-center justify-center select-none w-screen h-screen p-4">
      {/* Clean minimal loader */}
      <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />

      {/* Optional fallback buttons only if user arrived from mobile native app */}
      {deepLinkTarget && (
        <div className="mt-7 flex flex-col gap-2.5 w-full max-w-[260px]">
          <a
            href={deepLinkTarget}
            onClick={(e) => {
              e.preventDefault();
              handleLaunchNative();
            }}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs text-center transition-all"
          >
            {buttonLabel}
          </a>
          {showWebFallback && (
            <button
              type="button"
              disabled={isProcessingWeb}
              onClick={handleManualWebContinue}
              className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-medium text-xs border border-white/10 text-center transition-all"
            >
              {isProcessingWeb ? 'Opening...' : 'Continue in Browser'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
