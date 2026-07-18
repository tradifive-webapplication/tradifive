const fs = require('fs');

const diff = fs.readFileSync('dashboard_diff.txt', 'utf8');
const lines = diff.split('\n');

let capturing = false;
const recoveredLines = [];

for (let line of lines) {
  if (line.endsWith('\r')) line = line.slice(0, -1); // strip \r

  if (line === '-      <TooltipProvider>') {
    capturing = true;
  }
  
  if (capturing) {
    if (line.startsWith('-')) {
      recoveredLines.push(line.substring(1));
    } else if (line.startsWith(' ')) {
      recoveredLines.push(line.substring(1));
    } else if (line.startsWith('+') || line.startsWith('@@') || line.startsWith('=')) {
      // ignore
    } else if (line === '') {
       recoveredLines.push('');
    }
  }
}

// Now we have all the deleted lines from <TooltipProvider> to the end.
let recoveredText = recoveredLines.join('\n');

// Apply the tooltip replacements that we originally intended
recoveredText = recoveredText.replace(/<TooltipProvider>/g, '<UITooltipProvider>');
recoveredText = recoveredText.replace(/<\/TooltipProvider>/g, '</UITooltipProvider>');
recoveredText = recoveredText.replace(/<Tooltip delayDuration=\{100\}>/g, '<UITooltip delayDuration={100}>');
recoveredText = recoveredText.replace(/<\/Tooltip>/g, '</UITooltip>');
recoveredText = recoveredText.replace(/<TooltipTrigger/g, '<UITooltipTrigger');
recoveredText = recoveredText.replace(/<\/TooltipTrigger>/g, '</UITooltipTrigger>');
recoveredText = recoveredText.replace(/<TooltipContent/g, '<UITooltipContent');
recoveredText = recoveredText.replace(/<\/TooltipContent>/g, '</UITooltipContent>');

console.log('Recovered lines count:', recoveredLines.length);

if (recoveredLines.length > 100) {
    // Read current Dashboard.tsx
    let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
    
    // Clean up trailing whitespace/newlines from the truncated file
    dashboardCode = dashboardCode.trimEnd();

    // The file currently ends with <DashboardLayout>
    if (dashboardCode.endsWith('<DashboardLayout>')) {
       dashboardCode = dashboardCode + '\n' + recoveredText;
       fs.writeFileSync('src/pages/Dashboard.tsx', dashboardCode);
       console.log('Successfully recovered Dashboard.tsx!');
    } else {
       console.log('Error: <DashboardLayout> not found at the end of Dashboard.tsx');
    }
}
