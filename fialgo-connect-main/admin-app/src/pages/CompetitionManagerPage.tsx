import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Trophy, Plus, Calendar, Users, Edit3, Trash2, Save, X } from "lucide-react";

interface Competition {
  id?: string;
  title: string;
  status: "upcoming" | "in_progress" | "finished";
  start_date: string;
  end_date: string;
  prize_pool: string;
  max_contestants: number;
  created_at?: string;
}

export default function CompetitionManagerPage() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Competition>({
    title: "", status: "upcoming", start_date: "", end_date: "",
    prize_pool: "", max_contestants: 1000
  });

  const fetchCompetitions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("competitions")
      .select("*")
      .order("created_at", { ascending: false });
    setCompetitions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCompetitions();

    const channel = supabase
      .channel('competitions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competitions' }, () => {
        fetchCompetitions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSave = async () => {
    if (editId) {
      await supabase.from("competitions").update({
        title: form.title, status: form.status, start_date: form.start_date,
        end_date: form.end_date, prize_pool: form.prize_pool, max_contestants: form.max_contestants
      }).eq("id", editId);
    } else {
      await supabase.from("competitions").insert([form]);
    }
    setShowForm(false);
    setEditId(null);
    setForm({ title: "", status: "upcoming", start_date: "", end_date: "", prize_pool: "", max_contestants: 1000 });
    fetchCompetitions();
  };

  const handleEdit = (comp: any) => {
    setForm(comp);
    setEditId(comp.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("competitions").delete().eq("id", id);
    fetchCompetitions();
  };

  const statusColor = (s: string) => {
    if (s === "in_progress") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (s === "upcoming") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    return "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Competition Manager</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">Create & Manage Monthly Competitions</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: "", status: "upcoming", start_date: "", end_date: "", prize_pool: "", max_contestants: 1000 }); }}
          className="self-start sm:self-auto px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-white/10 transition-none uppercase tracking-widest flex items-center gap-2">
          <Plus size={12} /> New Competition
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-[#1E1E1E] border border-white/10 rounded-xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">{editId ? "Edit Competition" : "Create New Competition"}</h3>
            <button onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-white p-1"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full bg-[#121212] border border-white/5 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-white/20" placeholder="October Competition '25" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}
                className="w-full bg-[#121212] border border-white/5 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-white/20">
                <option value="upcoming">Upcoming</option>
                <option value="in_progress">In Progress</option>
                <option value="finished">Finished</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="w-full bg-[#121212] border border-white/5 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="w-full bg-[#121212] border border-white/5 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Prize Pool</label>
              <input value={form.prize_pool} onChange={e => setForm({ ...form, prize_pool: e.target.value })}
                className="w-full bg-[#121212] border border-white/5 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-white/20" placeholder="₹8,000 Cash & Challenge Accounts" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Max Contestants</label>
              <input type="number" value={form.max_contestants} onChange={e => setForm({ ...form, max_contestants: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#121212] border border-white/5 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-white/20" />
            </div>
          </div>
          <button onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 transition-colors">
            <Save size={12} /> {editId ? "Update" : "Create"}
          </button>
        </div>
      )}

      {/* Competition Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        {loading ? (
          <div className="col-span-1 lg:col-span-2 bg-[#1E1E1E] border border-white/5 rounded-xl p-12 text-center text-neutral-500 text-[10px] uppercase tracking-widest">
            Loading competitions...
          </div>
        ) : competitions.length === 0 ? (
          <div className="col-span-1 lg:col-span-2 bg-[#1E1E1E] border border-white/5 rounded-xl p-12 text-center text-neutral-500 text-[10px] uppercase tracking-widest">
            No competitions found. Create one above.
          </div>
        ) : competitions.map(comp => (
          <div key={comp.id} className="bg-[#1E1E1E] border border-white/5 rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Trophy size={16} className="text-amber-500 shrink-0" />
                <h3 className="text-[13px] font-bold text-white uppercase truncate">{comp.title}</h3>
              </div>
              <span className={`self-start sm:self-auto px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border shrink-0 ${statusColor(comp.status)}`}>
                {comp.status?.replace("_", " ")}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                <Calendar size={11} className="text-neutral-500 shrink-0" /> {comp.start_date ? new Date(comp.start_date).toLocaleDateString() : "TBD"} — {comp.end_date ? new Date(comp.end_date).toLocaleDateString() : "TBD"}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                <Users size={11} className="text-neutral-500 shrink-0" /> Max: {comp.max_contestants?.toLocaleString() || "Unlimited"}
              </div>
            </div>
            <p className="text-[10px] text-neutral-300 mb-3 bg-white/[0.02] border border-white/5 rounded p-2">{comp.prize_pool || "No prize defined"}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => handleEdit(comp)} className="px-3 py-1.5 text-[9px] font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-white/5 rounded-lg uppercase flex items-center gap-1">
                <Edit3 size={11} /> Edit
              </button>
              <button onClick={() => handleDelete(comp.id)} className="px-3 py-1.5 text-[9px] font-bold bg-neutral-800 hover:bg-red-950/50 text-neutral-400 hover:text-red-400 border border-white/5 rounded-lg uppercase flex items-center gap-1">
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
