const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function findStepDetails() {
    const logPath = 'C:\\Users\\nikil\\.gemini\\antigravity\\brain\\a90080c4-3b7f-4784-8d6a-3d14f070d608\\.system_generated\\logs\\transcript.jsonl';
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const step = JSON.parse(line);
        // Step 21 or 22 (the tool output for step 21)
        if (step.step_index >= 20 && step.step_index <= 25) {
            console.log(`=== Step ${step.step_index} (${step.source}, ${step.type}) ===`);
            if (step.tool_calls) {
                console.log('Tool Calls:', JSON.stringify(step.tool_calls, null, 2));
            }
            if (step.content && step.content.length > 0) {
                console.log('Content snippet:', step.content.substring(0, 500));
            }
            // If it's a tool execution result, print it
            if (step.type === 'VIEW_FILE' || step.type === 'RUN_COMMAND' || step.status === 'DONE') {
                if (step.content) {
                    fs.writeFileSync(path.join(__dirname, `step_${step.step_index}_tool_output.txt`), step.content, 'utf8');
                    console.log(`Saved step ${step.step_index} content to step_${step.step_index}_tool_output.txt`);
                }
            }
        }
    }
}

findStepDetails().catch(console.error);
