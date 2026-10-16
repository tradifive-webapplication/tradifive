const fs = require('fs');

const content = fs.readFileSync('scratch/extracted_snippets.txt', 'utf8');
const lines = content.split('\n');
console.log(`Total lines in extracted_snippets.txt: ${lines.length}`);

// find indices containing settings terms
const matches = [];
lines.forEach((line, idx) => {
    if (line.includes('Account & Security') || line.includes('Broker & Integrations')) {
        matches.push({ lineNum: idx + 1, content: line.trim() });
    }
});

console.log(`Found ${matches.length} matches:`);
matches.forEach(m => {
    console.log(`  Line ${m.lineNum}: ${m.content}`);
    // print 5 lines before and after
    const start = Math.max(0, m.lineNum - 10);
    const end = Math.min(lines.length, m.lineNum + 20);
    for (let i = start; i < end; i++) {
        console.log(`    ${i+1}: ${lines[i]}`);
    }
    console.log('------------------');
});
