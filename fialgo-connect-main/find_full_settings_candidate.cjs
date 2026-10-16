const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                results = results.concat(walk(filePath));
            }
        } else {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk('.');
let maxLen = 0;
let bestFile = null;

files.forEach(file => {
    if (file.includes('candidate_') && file.endsWith('.json')) {
        try {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (data.content && data.content.length > maxLen && data.content.includes('SETTINGS_TABS')) {
                maxLen = data.content.length;
                bestFile = file;
            }
        } catch(e) {}
    }
});

console.log(`Best candidate file: ${bestFile} with length ${maxLen}`);
if (bestFile) {
    const data = JSON.parse(fs.readFileSync(bestFile, 'utf8'));
    console.log('Writing candidate content to scratch/recovered_settings.tsx...');
    fs.writeFileSync('scratch/recovered_settings.tsx', data.content, 'utf8');
}
