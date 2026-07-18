import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function EmbeddedToolViewer() {
  const location = useLocation();
  const [iframeUrl, setIframeUrl] = useState<string>('');

  useEffect(() => {
    const generateIframeUrl = async () => {
      // 1. Get the current active session tokens
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return; // Wait for session
      
      // 2. We extract the tool path from the query param (e.g. ?path=/sales)
      const params = new URLSearchParams(location.search);
      const targetPath = params.get('path') || '/';

      // 3. Build the SSO URL pointing to the Admin App
      // We pass the tokens so the admin app can log in seamlessly
      const url = `http://localhost:5173/sso-embed?access_token=${session.access_token}&refresh_token=${session.refresh_token}&redirect=${encodeURIComponent(targetPath)}&embed=true`;
      
      setIframeUrl(url);
    };

    generateIframeUrl();
  }, [location.search]);

  if (!iframeUrl) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-[calc(100vh-2rem)] bg-[#121212] flex flex-col relative overflow-hidden rounded-xl border border-white/5 shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 z-10 opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
      
      <iframe
        src={iframeUrl}
        className="w-full h-full border-none"
        title="Department Tool"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
