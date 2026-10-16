import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, Lock, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrokerAuth() {
  const { brokerId } = useParams<{ brokerId: string }>();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Broker specific branding
  const isZerodha = brokerId === 'zerodha';
  const brokerName = isZerodha ? 'Zerodha Kite' : 'Dhan';
  const primaryColor = isZerodha ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600';
  const textColor = isZerodha ? 'text-blue-500' : 'text-amber-500';
  const ringColor = isZerodha ? 'focus:ring-blue-500' : 'focus:ring-amber-500';

  useEffect(() => {
    // Set document title to make it look realistic
    document.title = `Login to ${brokerName}`;
  }, [brokerName]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) return;
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1200);
  };

  const handleOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    
    setLoading(true);
    setTimeout(() => {
      setStep(3);
      setLoading(false);
      
      // Simulate real OAuth response after showing success state
      setTimeout(() => {
        // Send a message back to the opening window (TradiFive app)
        if (window.opener) {
          window.opener.postMessage({
            type: 'BROKER_AUTH_SUCCESS',
            payload: {
              brokerId: brokerId,
              // Generate fake API credentials for demo
              clientId: userId,
              apiKey: `live_${Math.random().toString(36).substring(2, 15)}`,
              apiSecret: `sec_${Math.random().toString(36).substring(2, 15)}`
            }
          }, '*'); // In production, restrict origin instead of '*'
          
          window.close(); // Close the popup
        }
      }, 1500);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white max-w-md w-full rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                {isZerodha ? (
                    <span className="text-3xl font-black text-blue-600">K</span>
                ) : (
                    <span className="text-3xl font-black text-amber-500">D</span>
                )}
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Login to {brokerName}</h1>
            <p className="text-sm text-slate-500 mt-2 flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                Secure OAuth connection via TradiFive
            </p>
        </div>

        {/* Content */}
        <div className="p-8">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.form 
                        key="login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">User ID</label>
                            <input 
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value.toUpperCase())}
                                placeholder={isZerodha ? "XX0000" : "Mobile Number"}
                                className={`w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:bg-white transition-all ${ringColor}`}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition-all ${ringColor}`}
                                    required
                                />
                            </div>
                        </div>
                        <Button 
                            type="submit"
                            disabled={loading}
                            className={`w-full py-6 text-base font-bold text-white rounded-xl shadow-lg shadow-black/5 transition-all active:scale-[0.98] ${primaryColor}`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Login'}
                        </Button>
                    </motion.form>
                )}

                {step === 2 && (
                    <motion.form 
                        key="otp"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleOtp}
                        className="space-y-6 text-center"
                    >
                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                            <Smartphone size={24} className={textColor} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Two-Factor Authentication</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Enter the TOTP generated by your {brokerName} app.
                            </p>
                        </div>
                        
                        <div className="space-y-1.5 text-left">
                            <input 
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className={`w-full px-4 py-4 text-center tracking-[1em] text-xl font-mono rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:bg-white transition-all ${ringColor}`}
                                required
                            />
                        </div>
                        
                        <Button 
                            type="submit"
                            disabled={loading}
                            className={`w-full py-6 text-base font-bold text-white rounded-xl shadow-lg shadow-black/5 transition-all active:scale-[0.98] ${primaryColor}`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Continue'}
                        </Button>
                    </motion.form>
                )}

                {step === 3 && (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-6 text-center space-y-4"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                        >
                            <CheckCircle2 size={64} className="text-emerald-500" />
                        </motion.div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Authentication Successful!</h3>
                            <p className="text-sm text-slate-500 mt-2">Connecting to TradiFive...</p>
                            <p className="text-xs text-slate-400 mt-1">This window will close automatically.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TradiFive Connect</span>
            <span className="text-[10px] text-slate-400 font-medium">Secured by OAuth 2.0</span>
        </div>
      </motion.div>
    </div>
  );
}
