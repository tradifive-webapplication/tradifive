const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function searchToolCalls() {
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
                const isSettings = call.args && call.args.TargetFile && call.args.TargetFile.includes('Settings.tsx');
                if (isSettings && (call.name === 'write_to_file' || call.name === 'replace_file_content' || call.name === 'multi_replace_file_content')) {
                    count++;
                    console.log(`Match #${count}: Step ${step.step_index}, Tool: ${call.name}`);
                    if (call.args) {
                        if (call.args.CodeContent) {
                            console.log('--- CodeContent length:', call.args.CodeContent.length);
                            fs.writeFileSync(`scratch/all_settings_write_step_${step.step_index}.txt`, call.args.CodeContent, 'utf8');
                        }
                        if (call.args.ReplacementContent) {
                            console.log('--- ReplacementContent length:', call.args.ReplacementContent.length);
                            fs.writeFileSync(`scratch/all_settings_replace_step_${step.step_index}.txt`, call.args.ReplacementContent, 'utf8');
                        }
                    }
                }
            }
        }
    }
    console.log(`Done. Found ${count} matching tool calls.`);
}

searchToolCalls().catch(console.error);
