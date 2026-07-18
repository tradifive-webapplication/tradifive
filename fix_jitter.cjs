const fs = require('fs');

// 1. Remove JS scrollY offset from PremiumBackground
let pbCode = fs.readFileSync('src/components/PremiumBackground.tsx', 'utf8');
pbCode = pbCode.replace(/const scrollY = window\.scrollY;\n/g, '');
pbCode = pbCode.replace(/let drawY = \(b\.y \+ scrollY\) % canvas\.height;\n\s*if \(drawY < 0\) drawY \+= canvas\.height;/g, 'let drawY = b.y;');
fs.writeFileSync('src/components/PremiumBackground.tsx', pbCode);

// 2. Remove StarsBackground from Landing and use CSS background instead
let landing = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

// Remove the StarsBackground component imports and tags
landing = landing.replace(/import StarsBackground from "\.\.\/components\/StarsBackground";\n/g, '');
landing = landing.replace(/<StarsBackground \/>\n\s*/g, '');

// Create the CSS stars style
const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><circle cx="45" cy="80" r="1" fill="rgba(255,255,255,0.4)"/><circle cx="120" cy="40" r="1.5" fill="rgba(255,255,255,0.2)"/><circle cx="250" cy="150" r="1" fill="rgba(255,255,255,0.5)"/><circle cx="80" cy="220" r="1.2" fill="rgba(255,255,255,0.3)"/><circle cx="210" cy="270" r="0.8" fill="rgba(255,255,255,0.6)"/><circle cx="180" cy="90" r="1" fill="rgba(255,255,255,0.3)"/></svg>`;
const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><circle cx="150" cy="50" r="1" fill="rgba(255,255,255,0.3)"/><circle cx="320" cy="180" r="1.5" fill="rgba(255,255,255,0.4)"/><circle cx="50" cy="250" r="1" fill="rgba(255,255,255,0.5)"/><circle cx="280" cy="320" r="1.2" fill="rgba(255,255,255,0.2)"/><circle cx="200" cy="380" r="0.8" fill="rgba(255,255,255,0.4)"/><circle cx="90" cy="140" r="1" fill="rgba(255,255,255,0.6)"/></svg>`;

const encoded1 = `data:image/svg+xml;base64,` + Buffer.from(svg1).toString('base64');
const encoded2 = `data:image/svg+xml;base64,` + Buffer.from(svg2).toString('base64');

const styleTag = `
<style>
@keyframes floatStars {
  from { background-position: 0px 0px, 0px 0px; }
  to { background-position: 0px -300px, 0px -400px; }
}
.css-stars-bg {
  background-image: url('\${encoded1}'), url('\${encoded2}');
  background-attachment: fixed, fixed;
  animation: floatStars 60s linear infinite;
}
</style>
`;

// Inject the style tag inside the main wrapper
landing = landing.replace(/(<div style=\{\{ background: "#050505", color: "#fff", minHeight: "100vh", position: "relative" \}\}>)/, `$1\n      <style>{\`\n        @keyframes floatStars {\n          from { background-position: 0px 0px, 0px 0px; }\n          to { background-position: 0px -300px, 0px -400px; }\n        }\n        .css-stars-bg {\n          background-image: url('${encoded1}'), url('${encoded2}');\n          background-attachment: fixed, fixed;\n          animation: floatStars 60s linear infinite;\n        }\n      \`}</style>`);

// Add the class to all sections that had StarsBackground
landing = landing.replace(/<section id="problem" style=\{\{ background: "#000", /g, '<section id="problem" className="css-stars-bg" style={{ background: "#000", ');
landing = landing.replace(/<section id="how-it-works" style=\{\{ background: "#000", /g, '<section id="how-it-works" className="css-stars-bg" style={{ background: "#000", ');
landing = landing.replace(/<section id="capabilities" style=\{\{ background: "#050505", /g, '<section id="capabilities" className="css-stars-bg" style={{ background: "#050505", ');
landing = landing.replace(/<section id="app-preview" ref=\{sectionRef\} style=\{\{ background: "#000", /g, '<section id="app-preview" ref={sectionRef} className="css-stars-bg" style={{ background: "#000", ');
landing = landing.replace(/<section id="pricing" style=\{\{ background: "#050505", /g, '<section id="pricing" className="css-stars-bg" style={{ background: "#050505", ');
landing = landing.replace(/<section id="wall-of-fame" style=\{\{ background: "#050505", /g, '<section id="wall-of-fame" className="css-stars-bg" style={{ background: "#050505", ');
landing = landing.replace(/<section id="faq" style=\{\{ background: "#000", /g, '<section id="faq" className="css-stars-bg" style={{ background: "#000", ');

fs.writeFileSync('src/pages/Landing.tsx', landing);
console.log('Fixed jitter with CSS stars!');
