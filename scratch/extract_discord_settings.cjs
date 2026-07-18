const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname);
const matches = files.filter(f => f.startsWith('step_') && f.endsWith('_match.json'));

console.log(`Found ${matches.length} matches in scratch/`);

let longestBlock = '';
let longestFile = '';

for (const file of matches) {
    const filePath = path.join(__dirname, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Look in content
    if (data.content && data.content.includes('bg-blue-600') && data.content.includes('activeTab')) {
        const blocks = data.content.split('```');
        for (const block of blocks) {
            if (block.includes('bg-blue-600') && block.length > longestBlock.length) {
                longestBlock = block;
                longestFile = `${file} (content)`;
            }
        }
    }
    
    // Look in tool calls
    if (data.tool_calls) {
        for (const call of data.tool_calls) {
            if (call.name === 'write_to_file' && call.args && call.args.CodeContent) {
                const code = call.args.CodeContent;
                if (code.includes('bg-blue-600') && code.length > longestBlock.length) {
                    longestBlock = code;
                    longestFile = `${file} (tool_calls write_to_file)`;
                }
            }
            if (call.name === 'replace_file_content' && call.args && call.args.ReplacementContent) {
                const code = call.args.ReplacementContent;
                if (code.includes('bg-blue-600') && code.length > longestBlock.length) {
                    longestBlock = code;
                    longestFile = `${file} (tool_calls replace_file_content)`;
                }
            }
        }
    }
}

if (longestBlock) {
    console.log(`Longest block found in ${longestFile} with length ${longestBlock.length}`);
    fs.writeFileSync(path.join(__dirname, 'discord_layout_extracted.txt'), longestBlock, 'utf8');
    console.log('Saved to scratch/discord_layout_extracted.txt');
} else {
    console.log('No block containing bg-blue-600 and activeTab was found.');
}
