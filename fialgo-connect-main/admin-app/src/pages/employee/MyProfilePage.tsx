import { User, Mail, Shield, Key, Building2, CalendarDays } from "lucide-react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { ROLE_LABELS } from "../../lib/rbac";

export default function MyProfilePage() {
  const { adminUser } = useAdminAuth();

  // adminUser is guaranteed to exist here (AuthGuard ensures it)
  if (!adminUser) return null;

  const displayName = adminUser.full_name || adminUser.email;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleLabel = ROLE_LABELS[adminUser.role] || adminUser.role;

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">My Profile</h1>
        <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
          Personal Information & Account Security
        </p>
      </div>

      {/* Identity Card */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center text-xl sm:text-2xl font-bold text-indigo-300 shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0 w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 truncate">{displayName}</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
            <Shield size={11} /> {roleLabel}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-4 sm:mt-5 text-left">
            <div className="flex items-center gap-3 p-3 bg-black/20 border border-white/[0.04] rounded-lg">
              <Mail size={14} className="text-neutral-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Email</p>
                <p className="text-[12px] text-white font-mono truncate">{adminUser.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-black/20 border border-white/[0.04] rounded-lg">
              <Building2 size={14} className="text-neutral-500 shrink-0" />
              <div>
                <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Department</p>
                <p className="text-[12px] text-white">Admin Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-black/20 border border-white/[0.04] rounded-lg">
              <User size={14} className="text-neutral-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Account ID</p>
                <p className="text-[11px] text-white font-mono truncate">{adminUser.id.slice(0, 16)}…</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-black/20 border border-white/[0.04] rounded-lg">
              <Shield size={14} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Status</p>
                <p className="text-[12px] text-emerald-400 font-bold">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-6">
        <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Key size={13} className="text-neutral-600" /> Account Security
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-white/5 rounded bg-black/20">
            <div className="flex items-center gap-3">
              <Key size={14} className="text-neutral-500" />
              <div>
                <p className="text-[11px] font-bold text-white">Password</p>
                <p className="text-[9px] text-neutral-500">Change your login password</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest rounded transition-colors">
              Update
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border border-white/5 rounded bg-black/20">
            <div className="flex items-center gap-3">
              <Shield size={14} className="text-emerald-500" />
              <div>
                <p className="text-[11px] font-bold text-white">Two-Factor Auth</p>
                <p className="text-[9px] text-emerald-500/70">Enabled (Authenticator App)</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest rounded transition-colors">
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
