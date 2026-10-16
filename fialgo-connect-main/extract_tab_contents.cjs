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
const tabs = ['security', 'ai', 'trading', 'privacy', 'plan'];

tabs.forEach(tab => {
    let longestContent = '';
    let longestFile = '';
    files.forEach(file => {
        if (file.endsWith('.json') && file.includes('candidate_')) {
            try {
                const data = JSON.parse(fs.readFileSync(file, 'utf8'));
                if (data.content) {
                    // search with single and double quotes
                    const matchDouble = `activeTab === "${tab}"`;
                    const matchSingle = `activeTab === '${tab}'`;
                    let idx = data.content.indexOf(matchDouble);
                    if (idx === -1) {
                        idx = data.content.indexOf(matchSingle);
                    }
                    if (idx !== -1) {
                        const block = data.content.substring(idx, idx + 4000);
                        if (block.length > longestContent.length) {
                            longestContent = block;
                            longestFile = file;
                        }
                    }
                }
            } catch(e) {}
        }
    });
    console.log(`Longest block for tab "${tab}" found in ${longestFile}: length ${longestContent.length}`);
    fs.writeFileSync(`scratch/recovered_${tab}.txt`, longestContent, 'utf8');
});
