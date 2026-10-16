import React, { useState, useEffect } from 'react';
import {
   Calendar as IconlyCalendar,
   Play as IconlyPlay
} from "react-iconly";

import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Video, Plus, Calendar, Clock, Link as LinkIcon, Users, Edit2, Trash2, Copy, Check, Info, Globe, PlayCircle, Settings, Radio, X, Share
} from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

// ─── Types ────────────────────────────────────────────────────────────────────

const WrappedRadio = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Radio size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  platform: 'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'Other';
  meetingLink: string;
  passcode?: string;
  createdAt: string;
  creatorName: string;
  creatorId: string;
}

const PLATFORMS = ['Zoom', 'Google Meet', 'Microsoft Teams', 'Other'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LS_KEY = 'tradifive_live_sessions';

function getSessions(): LiveSession[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function saveSessions(sessions: LiveSession[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(sessions));
  window.dispatchEvent(new Event('tradifive_sessions_update'));
}

// ─── Components ───────────────────────────────────────────────────────────────

export default function LiveSessions() {
  const [sessions, setSessions] = useState<LiveSession[]>(() => getSessions());
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recordings' | 'stream'>('upcoming');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [platform, setPlatform] = useState('Zoom');
  const [meetingLink, setMeetingLink] = useState('');
  const [passcode, setPasscode] = useState('');

  // Identify Viewer Role
  const userAccountType = localStorage.getItem('tradifive_cached_account_type') || 'personal';
  const isCreator = true; // Always true for the mentor view
  const currentUserId = localStorage.getItem('tradifive_cached_username') || 'creator';

  useEffect(() => {
    const handler = () => setSessions(getSessions());
    window.addEventListener('tradifive_sessions_update', handler);
    return () => window.removeEventListener('tradifive_sessions_update', handler);
  }, []);

  const handleCreate = () => {
    if (!title.trim() || !date || !time || !meetingLink.trim()) {
      toast.error('Title, Date, Time, and Meeting Link are required.');
      return;
    }

    const newSession: LiveSession = {
      id: `session_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      platform: platform as any,
      meetingLink: meetingLink.trim(),
      passcode: passcode.trim(),
      createdAt: new Date().toISOString(),
      creatorName: localStorage.getItem('tradifive_cached_display_name') || 'Creator',
      creatorId: currentUserId,
    };

    saveSessions([...sessions, newSession]);
    toast.success('Live session scheduled successfully! 🎉');
    
    // Reset form
    setTitle(''); setDescription(''); setDate(''); setTime(''); setMeetingLink(''); setPasscode('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    saveSessions(sessions.filter(s => s.id !== id));
    toast.success('Session deleted.');
  };

  const copyLink = (link: string, pass?: string) => {
    const text = pass ? `${link} (Passcode: ${pass})` : link;
    navigator.clipboard.writeText(text);
    toast.success('Meeting link copied!');
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-[13px] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1E1E1E] text-slate-800 dark:text-white outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder-slate-400 dark:placeholder-slate-600 font-sans";
  const labelCls = "block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5";

  // If Creator, show their scheduled sessions. If Student, show sessions from their mentors.
  const displaySessions = isCreator ? sessions.filter(s => s.creatorId === currentUserId) : sessions;
  const sortedSessions = displaySessions.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  // Filter out past sessions based on current date
  const now = new Date();
  const upcomingSessions = sortedSessions; // Show all for now

  const TABS = [
    { id: 'upcoming', label: 'Upcoming Sessions', icon: IconlyCalendar },
    { id: 'recordings', label: 'Past Recordings', icon: IconlyPlay },
    ...(isCreator ? [{ id: 'stream', label: 'Stream Settings', icon: WrappedRadio }] : [])
  ] as const;

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: isCreator ? 'Creator Dashboard' : 'Community', path: isCreator ? '/creator/analytics' : '/discover' },
        { label: 'Live Sessions', path: '/creator/live' },
      ]}
      noPadding={true}
    >
      <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto pb-24 space-y-6 font-sans">
        
        {/* Top Controls: Tabs (Center) & Schedule Button (Right) */}
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl mx-auto mb-6 gap-6 relative">
          
          {/* Spacer to perfectly center the tabs in flex layout */}
          <div className="hidden md:block flex-1"></div>

          {/* Tabs Navigation */}
          <div className="flex-1 flex justify-center shrink-0">
            <div className="flex w-fit items-center gap-1 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-full shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-1.5 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all shrink-0 ${
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Button on the right */}
          <div className="flex-1 flex justify-end shrink-0">
            {isCreator && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-sm shadow-indigo-500/20 shrink-0"
              >
                <Plus size={15} /> Schedule Session
              </button>
            )}
          </div>
        </div>


        {/* UPCOMING SESSIONS TAB */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4 max-w-5xl mx-auto bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-5 md:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-4">
              <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                <Calendar size={16} className="text-indigo-500" /> Upcoming Scheduled Sessions
              </h2>
            </div>
        {/* Schedule Form */}
        <AnimatePresence>
          {isAdding && isCreator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="w-full bg-slate-50/50 dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#2a2a2a] rounded-xl p-5 mb-5">
                <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar size={16} className="text-indigo-500" />
                      Schedule a New Session
                    </h2>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - General Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <span className="w-5 h-5 rounded flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px]">1</span>
                      General Information
                    </div>
                    
                    <div>
                      <label className={labelCls}>Session Title *</label>
                      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Masterclass: Market Structure" className={`${inputCls} py-2`} />
                    </div>

                    <div>
                      <label className={labelCls}>Description (Optional)</label>
                      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="What will students learn in this session?" className={`${inputCls} py-2 resize-none`} />
                    </div>
                  </div>

                  {/* Right Column - Logistics */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <span className="w-5 h-5 rounded flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px]">2</span>
                      Timing & Access
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Date *</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`${inputCls} py-2`} />
                      </div>
                      <div>
                        <label className={labelCls}>Time *</label>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className={`${inputCls} py-2`} />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Platform *</label>
                      <select value={platform} onChange={e => setPlatform(e.target.value)} className={`${inputCls} py-2`}>
                        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className={labelCls}>Meeting Link *</label>
                        <input value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://zoom.us/..." className={`${inputCls} py-2`} />
                      </div>
                      <div>
                        <label className={labelCls}>Passcode</label>
                        <input value={passcode} onChange={e => setPasscode(e.target.value)} placeholder="Optional" className={`${inputCls} py-2`} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3">
                  <button onClick={() => setIsAdding(false)} className="px-5 py-2 rounded-lg text-[12px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="px-6 py-2 rounded-lg text-[12px] font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-sm shadow-indigo-500/20"
                  >
                    Publish Session
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
            
            {upcomingSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <Calendar size={24} className="text-slate-400" />
                </div>
                <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">No upcoming sessions</h3>
                <p className="text-[13px] text-slate-500 max-w-sm mx-auto">
                  {isCreator ? 'Schedule a live session to engage with your students.' : 'Your creators haven\'t scheduled any upcoming sessions.'}
                </p>
              </div>
            ) : (
              upcomingSessions.map(session => (
                <div key={session.id} className="p-4 rounded-xl border border-slate-100 dark:border-[#2a2a2a] bg-slate-50/50 dark:bg-[#1C1C1C] hover:bg-slate-100/80 dark:hover:bg-[#222] transition-all flex flex-col md:flex-row md:items-center gap-4">
                  
                  {/* Date/Time Badge */}
                  <div className="shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">{new Date(session.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-[24px] font-black leading-none my-0.5">{new Date(session.date).getDate()}</span>
                    <span className="text-[10px] font-bold">{session.time}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">{session.title}</h3>
                      <span className="px-2 py-0.5 rounded border bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1">
                        <Globe size={10} /> {session.platform}
                      </span>
                      {isCreator && (
                        <span className="px-2 py-0.5 rounded border bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1 ml-2">
                          <Users size={10} /> 12 RSVPs
                        </span>
                      )}
                    </div>
                    {!isCreator && <p className="text-[12px] font-medium text-slate-500 mb-1">Hosted by <span className="text-slate-700 dark:text-slate-300">@{session.creatorName}</span></p>}
                    {session.description && <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2">{session.description}</p>}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-2 md:flex-col md:items-end">
                    {isCreator ? (
                      <>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                              <Share size={14} /> Share
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 font-sans">
                            <DropdownMenuItem onClick={() => toast.success('Sent to your Channel!')}>
                              Send to Channel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success('Sent to all Students!')}>
                              Send to Students
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success('Sent via Inbox!')}>
                              Send via Inbox
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyLink(session.meetingLink, session.passcode)}>
                              Copy Invite Link
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-sm shadow-indigo-500/20"
                      >
                        <Video size={16} /> Join Session
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* RECORDINGS TAB */}
        {activeTab === 'recordings' && (
          <div className="space-y-4 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-5 md:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-4">
              <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                <PlayCircle size={16} className="text-indigo-500" /> Past Session Recordings
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[
                { title: 'ICT Silver Bullet Scalping', date: 'May 12, 2026', duration: '1h 24m', attendees: 45 },
                { title: 'Prop Firm Challenge Strategy', date: 'May 5, 2026', duration: '2h 10m', attendees: 82 },
                { title: 'Weekly Outlook: Forex Pairs', date: 'Apr 28, 2026', duration: '45m', attendees: 33 },
                { title: 'Psychology of Trading', date: 'Apr 21, 2026', duration: '1h 10m', attendees: 61 },
              ].map((rec, i) => (
                <div key={i} className="flex flex-col p-4 rounded-xl border border-slate-100 dark:border-[#2a2a2a] bg-slate-50/50 dark:bg-[#1C1C1C] hover:border-indigo-200 transition-colors group cursor-pointer">
                  <div className="aspect-video bg-slate-200 dark:bg-white/5 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
                    <PlayCircle size={40} className="text-white opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-md z-10" />
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-white text-[10px] font-bold">
                      {rec.duration}
                    </div>
                  </div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{rec.title}</h3>
                  <div className="flex items-center justify-between mt-auto pt-2 text-[11px] font-medium text-slate-500">
                    <span>{rec.date}</span>
                    <span className="flex items-center gap-1"><Users size={12}/> {rec.attendees}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STREAM SETTINGS TAB */}
        {activeTab === 'stream' && isCreator && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-5 md:p-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
                  <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                    <Radio size={16} className="text-indigo-500" /> Broadcast Details (OBS / Streamlabs)
                  </h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={labelCls}>Stream Server URL (RTMP)</label>
                    <div className="flex items-center gap-2">
                      <input readOnly value="rtmp://live.tradifive.in/broadcast" className={`${inputCls} bg-slate-100 dark:bg-white/5 font-mono text-slate-600`} />
                      <button onClick={() => { navigator.clipboard.writeText('rtmp://live.tradifive.in/broadcast'); toast.success('Server URL copied'); }} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-800 transition-colors shrink-0">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Stream Key</label>
                    <div className="flex items-center gap-2">
                      <input type="password" readOnly value="live_sk_test_12398482485923" className={`${inputCls} bg-slate-100 dark:bg-white/5 font-mono text-slate-600`} />
                      <button onClick={() => { navigator.clipboard.writeText('live_sk_test_12398482485923'); toast.success('Stream Key copied'); }} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-800 transition-colors shrink-0">
                        <Copy size={16} />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1"><Info size={12}/> Keep this key secret. Anyone with this key can stream to your channel.</p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                    <button className="px-6 py-3 rounded-xl text-[14px] font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-sm shadow-indigo-500/20 w-full flex items-center justify-center gap-2">
                      <Radio size={16} /> Start Built-in Web Broadcaster
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card p-5 md:p-6">
                 <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-white/5 pb-3">
                    <Settings size={16} className="text-indigo-500" /> Setup Guide
                  </h2>
                  <div className="space-y-4 text-[13px] text-slate-600 dark:text-slate-400">
                    <p><strong>1.</strong> Open OBS Studio or Streamlabs.</p>
                    <p><strong>2.</strong> Go to Settings &gt; Stream.</p>
                    <p><strong>3.</strong> Select "Custom" service.</p>
                    <p><strong>4.</strong> Paste the Server URL and Stream Key provided on this page.</p>
                    <p><strong>5.</strong> Click "Start Streaming" in your software. Your community will automatically be notified.</p>
                  </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
