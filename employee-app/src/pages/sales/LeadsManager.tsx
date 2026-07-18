import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Users, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

export default function LeadsManager() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", email: "", phone: "", status: "New", value: 0, notes: "" });

  const loadData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("sales_leads").select("*").order("created_at", { ascending: false });
    if (!error && data) setLeads(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      value: formData.value,
      notes: formData.notes
    };

    if (formData.id) {
      const { error } = await supabase.from("sales_leads").update(payload).eq("id", formData.id);
      if (error) toast.error("Error updating lead");
      else toast.success("Lead updated successfully!");
    } else {
      const { error } = await supabase.from("sales_leads").insert([payload]);
      if (error) toast.error("Error creating lead");
      else toast.success("Lead created successfully!");
    }
    
    setShowModal(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    const { error } = await supabase.from("sales_leads").delete().eq("id", id);
    if (error) toast.error("Error deleting lead");
    else loadData();
  };

  const filtered = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || (l.email && l.email.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Leads & Pipeline</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">CRM Management</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ id: "", name: "", email: "", phone: "", status: "New", value: 0, notes: "" });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors"
        >
          <Plus size={13} /> New Lead
        </button>
      </div>

      <div className="flex items-center gap-4 bg-[#1E1E1E] p-4 rounded-lg border border-white/5 shrink-0">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH LEADS..." 
            className="w-full bg-[#121212] border border-white/5 rounded px-3 py-2 pl-9 text-[11px] font-bold text-white uppercase tracking-wider outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#121212] border border-white/5 rounded px-3 py-2 text-[11px] font-bold text-white uppercase tracking-wider outline-none w-48"
        >
          <option value="All">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Negotiating">Negotiating</option>
          <option value="Closed Won">Closed Won</option>
          <option value="Closed Lost">Closed Lost</option>
        </select>
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded-lg overflow-y-auto flex-1 min-h-0">
        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={24} /></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#121212] sticky top-0 z-10 border-b border-white/5">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Lead Info</th>
                <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Contact</th>
                <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Pipeline Stage</th>
                <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Value</th>
                <th className="px-4 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(lead => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-white">{lead.name}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5 truncate max-w-[200px]">{lead.notes || "No notes"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] text-neutral-300">{lead.email || "-"}</p>
                    <p className="text-[11px] text-neutral-500">{lead.phone || "-"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      lead.status === 'Closed Won' ? 'bg-emerald-500/20 text-emerald-400' :
                      lead.status === 'Closed Lost' ? 'bg-red-500/20 text-red-400' :
                      lead.status === 'New' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-bold text-emerald-400">${Number(lead.value).toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setFormData(lead); setShowModal(true); }} className="p-1.5 text-neutral-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(lead.id)} className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 text-sm">No leads found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#121212]">
              <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Users size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">{formData.id ? "Edit Lead" : "New Lead"}</h3>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">Pipeline CRM</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Full Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#121212] border border-white/5 rounded px-3 py-2 text-sm text-white focus:border-indigo-500/50 outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#121212] border border-white/5 rounded px-3 py-2 text-sm text-white focus:border-indigo-500/50 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#121212] border border-white/5 rounded px-3 py-2 text-sm text-white focus:border-indigo-500/50 outline-none transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Pipeline Stage</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-[#121212] border border-white/5 rounded px-3 py-2 text-sm text-white focus:border-indigo-500/50 outline-none transition-colors">
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Negotiating">Negotiating</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Value ($)</label>
                  <input type="number" min="0" value={formData.value} onChange={e => setFormData({...formData, value: parseFloat(e.target.value) || 0})} className="w-full bg-[#121212] border border-white/5 rounded px-3 py-2 text-sm text-white focus:border-indigo-500/50 outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">Notes</label>
                <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-[#121212] border border-white/5 rounded px-3 py-2 text-sm text-white focus:border-indigo-500/50 outline-none transition-colors" />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-[11px] font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-widest rounded transition-colors shadow-lg shadow-indigo-500/20">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
