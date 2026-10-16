const fs = require('fs');

const content = fs.readFileSync('found_scripts.log', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('isEditModalOpen') || line.includes('showSmsModal')) {
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
});
