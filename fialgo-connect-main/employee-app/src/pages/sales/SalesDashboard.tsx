import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, DollarSign, Target, Megaphone, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function SalesDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeLeads: 0,
    pipelineValue: 0,
    conversionRate: 0,
    activeCampaigns: 0
  });
  
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      const [leadsRes, campaignsRes] = await Promise.all([
        supabase.from("sales_leads").select("*").order("created_at", { ascending: false }),
        supabase.from("sales_campaigns").select("*").eq("status", "Active")
      ]);
      
      const leads = leadsRes.data || [];
      const campaigns = campaignsRes.data || [];
      
      const activeLeadsCount = leads.filter(l => l.status !== "Closed Won" && l.status !== "Closed Lost").length;
      const pipelineValue = leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0);
      const wonLeads = leads.filter(l => l.status === "Closed Won").length;
      const conversionRate = leads.length > 0 ? (wonLeads / leads.length) * 100 : 0;
      
      setStats({
        activeLeads: activeLeadsCount,
        pipelineValue,
        conversionRate,
        activeCampaigns: campaigns.length
      });
      
      setRecentLeads(leads.slice(0, 5));
      
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
        <p className="text-[12px] font-bold text-neutral-400 uppercase tracking-widest">Loading Sales Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-widest text-white uppercase">Sales Dashboard</h1>
        <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Pipeline & Revenue Overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Leads", value: stats.activeLeads, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Pipeline Value", value: `$${stats.pipelineValue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Conversion Rate", value: `${stats.conversionRate.toFixed(1)}%`, icon: Target, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { label: "Active Campaigns", value: stats.activeCampaigns, icon: Megaphone, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1E1E1E] border border-white/5 p-4 rounded-lg flex items-center justify-between group hover:border-white/10 transition-colors">
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={stat.color} size={18} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-[#1E1E1E] border border-white/5 rounded-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Users size={14} className="text-indigo-400" /> Recent Leads
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {recentLeads.length > 0 ? (
              <div className="divide-y divide-white/5">
                {recentLeads.map(lead => (
                  <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-bold text-white">{lead.name}</p>
                      <p className="text-xs text-neutral-500 mt-1">{lead.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">${Number(lead.value).toLocaleString()}</p>
                      <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                        lead.status === 'Closed Won' ? 'bg-emerald-500/20 text-emerald-400' :
                        lead.status === 'Closed Lost' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-500 text-sm">No leads in the pipeline yet.</div>
            )}
          </div>
        </div>

        {/* Quick Actions / Summary */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-4 flex flex-col">
          <h3 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-emerald-400" /> Pipeline Analytics
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <BarChart3 size={48} className="text-neutral-600 mb-4" />
            <p className="text-xs text-neutral-400 max-w-[200px]">More detailed revenue and team performance analytics will appear here once sufficient data is collected.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
