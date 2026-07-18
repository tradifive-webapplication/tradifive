const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const simpleBox = 'p-6 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-slate-800 shadow-sm';
const borderlessBox = 'p-6 rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-sm';

if (content.includes(simpleBox)) {
    content = content.split(simpleBox).join(borderlessBox);
    console.log('Removed borders from all simple boxes.');
    fs.writeFileSync(file, content, 'utf8');
} else {
    console.log('Could not find the simple box class string.');
}
