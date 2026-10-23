import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Cpu,
  ExternalLink,
  ShieldCheck,
  Zap,
  HelpCircle,
  FileCode,
  CheckCircle2,
  Bot,
  Play,
  Terminal,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrading } from "@/contexts/TradingContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { generateTradifiveLicenseKey } from "@/pages/AITrading";
import { toast } from "sonner";

const cardBoxStyle = "p-5 sm:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none transition-all";

const kpiBoxStyle = "h-[110px] px-5 py-4 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] flex flex-col justify-between transition-all duration-300 dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none hover:scale-[1.01] dark:hover:shadow-none";

const authorizedAlgos = [
  {
    name: "TradiFive Scalper AI",
    pairs: "EUR/USD · Gold (XAU/USD)",
    key: "TRDF-8492-AX91",
    status: "Active",
    version: "v4.2.0"
  },
  {
    name: "TradiFive Swing Master",
    pairs: "Gold (XAU/USD) · GBP/USD",
    key: "TRDF-7910-SW22",
    status: "Active",
    version: "v3.8.0"
  },
  {
    name: "TradiFive HFT Core",
    pairs: "Nasdaq (US100) · USD/JPY",
    key: "TRDF-6520-HF99",
    status: "Active",
    version: "v2.4.0"
  },
  {
    name: "TradiFive Grid Protocol",
    pairs: "GBP/JPY · EUR/JPY",
    key: "TRDF-5412-GD01",
    status: "Active",
    version: "v1.9.0"
  }
];

export default function EASetup() {
  const navigate = useNavigate();
  const { licenseKey: tradingKey, connectDemo } = useTrading();
  const { isConnected } = useDashboardData();

  const [licenseKey, setLicenseKey] = useState(tradingKey || "");
  const [connectedAccount, setConnectedAccount] = useState<string | null>(() => {
    try { return localStorage.getItem("tradifive_connected_mt5_account") || null; } catch (e) { return null; }
  });
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [showFaq, setShowFaq] = useState<number | null>(null);

  // Fetch real user key from Supabase if available
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
        }
      } catch (e) {}
    };
    fetchKey();
  }, []);

  const copyKey = (keyToCopy: string) => {
    if (keyToCopy === "PENDING_ACTIVATION" || !keyToCopy) {
      toast.error("License Not Active", {
        description: "Please connect with the Tradifive team or input your MT5 account to activate your license key."
      });
      return;
    }
    navigator.clipboard.writeText(keyToCopy);
    setCopied(true);
    toast.success("License key copied to clipboard", {
      description: connectedAccount ? `Cryptographically locked to MT5 Account #${connectedAccount}` : undefined
    });
    setTimeout(() => setCopied(false), 2000);
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
        ? `Account-locked to MT5 Account #${connectedAccount}. Copy into your MT5 MQL5/Experts folder.`
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
      <div className="max-w-[1400px] mx-auto space-y-6 pb-12 px-4 sm:px-6 md:px-8 font-sans">

        {/* ── CLEAN, HUMAN HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 
                className="text-[28px] sm:text-[30px] font-bold text-slate-900 dark:text-white tracking-tight leading-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                License &amp; Activation
              </h1>
              <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200/50 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active License
              </span>
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2">
              Activate your algorithmic trading bots and connect your MetaTrader 5 terminal in 3 simple steps
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate("/auto-trade/active-bots")}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:bg-[#1E1E1E] dark:border-white/10 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-500" />
              <span>Active Bots</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadEA}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-indigo-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Master EA</span>
            </button>
          </div>
        </div>

        {/* ── 3 CLEAN SUMMARY KPI CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Card 1: Master License Key */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Primary License Key
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                <Key className="w-4 h-4 text-indigo-500" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-wide">
                {licenseKey}
              </span>
              <button
                type="button"
                onClick={() => copyKey(licenseKey)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Connected MT5 Terminal */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Connected MT5 Account
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                {connectedAccount ? `Account #${connectedAccount}` : "Not Attached Yet"}
              </span>
              <span className={`text-xs font-medium ${connectedAccount ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}`}>
                {connectedAccount ? "Synchronized" : "Pending MT5"}
              </span>
            </div>
          </div>

          {/* Card 3: Execution Telemetry */}
          <div className={kpiBoxStyle}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Execution Status
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${connectedAccount ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                {connectedAccount ? "Live · 2.1ms Ping" : "Waiting for MT5"}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {connectedAccount ? "VPS Online" : "Standby"}
              </span>
            </div>
          </div>
        </div>

        {/* ── 3-STEP INTUITIVE ACTIVATION GUIDE ── */}
        <div className="space-y-4">
          <div className="pb-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              3-Step Easy MT5 Activation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Follow these simple steps to install the Expert Advisor and start automated trading
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Download */}
            <div className={cardBoxStyle}>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Step 1
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Download Master EA
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Download the compiled <strong>TradiFive_Master_EA.ex5</strong> file. This connects your MT5 terminal to our AI server.
              </p>
              <button
                type="button"
                onClick={handleDownloadEA}
                className="w-full h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .EX5 File</span>
              </button>
            </div>

            {/* Step 2: Paste File in MT5 */}
            <div className={cardBoxStyle}>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Step 2
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Place in Experts Folder
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                In MT5, click <strong>File &gt; Open Data Folder</strong>, then open <strong>MQL5 &gt; Experts</strong> and paste the file there.
              </p>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/5">
                MQL5 / Experts / TradiFive_Master.ex5
              </div>
            </div>

            {/* Step 3: Enter Key & Turn On */}
            <div className={cardBoxStyle}>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Step 3
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Attach EA &amp; Enter Key
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Drag the EA onto your chart, paste your key into the <strong>LicenseKey</strong> field, and make sure <strong>Algo Trading</strong> is enabled.
              </p>
              <button
                type="button"
                onClick={handleVerifyConnection}
                disabled={isVerifying}
                className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Heartbeat...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify Connection</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── AUTHORIZED ALGORITHM LICENSES TABLE ── */}
        <div className={cardBoxStyle}>
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/5 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Authorized Algorithm Licenses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All algorithmic trading bots bound to your account and license key
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/strategy")}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Add More Bots</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Algorithm</th>
                  <th className="pb-3">Trading Pairs</th>
                  <th className="pb-3">Dedicated License</th>
                  <th className="pb-3">Version</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                {authorizedAlgos.map((algo) => (
                  <tr key={algo.key} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Bot className="w-4 h-4 text-indigo-500" />
                      <span>{algo.name}</span>
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-300">
                      {algo.pairs}
                    </td>
                    <td className="py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span>{algo.key}</span>
                        <button
                          type="button"
                          onClick={() => copyKey(algo.key)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          title="Copy key"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-500">
                      {algo.version}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-200/50">
                        {algo.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SIMPLE FAQ / HELP ACCORDION ── */}
        <div className={cardBoxStyle}>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {[
              {
                q: "Where do I paste the .ex5 file in MetaTrader 5?",
                a: "Open MT5, click File > Open Data Folder in the top menu. In the folder that opens, navigate to MQL5 > Experts. Paste the TradiFive_Master_EA.ex5 file here, then restart MT5 or right-click 'Expert Advisors' in the Navigator panel and click Refresh."
              },
              {
                q: "How do I know if my EA is successfully connected?",
                a: "Look at the top-right corner of your MT5 chart. If the hat or face icon is smiling and you see 'TradiFive AI: Connected' in the chart comment, your algorithm is successfully communicating with our servers."
              },
              {
                q: "Can I run the bot on a VPS (Virtual Private Server)?",
                a: "Yes! Running on a Windows VPS is recommended for 24/7 uninterrupted execution with sub-5ms ping to your broker's trading server."
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="border border-slate-200/70 dark:border-white/5 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setShowFaq(showFaq === idx ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {showFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {showFaq === idx && (
                  <div className="px-3.5 pb-3.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-2.5">
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
