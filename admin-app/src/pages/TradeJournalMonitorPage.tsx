import { useState, useEffect } from "react";
import { BookOpen, Search, Eye, Filter, Calendar, Activity, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function TradeJournalMonitorPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const { data, error } = await supabase
        .from('trade_journals')
        .select(`*, profiles:user_id (full_name)`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setJournals(data || []);
    } catch (err) {
      console.error("Error fetching journals:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Journal Monitor</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            User Trading Diaries & Psychology
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Journals", val: journals.length.toString() },
          { label: "Entries Today", val: journals.length.toString() },
          { label: "Avg Discipline", val: journals.length ? Math.round(journals.reduce((acc, j) => acc + (j.discipline_score || 0), 0) / journals.length) + "/100" : "0/100" },
          { label: "High Risk Psych", val: journals.filter(j => j.emotional_state === 'Revenge Trading').length.toString(), alert: true }
        ].map((m, i) => (
          <div key={i} className="bg-[#1E1E1E] border border-white/5 p-5 rounded">
            <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-widest mb-1">{m.label}</p>
            <p className={`text-xl font-bold ${m.alert ? 'text-rose-500' : 'text-white'}`}>{m.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden flex flex-col h-[calc(100vh-280px)]">
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
           <div className="relative w-[300px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search user journals..." 
                className="bg-[#121212] border border-white/5 rounded pl-9 pr-4 py-1.5 text-[11px] text-white w-full focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
             <div className="h-full flex items-center justify-center">
                <Loader2 size={24} className="text-blue-500 animate-spin" />
             </div>
          ) : journals.length === 0 ? (
             <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                No trade journals found.
             </div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">User</th>
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Activity</th>
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Psychology</th>
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {journals.map((journal) => (
                <tr key={journal.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <BookOpen size={14} />
                      </div>
                      <p className="text-[12px] font-bold text-white">{journal.profiles?.full_name || 'Anonymous'}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-white">1 Entries</p>
                      <div className="flex items-center gap-1.5 text-[9px] text-neutral-500 uppercase tracking-widest">
                        <Calendar size={10} />
                        Last: {new Date(journal.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[9px] text-neutral-600 uppercase tracking-widest">Score</p>
                        <p className={`text-[12px] font-bold ${journal.discipline_score >= 80 ? 'text-emerald-500' : journal.discipline_score >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {journal.discipline_score}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-neutral-600 uppercase tracking-widest">State</p>
                        <div className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded border ${
                          journal.emotional_state === 'Revenge Trading' 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                        }`}>
                          <span className="text-[8px] font-bold uppercase tracking-widest">{journal.emotional_state || 'Neutral'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 rounded bg-black border border-white/5 text-neutral-500 hover:text-white hover:border-white/20 transition-all opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest">
                      <Eye size={12} /> Inspect
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
