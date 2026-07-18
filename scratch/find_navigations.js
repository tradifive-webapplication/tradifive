import fs from 'fs';
import path from 'path';

const fileContent = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');
const lines = fileContent.split('\n');

lines.forEach((line, index) => {
  if (line.includes('navigate(')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
