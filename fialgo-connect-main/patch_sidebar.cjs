const fs = require('fs');
const path = './src/components/AppSidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

// The class string we want to replace for Status Flyout
content = content.replace(
  /className="absolute left-full top-0 ml-3 w-\[260px\] bg-white dark:bg-\[#1E293B\] border border-slate-200\/80 dark:border-slate-800 rounded-\[16px\] p-2\.5 shadow-\[0_12px_40px_rgba\(0,0,0,0\.12\),0_1px_4px_rgba\(0,0,0,0\.02\)\] z-\[100\] animate-slideInRight space-y-0\.5 select-none text-left font-sans before:absolute before:right-full before:top-0 before:bottom-0 before:w-4 before:bg-transparent"/g,
  'className="w-full mt-1.5 mb-1 bg-slate-50 dark:bg-[#151b2b] border border-slate-200/60 dark:border-slate-800/80 rounded-[14px] p-2 z-[100] animate-slideDownAccordion space-y-0.5 select-none text-left font-sans overflow-hidden shadow-inner"'
);

// The class string we want to replace for Switch Account Flyout
content = content.replace(
  /className="absolute left-full top-0 ml-3 w-\[310px\] bg-white dark:bg-\[#1E293B\] border border-slate-200\/80 dark:border-slate-800 rounded-\[18px\] p-3\.5 shadow-\[0_12px_40px_rgba\(0,0,0,0\.12\),0_1px_4px_rgba\(0,0,0,0\.02\)\] z-\[100\] animate-slideInRight select-none text-left font-sans before:absolute before:right-full before:top-0 before:bottom-0 before:w-4 before:bg-transparent"/g,
  'className="w-full mt-1.5 mb-1 bg-slate-50 dark:bg-[#151b2b] border border-slate-200/60 dark:border-slate-800/80 rounded-[14px] p-3 z-[100] animate-slideDownAccordion select-none text-left font-sans overflow-hidden shadow-inner"'
);

// Switch account chevron
content = content.replace(
  /<ChevronRight size=\{14\} className={`text-slate-400 dark:text-slate-550 transition-all duration-200 shrink-0 \${isSwitchOpen \? 'translate-x-0\.5 text-slate-700 dark:text-slate-300 font-sans' : ''}`} \/>/g,
  '<ChevronDown size={14} className={`text-slate-400 dark:text-slate-550 transition-transform duration-300 shrink-0 ${isSwitchOpen ? \'rotate-180 text-slate-700 dark:text-slate-300 font-sans\' : \'\'}`} />'
);

// Status chevron
content = content.replace(
  /<ChevronRight size=\{14\} className={`text-slate-400 dark:text-slate-505 transition-all duration-200 shrink-0 \${isStatusOpen \? 'translate-x-0\.5 text-slate-700 dark:text-slate-300' : ''}`} \/>/g,
  '<ChevronDown size={14} className={`text-slate-400 dark:text-slate-505 transition-transform duration-300 shrink-0 ${isStatusOpen ? \'rotate-180 text-slate-700 dark:text-slate-300\' : \'\'}`} />'
);

// Font sizes for these specific dropdown sections (status and switch accounts)
// Instead of a global replace, I'll just change text-[13px] and text-[13.5px] slightly generally since the sidebar uses them.
content = content.replace(/text-\[13\.5px\]/g, 'text-[14px]');
content = content.replace(/text-\[13px\]/g, 'text-[13.5px]');

// Insert Keyframes
if (!content.includes('slideDownAccordion')) {
  content = content.replace(
    '@keyframes slideInRight {',
    `@keyframes slideDownAccordion {
             from {
               opacity: 0;
               transform: translateY(-8px) scaleY(0.95);
               transform-origin: top;
             }
             to {
               opacity: 1;
               transform: translateY(0) scaleY(1);
               transform-origin: top;
             }
           }
           .animate-slideDownAccordion {
             animation: slideDownAccordion 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
           }
           @keyframes slideInRight {`
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log("AppSidebar.tsx patched successfully!");
