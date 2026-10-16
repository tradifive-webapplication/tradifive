import fs from 'fs';

const content = fs.readFileSync('src/pages/Landing.tsx', 'utf-8');
const lines = content.split('\n');

let inHero = false;
let inCTA = false;
let heroLines = [];
let ctaLines = [];

lines.forEach((line, index) => {
  if (line.includes('function Hero(')) {
    inHero = true;
  }
  if (inHero) {
    heroLines.push(`${index + 1}: ${line}`);
    if (line.trim() === '}') {
      inHero = false;
    }
  }

  if (line.includes('function CTA(')) {
    inCTA = true;
  }
  if (inCTA) {
    ctaLines.push(`${index + 1}: ${line}`);
    if (line.trim() === '}') {
      inCTA = false;
    }
  }
});

console.log("=== HERO ===");
console.log(heroLines.slice(0, 50).join('\n'));
console.log("=== CTA ===");
console.log(ctaLines.slice(0, 50).join('\n'));
