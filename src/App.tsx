import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TradingProvider } from "@/contexts/TradingContext";
import { AuthGuard } from "@/components/AuthGuard";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";
import { ProtectedLayout } from "./components/ProtectedLayout";
import { CustomCursor } from "./components/CustomCursor";
import { NetworkNotifier } from "@/components/NetworkNotifier";
import { AdminRoute } from "./components/AdminRoute";

// ── All pages are lazy-loaded to split the 11MB monolithic bundle into
//    small per-route chunks that iOS Safari WebKit can parse and execute.
const Landing = lazy(() => import("./pages/Landing"));
const ContactPublic = lazy(() => import("./pages/ContactPublic"));
const DownloadAppPublic = lazy(() => import("./pages/DownloadAppPublic"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Portfolio = lazy(() => import("./pages/dashboard/Portfolio"));
const Brokers = lazy(() => import("./pages/dashboard/Brokers"));
const Reports = lazy(() => import("./pages/dashboard/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const BrokerConnect = lazy(() => import("./pages/BrokerConnect"));
const Profile = lazy(() => import("./pages/Profile"));
const Channel = lazy(() => import("./pages/Channel"));
const Inbox = lazy(() => import("./pages/Inbox"));
const NotFound = lazy(() => import("./pages/NotFound"));
const RiskGuard = lazy(() => import("./pages/RiskGuard"));
const Journal = lazy(() => import("./pages/Journal"));
const Rewards = lazy(() => import("./pages/Rewards"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Support = lazy(() => import("./pages/Support"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Upgrade = lazy(() => import("./pages/Upgrade"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CompetitionsDashboard = lazy(() => import("./pages/CompetitionsDashboard"));
const CompetitionsLeaderboard = lazy(() => import("./pages/CompetitionsLeaderboard"));
const CompetitionsRewards = lazy(() => import("./pages/CompetitionsRewards"));
const TradifiveAI = lazy(() => import("./pages/TradifiveAI"));
const AITrading = lazy(() => import("./pages/AITrading"));
const AutoTradeDashboardPage = lazy(() => import('./pages/AutoTradeDashboardPage'));
const MyRobots = lazy(() => import('./pages/MyRobots'));
const StrategyBuilderPage = lazy(() => import('./pages/StrategyBuilderPage'));
const TradeHistory = lazy(() => import('./pages/TradeHistory'));
const MistakeTracking = lazy(() => import("./pages/MistakeTracking"));
const EASetup = lazy(() => import('./pages/EASetup'));
const ChallengeConsole = lazy(() => import("./pages/ChallengeConsole"));
const Payouts = lazy(() => import("./pages/Payouts"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Referrals = lazy(() => import("./pages/Referrals"));
const CreatorAnalytics = lazy(() => import("./pages/CreatorAnalytics"));
const MentorshipHub = lazy(() => import("./pages/MentorshipHub"));
const MyStore = lazy(() => import("./pages/creator/MyStore"));
const LiveSessions = lazy(() => import("./pages/creator/LiveSessions"));
const Create = lazy(() => import("./pages/create"));
const Home = lazy(() => import("./pages/Home"));
const Discover = lazy(() => import("./pages/Discover"));
const DiscoverPublic = lazy(() => import("./pages/DiscoverPublic"));
const ChannelsPublic = lazy(() => import("./pages/ChannelsPublic"));
const PulseFeedsPublic = lazy(() => import("./pages/PulseFeedsPublic"));
const UserProfilePublic = lazy(() => import("./pages/UserProfilePublic"));
const RiskGuardPublic = lazy(() => import("./pages/RiskGuardPublic"));
const SmartJournalPublic = lazy(() => import("./pages/SmartJournalPublic"));
const CommunityHubPublic = lazy(() => import("./pages/CommunityHubPublic"));
const CompetitionsPublic = lazy(() => import("./pages/CompetitionsPublic"));
const TradifiveAIPublic = lazy(() => import("./pages/TradifiveAIPublic"));
const AutoTradePublic = lazy(() => import("./pages/AutoTradePublic"));
const PrivacyPolicyPublic = lazy(() => import("./pages/PrivacyPolicyPublic"));
const TermsOfServicePublic = lazy(() => import("./pages/TermsOfServicePublic"));
const RefundPolicyPublic = lazy(() => import("./pages/RefundPolicyPublic"));
const RiskDisclosurePublic = lazy(() => import("./pages/RiskDisclosurePublic"));
const CookiePolicyPublic = lazy(() => import("./pages/CookiePolicyPublic"));
const AmlKycPolicyPublic = lazy(() => import("./pages/AmlKycPolicyPublic"));
const CustomStrategiesPublic = lazy(() => import("./pages/CustomStrategiesPublic"));
const OptionsTradingPublic = lazy(() => import("./pages/OptionsTradingPublic"));
const PropFirmIntegrationsPublic = lazy(() => import("./pages/PropFirmIntegrationsPublic"));
const AccountFrozen = lazy(() => import("./pages/AccountFrozen"));
const AccountDeleted = lazy(() => import("./pages/AccountDeleted"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminAutoTrade = lazy(() => import("./pages/admin/AdminAutoTrade"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminDeleted = lazy(() => import("./pages/admin/AdminDeleted"));
const AdminTrading = lazy(() => import("./pages/admin/AdminTrading"));
const AdminFinance = lazy(() => import("./pages/admin/AdminFinance"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs"));
const AdminWaitlist = lazy(() => import("./pages/admin/AdminWaitlist"));
const BrokerAuth = lazy(() => import("./pages/BrokerAuth"));


import { MarketProvider } from "@/contexts/MarketContext";
import { PresenceProvider } from "@/contexts/PresenceContext";
import { initGlobalHaptics } from "@/utils/haptics";
import { supabase } from "@/lib/supabase";

const queryClient = new QueryClient();

const isElectron = navigator.userAgent.toLowerCase().includes('electron');
const AppRouter = isElectron ? HashRouter : BrowserRouter;

const App = () => {
  useEffect(() => {
    return initGlobalHaptics();
  }, []);

  // Cross-user session isolation: if a DIFFERENT user logs in or on logout,
  // purge all auto-trade keys so stale account numbers and license data never leak to other accounts.
  useEffect(() => {
    const autoTradeKeys = [
      'tradifive_connected_mt5_account',
      'tradifive_ib_proof_request',
      'tradifive_payment_request',
      'tradifive_payment_status',
      'tradifive_auto_trade_setup'
    ];

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const newUserId = session.user.id;
        const lastUserId = localStorage.getItem('tradifive_last_user_id');
        if (lastUserId !== newUserId) {
          // Different user or new login — wipe stale auto-trade keys
          autoTradeKeys.forEach((k) => localStorage.removeItem(k));
        }
        localStorage.setItem('tradifive_last_user_id', newUserId);
      }
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('tradifive_last_user_id');
        autoTradeKeys.forEach((k) => localStorage.removeItem(k));
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NetworkNotifier />
      <MarketProvider>
        <TradingProvider>
          <PresenceProvider>
          <AppRouter>
            <CustomCursor />
            <Suspense fallback={<div style={{ minHeight: '100vh', width: '100%', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}>
              <Routes>
                <Route path="/" element={isElectron ? <Navigate to="/home" replace /> : <Landing />} />
                <Route path="/download" element={<DownloadAppPublic />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPublic />} />
                <Route path="/terms-of-service" element={<TermsOfServicePublic />} />
                <Route path="/refund-policy" element={<RefundPolicyPublic />} />
                <Route path="/risk-disclosure" element={<RiskDisclosurePublic />} />
                <Route path="/cookie-policy" element={<CookiePolicyPublic />} />
                <Route path="/aml-kyc-policy" element={<AmlKycPolicyPublic />} />
                <Route path="/features/discover" element={<DiscoverPublic />} />
                <Route path="/features/channels" element={<ChannelsPublic />} />
                <Route path="/features/creator-hub" element={<ChannelsPublic />} />
                <Route path="/features/pulse-feeds" element={<PulseFeedsPublic />} />
                <Route path="/login" element={<Login />} />
                <Route path="/contact" element={<ContactPublic />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/features/risk-guard" element={<RiskGuardPublic />} />
                <Route path="/features/smart-journal" element={<SmartJournalPublic />} />
                <Route path="/features/community-hub" element={<CommunityHubPublic />} />
                <Route path="/features/competitions" element={<CompetitionsPublic />} />
                <Route path="/features/tradifive-ai" element={<TradifiveAIPublic />} />
                <Route path="/features/auto-trade" element={<AutoTradePublic />} />
                <Route path="/features/custom-strategies" element={<CustomStrategiesPublic />} />
                <Route path="/features/options-trading" element={<OptionsTradingPublic />} />
                <Route path="/features/prop-firm-integrations" element={<PropFirmIntegrationsPublic />} />
                <Route path="/account-frozen" element={<AccountFrozen />} />
                <Route path="/account-deleted" element={<AccountDeleted />} />
                <Route path="/broker-auth/:brokerId" element={<BrokerAuth />} />
                {/* Protected Routes Wrapper */}
                <Route element={<ProtectedLayout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/marketplace" element={<Discover />} />
                  <Route path="/auto-trade/marketplace" element={<Discover />} />
                  <Route path="/marketplace/store" element={<Discover />} />
                  <Route path="/marketplace/signals" element={<Discover />} />
                  <Route path="/store" element={<Discover />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/portfolio" element={<Portfolio />} />
                  <Route path="/dashboard/brokers" element={<Brokers />} />
                  <Route path="/dashboard/reports" element={<Reports />} />
                  <Route path="/broker-connect" element={<Navigate to="/settings?tab=trading" replace />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/charts" element={<Navigate to="/journal" replace />} />
                  <Route path="/chart" element={<Navigate to="/journal" replace />} />
                  <Route path="/analytics" element={<Navigate to="/journal" replace />} />
                  <Route path="/journal/history" element={<TradeHistory />} />
                  <Route path="/journal/mistakes" element={<MistakeTracking />} />
                  <Route path="/mistakes" element={<MistakeTracking />} />
                  <Route path="/mistake-tracking" element={<MistakeTracking />} />
                  <Route path="/journal/tags" element={<Navigate to="/journal" replace />} />
                  <Route path="/risk-guard" element={<RiskGuard />} />
                  <Route path="/risk-guard/limits" element={<Navigate to="/risk-guard" replace />} />
                  <Route path="/risk-guard/exposure" element={<Navigate to="/risk-guard" replace />} />
                  <Route path="/risk-guard/kill-switch" element={<Navigate to="/risk-guard" replace />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/ai-coach" element={<TradifiveAI />} />
                  <Route path="/ai-coach/chat" element={<Navigate to="/ai-coach" replace />} />
                  <Route path="/ai-coach/feedback" element={<Navigate to="/ai-coach" replace />} />
                  <Route path="/ai-coach/goals" element={<Navigate to="/ai-coach" replace />} />
                  <Route path="/auto-trade/setup" element={<AITrading />} />
                  <Route path="/auto-trade/dashboard" element={<AutoTradeDashboardPage />} />
                  <Route path="/auto-trade/active-bots" element={<MyRobots />} />
                  <Route path="/auto-trade/builder" element={<StrategyBuilderPage />} />
                  <Route path="/strategy-builder" element={<StrategyBuilderPage />} />
                  <Route path="/strategy" element={<StrategyBuilderPage />} />
                  <Route path="/auto-trade/history" element={<TradeHistory />} />
                  <Route path="/history" element={<TradeHistory />} />
                  <Route path="/order-history" element={<TradeHistory />} />
                  <Route path="/auto-trade/license" element={<EASetup />} />
                  <Route path="/license" element={<EASetup />} />
                  <Route path="/activation" element={<EASetup />} />
                  <Route path="/ai-trading" element={<Navigate to="/auto-trade/setup" replace />} />
                  <Route path="/rewards" element={<Rewards />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/user/:username" element={<UserProfilePublic />} />
                  <Route path="/channel" element={<Channel />} />
                  <Route path="/channels" element={<Navigate to="/channel" replace />} />
                  <Route path="/channels/all" element={<Navigate to="/channel" replace />} />
                  <Route path="/channel/:channelId" element={<Channel />} />
                  <Route path="/inbox" element={<Inbox />} />
                  <Route path="/messages" element={<Navigate to="/inbox" replace />} />
                  <Route path="/channels/messages" element={<Navigate to="/inbox" replace />} />
                  <Route path="/learning" element={<Discover />} />
                  <Route path="/courses" element={<Discover />} />
                  <Route path="/discover/strategies" element={<Navigate to="/discover" replace />} />
                  <Route path="/discover/traders" element={<Navigate to="/discover" replace />} />
                  <Route path="/finance" element={<Navigate to="/dashboard/portfolio" replace />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/upgrade" element={<Upgrade />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/competitions/dashboard" element={<CompetitionsDashboard />} />
                  <Route path="/competitions/leaderboard" element={<CompetitionsLeaderboard />} />
                  <Route path="/competitions/challenge/:id" element={<ChallengeConsole />} />
                  <Route path="/competitions/payouts" element={<Payouts />} />
                  <Route path="/competitions/transaction" element={<Transactions />} />
                  <Route path="/competitions/rewards" element={<CompetitionsRewards />} />
                  <Route path="/referrals" element={<Referrals />} />
                  <Route path="/creator/analytics" element={<CreatorAnalytics />} />
                  <Route path="/creator/mentorship" element={<MentorshipHub />} />
                  <Route path="/creator/store" element={<MyStore />} />
                  <Route path="/creator/live" element={<LiveSessions />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
                <Route path="/admin/auto-trade" element={<AdminRoute><AdminAutoTrade /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/deleted" element={<AdminRoute><AdminDeleted /></AdminRoute>} />
                <Route path="/admin/trading" element={<AdminRoute><AdminTrading /></AdminRoute>} />
                <Route path="/admin/finance" element={<AdminRoute><AdminFinance /></AdminRoute>} />
                <Route path="/admin/support" element={<AdminRoute><AdminSupport /></AdminRoute>} />
                <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
                <Route path="/admin/waitlist" element={<AdminRoute><AdminWaitlist /></AdminRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppRouter>
          </PresenceProvider>
        </TradingProvider>
      </MarketProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;



