const fs = require('fs');
const path = './src/components/AppSidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

// The class string we want to revert for Status Flyout
const newStatusContainer = 'className="w-full mt-1.5 mb-1 bg-slate-50 dark:bg-[#151b2b] border border-slate-200/60 dark:border-slate-800/80 rounded-[14px] p-2 z-[100] animate-slideDownAccordion space-y-0.5 select-none text-left font-sans overflow-hidden shadow-inner"';
const oldStatusContainer = 'className="absolute left-full top-0 ml-3 w-[260px] bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-[16px] p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.02)] z-[100] animate-slideInRight space-y-0.5 select-none text-left font-sans before:absolute before:right-full before:top-0 before:bottom-0 before:w-4 before:bg-transparent"';
content = content.replace(newStatusContainer, oldStatusContainer);

// The class string we want to revert for Switch Account Flyout
const newSwitchContainer = 'className="w-full mt-1.5 mb-1 bg-slate-50 dark:bg-[#151b2b] border border-slate-200/60 dark:border-slate-800/80 rounded-[14px] p-3 z-[100] animate-slideDownAccordion select-none text-left font-sans overflow-hidden shadow-inner"';
const oldSwitchContainer = 'className="absolute left-full top-0 ml-3 w-[310px] bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-[18px] p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.02)] z-[100] animate-slideInRight select-none text-left font-sans before:absolute before:right-full before:top-0 before:bottom-0 before:w-4 before:bg-transparent"';
content = content.replace(newSwitchContainer, oldSwitchContainer);

// Revert Status chevron
const newStatusChevron = '<ChevronDown size={14} className={`text-slate-400 dark:text-slate-505 transition-transform duration-300 shrink-0 ${isStatusOpen ? \'rotate-180 text-slate-700 dark:text-slate-300\' : \'\'}`} />';
const oldStatusChevron = '<ChevronRight size={14} className={`text-slate-400 dark:text-slate-505 transition-all duration-200 shrink-0 ${isStatusOpen ? \'translate-x-0.5 text-slate-700 dark:text-slate-300\' : \'\'}`} />';
content = content.replace(newStatusChevron, oldStatusChevron);

// Revert Switch account chevron
const newSwitchChevron = '<ChevronDown size={14} className={`text-slate-400 dark:text-slate-550 transition-transform duration-300 shrink-0 ${isSwitchOpen ? \'rotate-180 text-slate-700 dark:text-slate-300 font-sans\' : \'\'}`} />';
const oldSwitchChevron = '<ChevronRight size={14} className={`text-slate-400 dark:text-slate-550 transition-all duration-200 shrink-0 ${isSwitchOpen ? \'translate-x-0.5 text-slate-700 dark:text-slate-300 font-sans\' : \'\'}`} />';
content = content.replace(newSwitchChevron, oldSwitchChevron);

// Note: keeping text-[14px] font sizing improvements. 
// Note: no need to remove slideDownAccordion keyframes from inline css, it doesn't hurt.

fs.writeFileSync(path, content, 'utf8');
console.log("AppSidebar.tsx reverted successfully!");
