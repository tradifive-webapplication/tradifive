const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function searchViewFiles() {
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
    
    let count = 0;
    for await (let line of rl) {
        line = line.trim();
        if (!line) continue;
        
        let step;
        try {
            step = JSON.parse(line);
        } catch (e) {
            continue;
        }
        
        if (step.tool_calls) {
            for (const call of step.tool_calls) {
                if (call.name === 'view_file' && call.args && call.args.AbsolutePath && call.args.AbsolutePath.includes('Settings.tsx')) {
                    count++;
                    console.log(`Match #${count}: Step ${step.step_index}, StartLine: ${call.args.StartLine}, EndLine: ${call.args.EndLine}`);
                    // Save step output
                    if (step.content) {
                        fs.writeFileSync(`scratch/view_step_${step.step_index}.txt`, step.content, 'utf8');
                    }
                }
            }
        }
    }
    console.log(`Done. Found ${count} view_file calls for Settings.tsx.`);
}

searchViewFiles().catch(console.error);
