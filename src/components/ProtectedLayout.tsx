import { Outlet } from "react-router-dom";
import { AuthGuard } from "./AuthGuard";
import { MaintenanceGuard } from "./MaintenanceGuard";
import { useEffect } from "react";

export const ProtectedLayout = () => {
  useEffect(() => {
    const checkMobile = () => {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isMobileWidth = window.innerWidth <= 768;
      
      if (isMobileUA || isMobileWidth) {
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
