import { ShieldAlert, ArrowRight, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AccountFrozen() {
  const navigate = useNavigate();

  useEffect(() => {
    let channel: any;

    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      channel = supabase.channel(`frozen_listener_${session.user.id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${session.user.id}`
        }, (payload) => {
           const updated = payload.new;
           if (updated && !updated.is_banned && !updated.is_frozen) {
              // User has been unfrozen!
              navigate("/home");
           }
        })
        .subscribe();
    };

    checkStatus();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-8 rounded-3xl shadow-2xl overflow-hidden">
          {/* Top red accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
          
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full" />
              <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center relative">
                <ShieldAlert className="w-10 h-10 text-rose-500" />
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-white tracking-tight">Account Frozen</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your account has been temporarily restricted or suspended due to a violation of our Terms of Service or a security hold. 
            </p>
            <p className="text-slate-500 text-xs mt-2 pb-6 border-b border-slate-800/50">
              For security reasons, you cannot access the TradiFive platform while your account is in this state.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <Link 
              to="/contact" 
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3.5 px-4 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link 
              to="/" 
              className="w-full flex items-center justify-center gap-2 bg-slate-800/50 text-slate-300 font-medium py-3.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              Return to Website
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
