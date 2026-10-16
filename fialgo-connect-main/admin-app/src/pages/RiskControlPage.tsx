import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { canPerformAction } from "../lib/rbac";
import { ShieldAlert, AlertTriangle, Users, Ban, Activity, Power, Unlock, Skull, Lock } from "lucide-react";
import { createNotification } from "../lib/notifications";

export default function RiskControlPage() {
  const { adminUser } = useAdminAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [breaches, setBreaches] = useState<any[]>([]);
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [mt5Res, breachesRes, settingsRes] = await Promise.all([
        supabase.from("mt5_accounts").select("*, profiles(full_name, email)").order("created_at", { ascending: false }),
        supabase.from("risk_breach_logs").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(20),
        supabase.from("system_settings").select("*").eq("id", "kill_switch").maybeSingle()
      ]);
      
      setAccounts(mt5Res.data || []);
      setBreaches(breachesRes.data || []);
      if (settingsRes.data) {
        setKillSwitchActive(settingsRes.data.value?.active || false);
      }
      setLoading(false);
    };
    fetch();

    const channel = supabase.channel('risk_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mt5_accounts' }, fetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'risk_breach_logs' }, fetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_settings' }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleKillSwitch = async () => {
    if (!canPerformAction(adminUser!.role, "kill_switch")) return;
    const newState = !killSwitchActive;
    setActionLoading("kill_switch");
    
    // UPSERT system_settings
    await supabase.from("system_settings").upsert({
      id: "kill_switch",
      value: { active: newState },
      updated_at: new Date().toISOString()
    });

    if (newState) {
      // If activated, halt all algos
      await supabase.from("mt5_accounts").update({ algo_status: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    }

    setKillSwitchActive(newState);
    setActionLoading(null);
  };

  const toggleFreeze = async (accountId: string, userId: string, currentStatus: boolean) => {
    if (!canPerformAction(adminUser!.role, "freeze_trading")) return;
    setActionLoading(`freeze_${accountId}`);
    const newStatus = !currentStatus;
    
    await supabase.from("mt5_accounts").update({ algo_status: newStatus }).eq("id", accountId);
    
    await createNotification({
      userId,
      type: "SECURITY",
      title: newStatus ? "Trading Unfrozen" : "Trading Frozen",
      message: newStatus ? "Your trading algorithm has been reactivated by Risk Management." : "Your trading algorithm has been halted pending a risk review.",
      priority: "high"
    });
    
    setActionLoading(null);
  };

  const enforceLiquidation = async (accountId: string, userId: string) => {
    if (!canPerformAction(adminUser!.role, "freeze_trading")) return;
    if (!window.confirm("Are you sure you want to enforce liquidation on this account? This will close all open positions immediately.")) return;
    
    setActionLoading(`liquidate_${accountId}`);
    
    // Halt algo
    await supabase.from("mt5_accounts").update({ algo_status: false }).eq("id", accountId);
    
    // Log risk breach
    await supabase.from("risk_breach_logs").insert([{
      user_id: userId,
      breach_type: "ADMIN_LIQUIDATION",
      severity: "CRITICAL",
      description: "Admin initiated emergency position liquidation"
    }]);

    await createNotification({
      userId,
      type: "SECURITY",
      title: "LIQUIDATION INITIATED",
      message: "An emergency liquidation has been initiated on your account by Risk Management. All open positions will be closed.",
      priority: "high"
    });

    setActionLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Risk Control Center</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Global Enforcement & Liquidations</p>
        </div>
        {canPerformAction(adminUser!.role, "kill_switch") && (
          <button 
            onClick={toggleKillSwitch}
            disabled={actionLoading === "kill_switch"}
            className={`px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] rounded border transition-all flex items-center gap-2 ${
              killSwitchActive 
                ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse' 
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border-white/5'
            }`}
          >
            <Power size={14} />
            {actionLoading === "kill_switch" ? "Engaging..." : killSwitchActive ? "KILL SWITCH ACTIVE" : "EMERGENCY KILL"}
          </button>
        )}
      </div>

      {killSwitchActive && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <Skull size={48} className="text-red-500 mb-4 animate-pulse" />
          <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest mb-2">GLOBAL TRADING HALT ENGAGED</h2>
          <p className="text-red-400/80 text-sm font-mono max-w-lg">
            All algorithmic trading execution has been suspended. MT5 accounts are locked. 
            User trades will not be placed. Resolve the anomaly before disengaging.
          </p>
        </div>
      )}

      {/* Risk Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Connections", value: accounts.filter(a => a.algo_status).length },
          { label: "Halted Algorithms", value: accounts.filter(a => !a.algo_status).length },
          { label: "Recent Breaches", value: breaches.length, color: breaches.length > 0 ? "text-amber-500" : "text-white" },
          { label: "Total Equity at Risk", value: `$${accounts.reduce((sum, a) => sum + (a.equity || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}` },
        ].map(s => (
          <div key={s.label} className="bg-[#1E1E1E] border border-white/5 rounded p-4">
            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-lg font-bold uppercase ${s.color || "text-white"}`}>{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MT5 Accounts List */}
        <div className="lg:col-span-2 bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-blue-500" /> Connected Accounts Matrix
            </h2>
            <span className="text-[9px] text-neutral-500">{accounts.length} Total</span>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.2em] bg-black/40 border-b border-white/5 sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="px-5 py-3">Trader</th>
                  <th className="px-5 py-3">Balance / Equity</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">Scanning MT5 Nodes...</td></tr>
                ) : accounts.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">No Active Connections</td></tr>
                ) : accounts.map(account => (
                  <tr key={account.id} className="hover:bg-white/[0.01] transition-none group">
                    <td className="px-5 py-3">
                      <p className="text-[11px] font-bold text-white uppercase">{account.profiles?.full_name || "Unknown User"}</p>
                      <p className="text-[9px] text-neutral-500 font-mono lower-case">Broker: {account.broker_server}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[11px] font-mono text-white">${account.balance?.toFixed(2) || "0.00"}</p>
                      <p className="text-[9px] font-mono text-neutral-500">Eq: ${account.equity?.toFixed(2) || "0.00"}</p>
                    </td>
                    <td className="px-5 py-3">
                      {account.algo_status ? (
                        <span className="px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-widest">Running</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded border border-red-500/20 bg-red-500/10 text-red-500 text-[9px] font-bold uppercase tracking-widest">Halted</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {canPerformAction(adminUser!.role, "freeze_trading") && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => enforceLiquidation(account.id, account.user_id)}
                            disabled={actionLoading === `liquidate_${account.id}` || killSwitchActive}
                            className="p-1.5 text-neutral-500 hover:text-orange-500 hover:bg-orange-500/10 rounded border border-transparent hover:border-orange-500/20 transition-all disabled:opacity-50"
                            title="Enforce Liquidation"
                          >
                            <AlertTriangle size={14} />
                          </button>
                          
                          <button
                            onClick={() => toggleFreeze(account.id, account.user_id, account.algo_status)}
                            disabled={actionLoading === `freeze_${account.id}` || killSwitchActive}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold uppercase rounded border transition-all disabled:opacity-50 ${
                              account.algo_status 
                                ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30" 
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                            }`}
                          >
                            {account.algo_status ? <Lock size={12} /> : <Unlock size={12} />}
                            {account.algo_status ? "Freeze" : "Unfreeze"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Breaches Feed */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={14} className="text-amber-500" />
              Risk Breach Logs
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="p-8 text-center text-[10px] font-mono text-neutral-600 uppercase">Loading logs...</div>
            ) : breaches.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <ShieldAlert size={24} className="text-neutral-800 mb-3" />
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">No Breaches Detected</p>
                <p className="text-[9px] text-neutral-600 mt-1">All accounts within risk parameters</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.02]">
                {breaches.map(breach => (
                  <div key={breach.id} className="p-4 hover:bg-white/[0.01]">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                        breach.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                        breach.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        breach.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {breach.severity || "LOW"}
                      </span>
                      <span className="text-[8px] font-mono text-neutral-600">{new Date(breach.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] font-bold text-white mb-1">{breach.profiles?.full_name || "Unknown"} • {breach.breach_type}</p>
                    <p className="text-[10px] text-neutral-500 leading-relaxed">{breach.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
