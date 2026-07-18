const fs = require('fs');

['src/pages/UserProfilePublic.tsx', 'src/pages/Notifications.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Final stragglers
  content = content.split('dark:border-[#1E2538]').join('dark:border-[#1E2130]');
  content = content.split('dark:bg-[#1E2335]').join('dark:bg-[#111318]');
  content = content.split('dark:from-[#1E2335]').join('dark:from-[#111318]');
  content = content.split('dark:to-[#1E2335]').join('dark:to-[#0C0E14]');

  fs.writeFileSync(file, content);
  console.log('Cleaned: ' + file);
});
