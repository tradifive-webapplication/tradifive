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
const query = 'account & security';

files.forEach(file => {
    if (file.endsWith('.json') && file.includes('candidate_')) {
        try {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (data.content && data.content.toLowerCase().includes(query)) {
                console.log(`Match in ${file}:`);
                // find index of query and print surrounding
                const idx = data.content.toLowerCase().indexOf(query);
                console.log(data.content.substring(Math.max(0, idx - 100), Math.min(data.content.length, idx + 1000)));
                console.log('=================================');
            }
        } catch(e) {}
    }
});
