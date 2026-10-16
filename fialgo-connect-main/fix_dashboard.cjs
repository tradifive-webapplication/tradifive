const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Add Tooltip and Iconly imports
if (!code.includes('TooltipProvider')) {
  code = code.replace(
    'import DashboardLayout',
    'import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";\nimport { InfoCircle as IconlyInfoCircle, Activity as IconlyActivity, Setting as IconlySetting, Discovery as IconlyDiscovery, TicketStar as IconlyTicketStar, Calendar as IconlyCalendar, Message as IconlyMessage, Danger as IconlyDanger, Graph as IconlyGraph, ShieldDone as IconlyShieldDone, Document as IconlyDocument } from "react-iconly";\nimport DashboardLayout'
  );
}

// 2. Wrap Dashboard content in TooltipProvider
if (!code.includes('<TooltipProvider>')) {
  code = code.replace(
    /<DashboardLayout[^>]*>/,
    '$&\n      <TooltipProvider>'
  );
  code = code.replace(
    /<\/DashboardLayout>/,
    '      </TooltipProvider>\n    $&'
  );
}

// 3. Fix the top 4 cards
// Replace items-center with items-start in the header flex
code = code.replace(/<div className="flex items-center justify-between">\s*<p className="text-\[10px\][^>]*>Account P&L<\/p>/g, '<div className="flex items-start justify-between">\n                  <p className="text-[10px] font-bold text-slate-400 dark:text-white/60 uppercase tracking-widest mt-1">Account P&L</p>');
code = code.replace(/<div className="flex items-center justify-between">\s*<p className="text-\[10px\][^>]*>Discipline Score<\/p>/g, '<div className="flex items-start justify-between">\n                  <p className="text-[10px] font-bold text-slate-400 dark:text-white/60 uppercase tracking-widest mt-1">Discipline Score</p>');
code = code.replace(/<div className="flex items-center justify-between">\s*<p className="text-\[10px\][^>]*>Win Rate \(7D\)<\/p>/g, '<div className="flex items-start justify-between">\n                  <p className="text-[10px] font-bold text-slate-400 dark:text-white/60 uppercase tracking-widest mt-1">Win Rate (7D)</p>');
code = code.replace(/<div className="flex items-center justify-between">\s*<p className="text-\[10px\][^>]*>Daily XP Earned<\/p>/g, '<div className="flex items-start justify-between">\n                  <p className="text-[10px] font-bold text-slate-400 dark:text-white/60 uppercase tracking-widest mt-1">Daily XP Earned</p>');

// Replace <Info size={14} ... /> with a Tooltip wrapping IconlyInfoCircle
const tooltipInfo = `<Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <div><IconlyInfoCircle set="curved" primaryColor="currentColor" size={15} className="text-slate-350 dark:text-white/40 cursor-help transition-colors hover:text-slate-500 dark:hover:text-white/70" /></div>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-xs">Metric details and information</p></TooltipContent>
                    </Tooltip>`;

code = code.replace(/<Info size=\{14\} className="text-slate-350 dark:text-white\/40" \/>/g, tooltipInfo);

// 4. Reduce padding in all major cards to make them smaller
code = code.replace(/className="([^"]*)p-6([^"]*)"/g, 'className="$1p-5$2"');
code = code.replace(/className="([^"]*)p-7([^"]*)"/g, 'className="$1p-5$2"');
code = code.replace(/h-\[120px\] px-5 py-4/g, 'h-[110px] px-4 py-3');
code = code.replace(/gap-6/g, 'gap-4'); // Make grids tighter
code = code.replace(/space-y-6/g, 'space-y-4'); 
code = code.replace(/mb-6/g, 'mb-4');

// 5. Swap some prominent Lucide icons with Iconly
code = code.replace(/<Activity/g, '<IconlyActivity set="curved" primaryColor="currentColor"');
code = code.replace(/<ShieldAlert/g, '<IconlyDanger set="curved" primaryColor="currentColor"');
code = code.replace(/<ShieldCheck/g, '<IconlyShieldDone set="curved" primaryColor="currentColor"');
code = code.replace(/<TrendingUp/g, '<IconlyGraph set="curved" primaryColor="currentColor"');
code = code.replace(/<BrainCircuit/g, '<IconlyDiscovery set="curved" primaryColor="currentColor"');

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Updated Dashboard.tsx');
