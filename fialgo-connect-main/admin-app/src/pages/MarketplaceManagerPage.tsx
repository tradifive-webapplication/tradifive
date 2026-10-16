import { useState, useEffect } from "react";
import {
  Plus, Cpu, Search, Trash2, DollarSign,
  Activity, Loader2, Package, Edit3, X,
  Layers, Check, RefreshCcw, Shield
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

interface BuiltInAlgo {
  name: string;
  price: number;
  badge: string;
  category: string;
  timeframe: string;
  pairs: string;
  win_rate: string;
  drawdown: string;
  monthly_return: string;
  version: string;
  isFlagship?: boolean;
  boxImage?: string;
}

const BUILT_IN_ALGOS: BuiltInAlgo[] = [
  {
    name: "FiAlgo V1",
    price: 99999,
    badge: "Official Flagship EA · Gold Specialist",
    category: "Algo",
    timeframe: "1 Min (M1) / M15",
    pairs: "XAUUSD (Gold)",
    win_rate: "73%",
    drawdown: "3.2%",
    monthly_return: "+18–42%",
    version: "v1.0.4 Live",
    isFlagship: true,
    boxImage: "/fialgo-v1-box.png",
  },
];

interface AlgoFormData {
  name: string;
  category: string;
  badge: string;
  version: string;
  timeframe: string;
  pairs: string;
  win_rate: string;
  drawdown: string;
  monthly_return: string;
  price: string;
  description: string;
}

const initialForm: AlgoFormData = {
  name: "",
  category: "Algo",
  badge: "",
  version: "",
  timeframe: "",
  pairs: "",
  win_rate: "",
  drawdown: "",
  monthly_return: "",
  price: "",
  description: "",
};

export default function MarketplaceManagerPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AlgoFormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("marketplace_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  const handleOpenNew = () => {
    setEditId(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const handleEdit = (item: any) => {
    setForm({
      name: item.name || "",
      category: item.type || "Algo",
      badge: item.badge || "",
      version: item.version || "",
      timeframe: item.timeframe || "",
      pairs: item.pairs || "",
      win_rate: item.win_rate || "",
      drawdown: item.drawdown || "",
      monthly_return: item.monthly_return || "",
      price: String(item.price || ""),
      description: item.description || "",
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim() || !form.description.trim()) {
      toast.error("Algorithm Name, Price, and Description are required.");
      return;
    }

    const numericPrice = parseFloat(form.price.replace(/,/g, ""));
    if (isNaN(numericPrice) || numericPrice < 0) {
      toast.error("Please enter a valid price in rupees.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.category,
        badge: form.badge.trim() || null,
        version: form.version.trim() || "v1.0 Live",
        timeframe: form.timeframe.trim() || "M15 / H1",
        pairs: form.pairs.trim() || "Multi-Pair",
        win_rate: form.win_rate.trim() || null,
        drawdown: form.drawdown.trim() || null,
        monthly_return: form.monthly_return.trim() || null,
        price: numericPrice,
        description: form.description.trim(),
        status: "approved",
      };

      if (editId) {
        const { error } = await supabase
          .from("marketplace_items")
          .update(payload)
          .eq("id", editId);

        if (error) throw error;
        toast.success("Algorithm updated successfully.");
      } else {
        const { error } = await supabase
          .from("marketplace_items")
          .insert([payload]);

        if (error) throw error;
        toast.success("New algorithm published directly to live marketplace!");
      }

      setForm(initialForm);
      setShowForm(false);
      setEditId(null);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to save algorithm.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "approved" ? "paused" : "approved";
    const { error } = await supabase
      .from("marketplace_items")
      .update({ status: nextStatus })
      .eq("id", id);

    if (!error) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
      );
      toast.success(nextStatus === "approved" ? "Algo is now LIVE in marketplace" : "Algo has been paused");
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the marketplace?`)) {
      return;
    }

    const { error } = await supabase
      .from("marketplace_items")
      .delete()
      .eq("id", id);

    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Algorithm removed from marketplace.");
    } else {
      toast.error("Failed to delete item.");
    }
  };

  const filteredItems = items.filter((item) =>
    (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.pairs || "").toLowerCase().includes(search.toLowerCase())
  );

  const kpis = [
    {
      label: "Flagship Algorithm",
      value: "₹99,999",
      subtext: "FiAlgo V1 · Lifetime License",
      icon: Cpu,
      color: "#3b82f6",
      badge: "LIFETIME",
    },
    {
      label: "Built-in Systems",
      value: "01 Bot",
      subtext: "Core MT5 Active",
      icon: Activity,
      color: "#10b981",
      badge: "LIVE CORE",
    },
    {
      label: "Admin Published",
      value: `${items.length} Algos`,
      subtext: `${items.filter((i) => i.status === "approved").length} Live in User Store`,
      icon: Package,
      color: "#8b5cf6",
      badge: `${items.filter((i) => i.status === "approved").length} LIVE`,
    },
    {
      label: "Total Store Catalog",
      value: `${1 + items.length} Products`,
      subtext: "Real-time Live Sync",
      icon: DollarSign,
      color: "#f59e0b",
      badge: "CATALOG",
    },
  ];

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center text-blue-400"
              style={{ borderColor: "#3b82f620" }}
            >
              <Cpu size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-widest text-white uppercase">
                  Marketplace Manager
                </h1>
                <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                    Live Engine
                  </span>
                </div>
              </div>
              <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
                Official Built-in Expert Advisors, Pricing & Custom Store Listings
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchItems}
            className="h-9 px-3.5 bg-[#1E1E1E] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-none flex items-center gap-2"
          >
            <RefreshCcw size={13} className={loading ? "animate-spin" : ""} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-500 border border-blue-500/30 rounded-lg text-xs font-semibold text-white transition-none flex items-center gap-2 shadow-sm"
          >
            <Plus size={14} />
            <span>Post New Algo</span>
          </button>
        </div>
      </div>

      {/* ── Top Metric KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[#1E1E1E] border border-white/5 rounded-lg p-5 hover:border-white/10 transition-none group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-9 h-9 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-none"
                style={{ borderColor: `${kpi.color}20` }}
              >
                <kpi.icon size={16} style={{ color: kpi.color }} />
              </div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                {kpi.badge}
              </span>
            </div>
            <p className="text-2xl font-black text-white mb-1">{kpi.value}</p>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Post / Edit Algorithm Form Panel ── */}
      {showForm && (
        <div className="bg-[#1E1E1E] border border-blue-500/30 rounded-lg p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Cpu size={14} className="text-blue-400" />
              {editId ? "Edit Published Algorithm" : "Post New Algorithm to Marketplace"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-none"
            >
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Algorithm Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FiAlgo V2 Gold Pro"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-9 w-full bg-[#121212] border border-white/5 focus:border-blue-500/50 rounded px-3 text-xs text-neutral-200 outline-none placeholder-neutral-600 transition-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Price in Rupees (₹) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 29999"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="h-9 w-full bg-[#121212] border border-white/5 focus:border-blue-500/50 rounded px-3 text-xs text-neutral-200 outline-none placeholder-neutral-600 transition-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-9 w-full bg-[#121212] border border-white/5 focus:border-blue-500/50 rounded px-3 text-xs text-neutral-200 outline-none transition-none"
                >
                  <option value="Algo">Algo (EA)</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Indicator">Indicator</option>
                  <option value="Mentorship">Mentorship</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Trading Pairs
                </label>
                <input
                  type="text"
                  placeholder="e.g. XAUUSD, EURUSD, US100"
                  value={form.pairs}
                  onChange={(e) => setForm({ ...form, pairs: e.target.value })}
                  className="h-9 w-full bg-[#121212] border border-white/5 focus:border-blue-500/50 rounded px-3 text-xs text-neutral-200 outline-none placeholder-neutral-600 transition-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Timeframe
                </label>
                <input
                  type="text"
                  placeholder="e.g. M15 / H1"
                  value={form.timeframe}
                  onChange={(e) => setForm({ ...form, timeframe: e.target.value })}
                  className="h-9 w-full bg-[#121212] border border-white/5 focus:border-blue-500/50 rounded px-3 text-xs text-neutral-200 outline-none placeholder-neutral-600 transition-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Version
                </label>
                <input
                  type="text"
                  placeholder="e.g. v2.1 Live"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  className="h-9 w-full bg-[#121212] border border-white/5 focus:border-blue-500/50 rounded px-3 text-xs text-neutral-200 outline-none placeholder-neutral-600 transition-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Badge / Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. High Win Rate · Safe"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="h-9 w-full bg-[#121212] border border-white/5 focus:border-blue-500/50 rounded px-3 text-xs text-neutral-200 outline-none placeholder-neutral-600 transition-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Win Rate
                </label>
                <input
                  type="text"
                  placeholder="e.g. 74.5%"
                  value={form.win_rate}
                  onChange={(e) => setForm({ ...form, win_rate: e.target.value })}
                  className="h-9 w-full bg-[#121212] border border-white/5 focus:border-blue-500/50 rounded px-3 text-xs text-neutral-200 outline-none placeholder-neutral-600 transition-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Max Drawdown
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3.8%"
                  value={form.drawdown}
                  onChange={(e) => setForm({ ...form, drawdown: e.target.value })}
                  className="h-9 w-full bg-[#121212] border border-white/5 focus:border-blue-500/50 rounded px-3 text-xs text-neutral-200 outline-none placeholder-neutral-600 transition-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5">
                Full Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Explain strategy logic, risk management rules, capital requirements..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-[#121212] border border-white/5 focus:border-blue-500/50 rounded p-3 text-xs text-neutral-200 outline-none placeholder-neutral-600 transition-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                className="h-9 px-4 bg-[#121212] border border-white/5 hover:border-white/10 rounded-lg text-neutral-400 hover:text-white text-xs font-semibold transition-none uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-9 px-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 border border-blue-500/30 rounded-lg text-xs font-semibold text-white transition-none flex items-center gap-2 shadow-sm uppercase tracking-wider"
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                <span>{editId ? "Update Algorithm" : "Publish to Store"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Built-in Official Algorithm Box (FiAlgo V1 Flagship) ── */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            <Cpu size={14} className="text-blue-500" />
            Official Built-in System (FiAlgo Flagship)
          </h3>
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            01 Official Flagship Active
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="bg-[#121212] border border-blue-500/30 rounded-lg p-5 sm:p-6 shadow-[0_0_30px_rgba(59,130,246,0.06)] relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
              {/* Product 3D Box Packaging */}
              <div className="relative shrink-0 flex items-center justify-center p-3 rounded-xl bg-black/40 border border-white/5 w-44 sm:w-52 h-44 sm:h-52">
                <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full pointer-events-none" />
                <img
                  src="/fialgo-v1-box.png"
                  alt="FiAlgo V1 Official 3D Box"
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Specs & Details */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        OFFICIAL FLAGSHIP EA
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/[0.04] text-neutral-400 border border-white/5">
                        MQL5 EXPERT ADVISOR
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        3-DAY PROFIT GUARANTEE
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      FiAlgo V1
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-0.5">
                      Gold Specialist (XAUUSD) · Smart Dynamic Basket Engine · v1.0.4 Live
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block">
                      ONE-TIME LIFETIME ACCESS
                    </span>
                    <span className="font-mono text-2xl sm:text-3xl font-black text-white">
                      ₹99,999
                    </span>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block">WIN RATE</span>
                    <span className="font-mono text-sm font-bold text-emerald-400 mt-0.5 block">73% (78% Peak)</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block">MAX DRAWDOWN</span>
                    <span className="font-mono text-sm font-bold text-neutral-300 mt-0.5 block">3.2% Hard Cap</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block">MONTHLY RETURN</span>
                    <span className="font-mono text-sm font-bold text-blue-400 mt-0.5 block">+18–42% / mo</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block">LATENCY & SPEED</span>
                    <span className="font-mono text-sm font-bold text-amber-400 mt-0.5 block">&lt; 3ms Direct MT5</span>
                  </div>
                </div>

                {/* Additional Info Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 pt-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-neutral-300 flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span>Platform: <strong className="text-white font-mono">MetaTrader 5 (MT5)</strong></span>
                    </span>
                    <span className="text-neutral-700">·</span>
                    <span className="text-neutral-300 flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Pair: <strong className="text-white font-mono">XAUUSD (Gold)</strong></span>
                    </span>
                    <span className="text-neutral-700">·</span>
                    <span className="text-neutral-300 flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Timeframe: <strong className="text-white font-mono">1 Min (M1) / M15</strong></span>
                    </span>
                    <span className="text-neutral-700">·</span>
                    <span className="text-neutral-300 flex items-center gap-1.5 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span>News Filter: <strong className="text-emerald-400 font-mono">FOMC / CPI / NFP Auto Blackout</strong></span>
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Live In User Store (₹99,999)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Custom Published Algorithms Table ── */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <Layers size={14} className="text-blue-500" />
              Custom Published Algorithms
            </h3>
            <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
              {items.length} Total
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
            <input
              type="text"
              placeholder="SEARCH STRATEGIES..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full bg-[#121212] border border-white/5 focus:border-white/20 rounded pl-9 pr-3 text-xs text-neutral-200 placeholder-neutral-600 outline-none transition-none uppercase tracking-wider"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-neutral-500 text-xs">
            <Loader2 size={20} className="animate-spin mx-auto mb-2 text-blue-500" />
            <span>Loading marketplace catalog...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded bg-white/[0.04] border border-white/5 flex items-center justify-center mx-auto mb-3 text-neutral-500">
              <Package size={20} />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              No custom algorithms posted yet
            </h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest max-w-md mx-auto mt-1 mb-4">
              Your official flagship algorithm FiAlgo V1 at ₹99,999 is live. Use the &quot;Post New Algo&quot; button above whenever you want to release and sell an additional algorithm.
            </p>
            <button
              onClick={handleOpenNew}
              className="h-9 px-4 bg-blue-600 hover:bg-blue-500 border border-blue-500/30 rounded-lg text-xs font-semibold text-white transition-none inline-flex items-center gap-2 uppercase tracking-wider shadow-sm"
            >
              <Plus size={14} />
              <span>Post New Algorithm</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap border-collapse">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Algorithm</th>
                  <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Category</th>
                  <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Pairs & TF</th>
                  <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Performance</th>
                  <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Price</th>
                  <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02] text-xs">
                {filteredItems.map((item) => {
                  const isLive = item.status === "approved";
                  return (
                    <tr key={item.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-white text-[12px]">{item.name}</div>
                        <div className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">
                          {item.version || "v1.0"}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/[0.04] text-neutral-400 border border-white/5">
                          {item.type || "Algo"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-xs font-bold text-neutral-200">{item.pairs || "All Pairs"}</div>
                        <div className="font-mono text-[10px] text-neutral-500 mt-0.5">{item.timeframe || "M15"}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-xs font-bold text-emerald-400">WR: {item.win_rate || "N/A"}</div>
                        <div className="font-mono text-[10px] text-neutral-500 mt-0.5">DD: {item.drawdown || "N/A"}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm font-black text-white">
                          ₹{Number(item.price || 0).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(item.id, item.status)}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border transition-none ${
                            isLive
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                          }`}
                        >
                          {isLive ? "Live in Store" : "Paused"}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(item)}
                            title="Edit"
                            className="p-1.5 rounded bg-[#121212] border border-white/5 text-neutral-400 hover:text-white hover:border-white/10 transition-none"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            title="Delete"
                            className="p-1.5 rounded bg-[#121212] border border-white/5 text-neutral-400 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/10 transition-none"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
