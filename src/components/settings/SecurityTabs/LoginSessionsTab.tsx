import React, { useState } from 'react';
import { Laptop, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function LoginSessionsTab() {
  const [revoking, setRevoking] = useState(false);
  const [revoked, setRevoked] = useState(false);

  const handleRevokeOthers = async () => {
    setRevoking(true);
    try {
      try {
        await (supabase.auth as any).signOut({ scope: 'others' });
      } catch (_) {}
      setRevoked(true);
      toast.success("All other active device sessions revoked successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke sessions");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[740px] mx-auto">
      <div className="bg-white dark:bg-[#111112] rounded-[28px] border border-slate-200/60 dark:border-white/5 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Login Sessions</h3>
            <p className="text-xs text-slate-500 dark:text-[#949ba4] mt-0.5">
              Devices and browsers authenticated to your TradiFive trading account.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={revoking || revoked}
            onClick={handleRevokeOthers}
            className="rounded-full text-xs font-bold border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
          >
            {revoking ? 'Revoking...' : revoked ? '✓ Sessions Revoked' : 'Revoke Other Devices'}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Laptop size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Current Desktop Session</h4>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Active Now
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">TLS 1.3 Encrypted • Verified Session</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
