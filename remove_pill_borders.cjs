const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

code = code.replace(/border: "1px solid rgba\([0-9, \.]+\)", /g, '');

fs.writeFileSync('src/pages/Landing.tsx', code);
console.log('Removed pill borders');
