const fs = require('fs');

const path = 'src/pages/Channel.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Target details button iconly user size
code = code.replace(
  `size={17} stroke="bold" strokeWidth={2} />\n              </button>`,
  `size={20} stroke="bold" strokeWidth={2} />\n              </button>`
);

// 2. Mute button iconly volume sizes
code = code.replace(
  `{isMuted ? <IconlyVolumeOff set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} /> : <IconlyVolumeUp set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />}`,
  `{isMuted ? <IconlyVolumeOff set="curved" primaryColor="currentColor" size={20} stroke="bold" strokeWidth={2} /> : <IconlyVolumeUp set="curved" primaryColor="currentColor" size={20} stroke="bold" strokeWidth={2} />}`
);

// 3. Search button in header size
code = code.replace(
  `<Search size={16} strokeWidth={2.5} />`,
  `<Search size={19} strokeWidth={2.5} />`
);

// 4. More vertical dropdown button in header size
code = code.replace(
  `<MoreVertical size={18} />`,
  `<MoreVertical size={21} />`
);

// 5. Sidebar search plus button size
code = code.replace(
  `<IconlyPlus set="curved" primaryColor="currentColor" size={16} stroke="bold" strokeWidth={2} />`,
  `<IconlyPlus set="curved" primaryColor="currentColor" size={20} stroke="bold" strokeWidth={2} />`
);

// 6. Bottom poll activity button size
code = code.replace(
  `size={20} stroke="bold" strokeWidth={2} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />`,
  `size={22} stroke="bold" strokeWidth={2} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />`
);

// 7. Bottom submit send button size
code = code.replace(
  `<IconlySend set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />`,
  `<IconlySend set="curved" primaryColor="currentColor" size={20} stroke="bold" strokeWidth={2} className="ml-[1px]" />`
);

fs.writeFileSync(path, code);
console.log('Successfully resized channel icons to be larger and more prominent!');
