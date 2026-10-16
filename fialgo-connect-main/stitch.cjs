const fs = require('fs');
let content = fs.readFileSync('src/pages/UserProfilePublic.tsx', 'utf8');
const restored = fs.readFileSync('restored_block.tsx', 'utf8');

const targetStr = `<div className="bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:from-[#181D30] dark:to-[#0E121F] rounded-[32px] overflow-hidden border-2 border-white dark:border-[#1E2538] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),_0_0_0_2px_#E7E7E7] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.4),_0_0_0_2px_#262F47] relative">
              
                          <span className="flex items-center gap-1.5">`;

const replacement = `<div className="bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:from-[#181D30] dark:to-[#0E121F] rounded-[32px] overflow-hidden border-2 border-white dark:border-[#1E2538] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),_0_0_0_2px_#E7E7E7] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.4),_0_0_0_2px_#262F47] relative">
` + restored + `
                          <span className="flex items-center gap-1.5">`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacement);
    fs.writeFileSync('src/pages/UserProfilePublic.tsx', content);
    console.log('Successfully stitched file back together!');
} else {
    console.log('Target string not found for patching.');
}
