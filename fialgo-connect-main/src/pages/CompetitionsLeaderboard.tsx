import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Search,
  TrendingUp,
  ArrowUpRight,
  Monitor,
  SearchX,
  Target,
  ChevronDown
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

import { useCompetitionsData } from "@/hooks/useCompetitionsData";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";



export default function CompetitionsLeaderboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Monthly");

  const { getLeaderboard, competitions } = useCompetitionsData();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserProfile(session.user);
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const activeComp = competitions.find(c => c.status === "In progress") || competitions[0];
    const compId = activeComp?.id || "september-2025";

    getLeaderboard(compId).then(data => {
      setLeaderboard(data && data.length > 0 ? data : []);
      setLoading(false);
    });
  }, [competitions]);

  const filteredData = useMemo(() => {
    return leaderboard.filter(t =>
      t.trader.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, leaderboard]);

  return (
    <DashboardLayout>
      <div className="flex-1 bg-[#F8F9FD] dark:bg-[#0d0d0f] overflow-y-auto no-scrollbar -m-10 relative">
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto pb-40">

          {/* COMPACT HEADER SECTION */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-200 tracking-tight flex items-center gap-3">
                Leaderboard <span className="text-[10px] font-black uppercase text-purple-500 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 rounded-lg">Real-time</span>
              </h1>

              {/* Tight Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search trader..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#333333] pl-10 pr-6 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-indigo-500/10 text-[12px] font-bold w-[240px] shadow-sm transition-all"
                />
              </div>
            </div>

            {/* TIGHT TABS */}
            <div className="flex justify-center">
              <div className="bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-[#333333] p-1 rounded-full flex gap-1 shadow-sm">
                {["Monthly", "Weekly", "Special"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-10 py-2.5 rounded-full text-[12px] font-bold transition-all ${activeTab === t
                        ? "bg-purple-100 dark:bg-purple-600/20 text-purple-600 shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STANDARDIZED TOP 3 CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 0, 2].map((idx) => {
              const item = leaderboard[idx];
              if (!item) return null;

              const isFirst = item.rank === 1;
              return (
                <div key={item.id} className={`bg-white dark:bg-[#1E1E1E] rounded-[32px] p-8 border border-white dark:border-[#333333] shadow-sm hover:shadow-xl transition-all flex flex-col items-center relative group ${isFirst ? 'ring-1 ring-purple-100/50' : ''}`}>
                  <div className="relative mb-5">
                    <Link to={`/user/${item.trader.replace('@', '')}`} className={`block w-28 h-28 rounded-full p-1.5 border-[#D6E4FF] dark:border-[#333333] ${isFirst ? 'border-purple-400' : 'border-slate-100 dark:border-[#333333]'} shadow-lg group-hover:scale-105 transition-transform duration-500`}>
                      <img
                        src={"/default-avatar.svg"}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover bg-slate-50 dark:bg-[#141414]"
                      />
                    </Link>
                    <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-[#D6E4FF] dark:border-[#333333] border-white dark:border-[#333333] text-white shadow-md ${item.rank === 1 ? 'bg-amber-400' :
                        item.rank === 2 ? 'bg-slate-400' : 'bg-orange-400'
                      }`}>
                      {item.rank}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-lg">{item.country}</span>
                      <h3 className="font-black text-slate-900 dark:text-slate-200 text-[14px] uppercase tracking-tight truncate max-w-[140px]">{item.trader}</h3>
                    </div>
                    <div className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-2">Total Gain</div>
                    <div className="text-[28px] font-black text-emerald-500 tracking-tight leading-none">+{item.return}%</div>
                  </div>

                  <div className="w-full h-[1px] bg-slate-50 dark:bg-[#141414] my-6" />

                  <div className="grid grid-cols-2 w-full gap-4">
                    <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Win Rate</div>
                      <div className="font-black text-slate-900 dark:text-slate-200 text-[13px]">{item.winRate}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Equity</div>
                      <div className="font-black text-slate-900 dark:text-slate-200 text-[13px]">{item.equity}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* STANDARDIZED ANALYTICS TABLE */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-[32px] border border-white dark:border-[#333333] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-[#1E1E1E]/50 border-b border-slate-50 dark:border-white/5 dark:border-white/5">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trader</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Size</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Gain</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Drawdown</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-[#333333]">
                  {filteredData.slice(3).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-[#222222]/50 transition-colors group">
                      <td className="px-8 py-5">
                        <span className="font-black text-slate-300 text-[13px]">#{item.rank}</span>
                      </td>
                      <td className="px-6 py-5">
                        <Link to={`/user/${item.trader.replace('@', '')}`} className="flex items-center gap-3 hover:opacity-85 transition-opacity">
                          <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-[#333333] overflow-hidden bg-slate-50 dark:bg-[#141414] p-1">
                            <img src={"/default-avatar.svg"} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-slate-200 text-[13px] hover:text-blue-500 transition-colors">{item.trader}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{item.country} Series Participant</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-slate-700 dark:text-slate-300 text-[13px]">{item.equity}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                          <span className="font-black text-emerald-500 text-[14px]">+{item.return}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-400 text-[13px]">
                        {item.maxDD}%
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="inline-flex items-center px-4 py-1 rounded-full bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] font-bold text-[11px] text-slate-700 dark:text-slate-300">
                          {item.winRate}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* STANDARDIZED STICKY BAR */}
        <div className="fixed bottom-0 left-[260px] right-0 z-50 p-6 bg-gradient-to-t from-white dark:from-[#0d0d0f] via-white dark:via-[#0d0d0f] to-transparent">
          <div className="max-w-[1100px] mx-auto">
            <div className="bg-slate-900 rounded-[28px] p-5 shadow-2xl flex items-center justify-between border border-white/5 px-10">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center font-black text-white text-[11px]">
                    {userProfile?.user_metadata?.display_name 
                      ? userProfile.user_metadata.display_name.split(' ').map((n: any) => n[0]).join('') 
                      : userProfile?.email 
                        ? userProfile.email.substring(0, 2).toUpperCase() 
                        : "NH"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-[14px]">
                      {userProfile?.user_metadata?.display_name || userProfile?.email || "Trader"}
                    </span>
                    <span className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] italic">Platinum Rank</span>
                  </div>
                </div>
                <div className="flex gap-12 border-l border-white/10 pl-10">
                  <div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Your Rank</div>
                    <div className="text-white font-black text-2xl tracking-tight">#1,402</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1 text-emerald-400/80">Distance to Rewards</div>
                    <div className="text-emerald-400 font-black text-2xl tracking-tight">+4.2% <span className="text-[10px] opacity-50 ml-0.5 tracking-normal">Gain Required</span></div>
                  </div>
                </div>
              </div>

              <button className="bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-2xl">
                <Monitor size={16} />
                Open Terminal
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}








