import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Crown, Star, Zap, Save, RefreshCcw, Users, Target } from "lucide-react";

export default function RewardsManagerPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [xpConfig, setXpConfig] = useState({
    trade_journal_xp: 10,
    daily_discipline_xp: 50,
    weekly_goal_xp: 500,
    risk_guard_bonus_xp: 150,
    streak_multiplier: 1.2,
  });
  const [configSaved, setConfigSaved] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setUsers(data || []);
    setLoading(false);
  };

  const fetchConfig = async () => {
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("id", "xp_config")
      .single();
    if (data?.value) setXpConfig(data.value);
  };

  useEffect(() => { fetchUsers(); fetchConfig(); }, []);

  const saveConfig = async () => {
    await supabase
      .from("system_settings")
      .upsert({ id: "xp_config", value: xpConfig, updated_at: new Date().toISOString() }, { onConflict: "id" });
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  const updateUserXP = async (userId: string, newXp: number) => {
    await supabase.from("profiles").update({ xp: newXp }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, xp: newXp } : u));
  };

  const totalXP = users.reduce((s, u) => s + (u.xp || 0), 0);
  const avgLevel = users.length > 0 ? (users.reduce((s, u) => s + (u.discipline_level || 1), 0) / users.length).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Rewards & XP Manager</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Gamification Configuration & User Progression</p>
        </div>
        <button onClick={fetchUsers} className="px-4 py-2 bg-[#1E1E1E] border border-white/5 rounded text-[10px] font-bold text-neutral-500 hover:text-white transition-none uppercase tracking-widest flex items-center gap-2">
          <RefreshCcw size={12} /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total XP Distributed", value: totalXP.toLocaleString(), icon: Star },
          { label: "Avg Discipline Level", value: `Lvl ${avgLevel}`, icon: Crown },
          { label: "Active Streaks", value: users.filter(u => (u.streak_days || 0) > 0).length, icon: Zap },
          { label: "Total Participants", value: users.length, icon: Users },
        ].map(s => (
          <div key={s.label} className="bg-[#1E1E1E] border border-white/5 rounded p-4">
            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-lg font-bold text-white">{loading ? "..." : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* XP Configuration Panel */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Target size={14} className="text-amber-500" /> XP Reward Rules
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {[
              { key: "trade_journal_xp", label: "Journal Entry XP" },
              { key: "daily_discipline_xp", label: "Daily Discipline XP" },
              { key: "weekly_goal_xp", label: "Weekly Goal XP" },
              { key: "risk_guard_bonus_xp", label: "Risk Guard Bonus XP" },
              { key: "streak_multiplier", label: "Streak Multiplier" },
            ].map(field => (
              <div key={field.key} className="flex items-center justify-between py-2 border-b border-white/[0.02]">
                <span className="text-[10px] text-neutral-500 font-medium">{field.label}</span>
                <input
                  type="number"
                  step={field.key === "streak_multiplier" ? "0.1" : "1"}
                  value={(xpConfig as any)[field.key]}
                  onChange={e => setXpConfig(prev => ({ ...prev, [field.key]: parseFloat(e.target.value) || 0 }))}
                  className="w-20 bg-[#121212] border border-white/5 rounded px-2 py-1 text-[11px] text-white text-right outline-none"
                />
              </div>
            ))}
            <button onClick={saveConfig}
              className={`w-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-colors ${configSaved ? "bg-emerald-600 text-white" : "bg-neutral-800 hover:bg-neutral-700 text-white border border-white/5"}`}>
              <Save size={12} /> {configSaved ? "Saved!" : "Save Configuration"}
            </button>
          </div>
        </div>

        {/* User XP Leaderboard */}
        <div className="lg:col-span-2 bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Crown size={14} className="text-amber-500" /> XP Leaderboard
            </h3>
          </div>
          <table className="w-full text-left whitespace-nowrap">
            <thead className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.2em] bg-white/[0.01] border-b border-white/5">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Trader</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">XP</th>
                <th className="px-5 py-3">Streak</th>
                <th className="px-5 py-3 text-right">Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">Loading leaderboard...</td></tr>
              ) : users.map((u, i) => (
                <tr key={u.id} className="hover:bg-white/[0.01] transition-none">
                  <td className="px-5 py-3 text-[11px] font-bold text-neutral-600">{i + 1}</td>
                  <td className="px-5 py-3">
                    <p className="text-[11px] font-bold text-neutral-300 uppercase">{u.full_name || "User"}</p>
                    <p className="text-[9px] text-neutral-700 font-mono">{u.email}</p>
                  </td>
                  <td className="px-5 py-3 text-[11px] font-bold text-amber-500">Lvl {u.discipline_level || 1}</td>
                  <td className="px-5 py-3 text-[11px] font-mono text-white">{(u.xp || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-[11px] text-neutral-500">{u.streak_days || 0}d</td>
                  <td className="px-5 py-3 text-right">
                    <input
                      type="number"
                      defaultValue={u.xp || 0}
                      onBlur={e => updateUserXP(u.id, parseInt(e.target.value) || 0)}
                      className="w-20 bg-[#121212] border border-white/5 rounded px-2 py-1 text-[10px] text-white text-right outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
