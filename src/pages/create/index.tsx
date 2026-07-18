import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { GraduationCap, CreditCard, Cpu, LineChart, BookOpen, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Create() {
    return (
        <DashboardLayout breadcrumbs={[{ label: "Create Offering", path: "/create" }]} noPadding={false}>
            <div className="w-full max-w-5xl mx-auto space-y-8 pb-32">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create & Monetize</h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">Launch new products, services, and content for your audience. Everything you create here will be published to the Discover Marketplace.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button onClick={() => toast.info('Mentorship programs are coming soon!')} className="flex flex-col p-6 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-white dark:bg-[#1E1E1E] hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all group text-left h-full relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-400 group-hover:text-blue-500 transition-colors">
                            <PlusCircle size={24} />
                        </div>
                        <div className="p-4 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit mb-4 group-hover:scale-110 transition-transform"><GraduationCap size={28} /></div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">Sell Mentorship</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Offer 1-on-1 coaching, live Q&A sessions, and personalized trading guidance to your most dedicated students.</p>
                    </button>

                    <button onClick={() => toast.info('Paid Subscriptions are coming soon!')} className="flex flex-col p-6 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-white dark:bg-[#1E1E1E] hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl transition-all group text-left h-full relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-400 group-hover:text-purple-500 transition-colors">
                            <PlusCircle size={24} />
                        </div>
                        <div className="p-4 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit mb-4 group-hover:scale-110 transition-transform"><CreditCard size={28} /></div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400">Paid Subscriptions</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Create recurring revenue with tiered monthly subscriptions for your premium analysis and newsletters.</p>
                    </button>

                    <button onClick={() => toast.info('Selling Bots is coming soon!')} className="flex flex-col p-6 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-white dark:bg-[#1E1E1E] hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl transition-all group text-left h-full relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-400 group-hover:text-emerald-500 transition-colors">
                            <PlusCircle size={24} />
                        </div>
                        <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit mb-4 group-hover:scale-110 transition-transform"><Cpu size={28} /></div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Sell Bots</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Package and sell your automated trading algorithms, expert advisors, and custom scripts.</p>
                    </button>

                    <button onClick={() => toast.info('Selling Indicators is coming soon!')} className="flex flex-col p-6 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-white dark:bg-[#1E1E1E] hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-xl transition-all group text-left h-full relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-400 group-hover:text-amber-500 transition-colors">
                            <PlusCircle size={24} />
                        </div>
                        <div className="p-4 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit mb-4 group-hover:scale-110 transition-transform"><LineChart size={28} /></div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400">Sell Indicators</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Monetize your custom TradingView Pine Script indicators and MT4/MT5 technical overlays.</p>
                    </button>

                    <button onClick={() => toast.info('Paid Courses are coming soon!')} className="flex flex-col p-6 rounded-2xl border-2 border-slate-100 dark:border-white/5 bg-white dark:bg-[#1E1E1E] hover:border-rose-500 dark:hover:border-rose-500 hover:shadow-xl transition-all group text-left h-full lg:col-span-2 relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-400 group-hover:text-rose-500 transition-colors">
                            <PlusCircle size={24} />
                        </div>
                        <div className="p-4 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 w-fit mb-4 group-hover:scale-110 transition-transform"><BookOpen size={28} /></div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400">Paid Courses</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Build comprehensive video courses. Teach your strategy from A to Z and offer certifications to your community members upon completion.</p>
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
