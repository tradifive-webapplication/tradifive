const fs = require('fs');
const readline = require('readline');

async function findSupportChanges() {
  const fileStream = fs.createReadStream('C:\\Users\\nikil\\.gemini\\antigravity\\brain\\a90080c4-3b7f-4784-8d6a-3d14f070d608\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let index = 0;
  for await (const line of rl) {
    index++;
    if (line.includes('Support.tsx') && (line.includes('write_to_file') || line.includes('replace_file_content') || line.includes('multi_replace_file_content'))) {
      console.log(`Line ${index}: contains Support.tsx write/edit`);
      try {
        const obj = JSON.parse(line);
        console.log(`  Step Index: ${obj.step_index}, Type: ${obj.type}, Created At: ${obj.created_at}`);
        if (obj.tool_calls) {
          obj.tool_calls.forEach(tc => {
            if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
              console.log(`    Tool: ${tc.name}`);
              console.log(`    Description: ${tc.args?.Description || tc.args?.Instruction}`);
              if (tc.args?.CodeContent) {
                console.log(`    Code length: ${tc.args.CodeContent.length}`);
              }
            }
          });
        }
      } catch (err) {
        console.log(`  Failed to parse JSON: ${err.message}`);
      }
    }
  }
}

findSupportChanges();
