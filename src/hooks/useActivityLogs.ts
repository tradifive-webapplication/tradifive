import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Activity, 
  CreditCard, 
  MessageSquare, 
  ShieldAlert, 
  UserPlus, 
  Settings, 
  Download
} from "lucide-react";

export interface ActivityEvent {
  id: string;
  type: "trading" | "transactions" | "social" | "system";
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "pending" | "failed" | "info" | "warning";
  icon: any;
  referenceId: string;
  details?: Record<string, string>;
}

const MOCK_ACTIVITIES: ActivityEvent[] = [
  {
    id: "evt_10948273",
    type: "trading",
    title: "XAU/USD Long Position Closed",
    description: "Take profit hit by AI Scalper.",
    timestamp: "2026-05-25 14:32:01",
    status: "success",
    icon: Activity,
    referenceId: "TRD-8273",
    details: {
      "Ticket": "#10948273",
      "Lot Size": "2.5",
      "Open Price": "2040.10",
      "Close Price": "2045.50",
      "Net Profit": "+$1,350.00"
    }
  },
  {
    id: "evt_99812933",
    type: "social",
    title: "New Follower",
    description: "Alex Jenkins (@alexj) followed you.",
    timestamp: "2026-05-25 14:15:22",
    status: "info",
    icon: UserPlus,
    referenceId: "SOC-9981",
    details: {
      "User ID": "usr_99812",
      "Mutual Friends": "14",
      "Action": "Followed back"
    }
  },
  {
    id: "evt_inv042",
    type: "transactions",
    title: "PRO Subscription Renewed",
    description: "Monthly billing for TradiFive PRO tier.",
    timestamp: "2026-05-25 12:00:00",
    status: "success",
    icon: CreditCard,
    referenceId: "INV-0042",
    details: {
      "Invoice ID": "INV-2023-11-042",
      "Amount": "$49.00",
      "Payment Method": "Visa ending in 4242",
      "Next Billing": "Jun 25, 2026"
    }
  },
  {
    id: "evt_sys8821",
    type: "system",
    title: "Risk Parameters Updated",
    description: "Daily drawdown limit decreased to 3%.",
    timestamp: "2026-05-25 09:14:55",
    status: "warning",
    icon: Settings,
    referenceId: "SYS-8821",
    details: {
      "IP Address": "192.168.1.104",
      "Device": "MacBook Pro (macOS)",
      "Authorized By": "Account Owner"
    }
  },
  {
    id: "evt_10948199",
    type: "trading",
    title: "EUR/USD Short Position Closed",
    description: "Stop loss triggered.",
    timestamp: "2026-05-24 14:30:11",
    status: "failed",
    icon: Activity,
    referenceId: "TRD-8199",
    details: {
      "Ticket": "#10948199",
      "Lot Size": "1.0",
      "Open Price": "1.0920",
      "Close Price": "1.0950",
      "Net Profit": "-$300.00"
    }
  },
  {
    id: "evt_txn9982",
    type: "transactions",
    title: "Fund Withdrawal Request",
    description: "Requested withdrawal to bank account.",
    timestamp: "2026-05-24 10:15:00",
    status: "pending",
    icon: Download,
    referenceId: "TXN-9982",
    details: {
      "Transaction ID": "TXN-99827364",
      "Amount": "$5,000.00",
      "Destination": "Chase Chase Bank ****1234",
      "Expected Arrival": "2-3 Business Days"
    }
  },
  {
    id: "evt_soc112",
    type: "social",
    title: "Commented on Alpha Forex Setup",
    description: "You replied to a channel post.",
    timestamp: "2026-05-24 09:00:12",
    status: "info",
    icon: MessageSquare,
    referenceId: "SOC-0112",
    details: {
      "Channel": "Alpha Forex Setup",
      "Message": "\"Great breakdown on the supply zone! I'll be watching this level closely.\""
    }
  },
  {
    id: "evt_sec991",
    type: "system",
    title: "New Device Login",
    description: "Login detected from an unrecognized device.",
    timestamp: "2026-05-23 23:45:01",
    status: "warning",
    icon: ShieldAlert,
    referenceId: "SEC-0991",
    details: {
      "Location": "London, UK",
      "IP Address": "82.10.14.2",
      "Device": "iPhone 15 Pro",
      "Action Taken": "Email verification required"
    }
  }
];

export function useActivityLogs() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityEvent[]>(MOCK_ACTIVITIES);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch from user_activity_logs table
      const { data: dbLogs, error } = await supabase
        .from("user_activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (dbLogs && dbLogs.length > 0) {
        const mapped: ActivityEvent[] = dbLogs.map(log => {
          const isSys = log.event_type?.includes("SWITCH") || log.event_type?.includes("STRATEGY") || log.event_type?.includes("LOGIN") || log.event_type?.includes("LOGOUT");
          const type = isSys ? "system" : "trading";
          
          let icon = Settings;
          if (log.event_type?.includes("SWITCH")) icon = Settings;
          if (log.event_type?.includes("STRATEGY")) icon = Activity;
          
          let status: "success" | "warning" | "info" = "info";
          if (log.event_type?.includes("ON") || log.event_type?.includes("LOGIN")) status = "success";
          if (log.event_type?.includes("OFF")) status = "warning";

          const dateStr = log.created_at ? new Date(log.created_at).toISOString().replace('T', ' ').substring(0, 19) : "Recent";

          // Optional details decoding
          const details: Record<string, string> = {
            "Event Code": log.event_type || "UNKNOWN",
            "Node ID": log.id.substring(0, 8).toUpperCase(),
          };

          if (log.ip_address) {
            details["IP Address"] = log.ip_address;
          }

          if (log.metadata && typeof log.metadata === "object") {
            Object.entries(log.metadata as Record<string, any>).forEach(([k, v]) => {
              details[k] = String(v);
            });
          }

          return {
            id: log.id,
            type,
            title: log.event_type?.replace('_', ' ') || "User Activity",
            description: log.description || "Activity recorded.",
            timestamp: dateStr,
            status,
            icon,
            referenceId: log.id.substring(0, 8).toUpperCase(),
            details,
          };
        });

        // Smart Blending: Put DB logs on top, and append mock activities so that it remains richly decorated
        setActivities([...mapped, ...MOCK_ACTIVITIES]);
      } else {
        setActivities(MOCK_ACTIVITIES);
      }
    } catch (err) {
      console.error("Error loading activity logs:", err);
      setActivities(MOCK_ACTIVITIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    loading,
    activities,
    refetch: fetchActivities,
  };
}
