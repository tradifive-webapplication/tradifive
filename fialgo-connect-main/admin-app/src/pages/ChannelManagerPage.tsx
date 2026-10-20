import { useState, useEffect } from "react";
import { Users, Search, Filter, ShieldCheck, Zap, MoreHorizontal, UserX, Trash2, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ChannelManagerPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select(`*, profiles:created_by (full_name)`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setChannels(data || []);
    } catch (err) {
      console.error("Error fetching channels:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await supabase.from('channels').update({ status: newStatus }).eq('id', id);
    setChannels(channels.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const toggleVerify = async (id: string, currentVerified: boolean) => {
    const newVerified = !currentVerified;
    await supabase.from('channels').update({ verified: newVerified }).eq('id', id);
    setChannels(channels.map(c => c.id === id ? { ...c, verified: newVerified } : c));
  };

  const deleteChannel = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this channel?")) return;
    await supabase.from('channels').delete().eq('id', id);
    setChannels(channels.filter(c => c.id !== id));
  };

  const filteredChannels = channels.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Channel Directory</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
            Social Broadcasting Control
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          { label: "Active Channels", val: channels.filter(c => c.status !== 'suspended').length.toString() },
          { label: "Total Subscribers", val: channels.reduce((acc, c) => acc + (c.subscribers_count || 0), 0).toLocaleString() },
          { label: "Verified Creators", val: channels.filter(c => c.verified).length.toString() },
          { label: "Suspended", val: channels.filter(c => c.status === 'suspended').length.toString(), alert: true }
        ].map((m, i) => (
          <div key={i} className="bg-[#1E1E1E] border border-white/5 p-3.5 sm:p-5 rounded-xl">
            <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest mb-1 truncate">{m.label}</p>
            <p className={`text-base sm:text-xl font-bold truncate ${m.alert ? 'text-amber-500' : 'text-white'}`}>{m.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        {/* Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-white/5 flex items-center justify-between gap-3 bg-white/[0.02]">
          <div className="relative w-full sm:w-[250px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search channels..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#121212] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[11px] text-white w-full focus:outline-none focus:border-white/20 transition-colors placeholder:text-neutral-500"
            />
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-white/5">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 size={20} className="text-blue-500 animate-spin" />
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-[10px] uppercase tracking-widest">
              No channels found
            </div>
          ) : (
            filteredChannels.map((channel) => (
              <div key={channel.id} className="p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-black border border-white/5 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-neutral-400">{channel.name?.charAt(0) || 'C'}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-white uppercase truncate">{channel.name}</p>
                        {channel.verified && <ShieldCheck size={12} className="text-blue-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-neutral-500 truncate mt-0.5">by {channel.profiles?.full_name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest shrink-0 ${
                    channel.status !== 'suspended' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    <div className={`w-1 h-1 rounded-full ${channel.status !== 'suspended' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span>{channel.status || 'active'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-white/5 font-mono">
                  <span>{(channel.subscribers_count || 0).toLocaleString()} subscribers</span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => toggleVerify(channel.id, channel.verified)}
                      className={`p-1.5 rounded border transition-colors ${
                        channel.verified ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-black border-white/5 text-neutral-400'
                      }`}
                      title="Toggle Verification"
                    >
                      <ShieldCheck size={13} />
                    </button>
                    <button 
                      onClick={() => toggleStatus(channel.id, channel.status)}
                      className="p-1.5 rounded bg-black border border-white/5 text-neutral-400 hover:text-amber-400 transition-colors"
                      title="Toggle Suspension"
                    >
                      <UserX size={13} />
                    </button>
                    <button 
                      onClick={() => deleteChannel(channel.id)} 
                      className="p-1.5 rounded bg-black border border-white/5 text-neutral-400 hover:text-rose-400 transition-colors" 
                      title="Delete Channel"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
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
          ) : filteredChannels.length === 0 ? (
             <div className="p-12 text-center text-neutral-500 text-[10px] uppercase tracking-widest">
                No channels found
             </div>
          ) : (
          <table className="w-full text-left whitespace-nowrap">
            <thead className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.2em] bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-5 py-3.5">Channel</th>
                <th className="px-5 py-3.5">Creator</th>
                <th className="px-5 py-3.5">Metrics</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredChannels.map((channel) => (
                <tr key={channel.id} className="hover:bg-white/[0.01] transition-none group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-black border border-white/5 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-neutral-400">{channel.name?.charAt(0) || 'C'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-bold text-white uppercase">{channel.name}</p>
                          {channel.verified && <ShieldCheck size={12} className="text-blue-500" />}
                        </div>
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">ID: {channel.id.slice(0,8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] text-neutral-300 font-bold uppercase">{channel.profiles?.full_name || 'Unknown'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-[9px] text-neutral-500 uppercase tracking-widest">Subs</p>
                      <p className="text-[11px] font-mono text-neutral-300 font-bold">{(channel.subscribers_count || 0).toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border ${
                      channel.status !== 'suspended' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${channel.status !== 'suspended' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">{channel.status || 'active'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => toggleVerify(channel.id, channel.verified)}
                        className={`p-1.5 rounded border transition-colors ${
                          channel.verified ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20' : 'bg-black border-white/5 text-neutral-500 hover:text-white'
                        }`}
                        title="Toggle Verification"
                      >
                        <ShieldCheck size={14} />
                      </button>
                      <button 
                        onClick={() => toggleStatus(channel.id, channel.status)}
                        className="p-1.5 rounded bg-black border border-white/5 text-neutral-500 hover:text-amber-500 transition-colors"
                        title="Toggle Suspension"
                      >
                        <UserX size={14} />
                      </button>
                      <button onClick={() => deleteChannel(channel.id)} className="p-1.5 rounded bg-black border border-white/5 text-neutral-500 hover:text-rose-500 transition-colors" title="Delete Channel">
                        <Trash2 size={14} />
                      </button>
                    </div>
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
