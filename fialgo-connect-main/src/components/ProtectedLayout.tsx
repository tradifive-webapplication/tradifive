import { Outlet } from "react-router-dom";
import { AuthGuard } from "./AuthGuard";
import { MaintenanceGuard } from "./MaintenanceGuard";

export const ProtectedLayout = () => {
  return (
    <AuthGuard>
      <MaintenanceGuard>
        <Outlet />
      </MaintenanceGuard>
    </AuthGuard>
  );
};

export default ProtectedLayout;
