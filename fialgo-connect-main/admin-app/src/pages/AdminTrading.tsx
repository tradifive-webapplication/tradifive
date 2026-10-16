import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
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
  RefreshCcw,
  Network,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createNotification } from "../lib/notifications";

export default function AdminTrading() {
  const [globalKillSwitch, setGlobalKillSwitch] = useState(false);
  const [tradeCap, setTradeCap] = useState(3);
  const [loading, setLoading] = useState(true);

  // Advanced Maintenance Engine State
  const [maintenance, setMaintenance] = useState({
    active: false,
    mode: 'Soft', // Soft, Limited, Full
    severity: 'Info', // Info, Warning, Critical
    title: 'Platform Maintenance',
    message: 'We are currently performing routine system optimizations to ensure peak execution performance.',
    resolutionTime: '60',
    startTime: '',
    endTime: '',
    autoSchedule: false,
    channels: { banner: true, push: false, email: false, whatsapp: false },
    whitelist: '', // Comma separated IDs
    updatedAt: new Date().toISOString()
  });

  const [activeUsers, setActiveUsers] = useState(142); // Demo stat

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data } = await supabase.from('system_settings').select('*');
      const killSwitch = data?.find(s => s.id === 'global_kill_switch');
      const maintMode = data?.find(s => s.id === 'maintenance_mode');
      const capSetting = data?.find(s => s.id === 'trade_cap');

      if (killSwitch) setGlobalKillSwitch(killSwitch.value === 'true' || killSwitch.value === true);
      if (maintMode && maintMode.value) {
        setMaintenance(prev => ({ ...prev, ...maintMode.value }));
      }
      if (capSetting) setTradeCap(parseInt(capSetting.value as string) || 3);

      // Fetch live user count instead of demo stat
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (count !== null) setActiveUsers(count);

      setLoading(false);
    };
    fetchSettings();
  }, []);

  const saveMaintenance = async (updates: Partial<typeof maintenance>) => {
    const newState = { ...maintenance, ...updates, updatedAt: new Date().toISOString() };
    setMaintenance(newState);

    const { error } = await supabase
      .from('system_settings')
      .upsert({
        id: 'maintenance_mode',
        value: newState,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("CRITICAL: Maintenance Sync Error:", error.message);
      toast.error("Protocol Sync Failed: " + error.message);
    } else {
      if (updates.active !== undefined) {
        toast(updates.active ? "MAINTENANCE INITIATED" : "PROTOCOL DEACTIVATED", {
          icon: <Wrench className="text-amber-500" />,
          className: updates.active ? "bg-amber-950 border-amber-800 text-amber-200 shadow-2xl" : ""
        });

        if (updates.active) {
          broadcastMaintenance(newState);
        }
      }
    }
  };

  const broadcastMaintenance = async (state: typeof maintenance) => {
    const { data: users } = await supabase.from('profiles').select('id');
    if (users) {
      for (const user of users) {
        await createNotification({
          userId: user.id,
          type: 'SYSTEM',
          title: state.title,
          message: `${state.message} Est. resolution: ${state.resolutionTime} mins. Status: ${state.mode} Mode.`,
          priority: state.severity === 'Critical' ? 'high' : 'normal'
        });
      }
    }
  };

  const broadcastGlobalHalt = async (active: boolean) => {
    const { data: users } = await supabase.from('profiles').select('id');
    if (users) {
      for (const user of users) {
        await createNotification({
          userId: user.id,
          type: 'SECURITY',
          title: active ? 'EMERGENCY HALT' : 'Operational Restored',
          message: active
            ? 'Institutional command has issued an Emergency Halt. Platform access is restricted.'
            : 'Platform operations have been restored. Systems are online.',
          priority: 'high'
        });
      }
    }
  };

  const handleKillSwitch = async (checked: boolean) => {
    setGlobalKillSwitch(checked);
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        id: 'global_kill_switch',
        value: { active: checked },
        updated_at: new Date().toISOString()
      });

    if (error) {
      toast.error("Kill Switch Handshake Failed");
      setGlobalKillSwitch(!checked);
    } else {
      toast(checked ? "EMERGENCY HALT INITIATED" : "Manual Halt Released", {
        icon: checked ? <ShieldOff className="text-rose-500" /> : <ShieldCheck className="text-blue-500" />,
        className: checked ? "bg-rose-950 border-rose-800 text-rose-200 shadow-2xl" : "bg-blue-950 border-blue-900 text-blue-200"
      });

      await broadcastGlobalHalt(checked);
    }
  };

  const saveTradeCap = async () => {
    const { error } = await supabase
      .from('system_settings')
      .upsert({ id: 'trade_cap', value: tradeCap.toString(), updated_at: new Date().toISOString() });
    if (error) toast.error("Config update failed");
    else toast.success("New Global Trade Cap sync'd: " + tradeCap);
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Kimi AI & Control Center</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            System Resource Management & Neural Protocol Intervention
          </p>
        </div>
        <div className="flex items-center gap-4 px-4 py-2 bg-[#1E1E1E] border border-white/5 rounded">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{activeUsers} Active Traders</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Dedicated Emergency System Halt Header */}
        <div className={`bg-[#121212] border border-white/5 rounded-xl px-10 py-5 transition-all duration-500 relative overflow-hidden ${globalKillSwitch ? 'border-rose-500/30 bg-rose-950/10' : ''
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className={`w-12 h-12 rounded-lg bg-[#1E1E1E] border flex items-center justify-center transition-all ${globalKillSwitch ? 'border-rose-500/50 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-white/10 text-neutral-600'
                }`}>
                <Zap size={24} />
              </div>
              <div>
                <h2 className="text-[15px] font-black text-white uppercase tracking-[0.1em]">Emergency System Halt</h2>
                <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mt-1">
                  Institutional authority to suspend all platform activities
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Master Execution Halt</span>
                {globalKillSwitch && <span className="text-[7px] text-rose-500 font-black uppercase mt-0.5 animate-pulse">Platform Frozen</span>}
              </div>
              <div className="tactical-switch">
                <input
                  type="checkbox"
                  id="emergency-toggle"
                  checked={globalKillSwitch}
                  onChange={(e) => handleKillSwitch(e.target.checked)}
                />
                <label htmlFor="emergency-toggle"><i></i></label>
              </div>
            </div>
          </div>
        </div>

        {/* Global Maintenance Command Center */}
        <div className={`bg-[#1E1E1E] border border-white/5 rounded transition-all duration-700 relative overflow-hidden ${maintenance.active ? 'border-amber-500/30 shadow-[0_0_80px_rgba(245,158,11,0.05)]' : ''
          }`}>
          {/* Header Bar */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${maintenance.active ? 'bg-amber-600 text-white' : 'bg-[#121212] text-neutral-600'}`}>
                <Wrench size={20} />
              </div>
              <div>
                <h3 className="text-[12px] font-bold text-white uppercase tracking-widest">Maintenance Command Center</h3>
                <p className="text-[9px] text-neutral-600 font-bold uppercase mt-0.5">Configure platform locks & broadcast schedules</p>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 xl:grid-cols-3 gap-12">
            {/* Column 1: Configuration */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em] border-b border-white/5 pb-2">1. Control Mapping</h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Interface Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Soft', 'Limited', 'Full'].map(m => (
                        <button
                          key={m}
                          onClick={() => saveMaintenance({ mode: m })}
                          className={`py-2 rounded text-[9px] font-bold uppercase border transition-all ${maintenance.mode === m ? 'bg-amber-600/10 border-amber-500/50 text-amber-500' : 'bg-[#121212] border-white/5 text-neutral-600 hover:text-neutral-400'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Severity Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Info', 'Warning', 'Critical'].map(s => (
                        <button
                          key={s}
                          onClick={() => saveMaintenance({ severity: s })}
                          className={`py-2 rounded text-[9px] font-bold uppercase border transition-all ${maintenance.severity === s ? 'bg-blue-600/10 border-blue-500/50 text-blue-500' : 'bg-[#121212] border-white/5 text-neutral-600 hover:text-neutral-400'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em] border-b border-white/5 pb-2">2. Distribution Channels</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(maintenance.channels).map(([ch, active]) => (
                    <div key={ch} className="flex items-center justify-between p-3 bg-[#121212] border border-white/[0.02] rounded">
                      <span className="text-[9px] font-bold text-neutral-500 uppercase">{ch}</span>
                      <Switch
                        checked={active}
                        onCheckedChange={(val) => saveMaintenance({ channels: { ...maintenance.channels, [ch]: val } })}
                        className="h-4 w-7"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Messaging & Communication */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em] border-b border-white/5 pb-2">3. User Directives</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Directive Title</label>
                    <Input
                      value={maintenance.title}
                      onChange={(e) => saveMaintenance({ title: e.target.value })}
                      className="bg-[#121212] border-white/5 rounded text-[10px] font-bold"
                      placeholder="Maintenance Title..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Public Message</label>
                    <textarea
                      value={maintenance.message}
                      onChange={(e) => saveMaintenance({ message: e.target.value })}
                      className="w-full h-24 bg-[#121212] border border-white/5 rounded p-3 text-[10px] text-neutral-400 font-medium outline-none focus:border-white/10"
                      placeholder="Enter broadcast details..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Est. Resolve (Min)</label>
                      <Input
                        type="number"
                        value={maintenance.resolutionTime}
                        onChange={(e) => saveMaintenance({ resolutionTime: e.target.value })}
                        className="bg-[#121212] border-white/5 rounded text-[10px] font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Temporal Scheduling & Advanced */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em] border-b border-white/5 pb-2">4. Scheduling Logic</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded">
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase">Auto-Activation</p>
                      <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-tighter italic">Trigger based on clock</p>
                    </div>
                    <Switch
                      checked={maintenance.autoSchedule}
                      onCheckedChange={(val) => saveMaintenance({ autoSchedule: val })}
                      className="data-[state=checked]:bg-blue-600/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest ml-1">Window Start (ISO/Local)</label>
                      <Input
                        type="datetime-local"
                        value={maintenance.startTime}
                        onChange={(e) => saveMaintenance({ startTime: e.target.value })}
                        className="bg-[#121212] border-white/5 rounded text-[10px] font-mono invert dark:invert-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest ml-1">Window End (ISO/Local)</label>
                      <Input
                        type="datetime-local"
                        value={maintenance.endTime}
                        onChange={(e) => saveMaintenance({ endTime: e.target.value })}
                        className="bg-[#121212] border-white/5 rounded text-[10px] font-mono invert dark:invert-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em] border-b border-white/5 pb-2">5. Administrative Bypass</h4>
                <div className="space-y-2">
                  <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest ml-1">Whitelisted IDs (CSV)</label>
                  <textarea
                    value={maintenance.whitelist}
                    onChange={(e) => saveMaintenance({ whitelist: e.target.value })}
                    className="w-full h-16 bg-[#121212] border border-white/5 rounded p-3 text-[10px] text-blue-500 font-mono outline-none focus:border-white/10"
                    placeholder="admin_uuid_1, dev_uuid_2..."
                  />
                  <p className="text-[7px] text-neutral-700 italic uppercase">Allows developers to access the terminal during FULL mode.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
