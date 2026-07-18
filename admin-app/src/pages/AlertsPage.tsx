import { useState, useEffect } from "react";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { canPerformAction } from "../lib/rbac";
import { Bell, AlertTriangle, Clock, User } from "lucide-react";

import { supabase } from "../lib/supabase";

export default function AlertsPage() {
  const { adminUser } = useAdminAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      const { data } = await supabase.from('system_alerts').select('*').order('created_at', { ascending: false });
      if (data) setAlerts(data);
      setLoading(false);
    };

    fetchAlerts();
    const channel = supabase
      .channel('alerts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_alerts' }, () => {
        fetchAlerts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const resolve = async (id: string) => {
    await supabase.from('system_alerts').update({ resolved: true }).eq('id', id);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000); // minutes
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Incident Logs</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Real-time alerts</p>
        </div>
        <div className="px-3 py-1.5 bg-[#1E1E1E] border border-white/5 rounded-sm">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            {alerts.filter(a => !a.resolved).length} Critical Events
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-neutral-700 text-[10px] uppercase tracking-widest">Scanning network alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-neutral-700 text-[10px] uppercase tracking-widest">No alerts detected</div>
        ) : alerts.map(alert => (
          <div key={alert.id} className={`bg-[#1E1E1E] border rounded-sm p-5 transition-none ${alert.resolved ? "border-white/5 opacity-30" : "border-white/5"}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <AlertTriangle size={16} className="text-neutral-700 mt-1" />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-[12px] font-bold text-white uppercase tracking-tight">{alert.message?.split(':')[0] || 'System Alert'}</p>
                    <span className="text-[8px] font-bold text-neutral-700 uppercase tracking-widest border border-white/5 px-1.5 py-0.5 rounded-sm">{alert.type}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 tracking-tight">{alert.message?.includes(':') ? alert.message.split(':')[1] : alert.message}</p>
                  <div className="flex items-center gap-4 text-[9px] text-neutral-500 uppercase font-bold mt-2">
                    <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(alert.created_at)} AGO</span>
                    <span>TAG: {alert.type}</span>
                  </div>
                </div>
              </div>
              {!alert.resolved && (
                <button onClick={() => resolve(alert.id)}
                  className="px-4 py-1.5 text-[9px] font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-white/5 rounded-sm uppercase tracking-widest transition-none">
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
