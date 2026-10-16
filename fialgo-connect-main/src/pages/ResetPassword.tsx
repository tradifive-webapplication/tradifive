import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Force white mode on the reset password page
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password updated successfully!");
        navigate("/");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="flex min-h-screen bg-white dark:bg-[#1E1E1E] items-center justify-center px-6 relative overflow-hidden font-sans"
    >
      <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-slate-50 dark:bg-[#141414] rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 opacity-30" />
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[400px] relative z-10"
      >
        <div className="text-left mb-8 px-2">
          <Link to="/login" className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors mb-8 group">
            <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </Link>
          
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 dark:text-white mb-2">
            Reset <span className="text-primary">Password</span>
          </h1>
          <p className="text-slate-400 font-medium text-sm leading-relaxed">
            Create a new strong password for your account.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-[#333333] rounded-2xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">New Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#333333] rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-sm font-semibold shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#333333] rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-sm font-semibold shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold tracking-wider uppercase text-[11px] py-4 shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? "UPDATING..." : "UPDATE PASSWORD"}
                  {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}




