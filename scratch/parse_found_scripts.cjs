const fs = require('fs');
const content = fs.readFileSync('found_scripts.log', 'utf8');
const sections = content.split('\n---\n');

console.log('Total sections in found_scripts.log:', sections.length);
sections.forEach((section, idx) => {
    // Print first 100 characters of each section
    console.log(`Section ${idx + 1}: length ${section.length}, preview: ${section.substring(0, 150).replace(/\n/g, ' ')}...`);
    // Save to separate files in scratch directory if it's large
    if (section.length > 1000) {
        fs.writeFileSync(`scratch/section_${idx + 1}.txt`, section, 'utf8');
        console.log(`  Saved as scratch/section_${idx + 1}.txt`);
    }
});
