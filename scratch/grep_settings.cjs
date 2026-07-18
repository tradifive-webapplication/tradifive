const fs = require('fs');
const content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');
content.split('\n').forEach((line, idx) => {
    if (line.toLowerCase().includes('modal')) {
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
});
