import { Outlet } from "react-router-dom";
import { AuthGuard } from "./AuthGuard";
import { MaintenanceGuard } from "./MaintenanceGuard";
import { useEffect } from "react";

export const ProtectedLayout = () => {
  useEffect(() => {
    const checkMobile = () => {
      // Never hijack local development or desktop resize
      if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.local')
      ) {
        return;
      }

      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobileUA) {
        if (!window.location.pathname.startsWith('/mobile')) {
          window.location.href = '/mobile/';
        }
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <AuthGuard>
      <MaintenanceGuard>
        <Outlet />
      </MaintenanceGuard>
    </AuthGuard>
  );
};

export default ProtectedLayout;
