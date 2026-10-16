import { supabase } from "./supabase";
import { createNotification } from "./notifications";

// ─── TOOL DEFINITIONS for Kimi function calling ───────────────────────────────
export const AGENT_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_all_users",
      description: "Get a list of all registered users on the platform. Returns profiles with name, email, subscription, frozen status.",
      parameters: { type: "object", properties: { limit: { type: "number", description: "Max users to return (default 20)" } }, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "search_user",
      description: "Search for a specific user by name or email address.",
      parameters: { type: "object", properties: { query: { type: "string", description: "Name or email to search" } }, required: ["query"] }
    }
  },
  {
    type: "function",
    function: {
      name: "get_user_details",
      description: "Get full details of a specific user including their trades, balance, subscription status, and activity.",
      parameters: { type: "object", properties: { user_id: { type: "string", description: "The user's UUID" } }, required: ["user_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "freeze_user",
      description: "Freeze (suspend) a user account, blocking all platform access. User receives a notification.",
      parameters: { type: "object", properties: { user_id: { type: "string" }, reason: { type: "string", description: "Reason for freezing" } }, required: ["user_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "unfreeze_user",
      description: "Restore (unfreeze) a previously frozen user account.",
      parameters: { type: "object", properties: { user_id: { type: "string" } }, required: ["user_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_user",
      description: "Soft-delete a user account (marks profile as deleted, freezes account). Permanent action.",
      parameters: { type: "object", properties: { user_id: { type: "string" }, reason: { type: "string" } }, required: ["user_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "send_notification_to_user",
      description: "Send a custom notification/message directly to a specific user on their web and mobile app.",
      parameters: {
        type: "object",
        properties: {
          user_id: { type: "string" },
          title: { type: "string", description: "Notification title" },
          message: { type: "string", description: "Full notification message" },
          type: { type: "string", enum: ["SECURITY", "SYSTEM", "BILLING", "SUPPORT", "TRADE", "ACCOUNT"], description: "Notification category" },
          priority: { type: "string", enum: ["low", "normal", "high"] }
        },
        required: ["user_id", "title", "message"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "send_broadcast",
      description: "Send a notification/announcement to ALL users on the platform simultaneously.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          message: { type: "string" },
          type: { type: "string", enum: ["SECURITY", "SYSTEM", "BILLING", "SUPPORT", "TRADE", "ACCOUNT"] }
        },
        required: ["title", "message"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "change_user_subscription",
      description: "Change a user's subscription plan (trial, pro, elite, expired).",
      parameters: {
        type: "object",
        properties: {
          user_id: { type: "string" },
          plan: { type: "string", enum: ["trial", "pro", "elite", "expired"] }
        },
        required: ["user_id", "plan"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_support_tickets",
      description: "Get all support tickets, optionally filtered by status.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["all", "open", "in_progress", "resolved"], description: "Filter by ticket status" }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "resolve_ticket",
      description: "Mark a support ticket as resolved.",
      parameters: { type: "object", properties: { ticket_id: { type: "string" } }, required: ["ticket_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "reply_to_ticket",
      description: "Send an admin reply to a support ticket.",
      parameters: {
        type: "object",
        properties: {
          ticket_id: { type: "string" },
          user_id: { type: "string" },
          message: { type: "string", description: "Reply message to send to user" }
        },
        required: ["ticket_id", "user_id", "message"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_financial_summary",
      description: "Get platform financial summary: total users, subscriptions, payout requests, transaction volume.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "get_pending_payouts",
      description: "Get all pending payout/withdrawal requests that need approval.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "approve_payout",
      description: "Approve a pending payout request.",
      parameters: { type: "object", properties: { payout_id: { type: "string" }, user_id: { type: "string" } }, required: ["payout_id", "user_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "reject_payout",
      description: "Reject a pending payout request with a reason.",
      parameters: { type: "object", properties: { payout_id: { type: "string" }, user_id: { type: "string" }, reason: { type: "string" } }, required: ["payout_id", "user_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "get_trading_summary",
      description: "Get trading statistics: total trades, winning trades, top traders by profit.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "freeze_trading",
      description: "Halt/freeze a user's MT5 algo trading (disable their bot).",
      parameters: { type: "object", properties: { user_id: { type: "string" } }, required: ["user_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "get_system_health",
      description: "Check platform system health, active connections, database ping, and service status.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "set_maintenance_mode",
      description: "Enable or disable platform maintenance mode. Broadcasts notification to all users.",
      parameters: { type: "object", properties: { enabled: { type: "boolean" } }, required: ["enabled"] }
    }
  },
  {
    type: "function",
    function: {
      name: "reset_user_xp",
      description: "Reset a user's XP, streak, and discipline level to zero.",
      parameters: { type: "object", properties: { user_id: { type: "string" } }, required: ["user_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "verify_user",
      description: "Grant verified status to a user account.",
      parameters: { type: "object", properties: { user_id: { type: "string" } }, required: ["user_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "get_audit_logs",
      description: "Get recent admin audit logs of all actions taken on the platform.",
      parameters: { type: "object", properties: { limit: { type: "number" } }, required: [] }
    }
  }
];

// ─── TOOL EXECUTOR ─────────────────────────────────────────────────────────────
export async function executeTool(name: string, args: any): Promise<string> {
  try {
    switch (name) {

      case "get_all_users": {
        const { data } = await supabase.from("profiles")
          .select("id, full_name, email, subscription_status, is_banned, is_verified, created_at")
          .order("created_at", { ascending: false })
          .limit(args.limit || 20);
        if (!data || data.length === 0) return "No users found.";
        return `Found ${data.length} users:\n` + data.map((u: any) =>
          `• ${u.full_name || "Unknown"} (${u.email}) — Plan: ${u.subscription_status || "free"} | Frozen: ${u.is_banned ? "YES" : "no"} | ID: ${u.id}`
        ).join("\n");
      }

      case "search_user": {
        const q = args.query?.toLowerCase();
        const { data } = await supabase.from("profiles").select("id, full_name, email, subscription_status, is_banned");
        const matches = (data || []).filter((u: any) =>
          u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
        );
        if (matches.length === 0) return `No user found matching "${args.query}"`;
        return `Found ${matches.length} match(es):\n` + matches.map((u: any) =>
          `• ${u.full_name} (${u.email}) | Plan: ${u.subscription_status || "free"} | Frozen: ${u.is_banned ? "YES" : "no"} | ID: ${u.id}`
        ).join("\n");
      }

      case "get_user_details": {
        const [profileRes, accountRes, tradesRes, ticketsRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", args.user_id).single(),
          supabase.from("mt5_accounts").select("*").eq("user_id", args.user_id).maybeSingle(),
          supabase.from("trades").select("profit").eq("user_id", args.user_id),
          supabase.from("support_tickets").select("status").eq("user_id", args.user_id)
        ]);
        const p = profileRes.data;
        const a = accountRes.data;
        const trades = tradesRes.data || [];
        const tickets = ticketsRes.data || [];
        if (!p) return "User not found.";
        const netPnl = trades.reduce((s: number, t: any) => s + (t.profit || 0), 0);
        return `User: ${p.full_name} (${p.email})
ID: ${p.id}
Plan: ${p.subscription_status || "free"} | Verified: ${p.is_verified ? "YES" : "no"} | Frozen: ${p.is_banned ? "YES 🔴" : "no"}
XP: ${p.xp || 0} | Streak: ${p.streak_days || 0} days | Level: ${p.discipline_level || 1}
Phone: ${p.phone || "not set"} | Location: ${p.city || ""} ${p.country || ""}
MT5 Account: ${a ? `Balance $${a.balance || 0} | Equity $${a.equity || 0} | Algo: ${a.algo_status ? "RUNNING" : "HALTED"}` : "Not linked"}
Trades: ${trades.length} total | Net P&L: $${netPnl.toFixed(2)}
Support Tickets: ${tickets.length} (${tickets.filter((t: any) => t.status === "open").length} open)
Joined: ${new Date(p.created_at).toLocaleDateString()}`;
      }

      case "freeze_user": {
        const { error } = await supabase.from("profiles").update({ is_banned: true }).eq("id", args.user_id);
        if (error) return `❌ Failed to freeze user: ${error.message}`;
        await createNotification({
          userId: args.user_id, type: "SECURITY",
          title: "Account Access Suspended",
          message: args.reason ? `Your account has been suspended. Reason: ${args.reason}` : "Your account has been temporarily suspended pending a compliance review. Contact support.",
          priority: "high"
        });
        return `✅ User ${args.user_id} has been frozen. Notification sent to their app.`;
      }

      case "unfreeze_user": {
        const { error } = await supabase.from("profiles").update({ is_banned: false }).eq("id", args.user_id);
        if (error) return `❌ Failed to unfreeze: ${error.message}`;
        await createNotification({
          userId: args.user_id, type: "SECURITY",
          title: "Account Access Restored",
          message: "Your account access has been fully restored by the compliance team. Welcome back.",
          priority: "high"
        });
        return `✅ User ${args.user_id} account has been restored.`;
      }

      case "delete_user": {
        const { error } = await supabase.from("profiles").update({
          is_banned: true, subscription_status: "expired",
          full_name: "[DELETED]", email: `deleted_${Date.now()}@removed.com`
        }).eq("id", args.user_id);
        if (error) return `❌ Delete failed: ${error.message}`;
        return `✅ User ${args.user_id} has been soft-deleted. Profile marked as [DELETED] and account frozen. To permanently remove from Supabase Auth, use the Supabase Dashboard.`;
      }

      case "send_notification_to_user": {
        await createNotification({
          userId: args.user_id,
          type: args.type || "SYSTEM",
          title: args.title,
          message: args.message,
          priority: args.priority || "normal"
        });
        return `✅ Notification sent to user ${args.user_id}: "${args.title}"`;
      }

      case "send_broadcast": {
        const { data: users } = await supabase.from("profiles").select("id");
        if (!users || users.length === 0) return "No users to broadcast to.";
        const notifications = users.map((u: any) => ({
          user_id: u.id, type: args.type || "SYSTEM",
          title: args.title, message: args.message, priority: "normal", is_read: false
        }));
        await supabase.from("notifications").insert(notifications);
        return `✅ Broadcast sent to all ${users.length} users: "${args.title}"`;
      }

      case "change_user_subscription": {
        const { error } = await supabase.from("profiles").update({ subscription_status: args.plan }).eq("id", args.user_id);
        if (error) return `❌ Failed: ${error.message}`;
        await createNotification({
          userId: args.user_id, type: "BILLING",
          title: "Subscription Updated",
          message: `Your subscription has been changed to ${args.plan.toUpperCase()} by the admin team.`,
          priority: "normal"
        });
        return `✅ User ${args.user_id} plan changed to "${args.plan}". Notification sent.`;
      }

      case "get_support_tickets": {
        let query = supabase.from("support_tickets").select("id, subject, status, priority, created_at, user_id").order("created_at", { ascending: false }).limit(15);
        if (args.status && args.status !== "all") query = query.eq("status", args.status);
        const { data } = await query;
        if (!data || data.length === 0) return "No tickets found.";
        return `Support Tickets (${data.length}):\n` + data.map((t: any) =>
          `• [${t.status?.toUpperCase()}] ${t.subject} | Priority: ${t.priority || "normal"} | ${new Date(t.created_at).toLocaleDateString()} | ID: ${t.id}`
        ).join("\n");
      }

      case "resolve_ticket": {
        const { error } = await supabase.from("support_tickets").update({ status: "resolved", updated_at: new Date().toISOString() }).eq("id", args.ticket_id);
        if (error) return `❌ Failed: ${error.message}`;
        return `✅ Ticket ${args.ticket_id} marked as resolved.`;
      }

      case "reply_to_ticket": {
        await supabase.from("ticket_replies").insert({ ticket_id: args.ticket_id, admin_id: "agent", message: args.message });
        await supabase.from("support_tickets").update({ status: "in_progress", updated_at: new Date().toISOString() }).eq("id", args.ticket_id);
        await createNotification({ userId: args.user_id, type: "SUPPORT", title: "Support Team Reply", message: `Admin replied to your ticket: "${args.message.substring(0, 80)}..."`, priority: "high" });
        return `✅ Reply sent to ticket ${args.ticket_id}. User notified.`;
      }

      case "get_financial_summary": {
        const [usersRes, payoutsRes, transRes] = await Promise.all([
          supabase.from("profiles").select("subscription_status", { count: "exact" }),
          supabase.from("payout_requests").select("status, amount"),
          supabase.from("transactions").select("amount, type")
        ]);
        const users = usersRes.data || [];
        const payouts = payoutsRes.data || [];
        const txns = transRes.data || [];
        const elite = users.filter((u: any) => u.subscription_status === "elite").length;
        const pro = users.filter((u: any) => u.subscription_status === "pro").length;
        const trial = users.filter((u: any) => u.subscription_status === "trial").length;
        const pending = payouts.filter((p: any) => p.status === "pending");
        const pendingAmt = pending.reduce((s: number, p: any) => s + (p.amount || 0), 0);
        const totalVolume = txns.reduce((s: number, t: any) => s + Math.abs(t.amount || 0), 0);
        return `Financial Summary:
Users: ${users.length} total | Elite: ${elite} | Pro: ${pro} | Trial: ${trial}
Est. MRR: ₹${((elite * 4999) + (pro * 2499)).toLocaleString()}
Pending Payouts: ${pending.length} requests worth $${pendingAmt.toLocaleString()}
Transaction Volume: $${totalVolume.toLocaleString()} (${txns.length} transactions)`;
      }

      case "get_pending_payouts": {
        const { data } = await supabase.from("payout_requests").select("*").eq("status", "pending").order("created_at", { ascending: false });
        if (!data || data.length === 0) return "No pending payout requests.";
        return `Pending Payouts (${data.length}):\n` + data.map((p: any) =>
          `• $${p.amount} via ${p.method || "crypto"} | User: ${p.user_id} | ${new Date(p.created_at).toLocaleDateString()} | ID: ${p.id}`
        ).join("\n");
      }

      case "approve_payout": {
        const { error } = await supabase.from("payout_requests").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", args.payout_id);
        if (error) return `❌ Failed: ${error.message}`;
        await createNotification({ userId: args.user_id, type: "BILLING", title: "Payout Approved", message: "Your withdrawal request has been approved and is being processed.", priority: "high" });
        return `✅ Payout ${args.payout_id} approved. User notified.`;
      }

      case "reject_payout": {
        const { error } = await supabase.from("payout_requests").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", args.payout_id);
        if (error) return `❌ Failed: ${error.message}`;
        await createNotification({ userId: args.user_id, type: "BILLING", title: "Payout Rejected", message: args.reason || "Your withdrawal request was rejected. Contact support.", priority: "high" });
        return `✅ Payout ${args.payout_id} rejected. User notified.`;
      }

      case "get_trading_summary": {
        const [tradesRes, mt5Res] = await Promise.all([
          supabase.from("trades").select("profit, symbol, trade_type, user_id"),
          supabase.from("mt5_accounts").select("user_id, balance, algo_status")
        ]);
        const trades = tradesRes.data || [];
        const mt5 = mt5Res.data || [];
        const totalPnl = trades.reduce((s: number, t: any) => s + (t.profit || 0), 0);
        const winners = trades.filter((t: any) => t.profit > 0).length;
        const running = mt5.filter((a: any) => a.algo_status).length;
        return `Trading Summary:
Total Trades: ${trades.length} | Win Rate: ${trades.length > 0 ? Math.round((winners / trades.length) * 100) : 0}%
Total Platform P&L: $${totalPnl.toFixed(2)}
MT5 Accounts: ${mt5.length} linked | ${running} algos currently running`;
      }

      case "freeze_trading": {
        const { error } = await supabase.from("mt5_accounts").update({ algo_status: false }).eq("user_id", args.user_id);
        if (error) return `❌ Failed: ${error.message}`;
        await createNotification({ userId: args.user_id, type: "TRADE", title: "Algo Trading Halted", message: "Your algorithmic trading has been halted by the risk management team.", priority: "high" });
        return `✅ Trading halted for user ${args.user_id}. Algo stopped.`;
      }

      case "get_system_health": {
        const start = Date.now();
        const [usersRes, mt5Res, tradesRes] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("mt5_accounts").select("*", { count: "exact", head: true }),
          supabase.from("trades").select("*", { count: "exact", head: true })
        ]);
        const latency = Date.now() - start;
        return `System Health:
DB Latency: ${latency}ms | Status: ${latency < 500 ? "✅ Healthy" : "⚠️ Slow"}
Total Users: ${usersRes.count || 0}
MT5 Accounts: ${mt5Res.count || 0}
Total Trades: ${tradesRes.count || 0}
Supabase: Connected | Auth: Active | Realtime: Active`;
      }

      case "set_maintenance_mode": {
        await supabase.from("system_settings").upsert({ id: "maintenance_mode", value: { enabled: args.enabled }, updated_at: new Date().toISOString() }, { onConflict: "id" });
        if (args.enabled) {
          const { data: users } = await supabase.from("profiles").select("id");
          if (users) {
            await supabase.from("notifications").insert(users.map((u: any) => ({
              user_id: u.id, type: "SYSTEM",
              title: "Platform Maintenance",
              message: "The platform is undergoing maintenance. Some features may be temporarily unavailable.",
              priority: "high", is_read: false
            })));
          }
        }
        return `✅ Maintenance mode ${args.enabled ? "ENABLED" : "DISABLED"}. ${args.enabled ? "All users notified." : "Platform is live."}`;
      }

      case "reset_user_xp": {
        await supabase.from("profiles").update({ xp: 0, streak_days: 0, discipline_level: 1 }).eq("id", args.user_id);
        await createNotification({ userId: args.user_id, type: "ACCOUNT", title: "Progress Reset", message: "Your XP and streak have been reset by the admin team.", priority: "high" });
        return `✅ XP, streak, and discipline level reset for user ${args.user_id}.`;
      }

      case "verify_user": {
        await supabase.from("profiles").update({ is_verified: true }).eq("id", args.user_id);
        await createNotification({ userId: args.user_id, type: "ACCOUNT", title: "Account Verified", message: "Your account has been verified by the admin team. You now have full access.", priority: "normal" });
        return `✅ User ${args.user_id} marked as verified.`;
      }

      case "get_audit_logs": {
        const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(args.limit || 10);
        if (!data || data.length === 0) return "No audit logs found.";
        return `Recent Audit Logs:\n` + data.map((l: any) =>
          `• ${l.action || l.event_type} by ${l.admin_email || "admin"} | ${new Date(l.created_at).toLocaleString()}`
        ).join("\n");
      }

      default:
        return `❌ Unknown tool: ${name}`;
    }
  } catch (err: any) {
    return `❌ Tool error (${name}): ${err.message}`;
  }
}
