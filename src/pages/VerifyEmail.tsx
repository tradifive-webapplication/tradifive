import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, RefreshCcw, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PushableButton } from "@/components/PushableButton";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("No email address found. Please try logging in again.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup'
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Email verified successfully!");
        navigate("/journal");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification code resent to your email.");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div 
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="flex min-h-screen bg-white dark:bg-[#1E1E1E] items-center justify-center px-6 relative overflow-hidden font-sans"
    >
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-slate-50 dark:bg-[#141414] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[400px] relative z-10"
      >
        <div className="text-left mb-8 px-2">
          <Link to="/" className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors mb-8 group">
            <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </Link>

          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 dark:text-white mb-2">
            Verify <span className="text-primary">Email</span>
          </h1>
          <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-[340px]">
            Check your inbox for the 6-digit code sent to <span className="text-slate-900 dark:text-white font-bold underline decoration-primary decoration-1 underline-offset-4">{email || "your email"}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-[#333333] rounded-2xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] text-center relative overflow-hidden">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-primary/10 mb-8 border border-primary/5 relative z-10 shadow-inner">
            <Mail size={32} className="text-primary animate-pulse" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 block">Verification code</label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-2xl tracking-[0.5em] font-semibold py-4 rounded-xl border border-slate-200 dark:border-[#333333] bg-white text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 selection:bg-primary/20 shadow-sm"
                placeholder="000000"
                required
              />
            </div>

            <div style={{ perspective: '600px' }}>
              <button
                type="submit"
                disabled={code.length < 6 || isLoading}
                className="w-full text-white font-bold uppercase tracking-wide text-xs lg:text-sm py-3 lg:py-3.5 rounded-xl flex items-center justify-center disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #3b82f6 100%)',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.35), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  transformStyle: 'preserve-3d',
                }}
                onMouseEnter={e => { if (!(code.length < 6 || isLoading)) { e.currentTarget.style.transform = 'translateY(-4px) rotateX(6deg) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(37,99,235,0.4), 0 4px 10px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) rotateX(0deg) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'translateY(-1px) rotateX(2deg) scale(0.98)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-4px) rotateX(6deg) scale(1.02)'; }}
              >
                {isLoading ? "Verifying..." : (
                  <>
                    VERIFY ACCOUNT
                    <ArrowRight className="ml-2 w-[18px] h-[18px]" strokeWidth={2} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 dark:border-white/5 relative z-10">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              No email?{" "}
              <button
                onClick={handleResend}
                type="button"
                className="text-primary hover:text-primary/70 transition-colors inline-flex items-center gap-1.5 group ml-1"
              >
                <RefreshCcw size={12} className="group-hover:rotate-180 transition-transform duration-700" />
                Resend
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}





