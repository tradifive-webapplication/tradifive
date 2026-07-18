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
   Danger as IconlyDanger,
   InfoCircle as IconlyInfoCircle,
   Setting as IconlySetting,
   Delete as IconlyDelete,
   ArrowUp as IconlyArrowUp,
   Upload as IconlyUpload
} from "react-iconly";`;

code = code.replace(originalImport, newImport);

// 2. Replace Info in dropdown (View channel info)
code = code.replace(
  `<Info size={18} className="text-slate-400 dark:text-slate-550 shrink-0" />`,
  `<IconlyInfoCircle set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-550 shrink-0" />`
);
code = code.replace(
  `<Info size={18} className="text-slate-400 dark:text-slate-550 shrink-0" />`,
  `<IconlyInfoCircle set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-550 shrink-0" />`
);
code = code.replace(
  `<Info size={18} className="text-slate-400 dark:text-slate-550 shrink-0" />`,
  `<IconlyInfoCircle set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-550 shrink-0" />`
);
code = code.replace(
  `<Info size={18} className="text-slate-400 dark:text-slate-550 shrink-0" />`,
  `<IconlyInfoCircle set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-550 shrink-0" />`
);
code = code.replace(
  `<Info size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />`,
  `<IconlyInfoCircle set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-500 shrink-0" />`
);

// 3. Replace SettingsIcon in dropdown (Manage Channel)
code = code.replace(
  `<SettingsIcon size={18} className="text-slate-400 dark:text-slate-550 shrink-0" />`,
  `<IconlySetting set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-550 shrink-0" />`
);
code = code.replace(
  `<SettingsIcon size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />`,
  `<IconlySetting set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-500 shrink-0" />`
);

// 4. Replace Folder in dropdown (Story Archive)
code = code.replace(
  `<Folder size={18} className="text-slate-400 dark:text-slate-550 shrink-0" />`,
  `<IconlyFolder set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-550 shrink-0" />`
);
code = code.replace(
  `<Folder size={18} className="text-slate-400 dark:text-slate-550 shrink-0" />`,
  `<IconlyFolder set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-550 shrink-0" />`
);
code = code.replace(
  `<Folder size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />`,
  `<IconlyFolder set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-500 shrink-0" />`
);

// 5. Replace CornerUpRight in dropdown (Boost Channel)
code = code.replace(
  `<CornerUpRight size={18} className="text-slate-400 dark:text-slate-550 shrink-0" />`,
  `<IconlyArrowUp set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-550 shrink-0 rotate-45" />`
);
code = code.replace(
  `<CornerUpRight size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />`,
  `<IconlyArrowUp set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-500 shrink-0 rotate-45" />`
);

// 6. Replace BarChart2 in dropdown (Create poll)
code = code.replace(
  `<BarChart2 size={18} className="text-slate-400 dark:text-slate-550 shrink-0" />`,
  `<IconlyGraph set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-550 shrink-0" />`
);
code = code.replace(
  `<BarChart2 size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />`,
  `<IconlyGraph set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-500 shrink-0" />`
);

// 7. Replace Share2 in dropdown (Export chat history)
code = code.replace(
  `<Share2 size={18} className="text-slate-400 dark:text-slate-550 shrink-0" />`,
  `<IconlyUpload set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-550 shrink-0" />`
);
code = code.replace(
  `<Share2 size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />`,
  `<IconlyUpload set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-500 shrink-0" />`
);

// 8. Replace Trash in dropdown (Clear history)
code = code.replace(
  `<Trash size={18} className="text-slate-400 dark:text-slate-550 shrink-0" />`,
  `<IconlyDelete set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-550 shrink-0" />`
);
code = code.replace(
  `<Trash size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />`,
  `<IconlyDelete set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-400 dark:text-slate-500 shrink-0" />`
);

// 9. Replace LogOut in dropdown (Leave channel)
code = code.replace(
  `<LogOut size={18} className="text-red-500 dark:text-red-400 shrink-0" />`,
  `<IconlyLogout set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-red-500 dark:text-red-400 shrink-0" />`
);

fs.writeFileSync(path, code);
console.log('Successfully swapped dropdown menu icons to react-iconly with large size and bold weight!');
