const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function extractStep8940() {
    const logPath = 'C:\\Users\\nikil\\.gemini\\antigravity\\brain\\a90080c4-3b7f-4784-8d6a-3d14f070d608\\.system_generated\\logs\\transcript.jsonl';
    if (!fs.existsSync(logPath)) {
        console.error('No log file!');
        return;
    }
    
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    
    for await (let line of rl) {
        line = line.trim();
        if (!line) continue;
        
        let step;
        try {
            step = JSON.parse(line);
        } catch (e) {
            continue;
        }
        
        if (step.step_index === 8940 || step.step_index === 8854) {
            console.log(`Found step ${step.step_index}:`);
            console.log(Object.keys(step));
            console.log('Source:', step.source);
            console.log('Type:', step.type);
            console.log('Status:', step.status);
            if (step.content) {
                console.log('Content length:', step.content.length);
                fs.writeFileSync(`scratch/step_${step.step_index}_content.txt`, step.content, 'utf8');
            } else {
                console.log('No content field!');
            }
            if (step.tool_calls) {
                console.log('Tool calls:', JSON.stringify(step.tool_calls, null, 2));
            }
        }
    }
}

extractStep8940().catch(console.error);
