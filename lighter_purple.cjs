const fs = require('fs');
let code = fs.readFileSync('src/pages/MentorshipHub.tsx', 'utf8');

// Change active tab color from bg-purple-500 text-white to the lighter purple theme
code = code.replace(
  "'bg-purple-500 text-white shadow-sm shadow-purple-500/20'",
  "'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm shadow-purple-500/10 border border-purple-100 dark:border-purple-500/20'"
);

// We should also change the Tier Filters to match this lighter purple style if they are active, so they all match.
// In StudentsTab:
code = code.replace(
  "'bg-purple-500 text-white border-purple-500 shadow-sm shadow-purple-500/20'",
  "'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30 shadow-sm shadow-purple-500/10'"
);

fs.writeFileSync('src/pages/MentorshipHub.tsx', code);
console.log('Lighter purple applied!');
