import fs from 'fs';
import path from 'path';

// Let's check where PricingCards is located
const searchPaths = [
  'src/components/PricingCards.tsx',
  'src/components/PricingCards.jsx',
  'src/pages/Landing.tsx'
];

searchPaths.forEach(p => {
  if (fs.existsSync(p)) {
    console.log(`=== File: ${p} ===`);
    const content = fs.readFileSync(p, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes('pricing') || line.toLowerCase().includes('button') || line.toLowerCase().includes('btn-')) {
        if (line.includes('style=') || line.includes('className=')) {
          console.log(`Line ${index + 1}: ${line.trim()}`);
        }
      }
    });
  }
});
