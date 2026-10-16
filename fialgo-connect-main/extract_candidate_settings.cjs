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
const queries = ['activeTab === "security"', 'activeTab === "ai"', 'activeTab === "trading"', 'activeTab === "privacy"', 'activeTab === "plan"'];

files.forEach(file => {
    if (file.endsWith('.json') && file.includes('candidate_')) {
        try {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (data.content) {
                queries.forEach(query => {
                    if (data.content.includes(query)) {
                        console.log(`Match for "${query}" in ${file}`);
                        // print index of query and around it
                        const idx = data.content.indexOf(query);
                        console.log(data.content.substring(Math.max(0, idx - 100), Math.min(data.content.length, idx + 1500)));
                        console.log('=============================================');
                    }
                });
            }
        } catch(e) {}
    }
});
