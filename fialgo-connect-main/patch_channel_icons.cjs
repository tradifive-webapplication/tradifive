const fs = require('fs');

const path = 'src/pages/Channel.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add react-iconly imports at the top
const reactIconlyImport = `import {
   Discovery as IconlyDiscovery,
   Activity as IconlyActivity,
   Plus as IconlyPlus,
   Send as IconlySend,
   User as IconlyUser,
   VolumeUp as IconlyVolumeUp,
   VolumeOff as IconlyVolumeOff
} from "react-iconly";\n`;

code = code.replace(
  'import React, { useState, useEffect, useRef } from "react";',
  'import React, { useState, useEffect, useRef } from "react";\n' + reactIconlyImport
);

// 2. Replace Plus next to search in list header
code = code.replace(
  `<Plus size={16} />`,
  `<IconlyPlus set="curved" primaryColor="currentColor" size={16} stroke="bold" strokeWidth={2} />`
);

// 3. Replace User icon in channel details button
code = code.replace(
  `<User size={18} />`,
  `<IconlyUser set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />`
);

// 4. Replace VolumeX and Volume2 icons in mute button
code = code.replace(
  `{isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}`,
  `{isMuted ? <IconlyVolumeOff set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} /> : <IconlyVolumeUp set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />}`
);

// 5. Replace SearchIcon inside search button in header to be standard bold Lucide Search
code = code.replace(
  `<SearchIcon size={16} strokeWidth={2.2} />`,
  `<Search size={16} strokeWidth={2.5} />`
);

// 6. Replace BarChart2 (chart/poll icon) in bottom input bar
code = code.replace(
  `<BarChart2 size={20} />`,
  `<IconlyActivity set="curved" primaryColor="currentColor" size={20} stroke="bold" strokeWidth={2} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />`
);

// 7. Replace Send icon in bottom input bar submit button
code = code.replace(
  `<Send size={18} className="ml-1" />`,
  `<IconlySend set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />`
);

// 8. Fix Search icon in sidebar
code = code.replace(
  `<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550" size={15} />`,
  `<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550" size={15} strokeWidth={2.5} />`
);

fs.writeFileSync(path, code);
console.log('Successfully swapped Channel page icons to react-iconly icons with proper stroke weights and sizes!');
