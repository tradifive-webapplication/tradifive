const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function findOriginalSettings() {
    const logPath = 'C:\\Users\\nikil\\.gemini\\antigravity\\brain\\a90080c4-3b7f-4784-8d6a-3d14f070d608\\.system_generated\\logs\\transcript.jsonl';
    if (!fs.existsSync(logPath)) {
        console.log('Log file does not exist at path:', logPath);
        return;
    }
    
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const step = JSON.parse(line);
        // Look for the first time Settings.tsx is read or viewed
        if (step.tool_calls) {
            for (const call of step.tool_calls) {
                if (call.name === 'view_file' && call.args && call.args.AbsolutePath && call.args.AbsolutePath.includes('Settings.tsx')) {
                    console.log(`Found a view_file call for Settings.tsx at step ${step.step_index}`);
                }
            }
        }
        
        // Let's also check if there are system/model messages showing original file content
        if (step.content && step.content.includes('export default function Settings') && step.content.includes('activeTab')) {
            if (step.source === 'USER_EXPLICIT' || step.source === 'SYSTEM') {
                console.log(`Found candidate content in step ${step.step_index} (${step.source})`);
                fs.writeFileSync(path.join(__dirname, `step_${step.step_index}_settings.txt`), step.content, 'utf8');
            }
        }
    }
}

findOriginalSettings().catch(console.error);
