const fs = require('fs');
const content = fs.readFileSync('scratch/section_1.txt', 'utf8');

// Search for 'discord' or 'Discord'
const regex = /discord/gi;
let match;
while ((match = regex.exec(content)) !== null) {
    console.log(`Found "discord" at index ${match.index}:`);
    console.log(content.substring(match.index - 100, match.index + 200).replace(/\n/g, ' '));
}

// Let's also check if there is code block of Settings.tsx inside it
const codeBlocks = content.split('```');
console.log('Total code blocks:', codeBlocks.length);
codeBlocks.forEach((block, idx) => {
    if (block.includes('export default function Settings')) {
        console.log(`Code block ${idx + 1} contains Settings.tsx (length: ${block.length})`);
        fs.writeFileSync(`scratch/code_block_${idx + 1}.tsx`, block, 'utf8');
        console.log(`  Saved code block to scratch/code_block_${idx + 1}.tsx`);
    }
});
