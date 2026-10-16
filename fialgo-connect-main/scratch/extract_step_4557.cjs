const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function extractStep4557() {
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
        
        const idx = step.step_index;
        if (idx === 4556 || idx === 4557) {
            console.log(`\n=========================================`);
            console.log(`Step ${idx}:`);
            console.log(`Keys:`, Object.keys(step));
            console.log(`Source:`, step.source);
            console.log(`Type:`, step.type);
            console.log(`Status:`, step.status);
            
            for (const key of Object.keys(step)) {
                if (key !== 'step_index' && key !== 'source' && key !== 'type' && key !== 'status' && key !== 'created_at' && key !== 'thinking' && key !== 'tool_calls') {
                    const value = step[key];
                    const length = typeof value === 'string' ? value.length : (typeof value === 'object' ? JSON.stringify(value).length : 0);
                    console.log(`Field: ${key}, Type: ${typeof value}, Length/Size: ${length}`);
                    if (typeof value === 'string') {
                        const outPath = `scratch/step_${idx}_${key}.txt`;
                        fs.writeFileSync(outPath, value, 'utf8');
                        console.log(`Saved ${key} to ${outPath}`);
                    }
                }
            }
        }
    }
}

extractStep4557().catch(console.error);
