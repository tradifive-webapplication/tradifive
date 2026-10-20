import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { LayoutGrid, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function AdminVerify() {
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const email = location.state?.email || otpEmail;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        toast.error("IDENTITY REQUIRED");
        return;
    }
    if (otp.length < 6) {
        toast.error("INCOMPLETE SECURITY KEY");
        return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'signup'
    });

    if (error) {
      toast.error(error.message || "VERIFICATION FAILED");
      setLoading(false);
      return;
    }

    toast.success("IDENTITY VERIFIED: ACCESS GRANTED");
    navigate("/login");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 sm:p-6 selection:bg-white/10">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-10 h-10 bg-[#1E1E1E] border border-white/5 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <LayoutGrid className="text-neutral-500" size={20} />
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-[0.2em] text-white uppercase">Access Verification</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-1.5 sm:mt-2">Authenticated Registry Validation</p>
        </div>

        <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-5 sm:p-8 shadow-2xl">
          <div className="mb-6 sm:mb-8 text-center bg-[#121212] p-3 sm:p-4 border border-white/[0.03] rounded-lg">
             <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.1em]">
                {email ? (
                    <>SECURITY KEY SENT TO <span className="text-neutral-400">{email}</span></>
                ) : (
                    <>ENTER IDENTITY & SECURITY KEY</>
                )}
             </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            {!location.state?.email && (
              <div className="space-y-2">
                  <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest px-1">Admin Email</label>
                  <input
                      type="email"
                      required
                      className="w-full bg-[#121212] border border-white/[0.03] rounded-sm py-3 px-4 text-[13px] text-white focus:outline-none focus:border-white/10 transition-none placeholder:text-neutral-800"
                      placeholder="admin.id"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                  />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest px-1">Security Key (OTP)</label>
              <input
                type="text"
                required
                maxLength={8}
                className="w-full bg-[#121212] border border-white/[0.03] rounded-sm py-3 px-4 text-center text-lg font-mono tracking-[0.4em] text-white focus:outline-none focus:border-white/10 transition-none placeholder:text-neutral-800"
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              />
              <p className="text-[8px] text-neutral-800 text-center mt-2 uppercase tracking-tight">Check secure channels for dispatch</p>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-bold uppercase tracking-[0.4em] rounded-sm border border-white/5 transition-none flex items-center justify-center gap-2"
            >
              <ShieldCheck size={14} className="text-neutral-500" />
              {loading ? "VALIDATING..." : "Finalize Clearance"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.03] text-center">
             <button 
               onClick={() => navigate("/login")}
               className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest hover:text-white transition-none"
             >
                Abort & Return
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

