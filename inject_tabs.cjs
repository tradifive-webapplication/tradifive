const fs = require('fs');
const gen = fs.readFileSync('tab_replace_general.cjs.txt', 'utf8');
const pro = fs.readFileSync('tab_replace_profiles.cjs.txt', 'utf8');
const not = fs.readFileSync('tab_replace_notifications.cjs.txt', 'utf8');
const app = fs.readFileSync('tab_replace_appearance.cjs.txt', 'utf8');

let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const regex = /<AnimatePresence mode="wait">[\s\S]*?<\/AnimatePresence>/;
const replacement = `<AnimatePresence mode="wait">\n${gen}\n${pro}\n${not}\n${app}\n</AnimatePresence>`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/pages/Settings.tsx', content, 'utf8');
console.log('Tabs successfully injected into Settings.tsx!');
