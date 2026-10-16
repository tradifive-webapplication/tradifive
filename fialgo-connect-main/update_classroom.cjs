const fs = require('fs');
let code = fs.readFileSync('src/pages/MentorshipHub.tsx', 'utf8');

const classStart = code.indexOf('function ClassroomTab() {');
const vaultStart = code.indexOf('function ResourceVaultTab() {');

const oldClassroom = code.substring(classStart, vaultStart);

const newClassroom = `function ClassroomTab() {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTag, setNewTag] = useState('Strategy');
  const [lessons, setLessons] = useState(MOCK_LESSONS);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleCreate = () => {
    if (!newTitle.trim()) { toast.error('Lesson title is required.'); return; }
    setLessons(prev => [{
      id: Date.now(), title: newTitle, desc: newDesc, modules: 1,
      enrolled: 0, completed: 0, status: 'Draft', tag: newTag,
    }, ...prev]);
    setNewTitle(''); setNewDesc(''); setShowNewForm(false);
    toast.success('Lesson plan created as Draft. Publish it when ready!');
  };

  const handleSaveEdit = (id: number) => {
    setEditingId(null);
    toast.success('Lesson updated successfully!');
  };

  const handleDelete = (id: number) => {
    setLessons(prev => prev.filter(l => l.id !== id));
    toast.success('Lesson deleted.');
  };

  return (
    <div className="space-y-5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:from-[#171717] dark:to-[#0A0A0A] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#262626] premium-flat-card p-5 md:p-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
        <div>
          <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
            <BookOpen size={16} className="text-blue-500" /> Classroom
          </h2>
          <p className="text-[12px] text-slate-500 dark:text-[#949ba4] mt-1 font-medium">Create and manage structured courses and modules</p>
        </div>
      </div>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-slate-500 dark:text-slate-500 font-medium">{lessons.filter(l => l.status === 'Live').length} live · {lessons.filter(l => l.status === 'Draft').length} draft</p>
        <button
          onClick={() => setShowNewForm(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all shadow-sm border border-blue-100 dark:border-blue-500/20"
        >
          <Plus size={14} /> New Plan
        </button>
      </div>

      {/* Composer */}
      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4 mb-2 mt-2">
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Create Lesson Plan</h3>
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Course title…"
                className="w-full px-4 py-2.5 rounded-xl text-[13px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-slate-800 dark:text-white outline-none focus:border-blue-500/60 transition-all placeholder-slate-400"
              />
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                rows={3}
                placeholder="What will students learn?"
                className="w-full px-4 py-2.5 rounded-xl text-[13px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-slate-800 dark:text-white outline-none focus:border-blue-500/60 transition-all placeholder-slate-400 resize-none"
              />
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  className="px-3.5 py-2 rounded-xl text-[12px] font-bold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-200 outline-none"
                >
                  {['Strategy', 'Risk', 'Mindset', 'Technical Analysis', 'Fundamental'].map(t => <option key={t}>{t}</option>)}
                </select>
                <div className="flex-1" />
                <button onClick={() => setShowNewForm(false)} className="px-4 py-2 rounded-full text-[12px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all">Cancel</button>
                <button onClick={handleCreate} className="px-5 py-2 rounded-full text-[12px] font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-sm shadow-blue-500/20">
                  Save Draft
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans List */}
      <div className="space-y-3 mt-4">
        {lessons.map((l, i) => (
          <motion.div
            key={l.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={\`p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-white dark:bg-[#1C1C1C] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all \${editingId === l.id ? 'ring-2 ring-blue-500/20' : ''}\`}
          >
            {editingId === l.id ? (
              <div className="space-y-4">
                <input
                  value={l.title}
                  onChange={e => setLessons(prev => prev.map(lesson => lesson.id === l.id ? { ...lesson, title: e.target.value } : lesson))}
                  className="w-full px-4 py-2 rounded-xl text-[14px] font-bold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-slate-800 dark:text-white outline-none focus:border-blue-500/60 transition-all"
                />
                <textarea
                  value={l.desc}
                  onChange={e => setLessons(prev => prev.map(lesson => lesson.id === l.id ? { ...lesson, desc: e.target.value } : lesson))}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl text-[13px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-slate-800 dark:text-white outline-none focus:border-blue-500/60 transition-all resize-none"
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={l.status}
                    onChange={e => setLessons(prev => prev.map(lesson => lesson.id === l.id ? { ...lesson, status: e.target.value } : lesson))}
                    className="px-3.5 py-1.5 rounded-xl text-[12px] font-bold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option>Draft</option>
                    <option>Live</option>
                    <option>Archived</option>
                  </select>
                  <select
                    value={l.tag}
                    onChange={e => setLessons(prev => prev.map(lesson => lesson.id === l.id ? { ...lesson, tag: e.target.value } : lesson))}
                    className="px-3.5 py-1.5 rounded-xl text-[12px] font-bold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-200 outline-none"
                  >
                    {['Strategy', 'Risk', 'Mindset', 'Technical Analysis', 'Fundamental'].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <div className="flex-1" />
                  <button onClick={() => handleDelete(l.id)} className="px-4 py-2 rounded-full text-[12px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">Delete</button>
                  <button onClick={() => handleSaveEdit(l.id)} className="px-5 py-2 rounded-full text-[12px] font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-sm shadow-blue-500/20">
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-md border \${
                      l.status === 'Live' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
                      l.status === 'Draft' ? 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10' : 
                      'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
                    }\`}>{l.status}</span>
                    <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-md border \${TAG_STYLES[l.tag] || 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'}\`}>{l.tag}</span>
                    <span className="text-[11px] font-semibold text-slate-400">{l.modules} modules</span>
                  </div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white leading-snug">{l.title}</h3>
                  <p className="text-[12.5px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">{l.desc}</p>
                  
                  {l.status === 'Live' && l.enrolled > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-1.5 flex-1 max-w-[120px] bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: \`\${(l.completed / l.enrolled) * 100}%\` }} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        {Math.round((l.completed / l.enrolled) * 100)}% completion rate
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setEditingId(l.id)}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/5"
                >
                  Edit Plan <ChevronRight size={13} />
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
`;

code = code.replace(oldClassroom, newClassroom);

fs.writeFileSync('src/pages/MentorshipHub.tsx', code);
console.log('ClassroomTab updated');
