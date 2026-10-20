import { useState, useEffect } from "react";
import { Megaphone, Users, Target, Send, History, AlertTriangle, Info, ShieldAlert, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function NotificationsBroadcasterPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "success" | "warning" | "danger">("info");
  const [target, setTarget] = useState<"all" | "active" | "frozen">("all");
  
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDispatch = async () => {
    if (!title || !message) return alert("Please enter title and message.");
    
    setLoading(true);
    try {
      const { error } = await supabase.from('push_notifications').insert({
        title,
        message,
        type,
        target_audience: target
      });
      if (error) throw error;
      
      setTitle("");
      setMessage("");
      fetchHistory();
      alert("Broadcast dispatched successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Broadcaster</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Global Push Notifications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Composer */}
        <div className="col-span-1 lg:col-span-2 bg-[#1E1E1E] border border-white/5 rounded-xl p-4 sm:p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 border-b border-white/5 pb-3 sm:pb-4">
            <Megaphone size={16} className="text-blue-500" />
            <h2 className="text-[12px] font-bold text-white uppercase tracking-widest">Compose Broadcast</h2>
          </div>

          <div className="space-y-4 sm:space-y-6 flex-1">
            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Notification Title</label>
              <input 
                type="text" 
                placeholder="e.g., System Maintenance Upcoming"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-[#121212] border border-white/5 rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Message Body</label>
              <textarea 
                placeholder="Enter the full broadcast message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full h-[120px] sm:h-[150px] bg-[#121212] border border-white/5 rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none custom-scrollbar"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Priority / Type</label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {[
                    { val: "info", label: "Info", icon: Info, color: "text-blue-500" },
                    { val: "warning", label: "Warn", icon: AlertTriangle, color: "text-amber-500" },
                    { val: "danger", label: "Critical", icon: ShieldAlert, color: "text-rose-500" }
                  ].map(t => (
                    <button 
                      key={t.val}
                      onClick={() => setType(t.val as any)}
                      className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 border rounded-lg transition-all ${
                        type === t.val ? 'bg-white/10 border-white/20 text-white' : 'bg-[#121212] border-white/5 text-neutral-500 hover:bg-white/5'
                      }`}
                    >
                      <t.icon size={13} className={type === t.val ? t.color : 'text-neutral-600'} />
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Target Audience</label>
                <select 
                  value={target}
                  onChange={e => setTarget(e.target.value as any)}
                  className="w-full bg-[#121212] border border-white/5 rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-[12px] text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="all">All Registered Users (Global)</option>
                  <option value="active">Active Subscriptions Only</option>
                  <option value="frozen">Frozen/Suspended Accounts</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 sm:pt-6 border-t border-white/5 flex justify-end">
            <button 
              onClick={handleDispatch}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-[11px] font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Dispatch Broadcast
            </button>
          </div>
        </div>

        {/* Live Preview & History */}
        <div className="space-y-6">
          <div className="bg-[#1E1E1E] border border-white/5 rounded p-6">
            <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Device Preview</h2>
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-4 shadow-2xl relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${
                type === 'info' ? 'bg-blue-500' : type === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${type === 'info' ? 'text-blue-500' : type === 'warning' ? 'text-amber-500' : 'text-rose-500'}`}>
                  {type === 'info' ? <Info size={16} /> : type === 'warning' ? <AlertTriangle size={16} /> : <ShieldAlert size={16} />}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white leading-tight">{title || "Notification Title"}</p>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-3">{message || "The notification message body will appear here..."}</p>
                  <p className="text-[9px] text-neutral-600 mt-2">Just now</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1E1E1E] border border-white/5 rounded p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Recent Broadcasts</h2>
              <History size={14} className="text-neutral-600" />
            </div>
            
            <div className="space-y-3 overflow-auto custom-scrollbar h-[200px]">
              {historyLoading ? (
                 <Loader2 size={16} className="text-blue-500 animate-spin mx-auto mt-4" />
              ) : history.length === 0 ? (
                 <p className="text-[10px] text-neutral-500 text-center mt-4">No broadcasts sent yet.</p>
              ) : history.map((h, i) => (
                <div key={h.id} className="bg-black/50 border border-white/5 rounded p-3 flex justify-between items-center">
                  <div>
                    <p className="text-[11px] font-bold text-white">{h.title}</p>
                    <p className="text-[9px] text-neutral-500 mt-0.5">{new Date(h.created_at).toLocaleString()}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${h.type === 'info' ? 'bg-blue-500' : h.type === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
