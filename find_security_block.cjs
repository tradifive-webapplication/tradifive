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
console.log(`Searching for security tab block in ${files.length} files...`);

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.toLowerCase().includes('activetab') && content.toLowerCase().includes('security')) {
            console.log(`Possible match in file: ${file}`);
            // let's print lines matching both
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
                if (line.toLowerCase().includes('activetab') && line.toLowerCase().includes('security')) {
                    console.log(`  Line ${idx + 1}: ${line.trim()}`);
                }
            });
        }
    } catch(e) {}
});
