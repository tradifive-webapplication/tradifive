const fs = require('fs');
let c = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

c = c.replace(/\\`/g, '`');
c = c.replace(/\\\$\{/g, '${');
c = c.replace(/\\"/g, '"');

fs.writeFileSync('src/pages/Settings.tsx', c, 'utf8');
console.log('Fixed escaped characters!');
