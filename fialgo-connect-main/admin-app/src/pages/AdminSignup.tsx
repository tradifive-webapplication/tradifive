import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { LayoutGrid, ShieldCheck, Building2, KeyRound, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { DEPARTMENT_ORDER } from "../lib/rbac";
import { useAdminAuth } from "../contexts/AdminAuthContext";

const ALLOWED_DEPARTMENTS = ["Technology", "HR & People", "Support", "Sales", "Operations", "Executive", "Trading & Risk", "Finance & Compliance", "Content & Marketing", "Mentors"];

const DEPT_LABELS: Record<string, string> = {
  "Technology": "Technology (CTO)",
  "HR & People": "HR & People (CHRO)",
  "Support": "Support (Head of Support)",
  "Sales": "Sales (Head of Sales)",
  "Operations": "Operations (COO)",
  "Executive": "Executive (CEO)",
  "Trading & Risk": "Trading & Risk (CRO)",
  "Finance & Compliance": "Finance & Compliance (CFO)",
  "Content & Marketing": "Content & Marketing (CMO)",
  "Mentors": "Mentors (Head of Mentors)"
};

const DEPT_PREFIX_MAP: Record<string, string> = {
  "OVERVIEW": "OVR",
  "USERS & CRM": "CRM",
  "SOCIAL & CONTENT": "SCL",
  "MARKETPLACE": "MKT",
  "TRADING & RISK": "TRD",
  "FINANCE": "FIN",
  "SUPPORT": "SUPT",
  "OPERATIONS": "OPS",
  "TECHNOLOGY": "TECH",
  "AI AGENTS": "AI",
  "HR & PEOPLE": "HR",
  "MY WORKSPACE": "WKS",
  "CONFIG": "CFG"
};

const getDeptPrefix = (dept: string) => {
  const upper = dept.toUpperCase();
  if (DEPT_PREFIX_MAP[upper]) return DEPT_PREFIX_MAP[upper];
  return upper.replace(/[^A-Z]/g, "").substring(0, 3);
};

export default function AdminSignup() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  
  const [department, setDepartment] = useState(ALLOWED_DEPARTMENTS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [secretDigits, setSecretDigits] = useState("");
  const [isCEO, setIsCEO] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAdminAuth();

  useEffect(() => {
    signOut();
  }, [signOut]);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: codeData, error: codeError } = await supabase
        .from("signup_clearance_codes")
        .select("id, is_active, assigned_role")
        .eq("code", inviteCode.trim())
        .maybeSingle();

      if (codeError || !codeData || !codeData.is_active) {
        toast.error("Invalid or revoked clearance code");
        setLoading(false);
        return;
      }

      setIsCEO(codeData.assigned_role === "ceo");
      
      if (codeData.assigned_role === "ceo") {
        setStep(4);
      } else {
        setStep(2);
      }
    } catch (err: any) {
      toast.error(err?.message || "Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretDigits.length !== 4) {
      toast.error("Please enter a 4-digit code");
      return;
    }
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const fullSecretKey = `TDF-${getDeptPrefix(department)}-${secretDigits}`;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            invite_code: inviteCode.trim(),
            department: isCEO ? null : department,
            secret_key: isCEO ? null : fullSecretKey,
          },
        },
      });

      if (signUpError || !data.user) {
        toast.error(signUpError?.message || "Registration failed");
        return;
      }

      // Clear the automatic session so they must log in with email & password
      await supabase.auth.signOut();

      toast.success("Identity registered successfully. Please proceed to Login.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err?.message || "Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 sm:p-6 selection:bg-white/10">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-10 h-10 bg-[#1E1E1E] border border-white/5 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <LayoutGrid className="text-neutral-500" size={20} />
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-[0.2em] text-white uppercase">Personnel Request</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-1.5 sm:mt-2">Registration for Master Control</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-neutral-500' : 'bg-white/5'}`} />
          ))}
        </div>

        <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-5 sm:p-8 shadow-2xl">
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4" autoComplete="off">
              <input type="text" className="hidden" autoComplete="off" aria-hidden="true" />
              <input type="password" className="hidden" autoComplete="new-password" aria-hidden="true" />

              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest px-1">Full Identity</label>
                <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#121212] border border-white/[0.03] rounded-sm py-2.5 px-4 text-[12px] text-white focus:outline-none focus:border-white/10 placeholder:text-neutral-800 transition-colors" placeholder="SURNAME, FIRSTNAME" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest px-1">Internal Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#121212] border border-white/[0.03] rounded-sm py-2.5 px-4 text-[12px] text-white focus:outline-none focus:border-white/10 placeholder:text-neutral-800 transition-colors" placeholder="ID@tradifive.in" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest px-1">Create Pass-Key</label>
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#121212] border border-white/[0.03] rounded-sm py-2.5 px-4 text-[12px] text-white focus:outline-none focus:border-white/10 placeholder:text-neutral-800 transition-colors" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5 pt-4 border-t border-white/[0.03]">
                <label className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest px-1 border-l border-neutral-700 ml-1">Master Clearance Code</label>
                <input required value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className="w-full bg-[#121212] border border-dashed border-white/5 rounded-sm py-2.5 px-4 text-[12px] text-white focus:outline-none focus:border-white/10 placeholder:text-neutral-800 transition-colors" placeholder="CODE_2026" />
              </div>

              <button type="submit" disabled={loading} className="w-full mt-4 py-4 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-[0.4em] rounded-sm border border-white/5 transition-colors flex items-center justify-center gap-2">
                {loading ? "VERIFYING..." : "Next Step"} <ArrowRight size={14} className="text-neutral-500" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="text-neutral-400" size={20} />
                </div>
                <h3 className="text-white font-bold tracking-widest uppercase text-[12px]">Assign Department</h3>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed">
                  Select your designated department.
                </p>
              </div>

              <div className="space-y-1.5 relative">
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-[#121212] border border-white/[0.03] rounded-sm py-4 px-4 text-[11px] text-white flex justify-between items-center cursor-pointer uppercase tracking-widest font-bold hover:border-white/10 transition-colors"
                >
                  {DEPT_LABELS[department] || department}
                  <ChevronDown size={14} className={`text-neutral-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[#1A1A1A] border border-white/5 rounded-sm shadow-2xl z-50 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {ALLOWED_DEPARTMENTS.map(dept => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => { setDepartment(dept); setIsDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors border-b border-white/[0.02] last:border-0 ${department === dept ? 'text-white bg-neutral-800' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5'}`}
                      >
                        {DEPT_LABELS[dept] || dept}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="px-4 py-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm transition-colors border border-white/5">
                  Back
                </button>
                <button type="submit" className="flex-1 py-4 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-bold uppercase tracking-[0.4em] rounded-sm transition-colors flex items-center justify-center gap-2 border border-white/5">
                  Next Step <ArrowRight size={14} className="text-neutral-500" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleStep3} className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="text-red-500" size={20} />
                </div>
                <h3 className="text-white font-bold tracking-widest uppercase text-[12px]">Generate Secret Key</h3>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed">
                  Create a unique 4-digit pin for {department}.
                </p>
              </div>

              <div className="flex items-center">
                <div className="px-4 py-4 bg-neutral-900 border border-red-500/30 border-r-0 text-red-500 font-mono tracking-widest text-[16px] rounded-l-sm select-none whitespace-nowrap shrink-0">
                  TDF-{getDeptPrefix(department)}-
                </div>
                <input 
                  required 
                  maxLength={4}
                  value={secretDigits} 
                  onChange={(e) => setSecretDigits(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#121212] border border-red-500/30 border-l-0 rounded-r-sm py-4 px-4 text-[16px] text-red-400 font-mono tracking-[0.3em] focus:outline-none focus:border-red-500 transition-none placeholder:text-red-900/50"
                  placeholder="0000"
                />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(2)} className="px-4 py-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm transition-colors border border-white/5">
                  Back
                </button>
                <button type="submit" disabled={secretDigits.length !== 4} className="flex-1 py-4 bg-red-600/90 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-[0.4em] rounded-sm transition-colors flex items-center justify-center gap-2">
                  Confirm Key <ArrowRight size={14} className="text-red-200" />
                </button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                </div>
                <h3 className="text-white font-bold tracking-widest uppercase text-[12px]">Ready to Submit</h3>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed">
                  Identity: {fullName} <br/>
                  Role Verified.
                  {!isCEO && <><br/>Department: {department}</>}
                </p>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(isCEO ? 1 : 3)} disabled={loading} className="px-4 py-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm transition-colors disabled:opacity-50 border border-white/5">
                  Back
                </button>
                <button onClick={handleFinalSubmit} disabled={loading} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-[0.4em] rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? "PROCESSING..." : "Submit Registry"}
                </button>
              </div>
            </div>
          )}

          <p className="text-center mt-8 text-[9px] text-neutral-600 uppercase tracking-widest">
            Identity already matched?{" "}
            <Link to="/login" className="text-white font-bold hover:underline">
              Establish Link
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
