const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function searchLogForCode() {
    const logPath = 'C:\\Users\\nikil\\.gemini\\antigravity\\brain\\a90080c4-3b7f-4784-8d6a-3d14f070d608\\.system_generated\\logs\\transcript.jsonl';
    if (!fs.existsSync(logPath)) {
        console.log('Log file does not exist.');
        return;
    }
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let foundCount = 0;
    for await (const line of rl) {
        const step = JSON.parse(line);
        // Search in content or in tool call outputs
        let textToSearch = '';
        if (step.content) textToSearch += step.content;
        if (step.tool_calls) textToSearch += JSON.stringify(step.tool_calls);
        
        if (textToSearch.includes('bg-blue-600') && textToSearch.includes('h-[100px]') && textToSearch.includes('Settings.tsx')) {
            console.log(`Found match in step ${step.step_index} (${step.source})!`);
            fs.writeFileSync(path.join(__dirname, `step_${step.step_index}_original_settings_match.json`), line, 'utf8');
            foundCount++;
            if (foundCount > 5) break;
        }
    }
    console.log(`Finished search. Found matches: ${foundCount}`);
}

searchLogForCode().catch(console.error);
