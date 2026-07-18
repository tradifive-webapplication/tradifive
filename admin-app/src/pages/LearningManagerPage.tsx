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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Learning Center</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Educational Content Management
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Plus size={14} />
          Create New Module
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Courses", val: courses.filter(c => c.type === 'Course').length.toString(), icon: BookOpen },
          { label: "Recorded Webinars", val: courses.filter(c => c.type === 'Webinar').length.toString(), icon: Video },
          { label: "Total Enrollments", val: courses.reduce((acc, c) => acc + (c.enrollments || 0), 0).toLocaleString(), icon: UsersIcon }
        ].map((m, i) => (
          <div key={i} className="bg-[#1E1E1E] border border-white/5 p-5 rounded">
            <div className="flex items-center justify-between mb-2">
              <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-widest">{m.label}</p>
              {m.icon && <m.icon size={14} className="text-neutral-600" />}
            </div>
            <p className="text-xl font-bold text-white">{m.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden flex flex-col h-[calc(100vh-280px)]">
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
           <div className="relative w-[300px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search courses..." 
                className="bg-[#121212] border border-white/5 rounded pl-9 pr-4 py-1.5 text-[11px] text-white w-full focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-3">
          {loading ? (
             <div className="h-full flex items-center justify-center">
                <Loader2 size={24} className="text-blue-500 animate-spin" />
             </div>
          ) : courses.length === 0 ? (
             <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
                No courses or webinars found.
             </div>
          ) : courses.map((course) => (
            <div key={course.id} className="flex items-center justify-between bg-black/50 border border-white/5 p-4 rounded hover:border-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded flex items-center justify-center ${course.type === 'Course' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                  {course.type === 'Course' ? <BookOpen size={20} /> : <Video size={20} />}
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-white">{course.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-neutral-500">{course.profiles?.full_name || 'System Admin'}</span>
                    <span className="text-[10px] text-neutral-600">•</span>
                    <span className="text-[10px] text-neutral-500">{course.enrollments || 0} Enrolled</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
                  course.status === 'published' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                }`}>
                  {course.status === 'published' ? <CheckCircle2 size={12} /> : <FileText size={12} />}
                  <span className="text-[9px] font-bold uppercase tracking-widest">{course.status}</span>
                </div>
                <button className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
