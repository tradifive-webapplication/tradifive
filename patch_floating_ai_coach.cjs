const fs = require('fs');

const path = 'src/components/FloatingAICoach.tsx';
let code = fs.readFileSync(path, 'utf8');

// Update imports
code = code.replace(
  /import \{\s*X,\s*Maximize2,\s*RotateCcw,\s*MoreVertical,\s*ArrowUp,\s*Sparkles,\s*Bot,\s*Plus,\s*PlayCircle\s*\} from 'lucide-react';/,
  `import { PlayCircle } from 'lucide-react';\nimport { Discovery as IconlyDiscovery, Swap as IconlySwap, Scan as IconlyScan, CloseSquare as IconlyCloseSquare, Send as IconlySend } from 'react-iconly';`
);

// Replace Sparkles
code = code.replace(
  /<Sparkles size=\{15\} className="text-indigo-500 dark:text-indigo-400 animate-pulse" \/>/g,
  `<IconlyDiscovery set="curved" primaryColor="currentColor" size={15} className="text-indigo-500 dark:text-indigo-400 animate-pulse" />`
);
code = code.replace(
  /<Sparkles size=\{18\} className="text-blue-400 dark:text-blue-300 drop-shadow-sm" \/>/g,
  `<IconlyDiscovery set="bulk" primaryColor="currentColor" size={18} className="text-blue-500 dark:text-blue-400 drop-shadow-sm" />`
);
code = code.replace(
  /<Sparkles size=\{12\} className="text-blue-500" \/>/g,
  `<IconlyDiscovery set="curved" primaryColor="currentColor" size={12} className="text-blue-500" />`
);
code = code.replace(
  /<Sparkles size=\{18\} className="text-blue-400 dark:text-blue-300 animate-spin" \/>/g,
  `<IconlyDiscovery set="curved" primaryColor="currentColor" size={18} className="text-blue-400 dark:text-blue-300 animate-spin" />`
);

// Replace RotateCcw
code = code.replace(
  /<RotateCcw size=\{12\} \/>/g,
  `<IconlySwap set="curved" primaryColor="currentColor" size={12} />`
);

// Replace Maximize2
code = code.replace(
  /<Maximize2 size=\{12\} \/>/g,
  `<IconlyScan set="curved" primaryColor="currentColor" size={12} />`
);

// Replace X
code = code.replace(
  /<X size=\{12\} \/>/g,
  `<IconlyCloseSquare set="curved" primaryColor="currentColor" size={12} />`
);

// Replace ArrowUp
code = code.replace(
  /<ArrowUp size=\{16\} \/>/g,
  `<IconlySend set="bold" primaryColor="currentColor" size={16} />`
);

fs.writeFileSync(path, code);
console.log('Patched FloatingAICoach.tsx successfully!');
