const fs = require('fs');
let code = fs.readFileSync('src/pages/MentorshipHub.tsx', 'utf8');

// Revert active tab color from black/white back to lighter purple
code = code.replace(
  "'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm shadow-slate-900/20 border border-slate-900 dark:border-white'",
  "'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm shadow-purple-500/10 border border-purple-100 dark:border-purple-500/20'"
);

// Revert Tier Filters back to lighter purple
code = code.replace(
  "'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm shadow-slate-900/20'",
  "'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30 shadow-sm shadow-purple-500/10'"
);

fs.writeFileSync('src/pages/MentorshipHub.tsx', code);
console.log('Reverted back to lighter purple!');
