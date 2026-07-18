import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Calendar,
  ChevronRight,
  Zap,
  CreditCard,
  Info,
  Banknote,
  Globe,
  Activity,
  X,
  ShieldCheck,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useCompetitionsData } from "@/hooks/useCompetitionsData";

export default function CompetitionsDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Competition list");
  const [showModal, setShowModal] = useState(false);
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const [modalTab, setModalTab] = useState("prizes");

  const { loading, competitions, enrolledIds, enrollInCompetition } = useCompetitionsData();

  const openDetails = (comp: any) => {
    setSelectedComp(comp);
    setModalTab("prizes");
    setShowModal(true);
  };

  const tabs = ["Competition list", "Upcoming", "In progress", "Finished"];

  const filteredComps =
    filter === "Competition list"
      ? competitions
      : competitions.filter((c) => c.status === filter);

  const statusBadge = (status: string) => {
    if (status === "Upcoming")
      return "bg-orange-50 text-orange-600 dark:bg-orange-950/20";
    if (status === "In progress")
      return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20";
    return "bg-slate-100 text-slate-500 dark:bg-slate-800";
  };

  const statusLabel = (status: string) =>
    status === "In progress" ? "Active" : status;

function CompetitionsDashboardSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full space-y-8 select-none animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="w-full h-[180px] rounded-[24px] bg-slate-200 dark:bg-slate-800/80" />

      {/* Tab Navigation Skeleton */}
      <div className="flex justify-center">
        <div className="h-10 w-80 bg-slate-200 dark:bg-slate-800/80 rounded-2xl" />
      </div>

      {/* Heads up banner skeleton */}
      <div className="h-14 w-full bg-slate-200 dark:bg-slate-800/80 rounded-[22px]" />

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-[22px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-sm min-h-[380px] flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800/80 rounded" />
              <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
            </div>
            <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800/80 rounded mt-4" />
            <div className="space-y-3 mt-4">
              <div className="h-12 w-full bg-slate-200 dark:bg-slate-800/80 rounded-xl" />
              <div className="h-12 w-full bg-slate-200 dark:bg-slate-800/80 rounded-xl" />
            </div>
            <div className="h-10 w-full bg-slate-200 dark:bg-slate-800/80 rounded-lg mt-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

  if (loading) {
    return (
      <DashboardLayout>
        <CompetitionsDashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full font-sans pb-32 space-y-8">

        {/* ── HERO BANNER ── */}
        <div className="w-full h-[180px] rounded-[24px] relative overflow-hidden bg-black shadow-lg">
          <div className="absolute inset-0 bg-[#0a0a0f]" />
          <div
            className="absolute inset-0 opacity-40 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent z-10" />

          <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-8">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mb-3">
              Global Arena
            </p>
            <h1 className="text-[34px] font-bold text-white tracking-tight leading-none mb-4">
              Monthly Competitions
            </h1>
            <p className="max-w-2xl text-white/50 font-medium text-[14px] leading-relaxed">
              Win big every month in Tradifive Trading Competition! Unleash your
              trading potential, win cash prizes, and earn Challenge accounts.
            </p>
          </div>

          <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-20 pointer-events-none">
            <Globe size={160} className="text-slate-200 animate-pulse" />
          </div>
        </div>

        {/* ── TAB NAVIGATION ── */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] rounded-2xl border-2 border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none p-1.5 flex gap-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-6 py-2 rounded-xl text-[11px] font-bold transition-all ${
                  filter === t
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── HEADS UP BANNER ── */}
        <div className="p-6 rounded-[22px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-500 flex items-center justify-center shrink-0">
            <Info size={14} />
          </div>
          <p className="text-[12px] text-slate-400 font-medium">
            <span className="text-orange-600 font-bold">Heads up!</span>{" "}
            Competition Accounts activate on the 1st of each month.
          </p>
        </div>

        {/* ── COMPETITION CARDS ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredComps.map((comp, i) => (
                <motion.div
                  key={comp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="p-5 rounded-[22px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none transition-all flex flex-col justify-between min-h-[380px]"
                >
                  {/* Card header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 flex items-center justify-center shrink-0">
                        <Trophy size={13} strokeWidth={2.5} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                        Entry
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${statusBadge(comp.status)}`}
                    >
                      {statusLabel(comp.status)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[18px] font-bold text-slate-800 dark:text-white tracking-tight leading-tight mt-2">
                    {comp.title}
                  </h3>

                  {/* Info rows */}
                  <div className="space-y-2 mt-3">
                    {/* Dates */}
                    <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-2 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/10 text-indigo-600 flex items-center justify-center shrink-0">
                        <Calendar size={13} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                          Duration
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold truncate">
                          {comp.start} → {comp.end}
                        </p>
                      </div>
                    </div>

                    {/* Prize */}
                    <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-2 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/10 text-indigo-600 flex items-center justify-center shrink-0">
                        <CreditCard size={13} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                          Prize Pool
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold truncate">
                          {comp.prize}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2B2B2F] space-y-3">
                    {/* Time remaining */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                        {comp.timeLabel}
                      </span>
                      {comp.timeLeft ? (
                        <span className="text-[13px] font-bold text-slate-800 dark:text-white tabular-nums">
                          {comp.timeLeft.days}D {comp.timeLeft.hours}H
                        </span>
                      ) : (
                        <span className="text-[11.5px] font-bold text-slate-600 dark:text-slate-300">
                          {comp.finishedDate}
                        </span>
                      )}
                    </div>

                    {/* Buttons row */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openDetails(comp)}
                        className="w-full border border-slate-200 dark:border-[#333333] text-slate-600 dark:text-slate-400 text-[10px] font-bold py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#252528] transition-all flex items-center justify-center gap-1 active:scale-95"
                      >
                        <Info size={11} /> Details
                      </button>
                      {comp.status !== "Finished" ? (
                        enrolledIds.includes(comp.id) ? (
                          <button
                            onClick={() =>
                              navigate(`/competitions/challenge/${comp.id}`)
                            }
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-2 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1"
                          >
                            <Globe size={11} /> Launch
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              const ok = await enrollInCompetition(
                                comp.id,
                                comp.title,
                                comp.status,
                                comp.start,
                                comp.end,
                                comp.prize
                              );
                              if (ok) {
                                navigate(`/competitions/challenge/${comp.id}`);
                              }
                            }}
                            className="w-full border border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all active:scale-95 flex items-center justify-center gap-1"
                          >
                            <Globe size={11} /> Enroll
                          </button>
                        )
                      ) : (
                        <div className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1 cursor-not-allowed">
                          Finished
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── DETAILS MODAL ── */}
        <AnimatePresence>
          {showModal && selectedComp && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-[850px] rounded-[28px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_8px_30px_rgba(0,0,0,0.18)] relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="p-8 pb-5 text-center relative border-b border-slate-100 dark:border-[#2B2B2F]">
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-7 right-8 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all p-2 hover:bg-slate-100 dark:hover:bg-[#2B2B2F] rounded-full"
                  >
                    <X size={20} />
                  </button>
                  <h2 className="text-[25px] font-semibold text-slate-800 dark:text-white tracking-tight leading-none mb-1">
                    {selectedComp.title}
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Competition Parameters
                  </p>
                </div>

                {/* Modal Tabs */}
                <div className="px-8 pt-6 pb-2">
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] rounded-2xl border-2 border-white dark:border-white/5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none p-1.5 flex gap-1">
                      <button
                        onClick={() => setModalTab("prizes")}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[11px] font-bold transition-all ${
                          modalTab === "prizes"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                      >
                        <Trophy size={13} /> Prize Pool
                      </button>
                      <button
                        onClick={() => setModalTab("rules")}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[11px] font-bold transition-all ${
                          modalTab === "rules"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                      >
                        <ShieldCheck size={13} /> Tactical Rules
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto space-y-6 pb-10">
                  {modalTab === "prizes" ? (
                    <div className="space-y-6">
                      {/* Podium */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        {[
                          {
                            pos: "2nd Place",
                            cash: "$2k Cash",
                            acc: "100K Acc",
                            icon: Trophy,
                            color: "text-slate-400",
                            h: "h-[170px]",
                          },
                          {
                            pos: "1st Place",
                            cash: "$5k Cash",
                            acc: "100K Acc",
                            icon: Trophy,
                            color: "text-amber-500",
                            h: "h-[200px]",
                            best: true,
                          },
                          {
                            pos: "3rd Place",
                            cash: "$1k Cash",
                            acc: "100K Acc",
                            icon: Trophy,
                            color: "text-orange-500",
                            h: "h-[158px]",
                          },
                        ].map((prize) => (
                          <div
                            key={prize.pos}
                            className={`rounded-[22px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none flex flex-col justify-center items-center p-5 text-center ${prize.h} ${prize.best ? "ring-1 ring-amber-200 dark:ring-amber-500/20" : ""}`}
                          >
                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                              {prize.pos}
                            </p>
                            <prize.icon
                              size={prize.best ? 34 : 26}
                              className={`mx-auto mb-3 ${prize.color}`}
                              strokeWidth={2}
                            />
                            <p
                              className={`font-bold text-slate-800 dark:text-white mb-1 leading-none tracking-tight ${prize.best ? "text-lg" : "text-base"}`}
                            >
                              {prize.cash}
                            </p>
                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              {prize.acc}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Additional Rankings */}
                      <div className="rounded-[22px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none overflow-hidden">
                        <div className="px-6 py-3 border-b border-slate-100 dark:border-[#2B2B2F] flex items-center justify-between">
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Additional Rankings
                          </p>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Funded Accounts
                          </p>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-[#2B2B2F]">
                          {[
                            { rank: "4th – 10th", prize: "Stellar Lite – 50K" },
                            {
                              rank: "11th – 20th",
                              prize: "Stellar Lite – 25K",
                            },
                            {
                              rank: "21st – 50th",
                              prize: "Tradifive Elite – 1yr",
                            },
                          ].map((row) => (
                            <div
                              key={row.rank}
                              className="flex items-center justify-between px-6 py-4"
                            >
                              <span className="text-[12px] text-slate-400 font-medium">
                                {row.rank}
                              </span>
                              <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">
                                {row.prize}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-[12px] text-slate-400 font-medium text-center italic">
                        "Adhere to these institutional parameters to ensure
                        operational integrity."
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            label: "Daily Loss Limit",
                            desc: "Max 5% daily loss (incl. floating).",
                            icon: Activity,
                            iconBg:
                              "bg-red-50 dark:bg-red-950/20 text-red-500",
                          },
                          {
                            label: "Overall Loss Limit",
                            desc: "Institutional 10% maximum drawdown.",
                            icon: ShieldCheck,
                            iconBg:
                              "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600",
                          },
                          {
                            label: "Minimum Days",
                            desc: "Requirement of 5 active trading days.",
                            icon: Calendar,
                            iconBg:
                              "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600",
                          },
                          {
                            label: "News Trading",
                            desc: "Full tactical clearance during events.",
                            icon: Globe,
                            iconBg:
                              "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600",
                          },
                          {
                            label: "Asset Commissions",
                            desc: "$3/lot Forex. Zero fee for Indices.",
                            icon: Banknote,
                            iconBg:
                              "bg-orange-50 dark:bg-orange-950/20 text-orange-500",
                          },
                        ].map((rule) => (
                          <div
                            key={rule.label}
                            className="rounded-[22px] border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none p-5 flex items-center gap-4"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${rule.iconBg}`}
                            >
                              <rule.icon size={14} strokeWidth={2} />
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-slate-800 dark:text-white tracking-tight mb-0.5">
                                {rule.label}
                              </p>
                              <p className="text-[12px] text-slate-400 font-medium">
                                {rule.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
