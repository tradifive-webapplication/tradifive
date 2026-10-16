import {
  LayoutDashboard, Users, BarChart3, ShieldAlert, Monitor, Zap, Bell,
  CreditCard, FileText, Settings, UserCog, Cpu, Wrench, Headphones,
  ClipboardList, type LucideIcon, MessageSquare, Trophy, Banknote,
  Receipt, Crown, Brain, Star, BotMessageSquare, Target, Landmark,
  Gauge, ScanSearch, Activity, UserPlus, CalendarDays, Building2,
  Home, User, DollarSign, Megaphone, Flag, Share2, Radio, BookOpen,
  Workflow, BookMarked, ShoppingBag, GraduationCap, Bot
} from "lucide-react";

export type AdminRole =
  | "ceo"
  | "technical_lead"
  | "operations_executive"
  | "support_executive"
  | "sales_executive"
  | "hr_manager"
  | "employee"
  | "risk_executive"
  | "finance_executive"
  | "community_manager"
  | "mentor_manager";

export const ROLE_LABELS: Record<AdminRole, string> = {
  ceo: "CEO",
  technical_lead: "CTO",
  operations_executive: "COO",
  support_executive: "Head of Support",
  sales_executive: "Head of Sales",
  hr_manager: "CHRO",
  employee: "Employee",
  risk_executive: "CRO",
  finance_executive: "CFO",
  community_manager: "CMO",
  mentor_manager: "Head of Mentors",
};

export const ROLE_COLORS: Record<AdminRole, string> = {
  ceo: "#f59e0b",
  technical_lead: "#6366f1",
  operations_executive: "#10b981",
  support_executive: "#3b82f6",
  sales_executive: "#f97316",
  hr_manager: "#a855f7",
  employee: "#64748b",
  risk_executive: "#ef4444",
  finance_executive: "#10b981",
  community_manager: "#f97316",
  mentor_manager: "#8b5cf6",
};

export type PageId =
  | "dashboard"
  | "auto_trade_manager"
  | "users"
  | "deleted_records"
  | "trades"
  | "risk_control"
  | "mt5_monitor"
  | "alerts"
  | "payments"
  | "audit_logs"
  | "settings"
  | "roles_management"
  | "system_status"
  | "tech_issues"
  | "support_tickets"
  | "operations_panel"
  | "maintenance_master"
  | "task_protocol"
  | "feedback_inbox"
  | "competition_manager"
  | "payout_approvals"
  | "transaction_ledger"
  | "rewards_manager"
  | "subscription_manager"
  | "ai_coach_monitor"
  | "agent_command"
  | "global_radar"
  | "channel_manager"
  | "content_moderation"
  | "referrals_manager"
  | "notifications_broadcaster"
  | "learning_manager"
  | "strategy_monitor"
  | "journal_monitor"
  | "marketplace_manager"
  | "waitlist"
  | "mentor_manager"
  // Sales pages
  | "sales_dashboard"
  | "leads_manager"
  | "sales_campaigns"
  // HR pages
  | "hr_dashboard"
  | "employee_directory"
  | "departments_manager"
  | "hiring_pipeline"
  | "attendance"
  | "payroll"
  // CEO Team Tracker
  | "team_tracker"
  | "task_assignment"
  | "learning_manager_hr"
  // Employee pages

  | "my_profile"
  | "roles_management_hr";

export interface NavItem {
  id: PageId;
  label: string;
  icon: LucideIcon;
  path: string;
  department: string;
  badge?: string;
  group?: string; // optional sub-group label within a department
}

export const DEPARTMENT_ORDER = [
  "Overview",
  "Content & Marketing",
  "Marketplace",
  "Trading & Risk",
  "Finance & Compliance",
  "Sales",
  "Support",
  "Operations",
  "Technology",
  "AI Agents",
  "Mentors",
  "HR & People",
  "My Workspace",
  "Config",
];

const ALL_NAV_ITEMS: NavItem[] = [
  // OVERVIEW
  { id: "dashboard", label: "Executive Terminal", icon: Gauge, path: "/", department: "Overview" },

  // USERS & CRM (mapped to Operations)
  { id: "users", label: "User Registry", icon: Users, path: "/users", department: "Operations" },
  { id: "deleted_records", label: "Deleted Records", icon: UserCog, path: "/deleted-records", department: "Operations" },
  { id: "waitlist", label: "Waitlist Registry", icon: Users, path: "/waitlist", department: "Operations", badge: "NEW" },
  { id: "subscription_manager", label: "Subscriptions", icon: Crown, path: "/subscriptions", department: "Finance & Compliance" },
  { id: "referrals_manager", label: "Referrals & Affiliates", icon: Share2, path: "/referrals-admin", department: "Finance & Compliance" },
  { id: "roles_management", label: "Admin Personnel", icon: UserCog, path: "/roles", department: "Operations" },

  // COMMUNITY & CONTENT
  { id: "channel_manager", label: "Channel Directory", icon: Radio, path: "/channels-admin", department: "Content & Marketing" },
  { id: "content_moderation", label: "Content Moderation", icon: Flag, path: "/content-admin", department: "Content & Marketing", badge: "LIVE" },
  { id: "notifications_broadcaster", label: "Broadcaster", icon: Megaphone, path: "/notifications-broadcast", department: "Content & Marketing" },
  { id: "learning_manager", label: "Learning Center", icon: BookOpen, path: "/learning-admin", department: "Content & Marketing" },

  // MARKETPLACE
  { id: "marketplace_manager", label: "Algo Marketplace", icon: ShoppingBag, path: "/marketplace-admin", department: "Marketplace", badge: "LIVE" },

  // TRADING & RISK
  { id: "auto_trade_manager", label: "Auto Trade", icon: Bot, path: "/auto-trade-admin", department: "Trading & Risk", badge: "LIVE" },
  { id: "trades", label: "Execution Feed", icon: Activity, path: "/trades", department: "Trading & Risk" },
  { id: "risk_control", label: "Risk Control", icon: ShieldAlert, path: "/risk-control", department: "Trading & Risk" },
  { id: "mt5_monitor", label: "MT5 Monitor", icon: Monitor, path: "/mt5-monitor", department: "Trading & Risk" },
  { id: "journal_monitor", label: "Trade Journals", icon: BookMarked, path: "/journals-admin", department: "Trading & Risk" },
  { id: "strategy_monitor", label: "Strategies", icon: Workflow, path: "/strategies-admin", department: "Trading & Risk" },
  { id: "competition_manager", label: "Competitions", icon: Trophy, path: "/competitions", department: "Trading & Risk" },
  { id: "rewards_manager", label: "Rewards & XP", icon: Star, path: "/rewards", department: "Trading & Risk" },
  { id: "alerts", label: "System Alerts", icon: Bell, path: "/alerts", department: "Trading & Risk" },

  // FINANCE & COMPLIANCE
  { id: "payments", label: "Revenue Stream", icon: Landmark, path: "/payments", department: "Finance & Compliance" },
  { id: "payout_approvals", label: "Payout Approvals", icon: Banknote, path: "/payouts", department: "Finance & Compliance", badge: "ACTION" },
  { id: "transaction_ledger", label: "Transaction Ledger", icon: Receipt, path: "/transactions", department: "Finance & Compliance" },
  { id: "audit_logs", label: "Audit Logs", icon: FileText, path: "/audit-logs", department: "Finance & Compliance" },

  // SALES
  { id: "sales_dashboard", label: "Sales Dashboard", icon: BarChart3, path: "/sales", department: "Sales" },
  { id: "leads_manager", label: "Leads & Pipeline", icon: Users, path: "/sales/leads", department: "Sales", badge: "NEW" },
  { id: "sales_campaigns", label: "Outreach Campaigns", icon: Megaphone, path: "/sales/campaigns", department: "Sales" },

  // SUPPORT
  { id: "support_tickets", label: "Support Tickets", icon: Headphones, path: "/support-tickets", department: "Support", badge: "LIVE" },
  { id: "feedback_inbox", label: "Feedback Inbox", icon: MessageSquare, path: "/feedback", department: "Support" },

  // OPERATIONS
  { id: "operations_panel", label: "Mission Control", icon: Target, path: "/operations", department: "Operations" },
  { id: "task_protocol", label: "Task Protocol", icon: ClipboardList, path: "/tasks", department: "Operations" },

  // TECHNOLOGY
  { id: "system_status", label: "System Health", icon: Cpu, path: "/system-status", department: "Technology" },
  { id: "tech_issues", label: "Incident Log", icon: Wrench, path: "/tech-issues", department: "Technology" },
  { id: "maintenance_master", label: "Maintenance Mode", icon: Zap, path: "/maintenance", department: "Technology" },
  { id: "ai_coach_monitor", label: "AI Coach Monitor", icon: Brain, path: "/ai-monitor", department: "Technology" },
  { id: "global_radar", label: "Global Radar", icon: ScanSearch, path: "/global-radar", department: "Technology", badge: "LIVE" },

  // AI AGENTS

  // MENTORS
  { id: "mentor_manager", label: "Mentor Roster", icon: GraduationCap, path: "/mentors", department: "Mentors" },

  // HR & PEOPLE
  { id: "hr_dashboard", label: "HR Dashboard", icon: Building2, path: "/hr", department: "HR & People" },
  { id: "employee_directory", label: "Employee Directory", icon: Users, path: "/hr/employees", department: "HR & People" },
  { id: "departments_manager", label: "Departments", icon: Building2, path: "/hr/departments", department: "HR & People" },
  { id: "hiring_pipeline", label: "Hiring Pipeline", icon: UserPlus, path: "/hr/hiring", department: "HR & People" },
  { id: "attendance", label: "Attendance", icon: CalendarDays, path: "/hr/attendance", department: "HR & People" },
  { id: "payroll", label: "Payroll & Salaries", icon: DollarSign, path: "/hr/payroll", department: "HR & People", badge: "ACTION" },
  { id: "roles_management_hr", label: "Admin Personnel", icon: UserCog, path: "/hr/roles", department: "HR & People" },
  { id: "learning_manager_hr", label: "Employee Training", icon: BookOpen, path: "/hr/training", department: "HR & People", badge: "NEW" },
  { id: "team_tracker", label: "Team Tracker", icon: CalendarDays, path: "/ceo/team-tracker", department: "HR & People" },
  { id: "task_assignment", label: "Task Assignment", icon: ClipboardList, path: "/ceo/task-assignment", department: "HR & People", badge: "NEW" },

  // MY WORKSPACE (employee only)

  { id: "my_profile", label: "My Profile", icon: User, path: "/my-profile", department: "My Workspace" },

  // CONFIG
  { id: "settings", label: "Global Config", icon: Settings, path: "/settings", department: "Config" },
];

const PAGE_ACCESS: Record<AdminRole, PageId[]> = {
  ceo: [
    "dashboard",
    "marketplace_manager",
    "auto_trade_manager",
    "roles_management",
    "team_tracker",
    "task_assignment",
    "attendance",
    "agent_command",
    "settings",
  ],

  technical_lead: [
    "dashboard",
    "marketplace_manager",
    "auto_trade_manager",
    "system_status", "tech_issues", "maintenance_master", "ai_coach_monitor", "global_radar",
    "settings",
    "agent_command",
  ],

  operations_executive: [
    "dashboard",
    "marketplace_manager",
    "auto_trade_manager",
    "waitlist",
    "users", "deleted_records", "roles_management",
    "operations_panel", "task_protocol",
    "agent_command",
    "mentor_manager",
  ],

  support_executive: [
    "dashboard",
    "auto_trade_manager",
    "support_tickets", "feedback_inbox",
    "agent_command",
  ],

  sales_executive: [
    "dashboard",
    "marketplace_manager",
    "sales_dashboard", "leads_manager", "sales_campaigns",
    "agent_command",
  ],

  hr_manager: [
    "hr_dashboard",
    "employee_directory",
    "departments_manager",
    "hiring_pipeline",
    "attendance",
    "payroll",
    "roles_management_hr",
    "learning_manager_hr",
    "team_tracker",
    "task_assignment",
    "agent_command",
  ],

  risk_executive: [
    "dashboard",
    "marketplace_manager",
    "auto_trade_manager",
    "trades", "risk_control", "mt5_monitor", "journal_monitor", "strategy_monitor", "competition_manager", "rewards_manager", "alerts",
    "agent_command",
  ],

  finance_executive: [
    "dashboard",
    "marketplace_manager",
    "auto_trade_manager",
    "payments", "payout_approvals", "transaction_ledger", "audit_logs",
    "subscription_manager", "referrals_manager",
    "agent_command",
  ],

  community_manager: [
    "dashboard",
    "marketplace_manager",
    "channel_manager", "content_moderation", "notifications_broadcaster", "learning_manager",
    "agent_command",
  ],

  mentor_manager: [
    "dashboard",
    "mentor_manager",
    "agent_command",
  ],

  employee: [

    "my_profile",
    "agent_command",
  ],
};

export function canAccessPage(role: AdminRole, pageId: PageId): boolean {
  return PAGE_ACCESS[role]?.includes(pageId) ?? false;
}

export function getNavForRole(role: AdminRole): NavItem[] {
  const accessible = PAGE_ACCESS[role] || [];
  return ALL_NAV_ITEMS.filter((item) => accessible.includes(item.id));
}

export function getGroupedNavForRole(role: AdminRole): Record<string, NavItem[]> {
  const items = getNavForRole(role);
  const grouped: Record<string, NavItem[]> = {};
  for (const item of items) {
    const dept = item.department || "General";
    if (!grouped[dept]) grouped[dept] = [];
    grouped[dept].push(item);
  }
  return grouped;
}

export function getDefaultPathForRole(role: AdminRole): string {
  if (role === "employee") return "/my-dashboard";
  if (role === "hr_manager") return "/hr";
  const nav = getNavForRole(role);
  return nav.length > 0 ? nav[0].path : "/";
}

export function canPerformAction(role: AdminRole, actionId: string): boolean {
  if (role === "ceo") return true;
  if (role === "risk_analyst" && ["freeze_trading", "kill_switch"].includes(actionId)) return true;
  if (role === "support_executive" && ["resolve_ticket"].includes(actionId)) return true;
  if (role === "operations_executive" && ["approve_payout", "reject_payout", "change_subscription"].includes(actionId)) return true;
  if (role === "hr_manager" && ["hire_employee", "reject_candidate", "mark_attendance"].includes(actionId)) return true;
  return false;
}

export function mapEmployeeToRole(roleLevel: string, department: string): AdminRole {
  const level = roleLevel?.toLowerCase();
  const dept = department?.toLowerCase();

  if (level === "ceo") return "ceo";
  if (level === "cto" || (dept === "technology" && level === "head")) return "technical_lead";

  if (level === "head") {
    if (dept === "risk & trading" || dept === "risk") return "risk_executive";
    if (dept === "operations" || dept === "ops") return "operations_executive";
    if (dept === "support") return "support_executive";
    if (dept === "sales") return "sales_executive";
    if (dept === "hr") return "hr_manager";
  }

  return "employee";
}
