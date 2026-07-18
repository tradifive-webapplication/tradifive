const fs = require('fs');
const content = fs.readFileSync('scratch/step_22_tool_output.txt', 'utf8');
console.log('Snippet length:', content.length);
console.log(content.substring(0, 1000));
