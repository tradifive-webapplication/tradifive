import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import { AuthGuard } from "./AuthGuard";
import { MaintenanceGuard } from "./MaintenanceGuard";

export const ProtectedLayout = () => {
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
