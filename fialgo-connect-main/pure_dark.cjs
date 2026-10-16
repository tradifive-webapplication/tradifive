const fs = require('fs');

function neutralizeFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Remove all gradients and from/to colors in dark mode
  content = content.replace(/bg-gradient-to-b\s+from-\[[^\]]+\]\s+to-\[[^\]]+\]\s+dark:from-\[[^\]]+\]\s+dark:to-\[[^\]]+\]/g, 
    'bg-white dark:bg-[#111111]');
  content = content.replace(/bg-gradient-to-b\s+from-\[[^\]]+\]\/[0-9]+\s+to-\[[^\]]+\]\s+dark:from-\[[^\]]+\]\/[0-9]+\s+dark:to-\[[^\]]+\]/g, 
    'bg-white dark:bg-[#141414]');
  
  // Also catch generic dark:from and dark:to if they weren't caught
  content = content.replace(/dark:from-\[#[0-9A-Fa-f]+\](?:\/[0-9]+)?/g, '');
  content = content.replace(/dark:to-\[#[0-9A-Fa-f]+\](?:\/[0-9]+)?/g, '');

  // But KEEP the blue follow buttons, which might be dark:from-[#3B82F6] etc.
  // Wait, I just globally removed them. Let me restore the Follow button gradients.
  // Actually, it's safer to just explicitly replace the specific hexes.
  
  let restored = fs.readFileSync(file, 'utf8');
  
  // Specific hexes to neutral:
  const replaces = [
    // Background gradients to solid neutral dark
    ['bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:from-[#252528] dark:to-[#1A1A1C]', 'bg-white dark:bg-[#111111]'],
    ['bg-gradient-to-b from-[#FAFBFD] to-[#FFFFFF] dark:from-[#141414] dark:to-[#1A1A1C]', 'bg-white dark:bg-[#111111]'],
    ['bg-gradient-to-b from-[#F4F4F4]/70 to-[#FFFFFF] dark:from-[#252528]/65 dark:to-[#1A1A1C]', 'bg-white dark:bg-[#141414]'],
    ['dark:bg-[#1A1A1C]', 'dark:bg-[#111111]'],
    ['dark:bg-[#141414]', 'dark:bg-[#1A1A1A]'],
    ['dark:bg-[#1C2031]', 'dark:bg-[#111111]'],
    ['dark:bg-[#1E2335]', 'dark:bg-[#111111]'],
    ['dark:bg-[#1E1E1E]', 'dark:bg-[#111111]'],

    // Borders to pure neutral
    ['dark:border-[#1E2130]', 'dark:border-[#222]'],
    ['dark:border-[#1E2538]', 'dark:border-[#222]'],
    ['dark:border-[#13151C]', 'dark:border-[#222]'],
    ['dark:border-[#1A1A1A]', 'dark:border-[#222]'],
    ['dark:border-[#222B3F]', 'dark:border-[#222]'],
    ['dark:border-[#1A2238]', 'dark:border-[#222]'],
    ['dark:border-[#1E2638]', 'dark:border-[#222]'],
    
    // Slates (blue-gray) to Neutrals (true gray) or pure hex
    ['dark:border-slate-800', 'dark:border-[#222]'],
    ['dark:border-slate-700', 'dark:border-[#333]'],
    ['dark:bg-slate-800', 'dark:bg-[#1A1A1A]'],
    ['dark:bg-slate-900', 'dark:bg-[#111111]'],
    ['dark:text-slate-400', 'dark:text-[#999]'],
    ['dark:text-slate-300', 'dark:text-[#CCC]'],
    ['dark:text-slate-200', 'dark:text-[#EEE]'],
    ['dark:text-slate-500', 'dark:text-[#777]'],
    ['dark:text-slate-600', 'dark:text-[#555]']
  ];

  replaces.forEach(([from, to]) => {
    restored = restored.split(from).join(to);
  });

  // Remove ring-blue from the Calendar current day
  restored = restored.replace('ring-blue-500/50', 'ring-[#444]');
  restored = restored.replace('hover:border-blue-500/20', 'hover:border-[#444]');

  fs.writeFileSync(file, restored);
  console.log('Neutralized: ' + file);
}

['src/pages/Profile.tsx', 'src/pages/UserProfilePublic.tsx', 'src/pages/Notifications.tsx'].forEach(neutralizeFile);

