import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Command } from "lucide-react";

export default function FiAlgoAdminDashboard() {
  const navigate = useNavigate();

  const [strategies] = useState([
    { id: 1, name: "Gold Scalper Pro (V1)", email: "xauusd.algo@tradifive.in", tier: "PRO ACTIVE", date: "16 Nov" },
    { id: 2, name: "Euro Momentum Titan", email: "eurusd.algo@tradifive.in", tier: "ELITE ACTIVE", date: "15 Nov" },
    { id: 3, name: "US30 Wall Street Breakout", email: "us30.algo@tradifive.in", tier: "PRO ACTIVE", date: "14 Nov" },
    { id: 4, name: "BTC Intraday Arbitrage", email: "btcusd.algo@tradifive.in", tier: "TRIAL ACTIVE", date: "12 Nov" },
  ]);

  const stats = [
    { label: "Gross Yield (M)", value: "₹48,250" },
    { label: "Confirmed Nodes", value: "4" },
    { label: "Standard ARPU", value: "₹1,299" },
  ];

  const secondaryStats = [
    { label: "Win Ratio %", value: "78.4%" },
    { label: "Execution Latency", value: "12 ms" },
    { label: "Peak Drawdown", value: "-0.65%" },
  ];

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto w-full font-sans select-none text-[#E5E5E5]">
      {/* ── Top Header (Exact Match to Admin App Image 1) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">
            Finance Terminal
          </h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
            Cashflow Monitoring
          </p>
        </div>
      </div>

      {/* ── 3 Metric Boxes (Exact Match to Admin App Image 1) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-4 transition-colors hover:border-white/10"
          >
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-1">
              {s.label}
            </p>
            <p className="text-base sm:text-lg font-bold text-white uppercase">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Secondary 3 Metric Boxes ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {secondaryStats.map((s) => (
          <div
            key={s.label}
            className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 sm:p-4 transition-colors hover:border-white/10"
          >
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-1">
              {s.label}
            </p>
            <p className="text-base sm:text-lg font-bold text-white uppercase">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Subscription Registry Box (Exact Match to Admin App Image 1) ── */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="p-3.5 sm:p-4 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            Subscription Registry
          </h2>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-white/5">
          {strategies.map((p) => (
            <div key={p.id} className="p-3.5 space-y-2 hover:bg-white/[0.01]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-white uppercase truncate">{p.name}</p>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest shrink-0">
                  {p.tier}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                <span className="truncate">{p.email}</span>
                <span className="shrink-0 text-neutral-500">{p.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View Table (Exact Match to Image 1) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.2em] bg-white/[0.01] border-b border-white/5">
              <tr>
                <th className="px-5 py-3.5">Subscriber</th>
                <th className="px-5 py-3.5">Tier</th>
                <th className="px-5 py-3.5 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {strategies.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate("/auto-trade/dashboard")}
                  className="hover:bg-white/[0.01] transition-none group cursor-pointer"
                >
                  <td className="px-5 py-3">
                    <p className="text-[11px] font-bold text-neutral-300 uppercase">{p.name}</p>
                    <p className="text-[9px] text-neutral-500 font-mono">{p.email}</p>
                  </td>
                  <td className="px-5 py-3 text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                    {p.tier}
                  </td>
                  <td className="px-5 py-3 text-right text-[10px] text-neutral-500 uppercase">
                    {p.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Floating Action Buttons (Exact Match to Image 1 Bottom-Right) ── */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-50">
        <button
          className="w-10 h-10 rounded-full bg-[#18181A] hover:bg-[#202024] border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer"
          title="Internal Messaging"
        >
          <MessageSquare size={16} />
        </button>
        <button
          onClick={() => navigate("/auto-trade/dashboard")}
          className="w-10 h-10 rounded-full bg-[#18181A] hover:bg-[#202024] border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer"
          title="Quick Commands"
        >
          <Command size={16} />
        </button>
      </div>
    </div>
  );
}
