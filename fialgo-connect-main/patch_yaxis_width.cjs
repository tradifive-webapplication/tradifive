const fs = require('fs');

const path = 'src/components/journal/JournalCharts.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace all occurrences of <YAxis with <YAxis width={85}
// Let's use a regex to replace `<YAxis` but only if it doesn't already have a width prop
code = code.replace(/<YAxis(?!\s+width)/g, '<YAxis width={85}');

fs.writeFileSync(path, code);
console.log('Successfully added width={85} to all YAxis components in JournalCharts.tsx!');
