const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/step_9036_match.json', 'utf8'));
if (data.tool_calls && data.tool_calls[0] && data.tool_calls[0].args) {
    const code = data.tool_calls[0].args.CodeContent;
    console.log('--- RECOVERED CODE ---');
    console.log(code);
    console.log('--- END OF CODE ---');
    fs.writeFileSync('scratch/recovered_security_script.txt', code, 'utf8');
} else {
    console.log('No code found in tool calls');
}
