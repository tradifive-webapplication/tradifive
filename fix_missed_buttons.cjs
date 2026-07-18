const fs = require('fs');
let code = fs.readFileSync('src/pages/MentorshipHub.tsx', 'utf8');

// 1. Fix TABS button (line 779)
// className={`flex items-center gap-2 px-4 py-2.5 rounded-xl
code = code.replace(
  'className={`flex items-center gap-2 px-4 py-2.5 rounded-xl',
  'className={`flex items-center gap-2 px-5 py-2.5 rounded-full'
);

// 2. Fix Live Sessions button
// It starts with className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl ... bg-indigo-50 ...
code = code.replace(
  /className="flex items-center gap-1\.5 px-4 py-2\.5 rounded-xl text-\[12px\] font-bold bg-indigo-50 dark:bg-indigo-500\/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500\/20 hover:bg-indigo-100 dark:hover:bg-indigo-500\/20 transition-all shrink-0"/,
  'className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[12px] font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all shrink-0"'
);

fs.writeFileSync('src/pages/MentorshipHub.tsx', code);
console.log('Fixed tabs and live sessions button!');
