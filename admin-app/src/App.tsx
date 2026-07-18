import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "./contexts/AdminAuthContext";
import { getDefaultPathForRole } from "./lib/rbac";
import RoleGuard from "./components/RoleGuard";
import AdminLayout from "./components/AdminLayout";
import { motion } from "framer-motion";
import { Toaster } from "sonner";
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import AdminVerify from './pages/AdminVerify';
import SSOLogin from './pages/SSOLogin';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import AdminDeleted from './pages/AdminDeleted';
import WaitlistPage from './pages/WaitlistPage';
import TradesPage from './pages/TradesPage';
import RiskControlPage from './pages/RiskControlPage';
import MT5MonitorPage from './pages/MT5MonitorPage';
import AlertsPage from './pages/AlertsPage';
import PaymentsPage from './pages/PaymentsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SettingsPage from './pages/SettingsPage';
import RolesManagementPage from './pages/RolesManagementPage';
import SystemStatusPage from './pages/SystemStatusPage';
import TechIssuesPage from './pages/TechIssuesPage';
import SupportTicketsPage from './pages/SupportTicketsPage';
import OperationsPanelPage from './pages/OperationsPanelPage';
import TaskProtocolPage from './pages/TaskProtocolPage';
import AdminTrading from './pages/AdminTrading';
import FeedbackInboxPage from './pages/FeedbackInboxPage';
import CompetitionManagerPage from './pages/CompetitionManagerPage';
import PayoutApprovalsPage from './pages/PayoutApprovalsPage';
import TransactionLedgerPage from './pages/TransactionLedgerPage';
import RewardsManagerPage from './pages/RewardsManagerPage';
import SubscriptionManagerPage from './pages/SubscriptionManagerPage';
import AICoachMonitorPage from './pages/AICoachMonitorPage';
import AdminAgentPage from './pages/AdminAgentPage';
import AdminGlobalRadarPage from './pages/AdminGlobalRadarPage';
import ChannelManagerPage from './pages/ChannelManagerPage';
import ContentModerationPage from './pages/ContentModerationPage';
import ReferralsManagerPage from './pages/ReferralsManagerPage';
import NotificationsBroadcasterPage from './pages/NotificationsBroadcasterPage';
import LearningManagerPage from './pages/LearningManagerPage';
import StrategyMonitorPage from './pages/StrategyMonitorPage';
import TradeJournalMonitorPage from './pages/TradeJournalMonitorPage';
import MarketplaceManagerPage from './pages/MarketplaceManagerPage';
import MentorManagerPage from './pages/MentorManagerPage';
import HRDashboardPage from './pages/hr/HRDashboardPage';
import EmployeeDirectoryPage from './pages/hr/EmployeeDirectoryPage';
import HiringPipelinePage from './pages/hr/HiringPipelinePage';
import AttendancePage from './pages/hr/AttendancePage';
import PayrollPage from './pages/hr/PayrollPage';
import DepartmentsPage from './pages/hr/DepartmentsPage';
import CEOCommandCenter from './pages/ceo/CEOCommandCenter';
import TeamTrackerCalendar from './pages/ceo/TeamTrackerCalendar';
import TaskAssignment from './pages/ceo/TaskAssignment';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyProfilePage from './pages/employee/MyProfilePage';
import LiveAppView from './components/LiveAppView';

import SalesDashboard from './pages/sales/SalesDashboard';
import LeadsManager from './pages/sales/LeadsManager';
import CampaignsPage from './pages/sales/CampaignsPage';

// Auth guard that redirects to login if not authenticated
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { adminUser, loading, is2FAVerified } = useAdminAuth();
  const location = useLocation();

  // Still verifying session — show nothing (App-level suspense handles the spinner)
  if (loading) return null;

  if (!adminUser || !is2FAVerified) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Wrapper for the main admin area, preventing layout from unmounting on page change
function ProtectedLayout() {
  return (
    <AuthGuard>
      <AdminLayout>
        <Suspense fallback={<GlobalLoading />}>
          <Outlet />
        </Suspense>
      </AdminLayout>
    </AuthGuard>
  );
}

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path && !["/login", "/signup", "/verify"].includes(path)) {
      localStorage.setItem("admin_last_path", path);
    }
  }, [location]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/signup" element={<AdminSignup />} />
      <Route path="/verify" element={<AdminVerify />} />
      <Route path="/sso-embed" element={<SSOLogin />} />

      {/* Live App Viewer Full Page */}
      <Route path="/live-view" element={
        <AuthGuard>
          <LiveAppView isOpen={true} onClose={() => window.close()} />
        </AuthGuard>
      } />

      {/* Protected Routes inside the persistent layout */}
      <Route element={<ProtectedLayout />}>
        {/* Smart Root Redirect */}
        <Route path="/" element={<RoleBasedDashboard />} />

        {/* Protected Role-Based Routes */}
        <Route path="/users" element={<RoleGuard pageId="users"><UsersPage /></RoleGuard>} />
        <Route path="/deleted-records" element={<RoleGuard pageId="deleted_records"><AdminDeleted /></RoleGuard>} />
        <Route path="/waitlist" element={<RoleGuard pageId="waitlist"><WaitlistPage /></RoleGuard>} />
        <Route path="/trades" element={<RoleGuard pageId="trades"><TradesPage /></RoleGuard>} />
        <Route path="/maintenance" element={<RoleGuard pageId="maintenance_master"><AdminTrading /></RoleGuard>} />
        <Route path="/risk-control" element={<RoleGuard pageId="risk_control"><RiskControlPage /></RoleGuard>} />
        <Route path="/mt5-monitor" element={<RoleGuard pageId="mt5_monitor"><MT5MonitorPage /></RoleGuard>} />

        <Route path="/alerts" element={<RoleGuard pageId="alerts"><AlertsPage /></RoleGuard>} />
        <Route path="/payments" element={<RoleGuard pageId="payments"><PaymentsPage /></RoleGuard>} />
        <Route path="/audit-logs" element={<RoleGuard pageId="audit_logs"><AuditLogsPage /></RoleGuard>} />
        <Route path="/settings" element={<RoleGuard pageId="settings"><SettingsPage /></RoleGuard>} />
        <Route path="/roles" element={<RoleGuard pageId="roles_management"><RolesManagementPage /></RoleGuard>} />
        <Route path="/system-status" element={<RoleGuard pageId="system_status"><SystemStatusPage /></RoleGuard>} />
        <Route path="/tech-issues" element={<RoleGuard pageId="tech_issues"><TechIssuesPage /></RoleGuard>} />
        <Route path="/support-tickets" element={<RoleGuard pageId="support_tickets"><SupportTicketsPage /></RoleGuard>} />
        <Route path="/operations" element={<RoleGuard pageId="operations_panel"><OperationsPanelPage /></RoleGuard>} />
        <Route path="/tasks" element={<RoleGuard pageId="task_protocol"><TaskProtocolPage /></RoleGuard>} />

        {/* Sales Suite */}
        <Route path="/sales" element={<RoleGuard pageId="sales_dashboard"><SalesDashboard /></RoleGuard>} />
        <Route path="/sales/leads" element={<RoleGuard pageId="leads_manager"><LeadsManager /></RoleGuard>} />
        <Route path="/sales/campaigns" element={<RoleGuard pageId="sales_campaigns"><CampaignsPage /></RoleGuard>} />

        {/* NEW: 7 Missing Admin Control Pages */}
        <Route path="/feedback" element={<RoleGuard pageId="feedback_inbox"><FeedbackInboxPage /></RoleGuard>} />
        <Route path="/competitions" element={<RoleGuard pageId="competition_manager"><CompetitionManagerPage /></RoleGuard>} />
        <Route path="/payouts" element={<RoleGuard pageId="payout_approvals"><PayoutApprovalsPage /></RoleGuard>} />
        <Route path="/transactions" element={<RoleGuard pageId="transaction_ledger"><TransactionLedgerPage /></RoleGuard>} />
        <Route path="/rewards" element={<RoleGuard pageId="rewards_manager"><RewardsManagerPage /></RoleGuard>} />
        <Route path="/subscriptions" element={<RoleGuard pageId="subscription_manager"><SubscriptionManagerPage /></RoleGuard>} />
        <Route path="/ai-monitor" element={<RoleGuard pageId="ai_coach_monitor"><AICoachMonitorPage /></RoleGuard>} />
        <Route path="/agent" element={<RoleGuard pageId="agent_command"><AdminAgentPage /></RoleGuard>} />
        <Route path="/global-radar" element={<RoleGuard pageId="global_radar"><AdminGlobalRadarPage /></RoleGuard>} />
        <Route path="/channels-admin" element={<RoleGuard pageId="channel_manager"><ChannelManagerPage /></RoleGuard>} />
        <Route path="/content-admin" element={<RoleGuard pageId="content_moderation"><ContentModerationPage /></RoleGuard>} />
        <Route path="/referrals-admin" element={<RoleGuard pageId="referrals_manager"><ReferralsManagerPage /></RoleGuard>} />
        <Route path="/notifications-broadcast" element={<RoleGuard pageId="notifications_broadcaster"><NotificationsBroadcasterPage /></RoleGuard>} />
        <Route path="/learning-admin" element={<RoleGuard pageId="learning_manager"><LearningManagerPage /></RoleGuard>} />
        <Route path="/strategies-admin" element={<RoleGuard pageId="strategy_monitor"><StrategyMonitorPage /></RoleGuard>} />
        <Route path="/journals-admin" element={<RoleGuard pageId="journal_monitor"><TradeJournalMonitorPage /></RoleGuard>} />
        <Route path="/marketplace-admin" element={<RoleGuard pageId="marketplace_manager"><MarketplaceManagerPage /></RoleGuard>} />
        <Route path="/mentors" element={<RoleGuard pageId="mentor_manager"><MentorManagerPage /></RoleGuard>} />

        {/* HR & Employee Routes */}
        <Route path="/hr" element={<RoleGuard pageId="hr_dashboard"><HRDashboardPage /></RoleGuard>} />
        <Route path="/hr/roles" element={<RoleGuard pageId="roles_management_hr"><RolesManagementPage /></RoleGuard>} />
        <Route path="/hr/training" element={<RoleGuard pageId="learning_manager_hr"><LearningManagerPage /></RoleGuard>} />
        <Route path="/hr/employees" element={<RoleGuard pageId="employee_directory"><EmployeeDirectoryPage /></RoleGuard>} />
        <Route path="/hr/departments" element={<RoleGuard pageId="departments_manager"><DepartmentsPage /></RoleGuard>} />
        <Route path="/hr/hiring" element={<RoleGuard pageId="hiring_pipeline"><HiringPipelinePage /></RoleGuard>} />
        <Route path="/hr/attendance" element={<RoleGuard pageId="attendance"><AttendancePage /></RoleGuard>} />
        <Route path="/hr/payroll" element={<RoleGuard pageId="payroll"><PayrollPage /></RoleGuard>} />
        <Route path="/my-dashboard" element={<RoleGuard pageId="my_dashboard"><EmployeeDashboard /></RoleGuard>} />
        <Route path="/my-profile" element={<RoleGuard pageId="my_profile"><MyProfilePage /></RoleGuard>} />

        <Route path="/ceo/team-tracker" element={<RoleGuard pageId="team_tracker"><TeamTrackerCalendar /></RoleGuard>} />
        <Route path="/ceo/task-assignment" element={<RoleGuard pageId="task_assignment"><TaskAssignment /></RoleGuard>} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

let initialPathRestored = false;

function RoleBasedDashboard() {
  const { activeRole } = useAdminAuth();

  // Redirect to the last visited path only on initial boot/refresh
  if (!initialPathRestored) {
    initialPathRestored = true;
    const savedPath = localStorage.getItem("admin_last_path");
    if (savedPath && savedPath !== "/") {
      return <Navigate to={savedPath} replace />;
    }
  }

  if (activeRole === "ceo") return <CEOCommandCenter />;
  if (activeRole === "employee") return <Navigate to="/my-dashboard" replace />;
  if (activeRole === "hr_manager") return <Navigate to="/hr" replace />;
  return (
    <RoleGuard pageId="dashboard">
      <Dashboard />
    </RoleGuard>
  );
}

function GlobalLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-6 h-6 border border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Suspense fallback={
          <div className="min-h-screen bg-[#121212] flex items-center justify-center">
            <div className="w-6 h-6 border border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        }>
          <AppRoutes />
        </Suspense>
        <Toaster position="top-center" theme="dark" />
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
