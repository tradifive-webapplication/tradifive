const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function extractStep() {
    const logPath = 'C:\\Users\\nikil\\.gemini\\antigravity\\brain\\a90080c4-3b7f-4784-8d6a-3d14f070d608\\.system_generated\\logs\\transcript.jsonl';
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const step = JSON.parse(line);
        if (step.step_index === 8855) {
            fs.writeFileSync(path.join(__dirname, 'step_8855_full.json'), JSON.stringify(step, null, 2), 'utf8');
            console.log('Saved step 8855 to scratch/step_8855_full.json');
        }
        if (step.step_index === 8943) {
            fs.writeFileSync(path.join(__dirname, 'step_8943_full.json'), JSON.stringify(step, null, 2), 'utf8');
            console.log('Saved step 8943 to scratch/step_8943_full.json');
        }
    }
}

extractStep().catch(console.error);
