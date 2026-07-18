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
const query = 'Creator';

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.toLowerCase().includes(query.toLowerCase())) {
            console.log(`Match for "${query}" in file: ${file}`);
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
                if (line.toLowerCase().includes(query.toLowerCase())) {
                    console.log(`  Line ${idx + 1}: ${line.trim()}`);
                }
            });
        }
    } catch(e) {}
});
