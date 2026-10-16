const fs = require('fs');
const readline = require('readline');

async function search() {
    const fileStream = fs.createReadStream('transcript_extract.jsonl');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let index = 0;
    for await (const line of rl) {
        index++;
        // Remove BOM or any non-ascii prefix if present
        const cleanLine = line.replace(/^\uFEFF/, '').trim();
        if (!cleanLine) continue;
        
        try {
            const data = JSON.parse(cleanLine);
            // Search for "discord" in any field
            const str = JSON.stringify(data).toLowerCase();
            if (str.includes('discord')) {
                console.log(`Line ${index} (${data.type || 'unknown'}):`);
                if (data.content) {
                    console.log(`  Content: ${data.content.substring(0, 300)}`);
                }
                if (data.tool_calls) {
                    console.log(`  Tool Calls: ${JSON.stringify(data.tool_calls).substring(0, 300)}`);
                }
                console.log('---');
            }
        } catch (e) {
            // Ignore parse errors for now, or print if we suspect formatting issues
            if (line.includes('discord')) {
                console.log(`Line ${index} (failed to parse JSON, but contains 'discord'):`);
                console.log(`  Raw line snippet: ${line.substring(0, 300)}`);
                console.log('---');
            }
        }
    }
}

search().catch(console.error);
