const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const lines = code.split('\n');

for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].includes('return (') && lines[i+1].trim() === '' && lines[i+2].includes('return (')) {
        lines.splice(i, 2);
        console.log('Removed duplicate return (');
        break;
    }
}

fs.writeFileSync('src/pages/Dashboard.tsx', lines.join('\n'));
