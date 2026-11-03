import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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

    // If on a mobile device or in-app browser, immediately redirect to native app
    if (isMobileDevice) {
      setStatus('Redirecting back to TradiFive App...');
      window.location.replace(deepLink);

      // Fallback timer to show button if auto-redirect was blocked
      const fallbackTimer = setTimeout(() => {
        setStatus('Tap below to return to the TradiFive app:');
      }, 500);

      return () => clearTimeout(fallbackTimer);
    }

    // Desktop web flow:
    // Handle PKCE code exchange or implicit session
    const handleWebAuth = async () => {
      try {
        if (search.includes('code=')) {
          const urlParams = new URLSearchParams(search);
          const code = urlParams.get('code');
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) console.warn('[AuthCallback Web] PKCE code exchange error:', error.message);
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/home', { replace: true });
        } else {
          // Listen for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
              subscription.unsubscribe();
              navigate('/home', { replace: true });
            }
          });
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
