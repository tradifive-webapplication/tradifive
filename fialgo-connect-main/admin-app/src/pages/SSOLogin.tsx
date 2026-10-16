import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function SSOLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const redirect = searchParams.get('redirect') || '/';
    const embed = searchParams.get('embed') === 'true';

    const login = async () => {
      if (accessToken && refreshToken) {
        // Set the session using the tokens passed from the parent app
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        // Setting 2FA as verified so AuthGuard passes without secondary login
        localStorage.setItem("admin_2fa_verified", "true");
        // Update auth state so contexts pick it up quickly
        window.dispatchEvent(new Event("storage"));
      }
      
      const redirectUrl = embed ? `${redirect}?embed=true` : redirect;
      
      // Delay navigation slightly to let auth state settle
      setTimeout(() => {
        window.location.href = redirectUrl; // Use window.location to force full reload into AuthContext
      }, 300);
    };

    login();
  }, [searchParams]);

  return (
    <div className="h-screen w-screen bg-[#121212] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
}
