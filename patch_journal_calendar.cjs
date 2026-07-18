const fs = require('fs');

const path = 'src/components/journal/JournalCalendar.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update imports
const oldImport = `import { ChevronLeft, ChevronRight, Settings, Info } from "lucide-react";`;
const newImport = `import { Info } from "lucide-react";
import { 
  ChevronLeft as IconlyChevronLeft, 
  ChevronRight as IconlyChevronRight, 
  Setting as IconlySetting 
} from "react-iconly";`;

code = code.replace(oldImport, newImport);

// 2. Replace month navigation chevrons
code = code.replace(
  `<ChevronLeft size={18} strokeWidth={2.5} />`,
  `<IconlyChevronLeft set="curved" primaryColor="currentColor" size={16} stroke="bold" />`
);

code = code.replace(
  `<ChevronRight size={18} strokeWidth={2.5} />`,
  `<IconlyChevronRight set="curved" primaryColor="currentColor" size={16} stroke="bold" />`
);

// 3. Replace settings button icon
code = code.replace(
  `<Settings size={15} strokeWidth={2.5} className={showSettings ? "rotate-45" : ""} />`,
  `<IconlySetting set="curved" primaryColor="currentColor" size={15} stroke="bold" className={showSettings ? "rotate-45" : ""} />`
);

fs.writeFileSync(path, code);
console.log('Successfully patched JournalCalendar.tsx with Iconly icons and premium styling!');
