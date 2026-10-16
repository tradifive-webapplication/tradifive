import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  Terminal,
  Search,
  Trash2,
  Pause,
  Play,
  Download,
  AlertCircle,
  Info,
  Webhook,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch initial logs
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setLogs(data?.reverse() || []);
    };
    fetchLogs();

    // 2. Realtime subscription (Supabase)
    const channel = supabase
      .channel('admin_logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload: any) => {
        if (!isPaused) {
          setLogs(prev => [...prev.slice(-99), payload.new]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isPaused]);

  useEffect(() => {
    if (scrollRef.current && !isPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle size={14} className="text-rose-500" />;
      case 'webhook': return <Webhook size={14} className="text-blue-500" />;
      case 'mt5': return <Bot size={14} className="text-purple-500" />;
      default: return <Info size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up h-full flex flex-col pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">System Terminal</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">Live Execution & Error Stream</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-slate-800 bg-slate-900/50 text-slate-300 rounded-xl"
            onClick={() => setLogs([])}
          >
            <Trash2 size={16} className="mr-2" />
            Clear
          </Button>
          <Button
            variant="outline"
            className={`border-slate-800 rounded-xl transition-all ${isPaused ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900/50 text-slate-300'}`}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play size={16} className="mr-2" /> : <Pause size={16} className="mr-2" />}
            {isPaused ? "Resume Feed" : "Pause Stream"}
          </Button>
          <Button variant="outline" className="border-slate-800 bg-slate-900/50 text-slate-300 rounded-xl">
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-slate-950 border border-slate-900 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative">
        {/* Terminal Header */}
        <div className="px-8 py-4 bg-slate-900/50 border-b border-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40" />
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
            </div>
            <div className="w-px h-4 bg-slate-800" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">fi_connect_engine_main v2.0.4</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-emerald-500 uppercase flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              WebSocket Connected
            </span>
          </div>
        </div>

        {/* Logs Stream */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 font-mono text-xs space-y-3 custom-scrollbar-dark selection:bg-blue-500/30"
        >
          {logs.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <Terminal size={48} className="mb-4" />
              <p className="italic">Awaiting initial telemetry data packet...</p>
            </div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4 group hover:bg-white/5 p-2 rounded-lg transition-colors items-start">
              <span className="text-slate-700 shrink-0 select-none">[{new Date(log.created_at).toLocaleTimeString()}]</span>
              <div className="flex items-center gap-2 shrink-0">
                {getLogIcon(log.level)}
                <span className={`font-bold uppercase tracking-tight text-[10px] w-16 ${log.level === 'error' ? 'text-rose-500' :
                  log.level === 'webhook' ? 'text-blue-500' :
                    log.level === 'mt5' ? 'text-purple-500' :
                      'text-slate-600'
                  }`}>
                  {log.level}
                </span>
              </div>
              <p className="text-slate-300 break-all leading-relaxed">
                <span className="text-slate-500 font-bold mr-2">{log.event}:</span>
                {typeof log.message === 'string' ? log.message : JSON.stringify(log.message)}
              </p>
            </div>
          ))}
        </div>

        {/* Console Input Bar */}
        <div className="p-4 bg-slate-900/30 border-t border-slate-900 flex items-center gap-4 shrink-0">
          <span className="text-blue-500 font-bold ml-4 select-none">❯</span>
          <input
            type="text"
            placeholder="Type master command or filter..."
            className="bg-transparent border-none outline-none text-slate-400 w-full placeholder:text-slate-800 italic"
          />
        </div>
      </div>
    </div>
  );
}
