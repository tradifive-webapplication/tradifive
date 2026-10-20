import { useState, useEffect } from "react";
import { Flag, Search, Filter, ShieldAlert, Check, Trash2, ExternalLink, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ContentModerationPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "resolved">("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlags();
  }, [activeTab]);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('moderation_flags')
        .select(`*, profiles:reporter_id (full_name)`)
        .eq('status', activeTab)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setFlags(data || []);
    } catch (err) {
      console.error("Error fetching flags:", err);
    } finally {
      setLoading(false);
    }
  };

  const resolveFlag = async (id: string, action: 'approve' | 'delete') => {
    // In a real app, 'delete' might also delete the underlying content
    await supabase.from('moderation_flags').update({ status: 'resolved' }).eq('id', id);
    setFlags(flags.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Content Moderation</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
            Community Integrity & Safety
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 pb-px overflow-x-auto scrollbar-none">
        <button 
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 shrink-0 ${
            activeTab === 'pending' ? 'text-white border-blue-500' : 'text-neutral-500 border-transparent hover:text-neutral-300'
          }`}
        >
          Pending Review
          {activeTab === 'pending' && flags.length > 0 && (
            <span className="ml-2 bg-rose-500 text-white px-1.5 py-0.5 rounded text-[8px]">{flags.length}</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab("resolved")}
          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 shrink-0 ${
            activeTab === 'resolved' ? 'text-white border-blue-500' : 'text-neutral-500 border-transparent hover:text-neutral-300'
          }`}
        >
          Resolved Log
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
           <div className="flex items-center justify-center p-12">
              <Loader2 size={24} className="text-blue-500 animate-spin" />
           </div>
        ) : flags.length === 0 ? (
          <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <ShieldAlert size={32} className="text-emerald-500 mb-4 opacity-50" />
            <p className="text-white text-sm font-bold">Queue Empty</p>
            <p className="text-neutral-500 text-[11px] mt-1">No {activeTab} content moderation reports.</p>
          </div>
        ) : (
          flags.map((flag) => (
            <div key={flag.id} className="bg-[#1E1E1E] border border-rose-500/20 rounded-xl p-4 sm:p-5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-2 py-0.5 bg-black border border-white/5 rounded text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                    {flag.content_type}
                  </div>
                  <span className="text-[11px] font-bold text-white">@{flag.profiles?.full_name || 'Anonymous'}</span>
                  <span className="text-[10px] text-neutral-500">• {new Date(flag.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 shrink-0">
                  <AlertTriangle size={11} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{flag.reason}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-white/5">
                <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors self-start">
                  <ExternalLink size={12} />
                  View Original Context
                </button>
                
                {activeTab === 'pending' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button 
                      onClick={() => resolveFlag(flag.id, 'approve')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black border border-white/5 rounded-lg hover:border-emerald-500/50 hover:text-emerald-500 transition-colors text-[10px] font-bold text-neutral-400 uppercase tracking-widest"
                    >
                      <Check size={13} />
                      Keep / Dismiss
                    </button>
                    <button 
                      onClick={() => resolveFlag(flag.id, 'delete')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                    >
                      <Trash2 size={13} />
                      Remove Content
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
