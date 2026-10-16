const fs = require('fs');
const readline = require('readline');

async function searchLog() {
    const fileStream = fs.createReadStream('transcript_extract.jsonl');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let foundCount = 0;
    for await (const line of rl) {
        if (line.includes('isEditModalOpen') && line.includes('const [isEditModalOpen')) {
            console.log(`Line matches isEditModalOpen state:`);
            console.log(line.substring(0, 1000)); // Print part of the line
            foundCount++;
            if (foundCount > 5) break;
        }
    }
}

searchLog().catch(console.error);
