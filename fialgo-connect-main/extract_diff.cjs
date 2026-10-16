const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:/Users/nikil/.gemini/antigravity-ide/brain/e12ba449-5303-4b7a-b13c-20e8b37a500e/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('multi_replace_file_content') && line.includes('Dashboard.tsx') && line.includes('@@')) {
      const parsed = JSON.parse(line);
      if (parsed.content && parsed.content.includes('Indian markets are open')) {
         fs.writeFileSync('dashboard_diff.txt', parsed.content);
         console.log('Saved to dashboard_diff.txt');
         return;
      }
    }
  }
}
processLineByLine();
