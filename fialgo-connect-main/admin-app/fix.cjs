const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const components = [
  'AdminLogin', 'AdminSignup', 'AdminVerify', 'Dashboard', 'UsersPage', 'AdminDeleted', 'WaitlistPage',
  'TradesPage', 'RiskControlPage', 'MT5MonitorPage', 'AlertsPage', 'PaymentsPage', 'AuditLogsPage',
  'SettingsPage', 'RolesManagementPage', 'SystemStatusPage', 'TechIssuesPage', 'SupportTicketsPage',
  'OperationsPanelPage', 'TaskProtocolPage', 'AdminTrading', 'FeedbackInboxPage', 'CompetitionManagerPage',
  'PayoutApprovalsPage', 'TransactionLedgerPage', 'RewardsManagerPage', 'SubscriptionManagerPage',
  'AICoachMonitorPage', 'AdminAgentPage', 'AdminGlobalRadarPage', 'ChannelManagerPage', 'ContentModerationPage',
  'ReferralsManagerPage', 'NotificationsBroadcasterPage', 'LearningManagerPage', 'StrategyMonitorPage',
  'TradeJournalMonitorPage', 'MarketplaceManagerPage'
];
const hrComponents = [
  'HRDashboardPage', 'EmployeeDirectoryPage', 'HiringPipelinePage', 'AttendancePage', 'PayrollPage'
];
const ceoComponents = [
  'CEOCommandCenter', 'TeamTrackerCalendar', 'TaskAssignment'
];
const employeeComponents = [
  'EmployeeDashboard', 'MyProfilePage'
];

let imports = '';
components.forEach(c => imports += `import ${c} from './pages/${c}';\n`);
hrComponents.forEach(c => imports += `import ${c} from './pages/hr/${c}';\n`);
ceoComponents.forEach(c => imports += `import ${c} from './pages/ceo/${c}';\n`);
employeeComponents.forEach(c => imports += `import ${c} from './pages/employee/${c}';\n`);
imports += `import LiveAppView from './components/LiveAppView';\n`;

// Also clean up any lingering bad replacements just in case
code = code.replace(/import \{ motion \} from "framer-motion";\n(\s*)/, 'import { motion } from "framer-motion";\n' + imports + '\n');

fs.writeFileSync('src/App.tsx', code);
