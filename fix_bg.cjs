const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

// Replace style={{ background: "#000" }} with style={{ backgroundColor: "#000" }}
// to avoid overwriting the background-image from the css-stars-bg class
code = code.replace(/style=\{\{\s*background:\s*"#000"/g, 'style={{ backgroundColor: "#000"');
code = code.replace(/style=\{\{\s*background:\s*"#050505"/g, 'style={{ backgroundColor: "#050505"');

fs.writeFileSync('src/pages/Landing.tsx', code);
console.log('Fixed background shorthand properties');
