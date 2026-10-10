import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  Server,
  Hash,
  Lock,
  BarChart3,
  ExternalLink,
  Target,
  Clock,
  PieChart,
  BookOpen,
  User,
  Monitor,
  Globe,
  Search,
  Banknote,
  Gift
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { useCompetitionsData } from "@/hooks/useCompetitionsData";



export default function ChallengeConsole() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "Your Profile");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { getCompetitionDetails, getLeaderboard } = useCompetitionsData();
  const [competition, setCompetition] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [compLoading, setCompLoading] = useState(true);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (!id) return;
    setCompLoading(true);
    Promise.all([
      getCompetitionDetails(id),
      getLeaderboard(id)
    ]).then(([details, lb]) => {
      if (details) {
        setCompetition(details);
      } else {
        // Fallback placeholder
        setCompetition({
          name: id.replace(/-/g, " ").toUpperCase() + " Tournament",
          rank: 42,
          userName: "Trader",
          currentBalance: 104200,
          initialBalance: 100000,
          traderTier: "Platinum Participant",
          credentials: {
            login: "8823419",
            password: "MasterPassword2026!",
            server: "Tradifive-Live-01",
            platform: "MetaTrader 5"
          },
          countdown: { days: 11, hours: 19, mins: 48, secs: 14 },
          stats: {
            equity: 104200,
            return: 4.2,
            tradingDays: 3,
            dailyDownLimit: 5000,
            maxDownLimit: 10000,
            totalTrades: 124,
            lotsTraded: 42.5,
            winRate: 68,
            longPct: 62,
            shortPct: 38
          }
        });
      }

      if (lb && lb.length > 0) {
        setLeaderboard(lb);
      } else {
        setLeaderboard([]);
      }
      setCompLoading(false);
    });
  }, [id]);

  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter(t =>
      t.trader.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, leaderboard]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (compLoading || !competition) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest animate-pulse">Synchronizing Terminal...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 bg-[#F8F9FD] dark:bg-[#0d0d0f] overflow-y-auto no-scrollbar -m-10">

        {/* HERO BANNER SECTION */}
        <div className="w-full h-[220px] relative overflow-hidden bg-slate-900 border-b border-indigo-500/10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611974717537-48358a980756?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 via-transparent to-transparent opacity-30" />

          <div className="relative z-10 h-full flex flex-col items-center justify-center pt-8">
            <h1 className="text-[34px] font-black text-white uppercase tracking-tighter text-center leading-none">
              {competition.name}
            </h1>
            <p className="text-white/40 font-black uppercase text-[10px] tracking-tight mt-5 bg-white/5 px-6 py-2 rounded-full border border-white/10">
              Active Tournament Protocol // 2026.04
            </p>
          </div>
        </div>

        {/* TAB NAVIGATION (PILL-SHAPED) */}
        <div className="relative z-20 flex justify-center -mt-8">
          <div className="bg-white dark:bg-[#1E1E1E] p-2 rounded-full flex gap-2 shadow-2xl shadow-slate-200 border border-slate-100 dark:border-[#333333]">
            {["Your Profile", "Trade Analytics", "Leaderboard"].map((tab) => {
              const icons: Record<string, any> = {
                "Your Profile": User,
                "Trade Analytics": PieChart,
                "Leaderboard": Trophy
              };
              const Icon = icons[tab];

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-full flex items-center gap-3 text-[12px] font-black uppercase tracking-tight transition-all duration-300 ${activeTab === tab
                    ? "bg-slate-900 text-white shadow-xl translate-y-[-2px]"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:bg-[#141414]"
                    }`}
                >
                  <Icon size={16} />
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* COMPONENT VIEWS */}
        <div className="p-8 pb-32 max-w-[1500px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
               {activeTab === "Your Profile" && (
                <div className="space-y-10">
                  {/* ROW 1: THE COMMAND CENTER PROFILE */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="bg-[#12141d] rounded-[40px] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-6 mb-10">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full border-[#D6E4FF] dark:border-[#333333] border-indigo-500/20 p-1 bg-white/5">
                              <img src={"/default-avatar.svg"} alt="Avatar" className="w-full h-full rounded-full bg-slate-900" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#D1E4FF] dark:bg-emerald-500 rounded-full border-[#D6E4FF] dark:border-[#333333] border-[#12141d] shadow-lg animate-pulse" />
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-white/30 uppercase tracking-tight mb-2">Institutional ID</div>
                            <h2 className="text-[24px] font-bold text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{competition.userName}</h2>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-white/30 uppercase tracking-tight">Active Tournament Rank</span>
                              <span className="text-3xl font-bold text-white tracking-tighter mt-1 italic">#{competition.rank}</span>
                            </div>
                            <div className="p-3 bg-indigo-500/10 rounded-2xl">
                              <Trophy className="text-indigo-400" size={24} />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-[#D1E4FF] dark:bg-emerald-500/5 border border-[#D6E4FF] dark:border-[#333333]merald-500/10 rounded-3xl">
                              <span className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-tight block mb-2">Allocation</span>
                              <span className="text-xl font-bold text-emerald-400 tracking-tighter leading-none">${competition.currentBalance.toLocaleString()}</span>
                            </div>
                            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                              <span className="text-[10px] font-bold text-white/30 uppercase tracking-tight block mb-2">Inital</span>
                              <span className="text-xl font-bold text-white tracking-tighter leading-none">${competition.initialBalance.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#1E1E1E] rounded-[40px] p-10 shadow-sm border border-slate-100 dark:border-[#333333] relative overflow-hidden flex flex-col justify-between">
                      <div className="mb-8">
                        <h3 className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                          <ShieldCheck size={18} className="text-indigo-500" strokeWidth={2.5} /> Security Access Matrix
                        </h3>
                        <div className="space-y-4 relative z-10">
                          {[
                            { label: "Institutional Server", val: competition.credentials.server, icon: Server },
                            { label: "Trading Platform", val: competition.credentials.platform, icon: Monitor },
                            { label: "Login Protocol ID", val: competition.credentials.login, icon: Hash },
                          ].map((field) => (
                            <div key={field.label} className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-[20px] transition-all hover:bg-white dark:bg-[#1E1E1E] hover:shadow-md">
                              <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-100 dark:border-[#333333] shadow-sm">
                                  <field.icon size={16} className="text-indigo-500" strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{field.label}</span>
                                  <span className="text-slate-900 dark:text-white font-bold text-[14px]">{field.val}</span>
                                </div>
                              </div>
                              <button onClick={() => handleCopy(field.val, field.label)} className="p-2 text-slate-300 hover:text-indigo-500 transition-all hover:bg-indigo-50 rounded-lg">
                                {copiedField === field.label ? <Check size={18} strokeWidth={2.5} /> : <Copy size={18} strokeWidth={2.5} />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#1E1E1E] rounded-[40px] p-10 border border-slate-100 dark:border-[#333333] shadow-sm flex flex-col justify-center items-center relative">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-10 text-center">Protocol Expiration Countdown</div>
                      <div className="flex gap-6">
                        {[
                          { label: "Days", val: competition.countdown.days },
                          { label: "Hours", val: competition.countdown.hours },
                          { label: "Minutes", val: competition.countdown.mins },
                        ].map((t) => (
                          <div key={t.label} className="text-center group">
                            <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-xl group-hover:scale-105 transition-transform">{t.val}</div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{t.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-12 w-full pt-8 border-t border-slate-50 dark:border-white/5 dark:border-white/5">
                         <div className="flex items-center justify-between px-2">
                           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Status</span>
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-[#D1E4FF] dark:bg-emerald-500 animate-pulse" />
                             <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-tight">Active Session</span>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* ACCOUNT PERFORMANCE */}
                  <div className="bg-white dark:bg-[#1E1E1E] rounded-[40px] p-10 border border-white shadow-sm">
                    <h3 className="text-[12px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-tight mb-10 flex items-center gap-3">
                      <Activity size={18} className="text-indigo-500" /> Account Performance Matrix
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        {[
                          { label: "Current Equity", val: `$${competition.stats.equity.toLocaleString()}` },
                          { label: "Net Return", val: `+${competition.stats.return}%`, isGreen: true },
                          { label: "Active Days", val: `${competition.stats.tradingDays} Cycles` },
                        ].map((stat) => (
                          <div key={stat.label} className="flex items-center justify-between pb-6 border-b border-slate-50 dark:border-white/5 dark:border-white/5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{stat.label}</span>
                            <span className={`text-[20px] font-black tracking-tighter ${stat.isGreen ? "text-emerald-500" : "text-slate-900 dark:text-slate-200"}`}>{stat.val}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-6">
                        {[
                          { label: "Daily Threshold", val: `$${competition.stats.dailyDownLimit}`, status: "Live" },
                          { label: "Critical Limit", val: `$${competition.stats.maxDownLimit}`, status: "Live" },
                        ].map((stat) => (
                          <div key={stat.label} className="flex items-center justify-between pb-6 border-b border-slate-50 dark:border-white/5 dark:border-white/5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{stat.label}</span>
                            <div className="flex items-center gap-4">
                              <span className="px-3 py-1 rounded-lg bg-[#D1E4FF] dark:bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-[0.1em]">{stat.status}</span>
                              <span className="text-[20px] font-black text-slate-900 dark:text-slate-200 tracking-tighter">{stat.val}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Leaderboard" && (
                <div className="space-y-10">
                  {/* SEARCH BAR FOR LEADERBOARD */}
                  <div className="flex justify-center">
                    <div className="relative group w-full max-w-[440px]">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search for a trader in this tournament..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#333333] pl-16 pr-8 py-4.5 rounded-full outline-none focus:ring-4 focus:ring-indigo-500/5 text-[15px] font-bold shadow-sm transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  {/* TOP 3 PODIUM */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                    {[1, 0, 2].map((idx) => {
                      const item = leaderboard[idx];
                      if (!item) return null;
                      const isFirst = item.rank === 1;
                      return (
                        <div key={item.id} className={`bg-white dark:bg-[#1E1E1E] rounded-[40px] p-8 border border-slate-100 dark:border-[#333333] shadow-sm hover:shadow-xl transition-all flex flex-col items-center relative group ${isFirst ? 'ring-2 ring-indigo-50/50' : ''}`}>
                          <div className="relative mb-6">
                            <div className={`w-28 h-28 rounded-full p-2 border-[#D6E4FF] dark:border-[#333333] ${isFirst ? 'border-amber-400/30' : 'border-slate-50 dark:border-white/5 dark:border-white/5'} shadow-inner bg-slate-50 dark:bg-[#141414]`}>
                              <img src={"/default-avatar.svg"} alt="Avatar" className="w-full h-full rounded-full bg-white dark:bg-[#1E1E1E] shadow-sm" />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px] border-[#D6E4FF] dark:border-[#333333] border-white text-white shadow-lg ${item.rank === 1 ? 'bg-amber-400' : item.rank === 2 ? 'bg-slate-400' : 'bg-orange-400'
                              }`}>
                              {item.rank}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <span className="text-xl">{item.country}</span>
                              <h3 className="font-bold text-slate-900 dark:text-white text-[16px] uppercase tracking-tight">{item.trader}</h3>
                            </div>
                            <div className="text-[28px] font-bold text-emerald-500 tracking-tighter">+{item.return}%</div>
                            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-tight mt-1">Institutional Gain</div>
                          </div>
                          <div className="w-full h-[1px] bg-slate-50 dark:bg-[#141414] my-6" />
                          <div className="grid grid-cols-2 w-full gap-6">
                            <div className="text-center">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1.5">Win Rate</div>
                              <div className="font-bold text-slate-900 dark:text-white text-[14px]">{item.winRate}%</div>
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1.5">Equity</div>
                              <div className="font-bold text-slate-900 dark:text-white text-[14px]">{item.equity}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DATA TABLE */}
                  <div className="bg-white dark:bg-[#1E1E1E] rounded-[32px] border border-slate-100 dark:border-[#333333] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/30 border-b border-slate-50 dark:border-white/5 dark:border-white/5">
                            <th className="px-10 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Rank</th>
                            <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Trader</th>
                            <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-tight">Gain (%)</th>
                            <th className="px-6 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-tight text-right pr-10">Success</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredLeaderboard.slice(3).map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-10 py-5 font-bold text-slate-300 text-[14px]">#{item.rank}</td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                  <div className="w-11 h-11 rounded-full border border-slate-100 dark:border-[#333333] overflow-hidden bg-slate-50 dark:bg-[#141414] p-1">
                                    <img src={"/default-avatar.svg"} alt="Avatar" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 dark:text-white text-[14px]">{item.trader}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{item.country} Institutional</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-emerald-500 font-bold text-[16px] tracking-tight">+{item.return}%</td>
                              <td className="px-6 py-5 text-right pr-10">
                                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] font-bold text-[11px] text-slate-600">
                                  {item.winRate}% winrate
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Trade Analytics" && (
                <div className="bg-white dark:bg-[#1E1E1E] rounded-[40px] p-24 text-center border border-slate-100 dark:border-[#333333] shadow-sm flex flex-col items-center">
                  <div className="p-8 rounded-[32px] bg-indigo-50/50 border border-indigo-100/50 mb-10">
                    <PieChart size={48} className="text-indigo-500" />
                  </div>
                  <h3 className="text-[26px] font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Performance Analytics Engine</h3>
                  <p className="text-slate-400 font-bold text-[14px] uppercase tracking-tight max-w-[500px] leading-relaxed">Advanced charting and session breakdown metrics are currently being synced with your institutional terminal.</p>
                </div>
              )}

              {activeTab === "Rules" && (
                <div className="space-y-8">
                  {!searchParams.get('sub') ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-12">
                      <div className="text-center">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-200 tracking-tight mb-2 uppercase">Competition Information</h2>
                        <p className="text-slate-400 font-bold text-[13px] uppercase tracking-tight">Select a category to view tournament details</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[800px]">
                        <button
                          onClick={() => navigate(`/competitions/challenge/${id}?tab=Rules&sub=prizes`)}
                          className="group bg-white dark:bg-[#1E1E1E] rounded-[40px] p-12 border border-white shadow-sm hover:shadow-2xl transition-all flex flex-col items-center text-center hover:-translate-y-2"
                        >
                          <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                            <Trophy size={40} />
                          </div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-slate-200 uppercase tracking-tight mb-2">Prize Pool</h3>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">Discover the rewards, cash prizes, and funded accounts available for winners.</p>
                        </button>

                        <button
                          onClick={() => navigate(`/competitions/challenge/${id}?tab=Rules&sub=regulations`)}
                          className="group bg-slate-900 rounded-[40px] p-12 border border-white/5 shadow-2xl hover:shadow-[0_40px_80px_rgba(0,0,0,0.2)] transition-all flex flex-col items-center text-center hover:-translate-y-2"
                        >
                          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                            <BookOpen size={40} />
                          </div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Rules & Regulations</h3>
                          <p className="text-[11px] font-bold text-white/30 uppercase tracking-tight leading-relaxed">View all trading parameters, daily limits, and prohibited behavior guidelines.</p>
                        </button>
                      </div>
                    </div>
                  ) : searchParams.get('sub') === 'prizes' ? (
                    <div className="space-y-8">
                      <button
                        onClick={() => navigate(`/competitions/challenge/${id}?tab=Rules`)}
                        className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tight hover:text-slate-900 dark:text-white transition-all"
                      >
                        <ChevronLeft size={16} /> Back to Information
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900 rounded-[32px] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 translate-x-4">
                            <Trophy size={100} className="text-amber-400" />
                          </div>
                          <div className="relative z-10">
                            <div className="text-[10px] font-black text-amber-400 uppercase tracking-tight mb-2">1st Place Reward</div>
                            <h3 className="text-2xl font-black text-white italic">₹5,000 Cash</h3>
                            <p className="text-[11px] font-bold text-white/40 mt-1 uppercase tracking-tight">+ ₹300k Funded Account</p>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-[32px] p-8 border border-white shadow-sm relative overflow-hidden">
                          <div className="relative z-10">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-2">2nd - 5th Place</div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white italic">₹100k Account</h3>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tight">+ Elite Dashboard Access</p>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-[#1E1E1E] rounded-[32px] p-8 border border-white shadow-sm relative overflow-hidden">
                          <div className="relative z-10">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-2">6th - 50th Place</div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white italic">Tradifive Elite</h3>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Free Subscription for 1 Year</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <button
                        onClick={() => navigate(`/competitions/challenge/${id}?tab=Rules`)}
                        className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tight hover:text-slate-900 dark:text-white transition-all"
                      >
                        <ChevronLeft size={16} /> Back to Information
                      </button>
                      <div className="bg-white dark:bg-[#1E1E1E] rounded-[40px] p-12 border border-white shadow-sm">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-10 tracking-tight flex items-center gap-4">
                          <BookOpen className="text-indigo-500" /> Tournament Regulations
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                          <div className="space-y-10">
                            <div>
                              <h4 className="text-[11px] font-black text-indigo-500 uppercase tracking-tight mb-5">Objective Parameters</h4>
                              <div className="space-y-4">
                                <div className="p-5 bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-2xl flex items-center justify-between">
                                  <span className="text-sm font-bold text-slate-600">Daily Drawdown Limit</span>
                                  <span className="text-sm font-black text-slate-900 dark:text-white">5.0%</span>
                                </div>
                                <div className="p-5 bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-2xl flex items-center justify-between">
                                  <span className="text-sm font-bold text-slate-600">Maximum Total Loss</span>
                                  <span className="text-sm font-black text-slate-900 dark:text-white">10.0%</span>
                                </div>
                                <div className="p-5 bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-2xl flex items-center justify-between">
                                  <span className="text-sm font-bold text-slate-600">Minimum Active Days</span>
                                  <span className="text-sm font-black text-slate-900 dark:text-white">5 Days</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-slate-900 rounded-[32px] p-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
                            <h4 className="text-[11px] font-black text-white/40 uppercase tracking-tight mb-8 relative z-10">Restricted Activities</h4>
                            <ul className="space-y-6 relative z-10">
                              {[
                                "Zero Tolerance for Arbitrage",
                                "Account Proxy & Sharing Checks",
                                "Frequency Manipulation Bans"
                              ].map((rule) => (
                                <li key={rule} className="flex items-center gap-4 text-sm font-black text-white/70">
                                  <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]" /> {rule}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* PERSISTENT TERMINAL BAR (Only if not on Leaderboard) */}
        {activeTab !== "Leaderboard" && (
          <div className="fixed bottom-0 left-[260px] right-0 z-50 p-4 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none">
            <div className="max-w-[1000px] mx-auto pointer-events-auto">
              <div className="bg-white/40 backdrop-blur-2xl rounded-2xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between border border-white/60 px-8 relative overflow-hidden group">
                {/* Luminous Reflection Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />

                <div className="flex items-center gap-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border border-slate-200 dark:border-[#333333] bg-slate-900 flex items-center justify-center font-black text-white text-[10px] shadow-lg">{competition.userName ? competition.userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'T'}</div>
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-white font-bold text-[13px] tracking-tight">{competition.userName || 'Trader'}</span>
                      <span className="text-slate-500 text-[8px] font-black uppercase tracking-tight italic">Platinum Rank</span>
                    </div>
                  </div>
                  <div className="h-6 w-[1px] bg-slate-200 dark:bg-blue-500 mx-2" />
                  <div className="flex gap-8">
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Your Rank</div>
                      <div className="text-slate-900 dark:text-white font-black text-xl tracking-tighter leading-none">#1,402</div>
                    </div>
                  </div>
                </div>

                <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-tight flex items-center gap-2 hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-xl relative z-10">
                  <Monitor size={14} /> Open Terminal
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}







