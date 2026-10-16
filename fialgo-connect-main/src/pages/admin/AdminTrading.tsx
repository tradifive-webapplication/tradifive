import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Activity, 
  Zap, 
  ShieldCheck, 
  ShieldOff, 
  Settings, 
  AlertTriangle, 
  Trash2, 
  Save,
  Globe,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminTrading() {
  const [globalKillSwitch, setGlobalKillSwitch] = useState(false);
  const [tradeCap, setTradeCap] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('system_settings')
        .select('*');
      
      const killSwitch = data?.find(s => s.id === 'global_kill_switch');
      const capSetting = data?.find(s => s.id === 'trade_cap');

      if (killSwitch) setGlobalKillSwitch(killSwitch.value === 'true' || killSwitch.value === true);
      if (capSetting) setTradeCap(parseInt(capSetting.value as string) || 3);
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleKillSwitch = async (checked: boolean) => {
    setGlobalKillSwitch(checked);
    const { error } = await supabase
      .from('system_settings')
      .upsert({ id: 'global_kill_switch', value: checked.toString(), updated_at: new Date().toISOString() });

    if (error) {
      toast.error("Failed to update Kill Switch");
      setGlobalKillSwitch(!checked);
    } else {
      toast(checked ? "GLOBAL KILL SWITCH ACTIVATED" : "Global Kill Switch Deactivated", {
        icon: checked ? <ShieldOff className="text-rose-500" /> : <ShieldCheck className="text-emerald-500" />,
        className: checked ? "bg-rose-950 border-rose-800 text-rose-200" : "bg-[#D1E4FF] dark:bg-blue-500merald-950 border-[#D6E4FF] dark:border-[#333333]merald-800 text-emerald-200"
      });
    }
  };

  const saveTradeCap = async () => {
    const { error } = await supabase
      .from('system_settings')
      .upsert({ id: 'trade_cap', value: tradeCap.toString(), updated_at: new Date().toISOString() });

    if (error) {
      toast.error("Failed to update trade cap");
    } else {
      toast.success("Global trade cap updated to " + tradeCap);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Trading Engine Control</h1>
          <p className="text-slate-400">Master controls for platform-wide MT5 bot execution.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Kill Switch Card */}
        <div className={`p-8 rounded-3xl border transition-all duration-500 ${
            globalKillSwitch 
            ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.1)]' 
            : 'bg-slate-900 border-slate-800 shadow-xl'
        }`}>
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${globalKillSwitch ? 'bg-rose-500 text-white' : 'bg-white text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'}`}>
                        {globalKillSwitch ? <ShieldOff size={32} /> : <Zap size={32} />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Global Kill Switch</h2>
                        <p className={`text-xs font-bold uppercase tracking-widest ${globalKillSwitch ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`}>
                            {globalKillSwitch ? 'Emergency Stop Active' : 'System Operational'}
                        </p>
                    </div>
                </div>
                <Switch 
                    checked={globalKillSwitch}
                    onCheckedChange={handleKillSwitch}
                    className="data-[state=checked]:bg-rose-600 data-[state=unchecked]:bg-slate-700 h-8 w-14"
                />
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed mb-8">
                Activating the Global Kill Switch will <span className="text-white font-bold underline">instantly pause</span> all active trading bots and prevent new trades from being executed across the entire platform. Use only in case of extreme market volatility or API emergencies.
            </p>

            {globalKillSwitch && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-200 text-xs">
                    <AlertTriangle size={16} className="shrink-0" />
                    Warning: 142 active bots have been forcefully paused.
                </div>
            )}
        </div>

        {/* Global Risk Management */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Settings size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white mb-1">Global Risk Config</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-6">Default Platform Guards</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-300">Default Trade Cap (Daily)</label>
                    <div className="flex gap-3">
                        <Input 
                            type="number" 
                            className="bg-slate-950 border-slate-800 focus:ring-amber-500/50" 
                            value={tradeCap}
                            onChange={(e) => setTradeCap(parseInt(e.target.value))}
                        />
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={saveTradeCap}>
                            <Save size={16} className="mr-2" />
                            Update
                        </Button>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">This enforces a strict limit on how many trades a user can take per day by default.</p>
                </div>

                <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-white">Institutional Override</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-tight">Allow high-tier users to exceed cap</p>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-white" />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Engine Instances */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="text-slate-200" size={18} />
                Engine Instances
            </h3>
            <div className="space-y-3">
                {[
                    { id: 'MT5-CORE-01', location: 'Frankfurt', load: '12%', status: 'Online' },
                    { id: 'MT5-CORE-02', location: 'London', load: '45%', status: 'Online' },
                    { id: 'MT5-CORE-03', location: 'New York', load: '82%', status: 'Critical' },
                    { id: 'WEBHOOK-01', location: 'Global Edge', load: '8%', status: 'Online' },
                ].map((instance) => (
                    <div key={instance.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800 group hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${instance.status === 'Online' ? 'bg-[#D1E4FF] dark:bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse'}`} />
                            <div>
                                <p className="text-sm font-bold text-white font-mono">{instance.id}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{instance.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400">Load: {instance.load}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-slate-600 hover:text-rose-500">
                                <RefreshCcw size={16} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Global Stats */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
            <Globe className="absolute -right-8 -bottom-8 text-slate-200/5 rotate-12" size={200} />
            <h3 className="text-lg font-bold mb-6">Execution Analytics</h3>
            <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Daily Trades Executed</p>
                        <p className="text-2xl font-bold text-white">4,129</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl text-slate-200">
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Avg Latency (MT5)</p>
                        <p className="text-2xl font-bold text-white">12ms</p>
                    </div>
                    <div className="p-3 bg-[#D1E4FF] dark:bg-emerald-500/10 rounded-xl text-emerald-500">
                        <Activity size={24} />
                    </div>
                </div>
                
                <div className="mt-8">
                    <Button variant="outline" className="w-full border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10">
                        <Trash2 size={16} className="mr-2" />
                        Clear Global Cache
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

const RefreshCcw = ({ size, className }: { size: number, className: string }) => (
    <Activity size={size} className={className} />
);




