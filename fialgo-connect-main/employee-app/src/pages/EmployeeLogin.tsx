import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function EmployeeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("No user returned");

      // Verify they are an employee in admin_profiles
      const { data: profile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error("Profile not found.");
      }

      // We no longer block based on profile.role, because employees can now have department-specific roles
      // like 'finance_executive' or 'community_manager'. All valid admin_profiles can access the Employee Portal.

      toast.success("Identity Verified");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6 selection:bg-white/10">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-[#1E1E1E] border border-white/5 rounded-lg flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="text-neutral-500" size={20} />
          </div>
          <h1 className="text-lg font-bold tracking-[0.2em] text-white uppercase">Employee Portal</h1>
          <p className="text-neutral-700 text-[9px] font-bold uppercase tracking-[0.3em] mt-2">Authenticated Entry Only</p>
        </div>

        <div className="bg-[#1E1E1E] border border-white/5 rounded p-8 shadow-2xl relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
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
                name="employee_identity_field"
                className="w-full bg-[#121212] border border-white/[0.03] rounded-sm py-2.5 px-4 text-[12px] text-white focus:outline-none focus:border-white/10 transition-none placeholder:text-neutral-800"
                placeholder="employee.id"
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
                name="employee_passkey_field"
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

          <div className="mt-8 pt-6 border-t border-white/[0.03] flex items-center justify-center gap-4">
            <span className="text-[9px] text-neutral-800 font-bold uppercase tracking-widest">v2-employee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
