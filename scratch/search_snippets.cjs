const fs = require('fs');
const path = require('path');

const snippetPath = path.join(__dirname, 'extracted_snippets.txt');
if (!fs.existsSync(snippetPath)) {
    console.error('extracted_snippets.txt does not exist!');
    process.exit(1);
}

const content = fs.readFileSync(snippetPath, 'utf8');
console.log('File size of extracted_snippets.txt:', content.length);

let idx = 0;
let matchCount = 0;
while (true) {
    idx = content.indexOf('DISCORD STYLE', idx);
    if (idx === -1) idx = content.indexOf('Discord', idx);
    if (idx === -1) break;
    matchCount++;
    console.log(`\n--- Match #${matchCount} at character index ${idx} ---`);
    console.log(content.substring(idx - 100, idx + 2000));
    idx += 15; // length of 'DISCORD STYLE'
    if (matchCount > 10) break;
}
console.log(`\nFound ${matchCount} matches in total.`);
