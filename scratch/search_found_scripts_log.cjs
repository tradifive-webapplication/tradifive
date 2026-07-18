const fs = require('fs');
const content = fs.readFileSync('found_scripts.log', 'utf8');
console.log('found_scripts.log length:', content.length);

const lines = content.split('\n');
let count = 0;
lines.forEach((line, idx) => {
    if (line.includes('Settings.tsx') || line.includes('Settings') || line.includes('discord')) {
        console.log(`Line ${idx + 1}: ${line.trim().substring(0, 150)}`);
        count++;
        if (count > 20) return;
    }
});
if (count === 0) {
    console.log('No matches found.');
}
