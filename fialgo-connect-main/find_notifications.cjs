const fs = require('fs');
const file = 'src/pages/Settings.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('activeTab === "notifications"'));
console.log('Line index:', idx);
if (idx !== -1) {
    console.log(lines.slice(idx, idx+50).join('\n'));
}
