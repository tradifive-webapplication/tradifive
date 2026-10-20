import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { LayoutGrid, ShieldCheck, KeyRound, Building2, ChevronDown, LogIn, Eye, EyeOff, TerminalSquare, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { DEPARTMENT_ORDER } from "../lib/rbac";

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

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [department, setDepartment] = useState(ALLOWED_DEPARTMENTS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [secretDigits, setSecretDigits] = useState("");

  // step1Complete tracks whether the user finished email+password on THIS page
  // This prevents the stale signup session from jumping straight to 2FA
  const [step1Complete, setStep1Complete] = useState(false);
  
  // Store user metadata captured at step 1 (signInWithPassword) so step 2 can access it reliably
  const [cachedUserMeta, setCachedUserMeta] = useState<Record<string, any> | null>(null);
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { adminUser, is2FAVerified, setIs2FAVerified, signOut } = useAdminAuth();

  // On mount: always sign out any stale session (e.g. from previous signup)
  // This resets adminUser to null so the email+password form always shows
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !is2FAVerified) {
        signOut();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once both step1 is done AND 2FA is verified, go to dashboard
  useEffect(() => {
    if (adminUser && is2FAVerified) {
      navigate("/");
    }
  }, [adminUser, is2FAVerified, navigate]);

  const handlePersonalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (authError) {
        toast.error(authError.message || "Invalid credentials.");
        return;
      }

      // Cache the user metadata NOW while we have a fresh session response
      const meta = signInData?.user?.user_metadata || {};
      setCachedUserMeta(meta);
      // Mark step 1 as complete — this gates showing the 2FA form
      setStep1Complete(true);
      console.log("Step 1 login success. Cached metadata:", meta);
    } catch (err: any) {
      console.error("Login Error:", err);
      toast.error(err.message || "A network or system error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSecretVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser) return;
    setLoading(true);

    try {
      const isCEO = adminUser.role === "ceo";

      // CEO special case — hardcoded master pin
      if (isCEO) {
        if (secretDigits === "2128") {
          toast.success("Welcome back, Chief.");
          setIs2FAVerified(true);
          navigate("/");
          return;
        } else {
          toast.error("Invalid CEO access code.");
          setLoading(false);
          return;
        }
      }

      if (secretDigits.length !== 4) {
        toast.error("Please enter a 4-digit code");
        setLoading(false);
        return;
      }

      // Use the metadata we cached during step 1 (signInWithPassword response)
      // This is more reliable than getUser() which may return stale/null data
      const userMeta = cachedUserMeta || {};
      const storedSecretKey: string | undefined = userMeta.secret_key;
      const storedDepartment: string | undefined = userMeta.department;

      console.log("2FA Debug:", { storedSecretKey, storedDepartment, department, secretDigits, cachedUserMeta });

      // If the user has a stored secret key in metadata, use that as primary auth
      if (storedSecretKey) {
        // Build what the user entered as a full key
        const enteredKey = `TDF-${getDeptPrefix(department)}-${secretDigits}`;
        
        // Also try with stored dept prefix in case dropdown doesn't match exactly
        const storedDeptPrefix = storedDepartment ? getDeptPrefix(storedDepartment) : null;
        const enteredKeyWithStoredDept = storedDeptPrefix ? `TDF-${storedDeptPrefix}-${secretDigits}` : null;

        const isMatch = enteredKey === storedSecretKey || 
                        (enteredKeyWithStoredDept && enteredKeyWithStoredDept === storedSecretKey) ||
                        secretDigits === storedSecretKey;

        if (isMatch) {
          toast.success("Identity Verified & Link Established");
          setIs2FAVerified(true, "meta-verified");
          navigate("/");
          return;
        } else {
          toast.error(`Wrong PIN. You entered: ${secretDigits}, expected a different code. Check your signup PIN.`);
          console.error("Key mismatch:", { enteredKey, enteredKeyWithStoredDept, stored: storedSecretKey });
          setLoading(false);
          return;
        }
      }

      // Fallback: check department_access_keys table
      const builtKey = `TDF-${getDeptPrefix(department)}-${secretDigits}`;
      const { data: keyData, error: keyError } = await supabase
        .from("department_access_keys")
        .select("id, is_active")
        .eq("key_code", builtKey)
        .maybeSingle();

      if (keyError || !keyData) {
        toast.error("No PIN found in your profile. Please sign out and sign up again, then use the exact PIN from step 3.");
        setLoading(false);
        return;
      }

      if (!keyData.is_active) {
        toast.error("This department key has been revoked by the CEO.");
        setLoading(false);
        return;
      }

      toast.success("Identity Verified & Link Established");
      setIs2FAVerified(true, keyData.id);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "A network or system error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel2FA = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 sm:p-6 selection:bg-white/10">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-10 h-10 bg-[#1E1E1E] border border-white/5 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <LayoutGrid className="text-neutral-500" size={20} />
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-[0.2em] text-white uppercase">Terminal Access</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.3em] mt-1.5 sm:mt-2">Authenticated Entry Only</p>
        </div>

        <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-5 sm:p-8 shadow-2xl">
          {/* Step 1: Email + Password — always shown first, even if adminUser exists from a stale session */}
          {!step1Complete && (
            <form onSubmit={handlePersonalLogin} className="space-y-4" autoComplete="off">
              <input type="text" name="chrome-email-autofill-dummy" className="hidden" style={{ display: 'none' }} autoComplete="off" />
              <input type="password" name="chrome-password-autofill-dummy" className="hidden" style={{ display: 'none' }} autoComplete="off" />

              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest px-1">Identity</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  name="admin_identity_field"
                  className="w-full bg-[#121212] border border-white/[0.03] rounded-sm py-2.5 px-4 text-[12px] text-white focus:outline-none focus:border-white/10 transition-none placeholder:text-neutral-800"
                  placeholder="admin.id"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest px-1">Pass-Key</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  name="admin_passkey_field"
                  className="w-full bg-[#121212] border border-white/[0.03] rounded-sm py-2.5 px-4 text-[12px] text-white focus:outline-none focus:border-white/10 transition-none placeholder:text-neutral-800"
                  placeholder="••••••••"
                />
              </div>

              <button
                disabled={loading}
                className="w-full mt-2 py-4 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-bold uppercase tracking-[0.4em] rounded-sm border border-white/5 transition-none flex items-center justify-center gap-2"
              >
                <ShieldCheck size={14} className="text-neutral-500" />
                {loading ? "Verifying..." : "Establish Link"}
              </button>
            </form>
          )}

          {step1Complete && adminUser && !is2FAVerified && (
            <form onSubmit={handleSecretVerification} className="space-y-6">
              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="text-red-500" size={20} />
                </div>
                <h3 className="text-white font-bold tracking-widest uppercase text-[12px]">Secondary Authentication</h3>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest leading-relaxed">
                  Welcome {adminUser.full_name}. Please provide your access credentials.
                </p>
              </div>

              {adminUser.role !== "ceo" && (
                <div className="space-y-2 relative">
                  <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest px-1 flex items-center gap-2">
                    <Building2 size={12} /> Assigned Department
                  </label>
                  
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-[#121212] border border-white/[0.03] rounded-sm py-4 px-4 text-[11px] text-white flex justify-between items-center cursor-pointer uppercase tracking-widest font-bold hover:border-white/10 transition-colors"
                  >
                    {DEPT_LABELS[department] || department}
                    <ChevronDown size={14} className={`text-neutral-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#1A1A1A] border border-white/5 rounded-sm shadow-2xl z-50 max-h-[250px] overflow-y-auto custom-scrollbar">
                      <div className="py-1">
                        {ALLOWED_DEPARTMENTS.map((dept) => (
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
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest px-1">Secret Access Code</label>
                
                {adminUser.role === "ceo" ? (
                  <input
                    required
                    maxLength={4}
                    value={secretDigits}
                    onChange={(e) => setSecretDigits(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#121212] border border-red-500/30 rounded-sm py-4 px-4 text-center text-[16px] tracking-[0.3em] font-mono text-red-400 focus:outline-none focus:border-red-500 transition-colors placeholder:text-neutral-800"
                    placeholder="0000"
                  />
                ) : (
                  <div className="flex items-center">
                    <div className="px-4 py-4 bg-neutral-900 border border-red-500/30 border-r-0 text-red-500 font-mono tracking-widest text-[16px] rounded-l-sm select-none whitespace-nowrap shrink-0">
                      TDF-{DEPT_PREFIX_MAP[department.toUpperCase()]}-
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
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || secretDigits.length !== 4}
                  className="w-full py-4 bg-red-600/90 hover:bg-red-500 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-[0.4em] rounded-sm transition-colors flex items-center justify-center gap-2"
                >
                  <KeyRound size={14} className="text-red-200" />
                  {loading ? "VERIFYING..." : "Confirm Access"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel2FA}
                  className="w-full text-center text-[10px] text-neutral-500 hover:text-white mt-4 tracking-widest font-bold uppercase transition-colors"
                >
                  Cancel & Sign Out
                </button>
              </div>
            </form>
          )}

          {!adminUser && (
            <div className="mt-8 pt-6 border-t border-white/[0.03] flex items-center justify-center gap-4">
              <Link to="/signup" className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest hover:text-white">Request Clearance</Link>
              <div className="w-1 h-1 rounded-full bg-neutral-800" />
              <span className="text-[9px] text-neutral-800 font-bold uppercase tracking-widest">v2-stable</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
