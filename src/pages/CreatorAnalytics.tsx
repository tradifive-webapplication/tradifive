import React, { useState, useRef, useEffect } from 'react';
import {
  TwoUsers as IconlyTwoUsers,
  User as IconlyUser,
  Swap as IconlySwap,
  Wallet as IconlyWallet,
  Buy as IconlyBuy,
  Activity as IconlyActivity,
  Show as IconlyShow
} from "react-iconly";

import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  TrendingUp, Users, Eye, Heart, MessageCircle, DollarSign, ArrowUpRight, ArrowDownRight, Crown, GraduationCap, Activity, Star,
  PlusCircle, CreditCard, Cpu, BookOpen, ChevronDown, X, ShoppingCart, UserCheck, Repeat
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MOCK_VIEWS_DATA: any[] = [];

const MOCK_FOLLOWERS_DATA: any[] = [];

const MOCK_REVENUE_DATA: any[] = [];

const MOCK_POSTS: any[] = [];

const MOCK_SALES_DATA: any[] = [];

const MOCK_SUBSCRIBER_TIERS: any[] = [];

const CREATE_HUB_ITEMS = [
  { icon: GraduationCap, label: 'Mentorship Hub', desc: 'Guide & track your student community', color: 'blue', href: '/creator/mentorship' },
  { icon: Cpu, label: 'My Store', desc: 'Manage your marketplace products', color: 'emerald', href: '/creator/store' },
  { icon: MessageCircle, label: 'Private Channels', desc: 'Create subscriber-only chat rooms', color: 'purple', href: '/channel' },
  { icon: PlusCircle, label: 'Live Sessions', desc: 'Schedule Zoom or Google Meet classes', color: 'rose', href: '/creator/live' },
];

const colorStyles: any = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', hover: 'hover:border-blue-500/40', border: 'border-blue-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', hover: 'hover:border-purple-500/40', border: 'border-purple-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', hover: 'hover:border-emerald-500/40', border: 'border-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', hover: 'hover:border-amber-500/40', border: 'border-amber-500/20' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', hover: 'hover:border-rose-500/40', border: 'border-rose-500/20' },
};

const WrappedGraduationCap = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <GraduationCap size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] border-2 border-white dark:border-[#262626] rounded-[22px] p-5 shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none premium-flat-card transition-all ${className}`}
  >
    {children}
  </motion.div>
);

const statIconColorMap: any = {
  purple: 'text-purple-500 dark:text-purple-400 shrink-0',
  emerald: 'text-emerald-500 dark:text-emerald-400 shrink-0',
  blue: 'text-blue-500 dark:text-blue-400 shrink-0',
  pink: 'text-pink-500 dark:text-pink-400 shrink-0',
  amber: 'text-amber-500 dark:text-amber-400 shrink-0',
};

const statColorMap: any = {
  purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  pink: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
  amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
};

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <GlassCard className="!p-3.5 group">
    <div className="flex items-center justify-between mb-2">
      <Icon set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className={statIconColorMap[color]} />
      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
        <ArrowUpRight size={10} />
        {change}%
      </div>
    </div>
    <div>
      <h3 className="text-[10px] font-bold text-slate-500 dark:text-[#949ba4] uppercase tracking-wider truncate mb-0.5">{title}</h3>
      <p className="text-[18px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{value}</p>
    </div>
  </GlassCard>
);

export default function CreatorAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <DashboardLayout breadcrumbs={[{ label: "Creator Dashboard", path: "/creator/analytics" }]} noPadding={true}>
      <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto space-y-6 pb-24 font-sans">
        


        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
          <StatCard title="Total Followers" value="12,156" change="+8.2" icon={IconlyTwoUsers} color="purple" />
          <StatCard title="Active Subs" value="177" change="+12.5" icon={IconlyUser} color="blue" />
          <StatCard title="Monthly MRR" value="$3,750" change="+15.4" icon={IconlySwap} color="emerald" />
          <StatCard title="Total Revenue" value="$45,450" change="+12.4" icon={IconlyWallet} color="emerald" />
          <StatCard title="Store Sales" value="342" change="+24.1" icon={IconlyBuy} color="amber" />
          <StatCard title="Active Students" value="84" change="+5.1" icon={WrappedGraduationCap} color="blue" />
          <StatCard title="Engagement Rate" value="8.4%" change="+2.1" icon={IconlyActivity} color="pink" />
          <StatCard title="Profile Views" value="124.5k" change="+18.2" icon={IconlyShow} color="purple" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Revenue Earnings Chart */}
          <GlassCard className="!p-5 md:!p-6">
            <div className="mb-5 flex items-center justify-between">
               <div>
                 <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                    <DollarSign size={16} className="text-emerald-500" /> Revenue Earnings
                 </h2>
                 <p className="text-[12px] text-slate-500 dark:text-[#949ba4] mt-1 font-medium">Earnings from tips, premium posts, and VIP channels</p>
               </div>
               <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  +$120 this week
               </span>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.15} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#949ba4', fontSize: 11, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#949ba4', fontSize: 11, fontWeight: 600}} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontSize: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                    formatter={(value: any) => [`$${value}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Follower Growth Chart */}
          <GlassCard className="!p-5 md:!p-6">
            <div className="mb-5 flex items-center justify-between">
               <div>
                 <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                    <TrendingUp size={16} className="text-purple-500" /> Audience Growth
                 </h2>
                 <p className="text-[12px] text-slate-500 dark:text-[#949ba4] mt-1 font-medium">New followers and students gained over time</p>
               </div>
               <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                  +41 new followers
               </span>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_FOLLOWERS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                     <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.15} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#949ba4', fontSize: 11, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#949ba4', fontSize: 11, fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '12px', fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="followers" stroke="#a855f7" strokeWidth={3} fill="url(#colorFollowers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

        </div>

        {/* Bottom Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Performing Content */}
          <div className="lg:col-span-2">
            <GlassCard className="!p-5 md:!p-6 h-full">
              <div className="mb-5 flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                <div>
                  <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                     <Star size={16} className="text-amber-500 fill-amber-500" /> Top Performing Content
                  </h2>
                  <p className="text-[12px] text-slate-500 dark:text-[#949ba4] mt-1 font-medium">Your most engaging and profitable posts this month</p>
                </div>
                <button className="text-[12px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-3.5 py-1.5 rounded-xl transition-colors border border-indigo-100 dark:border-indigo-500/20">
                   View All
                </button>
              </div>
              
              <div className="space-y-2.5">
                {MOCK_POSTS.map((post, i) => (
                  <div key={post.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-[#2a2a2a] bg-slate-50/50 dark:bg-[#1C1C1C] hover:bg-slate-100/80 dark:hover:bg-[#222] transition-all group cursor-pointer">
                    <div className="flex items-center gap-3.5 mb-3 sm:mb-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-extrabold ${i === 0 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/30' : i === 1 ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300/60 dark:border-slate-600/30' : i === 2 ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/30' : 'bg-slate-100 dark:bg-[#222] text-slate-500 dark:text-[#949ba4] border border-slate-200/60 dark:border-white/10'}`}>
                        #{i + 1}
                      </div>
                      <div>
                         <h3 className="text-[14px] font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-500 transition-colors">{post.title}</h3>
                         <p className="text-[11px] text-slate-500 dark:text-[#949ba4] mt-0.5 font-medium">Published 2 days ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-5 text-[12px] font-bold text-slate-600 dark:text-[#949ba4]">
                      <div className="flex flex-col items-end">
                        <span className="flex items-center gap-1.5"><Eye size={13} className="text-slate-400" /> {post.views}</span>
                        <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">Views</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="flex items-center gap-1.5"><Heart size={13} className="text-rose-400" /> {post.likes}</span>
                        <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">Likes</span>
                      </div>
                      <div className="flex flex-col items-end bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                         <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><DollarSign size={13} /> {post.tips}</span>
                         <span className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70 font-medium uppercase tracking-wide">Tips</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Monetization & Sales */}
          <div className="space-y-6">
            <GlassCard className="!p-5 md:!p-6">
               <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider mb-4">
                  <Crown size={16} className="text-purple-500" /> Subscriber Tiers
               </h2>
               <div className="space-y-4">
                 {MOCK_SUBSCRIBER_TIERS.map((tier, i) => (
                   <div key={i} className="space-y-2">
                     <div className="flex justify-between items-center text-[12px] font-bold">
                       <span className="text-slate-700 dark:text-slate-300">{tier.name}</span>
                       <span className="text-slate-900 dark:text-white">{tier.count} subs (${tier.revenue})</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 dark:bg-[#222] rounded-full overflow-hidden">
                       <div className={`h-full rounded-full ${tier.color}`} style={{ width: `${(tier.count / 177) * 100}%` }}></div>
                     </div>
                   </div>
                 ))}
               </div>
            </GlassCard>

            <GlassCard className="!p-5 md:!p-6">
               <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider mb-4">
                  <ShoppingCart size={16} className="text-emerald-500" /> Recent Store Sales
               </h2>
               <div className="space-y-3">
                 {MOCK_SALES_DATA.map((sale) => (
                   <div key={sale.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-[#2a2a2a] bg-slate-50/50 dark:bg-[#1C1C1C]">
                     <div>
                       <p className="text-[12px] font-bold text-slate-900 dark:text-white truncate max-w-[140px]">{sale.item}</p>
                       <p className="text-[10px] text-slate-500 dark:text-[#949ba4] font-medium">{sale.buyer} • {sale.time}</p>
                     </div>
                     <div className="text-[13px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                       +${sale.amount}
                     </div>
                   </div>
                 ))}
               </div>
            </GlassCard>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
