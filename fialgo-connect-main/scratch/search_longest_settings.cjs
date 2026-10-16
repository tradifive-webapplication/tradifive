const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function findLongestSettings() {
    const logPath = 'C:\\Users\\nikil\\.gemini\\antigravity\\brain\\a90080c4-3b7f-4784-8d6a-3d14f070d608\\.system_generated\\logs\\transcript.jsonl';
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let longestLength = 0;
    let longestStep = -1;
    let longestSource = '';

    for await (const line of rl) {
        const step = JSON.parse(line);
        // Look for Settings.tsx content
        if (step.content && step.content.includes('export default function Settings')) {
            if (step.content.length > longestLength) {
                longestLength = step.content.length;
                longestStep = step.step_index;
                longestSource = step.source;
            }
        }
        
        // Also check inside tool calls (e.g. write_to_file has CodeContent)
        if (step.tool_calls) {
            for (const call of step.tool_calls) {
                if (call.name === 'write_to_file' && call.args && call.args.TargetFile && call.args.TargetFile.includes('Settings.tsx')) {
                    const length = call.args.CodeContent ? call.args.CodeContent.length : 0;
                    if (length > longestLength) {
                        longestLength = length;
                        longestStep = step.step_index;
                        longestSource = 'write_to_file tool_call';
                    }
                }
            }
        }
    }

    console.log(`Longest Settings.tsx content found at step ${longestStep} (${longestSource}) with length ${longestLength} characters.`);
    
    // Now let's extract that step and save it
    if (longestStep !== -1) {
        const fileStream2 = fs.createReadStream(logPath);
        const rl2 = readline.createInterface({
            input: fileStream2,
            crlfDelay: Infinity
        });
        
        for await (const line of rl2) {
            const step = JSON.parse(line);
            if (step.step_index === longestStep) {
                fs.writeFileSync(path.join(__dirname, 'longest_settings_step.json'), JSON.stringify(step, null, 2), 'utf8');
                console.log('Saved longest step to scratch/longest_settings_step.json');
                break;
            }
        }
    }
}

findLongestSettings().catch(console.error);
