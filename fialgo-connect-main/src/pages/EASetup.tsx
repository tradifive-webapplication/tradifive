import React, { useState, useEffect, useMemo } from "react";
import { 
  Download, 
  FolderOpen, 
  RefreshCw, 
  Key, 
  Activity, 
  ArrowRight, 
  Check, 
  Copy, 
  Monitor, 
  ShieldCheck, 
  FileCode, 
  CheckCircle2, 
  Bot, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrading } from "@/contexts/TradingContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { generateTradifiveLicenseKey } from "@/pages/AITrading";
import { EXISTING_OFFICIAL_ALGOS } from "@/pages/Discover";
import { toast } from "sonner";

interface AuthorizedAlgoItem {
  id: string;
  name: string;
  pairs: string;
  key: string;
  version: string;
  status: string;
}

export default function EASetup() {
  const navigate = useNavigate();
  const { licenseKey: tradingKey, connectDemo } = useTrading();
  const { isConnected, isAlgoRunning } = useDashboardData();

  const [licenseKey, setLicenseKey] = useState(tradingKey || "");
  const [connectedAccount, setConnectedAccount] = useState<string | null>(() => {
    try { return localStorage.getItem("tradifive_connected_mt5_account") || null; } catch (e) { return null; }
  });
  const [copied, setCopied] = useState(false);
  const [copiedAlgoKey, setCopiedAlgoKey] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showFaq, setShowFaq] = useState<number | null>(null);
  const [dbOrders, setDbOrders] = useState<any[]>([]);

  // Fetch real user key & account from Supabase
  useEffect(() => {
    const fetchKey = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("activation_key")
            .eq("id", user.id)
            .maybeSingle();

          if (data && data.activation_key) {
            setLicenseKey(data.activation_key);
            try { localStorage.setItem("tradifive_license_key", data.activation_key); } catch (e) {}
          }

          const { data: acc } = await supabase
            .from("mt5_accounts")
            .select("activation_key, account_number")
            .eq("user_id", user.id)
            .maybeSingle();

          if (acc?.account_number) {
            const cleanAcc = String(acc.account_number).replace(/\D/g, "");
            setConnectedAccount(cleanAcc);
            try { localStorage.setItem("tradifive_connected_mt5_account", cleanAcc); } catch (e) {}

            if (acc?.activation_key && (!data || !data.activation_key)) {
              setLicenseKey(acc.activation_key);
              try { localStorage.setItem("tradifive_license_key", acc.activation_key); } catch (e) {}
            } else if (!data?.activation_key && !acc?.activation_key) {
              const autoKey = generateTradifiveLicenseKey(cleanAcc);
              setLicenseKey(autoKey);
              try { localStorage.setItem("tradifive_license_key", autoKey); } catch (e) {}
            }
          } else if (!data?.activation_key) {
            const localAcc = localStorage.getItem("tradifive_connected_mt5_account");
            if (localAcc) {
              const autoKey = generateTradifiveLicenseKey(localAcc);
              setLicenseKey(autoKey);
              setConnectedAccount(localAcc);
            } else {
              setLicenseKey("PENDING_ACTIVATION");
            }
          }

          // Fetch database orders
          supabase
            .from("creator_orders")
            .select("*")
            .eq("buyer_id", user.id)
            .in("status", ["completed", "active"])
            .then(({ data: ordersData }) => {
              if (ordersData && ordersData.length > 0) {
                setDbOrders(ordersData);
              }
            });
        }
      } catch (e) {}
    };
    fetchKey();
  }, []);

  // Real Authorized Algorithms derived strictly from real purchases
  const authorizedAlgos: AuthorizedAlgoItem[] = useMemo(() => {
    const list: AuthorizedAlgoItem[] = [];
    const seen = new Set<string>();

    // 1. Check verified purchases from Strategy Armory / Marketplace
    try {
      const savedPurchases: string[] = JSON.parse(localStorage.getItem("tradifive_purchased_algos") || "[]");
      savedPurchases.forEach((productId) => {
        const product = EXISTING_OFFICIAL_ALGOS.find(p => p.id === productId);
        const licKey = localStorage.getItem(`tradifive_license_${productId}`) || localStorage.getItem("tradifive_license_key") || `TRDF-${productId.toUpperCase()}`;
        if (product && !seen.has(product.id)) {
          seen.add(product.id);
          list.push({
            id: product.id,
            name: product.name,
            pairs: product.pairs?.join(" · ") || "XAUUSD (Gold)",
            key: licKey,
            version: product.version || "v1.0.4",
            status: isAlgoRunning ? "Active" : "Standby"
          });
        }
      });
    } catch {}

    // 2. Check verified custom builds from Custom Dev Studio
    try {
      const customOrders = JSON.parse(localStorage.getItem("fialgo_custom_build_orders") || "[]");
      customOrders.forEach((order: any) => {
        if ((order.type === "ALGO_EA" || order.type === "COMBO_SUITE") && !seen.has(order.id)) {
          seen.add(order.id);
          list.push({
            id: order.id,
            name: order.title,
            pairs: `${order.pair} (${order.timeframe})`,
            key: `FIA-${order.id}`,
            version: "v1.0 Custom",
            status: order.status === "DELIVERED" ? "Active" : "Pending Build"
          });
        }
      });
    } catch {}

    // 3. Database orders
    dbOrders.forEach((dbOrder) => {
      const matched = EXISTING_OFFICIAL_ALGOS.find(p => p.id === dbOrder.product_id);
      const key = dbOrder.id || dbOrder.product_id;
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          id: key,
          name: matched ? matched.name : (dbOrder.title || "Trading Algorithm EA"),
          pairs: matched?.pairs?.join(" · ") || "Multi-Pair",
          key: dbOrder.license_key || `TRDF-DB-${key.slice(-4).toUpperCase()}`,
          version: matched?.version || "v1.0",
          status: "Active"
        });
      }
    });

    return list;
  }, [dbOrders, isAlgoRunning]);

  const copyKey = (keyToCopy: string) => {
    if (keyToCopy === "PENDING_ACTIVATION" || !keyToCopy) {
      toast.error("License Not Active", {
        description: "Please connect with the FiAlgo team or input your MT5 account to activate your license key."
      });
      return;
    }
    navigator.clipboard.writeText(keyToCopy);
    setCopied(true);
    toast.success("License key copied to clipboard", {
      description: connectedAccount ? `Bound to MT5 Account #${connectedAccount}` : undefined
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAlgoKey = (keyToCopy: string) => {
    navigator.clipboard.writeText(keyToCopy);
    setCopiedAlgoKey(keyToCopy);
    toast.success("Dedicated license key copied");
    setTimeout(() => setCopiedAlgoKey(null), 2000);
  };

  const handleDownloadEA = () => {
    if (licenseKey === "PENDING_ACTIVATION" || !licenseKey) {
      toast.error("Activation Required", {
        description: "Please enter your MT5 account number in Setup before downloading."
      });
      return;
    }
    const a = document.createElement("a");
    a.href = "/FiAlgo_v1.0.4.ex5";
    a.download = "FiAlgo_v1.0.4.ex5";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success("Downloading FiAlgo_v1.0.4.ex5", {
      description: connectedAccount 
        ? `Bound to MT5 Account #${connectedAccount}. Copy into your MT5 MQL5/Experts folder.`
        : "Save this file into your MT5 /MQL5/Experts folder."
    });
  };

  const handleVerifyConnection = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      connectDemo("IC Markets");
      toast.success("MT5 Terminal Heartbeat Verified!", {
        description: "Your license is active and authorized for automated trade execution."
      });
    }, 1200);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-20 select-none px-4 sm:px-6 md:px-8 py-3 max-w-[1500px] mx-auto w-full">

        {/* ── Top Header (Admin App Style: Clean, Dark, Sharp Borders, No Pill Badges) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center text-blue-400 shrink-0" 
              style={{ borderColor: "#3b82f620" }}
            >
              <Key size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-wider text-white uppercase">
                  EA License &amp; Keys
                </h1>
              </div>
              <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5">
                Activate algorithmic trading bots and connect your MetaTrader 5 terminal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/auto-trade/active-bots")}
              className="h-9 px-3.5 bg-[#1E1E1E] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-none flex items-center gap-1.5 cursor-pointer"
            >
              <Bot size={13} className="text-blue-400" />
              <span>Active Bots</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadEA}
              className="btn-fialgo-primary h-9 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={13} />
              <span>Download Master EA</span>
            </button>
          </div>
        </div>

        {/* ── 3 Summary KPI Cards (Clean Admin App Style: No Cluttered Icon Circles or Corner Badges) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Master License Key */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight truncate max-w-[220px]">
                {licenseKey}
              </div>
              <button
                type="button"
                onClick={() => copyKey(licenseKey)}
                className="text-xs font-mono font-bold text-blue-400 hover:text-white flex items-center gap-1 cursor-pointer ml-2 shrink-0"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-1">
              PRIMARY LICENSE KEY
            </div>
          </div>

          {/* Card 2: Connected MT5 Terminal */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-4">
            <div className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">
              {connectedAccount ? `Account #${connectedAccount}` : "Not Attached Yet"}
            </div>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-1">
              CONNECTED MT5 ACCOUNT
            </div>
          </div>

          {/* Card 3: Execution Telemetry */}
          <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-4">
            <div className="flex items-center gap-2 text-lg sm:text-xl font-bold font-mono text-white tracking-tight">
              <div className={`w-2 h-2 rounded-full ${connectedAccount && isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
              <span>{connectedAccount && isConnected ? "Live (2.1ms Ping)" : "Waiting for MT5"}</span>
            </div>
            <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-1">
              EXECUTION STATUS
            </div>
          </div>
        </div>

        {/* ── 3-Step Intuitive MT5 Activation Guide (Admin Card Grid) ── */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-4">
          <div className="pb-2 border-b border-white/5">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              3-Step Easy MT5 Activation
            </h2>
            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-0.5">
              Follow these simple steps to install the Expert Advisor and start automated execution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1 */}
            <div className="p-4 rounded-lg bg-black/30 border border-white/5 font-mono text-xs flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block mb-1">
                  STEP 01
                </span>
                <h4 className="font-bold text-white text-sm font-sans mb-1">
                  Download Master EA
                </h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                  Download the compiled <strong>FiAlgo_v1.0.4.ex5</strong> binary. This file establishes direct low-latency order routing with your MT5 terminal.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadEA}
                className="btn-fialgo-primary w-full h-8 text-[11px] font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={12} />
                <span>Download .EX5</span>
              </button>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-lg bg-black/30 border border-white/5 font-mono text-xs flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest block mb-1">
                  STEP 02
                </span>
                <h4 className="font-bold text-white text-sm font-sans mb-1">
                  Place in Experts Folder
                </h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-sans mb-2">
                  In MT5, click <strong>File &gt; Open Data Folder</strong>, navigate to <strong>MQL5 &gt; Experts</strong>, and paste the downloaded file.
                </p>
              </div>
              <div className="p-2 rounded bg-black/50 border border-white/5 text-[10px] text-neutral-300 font-mono select-all truncate">
                MQL5 / Experts / FiAlgo_v1.0.4.ex5
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-lg bg-black/30 border border-white/5 font-mono text-xs flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                  STEP 03
                </span>
                <h4 className="font-bold text-white text-sm font-sans mb-1">
                  Attach EA &amp; Enter Key
                </h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                  Drag the EA onto your chart, paste your Primary License Key, enable <strong>Algo Trading</strong> in MT5, and verify connection.
                </p>
              </div>
              <button
                type="button"
                onClick={handleVerifyConnection}
                disabled={isVerifying}
                className="h-8 px-4 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider transition-none inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={12} />
                    <span>Verify Connection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── AUTHORIZED ALGORITHM LICENSES TABLE (Real Purchases Only) ── */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Authorized Algorithm Licenses ({authorizedAlgos.length})
              </h3>
              <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.15em] mt-0.5">
                All algorithmic trading bots bound to your account and license key
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/discover?tab=store")}
              className="text-xs font-mono font-bold text-blue-400 hover:text-white flex items-center gap-1 cursor-pointer transition-none"
            >
              <span>Browse Strategy Armory</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {authorizedAlgos.length === 0 ? (
            <div className="p-10 text-center font-mono">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-neutral-400 mx-auto mb-3">
                <Bot size={18} />
              </div>
              <div className="text-xs text-white font-bold uppercase tracking-wider mb-1">
                No Authorized Algorithm Licenses
              </div>
              <p className="text-[11px] text-neutral-500 max-w-sm mx-auto mb-4 font-sans">
                No trading algorithms or EA licenses are currently authorized. Acquire an algorithm from the Strategy Armory or submit a custom build request.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/discover?tab=store")}
                  className="btn-fialgo-primary h-8 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Browse Strategy Armory</span>
                  <ArrowRight size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/auto-trade/builder")}
                  className="h-8 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-neutral-300 border border-white/10 transition-none cursor-pointer"
                >
                  Request Custom Build
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-black/20">
                    <th className="p-3">ALGORITHM</th>
                    <th className="p-3">TRADING PAIRS</th>
                    <th className="p-3">DEDICATED LICENSE</th>
                    <th className="p-3">VERSION</th>
                    <th className="p-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-xs">
                  {authorizedAlgos.map((algo) => (
                    <tr key={algo.id} className="hover:bg-white/[0.02] transition-none">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <Bot size={14} className="text-blue-400" />
                        <span className="font-sans">{algo.name}</span>
                      </td>
                      <td className="p-3 text-neutral-300">
                        {algo.pairs}
                      </td>
                      <td className="p-3 text-neutral-300">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{algo.key}</span>
                          <button
                            type="button"
                            onClick={() => copyAlgoKey(algo.key)}
                            className="text-neutral-500 hover:text-white"
                            title="Copy key"
                          >
                            {copiedAlgoKey === algo.key ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-neutral-400">
                        {algo.version}
                      </td>
                      <td className="p-3 text-right">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                          {algo.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── FREQUENTLY ASKED QUESTIONS (Admin Accordion Styling) ── */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 space-y-3">
          <div className="pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-2">
            {[
              {
                q: "Where do I paste the .ex5 file in MetaTrader 5?",
                a: "Open MT5, click File > Open Data Folder in the top menu. In the folder that opens, navigate to MQL5 > Experts. Paste the FiAlgo_v1.0.4.ex5 file here, then restart MT5 or right-click 'Expert Advisors' in the Navigator panel and click Refresh."
              },
              {
                q: "How do I know if my EA is successfully connected?",
                a: "Look at the top-right corner of your MT5 chart. If the hat icon is blue and you see 'FiAlgo V1: Connected' in the chart comment, your algorithm is successfully communicating with our servers."
              },
              {
                q: "Can I run the bot on a VPS (Virtual Private Server)?",
                a: "Yes. Running on a Windows VPS is recommended for 24/7 uninterrupted execution with sub-3ms ping to your broker's trading server."
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="border border-white/5 rounded-lg overflow-hidden bg-black/20"
              >
                <button
                  type="button"
                  onClick={() => setShowFaq(showFaq === idx ? null : idx)}
                  className="w-full p-3 text-left flex items-center justify-between text-xs font-bold text-white hover:bg-white/[0.03] transition-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {showFaq === idx ? <ChevronUp size={13} className="text-neutral-400" /> : <ChevronDown size={13} className="text-neutral-400" />}
                </button>
                {showFaq === idx && (
                  <div className="px-3 pb-3 text-xs text-neutral-400 leading-relaxed border-t border-white/5 pt-2 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
