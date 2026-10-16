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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Affiliate & Referrals</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Network Growth Tracking
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Network Size", val: referrals.reduce((acc, r) => acc + (r.total_referred || 0), 0).toLocaleString(), icon: Users },
          { label: "Active Affiliates", val: referrals.length.toString(), icon: Share2 },
          { label: "Total Payouts Generated", val: "$" + referrals.reduce((acc, r) => acc + (r.earnings || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2}), icon: DollarSign, color: "text-emerald-500" },
        ].map((m, i) => (
          <div key={i} className="bg-[#1E1E1E] border border-white/5 p-5 rounded">
            <div className="flex items-center justify-between mb-2">
              <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-widest">{m.label}</p>
              <m.icon size={14} className="text-neutral-600" />
            </div>
            <p className={`text-xl font-bold ${m.color || 'text-white'}`}>{m.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden flex flex-col h-[calc(100vh-280px)]">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search by name or code..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#121212] border border-white/5 rounded pl-9 pr-4 py-1.5 text-[11px] text-white w-[250px] focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-neutral-600"
              />
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded hover:bg-neutral-200 transition-colors text-[10px] font-bold uppercase tracking-widest">
            Export Report
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
             <div className="h-full flex items-center justify-center">
                <Loader2 size={24} className="text-blue-500 animate-spin" />
             </div>
          ) : filteredReferrals.length === 0 ? (
             <div className="h-full flex items-center justify-center">
                <p className="text-neutral-500 text-sm">No affiliate records found.</p>
             </div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Affiliate</th>
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Code</th>
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Network</th>
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Earnings</th>
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrals.map((ref) => (
                <tr key={ref.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-bold text-white">{ref.profiles?.full_name || 'Unknown'}</p>
                      {ref.status === 'power_affiliate' && (
                        <div className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-500 text-[8px] font-bold uppercase tracking-widest">
                          Power
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{ref.referral_code}</span>
                      <button className="text-neutral-500 hover:text-white transition-colors"><Copy size={12} /></button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[9px] text-neutral-600 uppercase tracking-widest">Signups</p>
                        <p className="text-[11px] font-bold text-white">{ref.total_referred || 0}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-neutral-600 uppercase tracking-widest">Active Subs</p>
                        <p className="text-[11px] font-bold text-blue-400">{ref.active_subs || 0}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-[12px] font-bold text-emerald-500">${(ref.earnings || 0).toFixed(2)}</p>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 rounded bg-black border border-white/5 text-neutral-400 hover:text-white hover:border-white/20 transition-all opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest">
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
