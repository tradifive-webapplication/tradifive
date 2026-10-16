const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace standard imports from pages
content = content.replace(/import ([A-Z][a-zA-Z0-9_]*) from '(\.\/pages\/[^']+)';/g, 'const $1 = lazy(() => import(\'$2\'));');
content = content.replace(/import ([A-Z][a-zA-Z0-9_]*) from "(\.\/pages\/[^"]+)";/g, 'const $1 = lazy(() => import("$2"));');

// Write back
fs.writeFileSync('src/App.tsx', content);
console.log("Done");
