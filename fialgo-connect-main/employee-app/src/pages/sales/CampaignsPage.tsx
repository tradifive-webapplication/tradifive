import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Megaphone, Loader2, PlayCircle, PauseCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

export default function CampaignsPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: "", campaign_name: "", type: "Email", status: "Draft" });

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("sales_campaigns").select("*").order("created_at", { ascending: false });
    if (!error && data) setCampaigns(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      campaign_name: formData.campaign_name,
      type: formData.type,
      status: formData.status
    };

    if (formData.id) {
      const { error } = await supabase.from("sales_campaigns").update(payload).eq("id", formData.id);
      if (error) toast.error("Error updating campaign");
      else toast.success("Campaign updated successfully!");
    } else {
      const { error } = await supabase.from("sales_campaigns").insert([payload]);
      if (error) toast.error("Error creating campaign");
      else toast.success("Campaign created successfully!");
    }
    
    setShowModal(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    const { error } = await supabase.from("sales_campaigns").delete().eq("id", id);
    if (error) toast.error("Error deleting campaign");
    else loadData();
  };
  
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Draft" : "Active";
    const { error } = await supabase.from("sales_campaigns").update({ status: newStatus }).eq("id", id);
    if (!error) loadData();
  };

  const filtered = campaigns.filter(c => 
    c.campaign_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Outreach Campaigns</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Marketing & Sales Automation</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ id: "", campaign_name: "", type: "Email", status: "Draft" });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors"
        >
          <Plus size={13} /> New Campaign
        </button>
      </div>

      <div className="flex items-center gap-4 bg-[#1E1E1E] p-4 rounded-lg border border-white/5 shrink-0">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH CAMPAIGNS..." 
            className="w-full bg-[#121212] border border-white/5 rounded px-3 py-2 pl-9 text-[11px] font-bold text-white uppercase tracking-wider outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded-lg overflow-y-auto flex-1 min-h-0">
        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-amber-500" size={24} /></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#121212] sticky top-0 z-10 border-b border-white/5">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Campaign Name</th>
                <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Type</th>
                <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Sent Count</th>
                <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Metrics</th>
                <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(campaign => (
                <tr key={campaign.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-white">{campaign.campaign_name}</p>
                    <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-1">
                      Created: {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-bold text-neutral-300 px-2 py-0.5 rounded border border-white/10 bg-white/5">
                      {campaign.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      campaign.status === 'Active' ? 'bg-amber-500/20 text-amber-400' :
                      campaign.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-white/10 text-neutral-400'
                    }`}>
                      {campaign.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-bold text-white">{Number(campaign.sent_count).toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[10px] text-neutral-400"><span className="text-neutral-500">Open:</span> {campaign.open_rate}%</p>
                      <p className="text-[10px] text-emerald-400"><span className="text-emerald-500/50">Conv:</span> {campaign.conversion_rate}%</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => toggleStatus(campaign.id, campaign.status)} className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-amber-500/10 rounded" title={campaign.status === 'Active' ? 'Pause' : 'Start'}>
                        {campaign.status === 'Active' ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                      </button>
                      <button onClick={() => { setFormData(campaign); setShowModal(true); }} className="p-1.5 text-neutral-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(campaign.id)} className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500 text-sm">No campaigns found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#121212]">
              <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Megaphone size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">{formData.id ? "Edit Campaign" : "New Campaign"}</h3>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">Outreach Setup</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Campaign Name *</label>
                <input required type="text" value={formData.campaign_name} onChange={e => setFormData({...formData, campaign_name: e.target.value})} className="w-full bg-[#121212] border border-white/5 rounded px-3 py-2 text-sm text-white focus:border-amber-500/50 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Channel / Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-[#121212] border border-white/5 rounded px-3 py-2 text-sm text-white focus:border-amber-500/50 outline-none transition-colors">
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Push Notification">Push Notification</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#121212] border border-white/5 rounded px-3 py-2 text-sm text-white focus:border-amber-500/50 outline-none transition-colors">
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-[11px] font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold uppercase tracking-widest rounded transition-colors shadow-lg shadow-amber-500/20">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
