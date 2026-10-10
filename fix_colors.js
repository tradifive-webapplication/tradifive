const fs = require('fs');
let code = fs.readFileSync('src/components/ui/agent-bento-grid.tsx', 'utf8');

// Replace standard colors
code = code.replace(/bg-white/g, 'bg-[#080808]');
code = code.replace(/dark:bg-neutral-900/g, '');
code = code.replace(/dark:bg-\[#080808\]/g, '');
code = code.replace(/text-foreground/g, 'text-white');
code = code.replace(/text-muted-foreground/g, 'text-white/60');
code = code.replace(/bg-background/g, 'bg-[#000]');
code = code.replace(/bg-muted/g, 'bg-white/10');
code = code.replace(/border-border/g, 'border-white/10');
code = code.replace(/bg-neutral-50/g, 'bg-[#111]');
code = code.replace(/text-zinc-200/g, 'text-white/20');
code = code.replace(/dark:bg-neutral-950\/80/g, '');
code = code.replace(/dark:bg-neutral-950\/50/g, '');
code = code.replace(/dark:text-zinc-800\/60/g, '');
code = code.replace(/dark:text-zinc-800\/80/g, '');
code = code.replace(/text-zinc-500/g, 'text-white/50');
code = code.replace(/text-zinc-400/g, 'text-white/40');
code = code.replace(/text-zinc-800/g, 'text-white/80');

// Replace any remaining dark: classes with just the class
code = code.replace(/dark:([a-zA-Z0-9\/\[\]#-]+)/g, '₹1');

// FeatCard specific fix for shadows
code = code.replace(/shadow-\[0_0_0_1px_rgba\(0,0,0,0\.08\),0_2px_4px_rgba\(0,0,0,0\.04\)\]/g, 'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_0_0_1px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.2)]');
code = code.replace(/"dark:shadow-\[.*?\]",/g, '');

fs.writeFileSync('src/components/ui/agent-bento-grid.tsx', code);
console.log('Colors replaced successfully!');
