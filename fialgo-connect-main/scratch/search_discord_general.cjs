const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function findDiscordGeneral() {
    // Try both paths
    const logPath1 = 'transcript_extract.jsonl';
    const logPath2 = 'C:\\Users\\nikil\\.gemini\\antigravity\\brain\\a90080c4-3b7f-4784-8d6a-3d14f070d608\\.system_generated\\logs\\transcript.jsonl';
    
    let selectedPath = '';
    if (fs.existsSync(logPath2)) {
        selectedPath = logPath2;
    } else if (fs.existsSync(logPath1)) {
        selectedPath = logPath1;
    } else {
        console.error('No log file found!');
        return;
    }
    
    console.log('Searching in:', selectedPath);
    
    const fileStream = fs.createReadStream(selectedPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    
    let count = 0;
    for await (let line of rl) {
        line = line.trim();
        if (!line) continue;
        // Strip BOM if present
        if (line.charCodeAt(0) === 0xFEFF || line.charCodeAt(0) === 65533) {
            line = line.substring(1);
        }
        
        let step;
        try {
            step = JSON.parse(line);
        } catch (err) {
            // Try skipping characters until we see '{'
            const startIndex = line.indexOf('{');
            if (startIndex !== -1) {
                try {
                    step = JSON.parse(line.substring(startIndex));
                } catch (err2) {
                    continue;
                }
            } else {
                continue;
            }
        }
        
        if (!step) continue;
        let match = false;
        
        // Search inside content
        if (step.content && (step.content.includes('bg-blue-600') || step.content.includes('DISCORD STYLE'))) {
            match = true;
        }
        
        // Search inside tool calls or tool output
        if (step.tool_calls) {
            for (const call of step.tool_calls) {
                if (JSON.stringify(call).includes('bg-blue-600') || JSON.stringify(call).includes('DISCORD STYLE')) {
                    match = true;
                }
            }
        }
        
        if (match) {
            count++;
            console.log(`Match #${count}: Step ${step.step_index}, Type: ${step.type}, Source: ${step.source}`);
            // Save step contents to a file for investigation
            const outPath = path.join(__dirname, `step_${step.step_index}_match.json`);
            fs.writeFileSync(outPath, JSON.stringify(step, null, 2), 'utf8');
            console.log(`Saved to ${outPath}`);
        }
    }
    console.log(`Found ${count} matches.`);
}

findDiscordGeneral().catch(console.error);
