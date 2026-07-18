import React from "react";
import { X, User, TrendingUp, DollarSign, Users, Award, ShieldCheck, Mail, MapPin, Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";

interface MentorDeepScanProps {
  mentorId: string;
  onClose: () => void;
}

export default function MentorDeepScan({ mentorId, onClose }: MentorDeepScanProps) {
  // Mock data for the selected mentor
  const mentorData = {
    id: mentorId,
    name: mentorId === "1" ? "Sarah Jenkins" : mentorId === "2" ? "David Chen" : "Marcus Wright",
    email: "mentor@tradifive.com",
    expertise: "Forex & Gold",
    studentsCount: 124,
    revenueSold: "$45,200",
    rating: 4.8,
    status: "active",
    joined: "2024-01-15",
    location: "London, UK",
    students: [
      { id: "s1", name: "Alex Mercer", email: "alex@example.com", joinedDate: "2024-02-10", progress: "85%" },
      { id: "s2", name: "Jordan Lee", email: "jordan@example.com", joinedDate: "2024-03-05", progress: "40%" },
      { id: "s3", name: "Casey Smith", email: "casey@example.com", joinedDate: "2024-04-20", progress: "10%" },
      { id: "s4", name: "Taylor Swift", email: "taylor@example.com", joinedDate: "2024-01-22", progress: "100%" },
      { id: "s5", name: "Morgan Freeman", email: "morgan@example.com", joinedDate: "2024-05-01", progress: "5%" },
    ]
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl h-full max-h-[90vh] bg-[#0e0e0e] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-lg uppercase ${mentorData.status === "inactive" ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-blue-500/30 bg-blue-500/10 text-blue-400"}`}>
              {mentorData.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white tracking-widest uppercase">{mentorData.name}</h2>
                <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${
                  mentorData.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>{mentorData.status}</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-bold text-purple-400 uppercase">
                  {mentorData.expertise}
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{mentorData.email} • ID: {mentorData.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 outline-none focus:outline-none rounded-full bg-white/5 flex items-center justify-center text-neutral-500 hover:text-white border border-white/5 transition-all">
            <X size={16} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/10 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue Generated", value: mentorData.revenueSold, icon: DollarSign, color: "text-emerald-400" },
              { label: "Active Students", value: mentorData.studentsCount, icon: Users, color: "text-blue-400" },
              { label: "Average Rating", value: `${mentorData.rating} / 5.0`, icon: Star, color: "text-amber-400" },
              { label: "Growth (30d)", value: "+12%", icon: TrendingUp, color: "text-emerald-500" },
            ].map((m, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-white/5 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <m.icon size={14} className="text-neutral-600" />
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                </div>
                <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">{m.label}</p>
                <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mentor Profile Details */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={12} className="text-blue-500" /> Identity Record
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: "Email", value: mentorData.email, icon: Mail },
                    { label: "Location", value: mentorData.location, icon: MapPin },
                    { label: "Joined", value: new Date(mentorData.joined).toLocaleDateString("en-US", { month: "short", year: "numeric" }), icon: Calendar },
                    { label: "Expertise", value: mentorData.expertise, icon: Award },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-3">
                      <row.icon size={11} className="text-neutral-700 shrink-0" />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">{row.label}</span>
                        <span className="text-[10px] text-neutral-300 font-mono text-right ml-4 truncate max-w-[200px]">{row.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={12} className="text-emerald-500" /> Verification Status
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: "Identity Verified", value: "YES", color: "text-emerald-400" },
                    { label: "Trading Record", value: "AUDITED", color: "text-blue-400" },
                    { label: "Background Check", value: "CLEARED", color: "text-emerald-400" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                      <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">{row.label}</span>
                      <span className={`text-[10px] font-bold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="md:col-span-2">
              <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden h-full flex flex-col">
                <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                    <Users size={12} className="text-purple-500" /> Enrolled Students
                  </h3>
                  <span className="text-[9px] text-neutral-600 font-mono">{mentorData.students.length} of {mentorData.studentsCount} displayed</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.01] border-b border-white/5 sticky top-0 backdrop-blur-md">
                        <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Student</th>
                        <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Enrollment Date</th>
                        <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Course Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {mentorData.students.map((student) => (
                        <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 font-bold text-[9px] uppercase">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-[12px] font-medium text-white">{student.name}</div>
                                <div className="text-[9px] text-neutral-500 font-mono mt-0.5">{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-[11px] font-mono text-neutral-400">{student.joinedDate}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: student.progress }}></div>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-400 min-w-[30px] text-right">{student.progress}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
