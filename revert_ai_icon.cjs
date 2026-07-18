const fs = require('fs');

// 1. Revert in FloatingAICoach.tsx
const pathCoach = 'src/components/FloatingAICoach.tsx';
let codeCoach = fs.readFileSync(pathCoach, 'utf8');

// Revert imports
codeCoach = codeCoach.replace(
  `import { PlayCircle } from 'lucide-react';\nimport { Discovery as IconlyDiscovery, Swap as IconlySwap, Scan as IconlyScan, CloseSquare as IconlyCloseSquare, Send as IconlySend } from 'react-iconly';`,
  `import { PlayCircle, Sparkles } from 'lucide-react';\nimport { Swap as IconlySwap, Scan as IconlyScan, CloseSquare as IconlyCloseSquare, Send as IconlySend } from 'react-iconly';`
);

// Revert Sparkles
codeCoach = codeCoach.replace(
  /<IconlyDiscovery set="curved" primaryColor="currentColor" size=\{15\} className="text-indigo-500 dark:text-indigo-400 animate-pulse" \/>/g,
  `<Sparkles size={15} className="text-indigo-500 dark:text-indigo-400 animate-pulse" />`
);
codeCoach = codeCoach.replace(
  /<IconlyDiscovery set="bulk" primaryColor="currentColor" size=\{18\} className="text-blue-500 dark:text-blue-400 drop-shadow-sm" \/>/g,
  `<Sparkles size={18} className="text-blue-400 dark:text-blue-300 drop-shadow-sm" />`
);
codeCoach = codeCoach.replace(
  /<IconlyDiscovery set="curved" primaryColor="currentColor" size=\{12\} className="text-blue-500" \/>/g,
  `<Sparkles size={12} className="text-blue-500" />`
);
codeCoach = codeCoach.replace(
  /<IconlyDiscovery set="curved" primaryColor="currentColor" size=\{18\} className="text-blue-400 dark:text-blue-300 animate-spin" \/>/g,
  `<Sparkles size={18} className="text-blue-400 dark:text-blue-300 animate-spin" />`
);

fs.writeFileSync(pathCoach, codeCoach);
console.log('Reverted FloatingAICoach.tsx successfully!');

// 2. Revert in Dashboard.tsx
const pathDash = 'src/pages/Dashboard.tsx';
let codeDash = fs.readFileSync(pathDash, 'utf8');

codeDash = codeDash.replace(
  /<IconlyDiscovery set="curved" primaryColor="currentColor" size=\{18\} className="animate-pulse" \/>/g,
  `<Sparkles size={18} className="animate-pulse" />`
);
codeDash = codeDash.replace(
  /<IconlyDiscovery set="curved" primaryColor="currentColor" size=\{18\} className="text-purple-500" \/>/g,
  `<Sparkles size={18} className="text-purple-500" />`
);

fs.writeFileSync(pathDash, codeDash);
console.log('Reverted Dashboard.tsx successfully!');
