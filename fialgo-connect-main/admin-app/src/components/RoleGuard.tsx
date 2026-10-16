import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { canAccessPage, type PageId } from "../lib/rbac";
import { ShieldAlert } from "lucide-react";

interface RoleGuardProps {
  children: ReactNode;
  pageId: PageId;
}

export default function RoleGuard({ children, pageId }: RoleGuardProps) {
  const { adminUser, loading, viewRole } = useAdminAuth();
  const location = useLocation();

  if (loading) return null;

  if (!adminUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roleToCheck = viewRole || adminUser.role;

  if (!canAccessPage(roleToCheck, pageId)) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6 animate-fade-in">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 max-w-md">
          Your current clearance level ({roleToCheck.toUpperCase().replace('_', ' ')}) 
          does not grant access to this sector.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
