const fs = require('fs');
let content = fs.readFileSync('src/pages/UserProfilePublic.tsx', 'utf8');
const restored = fs.readFileSync('restored_block.tsx', 'utf8');

const target1 = '<div className="bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:from-[#181D30] dark:to-[#0E121F] rounded-[32px] overflow-hidden border-2 border-white dark:border-[#1E2538] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),_0_0_0_2px_#E7E7E7] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.4),_0_0_0_2px_#262F47] relative">';
const target2 = '<span className="flex items-center gap-1.5">';

const lines = content.split('\n');
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(target1)) {
        startIdx = i;
    }
    // The next line contains the target2
    if (startIdx !== -1 && i === startIdx + 2 && lines[i].includes(target2)) {
        endIdx = i;
        break;
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    const before = lines.slice(0, startIdx + 1).join('\n');
    const after = lines.slice(endIdx).join('\n');
    const newContent = before + '\n' + restored + '\n' + after;
    fs.writeFileSync('src/pages/UserProfilePublic.tsx', newContent);
    console.log('Successfully stitched file back together manually!');
} else {
    console.log('Target string not found for patching. start:', startIdx, 'end:', endIdx);
}
