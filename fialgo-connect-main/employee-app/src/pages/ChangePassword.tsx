import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, KeyRound, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Double check if the user actually needs a password change
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      if (user.user_metadata?.needs_password_change !== true) {
        navigate("/dashboard");
      }
    };
    checkStatus();
  }, [navigate]);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      // Update the password and simultaneously remove the needs_password_change flag
      // Supabase "Secure Password Change" requires the current password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        // @ts-ignore - Types might not be updated to include current_password
        current_password: currentPassword,
        data: { needs_password_change: false }
      });

      if (error) throw error;

      toast.success("Security Credentials Updated");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6 selection:bg-white/10">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="text-amber-500" size={20} />
          </div>
          <h1 className="text-lg font-bold tracking-[0.2em] text-white uppercase">Security Notice</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-2">
            Action Required: Update Temporary Passkey
          </p>
        </div>

        <div className="bg-[#1E1E1E] border border-white/5 rounded p-8 shadow-2xl relative overflow-hidden">
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded p-3 text-[10px] text-amber-500/90 leading-relaxed uppercase tracking-wider font-bold">
            Welcome to Tradifive. Before accessing your workspace, you must replace your HR-issued temporary passkey with a secure, permanent one.
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4" autoComplete="off">
            <div className="space-y-1.5">
              <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest px-1">Current Temporary Passkey</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-[#121212] border border-white/[0.03] rounded-sm py-2.5 px-4 text-[12px] text-white focus:outline-none focus:border-amber-500/30 transition-colors placeholder:text-neutral-800"
                placeholder="The passkey you just logged in with"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest px-1">New Passkey</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-[#121212] border border-white/[0.03] rounded-sm py-2.5 px-4 text-[12px] text-white focus:outline-none focus:border-amber-500/30 transition-colors placeholder:text-neutral-800"
                placeholder="Minimum 8 characters"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest px-1">Confirm New Passkey</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-[#121212] border border-white/[0.03] rounded-sm py-2.5 px-4 text-[12px] text-white focus:outline-none focus:border-amber-500/30 transition-colors placeholder:text-neutral-800"
                placeholder="Repeat passkey"
              />
            </div>

            <button
              disabled={loading}
              className="w-full mt-2 py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-[0.4em] rounded-sm border border-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Encrypting..."
              ) : (
                <>
                  <KeyRound size={14} />
                  Secure Account
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.03] flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 text-[9px] text-emerald-500/50 font-bold uppercase tracking-widest">
              <CheckCircle2 size={12} />
              End-to-End Encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
