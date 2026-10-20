import { useState, useEffect } from "react";
import { Share2, Search, Filter, ArrowUpRight, Copy, Users, DollarSign, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ReferralsManagerPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_profiles')
        .select(`*, profiles:user_id (full_name)`)
        .order('total_referred', { ascending: false });
        
      if (error) throw error;
      setReferrals(data || []);
    } catch (err) {
      console.error("Error fetching referrals:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = referrals.filter(r => 
    r.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    r.referral_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Affiliate & Referrals</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
            Network Growth Tracking
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {[
          { label: "Total Network Size", val: referrals.reduce((acc, r) => acc + (r.total_referred || 0), 0).toLocaleString(), icon: Users },
          { label: "Active Affiliates", val: referrals.length.toString(), icon: Share2 },
          { label: "Total Payouts Generated", val: "$" + referrals.reduce((acc, r) => acc + (r.earnings || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2}), icon: DollarSign, color: "text-emerald-400" },
        ].map((m, i) => (
          <div key={i} className="bg-[#1E1E1E] border border-white/5 p-3.5 sm:p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest truncate">{m.label}</p>
              <m.icon size={14} className="text-neutral-500 shrink-0" />
            </div>
            <p className={`text-base sm:text-xl font-bold truncate ${m.color || 'text-white'}`}>{m.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden shadow-xl flex flex-col">
        {/* Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
          <div className="relative w-full sm:w-[250px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search by name or code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#121212] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[11px] text-white w-full focus:outline-none focus:border-white/20 transition-colors placeholder:text-neutral-500"
            />
          </div>
          <button className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors text-[10px] font-bold uppercase tracking-widest">
            Export Report
          </button>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-white/5">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 size={20} className="text-blue-500 animate-spin" />
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-[10px] uppercase tracking-widest">
              No affiliate records found
            </div>
          ) : (
            filteredReferrals.map((ref) => (
              <div key={ref.id} className="p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-bold text-white uppercase truncate">{ref.profiles?.full_name || 'Unknown'}</p>
                      {ref.status === 'power_affiliate' && (
                        <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-[8px] font-bold uppercase tracking-widest">
                          Power
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{ref.referral_code}</span>
                      <button onClick={() => navigator.clipboard.writeText(ref.referral_code)} className="text-neutral-500 hover:text-white p-1">
                        <Copy size={11} />
                      </button>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400 shrink-0">
                    ${(ref.earnings || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-1 border-t border-white/5">
                  <span>{ref.total_referred || 0} signups • {ref.active_subs || 0} active</span>
                  <span className="text-[9px] text-neutral-500 uppercase">Affiliate</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          {loading ? (
             <div className="p-12 flex items-center justify-center">
                <Loader2 size={24} className="text-blue-500 animate-spin" />
             </div>
          ) : filteredReferrals.length === 0 ? (
             <div className="p-12 text-center text-neutral-500 text-[10px] uppercase tracking-widest">
                No affiliate records found.
             </div>
          ) : (
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Affiliate</th>
                <th className="p-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Code</th>
                <th className="p-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Network</th>
                <th className="p-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Earnings</th>
                <th className="p-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReferrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-white/[0.01] transition-none group">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-bold text-white uppercase">{ref.profiles?.full_name || 'Unknown'}</p>
                      {ref.status === 'power_affiliate' && (
                        <div className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-[8px] font-bold uppercase tracking-widest">
                          Power
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{ref.referral_code}</span>
                      <button onClick={() => navigator.clipboard.writeText(ref.referral_code)} className="text-neutral-500 hover:text-white transition-colors"><Copy size={12} /></button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest">Signups</p>
                        <p className="text-[11px] font-bold text-white">{ref.total_referred || 0}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest">Active Subs</p>
                        <p className="text-[11px] font-bold text-blue-400">{ref.active_subs || 0}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-[12px] font-bold text-emerald-400 font-mono">${(ref.earnings || 0).toFixed(2)}</p>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 rounded bg-black border border-white/5 text-neutral-400 hover:text-white hover:border-white/20 transition-all inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest">
                      View Tree <ArrowUpRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}
