import { Outlet, useLocation } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { AuthGuard } from "./AuthGuard";
import { MaintenanceGuard } from "./MaintenanceGuard";

export const ProtectedLayout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <AuthGuard>
      <MaintenanceGuard>
        <Suspense
          fallback={
            <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 select-none">
              <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </MaintenanceGuard>
    </AuthGuard>
  );
};

export default ProtectedLayout;
