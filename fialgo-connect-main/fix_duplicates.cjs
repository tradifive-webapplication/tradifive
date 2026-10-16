const fs = require('fs');
let code = fs.readFileSync('src/components/ui/agent-bento-grid.tsx', 'utf8');

code = code.replace(/border border-white\/10 border-white\/10/g, 'border border-white/10');
code = code.replace(/text-white\/20 text-white\/20/g, 'text-white/20');

fs.writeFileSync('src/components/ui/agent-bento-grid.tsx', code);
console.log('Duplicates removed!');
