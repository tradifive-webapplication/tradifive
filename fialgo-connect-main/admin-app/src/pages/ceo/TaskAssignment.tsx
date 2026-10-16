import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, CheckCircle2, Clock, User, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { toast } from "sonner";

export default function TaskAssignment() {
  const { adminUser } = useAdminAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    const { data: tasksData } = await supabase.from("team_tasks").select("*").order("created_at", { ascending: false });
    if (tasksData) setTasks(tasksData);
    
    const { data: usersData } = await supabase.from("admin_profiles").select("email, full_name, role").order("full_name");
    if (usersData) setUsers(usersData);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assigneeEmail) {
      toast.error("Title and Assignee are required");
      return;
    }

    const finalDescription = mediaUrl ? `${description}\n\n[MEDIA_URL]:${mediaUrl}` : description;

    const newTask = {
      title,
      description: finalDescription,
      assignee_email: assigneeEmail,
      assigned_by_email: adminUser?.email || "ceo@tradifive.in",
      due_date: dueDate || null,
      status: "pending"
    };

    const { error } = await supabase.from("team_tasks").insert(newTask);
    if (error) {
      toast.error("Failed to assign task");
      console.error(error);
    } else {
      toast.success("Task Assigned successfully");
      setTitle("");
      setDescription("");
      setAssigneeEmail("");
      setDueDate("");
      setMediaUrl("");
      fetchTasks();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("team_tasks").delete().eq("id", id);
    if (!error) {
      toast.success("Task deleted");
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Task Assignment</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Assign and monitor team objectives
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Assign Form */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-6 lg:col-span-1 h-fit">
          <h2 className="text-[12px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <Plus size={14} className="text-indigo-400" /> New Task
          </h2>
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Task Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Update Hero Section"
                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Assignee *</label>
              <select
                value={assigneeEmail}
                onChange={e => setAssigneeEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="" disabled>Select a team member...</option>
                {users.map(u => (
                  <option key={u.email} value={u.email}>
                    {u.full_name} ({u.role.replace('_', ' ').toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Due Date & Time (Optional)</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Add context or instructions..."
                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Media URL (Image / Video link)</label>
              <input
                type="url"
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 mb-4"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-widest py-3 rounded transition-colors"
            >
              Assign Task
            </button>
          </form>
        </div>

        {/* Task List */}
        <div className="bg-[#1E1E1E] border border-white/5 rounded-lg p-6 lg:col-span-2">
           <h2 className="text-[12px] font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" /> Active & Recent Tasks
          </h2>

          {loading ? (
            <div className="text-center text-neutral-500 text-[11px] py-10 uppercase tracking-widest">Loading Tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-neutral-500 text-[11px] py-10">No tasks assigned yet.</div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={task.id} 
                  className="bg-black/30 border border-white/5 rounded-lg p-4 flex flex-col md:flex-row gap-4 justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${
                        task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                        task.status === 'in_progress' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {task.status.replace("_", " ")}
                      </span>
                      <h3 className={`text-[14px] font-bold ${task.status === 'completed' ? 'text-neutral-500 line-through' : 'text-white'}`}>
                        {task.title}
                      </h3>
                    </div>
                    {task.description && !task.description.includes('[MEDIA_URL]:') && (
                      <p className="text-[11px] text-neutral-400 mt-2 whitespace-pre-wrap">{task.description}</p>
                    )}
                    {task.description && task.description.includes('[MEDIA_URL]:') && (
                      <div className="mt-2">
                        <p className="text-[11px] text-neutral-400 whitespace-pre-wrap mb-3">
                          {task.description.split('\n\n[MEDIA_URL]:')[0]}
                        </p>
                        {(() => {
                          const url = task.description.split('\n\n[MEDIA_URL]:')[1];
                          const isVideo = url.match(/\.(mp4|webm|ogg)$/i) || url.includes('youtube') || url.includes('vimeo');
                          return isVideo ? (
                            <video src={url} controls className="max-w-full h-32 rounded border border-white/10" />
                          ) : (
                            <img src={url} alt="Task Media" className="max-w-full h-32 object-cover rounded border border-white/10" />
                          );
                        })()}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                        <User size={12} /> {task.assignee_email}
                      </div>
                      {task.due_date && (
                        <div className={`flex items-center gap-1 text-[10px] ${
                          new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-400' : 'text-neutral-500'
                        }`}>
                          <Clock size={12} /> Due: {new Date(task.due_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
