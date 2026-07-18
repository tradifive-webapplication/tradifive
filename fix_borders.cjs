const fs = require('fs');
let code = fs.readFileSync('src/components/ui/agent-bento-grid.tsx', 'utf8');

code = code.replace(/border-white\/10\/[0-9]+/g, 'border-white/10');
code = code.replace(/border-border\/[0-9]+/g, 'border-white/10');
code = code.replace(/bg-border\/[0-9]+/g, 'bg-white/10');
code = code.replace(/text-border\/[0-9]+/g, 'text-white/20');
code = code.replace(/bg-white\/10\/[0-9]+/g, 'bg-white/5');

// Find standalone 'border' classes and make them 'border border-white/10' if they don't have a color.
// Wait, safer to just replace specific ones from the output:
code = code.replace(/className={`w-full h-full rounded-\[14px\] border flex /g, 'className={`w-full h-full rounded-[14px] border border-white/10 flex ');
code = code.replace(/className={`w-full rounded-2xl border flex items-center gap-2\.5 \${isActive/g, 'className={`w-full rounded-2xl border border-white/10 flex items-center gap-2.5 ${isActive');
code = code.replace(/className={`relative flex shrink-0 items-center justify-center w-\[36px\] h-\[36px\] rounded-\[12px\] border transition-all /g, 'className={`relative flex shrink-0 items-center justify-center w-[36px] h-[36px] rounded-[12px] border border-white/10 transition-all ');

fs.writeFileSync('src/components/ui/agent-bento-grid.tsx', code);
console.log('Borders replaced successfully!');
