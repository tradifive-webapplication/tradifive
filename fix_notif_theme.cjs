const fs = require('fs');
let content = fs.readFileSync('src/pages/Notifications.tsx', 'utf8');

// ── 1. Fix unread timestamp: remove blue tint, use slate ──
content = content.replace(
  '`text-[11px] font-semibold ${!n.is_read ? \'text-blue-500\' : \'text-slate-400 dark:text-slate-500\'}`',
  '`text-[11px] font-semibold ${!n.is_read ? \'text-slate-700 dark:text-slate-300\' : \'text-slate-400 dark:text-slate-500\'}`'
);

// ── 2. Fix Follow Back button: blue → slate-dark/white ──
content = content.replace(
  `: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20 active:scale-95'`,
  `: 'bg-slate-900 dark:bg-white hover:opacity-90 text-white dark:text-slate-900 active:scale-95'`
);

// ── 3. Fix reply send button: blue → slate-dark ──
content = content.replace(
  'className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"',
  'className="p-1.5 bg-slate-900 dark:bg-white hover:opacity-90 text-white dark:text-slate-900 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"'
);

// ── 4. Fix mark-read button hover: blue → slate ──
content = content.replace(
  'className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors"',
  'className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"'
);

// ── 5. Fix UserPlus icon in Follow Requests header: blue → slate ──
content = content.replace(
  '<UserPlus size={16} className="text-blue-500" />',
  '<UserPlus size={16} className="text-slate-500 dark:text-slate-400" />'
);

// ── 6. Fix Accept button: blue → slate-dark (consistent with app's CTA) ──
content = content.replace(
  'className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-bold rounded-full transition-all">Accept</button>',
  'className="px-4 py-1.5 bg-slate-900 dark:bg-white hover:opacity-80 text-white dark:text-slate-900 text-[12px] font-bold rounded-full transition-all active:scale-95">Accept</button>'
);

// ── 7. Fix search input focus ring: blue → neutral ──
content = content.replace(
  'focus:ring-blue-500/20',
  'focus:ring-slate-400/20'
);

// ── 8. Fix hover ring on avatar: blue → slate ──
content = content.replace(/hover:ring-blue-500\/40/g, 'hover:ring-slate-400/40');

fs.writeFileSync('src/pages/Notifications.tsx', content);
console.log('Done! Theme consistency applied.');
