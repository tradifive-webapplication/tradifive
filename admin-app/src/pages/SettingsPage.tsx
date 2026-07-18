import { useState, useEffect } from "react";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { Globe, Shield, Save, Key, Power, Database, Cpu } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function SettingsPage() {
  const { adminUser } = useAdminAuth();
  const [mtMode, setMtMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    platformName: "TradiFive Institutional",
    maxDrawdown: 20,
    maxDailyTrades: 50,
    apiEndpoint: "https://api.tradifive.com/v1",
    nodeCluster: "London-01",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data } = await supabase.from('system_settings').select('value').eq('id', 'global_settings').single();
      if (data?.value) {
        setSettings(data.value);
      }
      
      const { data: mtData } = await supabase.from('system_settings').select('value').eq('id', 'maintenance_mode').single();
      if (mtData?.value) {
        setMtMode(mtData.value.enabled);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    await supabase.from('system_settings').upsert({ id: 'global_settings', value: settings, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    
    // Check if maintenance mode actually changed by comparing with DB
    const { data: mtData } = await supabase.from('system_settings').select('value').eq('id', 'maintenance_mode').single();
    const prevMtMode = mtData?.value?.enabled || false;

    await supabase.from('system_settings').upsert({ id: 'maintenance_mode', value: { enabled: mtMode }, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    
    if (prevMtMode !== mtMode) {
      // Broadcast to all users
      const { data: users } = await supabase.from('profiles').select('id');
      if (users && users.length > 0) {
        const notifications = users.map(user => ({
          user_id: user.id,
          type: 'SYSTEM',
          title: mtMode ? 'System Maintenance' : 'Maintenance Complete',
          message: mtMode 
            ? 'The platform is currently undergoing maintenance. Certain features may be unavailable.'
            : 'Maintenance has been completed. All systems are operational.',
          priority: mtMode ? 'high' : 'normal',
          is_read: false
        }));
        await supabase.from('notifications').insert(notifications);
      }
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-500 font-bold uppercase tracking-widest text-[10px]">
        <Cpu size={14} className="mr-2 animate-pulse" /> Loading System Parameters...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Control Center</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Global System Parameters</p>
        </div>
        <button onClick={saveSettings} disabled={saving} className={`flex items-center gap-2 px-6 py-2.5 ${saving ? "bg-emerald-600 border-emerald-600" : "bg-neutral-800 hover:bg-neutral-700 border-white/5"} text-white text-[10px] font-bold uppercase tracking-widest border transition-none`}>
          <Save size={14} /> {saving ? "Saved" : "Commit Changes"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-[#1E1E1E] border border-white/5 rounded p-6">
            <h3 className="text-[10px] font-bold text-neutral-500 flex items-center gap-2 mb-6 uppercase tracking-widest">
              <Globe size={14} className="text-neutral-700" /> Platform Instance
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] text-neutral-700 font-bold uppercase tracking-widest mb-2 block">Terminal Alias</label>
                <input value={settings.platformName} onChange={e => setSettings({...settings, platformName: e.target.value})}
                  className="w-full bg-[#121212] border border-white/5 rounded py-2.5 px-4 text-[12px] text-white focus:outline-none uppercase tracking-tighter" />
              </div>
              <div className="pt-2">
                <label className="text-[9px] text-neutral-700 font-bold uppercase tracking-widest mb-2 block">Protocol Endpoint</label>
                <div className="flex gap-2">
                  <input value={settings.apiEndpoint} disabled
                    className="flex-1 bg-[#121212] border border-white/5 rounded py-2.5 px-4 text-[12px] text-neutral-500 focus:outline-none font-mono" />
                  <button className="p-2.5 bg-[#121212] border border-white/5 rounded text-neutral-700 hover:text-white"><Key size={14} /></button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1E1E1E] border border-white/5 rounded p-6">
            <h3 className="text-[10px] font-bold text-neutral-500 flex items-center gap-2 mb-6 uppercase tracking-widest">
              <Cpu size={14} className="text-neutral-700" /> Infrastructure
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-white/[0.02]">
                <span className="text-[10px] text-neutral-600 font-bold uppercase">Assigned Cluster</span>
                <span className="text-[10px] text-neutral-400 font-mono uppercase">{settings.nodeCluster}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.02]">
                <span className="text-[10px] text-neutral-600 font-bold uppercase">DB Host</span>
                <span className="text-[10px] text-neutral-400 font-mono uppercase">AWS-RDS-DB-MAIN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-[#1E1E1E] border border-white/5 rounded p-6">
            <h3 className="text-[10px] font-bold text-neutral-500 flex items-center gap-2 mb-6 uppercase tracking-widest">
              <Shield size={14} className="text-neutral-700" /> Risk Thresholds
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] text-neutral-700 font-bold uppercase tracking-widest mb-2 block">Global Drawdown Limit (%)</label>
                <input type="number" value={settings.maxDrawdown} onChange={e => setSettings({...settings, maxDrawdown: parseInt(e.target.value) || 0})}
                  className="w-full bg-[#121212] border border-white/5 rounded py-2.5 px-4 text-[12px] text-white focus:outline-none font-mono" />
              </div>
              <div>
                <label className="text-[9px] text-neutral-700 font-bold uppercase tracking-widest mb-2 block">Signal Batch Frequency (MS)</label>
                <input type="number" value={settings.maxDailyTrades} onChange={e => setSettings({...settings, maxDailyTrades: parseInt(e.target.value) || 0})}
                  className="w-full bg-[#121212] border border-white/5 rounded py-2.5 px-4 text-[12px] text-white focus:outline-none font-mono" />
              </div>
            </div>
          </div>

          <div className={`bg-[#1E1E1E] border rounded p-6 transition-none ${mtMode ? 'border-amber-500/20 bg-amber-500/[0.01]' : 'border-white/5'}`}>
            <h3 className="text-[10px] font-bold text-neutral-500 flex items-center gap-2 mb-6 uppercase tracking-widest">
              <Power size={14} className={mtMode ? 'text-amber-600' : 'text-neutral-700'} /> System State
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-white uppercase">Maintenance Mode</p>
                <p className="text-[9px] text-neutral-700 uppercase tracking-tight mt-1">Offline entire platform for updates</p>
              </div>
              <button 
                onClick={() => setMtMode(!mtMode)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${mtMode ? 'bg-amber-600' : 'bg-neutral-800 border border-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${mtMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

