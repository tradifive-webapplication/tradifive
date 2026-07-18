const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

code = code.replace(/<section className="pillar-section" style=\{\{ background: "transparent"/g, '<section className="pillar-section" style={{ backgroundColor: "#050505"');
code = code.replace(/<section id="problem" style=\{\{ backgroundColor: "transparent"/g, '<section id="problem" className="css-stars-bg" style={{ backgroundColor: "#000"');
code = code.replace(/<section id="how-it-works" style=\{\{ backgroundColor: "transparent"/g, '<section id="how-it-works" className="css-stars-bg" style={{ backgroundColor: "#050505"');
code = code.replace(/<section id="capabilities" style=\{\{ backgroundColor: "rgba\\(255,255,255,0.02\\)"/g, '<section id="capabilities" className="css-stars-bg" style={{ backgroundColor: "#000"');
code = code.replace(/<section id="app-preview" ref=\{sectionRef\} style=\{\{ backgroundColor: "transparent"/g, '<section id="app-preview" ref={sectionRef} className="css-stars-bg" style={{ backgroundColor: "#050505"');
code = code.replace(/<section id="why" style=\{\{ background: "transparent"/g, '<section id="why" className="css-stars-bg" style={{ backgroundColor: "#000"');
code = code.replace(/<section id="pricing" style=\{\{ backgroundColor: "rgba\\(255,255,255,0.02\\)"/g, '<section id="pricing" className="css-stars-bg" style={{ backgroundColor: "#050505"');
code = code.replace(/<section id="wall-of-fame" style=\{\{ backgroundColor: "rgba\\(255,255,255,0.02\\)"/g, '<section id="wall-of-fame" className="css-stars-bg" style={{ backgroundColor: "#000"');
code = code.replace(/<section style=\{\{ background: "transparent", padding: "100px 28px"/g, '<section className="css-stars-bg" style={{ backgroundColor: "#050505", padding: "100px 28px"');
code = code.replace(/<section style=\{\{ background: "transparent", padding: "120px 28px"/g, '<section className="css-stars-bg" style={{ backgroundColor: "#000", padding: "120px 28px"');

fs.writeFileSync('src/pages/Landing.tsx', code);
console.log('Done fixing section backgrounds');
