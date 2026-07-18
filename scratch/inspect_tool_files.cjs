const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname);
const toolFiles = files.filter(f => f.startsWith('tool_') && f.endsWith('.txt'));

console.log(`Checking ${toolFiles.length} tool files...`);

for (const file of toolFiles) {
    const filePath = path.join(__dirname, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('activeTab') || content.includes('profile.') || content.includes('firstName')) {
        console.log(`\n======================================================`);
        console.log(`FILE: ${file} (length: ${content.length})`);
        console.log(`======================================================`);
        if (content.length < 5000) {
            console.log(content);
        } else {
            console.log(content.substring(0, 1000) + '\n...\n' + content.substring(content.length - 1000));
        }
        console.log(`======================================================\n`);
    }
}
