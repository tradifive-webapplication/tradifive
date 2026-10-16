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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Channel Directory</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Social Broadcasting Control
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Channels", val: channels.filter(c => c.status !== 'suspended').length.toString() },
          { label: "Total Subscribers", val: channels.reduce((acc, c) => acc + (c.subscribers_count || 0), 0).toLocaleString() },
          { label: "Verified Creators", val: channels.filter(c => c.verified).length.toString() },
          { label: "Suspended", val: channels.filter(c => c.status === 'suspended').length.toString(), alert: true }
        ].map((m, i) => (
          <div key={i} className="bg-[#1E1E1E] border border-white/5 p-5 rounded">
            <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-widest mb-1">{m.label}</p>
            <p className={`text-xl font-bold ${m.alert ? 'text-amber-500' : 'text-white'}`}>{m.val}</p>
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
                placeholder="Search channels..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#121212] border border-white/5 rounded pl-9 pr-4 py-1.5 text-[11px] text-white w-[250px] focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-neutral-600"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
             <div className="h-full flex items-center justify-center">
                <Loader2 size={24} className="text-blue-500 animate-spin" />
             </div>
          ) : filteredChannels.length === 0 ? (
             <div className="h-full flex items-center justify-center">
                <p className="text-neutral-500 text-sm">No channels found.</p>
             </div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Channel</th>
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Creator</th>
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Metrics</th>
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02]">Status</th>
                <th className="p-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest bg-white/[0.02] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChannels.map((channel) => (
                <tr key={channel.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-black border border-white/5 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-neutral-500">{channel.name?.charAt(0) || 'C'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-bold text-white">{channel.name}</p>
                          {channel.verified && <ShieldCheck size={12} className="text-blue-500" />}
                        </div>
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">ID: {channel.id.slice(0,8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[11px] text-neutral-300">{channel.profiles?.full_name || 'Unknown'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[9px] text-neutral-600 uppercase tracking-widest">Subs</p>
                        <p className="text-[11px] font-mono text-neutral-300">{(channel.subscribers_count || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border ${
                      channel.status !== 'suspended' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${channel.status !== 'suspended' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">{channel.status || 'active'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleVerify(channel.id, channel.verified)}
                        className={`p-1.5 rounded border transition-colors ${
                          channel.verified ? 'bg-blue-500/10 border-blue-500/20 text-blue-500 hover:bg-blue-500/20' : 'bg-black border-white/5 text-neutral-500 hover:text-white'
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
