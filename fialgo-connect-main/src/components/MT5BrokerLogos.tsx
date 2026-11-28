import React from "react";

interface BrokerLogoItem {
  id: string;
  name: string;
  render: () => React.ReactNode;
}

/**
 * Clean vector marks and typographic lockups for MetaTrader 5 brokers & prop desks.
 * Uses subtle monochrome-at-rest styling that reveals authentic brand color on hover.
 */
export const MT5_BROKER_LOGOS: BrokerLogoItem[] = [
  {
    id: "exness",
    name: "Exness",
    render: () => (
      <div className="inline-flex items-center gap-2">
        <svg viewBox="0 0 28 28" className="w-6 h-6 shrink-0" aria-hidden="true">
          <rect width="28" height="28" rx="6" fill="#FFDE02" />
          <path
            d="M8.5 9.5h11v2.6h-7.8v2.2h6.6v2.5h-6.6v2.2h7.8v2.6h-11V9.5z"
            fill="#141414"
          />
        </svg>
        <span
          style={{ fontFamily: "'Manrope', sans-serif" }}
          className="text-[18px] font-extrabold tracking-[-0.04em] text-slate-900 lowercase"
        >
          exness
        </span>
      </div>
    ),
  },
  {
    id: "vantage",
    name: "Vantage Markets",
    render: () => (
      <div className="inline-flex items-center gap-1.5">
        <img
          src="/vantage-logo.png"
          alt="Vantage"
          className="w-7 h-7 object-contain scale-[1.35] shrink-0"
          loading="lazy"
        />
        <span
          style={{ fontFamily: "'Manrope', sans-serif" }}
          className="text-[17.5px] font-bold tracking-[-0.03em] text-slate-900 lowercase"
        >
          vantage
        </span>
      </div>
    ),
  },
  {
    id: "icmarkets",
    name: "IC Markets",
    render: () => (
      <div className="inline-flex items-center gap-2">
        <svg viewBox="0 0 28 28" className="w-6 h-6 shrink-0" aria-hidden="true">
          <rect width="28" height="28" rx="6" fill="#0F172A" />
          <path d="M8.2 8.5h2.9v11H8.2v-11z" fill="#22C55E" />
          <path
            d="M19.8 11.4c-.8-.6-1.7-.9-2.8-.9-2.2 0-3.7 1.5-3.7 3.5s1.5 3.5 3.7 3.5c1.1 0 2-.3 2.8-.9v2.6c-.9.5-1.9.7-3 .7-3.6 0-6.2-2.4-6.2-5.9s2.6-5.9 6.2-5.9c1.1 0 2.1.2 3 .7v2.6z"
            fill="#FFFFFF"
          />
        </svg>
        <div
          style={{ fontFamily: "'Manrope', sans-serif" }}
          className="inline-flex items-baseline gap-1 text-[16.5px] tracking-[-0.03em] text-slate-900"
        >
          <span className="font-extrabold">IC</span>
          <span className="font-medium text-slate-700">Markets</span>
        </div>
      </div>
    ),
  },
  {
    id: "pepperstone",
    name: "Pepperstone",
    render: () => (
      <div className="inline-flex items-center gap-2">
        <svg viewBox="0 0 28 28" className="w-6 h-6 shrink-0" aria-hidden="true">
          <polygon points="14,3 24,9 24,19 14,25 4,19 4,9" fill="#EA3925" />
          <path d="M11 9.5h4.2c2.1 0 3.4 1.2 3.4 3.1 0 1.9-1.3 3.1-3.4 3.1h-1.8v3.3H11V9.5zm2.4 4.3h1.6c.9 0 1.3-.4 1.3-1.2s-.4-1.2-1.3-1.2h-1.6v2.4z" fill="#FFFFFF" />
        </svg>
        <span
          style={{ fontFamily: "'Manrope', sans-serif" }}
          className="text-[17px] font-bold tracking-[-0.03em] text-slate-900 lowercase"
        >
          pepperstone
        </span>
      </div>
    ),
  },
  {
    id: "xm",
    name: "XM Global",
    render: () => (
      <div className="inline-flex items-center gap-2">
        <svg viewBox="0 0 28 28" className="w-6 h-6 shrink-0" aria-hidden="true">
          <rect width="28" height="28" rx="6" fill="#D51820" />
          <path
            d="M7.5 9.5h2.7l2 3.1 2-3.1h2.7l-3.3 4.6 3.5 4.9h-2.7l-2.2-3.3-2.2 3.3H7.3l3.5-4.9-3.3-4.6z"
            fill="#FFFFFF"
          />
          <rect x="18.6" y="9.5" width="2.2" height="9.5" fill="#FFFFFF" />
        </svg>
        <div
          style={{ fontFamily: "'Manrope', sans-serif" }}
          className="inline-flex items-baseline gap-1 text-[16.5px] tracking-[-0.025em] text-slate-900"
        >
          <span className="font-extrabold">XM</span>
          <span className="font-normal text-slate-500 text-[14.5px]">Global</span>
        </div>
      </div>
    ),
  },
  {
    id: "fpmarkets",
    name: "FP Markets",
    render: () => (
      <div className="inline-flex items-center gap-2">
        <svg viewBox="0 0 28 28" className="w-6 h-6 shrink-0" aria-hidden="true">
          <rect width="28" height="28" rx="6" fill="#0052CC" />
          <path d="M7.5 9.5h6.2v2.2h-3.6v1.6h3.1v2.1h-3.1v3.6H7.5V9.5z" fill="#FFFFFF" />
          <path d="M15.3 9.5h3.5c2 0 3.2 1.1 3.2 2.9s-1.2 2.9-3.2 2.9h-1.2V19h-2.3V9.5zm2.3 3.9h1c.8 0 1.2-.4 1.2-1s-.4-1-1.2-1h-1v2z" fill="#93C5FD" />
        </svg>
        <div
          style={{ fontFamily: "'Manrope', sans-serif" }}
          className="inline-flex items-baseline gap-1 text-[16.5px] tracking-[-0.025em] text-slate-900"
        >
          <span className="font-extrabold">FP</span>
          <span className="font-semibold text-slate-700">Markets</span>
        </div>
      </div>
    ),
  },
  {
    id: "fusion",
    name: "Fusion Markets",
    render: () => (
      <div className="inline-flex items-center gap-2">
        <svg viewBox="0 0 28 28" className="w-6 h-6 shrink-0" aria-hidden="true">
          <circle cx="14" cy="14" r="12" fill="#0F766E" />
          <path d="M10 9.5h8.5v2.4H12.7v2h4.8v2.3h-4.8v3.3H10V9.5z" fill="#FFFFFF" />
        </svg>
        <span
          style={{ fontFamily: "'Manrope', sans-serif" }}
          className="text-[16.5px] font-bold tracking-[-0.03em] text-slate-900"
        >
          Fusion<span className="font-normal text-slate-500"> Markets</span>
        </span>
      </div>
    ),
  },
  {
    id: "tickmill",
    name: "Tickmill",
    render: () => (
      <div className="inline-flex items-center gap-2">
        <svg viewBox="0 0 28 28" className="w-6 h-6 shrink-0" aria-hidden="true">
          <rect width="28" height="28" rx="6" fill="#1E293B" />
          <path d="M7.5 9.5h13v2.6h-5.1v7.4h-2.8v-7.4H7.5V9.5z" fill="#EF4444" />
        </svg>
        <span
          style={{ fontFamily: "'Manrope', sans-serif" }}
          className="text-[15px] font-extrabold tracking-[0.06em] text-slate-900 uppercase"
        >
          Tickmill
        </span>
      </div>
    ),
  },
  {
    id: "ftmo",
    name: "FTMO",
    render: () => (
      <div className="inline-flex items-center gap-2">
        <svg viewBox="0 0 28 28" className="w-6 h-6 shrink-0" aria-hidden="true">
          <rect width="28" height="28" rx="6" fill="#0284C7" />
          <path d="M14 6.5l7 7.5-7 7.5-7-7.5 7-7.5z" fill="none" stroke="#FFFFFF" strokeWidth="2.2" />
          <circle cx="14" cy="14" r="2.2" fill="#FFFFFF" />
        </svg>
        <span
          style={{ fontFamily: "'Manrope', sans-serif" }}
          className="text-[16px] font-extrabold tracking-[0.08em] text-slate-900 uppercase"
        >
          FTMO
        </span>
      </div>
    ),
  },
  {
    id: "fundednext",
    name: "FundedNext",
    render: () => (
      <div className="inline-flex items-center gap-2">
        <svg viewBox="0 0 28 28" className="w-6 h-6 shrink-0" aria-hidden="true">
          <rect width="28" height="28" rx="6" fill="#4338CA" />
          <path
            d="M8 18.5L13.5 9.5h3.2L11.2 18.5H8zm6.5 0L20 9.5h3.2l-5.5 9h-3.2z"
            fill="#FFFFFF"
          />
        </svg>
        <span
          style={{ fontFamily: "'Manrope', sans-serif" }}
          className="text-[16.5px] font-bold tracking-[-0.025em] text-slate-900"
        >
          Funded<span className="font-normal text-slate-600">Next</span>
        </span>
      </div>
    ),
  },
  {
    id: "eightcap",
    name: "Eightcap",
    render: () => (
      <div className="inline-flex items-center gap-2">
        <svg viewBox="0 0 28 28" className="w-6 h-6 shrink-0" aria-hidden="true">
          <rect width="28" height="28" rx="14" fill="#2563EB" />
          <circle cx="14" cy="10.8" r="2.6" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="14" cy="16.8" r="3" fill="none" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
        <span
          style={{ fontFamily: "'Manrope', sans-serif" }}
          className="text-[17px] font-bold tracking-[-0.03em] text-slate-900 lowercase"
        >
          eightcap
        </span>
      </div>
    ),
  },
];
