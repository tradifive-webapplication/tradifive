import { useState } from "react";
import {
   Message as IconlyMessage,
   ArrowLeft as IconlyArrowLeft,
   ArrowRight as IconlyArrowRight
} from "react-iconly";

import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PushableButton } from "@/components/PushableButton";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsSent(true);
        toast.success("Reset link sent to your email!");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="flex min-h-screen bg-slate-50 dark:bg-[#141414] items-center justify-center px-6 relative overflow-hidden font-sans"
    >
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-slate-100 dark:bg-[#1E1E1E] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-30" />
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[400px] relative z-10"
      >
        <div className="text-center mb-8">
          <Link
            to="/login"
            className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-primary mb-8 group"
            style={{ transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', display: 'inline-flex' }}
            onMouseEnter={(e: any) => { e.currentTarget.style.transform = 'translateX(-4px) scale(1.03)'; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.transform = 'translateX(0) scale(1)'; }}
          >
            <IconlyArrowLeft set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </Link>
          
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 dark:text-white mb-2">
            Forgot <span className="text-primary">password?</span>
          </h1>
          <p className="text-slate-400 font-medium text-sm leading-relaxed px-4">
            Enter your email and we'll send you instructions to reset it.
          </p>
        </div>

        <div
          className="bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-[#333333] rounded-2xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] relative overflow-hidden"
          style={{
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            transformStyle: 'preserve-3d',
          }}
        >
          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                    <IconlyMessage set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#333333] rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-sm font-semibold shadow-sm"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <PushableButton 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Processing..." : (
                  <span className="flex items-center justify-center font-bold uppercase tracking-widest text-[11px] py-0.5">
                    Send instructions
                    <IconlyArrowRight set="curved" primaryColor="currentColor" size={18} stroke="bold" strokeWidth={2} className="ml-2" />
                  </span>
                )}
              </PushableButton>
            </form>
          ) : (
            <div className="text-center py-4 relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
                <Mail size={28} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Check your inbox</h3>
              <p className="text-slate-500 mb-8 text-sm font-medium leading-relaxed">
                We've sent a link to <br/> 
                <span className="text-slate-900 dark:text-white font-bold underline decoration-primary decoration-2 underline-offset-4">{email}</span>
              </p>
              <PushableButton onClick={() => setIsSent(false)} className="w-full">
                <span className="font-bold uppercase tracking-widest text-[11px] py-0.5">Try another email</span>
              </PushableButton>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-[11px] font-bold text-slate-300 tracking-[0.1em] uppercase">
          Need help? <a href="mailto:hello@tradifive.in" className="text-slate-400 hover:text-primary transition-colors border-b border-slate-200 dark:border-[#333333] ml-1">Contact Support</a>
        </p>
      </motion.div>
    </div>
  );
}




