// Tradifive Weekly Profit Settlement Type Definitions

export type SettlementStatus =
  | "pending"
  | "paid"
  | "overdue"
  | "loss_week"
  | "approved"
  | "rejected"
  | "processing";

export type PaymentGatewayType =
  | "razorpay"
  | "upi_qr"
  | "crypto_usdt"
  | "bank_transfer"
  | "admin_manual";

export interface SettlementItem {
  id: string;
  settlement_id: string;
  ticket: string;
  symbol: string;
  trade_type: "BUY" | "SELL" | string;
  lot_size: number;
  open_price?: number;
  close_price?: number;
  profit: number;
  commission: number;
  swap: number;
  net_pnl: number;
  opened_at?: string;
  closed_at: string;
}

export interface SettlementPayment {
  id: string;
  settlement_id: string;
  user_id: string;
  payment_gateway: PaymentGatewayType;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  gateway_signature?: string;
  amount: number;
  currency: string;
  status: "initiated" | "success" | "failed" | "refunded";
  verified_at?: string;
  verified_by?: string;
  receipt_number?: string;
  proof_url?: string;
  created_at: string;
}

export interface SettlementAdjustment {
  id: string;
  settlement_id: string;
  adjusted_by: string;
  adjusted_by_email?: string;
  previous_amount: number;
  new_amount: number;
  reason: string;
  created_at: string;
}

export interface SettlementAuditLog {
  id: string;
  settlement_id: string;
  actor_id?: string;
  actor_email?: string;
  action: "CALCULATED" | "PAYMENT_SUBMITTED" | "PAYMENT_VERIFIED" | "ADJUSTED" | "APPROVED" | "REJECTED" | string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface Settlement {
  id: string;
  settlement_number: string; // e.g. SETTLE-2026-W44-9980
  user_id: string;
  user_email?: string;
  user_name?: string;
  mt5_account_id?: string;
  mt5_account_number: string;
  broker_server?: string;
  period_start: string; // ISO String
  period_end: string;   // ISO String
  week_label: string;   // e.g. "Week 44 (Oct 26 - Nov 01, 2026)"
  starting_balance: number;
  ending_balance: number;
  gross_profit: number;
  gross_loss: number;
  commissions: number;
  swaps: number;
  net_realised_profit: number;
  previous_loss_carried: number; // Carry forward from previous negative weeks
  eligible_profit: number;       // max(0, net_realised_profit - previous_loss_carried)
  tradifive_share: number;       // 50%
  customer_share: number;        // 50%
  amount_payable: number;        // = tradifive_share
  currency: string;              // 'INR' | 'USC' | 'USD'
  fx_rate?: number;              // 0.9368 for USC -> INR
  status: SettlementStatus;
  payment_deadline: string;
  payment_reference?: string;
  payment_method?: string;
  paid_at?: string;
  receipt_number?: string;
  receipt_url?: string;
  admin_notes?: string;
  approved_by?: string;
  approved_at?: string;
  items?: SettlementItem[];
  payments?: SettlementPayment[];
  adjustments?: SettlementAdjustment[];
  calculation_breakdown?: {
    formula: string;
    description: string;
    closed_trades_count: number;
  };
  created_at: string;
  updated_at: string;
}

export interface SettlementAccount {
  id: string;
  user_id: string;
  mt5_account_number: string;
  broker_server: string;
  currency: string;
  settlement_cohort_day: string; // e.g. Wednesday
  loss_carry_forward: number;
  lifetime_realised_profit: number;
  lifetime_platform_share_paid: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerSettlementSummary {
  totalTradingProfit: number;
  tradifiveShare: number;
  yourShare: number;
  pendingPayment: number;
  lossCarryForward: number;
  settledCount: number;
  overdueCount: number;
}
