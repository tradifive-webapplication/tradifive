const fs = require('fs');
let content = fs.readFileSync('src/pages/UserProfilePublic.tsx', 'utf8');

// Replace all the navy/blue-dark hex colors with neutral dark equivalents
// Main card dark: #181D30, #121625 → #111318
// Deep bg dark: #0E121F → #0C0E14
// Border dark: #1E2638, #222B3F, #1A2238 → #1E2130

const replacements = [
  // Dark gradient tops (navy → neutral dark)
  ['dark:from-[#181D30]', 'dark:from-[#111318]'],
  ['dark:from-[#121625]', 'dark:from-[#111318]'],
  ['dark:from-[#1E2638]', 'dark:from-[#111318]'],
  // Dark gradient bottoms (navy → pure dark)
  ['dark:to-[#0E121F]', 'dark:to-[#0C0E14]'],
  // Borders (blue-navy → neutral dark)
  ['dark:border-[#222B3F]', 'dark:border-[#1E2130]'],
  ['dark:border-[#1A2238]', 'dark:border-[#1E2130]'],
  ['dark:border-[#1E2638]', 'dark:border-[#1E2130]'],
  ['dark:border-[#22', 'dark:border-[#1E'], // catch dark:border-[#22xxxx]
  // Solid bg (navy → neutral)
  ['dark:bg-[#181D30]', 'dark:bg-[#111318]'],
  ['dark:bg-[#0E121F]', 'dark:bg-[#0C0E14]'],
  ['dark:bg-[#121625]', 'dark:bg-[#111318]'],
  ['dark:bg-[#0B0D18]', 'dark:bg-[#0C0E14]'],
  // Avatar border
  ['dark:border-[#1A2238]', 'dark:border-[#1E2130]'],
];

// Apply all replacements
for (const [from, to] of replacements) {
  content = content.split(from).join(to);
}

// Also fix the Follow button: keep it as a clear non-blue CTA that reads well
// Current: dark:from-[#3B82F6] dark:to-[#1D4ED8] (blue follow)
// Keep the follow button blue - that's intentional for primary CTA
// But change "Requested" state from blue-tinted to neutral
content = content.replace(
  'dark:from-[#3B82F6] dark:to-[#1D4ED8] text-white border-[#93C5FD] dark:border-[#3B82F6]',
  'dark:from-[#60A5FA] dark:to-[#3B82F6] text-white border-[#93C5FD] dark:border-[#3B82F6]'
);

// Fix checkmark icon color that was using dark:text-[#0E121F] 
content = content.replace('dark:text-[#0E121F]', 'dark:text-[#0C0E14]');

fs.writeFileSync('src/pages/UserProfilePublic.tsx', content);
console.log('Dark theme neutralized.');

// Also fix Notifications.tsx
let notif = fs.readFileSync('src/pages/Notifications.tsx', 'utf8');
const notifReplacements = [
  ['dark:bg-[#121625]', 'dark:bg-[#111318]'],
  ['dark:bg-[#121625]/50', 'dark:bg-[#111318]/50'],
  ['dark:border-[#1E2538]', 'dark:border-[#1E2130]'],
  ['dark:border-[#222736]', 'dark:border-[#1E2130]'],
  ['dark:bg-[#151926]', 'dark:bg-[#111318]'],
  ['dark:bg-[#0A0C11]', 'dark:bg-[#0C0E14]'],
  ['dark:border-[#1A1D28]', 'dark:border-[#1E2130]'],
  ['dark:border-[#1A1D28]', 'dark:border-[#1E2130]'],
];

// Apply unread accent: remove blue from the unread dot/bar
// The colored accent dots are per notification type - keep them
// But remove the overall blue tints on timestamps and buttons
notif = notif.replace(
  `\`text-[11px] font-semibold \${!n.is_read ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}\``,
  `\`text-[11px] font-semibold \${!n.is_read ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}\``
);
notif = notif.replace(
  `: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20 active:scale-95'`,
  `: 'bg-slate-900 dark:bg-white hover:opacity-80 text-white dark:text-slate-900 active:scale-95'`
);
notif = notif.replace(
  'className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"',
  'className="p-1.5 bg-slate-900 dark:bg-white hover:opacity-80 text-white dark:text-slate-900 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"'
);
notif = notif.replace(
  'className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors"',
  'className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"'
);
notif = notif.replace(
  '<UserPlus size={16} className="text-blue-500" />',
  '<UserPlus size={16} className="text-slate-500 dark:text-slate-400" />'
);
notif = notif.replace(
  'className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-bold rounded-full transition-all">Accept</button>',
  'className="px-4 py-1.5 bg-slate-900 dark:bg-white hover:opacity-80 text-white dark:text-slate-900 text-[12px] font-bold rounded-full transition-all active:scale-95">Accept</button>'
);
notif = notif.replace('focus:ring-blue-500/20', 'focus:ring-slate-400/20');
notif = notif.replace(/hover:ring-blue-500\/40/g, 'hover:ring-slate-400/40');

for (const [from, to] of notifReplacements) {
  notif = notif.split(from).join(to);
}

fs.writeFileSync('src/pages/Notifications.tsx', notif);
console.log('Notifications theme fixed.');
