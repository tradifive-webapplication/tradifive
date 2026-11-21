import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Server,
  Eye,
  EyeOff,
  Zap,
  RefreshCw,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface ConnectBrokerTopDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected?: boolean;
  currentBroker?: string;
  currentEquity?: number;
  onConnected?: () => void;
}

export default function ConnectBrokerTopDrawer({
  isOpen,
  onClose,
  isConnected = false,
  currentBroker = "MT5 Server",
  currentEquity = 0,
  onConnected,
}: ConnectBrokerTopDrawerProps) {
  const [brokerServer, setBrokerServer] = useState("Exness-MT5Real14");
  const [accountNumber, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleConnectMT5 = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAccount = accountNumber.trim();
    const cleanPassword = password.trim();
    const cleanServer = brokerServer.trim();

    if (!cleanAccount || !cleanPassword || !cleanServer) {
      toast.error("Please fill in all MT5 credentials.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Get current Supabase user if session exists
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Trigger MetaAPI account deployment via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("deploy-metaapi-account", {
        body: {
          accountNumber: cleanAccount,
          masterPassword: cleanPassword,
          brokerServer: cleanServer,
          purpose: "risk_journal",
          userId: user?.id,
        },
      });

      if (error) {
        let errMsg = error.message;
        try {
          if ((error as any).context) {
            const errBody = await (error as any).context.json();
            if (errBody?.error) errMsg = errBody.error;
          }
        } catch (_) {}
        toast.error("Broker Connection Failed", {
          description: errMsg,
          duration: 8000,
        });
        setIsSubmitting(false);
        return;
      }

      // Also upsert to local Supabase mt5_accounts if user exists
      if (user) {
        await supabase.from("mt5_accounts").upsert({
          user_id: user.id,
          account_number: cleanAccount,
          broker_server: cleanServer,
          server: cleanServer,
          broker: cleanServer.split("-")[0] || "MT5",
          connection_status: "deployed",
          is_connected: true,
          is_active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" }).catch(() => {});
      }

      // 3. Cache connection in localStorage for instant UI responsiveness
      localStorage.setItem("tradifive_broker_connected", "true");
      localStorage.setItem("tradifive_cached_account_number", cleanAccount);
      localStorage.setItem("tradifive_broker_name", cleanServer.split("-")[0] || "MT5");
      localStorage.setItem("tradifive_broker_server", cleanServer);
      window.dispatchEvent(new Event("tradifive_broker_connected_update"));

      // 4. Trigger initial trade and equity sync from MetaAPI
      try {
        await supabase.functions.invoke("sync-metaapi-trades");
      } catch (syncErr) {
        console.warn("Background sync initial invocation:", syncErr);
      }

      toast.success("Broker Connected & Synced!", {
        description: `Connected to ${cleanServer} (Account: ${cleanAccount}). Trades & balance are syncing.`,
      });

      if (onConnected) onConnected();
      onClose();
    } catch (err: any) {
      toast.error("Connection Error", {
        description: err?.message || "Failed to communicate with MT5 bridge.",
        duration: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center">
          {/* Backdrop overlay matching Import Trade Page */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Top Drawer Panel - Identical spring slide down from ceiling to Import Trade Page */}
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320, mass: 0.85 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.8, bottom: 0.05 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -50 || info.velocity.y < -250) {
                onClose();
              }
            }}
            className="relative z-50 w-full max-w-2xl max-h-[92vh] overflow-hidden bg-white dark:bg-[#161619] border-b border-x border-slate-200/80 dark:border-white/10 rounded-b-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] select-none overscroll-contain flex flex-col transition-all duration-200"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-3.5 border-b border-slate-100 dark:border-white/[0.06] shrink-0 bg-white dark:bg-[#161619]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-white flex items-center justify-center border border-slate-200/80 dark:border-white/10 shrink-0 shadow-2xs">
                  <Server size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                    Connect Broker Account
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Enter your MT5 server and login credentials to synchronize real-time trades and metrics.
                  </p>
                </div>
              </div>

              {/* Close Button with micro-tap */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100/90 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 border border-slate-200/60 dark:border-white/10 shadow-2xs transition-all cursor-pointer shrink-0"
                title="Close"
              >
                <X size={14} strokeWidth={2.2} />
              </motion.button>
            </div>

            {/* Scrollable Body Content */}
            <div
              onPointerDownCapture={(e) => e.stopPropagation()}
              className="overflow-y-auto max-h-[calc(92vh-115px)] px-6 py-4 select-text"
            >
              <form onSubmit={handleConnectMT5} className="space-y-4">
                {/* Clean, Simple Inputs: Server, Username, Password */}
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                      Broker Server Name
                    </label>
                    <input
                      type="text"
                      value={brokerServer}
                      onChange={(e) => setBrokerServer(e.target.value)}
                      placeholder="e.g. Exness-MT5Real14, FTMO-Server"
                      className="w-full h-[40px] px-3.5 rounded-xl text-[13px] bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/40 focus:border-zinc-400 dark:focus:border-white/40 transition-all font-medium"
                      required
                    />
                    <p className="text-[10.5px] text-slate-400 dark:text-neutral-500 mt-1 font-medium">
                      Exact MT5 server from your broker (e.g. <span className="font-mono text-slate-600 dark:text-neutral-300">Exness-MT5Real14</span>, not MT4 names).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                        Username / MT5 Login
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="e.g. 89124412"
                        className="w-full h-[40px] px-3.5 rounded-xl text-[13px] bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/40 focus:border-zinc-400 dark:focus:border-white/40 font-mono transition-all font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1">
                        Password (Master or Investor)
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full h-[40px] px-3.5 pr-10 rounded-xl text-[13px] bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/40 focus:border-zinc-400 dark:focus:border-white/40 transition-all"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons: Cancel (white pill) & Connect (black pill) */}
                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-white/[0.06]">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={onClose}
                    className="tactile-white-pill rounded-full px-5 py-2 text-[12px] font-semibold cursor-pointer select-none transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="tactile-black-pill rounded-full px-6 py-2 font-bold text-[12.5px] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 select-none shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Verifying with MT5...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={13} />
                        <span>Connect MT5 Account</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Bottom Grab Handle & Swipe Bar matching Import Trade Page */}
            <div
              onClick={onClose}
              className="flex items-center justify-center py-2.5 border-t border-slate-100 dark:border-white/[0.06] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group rounded-b-[28px] mt-auto shrink-0 bg-white dark:bg-[#161619]"
              title="Drag up or click to close"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-11 h-1.5 rounded-full bg-slate-300 dark:bg-white/25 group-hover:bg-slate-400 dark:group-hover:bg-white/40 transition-colors"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
