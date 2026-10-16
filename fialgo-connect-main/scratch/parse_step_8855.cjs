const fs = require('fs');
const path = require('path');

const stepData = JSON.parse(fs.readFileSync('scratch/step_8855_full.json', 'utf8'));
console.log('Step 8855 source:', stepData.source);
console.log('Step 8855 type:', stepData.type);
console.log('Step 8855 content length:', stepData.content ? stepData.content.length : 0);

if (stepData.content) {
    const blocks = stepData.content.split('```');
    console.log('Number of code blocks in step 8855 content:', blocks.length);
    blocks.forEach((block, idx) => {
        console.log(`Block ${idx + 1} preview:`, block.substring(0, 200).replace(/\n/g, ' '));
        if (block.includes('export default') || block.includes('activeTab') || block.includes('bg-blue-600')) {
            fs.writeFileSync(`scratch/step_8855_block_${idx + 1}.txt`, block, 'utf8');
            console.log(`  Saved block ${idx + 1} to scratch/step_8855_block_${idx + 1}.txt`);
        }
    });
}
