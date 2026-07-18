const fs = require('fs');
const content = fs.readFileSync('scratch/step_22_tool_output.txt', 'utf8');

// Print lines around the general tab or profile tab to understand the original layout
const lines = content.split('\n');
console.log('Total lines in step 22 log:', lines.length);
console.log('=== First 100 lines ===');
console.log(lines.slice(0, 100).join('\n'));
console.log('=== Lines 500 to 600 ===');
console.log(lines.slice(500, 600).join('\n'));
