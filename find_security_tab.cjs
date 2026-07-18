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
files.forEach(file => {
    if (file.endsWith('.json') && file.includes('candidate_')) {
        try {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (data.content && data.content.includes('id: "security"')) {
                console.log(`Found id: "security" in ${file}`);
                // let's print all activeTab checks in this file
                const content = data.content;
                const matches = [];
                // regex to match activeTab === "security" with optional escapes
                const regex = /activeTab === \\*["'][a-zA-Z0-9_-]+\\*["']/g;
                let match;
                while ((match = regex.exec(content)) !== null) {
                    matches.push(match[0]);
                }
                console.log(`  ActiveTab checks in ${file}: ${JSON.stringify(matches)}`);
            }
        } catch(e) {}
    }
});
