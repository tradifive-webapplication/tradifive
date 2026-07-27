import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/* ─────────────────────────────────────────────
   Animated Counter – counts from 0 → target
   easeOutExpo over 1200ms
   ───────────────────────────────────────────── */
function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const ctrl = animate(count, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    });
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => { ctrl.stop(); unsub(); };
  }, [value]);

  return <span className={className}>{display}</span>;
}

/* ─────────────────────────────────────────────
   Arc helpers
   ───────────────────────────────────────────── */
const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

function polarToXY(cx: number, cy: number, r: number, deg: number) {
  const rad = toRad(deg);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToXY(cx, cy, r, startDeg);
  const e = polarToXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

/* ─────────────────────────────────────────────
   Segment config – equal 28° arcs, 6° gaps
   Arc sweeps from 210° → 340° (130° total)
   ───────────────────────────────────────────── */
interface Segment {
  color: string;
  glowColor: string;
  startDeg: number;
  endDeg: number;
}

const SEGMENTS: Segment[] = [
  { color: '#22C55E', glowColor: 'rgba(34,197,94,.5)',   startDeg: 210, endDeg: 238 },
  { color: '#FACC15', glowColor: 'rgba(250,204,21,.45)', startDeg: 244, endDeg: 272 },
  { color: '#FB923C', glowColor: 'rgba(251,146,60,.45)', startDeg: 278, endDeg: 306 },
  { color: '#EF4444', glowColor: 'rgba(239,68,68,.45)',  startDeg: 312, endDeg: 340 },
];

/* ─────────────────────────────────────────────
   Floating Particles behind shield
   ───────────────────────────────────────────── */
function FloatingParticles({ color }: { color: string }) {
  const particles = [
    { size: 3, x: 25, y: 30, dur: 6, delay: 0 },
    { size: 2, x: 75, y: 25, dur: 7, delay: 1 },
    { size: 2.5, x: 20, y: 70, dur: 5.5, delay: 0.5 },
    { size: 2, x: 80, y: 65, dur: 6.5, delay: 1.5 },
    { size: 1.5, x: 50, y: 20, dur: 8, delay: 2 },
    { size: 2, x: 40, y: 80, dur: 7, delay: 0.8 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: color,
            opacity: 0.25,
          }}
          animate={{
            y: [-8, 8, -8],
            x: [-4, 4, -4],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────── */
interface RiskScoreCardProps {
  score: number;
}

export function RiskScoreCard({ score = 0 }: RiskScoreCardProps) {
  /* ── Dynamic status ── */
  let statusText = 'CRITICAL';
  let statusDesc = 'High probability of emotional trading.';
  let statusColor = '#EF4444';
  let shieldGradient = 'linear-gradient(160deg, #DC2626 0%, #EF4444 45%, #B91C1C 100%)';
  let shieldGlow = 'rgba(239,68,68,0.35)';

  if (score >= 80) {
    statusText = 'EXCELLENT';
    statusDesc = 'Excellent discipline maintained.';
    statusColor = '#10B981';
    shieldGradient = 'linear-gradient(160deg, #059669 0%, #10B981 45%, #047857 100%)';
    shieldGlow = 'rgba(16,185,129,0.35)';
  } else if (score >= 60) {
    statusText = 'GOOD';
    statusDesc = 'Good trading behavior detected.';
    statusColor = '#3B82F6';
    shieldGradient = 'linear-gradient(160deg, #2563EB 0%, #3B82F6 45%, #1D4ED8 100%)';
    shieldGlow = 'rgba(59,130,246,0.35)';
  } else if (score >= 40) {
    statusText = 'AVERAGE';
    statusDesc = 'Moderate risk exposure detected.';
    statusColor = '#EAB308';
    shieldGradient = 'linear-gradient(160deg, #CA8A04 0%, #EAB308 45%, #A16207 100%)';
    shieldGlow = 'rgba(234,179,8,0.30)';
  } else if (score >= 20) {
    statusText = 'WARNING';
    statusDesc = 'Elevated risk detected.';
    statusColor = '#F97316';
    shieldGradient = 'linear-gradient(160deg, #EA580C 0%, #F97316 45%, #C2410C 100%)';
    shieldGlow = 'rgba(249,115,22,0.35)';
  }

  const aiConfidence = 92;

  /* ── Ring draw animation ── */
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: 0.2 + i * 0.12, duration: 1.0, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
        opacity: { delay: 0.2 + i * 0.12, duration: 0.15 },
      },
    }),
  };

  const CX = 130;
  const CY = 125;
  const R = 100;
  const SW = 11;

  return (
    <div
      className="w-full rounded-[22px] p-5 pb-4 flex flex-col items-center border-2 border-white shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] bg-[radial-gradient(ellipse_at_20%_0%,_#FFFFFF_0%,_#FAFBFC_100%)] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:shadow-none hover:-translate-y-[3px] transition-all duration-[250ms] group cursor-default relative overflow-hidden"
    >
      {/* Ambient moving highlight */}
      <motion.div
        className="absolute top-0 left-0 w-[200px] h-[200px] rounded-full pointer-events-none opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, #6D5DF6, transparent 70%)' }}
        animate={{ x: [-20, 40, -20], y: [-10, 30, -10] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between w-full mb-0 relative z-10">
        <h3 className="text-[18px] font-bold text-[#111827] dark:text-white tracking-[-0.02em]">
          Risk Score
        </h3>
        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-3 h-3 bg-[#22C55E] rounded-full blur-[3px]"
            />
            <div className="w-[7px] h-[7px] rounded-full bg-[#22C55E] relative z-10 shadow-[0_0_4px_rgba(34,197,94,0.5)]" />
          </div>
          <span className="text-[10px] font-bold text-[#22C55E] tracking-[0.08em] uppercase">
            Live
          </span>
        </div>
      </div>
      {/* Subtitle under Live */}
      <div className="flex items-center justify-end w-full -mt-1 mb-0 relative z-10">
        <span className="text-[9px] font-medium text-[#94A3B8] tracking-wide">Updated just now</span>
      </div>

      {/* ── RING + SHIELD VISUAL ── */}
      <div className="relative w-[240px] h-[165px] flex items-center justify-center z-10">

        {/* Floating particles */}
        <FloatingParticles color={statusColor} />

        {/* SVG Ring */}
        <svg
          viewBox="0 0 260 195" preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        >
          <defs>
            {SEGMENTS.map((seg, i) => (
              <filter key={`f${i}`} id={`seg-glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0"
                  result="glow"
                />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Background track */}
          <path
            d={arcPath(CX, CY, R, 210, 340)}
            fill="none"
            stroke="currentColor"
            className="text-slate-100/60 dark:text-zinc-800/60"
            strokeWidth={SW}
            strokeLinecap="round"
          />

          {/* Colored segments */}
          {SEGMENTS.map((seg, i) => (
            <motion.path
              key={i}
              d={arcPath(CX, CY, R, seg.startDeg, seg.endDeg)}
              fill="none"
              stroke={seg.color}
              strokeWidth={SW}
              strokeLinecap="round"
              filter={`url(#seg-glow-${i})`}
              custom={i}
              variants={draw}
              initial="hidden"
              animate="visible"
            />
          ))}

          {/* White indicator dot on green segment */}
          <motion.circle
            cx={polarToXY(CX, CY, R, 224).x}
            cy={polarToXY(CX, CY, R, 224).y}
            r="4.5"
            fill="white"
            style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.18))' }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, type: 'spring', stiffness: 280, damping: 18 }}
          />
        </svg>

        {/* Floating Shield */}
        <motion.div
          animate={{ y: [-3.5, 3.5, -3.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 w-[95px] h-[108px] mt-2"
        >
          {/* Deep outer glow – dynamic color */}
          <div
            className="absolute -inset-5 rounded-full pointer-events-none blur-2xl"
            style={{
              background: `radial-gradient(circle, ${shieldGlow}, transparent 70%)`,
              opacity: 0.5,
            }}
          />

          {/* Ambient pulse behind shield */}
          <motion.div
            className="absolute -inset-3 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${shieldGlow}, transparent 70%)`,
            }}
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Shield shape */}
          <div className="relative w-full h-full">
            {/* Main gradient – dynamic based on score */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: 'polygon(50% 0%, 100% 14%, 100% 68%, 50% 100%, 0% 68%, 0% 14%)',
                background: shieldGradient,
                boxShadow: `0 20px 50px -10px ${shieldGlow}`,
              }}
            />

            {/* Top reflection / glass highlight */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: 'polygon(50% 0%, 100% 14%, 100% 68%, 50% 100%, 0% 68%, 0% 14%)',
                background: 'linear-gradient(175deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.12) 30%, transparent 55%)',
                pointerEvents: 'none',
              }}
            />

            {/* Inner border / edge highlight */}
            <div
              className="absolute inset-[1.5px]"
              style={{
                clipPath: 'polygon(50% 0%, 100% 14%, 100% 68%, 50% 100%, 0% 68%, 0% 14%)',
                background: 'linear-gradient(160deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0.08) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Bottom subtle reflection */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: 'polygon(50% 0%, 100% 14%, 100% 68%, 50% 100%, 0% 68%, 0% 14%)',
                background: 'linear-gradient(0deg, rgba(255,255,255,0.08) 0%, transparent 25%)',
                pointerEvents: 'none',
              }}
            />

            {/* Score content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center -mt-1 z-10">
              <AnimatedCounter
                value={score}
                className="text-[42px] font-bold text-white leading-none tracking-[-0.03em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
              />
              <span className="text-[13px] font-medium text-white/60 mt-0 tracking-tight">/100</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── RISK LABEL ── */}
      <div className="flex flex-col items-center mt-0.5 mb-0.5 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.1em] mb-1"
        >
          Risk Level
        </motion.div>
        <motion.h4
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-[18px] font-extrabold tracking-[-0.01em] leading-tight"
          style={{ color: statusColor }}
        >
          {statusText}
        </motion.h4>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="text-[12px] text-[#64748B] font-medium mt-1 text-center leading-tight"
        >
          {statusDesc}
        </motion.p>
      </div>

      {/* ── AI CONFIDENCE ── */}
      <div className="w-full mt-1.5 mb-2 relative z-10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.08em]">
            AI Confidence
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-[#334155] dark:text-white">{aiConfidence}%</span>
            <span className="text-[9px] font-semibold text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded-full">
              Excellent
            </span>
          </div>
        </div>
        <div className="w-full h-[6px] bg-[#F1F5F9] dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${aiConfidence}%` }}
            transition={{ delay: 1.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="h-full rounded-full relative overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, #6D5DF6, #3B82F6, #10B981)',
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ delay: 2.5, duration: 2, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
      </div>

      {/* ── BOTTOM BUTTON ── */}
      <button className="w-full h-[40px] rounded-[12px] border border-[#E7EAF0] bg-white/60 backdrop-blur-sm flex items-center justify-center gap-2 hover:bg-[#F5F3FF] hover:border-[#DDD6FE] hover:shadow-[0_4px_12px_rgba(109,93,246,0.08)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 relative z-10 group/btn">
        <span className="text-[13px] font-semibold text-[#64748B] group-hover/btn:text-[#6D5DF6] transition-colors duration-200">
          View Full Analysis
        </span>
        <motion.div className="group-hover/btn:translate-x-1 transition-transform duration-200">
          <ArrowRight size={14} className="text-[#94A3B8] group-hover/btn:text-[#6D5DF6] transition-colors duration-200" />
        </motion.div>
      </button>

    </div>
  );
}
