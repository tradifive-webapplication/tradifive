import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Bell, X, CheckCircle2, Terminal } from "lucide-react";
import { toast } from "sonner";

export default function PingReceiver() {
  const [activePing, setActivePing] = useState<any>(null);

  useEffect(() => {
    const fetchLatestPing = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("admin_pings")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setActivePing(data);
      }
    };

    fetchLatestPing();

    // Set up Real-time listener for new pings
    const setupSubscription = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const channel = supabase.channel(`user_pings_${user.id}`)
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'admin_pings',
            filter: `user_id=eq.${user.id}`
          }, (payload) => {
            setActivePing(payload.new);
            // Play a subtle notification sound if possible? 
            // For now just the UI pop
          })
          .subscribe();

        return channel;
    };

    const channelPromise = setupSubscription();

    return () => {
      channelPromise.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, []);

  const acknowledgePing = async () => {
    if (!activePing) return;

    const currentPingId = activePing.id;
    
    // Clear UI Immediately so user isn't stuck
    setActivePing(null);

    const { error } = await supabase
      .from("admin_pings")
      .update({ is_read: true })
      .eq("id", currentPingId);

    if (error) {
      console.error("DB Error:", error);
      toast.error("Failed to mark as read in database.");
    } else {
      toast.success("Directive Acknowledged", {
        icon: <CheckCircle2 className="text-emerald-500" />,
      });
    }
  };

  return (
    <AnimatePresence>
      {activePing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-[#1E1E1E] dark:bg-[#0A0A0A] border-2 border-red-500/20 dark:border-red-500/30 rounded-[2rem] shadow-2xl overflow-hidden shadow-red-500/10"
          >
            {/* Header */}
            <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
              <ShieldAlert className="text-white animate-pulse" size={24} />
              <h3 className="text-white font-black uppercase tracking-[0.1em] text-sm">Priority System Directive</h3>
            </div>

            {/* Body */}
            <div className="p-8">
              <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                <Terminal size={12} />
                <span>Origin: Institutional Admin</span>
              </div>
              
              <p className="text-slate-900 dark:text-white dark:text-white text-lg font-bold leading-relaxed mb-8 italic">
                "{activePing.message}"
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={acknowledgePing}
                  className="w-full bg-slate-900 dark:bg-white dark:bg-[#1E1E1E] dark:text-black text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                >
                  <CheckCircle2 size={16} />
                  Acknowledge Signal
                </button>
                <p className="text-[9px] text-center text-neutral-500 font-bold uppercase tracking-widest">
                  This record is logged in your activity history.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}




