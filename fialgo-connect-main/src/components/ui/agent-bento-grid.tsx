"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChatCircle,
  Brain,
  Database,
  TerminalWindow,
  Code,
  FileText,
  SlackLogo,
  NotionLogo,
  Check,
  CircleNotch,
  Clock,
  Minus,
  Globe,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────
   TradiFive Platform Bento Grid (White Editorial Mode)
   Grid: 3 cards top row · 2 cards bottom row
   ────────────────────────────────────────────────────── */

interface FeatCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function FeatCard({ title, description, children, className = "" }: FeatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex flex-col gap-2 overflow-hidden rounded-[20px] p-5",
        "bg-white border border-[#E4E4E4] hover:border-slate-300 transition-colors duration-200",
        "shadow-[0_6px_24px_-14px_rgba(15,23,42,0.06)]",
        className
      )}
    >
      <div className="z-10 flex flex-col gap-1 shrink-0">
        <h3 className="font-semibold text-slate-950 text-[15px] tracking-[-0.01em]">{title}</h3>
        <p className="text-slate-600 text-[12.5px] leading-[1.45] line-clamp-2">{description}</p>
      </div>
      <div className="relative mt-1.5 flex-1 min-h-0 w-full rounded-[14px] overflow-hidden border border-[#E4E4E4] bg-[#E4E4E4]/45 p-2.5">
        {children}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Card1 – Automated Execution & Journal Graph
   ───────────────────────────────────────────── */

type ActiveStep = "request" | "router" | "agent" | "memory" | "tools" | "response";

const VW = 300;
const VH = 190;

interface NodeConfig {
  id: string;
  x: number;
  y: number;
  icon?: React.ComponentType<{ className?: string; weight?: "fill" | "regular" | "bold" }>;
  label?: string;
  type: "box" | "circle";
}

const NODES: NodeConfig[] = [
  { id: "A", x: 46, y: 95, icon: ChatCircle, label: "MT5 FEED", type: "box" },
  { id: "Router", x: 118, y: 95, type: "circle" },
  { id: "C", x: 190, y: 95, icon: Brain, label: "TRADIFIVE", type: "box" },
  { id: "B", x: 262, y: 42, icon: Database, label: "JOURNAL", type: "box" },
  { id: "D", x: 262, y: 148, icon: TerminalWindow, label: "AI COACH", type: "box" },
];

interface FlowPath {
  id: string;
  d: string;
  activeSteps: ActiveStep[];
  colorClass: string;
}

const PATHS: FlowPath[] = [
  {
    id: "a-to-router",
    d: "M 76 95 L 106 95",
    activeSteps: ["request"],
    colorClass: "text-sky-600",
  },
  {
    id: "router-to-agent",
    d: "M 130 95 L 160 95",
    activeSteps: ["agent"],
    colorClass: "text-blue-600",
  },
  {
    id: "agent-to-memory",
    d: "M 190 67 L 190 42 L 232 42",
    activeSteps: ["memory"],
    colorClass: "text-indigo-600",
  },
  {
    id: "agent-to-tools",
    d: "M 190 123 L 190 148 L 232 148",
    activeSteps: ["tools"],
    colorClass: "text-emerald-600",
  },
  {
    id: "response-flow-1",
    d: "M 160 95 L 130 95",
    activeSteps: ["response"],
    colorClass: "text-blue-600",
  },
  {
    id: "response-flow-2",
    d: "M 106 95 L 76 95",
    activeSteps: ["response"],
    colorClass: "text-sky-600",
  },
];

const NODE_LIGHT_STYLES: Record<
  string,
  { idle: string; active: string; iconIdle: string; iconActive: string }
> = {
  A: {
    idle: "bg-white border-slate-200 text-slate-700",
    active: "bg-sky-600 border-sky-700 text-white shadow-sm",
    iconIdle: "text-sky-600",
    iconActive: "text-white",
  },
  C: {
    idle: "bg-white border-slate-200 text-slate-700",
    active: "bg-[#2563EB] border-blue-700 text-white shadow-sm",
    iconIdle: "text-[#2563EB]",
    iconActive: "text-white",
  },
  B: {
    idle: "bg-white border-slate-200 text-slate-700",
    active: "bg-indigo-600 border-indigo-700 text-white shadow-sm",
    iconIdle: "text-indigo-600",
    iconActive: "text-white",
  },
  D: {
    idle: "bg-white border-slate-200 text-slate-700",
    active: "bg-emerald-600 border-emerald-700 text-white shadow-sm",
    iconIdle: "text-emerald-600",
    iconActive: "text-white",
  },
};

export function Card1() {
  const [step, setStep] = useState<ActiveStep>("request");

  useEffect(() => {
    const steps: ActiveStep[] = ["request", "router", "agent", "memory", "tools", "response"];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % steps.length;
      setStep(steps[idx]);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const isNodeActive = (nodeId: string) => {
    switch (step) {
      case "request":
        return nodeId === "A";
      case "router":
        return nodeId === "Router";
      case "agent":
        return nodeId === "C";
      case "memory":
        return nodeId === "C" || nodeId === "B";
      case "tools":
        return nodeId === "C" || nodeId === "D";
      case "response":
        return nodeId === "C" || nodeId === "Router" || nodeId === "A";
      default:
        return false;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden select-none bg-white rounded-[10px] border border-slate-200/70 flex items-center justify-center">
      {/* Subtle architectural dot matrix on white */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden>
        <defs>
          <pattern id="light-clean-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.85" fill="currentColor" className="text-[#E4E4E4]" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#light-clean-grid)" />
      </svg>

      {/* Connector SVG & Nodes */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <path d="M 76 95 L 106 95" fill="none" stroke="currentColor" className="text-[#E4E4E4]" strokeWidth="1.5" />
        <path d="M 130 95 L 160 95" fill="none" stroke="currentColor" className="text-[#E4E4E4]" strokeWidth="1.5" />
        <path d="M 190 67 L 190 42 L 232 42" fill="none" stroke="currentColor" className="text-[#E4E4E4]" strokeWidth="1.5" />
        <path d="M 190 123 L 190 148 L 232 148" fill="none" stroke="currentColor" className="text-[#E4E4E4]" strokeWidth="1.5" />

        {PATHS.map((p) => {
          const isActive = p.activeSteps.includes(step);
          if (!isActive) return null;

          return (
            <g key={p.id}>
              <motion.path
                d={p.d}
                fill="none"
                stroke="currentColor"
                className={p.colorClass}
                strokeWidth="4"
                strokeOpacity="0.16"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.75, ease: "easeInOut" }}
              />
              <motion.path
                d={p.d}
                fill="none"
                stroke="currentColor"
                className={p.colorClass}
                strokeWidth="1.75"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.75, ease: "easeInOut" }}
              />
            </g>
          );
        })}

        {NODES.map((node) => {
          const isBox = node.type === "box";
          const w = isBox ? 56 : 24;
          const h = isBox ? 54 : 24;
          const isActive = isNodeActive(node.id);
          const styles = NODE_LIGHT_STYLES[node.id];

          return (
            <foreignObject
              key={node.id}
              x={node.x - w / 2}
              y={node.y - h / 2}
              width={w}
              height={h}
              className="overflow-visible"
            >
              <div className="w-full h-full flex items-center justify-center">
                {isBox && node.icon && styles ? (
                  <div
                    className={`w-full h-full rounded-[12px] border flex flex-col items-center justify-center transition-all duration-300 ${
                      isActive ? styles.active : styles.idle
                    }`}
                  >
                    <div className="mb-0.5 flex items-center justify-center">
                      <node.icon
                        className={`w-4 h-4 ${isActive ? styles.iconActive : styles.iconIdle}`}
                        weight="fill"
                      />
                    </div>
                    <span className="text-[7.5px] font-mono font-bold tracking-wider select-none">
                      {node.label}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-slate-300"
                    }`}
                  >
                    <motion.div
                      className={`w-2.5 h-2.5 rounded-full border border-dashed ${
                        isActive ? "border-blue-600" : "border-slate-400"
                      }`}
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    />
                  </div>
                )}
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Card2 – Live Drawdown & Win Rate Telemetry
   ───────────────────────────────────────────── */
export function Card2() {
  const bars = [42, 72, 38, 84, 62, 92, 54];
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const [activeIdx, setActiveIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev === 0 ? 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-3 justify-between">
      <div className="flex gap-3 pt-1.5 pr-1.5 pb-0.5 pl-0.5">
        {[
          { label: "Daily DD", value: "0.8%", trend: "cap 3.0%", positive: true },
          { label: "Rule Score", value: "96%", trend: "+4.2%", positive: true },
        ].map((s, i) => {
          const isActive = i === activeIdx || hoveredIdx === i;

          return (
            <div key={i} className="flex-1 h-[70px] relative select-none">
              <div
                className="absolute inset-0 rounded-xl border border-[#E4E4E4] bg-white text-[#E4E4E4]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 6px, currentColor 6px, currentColor 7px)",
                }}
              />

              <motion.div
                className="absolute inset-0 w-full h-full rounded-xl bg-white border border-[#E4E4E4] shadow-[0_4px_14px_-6px_rgba(15,23,42,0.1)] px-3 py-2.5 hover:border-blue-300 transition-colors duration-200 flex items-center justify-between gap-2 cursor-pointer"
                animate={{
                  x: isActive ? "0.35rem" : "0rem",
                  y: isActive ? "-0.35rem" : "0rem",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-slate-400 font-mono uppercase tracking-widest leading-none">
                    {s.label}
                  </span>
                  <span className="text-[16px] font-bold font-mono text-slate-900 leading-none mt-1.5 tracking-tight">
                    {s.value}
                  </span>
                  <span className="text-[8px] font-mono font-semibold text-emerald-600 mt-1.5">
                    {s.trend}
                  </span>
                </div>

                <div className="w-11 h-5 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 48 24">
                    <motion.path
                      d={
                        i === 0
                          ? "M 0 18 L 16 11 L 32 13 L 48 5"
                          : "M 0 16 L 16 12 L 32 8 L 48 4"
                      }
                      fill="none"
                      stroke="currentColor"
                      className="text-blue-600/60"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease: "easeOut" }}
                    />

                    {(i === 0
                      ? [
                          { x: 0, y: 18 },
                          { x: 16, y: 11 },
                          { x: 32, y: 13 },
                          { x: 48, y: 5 },
                        ]
                      : [
                          { x: 0, y: 16 },
                          { x: 16, y: 12 },
                          { x: 32, y: 8 },
                          { x: 48, y: 4 },
                        ]
                    ).map((pt, idx) => (
                      <motion.circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r="1.75"
                        className="fill-white stroke-[#2563EB]"
                        strokeWidth="1.2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 + idx * 0.08, duration: 0.25 }}
                      />
                    ))}
                  </svg>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Discipline Bar Chart */}
      <div className="flex-1 flex items-end gap-2 px-0.5 min-h-[78px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 h-full rounded-[10px] border border-[#E4E4E4] relative overflow-hidden bg-white text-[#E4E4E4]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 6px, currentColor 6px, currentColor 7px)",
            }}
          >
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-[#2563EB] border-t border-x border-blue-700/30 rounded-t-[8px]"
              initial={{ height: "0%" }}
              animate={{
                height: [
                  `${h}%`,
                  `${Math.min(94, h + 12)}%`,
                  `${Math.max(18, h - 14)}%`,
                  `${Math.min(90, h + 6)}%`,
                  `${h}%`,
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 3.2 + (i % 3) * 0.7,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 px-0.5">
        {days.map((d, i) => (
          <p key={i} className="flex-1 text-center text-[8px] text-slate-500 font-mono font-medium">
            {d}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Card3 – Verified Live Execution Feed
   ───────────────────────────────────────────── */

const STATUS_ICONS: Record<
  string,
  { icon: React.ComponentType<{ className?: string; weight?: "bold" }>; color: string; bg: string; iconBg: string }
> = {
  done: {
    icon: Check,
    color: "text-emerald-700",
    bg: "bg-emerald-50 border border-emerald-200/80",
    iconBg: "bg-emerald-600",
  },
  armed: {
    icon: CircleNotch,
    color: "text-blue-700",
    bg: "bg-blue-50 border border-blue-200/80",
    iconBg: "bg-[#2563EB]",
  },
  live: {
    icon: Clock,
    color: "text-amber-700",
    bg: "bg-amber-50 border border-amber-200/80",
    iconBg: "bg-amber-500",
  },
  audit: {
    icon: Minus,
    color: "text-slate-600",
    bg: "bg-slate-100 border border-slate-200",
    iconBg: "bg-slate-600",
  },
};

export function Card3() {
  const logs = [
    { agent: "Sync", action: "IC Markets XAU/USD +1.8R logged", status: "done", t: "+$420" },
    { agent: "Guard", action: "Cooldown armed after 2 daily losses", status: "armed", t: "0.2s" },
    { agent: "Verify", action: "Exness MT5 equity proof verified", status: "done", t: "100%" },
    { agent: "Desk", action: "London desk leaderboard ranked #4", status: "live", t: "+11.4%" },
    { agent: "Coach", action: "Flagged post-loss size escalation", status: "audit", t: "-20% lot" },
  ];

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % logs.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [logs.length]);

  const getSlot = (i: number) => {
    const N = logs.length;
    let rel = i - activeIdx;
    if (rel > Math.floor(N / 2)) rel -= N;
    if (rel < -Math.floor(N / 2)) rel += N;
    return rel;
  };

  const Y: Record<string, number> = { "-2": -62, "-1": -35, "0": 0, "1": 35, "2": 62 };

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      {logs.map((l, i) => {
        const slot = getSlot(i);
        const si = STATUS_ICONS[l.status];
        const abs = Math.abs(slot);
        const isActive = slot === 0;
        const isVisible = abs <= 2;

        const yOffset = Y[String(slot)] ?? (slot < 0 ? -110 : 110);
        const scale = isActive ? 1 : abs === 1 ? 0.94 : 0.88;
        const opacity = isActive ? 1 : abs === 1 ? 0.72 : 0.4;
        const zIndex = isActive ? 30 : abs === 1 ? 20 : 10;

        return (
          <motion.div
            key={l.agent}
            className="absolute left-0 right-0 mx-auto px-1"
            style={{ zIndex }}
            animate={{
              y: isVisible ? yOffset : slot < 0 ? -135 : 135,
              scale,
              opacity: isVisible ? opacity : 0,
            }}
            transition={{
              y: { type: "spring", stiffness: 500, damping: 36 },
              scale: { type: "spring", stiffness: 500, damping: 36 },
              opacity: { duration: 0.22, ease: "easeOut" },
            }}
          >
            <div
              className={`w-full rounded-xl border flex items-center gap-2.5 ${
                isActive
                  ? "px-3 py-2.5 bg-white border-slate-200 shadow-[0_6px_20px_-8px_rgba(15,23,42,0.14)]"
                  : "px-2.5 py-1.5 bg-white/90 border-slate-200/80"
              }`}
            >
              <div
                className={`shrink-0 rounded-[7px] flex items-center justify-center font-bold text-white transition-all duration-300 ${si.iconBg} ${
                  isActive ? "w-7 h-7" : "w-5 h-5"
                }`}
              >
                <si.icon
                  weight="bold"
                  className={`${isActive ? "w-3.5 h-3.5" : "w-2.5 h-2.5"} ${
                    l.status === "armed" ? "animate-spin" : ""
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-mono font-semibold text-slate-900 leading-none ${
                      isActive ? "text-[10.5px]" : "text-[9px]"
                    }`}
                  >
                    {l.agent}
                  </span>
                  <span
                    className={`font-mono uppercase tracking-wide rounded px-1.5 py-0.5 ${si.bg} ${si.color} ${
                      isActive ? "text-[7px]" : "text-[6px]"
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
                {isActive && (
                  <p className="text-[9.5px] text-slate-500 truncate mt-0.5 leading-tight">
                    {l.action}
                  </p>
                )}
              </div>

              {isActive && (
                <span className="text-[9.5px] font-mono font-semibold text-slate-700 shrink-0 tabular-nums">
                  {l.t}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Minimal segmented indicator bar (no round dots) */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
        {logs.map((_, i) => (
          <motion.div
            key={i}
            className="rounded-sm bg-slate-400"
            animate={{
              width: i === activeIdx ? 14 : 5,
              opacity: i === activeIdx ? 0.85 : 0.25,
            }}
            style={{ height: 2.5 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Card4 – AI Behavior Memory & Coaching Audit
   ───────────────────────────────────────────── */

const NS_ICONS: Record<string, React.ElementType> = {
  fills: Code,
  setups: FileText,
  rules: SlackLogo,
  habits: NotionLogo,
};

const NS_COLORS: Record<
  string,
  { bar: string; badge: string; buttonBg: string; buttonBorder: string }
> = {
  fills: {
    bar: "from-blue-600 to-blue-500",
    badge: "bg-blue-50 text-blue-700 border border-blue-200/80",
    buttonBg: "bg-[#2563EB]",
    buttonBorder: "border-blue-700",
  },
  setups: {
    bar: "from-sky-600 to-sky-500",
    badge: "bg-sky-50 text-sky-700 border border-sky-200/80",
    buttonBg: "bg-sky-600",
    buttonBorder: "border-sky-700",
  },
  rules: {
    bar: "from-emerald-600 to-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
    buttonBg: "bg-emerald-600",
    buttonBorder: "border-emerald-700",
  },
  habits: {
    bar: "from-amber-500 to-amber-400",
    badge: "bg-amber-50 text-amber-700 border border-amber-200/80",
    buttonBg: "bg-amber-500",
    buttonBorder: "border-amber-600",
  },
};

const RETRIEVAL_QUERIES = [
  { ns: "fills", q: "XAU/USD London open: +2.4R avg edge", t: "0.2s" },
  { ns: "rules", q: "Risk Guard paused execution at -2.8% DD", t: "1.1s" },
  { ns: "habits", q: "Detected tilt sizing +35% post stop-loss", t: "2.4s" },
  { ns: "setups", q: "Win rate drops 28% after 14:30 EST", t: "3.8s" },
  { ns: "rules", q: "Max 3 trades/session adhered 14 days", t: "5.2s" },
  { ns: "habits", q: "Pre-session discipline check passed", t: "6.4s" },
];

export function Card4() {
  const namespaces = [
    { name: "fills", hits: 1420, fill: 88 },
    { name: "setups", hits: 318, fill: 62 },
    { name: "rules", hits: 94, fill: 40 },
    { name: "habits", hits: 62, fill: 26 },
  ];

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => (prev + 1) % RETRIEVAL_QUERIES.length);
    }, 2100);
    return () => clearInterval(interval);
  }, []);

  const activeNs = RETRIEVAL_QUERIES[tick].ns;
  const recentQueries = [0, 1, 2, 3].map(
    (offset) =>
      RETRIEVAL_QUERIES[(tick - offset + RETRIEVAL_QUERIES.length) % RETRIEVAL_QUERIES.length]
  );

  return (
    <div className="w-full h-full flex gap-4 bg-white rounded-[10px] border border-[#E4E4E4] p-3">
      {/* Left panel: Behavior Memory Indexes */}
      <div className="flex-1 flex flex-col min-w-0 pr-1">
        <p className="text-[8.5px] font-mono uppercase tracking-widest text-slate-400 mb-3">
          Behavior Memory
        </p>

        <div className="flex flex-col gap-2.5 flex-1">
          {namespaces.map((ns, i) => {
            const c = NS_COLORS[ns.name];
            const isActive = ns.name === activeNs;
            const Icon = (NS_ICONS[ns.name] || Database) as React.ComponentType<{
              size?: number;
              weight?: string;
              className?: string;
            }>;

            return (
              <div key={ns.name} className="flex items-center gap-2.5 group relative">
                <div
                  className={`relative flex shrink-0 items-center justify-center w-[32px] h-[32px] rounded-[9px] border transition-all duration-400 ${
                    isActive
                      ? `${c.buttonBg} ${c.buttonBorder} text-white shadow-xs`
                      : "bg-[#F5F5F5] border-[#E4E4E4] text-slate-500"
                  }`}
                >
                  <Icon size={15} weight={isActive ? "fill" : "regular"} className="relative z-10" />
                </div>

                <span
                  className={`text-[10.5px] font-mono w-14 shrink-0 transition-colors duration-300 ${
                    isActive ? "text-slate-900 font-semibold" : "text-slate-500"
                  }`}
                >
                  {ns.name}
                </span>

                <div className="flex-1 h-1.5 bg-[#E4E4E4]/65 rounded-full overflow-hidden relative">
                  <motion.div
                    className={`absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r ${c.bar}`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${ns.fill}%`, opacity: isActive ? 1 : 0.35 }}
                    transition={{
                      width: { duration: 1.1, delay: i * 0.08, type: "spring", bounce: 0.15 },
                      opacity: { duration: 0.35 },
                    }}
                  />
                </div>

                <span
                  className={`w-10 text-right text-[9.5px] font-mono font-medium tabular-nums ${
                    isActive ? "text-slate-900 font-semibold" : "text-slate-400"
                  }`}
                >
                  {ns.hits}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2.5 mt-auto border-t border-[#E4E4E4]/70">
          <span className="text-[9px] font-mono text-emerald-700 font-medium">
            LIVE AUDIT ACTIVE
          </span>
          <span className="text-[9px] font-mono text-slate-400">MT5 Telemetry</span>
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="w-px bg-[#E4E4E4] self-stretch shrink-0 hidden sm:block" />

      {/* Right panel: AI Coaching Findings */}
      <div className="w-[185px] shrink-0 hidden sm:flex flex-col">
        <p className="text-[8.5px] font-mono uppercase tracking-widest text-slate-400 mb-2.5">
          Session Insights
        </p>

        <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
          {recentQueries.map((q, qi) => {
            const c = NS_COLORS[q.ns];
            return (
              <motion.div
                key={`${q.ns}-${q.q}-${qi}`}
                className="rounded-lg border border-[#E4E4E4] bg-[#F8F8F8] px-2.5 py-1.5"
                initial={{ opacity: 0, y: -6 }}
                animate={{
                  opacity: qi === 0 ? 1 : qi === 1 ? 0.85 : qi === 2 ? 0.55 : 0.3,
                  y: 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35, delay: qi * 0.04 }}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span
                    className={`text-[7px] font-mono font-semibold uppercase px-1.5 py-0.25 rounded ${c.badge}`}
                  >
                    {q.ns}
                  </span>
                  <span className="text-[7.5px] font-mono text-slate-400 ml-auto tabular-nums">
                    {q.t}
                  </span>
                </div>
                <p className="text-[8.5px] text-slate-700 leading-tight font-mono truncate">
                  {q.q}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Card5 – Unified Account & Risk Telemetry
   ───────────────────────────────────────────── */
export function Card5() {
  const tools = [
    {
      name: "MT5 Bridge",
      val: "4ms",
      sub: "SYNC",
      icon: Globe,
      pct: 94,
      iconColor: "bg-[#2563EB]",
      barColor: "bg-[#2563EB]",
    },
    {
      name: "Risk Guard",
      val: "0",
      sub: "BREACHES",
      icon: TerminalWindow,
      pct: 100,
      iconColor: "bg-emerald-600",
      barColor: "bg-emerald-600",
    },
    {
      name: "Discipline",
      val: "94",
      sub: "SCORE",
      icon: FileText,
      pct: 94,
      iconColor: "bg-amber-500",
      barColor: "bg-amber-500",
    },
    {
      name: "Profit Factor",
      val: "2.18",
      sub: "30D",
      icon: Brain,
      pct: 78,
      iconColor: "bg-indigo-600",
      barColor: "bg-indigo-600",
    },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-2 gap-2.5 w-full h-full">
        {tools.map((t, i) => (
          <motion.div
            key={i}
            className="relative rounded-[12px] border border-[#E4E4E4] bg-white hover:border-blue-300 transition-colors duration-200 flex flex-col justify-between p-2.5 group"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-white ${t.iconColor}`}
              >
                <t.icon weight="fill" className="w-3.5 h-3.5" />
              </div>

              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[12.5px] font-mono font-bold text-slate-900 leading-none tabular-nums">
                  {t.val}
                </span>
                <span className="text-[7px] font-mono text-slate-400 uppercase tracking-widest leading-none">
                  {t.sub}
                </span>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-1.5">
              <span className="text-[10px] font-mono font-semibold text-slate-800 tracking-tight truncate">
                {t.name}
              </span>
              <div className="w-full h-1.5 bg-[#E4E4E4]/65 rounded-full overflow-hidden relative">
                <motion.div
                  className={`absolute left-0 top-0 bottom-0 rounded-full ${t.barColor}`}
                  initial={{ width: "0%" }}
                  whileInView={{ width: `${t.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.08, duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Grid Component
   ───────────────────────────────────────────── */
const CARDS = [
  {
    title: "Smart Trade Journal",
    description:
      "Every fill is automatically imported, tagged, and analyzed. Spot setup edges without manual spreadsheet upkeep.",
    visual: <Card1 />,
    colSpan: "lg:col-span-1",
    height: "h-[352px]",
  },
  {
    title: "Autonomous Risk Protection",
    description:
      "Enforce daily loss caps and max drawdown rules at the broker edge. TradiFive prevents emotional spirals in real time.",
    visual: <Card2 />,
    colSpan: "lg:col-span-1",
    height: "h-[352px]",
  },
  {
    title: "Verified Execution Feed",
    description:
      "Follow broker-verified track records, subscribe to disciplined desks, and benchmark live execution metrics.",
    visual: <Card3 />,
    colSpan: "lg:col-span-1",
    height: "h-[352px]",
  },
  {
    title: "Personal AI Mentor",
    description:
      "Receive behavioral coaching, tilt diagnostics, and session-by-session reviews built directly from your MT5 history.",
    visual: <Card4 />,
    colSpan: "lg:col-span-2",
    height: "h-[352px]",
  },
  {
    title: "Unified Trading Telemetry",
    description:
      "Monitor broker latency, drawdown buffers, discipline scoring, and expectancy from one clean workspace.",
    visual: <Card5 />,
    colSpan: "lg:col-span-1",
    height: "h-[352px]",
  },
];

export interface AgentBentoGridProps {
  className?: string;
}

export function AgentBentoGrid({ className }: AgentBentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-[1500px] mx-auto",
        className
      )}
    >
      {CARDS.map((card, idx) => (
        <FeatCard
          key={idx}
          title={card.title}
          description={card.description}
          className={cn(card.colSpan, card.height)}
        >
          {card.visual}
        </FeatCard>
      ))}
    </div>
  );
}

export default AgentBentoGrid;
