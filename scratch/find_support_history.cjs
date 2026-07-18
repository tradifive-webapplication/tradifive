const fs = require('fs');
const readline = require('readline');

async function findSupportChanges() {
  const fileStream = fs.createReadStream('C:\\Users\\nikil\\.gemini\\antigravity\\brain\\a90080c4-3b7f-4784-8d6a-3d14f070d608\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('"step_index":4545')) {
      const obj = JSON.parse(line);
      const toolCall = obj.tool_calls[0];
      const chunksStr = toolCall.args.ReplacementChunks;
      console.log("Raw ReplacementChunks string length:", chunksStr.length);
      
      // Let's write the raw string to a file so we can view it without console formatting issues
      fs.writeFileSync('scratch/raw_chunks.json', chunksStr);
      console.log("Saved raw chunks to scratch/raw_chunks.json");
    }
  }
}

findSupportChanges();
