import { useState, useEffect } from "react";
import { Download, Plus, Search, Filter, Briefcase, Mail, Phone, Calendar, ArrowRight, UserCheck, Loader2 } from "lucide-react";
export type CandidateStage = 'applied' | 'interview' | 'offer' | 'hired' | 'rejected';
import { supabase } from "../../lib/supabase";
import { exportToExcel } from "../../lib/exportUtils";
import AddCandidateModal from "./AddCandidateModal";

const STAGES: { id: CandidateStage; label: string; color: string }[] = [
  { id: "applied", label: "Applied", color: "border-neutral-500 text-neutral-400 bg-neutral-500/10" },
  { id: "interview", label: "Interviewing", color: "border-blue-500 text-blue-400 bg-blue-500/10" },
  { id: "offer", label: "Offer Extended", color: "border-amber-500 text-amber-400 bg-amber-500/10" },
  { id: "hired", label: "Hired", color: "border-emerald-500 text-emerald-400 bg-emerald-500/10" },
  { id: "rejected", label: "Rejected", color: "border-red-500 text-red-400 bg-red-500/10" },
];

export default function HiringPipelinePage() {
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("hr_candidates").select("*").order("created_at", { ascending: false });
    if (data) setCandidates(data);
    setLoading(false);
  };

  useEffect(() => {
    load();

    const channel = supabase
      .channel('hr_candidates_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hr_candidates' }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const depts = ["All", ...new Set(candidates.map(c => c.department))];

  const filtered = candidates.filter(c => {
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.role_applied.toLowerCase().includes(query.toLowerCase());
    const matchesDept = deptFilter === "All" || c.department === deptFilter;
    return matchesQuery && matchesDept;
  });

  const getCandidatesInStage = (stage: CandidateStage) => filtered.filter(c => c.stage === stage);

  const updateCandidateStage = async (id: string, newStage: string) => {
    const { error } = await supabase.from("hr_candidates").update({ stage: newStage }).eq("id", id);
    if (!error) {
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, stage: newStage } : c));
    }
  };

  const handleExportExcel = () => {
    const data = filtered.map(c => ({
      ID: c.id,
      Name: c.name,
      Role: c.role_applied,
      Department: c.department,
      Stage: c.stage.toUpperCase(),
      Experience: `${c.experience_years} years`,
      Email: c.email,
      Phone: c.phone,
      "Applied On": c.created_at,
    }));
    exportToExcel(data, "Tradifive_Hiring_Pipeline");
  };

  return (
    <div className="space-y-4 sm:space-y-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Hiring Pipeline</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
            Candidate Tracking & Recruitment
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1E1E1E] border border-white/5 hover:bg-white/[0.04] text-white text-[10px] font-bold uppercase tracking-widest rounded transition-none">
            <Download size={13} /> Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-none shadow-lg shadow-purple-500/20">
            <Plus size={13} /> New Candidate
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-[#1E1E1E] border border-white/5 rounded-xl shrink-0">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates..."
            className="w-full bg-[#121212] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[12px] text-white outline-none focus:border-indigo-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-neutral-500 shrink-0" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#121212] border border-white/5 rounded-lg px-3 py-2 text-[11px] font-bold text-white uppercase tracking-wider outline-none"
          >
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
          <p className="text-[12px] font-bold text-white uppercase tracking-widest">Loading Candidates...</p>
        </div>
      ) : (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 items-start snap-x snap-mandatory">
          {STAGES.map(stage => {
            const candidates = getCandidatesInStage(stage.id);
            return (
              <div key={stage.id} className="w-[280px] sm:w-[320px] flex-shrink-0 flex flex-col snap-start">
                <div className={`px-3 py-2 rounded-t-lg border-t-2 border-x border-x-white/5 bg-[#1E1E1E] flex justify-between items-center ${stage.color.split(' ')[0]}`}>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-white">
                    {stage.label}
                  </h3>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${stage.color}`}>
                    {candidates.length}
                  </span>
                </div>
                <div className="bg-[#121212] border-b border-x border-white/5 rounded-b-lg p-2 flex-1 overflow-y-auto space-y-3 min-h-[150px]">
                  {candidates.map(c => (
                    <div key={c.id} className="bg-[#1a1a24] border border-white/5 rounded p-3 cursor-pointer hover:border-white/20 transition-none group">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[12px] font-bold text-white leading-tight">{c.name}</p>
                        <span className="text-[9px] text-neutral-500 bg-black/50 px-1 py-0.5 rounded border border-white/5 whitespace-nowrap">
                          {c.experience_years}y exp
                        </span>
                      </div>

                      <div className="space-y-1 mb-3">
                        <p className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                          <Briefcase size={10} className="text-neutral-600" />
                          <span className="truncate">{c.role_applied}</span>
                        </p>
                        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest ml-4">
                          {c.department}
                        </p>
                      </div>

                      <p className="text-[10px] text-neutral-500 leading-snug line-clamp-2 bg-black/20 p-1.5 rounded border border-white/5 italic">
                        "{c.notes}"
                      </p>

                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-none">
                        <p className="text-[8px] text-neutral-500 flex items-center gap-1">
                          <Calendar size={9} /> {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                        <select
                          value={c.stage}
                          onChange={(e) => updateCandidateStage(c.id, e.target.value)}
                          className="bg-[#121212] border border-white/5 rounded px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-indigo-400 outline-none cursor-pointer hover:bg-[#1E1E1E]"
                        >
                          {STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  {candidates.length === 0 && (
                    <div className="h-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <AddCandidateModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            load();
          }}
        />
      )}
    </div>
  );
}
