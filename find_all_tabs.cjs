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
console.log(`Searching in ${files.length} files...`);

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('Account & Security') && content.includes('Privacy & Community') && content.includes('Channel Settings')) {
            console.log(`Match found in file: ${file}`);
        }
    } catch(e) {}
});
