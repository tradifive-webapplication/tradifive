import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, ShieldAlert, AlertTriangle, TrendingDown, Target, Zap,
  CheckCircle2, Clock, Sparkles, Filter, Search, Plus, ArrowRight,
  RefreshCw, MessageSquare, Flame, Check, HelpCircle, X, ChevronDown,
  ChevronUp, Award, BarChart3, Lock, ShieldCheck, HeartPulse
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useDashboardData } from "@/hooks/useDashboardData";
import { toast } from "sonner";

interface MistakeRecord {
  id: string;
  ticket: string;
  pair: string;
  date: string;
  type: string;
  category: "Psychological" | "Risk Violation" | "Execution" | "Strategy Deviation";
  severity: "critical" | "high" | "medium" | "low";
  financialLoss: number;
  emotionalState: "Anxious" | "Greedy" | "Frustrated" | "Impatient" | "Overconfident" | "Bored";
  aiDiagnosis: string;
  aiPrescription: string;
  status: "active" | "improving" | "resolved";
}

const initialMistakes: MistakeRecord[] = [
  {
    id: "MST-101",
    ticket: "TR-849202",
    pair: "XAUUSD",
    date: "Today, 09:15 AM",
    type: "Revenge Trading & Size Doubling",
    category: "Psychological",
    severity: "critical",
    financialLoss: 580.00,
    emotionalState: "Frustrated",
    aiDiagnosis: "Following a -$65 stop loss on EURUSD, trade #849202 was opened within 3.5 minutes doubling lot size from 0.10 to 0.25. Resulted in -$580 drawdown cascade.",
    aiPrescription: "Enforce the Tradifive 15-Minute Emotional Reset Rule. Mandatory physical walk-away from terminal after any stop-loss event.",
    status: "active"
  },
  {
    id: "MST-102",
    ticket: "TR-849205",
    pair: "EURJPY",
    date: "Yesterday, 01:20 PM",
    type: "Moving Stop Loss Away (SL Widening)",
    category: "Risk Violation",
    severity: "high",
    financialLoss: 320.00,
    emotionalState: "Anxious",
    aiDiagnosis: "Stop loss was modified 2 times during active drawdown, widening risk by 22 pips. Transformed a planned $40 invalidation into a -$320 realized loss.",
    aiPrescription: "Enable Hard Stop Loss lock in Risk Guard settings. Never allow manual SL modifications away from entry price.",
    status: "improving"
  },
  {
    id: "MST-103",
    ticket: "TR-849201",
    pair: "EURUSD",
    date: "Today, 10:42 AM",
    type: "FOMO & Chasing Breakout Extension",
    category: "Execution",
    severity: "high",
    financialLoss: 426.00,
    emotionalState: "Greedy",
    aiDiagnosis: "Executed BUY order after a 3.2 ATR green M15 expansion candle with zero pullback confirmation. Price experienced immediate adverse retracement.",
    aiPrescription: "Do not buy market orders when price is >1.5 ATR away from the 20 EMA. Place limit orders at the 50% candle wick or wait for retest.",
    status: "active"
  },
  {
    id: "MST-104",
    ticket: "TR-849203",
    pair: "GBPUSD",
    date: "Today, 08:30 AM",
    type: "Premature Exit (Cutting Winners Early)",
    category: "Psychological",
    severity: "medium",
    financialLoss: 154.00,
    emotionalState: "Anxious",
    aiDiagnosis: "Closed winning trade manually at +0.65R ($85) while planned target was +2.5R ($320). Left over $235 on the table due to pull-back panic.",
    aiPrescription: "Adopt the 2-Tier Target Blueprint: Scale 50% at 1R, move stop to breakeven, and let the remaining runner reach the full target.",
    status: "improving"
  },
  {
    id: "MST-105",
    ticket: "TR-849206",
    pair: "USDJPY",
    date: "2 days ago",
    type: "Trading Illiquid Lunch Dead Zone",
    category: "Strategy Deviation",
    severity: "low",
    financialLoss: 85.00,
    emotionalState: "Bored",
    aiDiagnosis: "Executed 3 discretionary scalps between 12:15 PM and 01:10 PM EST during consolidation chop, incurring high spread drag and zero momentum.",
    aiPrescription: "Strictly restrict execution hours to London Open (08:00 - 11:30 GMT) and New York Open (13:30 - 16:30 GMT).",
    status: "resolved"
  }
];

const aiDiagnosticCards = [
  {
    id: "diag-fomo",
    title: "FOMO & Chasing Parabolic Extensions",
    tag: "High Severity",
    badgeColor: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50",
    lossImpact: "$426.00 Lost",
    occurrences: "3 occurrences this week",
    detection: "You executed 3 BUY orders on Gold and EURUSD after a 3+ standard deviation impulse candle with no pullback. All 3 suffered immediate drawdown within 4 minutes.",
    rootCause: "Fear of missing momentum and urge to participate in rapid green candles without price structure confirmation.",
    prescription: "Require price to pull back to the 9/21 EMA or 50% Fibonacci level before executing. If missed, let it go. Market provides 50+ setups daily.",
    actionRule: "Apply 60-Second Order Cooldown Rule",
    implemented: false
  },
  {
    id: "diag-revenge",
    title: "Revenge Trading & Position Size Doubling",
    tag: "Critical Severity",
    badgeColor: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/50",
    lossImpact: "$580.00 Lost",
    occurrences: "2 occurrences this week",
    detection: "Immediately following a -$65 stop loss on EURUSD, trade #849202 was triggered within 180 seconds with 2.5x normal position size, causing compounding loss.",
    rootCause: "Ego defensiveness, refusal to accept that invalidation is simply the cost of doing business in financial markets.",
    prescription: "Enforce a mandatory 15-minute screen walkaway after any stop-loss hit. Limit daily loss to 3% max.",
    actionRule: "Activate 15-Min Post-Loss Lockout",
    implemented: true
  },
  {
    id: "diag-sl-widen",
    title: "Moving Stop Loss Away (SL Widening)",
    tag: "High Severity",
    badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50",
    lossImpact: "$320.00 Lost",
    occurrences: "2 occurrences this week",
    detection: "Stop loss on USDJPY trade was dragged back by 22 pips as price drew close, transforming a controlled $40 loss into an outsized -$320 realized hit.",
    rootCause: "Denial of thesis failure and hoping the market will reverse before touching the wider boundary.",
    prescription: "Lock stop loss upon initial placement. Any trade that requires moving SL further away must be closed at market immediately.",
    actionRule: "Turn on Hard SL Lock in Risk Guard",
    implemented: false
  },
  {
    id: "diag-early-exit",
    title: "Premature Profit Taking (Cutting Winners)",
    tag: "Medium Severity",
    badgeColor: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200/50",
    lossImpact: "$235.00 Left on Table",
    occurrences: "4 occurrences this week",
    detection: "Average winning trade closed at +0.65R ($85) while planned target was +2.5R ($320). You closed manually during normal M5 retracements.",
    rootCause: "Loss aversion anxiety, fear of green balance evaporating into a breakeven or losing trade.",
    prescription: "Implement a 2-stage exit: Take 50% profit at +1R, move stop loss to breakeven + 2 pips, and allow the remaining runner to reach full target.",
    actionRule: "Adopt 2-Tier Automated TP Trailing",
    implemented: true
  }
];

export default function MistakeTracking() {
  const { isConnected } = useDashboardData();
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(initialMistakes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isScanning, setIsScanning] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>("MST-101");

  // AI Chat Assistant State
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiChatLog, setAiChatLog] = useState<{ sender: "user" | "ai"; text: string }[]>([
    {
      sender: "ai",
      text: "Hello! I am your TradiFive AI Behavioral Coach. I continuously monitor your trade logs for psychological leaks, FOMO impulses, revenge trades, and risk breaches. How can I guide your trading discipline today?"
    }
  ]);
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  // New Mistake Form State
  const [formTicket, setFormTicket] = useState("TR-849209");
  const [formPair, setFormPair] = useState("XAUUSD");
  const [formType, setFormType] = useState("FOMO & Chasing Breakout Extension");
  const [formCategory, setFormCategory] = useState<MistakeRecord["category"]>("Psychological");
  const [formSeverity, setFormSeverity] = useState<MistakeRecord["severity"]>("high");
  const [formLoss, setFormLoss] = useState("120.00");
  const [formEmotion, setFormEmotion] = useState<MistakeRecord["emotionalState"]>("Greedy");
  const [formNotes, setFormNotes] = useState("");

  // Daily Commitments Checklist
  const [commitments, setCommitments] = useState([
    { id: 1, text: "Risk strictly ≤ 1.5% of total equity per individual setup", done: true },
    { id: 2, text: "Mandatory hard Stop Loss entered at initial order submission", done: true },
    { id: 3, text: "15-minute mandatory screen walkaway after any stop-loss event", done: false },
    { id: 4, text: "Wait for candle close before entering breakout confirmation", done: true },
    { id: 5, text: "Never drag or widen Stop Loss away from entry price", done: false },
    { id: 6, text: "Terminal shutdown for the day upon 3 consecutive losses", done: true }
  ]);

  const toggleCommitment = (id: number) => {
    setCommitments(prev =>
      prev.map(c => c.id === id ? { ...c, done: !c.done } : c)
    );
  };

  const handleScanTrades = () => {
    setIsScanning(true);
    toast.info("AI Cognitive Scanner scanning recent trade executions...", {
      description: "Analyzing timestamps, slippage, lot escalations, and R:R ratios."
    });
    setTimeout(() => {
      setIsScanning(false);
      toast.success("AI Behavioral Audit Completed!", {
        description: "Discipline Health Score: 82/100. Identified 4 behavioral patterns with actionable prescriptions."
      });
    }, 1400);
  };

  const handleAskAi = (presetQuestion?: string) => {
    const q = presetQuestion || aiQuestion;
    if (!q.trim()) return;

    const userMsg = q;
    setAiChatLog(prev => [...prev, { sender: "user", text: userMsg }]);
    if (!presetQuestion) setAiQuestion("");
    setIsAiAnswering(true);

    setTimeout(() => {
      let aiReply = "";
      const lower = userMsg.toLowerCase();
      if (lower.includes("fomo") || lower.includes("chasing")) {
        aiReply = "To defeat FOMO: 1) Remember that a missed trade costs $0, while a chased trade frequently costs your max stop loss. 2) Set price alerts at the 50% pullback of the impulse candle instead of staring at the 1-minute chart. 3) Adopt the '5-Minute Candle Rule'—never click BUY or SELL during an open candle extreme.";
      } else if (lower.includes("loss") || lower.includes("revenge") || lower.includes("drawdown")) {
        aiReply = "Post-Loss Protocol: When a stop-loss is triggered, your amygdala experiences physical stress similar to physical pain. 1) Stand up from your chair immediately. 2) Walk to get a glass of cold water for 10 minutes. 3) Log the trade invalidation as a business expense. Only return to the terminal once your resting heart rate is completely calm.";
      } else if (lower.includes("winner") || lower.includes("let run") || lower.includes("profit")) {
        aiReply = "To let winners run without anxiety: Use a 2-part exit strategy. Close 50% of your position at 1:1 Risk-to-Reward and immediately move your stop loss to entry + 1 pip. The remaining 50% is now completely risk-free 'house money', eliminating the fear of giving back profit!";
      } else if (lower.includes("checklist") || lower.includes("routine")) {
        aiReply = "Pre-Market AI Discipline Checklist:\n1. Check ForexFactory / Economic Calendar for Red Folder news.\n2. Identify Key HTF (H4/D1) Support & Resistance.\n3. Verify max daily loss limit in Tradifive Risk Guard.\n4. Take 3 deep breaths and repeat: 'I execute my edge, the outcome of any single trade is random.'";
      } else {
        aiReply = `AI Analysis: For ${userMsg}, the key is pre-defining your invalidation level before you ever look at potential profits. Professional trading is strictly risk management—profits are merely the byproduct of consistent, emotionless execution. Would you like me to enable automated Risk Guard limits for this?`;
      }

      setAiChatLog(prev => [...prev, { sender: "ai", text: aiReply }]);
      setIsAiAnswering(false);
    }, 1000);
  };

  const handleCreateMistake = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: MistakeRecord = {
      id: `MST-${Math.floor(100 + Math.random() * 900)}`,
      ticket: formTicket,
      pair: formPair,
      date: "Just now",
      type: formType,
      category: formCategory,
      severity: formSeverity,
      financialLoss: parseFloat(formLoss) || 50,
      emotionalState: formEmotion,
      aiDiagnosis: formNotes || "Discretionary execution violated pre-defined strategy rules under emotional impulse.",
      aiPrescription: "Enforce mandatory rule adherence and lock lot sizing for next 3 sessions.",
      status: "active"
    };

    setMistakes(prev => [newRecord, ...prev]);
    setShowLogModal(false);
    toast.success("Mistake Logged & Analyzed by AI", {
      description: "AI Diagnostic Prescription generated. Added to your behavioral audit ledger."
    });
    setFormNotes("");
  };

  const toggleStatus = (id: string) => {
    setMistakes(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        const nextStatus: MistakeRecord["status"] =
          m.status === "active" ? "improving" : m.status === "improving" ? "resolved" : "active";
        return { ...m, status: nextStatus };
      })
    );
    toast.success("Status Updated");
  };

  // Filtered Mistakes
  const filteredMistakes = mistakes.filter(m => {
    if (selectedCategory !== "ALL" && m.category !== selectedCategory) return false;
    if (selectedSeverity !== "ALL" && m.severity !== selectedSeverity) return false;
    if (selectedStatus !== "ALL" && m.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.ticket.toLowerCase().includes(q) ||
        m.pair.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.aiDiagnosis.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalMistakeLoss = mistakes.reduce((sum, m) => sum + m.financialLoss, 0);
  const activeCount = mistakes.filter(m => m.status === "active").length;
  const resolvedCount = mistakes.filter(m => m.status === "resolved").length;

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-16 px-4 sm:px-6 md:px-8 font-sans">

        {/* ── TOP HEADER (Tradifive Systemic Style) ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-[28px] sm:text-[32px] font-bold text-slate-900 dark:text-white tracking-tight leading-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                AI Mistake Tracking &amp; Behavioral Coach
              </h1>
              <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-indigo-500/20 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                AI Cognitive Guard Active
              </span>
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal mt-2 max-w-3xl">
              Real-time AI diagnostic guidance identifying execution traps, emotional triggers, and capital leaks to instill iron trading discipline.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleScanTrades}
              disabled={isScanning}
              className="inline-flex items-center gap-2 h-[38px] px-3.5 rounded-[14px] border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className={`w-3.5 h-3.5 text-indigo-500 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Scanning Journal..." : "AI Scan My Trades"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLogModal(true)}
              className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[14px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/10 dark:shadow-none text-slate-700 dark:text-slate-200 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-500" />
              <span>Log Mistake</span>
            </button>
          </div>
        </div>

        {/* ── 4 KPI BEHAVIORAL ANALYTICS BOXES ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* 1. Discipline Health Score */}
          <div className="h-[125px] px-5 py-4 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none flex flex-col justify-between transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Discipline Health
              </p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <HeartPulse className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-1.5 leading-none">
                <h3 className="text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                  82<span className="text-sm font-normal text-slate-400">/100</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  +6% this week
                </span>
              </div>
              <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/50">
                GRADE A-
              </span>
            </div>
          </div>

          {/* 2. Capital Lost to Mistakes */}
          <div className="h-[125px] px-5 py-4 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none flex flex-col justify-between transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Cost of Mistakes
              </p>
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4 text-rose-500" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-[26px] font-medium text-rose-600 dark:text-rose-400 tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                  -${totalMistakeLoss.toFixed(2)}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Preventable Capital Drain</p>
              </div>
              <span className="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200/50">
                {activeCount} Active
              </span>
            </div>
          </div>

          {/* 3. Top Pitfall Trap */}
          <div className="h-[125px] px-5 py-4 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none flex flex-col justify-between transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Primary Pitfall
              </p>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
                  FOMO / Chasing
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">38% of Total Error Loss</p>
              </div>
              <span className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200/50">
                ALERT
              </span>
            </div>
          </div>

          {/* 4. Discipline Streak */}
          <div className="h-[125px] px-5 py-4 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none flex flex-col justify-between transition-all">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Discipline Streak
              </p>
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-1.5 leading-none">
                <h3 className="text-[26px] font-medium text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                  4 Days
                </h3>
                <span className="text-[11px] font-bold text-slate-400">
                  Clean Streak
                </span>
              </div>
              <span className="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200/50">
                1 DAY TO BRONZE
              </span>
            </div>
          </div>
        </div>

        {/* ── AI COGNITIVE SCANNER: IDENTIFIED PATTERNS & PRESCRIPTIONS ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  TradiFive AI Cognitive Mistake Scanner &amp; Prescriptions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Autonomous pattern detection with actionable psychological and execution remedies
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiDiagnosticCards.map((card) => (
              <div
                key={card.id}
                className="p-5 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${card.badgeColor}`}>
                      {card.tag}
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-500">
                      {card.lossImpact}
                    </span>
                  </div>

                  <h4 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                    {card.title}
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-100/70 dark:bg-white/[0.03] p-3 rounded-xl border border-slate-200/50 dark:border-white/5">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                        AI Telemetry Detection
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {card.detection}
                      </p>
                    </div>

                    <div className="bg-indigo-50/50 dark:bg-indigo-500/5 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
                      <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 block mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Prescription &amp; Safe Action
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {card.prescription}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {card.occurrences}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      toast.success(`Activated rule: ${card.actionRule}`, {
                        description: "Safeguard rule added to your active Risk Guard monitor."
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <span>{card.actionRule}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── INTERACTIVE AI BEHAVIORAL COPILOT CHAT ── */}
        <div className="p-5 sm:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">
                  Ask Your TradiFive AI Behavioral Coach
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ask how to overcome specific emotional hurdles, FOMO impulses, or trade execution barriers
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              COACH ONLINE
            </span>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">
              Quick Inquiries:
            </span>
            {[
              "How do I eliminate FOMO during breakout pumps?",
              "What is the exact post-loss routine after 2 losses?",
              "How do I stop cutting my winners early?",
              "Give me a 4-step pre-market discipline checklist"
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleAskAi(chip)}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-all shrink-0 cursor-pointer border border-slate-200/50 dark:border-white/5"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="bg-white dark:bg-black/30 rounded-2xl border border-slate-200/70 dark:border-white/10 p-4 max-h-[280px] overflow-y-auto space-y-3">
            {aiChatLog.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-[#282828] text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-white/5 whitespace-pre-line"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isAiAnswering && (
              <div className="flex items-center gap-2 text-xs text-indigo-500 font-semibold italic">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>TradiFive AI Coach is formulating personalized guidance...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAi();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Ask AI Coach: e.g., 'How do I handle hesitation when taking my A+ setup?'"
              className="flex-1 h-10 px-4 rounded-xl bg-white dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
            />
            <button
              type="submit"
              disabled={isAiAnswering || !aiQuestion.trim()}
              className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>Ask Coach</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* ── DAILY COMMITMENTS CHECKLIST & DISCIPLINE CONTRACT ── */}
        <div className="p-5 sm:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Trading Discipline Contract
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {commitments.filter(c => c.done).length} of {commitments.length} Rules Honored Today
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {commitments.map((c) => (
              <div
                key={c.id}
                onClick={() => toggleCommitment(c.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  c.done
                    ? "bg-emerald-50/40 dark:bg-emerald-500/5 border-emerald-200/60 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-300"
                    : "bg-white dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                    c.done
                      ? "bg-emerald-500 text-white"
                      : "border border-slate-300 dark:border-white/20"
                  }`}
                >
                  {c.done && <Check className="w-3 h-3" />}
                </div>
                <span className="text-xs font-medium leading-snug">
                  {c.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── MISTAKE AUDIT LEDGER TABLE ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Logged Behavioral Incidents &amp; Trade Violations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed audit trail of all tagged mistakes, psychological states, and resolution milestones
              </p>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mistakes..."
                  className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-white dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-white/10 text-xs font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-8 px-2 rounded-lg bg-white dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="Psychological">Psychological</option>
                <option value="Risk Violation">Risk Violation</option>
                <option value="Execution">Execution</option>
                <option value="Strategy Deviation">Strategy Deviation</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-8 px-2 rounded-lg bg-white dark:bg-[#1E1E1E] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active Pattern</option>
                <option value="improving">Improving</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Trade / Incident</th>
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Mistake Type &amp; Category</th>
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Emotional State</th>
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Capital Loss</th>
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">AI Guidance &amp; Prescription</th>
                    <th className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredMistakes.map((record) => {
                    const isExpanded = expandedId === record.id;
                    return (
                      <React.Fragment key={record.id}>
                        <tr
                          onClick={() => setExpandedId(isExpanded ? null : record.id)}
                          className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors cursor-pointer ${
                            isExpanded ? "bg-slate-50/80 dark:bg-white/[0.03]" : ""
                          }`}
                        >
                          <td className="px-5 py-4">
                            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 block">
                              #{record.ticket}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {record.pair} · {record.date}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {record.type}
                            </p>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              {record.category}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50">
                              {record.emotionalState}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                              -${record.financialLoss.toFixed(2)}
                            </span>
                          </td>

                          <td className="px-5 py-4 max-w-md">
                            <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1 font-medium">
                              {record.aiPrescription}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStatus(record.id);
                              }}
                              className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                                record.status === "active"
                                  ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50"
                                  : record.status === "improving"
                                  ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50"
                                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50"
                              }`}
                            >
                              {record.status}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="p-0 border-t-0">
                              <div className="bg-slate-50/70 dark:bg-black/25 px-6 py-4 border-b border-slate-100 dark:border-white/5 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                  <div className="p-3 bg-white dark:bg-white/[0.03] rounded-xl border border-slate-200/60 dark:border-white/5">
                                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                                      AI Diagnosis &amp; Root Cause Analysis
                                    </span>
                                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                                      {record.aiDiagnosis}
                                    </p>
                                  </div>

                                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
                                    <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 block mb-1">
                                      AI Personalized Coaching Prescription
                                    </span>
                                    <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                                      {record.aiPrescription}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* ── MODAL: LOG NEW MISTAKE ── */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Plus size={18} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Log Behavioral Error for AI Audit
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateMistake} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold uppercase text-[10px] text-slate-400 block mb-1">
                      Ticket ID
                    </label>
                    <input
                      type="text"
                      value={formTicket}
                      onChange={(e) => setFormTicket(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-extrabold uppercase text-[10px] text-slate-400 block mb-1">
                      Pair / Instrument
                    </label>
                    <input
                      type="text"
                      value={formPair}
                      onChange={(e) => setFormPair(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-extrabold uppercase text-[10px] text-slate-400 block mb-1">
                    Mistake Classification
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-medium"
                  >
                    <option value="FOMO & Chasing Breakout Extension">FOMO &amp; Chasing Breakout Extension</option>
                    <option value="Revenge Trading & Size Doubling">Revenge Trading &amp; Size Doubling</option>
                    <option value="Moving Stop Loss Away (SL Widening)">Moving Stop Loss Away (SL Widening)</option>
                    <option value="Premature Exit (Cutting Winners Early)">Premature Exit (Cutting Winners Early)</option>
                    <option value="Trading Illiquid Lunch Dead Zone">Trading Illiquid Lunch Dead Zone</option>
                    <option value="Overleveraging Position Size">Overleveraging Position Size</option>
                    <option value="Hesitation & Missing A+ Setup">Hesitation &amp; Missing A+ Setup</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold uppercase text-[10px] text-slate-400 block mb-1">
                      Emotional State
                    </label>
                    <select
                      value={formEmotion}
                      onChange={(e) => setFormEmotion(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-medium"
                    >
                      <option value="Anxious">Anxious</option>
                      <option value="Greedy">Greedy</option>
                      <option value="Frustrated">Frustrated</option>
                      <option value="Impatient">Impatient</option>
                      <option value="Overconfident">Overconfident</option>
                      <option value="Bored">Bored</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-extrabold uppercase text-[10px] text-slate-400 block mb-1">
                      Financial Loss ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formLoss}
                      onChange={(e) => setFormLoss(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-extrabold uppercase text-[10px] text-slate-400 block mb-1">
                    Trader Reflection &amp; Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="What triggered this mistake? What thought process led you to deviate from your rulebook?"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm"
                  >
                    Save &amp; Generate AI Prescription
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
