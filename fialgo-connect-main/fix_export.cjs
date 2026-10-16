const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const lines = code.split('\n');

let foundExport = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('export default Dashboard;')) {
        if (!foundExport) {
            foundExport = true;
        } else {
            lines.splice(i, 1);
            i--;
            console.log('Removed duplicate export');
        }
    }
}

fs.writeFileSync('src/pages/Dashboard.tsx', lines.join('\n'));
