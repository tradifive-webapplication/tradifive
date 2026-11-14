import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying...');
  const [subText, setSubText] = useState('Please wait while we complete your authentication.');
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
    //    If the callback contains type=recovery, user came from a reset password email.
    //    Direct them straight to /reset-password with all auth tokens.
    // ─────────────────────────────────────────────────────────────
    const isRecovery = search.includes('type=recovery') || hash.includes('type=recovery');
    if (isRecovery) {
      navigate(`/reset-password${search}${hash}`, { replace: true });
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // 1. MOBILE NATIVE APP BRIDGE (Expo Go or Standalone APK)
    //    Triggered when mobile app sends source=mobileapp or return_to=exp://...
    // ─────────────────────────────────────────────────────────────
    const isNativeSource = search.includes('source=mobileapp') || search.includes('mobileapp=true') || !!returnTo;

    if (isNativeSource) {
      const code = urlParams.get('code');
      const error = urlParams.get('error') || urlParams.get('error_description');

      // Build the native deep link URL with auth params appended
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
      setStatus('Sign in Successful!');
      setSubText(isExpo
        ? 'Returning to Expo Go. Tap the button below if it does not open automatically.'
        : 'Returning to TradiFive. Tap the button below if it does not open automatically.');
      setShowWebFallback(true);

      // Immediately redirect to the native URL.
      // On iOS, WebBrowser.openAuthSessionAsync intercepts this redirect and
      // automatically closes the browser sheet, returning control to the app.
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

      // CRITICAL: Stop here — do NOT exchange the PKCE code on the web.
      // The mobile app will exchange it natively after receiving the exp:// deep link.
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
            }, 4000);
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
    setStatus('Logging into browser session...');
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
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#0a0a0c',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '3px solid rgba(59, 130, 246, 0.2)',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginBottom: 20
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      
      <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em', color: '#f8fafc' }}>
        {status}
      </h3>
      <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 24px 0', maxWidth: 340, lineHeight: 1.5 }}>
        {subText}
      </p>

      {deepLinkTarget ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
          <a
            href={deepLinkTarget}
            onClick={(e) => {
              e.preventDefault();
              handleLaunchNative();
            }}
            style={{
              padding: '14px 24px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              borderRadius: 14,
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              cursor: 'pointer',
              display: 'inline-block'
            }}
          >
            {buttonLabel}
          </a>

          {showWebFallback ? (
            <button
              type="button"
              disabled={isProcessingWeb}
              onClick={handleManualWebContinue}
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                borderRadius: 14,
                fontWeight: 500,
                fontSize: 14,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                cursor: 'pointer'
              }}
            >
              {isProcessingWeb ? 'Opening...' : 'Continue in Browser'}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
