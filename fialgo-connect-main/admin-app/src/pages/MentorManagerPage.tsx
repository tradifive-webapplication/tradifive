import { useState } from "react";
import { Search, Filter, ShieldCheck, Mail, Edit, Trash2, GraduationCap, Users } from "lucide-react";
import MentorDeepScan from "../components/MentorDeepScan";

const MOCK_MENTORS = [
  { id: "1", name: "Sarah Jenkins", email: "sarah@tradifive.in", expertise: "Forex & Gold", students: 124, status: "active", rating: 4.8 },
  { id: "2", name: "David Chen", email: "david.c@tradifive.in", expertise: "Options Trading", students: 89, status: "active", rating: 4.9 },
  { id: "3", name: "Marcus Wright", email: "marcus@tradifive.in", expertise: "Crypto & DeFi", students: 210, status: "inactive", rating: 4.5 },
  { id: "4", name: "Elena Rodriguez", email: "elena@tradifive.in", expertise: "Swing Trading", students: 156, status: "active", rating: 4.7 },
];

export default function MentorManagerPage() {
  const [search, setSearch] = useState("");
  const [mentors, setMentors] = useState(MOCK_MENTORS);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);

  const filteredMentors = mentors.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.expertise.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {selectedMentorId && (
        <MentorDeepScan 
          mentorId={selectedMentorId} 
          onClose={() => setSelectedMentorId(null)} 
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase flex items-center gap-2">
            <GraduationCap className="text-blue-500" />
            Mentor Roster
          </h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
            Manage platform mentors & expertise verification
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH MENTORS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1E1E1E] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[10px] font-mono text-white outline-none focus:border-white/20 transition-all w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 border rounded-lg transition-all outline-none ${showFilters ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-[#1E1E1E] border-white/5 text-neutral-500 hover:text-white'}`}
          >
            <Filter size={16} />
          </button>
          <button 
            className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all font-bold text-[10px] uppercase shrink-0"
            title="Add new mentor"
          >
            + Add Mentor
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center gap-4 p-3.5 bg-[#1E1E1E] border border-white/5 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase">Status:</span>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-[#121212] border border-white/5 rounded-lg px-2.5 py-1 text-[10px] text-white outline-none focus:border-white/20">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      )}

      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-white/5">
          {filteredMentors.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={28} className="text-neutral-700 mx-auto mb-2" />
              <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest">No Mentors Found</p>
            </div>
          ) : (
            filteredMentors.map((mentor) => (
              <div 
                key={mentor.id}
                onClick={() => setSelectedMentorId(mentor.id)}
                className="p-3.5 space-y-2.5 hover:bg-white/[0.01] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs uppercase shrink-0">
                      {mentor.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white uppercase truncate">{mentor.name}</p>
                      <p className="text-[10px] text-neutral-500 font-mono truncate mt-0.5">{mentor.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider border shrink-0 ${
                    mentor.status === 'active' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {mentor.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded text-[9px] uppercase font-bold">
                      {mentor.expertise}
                    </span>
                    <span className="text-neutral-400 font-mono">• {mentor.students} students</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <span>{mentor.rating}</span>
                    <span className="text-[10px]">★</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="p-1.5 text-neutral-400 hover:text-emerald-400 bg-white/5 rounded border border-white/5" 
                    title="Verify Identity"
                  >
                    <ShieldCheck size={13} />
                  </button>
                  <button 
                    className="p-1.5 text-neutral-400 hover:text-blue-400 bg-white/5 rounded border border-white/5" 
                    title="Edit Mentor"
                  >
                    <Edit size={13} />
                  </button>
                  <button 
                    className="p-1.5 text-neutral-400 hover:text-rose-400 bg-white/5 rounded border border-white/5" 
                    title="Deactivate"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Mentor Identity</th>
                <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Expertise</th>
                <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Students</th>
                <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Rating</th>
                <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filteredMentors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                     <div className="flex flex-col items-center gap-3">
                       <Users size={30} className="text-neutral-700" />
                       <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed"> No Mentors Found </p>
                     </div>
                  </td>
                </tr>
              ) : (
                filteredMentors.map((mentor) => (
                  <tr 
                    key={mentor.id} 
                    onClick={() => setSelectedMentorId(mentor.id)}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs uppercase">
                          {mentor.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-[13px] font-medium text-white">{mentor.name}</div>
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{mentor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded text-[9px] uppercase font-bold tracking-wider">
                        {mentor.expertise}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-[12px] font-mono text-neutral-300">
                        {mentor.students}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-bold text-amber-500">{mentor.rating}</span>
                        <span className="text-amber-500 text-[10px]">★</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-neutral-500 hover:text-emerald-400 bg-white/5 hover:bg-emerald-400/10 rounded transition-all outline-none focus:outline-none focus:ring-0" 
                            title="Verify Identity"
                          >
                            <ShieldCheck size={14} />
                          </button>
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-neutral-500 hover:text-blue-400 bg-white/5 hover:bg-blue-400/10 rounded transition-all outline-none focus:outline-none focus:ring-0" 
                            title="Edit Mentor"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-neutral-500 hover:text-rose-400 bg-white/5 hover:bg-rose-400/10 rounded transition-all outline-none focus:outline-none focus:ring-0" 
                            title="Deactivate"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center justify-end min-w-[70px]">
                          <span className={`px-2 py-1 rounded text-[9px] uppercase font-bold tracking-wider border ${
                            mentor.status === 'active' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                            {mentor.status}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
