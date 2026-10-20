import { useState, useEffect } from "react";
import { BookOpen, Video, FileText, CheckCircle2, XCircle, Search, Plus, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

// Dummy icon for Users
function UsersIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}

export default function LearningManagerPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`*, profiles:author_id (full_name)`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Learning Center</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
            Educational Content Management
          </p>
        </div>
        <button className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-[10px] font-bold uppercase tracking-widest shadow-sm">
          <Plus size={14} />
          Create New Module
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {[
          { label: "Active Courses", val: courses.filter(c => c.type === 'Course').length.toString(), icon: BookOpen },
          { label: "Recorded Webinars", val: courses.filter(c => c.type === 'Webinar').length.toString(), icon: Video },
          { label: "Total Enrollments", val: courses.reduce((acc, c) => acc + (c.enrollments || 0), 0).toLocaleString(), icon: UsersIcon }
        ].map((m, i) => (
          <div key={i} className="bg-[#1E1E1E] border border-white/5 p-3.5 sm:p-5 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest truncate">{m.label}</p>
              {m.icon && <m.icon size={14} className="text-neutral-500 shrink-0" />}
            </div>
            <p className="text-base sm:text-xl font-bold text-white truncate">{m.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden shadow-xl flex flex-col">
        <div className="p-3.5 sm:p-4 border-b border-white/5 bg-white/[0.02]">
           <div className="relative w-full sm:w-[300px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search courses..." 
                className="bg-[#121212] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[11px] text-white w-full focus:outline-none focus:border-white/20 transition-colors placeholder:text-neutral-500"
              />
            </div>
        </div>

        <div className="p-3.5 sm:p-4 space-y-2.5">
          {loading ? (
             <div className="p-12 flex items-center justify-center">
                <Loader2 size={24} className="text-blue-500 animate-spin" />
             </div>
          ) : courses.length === 0 ? (
             <div className="p-12 text-center text-neutral-500 text-xs uppercase tracking-widest">
                No courses or webinars found.
             </div>
          ) : courses.map((course) => (
            <div key={course.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/40 border border-white/5 p-3.5 sm:p-4 rounded-xl hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${course.type === 'Course' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                  {course.type === 'Course' ? <BookOpen size={18} /> : <Video size={18} />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-[13px] font-bold text-white uppercase truncate">{course.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[9px] text-neutral-500 flex-wrap">
                    <span>{course.profiles?.full_name || 'System Admin'}</span>
                    <span>•</span>
                    <span>{course.enrollments || 0} Enrolled</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${
                  course.status === 'published' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                }`}>
                  {course.status === 'published' ? <CheckCircle2 size={11} /> : <FileText size={11} />}
                  <span className="text-[8px] font-bold uppercase tracking-widest">{course.status}</span>
                </div>
                <button className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
