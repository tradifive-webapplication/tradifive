import React, { useState, useEffect } from 'react';
import {
   TwoUsers as IconlyTwoUsers,
   Graph as IconlyGraph,
   Discovery as IconlyDiscovery,
   Activity as IconlyActivity,
   Swap as IconlySwap
} from "react-iconly";

import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Check, GraduationCap, Users, BookOpen, BarChart2, Plus, MessageCircle,
  ExternalLink, ChevronRight, Star, Flame, Clock, CheckCircle2,
  Pin, Send, TrendingUp, TrendingDown, Minus, Heart, Eye,
  Crown, Shield, Zap, Target, X, ChevronDown, Share, Activity,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';


const MOCK_STUDENTS: any[] = [];

const MOCK_LESSONS: any[] = [];

const MOCK_POSTS: any[] = [];

const SENTIMENT_DATA: any[] = [];

const COMMUNITY_STATS: any[] = [];

const COHORT_LEADERS: any[] = [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIER_STYLES: Record<string, string> = {
  Advanced: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  Intermediate: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Beginner: 'bg-slate-200/60 dark:bg-slate-700/40 text-slate-500 dark:text-slate-400 border-slate-300/40 dark:border-slate-600/30',
};

const TAG_STYLES: Record<string, string> = {
  'Risk': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  'Strategy': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Mindset': 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  'Market Update': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'Trade Alert': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

const WrappedBookOpen = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <BookOpen size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedCrown = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Crown size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedTarget = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Target size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const statIconColorMap: Record<number, string> = {
  0: 'text-emerald-500 dark:text-emerald-400 shrink-0',
  1: 'text-purple-500 dark:text-purple-400 shrink-0',
  2: 'text-blue-500 dark:text-blue-400 shrink-0',
  3: 'text-rose-500 dark:text-rose-400 shrink-0',
};

const STATUS_STYLES: Record<string, string> = {
  Live: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Draft: 'bg-slate-200/60 dark:bg-slate-700/40 text-slate-500 border-slate-300/40',
  Archived: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

const TABS = [
  { id: 'students', label: 'Student CRM', icon: IconlyTwoUsers },
  { id: 'classroom', label: 'Classroom', icon: WrappedBookOpen },
  { id: 'vault', label: 'Resource Vault', icon: WrappedCrown },
  { id: 'insights', label: 'Performance Insights', icon: IconlyGraph },
];

// ─── Tab Components ───────────────────────────────────────────────────────────

function StudentsTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [user, setUser] = useState<any>(null);

    useEffect(() => {
      supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, []);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [studentsData, setStudentsData] = useState<any[]>(MOCK_STUDENTS);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchStudents() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('mentor_students')
          .select(`
            *,
            student:profiles!mentor_students_student_id_fkey(
              id, full_name, display_name, avatar_url, username
            )
          `)
          .eq('mentor_id', user.id);

        if (error) {
          console.error('Error fetching students:', error);
          return;
        }

        if (data && data.length > 0) {
          const mapped = data.map(s => ({
            id: s.id,
            name: s.student?.full_name || s.student?.display_name || 'Anonymous',
            username: s.student?.username || 'unknown',
            avatar: s.student?.avatar_url || (s.student?.full_name ? s.student.full_name.substring(0, 2).toUpperCase() : 'U'),
            tier: s.tier,
            progress: 0,
            streak: 0,
            lastActive: new Date(s.last_active_at).toLocaleDateString(),
            joinDate: new Date(s.joined_at).toLocaleDateString(),
            pairs: 'N/A',
            winRate: 0
          }));
          setStudentsData(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [user]);

  const filtered = studentsData.filter(s =>
    (tierFilter === 'All' || s.tier === tierFilter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.username.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleStudent = (id: number) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = () => {
    if (selectedStudents.length === 0) return;
    toast.success(`Group created with ${selectedStudents.length} students! Navigating to community...`);
    setSelectedStudents([]);
    navigate('/channel');
  };

  return (
    <div className="space-y-5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-5 md:p-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-5 gap-4">
        <div>
          <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
            <Users size={16} className="text-purple-500" /> Student CRM
          </h2>
          <p className="text-[12px] text-slate-500 dark:text-[#949ba4] mt-1 font-medium">Manage your students, view tiers, and track progress</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-end w-full xl:w-auto">
          <div className="flex gap-2">
            {['All', 'Advanced', 'Intermediate', 'Beginner'].map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all border ${tierFilter === t
                    ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30 shadow-sm shadow-purple-500/10'
                    : 'bg-white dark:bg-[#1E1E1E] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center w-full sm:w-auto">
            <AnimatePresence>
              {selectedStudents.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={handleCreateGroup}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold bg-purple-500 hover:bg-purple-600 text-white transition-all shadow-sm shadow-purple-500/20 whitespace-nowrap"
                >
                  <Users size={14} /> Create Group ({selectedStudents.length})
                </motion.button>
              )}
            </AnimatePresence>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search students…"
              className="w-full sm:w-56 px-4 py-2 text-[13px] rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-white outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder-slate-400 dark:placeholder-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Student Cards */}
      <div className="space-y-3">
        {filtered.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`group flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer p-4 rounded-xl transition-all ${selectedStudents.includes(s.id) ? 'border border-purple-500/50 shadow-[0_4px_7px_-5px_rgba(168,85,247,0.2),0_0_0_2px_rgba(168,85,247,0.2)] bg-purple-50/30 dark:bg-purple-500/10' : 'border border-slate-100 dark:border-[#2a2a2a] bg-slate-50/50 dark:bg-[#1C1C1C] hover:bg-slate-100/80 dark:hover:bg-[#222]'}`}
          >
            {/* Custom Checkbox */}
            <div
              className="flex items-center justify-center shrink-0 pr-2 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); toggleStudent(s.id); }}
            >
              <div className={`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${selectedStudents.includes(s.id)
                  ? 'border-purple-500 bg-purple-500 shadow-[0_0_0_4px_rgba(168,85,247,0.15)]'
                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1E1E1E] hover:border-purple-400'
                }`}>
                {selectedStudents.includes(s.id) && <Check size={12} className="text-white" strokeWidth={4} />}
              </div>
            </div>

            {/* Avatar + Name */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer" onClick={() => toggleStudent(s.id)}>
              <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-sm font-extrabold text-purple-600 dark:text-purple-400 shrink-0 border border-purple-500/15">
                {/* When real data comes, it will fetch avatarUrl here */}
                {/* {s.avatarUrl ? <img src={s.avatarUrl} alt={s.name} className="w-full h-full object-cover" /> : s.avatar} */}
                {s.avatar}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-bold text-slate-900 dark:text-white">{s.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${TIER_STYLES[s.tier]}`}>{s.tier}</span>
                </div>
                <span className="text-[12px] text-slate-400 dark:text-slate-400">@{s.username} · joined {s.joinDate}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="flex-1 min-w-0 max-w-[220px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Progress</span>
                <span className="text-[12px] font-extrabold text-slate-800 dark:text-white">{s.progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${s.progress >= 80 ? 'bg-emerald-500' : s.progress >= 50 ? 'bg-blue-500' : 'bg-amber-400'}`}
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-[12px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
              <div className="flex flex-col items-center">
                <span className="flex items-center gap-1 text-orange-500"><Flame size={12} />{s.streak}d</span>
                <span className="text-[9px] uppercase tracking-wide mt-0.5">streak</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-slate-700 dark:text-slate-300">{s.winRate}%</span>
                <span className="text-[9px] uppercase tracking-wide mt-0.5">win rate</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="flex items-center gap-1 text-slate-400"><Clock size={11} />{s.lastActive}</span>
                <span className="text-[9px] uppercase tracking-wide mt-0.5">active</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 pl-2">
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/inbox'); toast.info(`Opening chat with ${s.name}`); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              >
                <MessageCircle size={13} /> Message
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/user/${s.username}`); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all"
              >
                <ExternalLink size={12} />
              </button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 dark:text-slate-400">
            <GraduationCap size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-[14px] font-bold">No students match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ClassroomTab() {
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
    <div className="space-y-5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-5 md:p-6">
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
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">{lessons.filter(l => l.status === 'Live').length} live · {lessons.filter(l => l.status === 'Draft').length} draft</p>
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
                className="w-full px-4 py-2.5 rounded-xl text-[13px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-white outline-none focus:border-blue-500/60 transition-all placeholder-slate-400"
              />
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                rows={3}
                placeholder="What will students learn?"
                className="w-full px-4 py-2.5 rounded-xl text-[13px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-white outline-none focus:border-blue-500/60 transition-all placeholder-slate-400 resize-none"
              />
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  className="px-3.5 py-2 rounded-xl text-[12px] font-bold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-slate-700 dark:text-slate-200 outline-none"
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
            className={`p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-white dark:bg-[#1C1C1C] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all ${editingId === l.id ? 'ring-2 ring-blue-500/20' : ''}`}
          >
            {editingId === l.id ? (
              <div className="space-y-4">
                <input
                  value={l.title}
                  onChange={e => setLessons(prev => prev.map(lesson => lesson.id === l.id ? { ...lesson, title: e.target.value } : lesson))}
                  className="w-full px-4 py-2 rounded-xl text-[14px] font-bold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-white outline-none focus:border-blue-500/60 transition-all"
                />
                <textarea
                  value={l.desc}
                  onChange={e => setLessons(prev => prev.map(lesson => lesson.id === l.id ? { ...lesson, desc: e.target.value } : lesson))}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl text-[13px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-white outline-none focus:border-blue-500/60 transition-all resize-none"
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={l.status}
                    onChange={e => setLessons(prev => prev.map(lesson => lesson.id === l.id ? { ...lesson, status: e.target.value } : lesson))}
                    className="px-3.5 py-1.5 rounded-xl text-[12px] font-bold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-slate-700 dark:text-slate-200 outline-none"
                  >
                    <option>Draft</option>
                    <option>Live</option>
                    <option>Archived</option>
                  </select>
                  <select
                    value={l.tag}
                    onChange={e => setLessons(prev => prev.map(lesson => lesson.id === l.id ? { ...lesson, tag: e.target.value } : lesson))}
                    className="px-3.5 py-1.5 rounded-xl text-[12px] font-bold border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E1E] text-slate-700 dark:text-slate-200 outline-none"
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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${l.status === 'Live' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                        l.status === 'Draft' ? 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10' :
                          'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
                      }`}>{l.status}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${TAG_STYLES[l.tag] || 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10'}`}>{l.tag}</span>
                    <span className="text-[11px] font-semibold text-slate-400">{l.modules} modules</span>
                  </div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white leading-snug">{l.title}</h3>
                  <p className="text-[12.5px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">{l.desc}</p>

                  {l.status === 'Live' && l.enrolled > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-1.5 flex-1 max-w-[120px] bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(l.completed / l.enrolled) * 100}%` }} />
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
function ResourceVaultTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [files, setFiles] = useState([
    { id: 1, name: 'Pro Scalper EA.ex5', type: 'Expert Advisor', size: '1.2 MB', downloads: 124, date: '2 days ago' },
    { id: 2, name: 'Liquidity Sweeps Indicator.pine', type: 'TradingView Script', size: '45 KB', downloads: 342, date: '1 week ago' },
    { id: 3, name: 'Mentorship Rulebook v2.pdf', type: 'PDF Document', size: '3.4 MB', downloads: 89, date: '3 weeks ago' }
  ]);

  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState<any>(null);

  // Modal inner state
  const [shareTab, setShareTab] = useState<'channels' | 'users' | 'groups'>('channels');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);

  // Mock data for sharing targets
  const channels = [
    { id: 'c1', name: 'General Chat', type: 'Public', icon: MessageCircle },
    { id: 'c2', name: 'VIP Mentorship', type: 'Private', icon: Shield },
    { id: 'c3', name: 'Trade Alerts', type: 'Private', icon: Zap },
  ];

  const users = [
    { id: 'u1', name: 'Marcus Webb', avatar: 'MW' },
    { id: 'u2', name: 'Aisha Patel', avatar: 'AP' },
    { id: 'u3', name: 'Diego Santos', avatar: 'DS' },
  ];

  const groups = [
    { id: 'g1', name: 'Alpha Traders' },
    { id: 'g2', name: 'Beginner Bootcamp Q2' },
  ];

  const handleOpenShare = (file: any) => {
    setFileToShare(file);
    setShareTab('channels');
    setSelectedTargets([]);
    setSearchQuery('');
    setShareModalOpen(true);
  };

  const toggleTarget = (id: string) => {
    setSelectedTargets(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSendShare = () => {
    if (selectedTargets.length === 0) {
      toast.error('Please select at least one destination to share to.');
      return;
    }
    toast.success(`"${fileToShare.name}" has been shared successfully!`);
    setShareModalOpen(false);

    if (shareTab === 'channels') {
      setTimeout(() => navigate('/channel'), 800);
    }
  };

  return (
    <>
      <div className="space-y-5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-5 md:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
          <div>
            <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <Crown size={16} className="text-blue-500" /> Resource Vault
            </h2>
            <p className="text-[12px] text-slate-500 dark:text-[#949ba4] mt-1 font-medium">Share EAs, indicators, and PDFs with your students</p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold bg-purple-500 hover:bg-purple-600 text-white transition-all shadow-sm shadow-purple-500/20">
            <Plus size={14} /> Upload File
          </button>
        </div>

        <div className="space-y-3">
          {files.length === 0 ? (
            <div className="text-center py-10">
              <Crown size={32} className="text-slate-300 dark:text-slate-400 mx-auto mb-3" />
              <p className="text-[14px] font-bold text-slate-500 dark:text-slate-400">No resources uploaded yet.</p>
            </div>
          ) : (
            files.map((f, i) => (
              <div key={f.id} className="p-4 rounded-xl border border-slate-100 dark:border-[#2a2a2a] bg-slate-50/50 dark:bg-[#1C1C1C] hover:bg-slate-100/80 dark:hover:bg-[#222] transition-all flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <Crown size={18} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white leading-snug">{f.name}</h3>
                  <p className="text-[12px] text-slate-500">{f.type} · {f.size}</p>
                </div>
                <div className="flex items-center gap-6 text-[12px] font-bold text-slate-400 shrink-0">
                  <span className="flex flex-col items-center"><span className="text-slate-700 dark:text-slate-300">{f.downloads}</span><span className="text-[9px] uppercase">downloads</span></span>
                  <span className="flex flex-col items-center"><span className="text-slate-700 dark:text-slate-300">{f.date}</span><span className="text-[9px] uppercase">uploaded</span></span>

                  <button
                    onClick={() => handleOpenShare(f)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 flex items-center justify-center transition-all text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 ml-2"
                    title="Share Resource"
                  >
                    <Share size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Master Share Modal - Aesthetic from Channel Creation */}
      <AnimatePresence>
        {shareModalOpen && fileToShare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[440px] bg-[#F8FAFC] dark:bg-[#1E1E1E] rounded-[24px] shadow-2xl overflow-hidden flex flex-col relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setShareModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-300 dark:bg-[#1E1E1E]/80 dark:hover:bg-[#252528] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors z-10"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="p-6 pt-7 relative pb-4">
                <div className="mb-4 space-y-3">
                  <div className="w-11 h-11 rounded-[14px] bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20 dark:ring-indigo-500/30 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]">
                    <Share size={18} className="fill-indigo-500/20" />
                  </div>
                  <div>
                    <h3 className="text-[19px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Share Resource
                    </h3>
                    <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                      Select where you want to send <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{fileToShare.name}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 flex flex-col gap-3">
                {/* Tabs matching the aesthetic */}
                <div className="flex gap-2">
                  {[
                    { id: 'channels', label: 'Channels', icon: MessageCircle },
                    { id: 'users', label: 'Direct Message', icon: Users },
                    { id: 'groups', label: 'Student Groups', icon: Users },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setShareTab(t.id as any); setSelectedTargets([]); setSearchQuery(''); }}
                      className={`flex-1 py-2.5 rounded-xl transition-all font-bold text-[11.5px] flex items-center justify-center gap-1.5 border-2 ${shareTab === t.id
                          ? 'bg-white dark:bg-[#1E1E1E] border-indigo-200 dark:border-white/5 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'bg-transparent border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5'
                        }`}
                    >
                      <t.icon size={13} />
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Search matching input aesthetic */}
                <input
                  type="text"
                  placeholder={`Search ${shareTab}...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-[#1E1E1E] border-2 border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>

              {/* List Content */}
              <div className="px-6 mt-4 mb-4 overflow-y-auto space-y-2 h-[160px] min-h-[160px] max-h-[160px] shrink-0">
                {shareTab === 'channels' && channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => {
                  const isSelected = selectedTargets.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleTarget(c.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between shadow-sm ${isSelected
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] hover:border-slate-300 dark:hover:border-[#444]'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-[#1E1E1E] text-slate-500'}`}>
                          <c.icon size={14} />
                        </div>
                        <span className={`text-[13px] font-bold ${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>{c.name}</span>
                      </div>
                      {isSelected && <Check size={16} className="text-indigo-500" />}
                    </button>
                  );
                })}

                {shareTab === 'users' && users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => {
                  const isSelected = selectedTargets.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      onClick={() => toggleTarget(u.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between shadow-sm ${isSelected
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] hover:border-slate-300 dark:hover:border-[#444]'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          {u.avatar}
                        </div>
                        <span className={`text-[13px] font-bold ${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>{u.name}</span>
                      </div>
                      {isSelected && <Check size={16} className="text-indigo-500" />}
                    </button>
                  );
                })}

                {shareTab === 'groups' && groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map(g => {
                  const isSelected = selectedTargets.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleTarget(g.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between shadow-sm ${isSelected
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] hover:border-slate-300 dark:hover:border-[#444]'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-[#1E1E1E] text-slate-500'}`}>
                          <Users size={14} />
                        </div>
                        <span className={`text-[13px] font-bold ${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>{g.name}</span>
                      </div>
                      {isSelected && <Check size={16} className="text-indigo-500" />}
                    </button>
                  );
                })}

                {/* Empty state handlers */}
                {shareTab === 'channels' && channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <p className="text-center text-slate-500 text-[12px] py-4 font-medium">No channels found.</p>
                )}
                {shareTab === 'users' && users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <p className="text-center text-slate-500 text-[12px] py-4 font-medium">No students found.</p>
                )}
                {shareTab === 'groups' && groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <p className="text-center text-slate-500 text-[12px] py-4 font-medium">No groups found.</p>
                )}
              </div>

              {/* Footer Action Area */}
              <div className="px-6 py-5 bg-white dark:bg-[#1E1E1E] flex items-center justify-end gap-4 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="text-[13.5px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendShare}
                  disabled={selectedTargets.length === 0}
                  className="px-6 py-2.5 rounded-xl text-[13.5px] font-bold text-white bg-[#A78BFA] hover:bg-[#8B5CF6] transition-all shadow-md shadow-[#A78BFA]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Share {selectedTargets.length > 0 ? `(${selectedTargets.length})` : ''} <ChevronRight size={14} className="stroke-[3px]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
function InsightsTab() {

  const [myVote, setMyVote] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/[0.04] border border-blue-500/20">
        <Shield size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[12px] text-blue-600 dark:text-blue-400 leading-relaxed font-medium">
          All data below is <strong>anonymized and aggregated</strong>. You can observe community patterns to inform your mentorship — but you cannot intervene in, copy, or control any individual student's trades.
        </p>
      </div>

      {/* Community Stats Grid */}
      <div>
        <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-3">Community Performance Overview</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {COMMUNITY_STATS.map((s, i) => {
            const icons = [WrappedTarget, IconlySwap, IconlyDiscovery, IconlyActivity];
            const colors = [
              'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
              'text-purple-500 bg-purple-500/10 border-purple-500/20',
              'text-blue-500 bg-blue-500/10 border-blue-500/20',
              'text-rose-500 bg-rose-500/10 border-rose-500/20'
            ];
            const Icon = icons[i];
            const deltaColor = s.up === true ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : s.up === false ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-slate-500 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10';
            const DeltaIcon = s.up === true ? TrendingUp : s.up === false ? TrendingDown : Minus;

            return (
              <div key={i} className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-3.5 group transition-all">
                <div className="flex items-center justify-between mb-2">
                  <Icon set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className={statIconColorMap[i]} />
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${deltaColor}`}>
                    <DeltaIcon size={10} />
                    {s.delta}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 dark:text-[#949ba4] uppercase tracking-wider truncate mb-0.5">{s.label}</h3>
                  <p className="text-[18px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-col: Leaderboard + Sentiment */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Opt-in Anonymized Leaderboard */}
        <div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Crown size={15} className="text-amber-500" /> Top Students (Opt-in)
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10">Anonymized</span>
          </div>
          <div className="space-y-2.5">
            {COHORT_LEADERS.map(l => (
              <div key={l.rank} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold shrink-0 ${l.rank === 1 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600' : l.rank === 2 ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : l.rank === 3 ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                  #{l.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-slate-800 dark:text-white">{l.label}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${TIER_STYLES[l.tier]}`}>{l.tier}</span>
                  </div>
                </div>
                <span className="text-[13px] font-extrabold text-purple-500 shrink-0">{l.score} pts</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-3 leading-relaxed">Scores reflect lesson completion + engagement. Trade results are excluded.</p>
        </div>

        {/* Daily Sentiment Poll */}
        <div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-5">
          <h3 className="text-[13px] font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <Zap size={15} className="text-amber-400" /> Student Sentiment Today
          </h3>
          <p className="text-[12px] text-slate-400 mb-5">How are your students feeling about the markets right now?</p>

          <div className="space-y-3 mb-6">
            {SENTIMENT_DATA.map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                  <span className="text-[12px] font-extrabold text-slate-600 dark:text-slate-400">{item.pct}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 dark:border-white/5 pt-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">Your own sentiment today:</p>
            <div className="flex gap-2 flex-wrap">
              {['Bullish 🚀', 'Neutral 😐', 'Bearish 🐻'].map(v => (
                <button
                  key={v}
                  onClick={() => { setMyVote(v); toast.success('Sentiment recorded!'); }}
                  className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-all ${myVote === v
                      ? 'bg-purple-500 text-white border-purple-500 shadow-sm shadow-purple-500/20'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Guidance Prompt */}
      <div className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/15 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
          <Target size={18} className="text-purple-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-900 dark:text-white">Pattern detected: 20% of students haven't completed any lessons this week.</p>
          <p className="text-[12px] text-slate-500 mt-0.5">Consider posting a re-engagement Guidance Post or pinning a motivational message.</p>
        </div>
        <button
          onClick={() => toast.info('Switching to Guidance Posts tab…')}
          className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold bg-purple-500 hover:bg-purple-600 text-white transition-all shadow-sm shadow-purple-500/20"
        >
          Post Now
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function MentorshipHub() {
  const [activeTab, setActiveTab] = useState('students');
  const navigate = useNavigate();

  const tabContent: Record<string, React.ReactNode> = {
    students: <StudentsTab navigate={navigate} />,
    classroom: <ClassroomTab />,
    vault: <ResourceVaultTab navigate={navigate} />,
    insights: <InsightsTab />,
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Creator Dashboard', path: '/creator/analytics' },
        { label: 'Mentorship Hub', path: '/creator/mentorship' },
      ]}
      noPadding={true}
    >
      <div className="w-full px-4 md:px-6 py-6 pb-24 space-y-6 font-sans">

        {/* Top Controls: Tabs (Center) & Stats/Actions (Right) */}
        <div className="flex flex-col xl:flex-row items-center justify-between w-full max-w-5xl xl:max-w-[1200px] mx-auto mb-6 gap-6 relative">
          
          {/* Spacer to perfectly center the tabs in flex layout */}
          <div className="hidden xl:block flex-1"></div>

          {/* Tabs Navigation */}
          <div className="flex-1 flex justify-center shrink-0">
            <div className="flex w-fit items-center gap-1 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-full shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-1.5 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all shrink-0 ${active
                        ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm shadow-purple-500/10 border border-purple-100 dark:border-purple-500/20'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats & Actions on the right */}
          <div className="flex-1 flex justify-end shrink-0">
            <div className="flex items-center text-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 md:px-6 py-2 rounded-full shadow-sm">
              <div className="hidden md:flex items-center gap-5">
                <div>
                  <p className="text-[16px] font-extrabold text-slate-900 dark:text-white leading-tight">6</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Students</p>
                </div>
                <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
                <div>
                  <p className="text-[16px] font-extrabold text-slate-900 dark:text-white leading-tight">5</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Lessons</p>
                </div>
                <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
                <div>
                  <p className="text-[16px] font-extrabold text-emerald-500 leading-tight">58%</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 whitespace-nowrap">Avg Win Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
