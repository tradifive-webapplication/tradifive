import fs from 'fs';
import path from 'path';

const dir = 'supabase';

function search() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile() && file.endsWith('.sql')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.toLowerCase().includes('profiles')) {
        console.log(`=== File: ${file} ===`);
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes('profiles') || line.toLowerCase().includes('policy')) {
            console.log(`${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
  process.exit(0);
}

search();
