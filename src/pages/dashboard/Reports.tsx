import React from 'react';
import { Document, Download, Filter, FileText, Calendar, BarChart2 } from 'lucide-react';

import { motion } from "framer-motion";

const GlassCard = ({ children, className = "", noPadding = false }: { children: React.ReactNode; className?: string; noPadding?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className={`bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] border-2 border-white rounded-[22px] ${noPadding ? '' : 'p-5'} shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] transition-all dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none ${className}`}
  >
    {children}
  </motion.div>
);


const Reports = () => {
  const reportFiles = [
    { name: 'Q3 2026 Performance Summary', date: 'Oct 01, 2026', type: 'PDF', size: '2.4 MB', category: 'Performance' },
    { name: 'September Trade Log', date: 'Oct 01, 2026', type: 'CSV', size: '1.1 MB', category: 'Trade Log' },
    { name: 'Risk Assessment Report', date: 'Sep 15, 2026', type: 'PDF', size: '3.8 MB', category: 'Risk' },
    { name: 'Tax Statement 2025', date: 'Apr 10, 2026', type: 'PDF', size: '5.2 MB', category: 'Tax' },
    { name: 'Monthly Statement (August)', date: 'Sep 01, 2026', type: 'PDF', size: '1.8 MB', category: 'Statement' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1 mb-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">Reports & Statements</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Download and analyze your trading history and statements.</p>
          </div>
          <button className="flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-sm font-bold transition-colors">
            <Download className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <GlassCard className="col-span-1 md:col-span-2 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Comprehensive Tax Report</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Generate ready-to-file tax documents for all jurisdictions.</p>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="col-span-1 flex flex-col items-center justify-center text-center">
           <Calendar className="w-6 h-6 text-indigo-500 mb-2" />
           <p className="text-sm font-bold text-slate-900 dark:text-white">Monthly</p>
           <p className="text-xs text-slate-500">Auto-generated</p>
        </GlassCard>

        <GlassCard className="col-span-1 flex flex-col items-center justify-center text-center">
           <BarChart2 className="w-6 h-6 text-emerald-500 mb-2" />
           <p className="text-sm font-bold text-slate-900 dark:text-white">Analytics</p>
           <p className="text-xs text-slate-500">Custom exports</p>
        </GlassCard>
      </div>

      <GlassCard noPadding>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Documents</h2>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-white/5 px-2.5 py-1.5 rounded-md">
            <Filter className="w-3.5 h-3.5" /> Filter
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#1E1E1E]/50 border-b border-slate-100 dark:border-white/5">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Document Name</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Format</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-white/5">
              {reportFiles.map((doc, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {doc.name}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">
                    {doc.type} <span className="text-slate-400 text-xs">({doc.size})</span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">{doc.date}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-bold transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-auto">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default Reports;
