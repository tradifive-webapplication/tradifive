import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Authenticating and securing session...');
  const [isMobile, setIsMobile] = useState(false);
  const [deepLinkTarget, setDeepLinkTarget] = useState('');

  useEffect(() => {
    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);

    const search = window.location.search || '';
    const hash = window.location.hash || '';
    const deepLink = `mobileapp://auth-callback${search}${hash}`;
    setDeepLinkTarget(deepLink);

    // Only redirect to native app if explicitly requested by the native mobile app
    const isNativeAppSource = search.includes('source=mobileapp') || search.includes('mobileapp=true');
    if (isMobileDevice && isNativeAppSource) {
      setStatus('Redirecting back to TradiFive App...');
      window.location.replace(deepLink);

      // Fallback timer to show button if auto-redirect was blocked
      const fallbackTimer = setTimeout(() => {
        setStatus('Tap below to return to the TradiFive app:');
      }, 500);

      return () => clearTimeout(fallbackTimer);
    }

    // Web flow (Desktop and Mobile Web):
    // Handle PKCE code exchange or implicit session reliably
    const handleWebAuth = async () => {
      try {
        // Check for error in hash or query returned by OAuth provider
        if (search.includes('error=') || hash.includes('error=')) {
          const params = new URLSearchParams((search || hash).replace(/^#/, '?'));
          const errorDesc = params.get('error_description') || params.get('error');
          console.error('[OAuth Error]:', errorDesc);
          navigate(`/login?oauth_error=${encodeURIComponent(errorDesc || 'Authentication failed')}`, { replace: true });
          return;
        }

        // 1. Check if session was already initialized by detectSessionInUrl
        let { data: { session } } = await supabase.auth.getSession();

        // 2. If not immediately available, wait for onAuthStateChange or PKCE exchange (up to 4s)
        if (!session && (search.includes('code=') || hash.includes('access_token='))) {
          session = await new Promise((resolve) => {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
              if (s && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
                subscription.unsubscribe();
                resolve(s);
              }
            });

            // Parallel PKCE manual fallback if needed
            if (search.includes('code=')) {
              const urlParams = new URLSearchParams(search);
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
          navigate('/home', { replace: true });
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
      
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px 0' }}>TradiFive Authentication</h2>
      <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, maxWidth: 360, lineHeight: 1.5 }}>{status}</p>

      {isMobile && deepLinkTarget ? (
        <a
          href={deepLinkTarget}
          style={{
            marginTop: 24,
            padding: '12px 28px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
          }}
        >
          Open TradiFive App
        </a>
      ) : null}
    </div>
  );
}
