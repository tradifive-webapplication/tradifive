const fs = require('fs');
const path = require('path');

function searchDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file === 'node_modules' || file === '.next' || file === 'dist' || file === '.vercel' || file === '.git' || file === '.agents') {
                continue;
            }
            searchDir(fullPath);
        } else {
            if (file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.txt')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes('bg-blue-600') && content.includes('activeTab') && (content.includes('Discord') || content.includes('DISCORD'))) {
                    console.log(`Found candidate file: ${fullPath} (length: ${content.length})`);
                }
            }
        }
    }
}

searchDir('.');
console.log('Search finished.');
