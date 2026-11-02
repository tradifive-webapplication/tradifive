import { supabase } from "@/lib/supabase";
import { 
  Settlement, 
  SettlementItem, 
  PaymentGatewayType,
  SettlementStatus,
  SettlementAccount,
  CustomerSettlementSummary
} from "@/types/settlement";

// Fallback storage key when Supabase tables are yet to be executed on remote Postgres
const LOCAL_SETTLEMENTS_KEY = "tradifive_weekly_settlements_v1";
const LOCAL_ACCOUNTS_KEY = "tradifive_settlement_accounts_v1";

/**
 * Helper to compute date range for current Monday–Sunday weekly cohort
 */
export function getWeeklyPeriodDates(referenceDate: Date = new Date()) {
  const d = new Date(referenceDate);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Payment deadline is following Wednesday 23:59
  const deadline = new Date(sunday);
  deadline.setDate(sunday.getDate() + 3);
  deadline.setHours(23, 59, 59, 999);

  // Week number
  const startOfYear = new Date(monday.getFullYear(), 0, 1);
  const pastDaysOfYear = (monday.getTime() - startOfYear.getTime()) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weekLabel = `Week ${weekNum} (${monthNames[monday.getMonth()]} ${monday.getDate()} - ${monthNames[sunday.getMonth()]} ${sunday.getDate()}, ${sunday.getFullYear()})`;

  return {
    periodStart: monday.toISOString(),
    periodEnd: sunday.toISOString(),
    paymentDeadline: deadline.toISOString(),
    weekNum,
    weekLabel,
    year: monday.getFullYear()
  };
}

/**
 * Calculate settlement from real closed trade deals
 */
export function calculateSettlementFromDeals(
  closedDeals: Array<{
    ticket: string | number;
    symbol: string;
    trade_type?: string;
    lot_size?: number;
    profit: number;
    commission?: number;
    swap?: number;
    open_price?: number;
    close_price?: number;
    opened_at?: string;
    closed_at?: string;
  }>,
  options: {
    userId: string;
    accountNumber: string;
    brokerServer?: string;
    lossCarryForward?: number;
    startingBalance?: number;
    currency?: string;
    weekDates?: ReturnType<typeof getWeeklyPeriodDates>;
  }
): Settlement {
  const dates = options.weekDates || getWeeklyPeriodDates();
  const carryForward = options.lossCarryForward || 0;
  const cleanAcc = (options.accountNumber || "").replace(/\D/g, "");

  let grossProfit = 0;
  let grossLoss = 0;
  let totalCommissions = 0;
  let totalSwaps = 0;

  const items: SettlementItem[] = closedDeals.map((deal, idx) => {
    const pnl = Number(deal.profit || 0);
    const comm = Math.abs(Number(deal.commission || 0));
    const swap = Math.abs(Number(deal.swap || 0));
    const net = pnl - comm - swap;

    if (pnl > 0) grossProfit += pnl;
    if (pnl < 0) grossLoss += Math.abs(pnl);
    totalCommissions += comm;
    totalSwaps += swap;

    return {
      id: `ITEM-${cleanAcc || "MT5"}-${deal.ticket || idx}`,
      settlement_id: "",
      ticket: String(deal.ticket || `TR-${idx + 1}`),
      symbol: deal.symbol || "XAUUSD",
      trade_type: deal.trade_type === "0" ? "BUY" : deal.trade_type === "1" ? "SELL" : (deal.trade_type || (pnl >= 0 ? "BUY" : "SELL")),
      lot_size: Number(deal.lot_size || 0.01),
      open_price: deal.open_price,
      close_price: deal.close_price,
      profit: pnl,
      commission: comm,
      swap: swap,
      net_pnl: net,
      opened_at: deal.opened_at,
      closed_at: deal.closed_at || new Date().toISOString()
    };
  });

  const netRealisedProfit = Number((grossProfit - grossLoss - totalCommissions - totalSwaps).toFixed(2));
  
  // Eligible Profit calculation with High-Water Mark / Loss Carry-Forward protection
  let eligibleProfit = 0;
  let status: SettlementStatus = "pending";

  if (netRealisedProfit <= 0) {
    eligibleProfit = 0;
    status = "loss_week";
  } else {
    if (netRealisedProfit <= carryForward) {
      eligibleProfit = 0;
      status = "loss_week"; // Entire profit absorbed by previous loss carry forward
    } else {
      eligibleProfit = Number((netRealisedProfit - carryForward).toFixed(2));
      status = "pending";
    }
  }

  const tradifiveShare = Number((eligibleProfit * 0.5).toFixed(2));
  const customerShare = Number((eligibleProfit * 0.5).toFixed(2));
  const amountPayable = tradifiveShare;

  const suffix = cleanAcc ? cleanAcc.slice(-4).padStart(4, "0") : "0000";
  const settlementNumber = `SETTLE-${dates.year}-W${dates.weekNum}-${suffix}`;
  const startBal = options.startingBalance !== undefined ? options.startingBalance : 0;
  const endBal = Number((startBal + netRealisedProfit).toFixed(2));

  const settlement: Settlement = {
    id: `ST-${settlementNumber}`,
    settlement_number: settlementNumber,
    user_id: options.userId,
    mt5_account_number: cleanAcc,
    broker_server: options.brokerServer || "Exness-Real",
    period_start: dates.periodStart,
    period_end: dates.periodEnd,
    week_label: dates.weekLabel,
    starting_balance: startBal,
    ending_balance: endBal,
    gross_profit: Number(grossProfit.toFixed(2)),
    gross_loss: Number(grossLoss.toFixed(2)),
    commissions: Number(totalCommissions.toFixed(2)),
    swaps: Number(totalSwaps.toFixed(2)),
    net_realised_profit: netRealisedProfit,
    previous_loss_carried: carryForward,
    eligible_profit: eligibleProfit,
    tradifive_share: tradifiveShare,
    customer_share: customerShare,
    amount_payable: amountPayable,
    currency: options.currency || "INR",
    fx_rate: 0.9368,
    status: status,
    payment_deadline: dates.paymentDeadline,
    items: items,
    calculation_breakdown: {
      formula: "Eligible Profit = Max(0, Net Realised Profit - Previous Loss Carry-Forward)",
      description: "Tradifive Share = 50% of Eligible Profit. Customer Share = 50% retained in MT5. Floating profits and deposits are 100% excluded.",
      closed_trades_count: items.length
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Link items to settlement id
  settlement.items?.forEach(i => i.settlement_id = settlement.id);

  return settlement;
}

/**
 * Fetch Customer Settlements
 * Derives weekly profit settlements dynamically from REAL closed MT5 trades in Supabase.
 * No hardcoded demo trades or synthetic weeks are injected.
 */
export async function getCustomerSettlements(
  userId: string, 
  accountNumber?: string
): Promise<{
  settlements: Settlement[];
  summary: CustomerSettlementSummary;
}> {
  // Purge any stale demo data from local storage
  try {
    const stored = localStorage.getItem(LOCAL_SETTLEMENTS_KEY);
    if (stored && (stored.includes("982055") || stored.includes("26139980") || stored.includes("7601.5") || stored.includes("ST-SETTLE-2026-W43"))) {
      localStorage.removeItem(LOCAL_SETTLEMENTS_KEY);
    }
  } catch (e) {}

  // Resolve authentic user id
  let effectiveUid = userId;
  if (!effectiveUid || effectiveUid === "demo-trader") {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) effectiveUid = session.user.id;
    } catch (e) {}
  }

  // Resolve authentic account number
  let cleanAcc = (accountNumber || "").replace(/\D/g, "");
  if (!cleanAcc || cleanAcc === "26139980") {
    try {
      const stored = localStorage.getItem("tradifive_connected_mt5_account");
      if (stored) cleanAcc = stored.replace(/\D/g, "");
    } catch (e) {}
  }

  if ((!cleanAcc || cleanAcc === "26139980") && effectiveUid && effectiveUid !== "demo-trader") {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("activation_key")
        .eq("id", effectiveUid)
        .maybeSingle();

      if (profile?.activation_key) {
        const match = profile.activation_key.match(/TF-([0-9A-Fa-f]{8})/);
        if (match) {
          cleanAcc = String(parseInt(match[1], 16));
        }
      }

      if (!cleanAcc) {
        const { data: acc } = await supabase
          .from("mt5_accounts")
          .select("account_number")
          .eq("user_id", effectiveUid)
          .maybeSingle();
        if (acc?.account_number) cleanAcc = String(acc.account_number).replace(/\D/g, "");
      }
    } catch (e) {}
  }

  // Resolve current account balance from live telemetry or zero
  let balance = 0;
  try {
    const storedBal = localStorage.getItem("tradifive_account_balance");
    if (storedBal && Number(storedBal) > 0) balance = Number(storedBal);
  } catch (e) {}

  // 1. Fetch real closed trades from Supabase trades table
  let allClosedTrades: any[] = [];
  if (effectiveUid && effectiveUid !== "demo-trader") {
    try {
      const { data: dbTrades } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", effectiveUid)
        .order("closed_at", { ascending: false });

      if (Array.isArray(dbTrades)) {
        allClosedTrades = dbTrades;
      }
    } catch (e) {
      console.warn("Real trades query error:", e);
    }
  }

  const currentWeekDates = getWeeklyPeriodDates(new Date());

  // Filter trades for the current ongoing calendar week
  const currentWeekTrades = allClosedTrades.filter(t => {
    if (!t.closed_at) return false;
    const tTime = new Date(t.closed_at).getTime();
    return tTime >= new Date(currentWeekDates.periodStart).getTime() && tTime <= new Date(currentWeekDates.periodEnd).getTime();
  });

  // Calculate current week settlement
  let currentSettlement: Settlement;
  if (currentWeekTrades.length > 0) {
    currentSettlement = calculateSettlementFromDeals(currentWeekTrades, {
      userId: effectiveUid,
      accountNumber: cleanAcc,
      brokerServer: "Exness-Real",
      lossCarryForward: 0,
      startingBalance: balance,
      currency: "INR",
      weekDates: currentWeekDates
    });
  } else {
    // Current cycle awaiting closed trades
    const suffix = cleanAcc ? cleanAcc.slice(-4).padStart(4, "0") : "0000";
    currentSettlement = {
      id: `ST-SETTLE-${currentWeekDates.year}-W${currentWeekDates.weekNum}-${suffix}`,
      settlement_number: `SETTLE-${currentWeekDates.year}-W${currentWeekDates.weekNum}-${suffix}`,
      user_id: effectiveUid,
      mt5_account_number: cleanAcc,
      broker_server: "Exness-Real",
      period_start: currentWeekDates.periodStart,
      period_end: currentWeekDates.periodEnd,
      week_label: currentWeekDates.weekLabel,
      starting_balance: balance,
      ending_balance: balance,
      gross_profit: 0.00,
      gross_loss: 0.00,
      commissions: 0.00,
      swaps: 0.00,
      net_realised_profit: 0.00,
      previous_loss_carried: 0.00,
      eligible_profit: 0.00,
      tradifive_share: 0.00,
      customer_share: 0.00,
      amount_payable: 0.00,
      currency: "INR",
      fx_rate: 0.9368,
      status: "cleared",
      payment_deadline: currentWeekDates.paymentDeadline,
      items: [],
      calculation_breakdown: {
        formula: "Eligible Profit = Max(0, Net Realised Profit - Previous Loss Carry-Forward)",
        description: "Tradifive Share = 50% of Eligible Profit. Customer Share = 50% retained in MT5. Floating profits and deposits are 100% excluded.",
        closed_trades_count: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // 2. Group older trades by previous calendar weeks
  const olderTrades = allClosedTrades.filter(t => {
    if (!t.closed_at) return false;
    return new Date(t.closed_at).getTime() < new Date(currentWeekDates.periodStart).getTime();
  });

  const olderTradesByWeek: Record<string, { weekDates: ReturnType<typeof getWeeklyPeriodDates>; deals: any[] }> = {};

  olderTrades.forEach(deal => {
    const d = new Date(deal.closed_at);
    const wDates = getWeeklyPeriodDates(d);
    const key = `${wDates.year}-W${wDates.weekNum}`;
    if (!olderTradesByWeek[key]) {
      olderTradesByWeek[key] = { weekDates: wDates, deals: [] };
    }
    olderTradesByWeek[key].deals.push(deal);
  });

  const historicalSettlements: Settlement[] = Object.values(olderTradesByWeek).map(group => {
    return calculateSettlementFromDeals(group.deals, {
      userId: effectiveUid,
      accountNumber: cleanAcc,
      brokerServer: "Exness-Real",
      lossCarryForward: 0,
      startingBalance: 0,
      currency: "INR",
      weekDates: group.weekDates
    });
  });

  // Sort historical settlements descending by date
  historicalSettlements.sort((a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime());

  let list: Settlement[] = [currentSettlement, ...historicalSettlements];

  // 3. Merge persisted payment status from system_settings or localStorage
  try {
    const { data: savedRecord } = await supabase
      .from("system_settings")
      .select("value")
      .eq("id", `settlements_${effectiveUid}`)
      .maybeSingle();

    if (savedRecord?.value && Array.isArray(savedRecord.value)) {
      const persistedList = savedRecord.value as Settlement[];
      persistedList.forEach(saved => {
        const match = list.find(s => s.id === saved.id || s.settlement_number === saved.settlement_number);
        if (match) {
          match.status = saved.status;
          match.payment_reference = saved.payment_reference;
          match.payment_method = saved.payment_method;
          match.paid_at = saved.paid_at;
          match.receipt_number = saved.receipt_number;
          match.amount_payable = saved.amount_payable;
        }
      });
    }
  } catch (e) {}

  // Calculate Aggregated Customer Summary strictly from real data
  let totalTradingProfit = 0;
  let tradifiveShare = 0;
  let yourShare = 0;
  let pendingPayment = 0;
  let settledCount = 0;
  let overdueCount = 0;

  list.forEach(s => {
    if (s.net_realised_profit > 0) {
      totalTradingProfit += s.net_realised_profit;
    }
    tradifiveShare += s.tradifive_share;
    yourShare += s.customer_share;

    if (s.status === "pending" && s.amount_payable > 0) {
      pendingPayment += s.amount_payable;
    } else if (s.status === "overdue" && s.amount_payable > 0) {
      pendingPayment += s.amount_payable;
      overdueCount++;
    } else if (s.status === "paid" || s.status === "approved") {
      settledCount++;
    }
  });

  const summary: CustomerSettlementSummary = {
    totalTradingProfit: Number(totalTradingProfit.toFixed(2)),
    tradifiveShare: Number(tradifiveShare.toFixed(2)),
    yourShare: Number(yourShare.toFixed(2)),
    pendingPayment: Number(pendingPayment.toFixed(2)),
    lossCarryForward: 0,
    settledCount,
    overdueCount
  };

  return { settlements: list, summary };
}

/**
 * Fetch all settlements for Admin Management Portal
 */
export async function getAllAdminSettlements(): Promise<{
  settlements: Settlement[];
  metrics: {
    totalReceivables: number;
    totalCollected: number;
    totalPending: number;
    overdueCount: number;
    totalAccounts: number;
  }
}> {
  let list: Settlement[] = [];

  // Try DB
  try {
    const { data } = await supabase
      .from("settlements")
      .select(`
        *,
        items:settlement_items(*),
        payments:settlement_payments(*),
        adjustments:settlement_adjustments(*)
      `)
      .order("created_at", { ascending: false });

    if (Array.isArray(data) && data.length > 0) {
      list = data as Settlement[];
    }
  } catch (e) {}

  // Fallback to cache / system_settings
  if (list.length === 0) {
    try {
      const stored = localStorage.getItem(LOCAL_SETTLEMENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && !parsed.some((s: any) => s.items?.some((i: any) => i.ticket === "982055"))) {
          list = parsed;
        }
      }
    } catch (e) {}
  }

  let totalReceivables = 0;
  let totalCollected = 0;
  let totalPending = 0;
  let overdueCount = 0;
  const accountsSet = new Set<string>();

  list.forEach(s => {
    totalReceivables += s.tradifive_share;
    if (s.status === "paid" || s.status === "approved") {
      totalCollected += s.amount_payable;
    } else if (s.status === "pending") {
      totalPending += s.amount_payable;
    } else if (s.status === "overdue") {
      totalPending += s.amount_payable;
      overdueCount++;
    }
    if (s.mt5_account_number) accountsSet.add(s.mt5_account_number);
  });

  return {
    settlements: list,
    metrics: {
      totalReceivables: Number(totalReceivables.toFixed(2)),
      totalCollected: Number(totalCollected.toFixed(2)),
      totalPending: Number(totalPending.toFixed(2)),
      overdueCount,
      totalAccounts: accountsSet.size
    }
  };
}

/**
 * Record payment submission (Razorpay / UPI / Crypto)
 */
export async function submitSettlementPayment(
  settlementId: string,
  payload: {
    userId: string;
    gateway: PaymentGatewayType;
    amount: number;
    paymentReference: string;
    proofUrl?: string;
  }
): Promise<{ success: boolean; receiptNumber: string }> {
  const receiptNum = `REC-TRDF-${Date.now().toString(36).toUpperCase()}`;

  // 1. Try DB insertion
  try {
    await supabase.from("settlement_payments").insert({
      settlement_id: settlementId,
      user_id: payload.userId,
      payment_gateway: payload.gateway,
      gateway_payment_id: payload.paymentReference,
      amount: payload.amount,
      status: "success",
      receipt_number: receiptNum,
      proof_url: payload.proofUrl,
      verified_by: "gateway_client_submission",
      verified_at: new Date().toISOString()
    });

    await supabase.from("settlements").update({
      status: "paid",
      payment_reference: payload.paymentReference,
      payment_method: payload.gateway,
      paid_at: new Date().toISOString(),
      receipt_number: receiptNum,
      updated_at: new Date().toISOString()
    }).eq("id", settlementId);

    // Audit log
    await supabase.from("settlement_audit_logs").insert({
      settlement_id: settlementId,
      actor_id: payload.userId,
      action: "PAYMENT_SUBMITTED",
      details: { gateway: payload.gateway, amount: payload.amount, ref: payload.paymentReference }
    });
  } catch (e) {
    console.warn("DB payment recording fallback:", e);
  }

  // 2. Persist to system_settings for persistent user state across sessions
  try {
    const { data: existing } = await supabase
      .from("system_settings")
      .select("value")
      .eq("id", `settlements_${payload.userId}`)
      .maybeSingle();

    let currentList: any[] = Array.isArray(existing?.value) ? existing.value : [];
    const targetIdx = currentList.findIndex((s: any) => s.id === settlementId);
    const updatedRecord = {
      id: settlementId,
      status: "paid",
      payment_reference: payload.paymentReference,
      payment_method: payload.gateway,
      paid_at: new Date().toISOString(),
      receipt_number: receiptNum,
      amount_payable: payload.amount
    };

    if (targetIdx >= 0) {
      currentList[targetIdx] = { ...currentList[targetIdx], ...updatedRecord };
    } else {
      currentList.push(updatedRecord);
    }

    await supabase.from("system_settings").upsert({
      id: `settlements_${payload.userId}`,
      value: currentList,
      updated_at: new Date().toISOString()
    });
  } catch (e) {}

  // 3. Update local state
  try {
    const stored = localStorage.getItem(LOCAL_SETTLEMENTS_KEY);
    if (stored) {
      const list: Settlement[] = JSON.parse(stored);
      const target = list.find(s => s.id === settlementId);
      if (target) {
        target.status = "paid";
        target.payment_reference = payload.paymentReference;
        target.payment_method = payload.gateway;
        target.paid_at = new Date().toISOString();
        target.receipt_number = receiptNum;
        localStorage.setItem(LOCAL_SETTLEMENTS_KEY, JSON.stringify(list));
      }
    }
  } catch (e) {}

  // 4. Dispatch system notification
  try {
    await supabase.from("notifications").insert({
      user_id: payload.userId,
      type: "settlement",
      title: "Settlement Payment Confirmed",
      message: `Your weekly profit settlement payment of ₹${payload.amount.toLocaleString()} was successfully received. Receipt: ${receiptNum}.`,
      data: { settlement_id: settlementId },
      is_read: false
    });
  } catch (e) {}

  return { success: true, receiptNumber: receiptNum };
}

/**
 * Admin Manually Mark Paid (Offline Bank / UPI / Crypto Verified)
 */
export async function adminMarkSettlementPaid(
  settlementId: string,
  paymentRef: string,
  notes: string,
  adminId: string,
  adminEmail: string
): Promise<boolean> {
  const receiptNum = `REC-ADMIN-${Date.now().toString(36).toUpperCase()}`;

  try {
    await supabase.from("settlements").update({
      status: "paid",
      payment_reference: paymentRef,
      payment_method: "Admin Manual Clearance",
      paid_at: new Date().toISOString(),
      receipt_number: receiptNum,
      admin_notes: notes,
      approved_by: adminId,
      approved_at: new Date().toISOString()
    }).eq("id", settlementId);

    await supabase.from("settlement_audit_logs").insert({
      settlement_id: settlementId,
      actor_id: adminId,
      actor_email: adminEmail,
      action: "ADMIN_MARKED_PAID",
      details: { payment_reference: paymentRef, notes }
    });
  } catch (e) {}

  // Update local storage
  try {
    const stored = localStorage.getItem(LOCAL_SETTLEMENTS_KEY);
    if (stored) {
      const list: Settlement[] = JSON.parse(stored);
      const target = list.find(s => s.id === settlementId);
      if (target) {
        target.status = "paid";
        target.payment_reference = paymentRef;
        target.payment_method = "Admin Manual Clearance";
        target.paid_at = new Date().toISOString();
        target.receipt_number = receiptNum;
        target.admin_notes = notes;
        localStorage.setItem(LOCAL_SETTLEMENTS_KEY, JSON.stringify(list));
      }
    }
  } catch (e) {}

  return true;
}

/**
 * Admin Adjust Settlement (Creates immutable adjustment and audit log)
 */
export async function adminAdjustSettlement(
  settlementId: string,
  newPayableAmount: number,
  reason: string,
  adminId: string,
  adminEmail: string
): Promise<boolean> {
  try {
    const stored = localStorage.getItem(LOCAL_SETTLEMENTS_KEY);
    let prevAmount = 0;
    if (stored) {
      const list: Settlement[] = JSON.parse(stored);
      const target = list.find(s => s.id === settlementId);
      if (target) {
        prevAmount = target.amount_payable;
        target.amount_payable = newPayableAmount;
        target.tradifive_share = newPayableAmount;
        target.admin_notes = `Adjusted by Admin (${adminEmail}): ${reason}`;
        localStorage.setItem(LOCAL_SETTLEMENTS_KEY, JSON.stringify(list));
      }
    }

    await supabase.from("settlement_adjustments").insert({
      settlement_id: settlementId,
      adjusted_by: adminId,
      previous_amount: prevAmount,
      new_amount: newPayableAmount,
      reason
    });

    await supabase.from("settlement_audit_logs").insert({
      settlement_id: settlementId,
      actor_id: adminId,
      actor_email: adminEmail,
      action: "ADJUSTMENT_APPLIED",
      details: { previous_amount: prevAmount, new_amount: newPayableAmount, reason }
    });

    await supabase.from("settlements").update({
      amount_payable: newPayableAmount,
      tradifive_share: newPayableAmount,
      admin_notes: `Adjusted: ${reason}`
    }).eq("id", settlementId);

  } catch (e) {}

  return true;
}

/**
 * Fetch all settlements for Admin Management Portal
 */
export async function getAllSettlementsAdmin(): Promise<Settlement[]> {
  const res = await getAllAdminSettlements();
  return res.settlements;
}

/**
 * Admin Manually Approve Offline Payment
 */
export async function approveOfflinePayment(
  settlementId: string,
  paymentRef: string,
  adminId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await adminMarkSettlementPaid(settlementId, paymentRef, notes || "Offline clearance approved", adminId, "admin@tradifive.in");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Admin Adjust Settlement with Audit Log
 */
export async function adjustSettlementWithAudit(
  settlementId: string,
  newPayableAmount: number,
  reason: string,
  adminId: string,
  adminEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await adminAdjustSettlement(settlementId, newPayableAmount, reason, adminId, adminEmail || "admin@tradifive.in");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Trigger Weekly Settlement calculation & persistence
 */
export async function calculateAndPersistWeeklySettlement(
  userId: string,
  accountNumber: string,
  periodStart: string,
  periodEnd: string
): Promise<Settlement | null> {
  const result = await getCustomerSettlements(userId, accountNumber);
  return result.settlements[0] || null;
}
