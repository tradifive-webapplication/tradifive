import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { Component, ErrorInfo } from "react";
import { Toaster } from "sonner";
import { EmployeeAuthProvider, useEmployeeAuth } from "./contexts/EmployeeAuthContext";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import MyProfilePage from "./pages/MyProfilePage";
import EmployeeLogin from "./pages/EmployeeLogin";
import ChangePassword from "./pages/ChangePassword";
import EmployeeLayout from "./components/EmployeeLayout";

// Department Tools (Native)
import SalesDashboard from "./pages/sales/SalesDashboard";
import LeadsManager from "./pages/sales/LeadsManager";
import CampaignsPage from "./pages/sales/CampaignsPage";

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', background: '#222', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { adminUser, loading } = useEmployeeAuth();
  
  if (loading) return <div className="min-h-screen bg-[#020817] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div></div>;
  if (!adminUser) return <Navigate to="/login" replace />;
  
  if (adminUser.needsPasswordChange) return <Navigate to="/change-password" replace />;

  return <>{children}</>;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<EmployeeLogin />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/dashboard" element={<AuthGuard><EmployeeLayout><EmployeeDashboard /></EmployeeLayout></AuthGuard>} />
      <Route path="/profile" element={<AuthGuard><EmployeeLayout><MyProfilePage /></EmployeeLayout></AuthGuard>} />
      
      {/* Department Tools */}
      <Route path="/sales" element={<AuthGuard><EmployeeLayout><SalesDashboard /></EmployeeLayout></AuthGuard>} />
      <Route path="/sales/leads" element={<AuthGuard><EmployeeLayout><LeadsManager /></EmployeeLayout></AuthGuard>} />
      <Route path="/sales/campaigns" element={<AuthGuard><EmployeeLayout><CampaignsPage /></EmployeeLayout></AuthGuard>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <EmployeeAuthProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster theme="dark" position="top-right" />
        </BrowserRouter>
      </EmployeeAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
