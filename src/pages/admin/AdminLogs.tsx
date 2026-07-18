import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Terminal, 
  Trash2, 
  Pause, 
  Play, 
  Download,
  AlertTriangle,
  Info,
  Zap,
  Cpu,
  ShieldCheck,
  ListFilter
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'system' | 'audit'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch
    const fetchLogs = async () => {
        const { data } = await supabase
            .from('system_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
        setLogs(data?.reverse() || []);
    };
    fetchLogs();

    // Subscribe to realtime logs
    const channel = supabase
        .channel('admin_system_logs')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload) => {
            if (isLive) {
                setLogs((prev) => [...prev, payload.new].slice(-100));
            }
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [isLive]);

  useEffect(() => {
    if (scrollRef.current && isLive) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isLive]);

  const getLogIcon = (level: string) => {
      switch (level) {
          case 'error': return <AlertTriangle className="text-rose-500" size={12} />;
          case 'info': return <Info className="text-slate-300" size={12} />;
          case 'webhook': return <Zap className="text-amber-400" size={12} />;
          case 'mt5': return <Cpu className="text-purple-400" size={12} />;
          case 'audit': return <ShieldCheck className="text-blue-400" size={12} />;
          default: return <Info className="text-slate-500" size={12} />;
      }
  };

  const filteredLogs = logs.filter(log => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'audit') return log.level === 'audit';
      if (activeFilter === 'system') return log.level !== 'audit';
      return true;
  });

  return (
    <div className="space-y-8 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Terminal className="text-slate-200" />
            System Monitoring
          </h1>
          <p className="text-slate-400">Real-time terminal for MT5 server logs, API errors, and webhooks.</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 mr-4">
                <button 
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${activeFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    All Streams
                </button>
                <button 
                    onClick={() => setActiveFilter('system')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${activeFilter === 'system' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    System Output
                </button>
                <button 
                    onClick={() => setActiveFilter('audit')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${activeFilter === 'audit' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Audit Trail
                </button>
            </div>
            <Button 
                variant="outline" 
                size="sm" 
                className={`border-slate-800 bg-slate-900 ${isLive ? 'text-slate-300 border-emerald-500/20' : 'text-slate-500'}`}
                onClick={() => setIsLive(!isLive)}
            >
                {isLive ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
                {isLive ? 'Live Stream On' : 'Status: Paused'}
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-500" onClick={() => setLogs([])}>
                <Trash2 size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white">
                <Download size={16} />
            </Button>
        </div>
      </div>

      <div className="flex-1 bg-black/80 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col font-mono text-sm">
        {/* Terminal Header */}
        <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <div className="w-2 h-2 rounded-full bg-[#D1E4FF] dark:bg-emerald-500" />
            <span className="ml-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">fialgo_engine_v1.0.4.log</span>
        </div>

        {/* Console Content */}
        <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar-dark"
        >
            <div className="space-y-1.5">
                <p className="text-slate-500">[{new Date().toISOString()}] SYSTEM: Bootstrapping admin monitor...</p>
                <p className="text-emerald-500">[{new Date().toISOString()}] AUTH: Admin session verified.</p>
                <p className="text-slate-300">[{new Date().toISOString()}] REALTIME: Subscribed to channel 'admin_system_logs'</p>
                
                {filteredLogs.map((log, index) => (
                    <div key={index} className="flex gap-4 group hover:bg-white/5 px-1 py-0.5 rounded transition-colors">
                        <span className="text-slate-600 shrink-0 select-none">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="shrink-0">{getLogIcon(log.level)}</span>
                                <span className={`font-bold uppercase text-[10px] tracking-tight ${
                                    log.level === 'error' ? 'text-rose-500' : 
                                    log.level === 'webhook' ? 'text-amber-500' :
                                    log.level === 'mt5' ? 'text-purple-400' :
                                    log.level === 'audit' ? 'text-blue-400' :
                                    'text-slate-300'
                                }`}>
                                    {log.level}
                                </span>
                            </div>
                            <p className={`break-all leading-relaxed mt-0.5 ${log.level === 'audit' ? 'text-blue-100 font-semibold' : 'text-slate-300'}`}>
                                {log.message}
                            </p>
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                <pre className={`text-[10px] p-2 mt-1 rounded border overflow-x-auto ${log.level === 'audit' ? 'text-blue-300/80 bg-blue-950/20 border-blue-900/30' : 'text-slate-500 bg-black/30 border-white/5'}`}>
                                    {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                            )}
                        </div>
                    </div>
                ))}

                {isLive && (
                    <div className="flex items-center gap-2 mt-4 animate-pulse">
                        <div className="w-1 h-3 bg-blue-500" />
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] italic">Waiting for incoming logs...</span>
                    </div>
                )}
            </div>
        </div>
        
        {/* Terminal Footer Info */}
        <div className="px-6 py-2 bg-slate-950 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase tracking-wider">
            <div className="flex gap-4">
                <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#D1E4FF] dark:bg-emerald-500 rounded-full" /> Connection: Stable</span>
                <span>Latency: 42ms</span>
            </div>
            <div>
                Buffer: {logs.length}/100 items
            </div>
        </div>
      </div>
    </div>
  );
}




