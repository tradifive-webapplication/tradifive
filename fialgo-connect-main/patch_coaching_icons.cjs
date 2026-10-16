const fs = require('fs');

const path = 'src/pages/TradifiveAI.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add Iconly imports
const targetImport = 'import { Toaster as Sonner } from "@/components/ui/sonner";';
const newImport = `import { Toaster as Sonner } from "@/components/ui/sonner";
import {
  Plus as IconlyPlus,
  Send as IconlySend,
  Voice as IconlyVoice,
  ShieldDone as IconlyShieldDone,
  Activity as IconlyActivity,
  TimeSquare as IconlyTimeSquare,
  Discovery as IconlyDiscovery,
  ArrowUp as IconlyArrowUp
} from "react-iconly";`;

if (code.includes('import { BrowserRouter') && !code.includes('IconlyShieldDone')) {
  // Let's find first line to add it
  code = code.replace(
    'import { useState, useRef, useEffect } from "react";',
    `import { useState, useRef, useEffect } from "react";
import {
  Plus as IconlyPlus,
  Send as IconlySend,
  Voice as IconlyVoice,
  ShieldDone as IconlyShieldDone,
  Activity as IconlyActivity,
  TimeSquare as IconlyTimeSquare,
  Discovery as IconlyDiscovery,
  ArrowUp as IconlyArrowUp
} from "react-iconly";`
  );
}

// 2. Replace the Suggestion Shortcut Cards icons
code = code.replace(/icon:\s*ShieldCheck/g, 'icon: IconlyShieldDone');
code = code.replace(/icon:\s*Brain/g, 'icon: IconlyActivity');
code = code.replace(/icon:\s*Clock/g, 'icon: IconlyTimeSquare');
code = code.replace(/icon:\s*Sparkles/g, 'icon: IconlyDiscovery');

// 3. Replace the shortcut render method to render react-iconly correctly
code = code.replace(
  '<item.icon size={16} />',
  '<item.icon set="curved" primaryColor="currentColor" size={18} stroke="bold" />'
);

// 4. Replace Plus icon in chat bar
code = code.replace(
  '<Plus size={16} className={`transition-transform duration-200 ${showPlusMenu ? "rotate-45" : ""}`} />',
  '<IconlyPlus set="curved" primaryColor="currentColor" size={16} className={`transition-transform duration-200 ${showPlusMenu ? "rotate-45" : ""}`} stroke="bold" />'
);

// 5. Replace Plus icon in Plus Menu popover
code = code.replace(
  '<item.icon size={15} className="text-indigo-400 shrink-0" />',
  '<item.icon set="curved" primaryColor="currentColor" size={15} className="text-indigo-400 shrink-0" stroke="bold" />'
);

// 6. Replace AudioLines with IconlyVoice
code = code.replace(
  '<AudioLines size={16} />',
  '<IconlyVoice set="curved" primaryColor="currentColor" size={16} stroke="bold" />'
);

// 7. Replace ArrowUp with IconlyArrowUp
code = code.replace(
  '<ArrowUp size={14} />',
  '<IconlyArrowUp set="curved" primaryColor="currentColor" size={14} stroke="bold" />'
);

// 8. Replace Plus in New Chat button
code = code.replace(
  '<Plus size={16} className="shrink-0" />',
  '<IconlyPlus set="curved" primaryColor="currentColor" size={16} className="shrink-0" stroke="bold" />'
);

fs.writeFileSync(path, code);
console.log('Successfully updated AI Coach console page to use Curved Iconly icons!');
