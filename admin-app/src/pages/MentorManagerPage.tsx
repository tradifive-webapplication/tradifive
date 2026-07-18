import { useState } from "react";
import { Search, Filter, ShieldCheck, Mail, Edit, Trash2, GraduationCap, Users } from "lucide-react";
import MentorDeepScan from "../components/MentorDeepScan";

const MOCK_MENTORS = [
  { id: "1", name: "Sarah Jenkins", email: "sarah@tradifive.com", expertise: "Forex & Gold", students: 124, status: "active", rating: 4.8 },
  { id: "2", name: "David Chen", email: "david.c@tradifive.com", expertise: "Options Trading", students: 89, status: "active", rating: 4.9 },
  { id: "3", name: "Marcus Wright", email: "marcus@tradifive.com", expertise: "Crypto & DeFi", students: 210, status: "inactive", rating: 4.5 },
  { id: "4", name: "Elena Rodriguez", email: "elena@tradifive.com", expertise: "Swing Trading", students: 156, status: "active", rating: 4.7 },
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase flex items-center gap-2">
            <GraduationCap className="text-fialgo-blue" />
            Mentor Roster
          </h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Manage platform mentors & expertise verification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH MENTORS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1E1E1E] border border-white/5 rounded pl-9 pr-4 py-2 text-[10px] font-mono text-white outline-none focus:outline-none focus:ring-0 focus:border-white/20 transition-all w-64"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 border rounded transition-all outline-none focus:outline-none focus:ring-0 ${showFilters ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-[#1E1E1E] border-white/5 text-neutral-500 hover:text-white'}`}
          >
            <Filter size={16} />
          </button>
          <button 
            className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 hover:bg-blue-500/20 transition-all font-bold text-[10px] uppercase outline-none focus:outline-none focus:ring-0"
            title="Add new mentor"
          >
            + Add Mentor
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center gap-4 p-4 bg-[#1E1E1E] border border-white/5 rounded-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase">Status:</span>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-[#121212] border border-white/5 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-white/20">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      )}

      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
        <table className="w-full text-left border-collapse">
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
                     <Users size={30} className="text-neutral-800" />
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
  );
}
