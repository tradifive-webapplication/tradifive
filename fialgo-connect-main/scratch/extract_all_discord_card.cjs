const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname);
const matches = files.filter(f => f.startsWith('step_') && f.endsWith('_match.json'));

console.log(`Checking ${matches.length} match files...`);

for (const file of matches) {
    const filePath = path.join(__dirname, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let sourceText = '';
    if (data.content) {
        sourceText += data.content + '\n';
    }
    if (data.tool_calls) {
        sourceText += JSON.stringify(data.tool_calls) + '\n';
    }
    
    if (sourceText.includes('DISCORD STYLE "MY ACCOUNT" CARD') || sourceText.includes('DISCORD STYLE')) {
        console.log(`\n======================================================`);
        console.log(`FOUND DISCORD STYLE IN: ${file}`);
        console.log(`======================================================`);
        
        // Find indices
        let idx = sourceText.indexOf('DISCORD STYLE "MY ACCOUNT" CARD');
        if (idx === -1) idx = sourceText.indexOf('DISCORD STYLE');
        
        // Extract 3000 characters from there
        const snippet = sourceText.substring(idx - 100, idx + 4000);
        console.log(snippet);
        console.log(`======================================================\n`);
    }
}
