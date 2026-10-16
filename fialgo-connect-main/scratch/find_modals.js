import fs from 'fs';

const content = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.toLowerCase().includes('modal') || line.toLowerCase().includes('dialog')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
