const fs = require('fs');
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// Fix the two remaining blue-dark backgrounds
content = content.split('dark:bg-[#1C2031]').join('dark:bg-[#1A1A1C]');
content = content.split('dark:bg-[#1E2335]').join('dark:bg-[#1A1A1C]');

// Fix the inconsistent border color
content = content.split('dark:border-[#1A1A1C]').join('dark:border-[#1A1A1A]');

fs.writeFileSync('src/pages/Profile.tsx', content);
console.log('Profile.tsx fixed!');

// Verify
const result = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
const remaining = new Set();
(result.match(/dark:(?:bg|from|to|border)-\[#[0-9A-Fa-f]+\]/g) || []).forEach(c => remaining.add(c));
console.log('Remaining dark colors:');
Array.from(remaining).sort().forEach(c => console.log('  ' + c));
