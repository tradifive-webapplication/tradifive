import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff, Smartphone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.remove("dark");

    const search = window.location.search || '';
    const hash = window.location.hash || '';
    const params = new URLSearchParams((search || hash).replace(/^#/, '?'));

    // Check for errors passed in redirect (e.g. expired link)
    const errorDesc = params.get('error_description') || params.get('error');
    if (errorDesc) {
      setErrorMessage(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
      return;
    }

    // If a PKCE authorization code was returned, exchange it for a session
    const code = params.get('code');
    if (code) {
      setIsLoading(true);
      supabase.auth.exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            console.warn('[ResetPassword Exchange Warning]:', error.message);
            setErrorMessage(error.message);
          }
        })
        .catch((err) => {
          console.error('[ResetPassword Exchange Error]:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

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
        setErrorMessage(error.message);
      } else {
        toast.success("Password updated successfully!");
        setIsSuccess(true);
        // Sign out of recovery session so next login is fresh
        await supabase.auth.signOut().catch(() => {});
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center px-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 opacity-50" />
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="text-left mb-6 px-1">
          <Link to="/login" className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors mb-6 group">
            <ArrowLeft className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </Link>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Reset <span className="text-blue-600">Password</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            Choose a new strong password for your TradiFive account.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-7 shadow-[0_15px_40px_rgba(0,0,0,0.06)] relative overflow-hidden">
          {isSuccess ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-4 space-y-5"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-100">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Password Updated!</h3>
                <p className="text-sm text-slate-500">
                  Your new password is now active. You can open your mobile app or sign in below.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <a
                  href="mobileapp://login"
                  onClick={() => {
                    setTimeout(() => {
                      navigate('/login');
                    }, 1500);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Smartphone size={18} />
                  Open TradiFive Mobile App
                </a>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm py-3 transition-colors"
                >
                  Continue to Web Sign In
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
                  <div>
                    <span className="font-bold block">Reset Link Expired or Invalid</span>
                    {errorMessage}
                    <div className="mt-2">
                      <Link to="/forgot-password" className="text-rose-800 underline font-bold hover:text-rose-950">
                        Request a new reset link &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-11 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all text-sm font-medium"
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all text-sm font-medium"
                    placeholder="Re-enter password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide uppercase text-xs py-3.5 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>UPDATING...</span>
                  ) : (
                    <>
                      <span>UPDATE PASSWORD</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
