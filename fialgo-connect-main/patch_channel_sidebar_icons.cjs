const fs = require('fs');

const path = 'src/pages/Channel.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update react-iconly imports at the top
const originalImport = `import {
   Discovery as IconlyDiscovery,
   Activity as IconlyActivity,
   Plus as IconlyPlus,
   Send as IconlySend,
   User as IconlyUser,
   VolumeUp as IconlyVolumeUp,
   VolumeOff as IconlyVolumeOff
} from "react-iconly";`;

const newImport = `import {
   Discovery as IconlyDiscovery,
   Activity as IconlyActivity,
   Plus as IconlyPlus,
   Send as IconlySend,
   User as IconlyUser,
   VolumeUp as IconlyVolumeUp,
   VolumeOff as IconlyVolumeOff,
   Scan as IconlyScan,
   TicketStar as IconlyTicketStar,
   Image as IconlyImage,
   Video as IconlyVideo,
   Folder as IconlyFolder,
   Paper as IconlyPaper,
   Graph as IconlyGraph,
   Voice as IconlyVoice,
   Bookmark as IconlyBookmark,
   Notification as IconlyNotification,
   Logout as IconlyLogout,
   Danger as IconlyDanger
} from "react-iconly";`;

code = code.replace(originalImport, newImport);

// 2. Replace QrCode inside details panel
code = code.replace(
  `<QrCode size={18} />`,
  `<IconlyScan set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 hover:text-slate-700 dark:hover:text-white" />`
);

// 3. Replace Gift count icon
code = code.replace(
  `<Gift size={18} className="text-slate-400 shrink-0" />`,
  `<IconlyTicketStar set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />`
);

// 4. Replace ImageIcon count icon
code = code.replace(
  `<ImageIcon size={18} className="text-slate-400 shrink-0" />`,
  `<IconlyImage set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />`
);

// 5. Replace Film count icon
code = code.replace(
  `<Film size={18} className="text-slate-400 shrink-0" />`,
  `<IconlyVideo set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />`
);

// 6. Replace Folder count icon
code = code.replace(
  `<Folder size={18} className="text-slate-400 shrink-0" />`,
  `<IconlyFolder set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />`
);

// 7. Replace Link2 count icon
code = code.replace(
  `<Link2 size={18} className="text-slate-400 shrink-0" />`,
  `<IconlyPaper set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />`
);

// 8. Replace BarChart2 count icon
code = code.replace(
  `<BarChart2 size={18} className="text-slate-400 shrink-0" />`,
  `<IconlyGraph set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />`
);

// 9. Replace Mic count icon
code = code.replace(
  `<Mic size={18} className="text-slate-400 shrink-0" />`,
  `<IconlyVoice set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />`
);

// 10. Replace Bookmark count icon
code = code.replace(
  `<Bookmark size={18} className="text-slate-400 shrink-0" />`,
  `<IconlyBookmark set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />`
);

// 11. Replace Megaphone count icon
code = code.replace(
  `<Megaphone size={18} className="text-slate-400 shrink-0" />`,
  `<IconlyNotification set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />`
);

// 12. Replace LogOut icon
code = code.replace(
  `<LogOut size={18} className="text-slate-400 shrink-0" />`,
  `<IconlyLogout set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />`
);

// 13. Replace AlertTriangle icon
code = code.replace(
  `<AlertTriangle size={18} className="text-rose-500 dark:text-rose-400 shrink-0" />`,
  `<IconlyDanger set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-rose-500 dark:text-rose-400 shrink-0" />`
);

// 14. Make Trash icon larger
code = code.replace(
  `<Trash size={18} className="text-rose-500 dark:text-rose-400 shrink-0" />`,
  `<Trash size={21} strokeWidth={2.2} className="text-rose-500 dark:text-rose-400 shrink-0" />`
);

fs.writeFileSync(path, code);
console.log('Successfully swapped Channel drawer sidebar icons to react-iconly icons with large sizes and bold weights!');
