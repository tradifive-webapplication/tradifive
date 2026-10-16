const fs = require('fs');

const path = './src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
const importStatement = `import { NetworkNotifier } from "@/components/NetworkNotifier";\n`;
if (!content.includes('NetworkNotifier')) {
  // Insert after the last import
  const lastImportIndex = content.lastIndexOf('import ');
  const endOfLastImportLine = content.indexOf('\n', lastImportIndex);
  content = content.slice(0, endOfLastImportLine + 1) + importStatement + content.slice(endOfLastImportLine + 1);
  
  // Insert component
  content = content.replace('<Sonner />', '<Sonner />\n      <NetworkNotifier />');
  fs.writeFileSync(path, content, 'utf8');
  console.log("Successfully patched App.tsx");
} else {
  console.log("Already patched");
}
