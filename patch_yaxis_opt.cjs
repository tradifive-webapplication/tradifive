const fs = require('fs');

const path = 'src/components/journal/JournalCharts.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Change width={85} to width={72} in all YAxis elements
code = code.replace(/width=\{85\}/g, 'width={72}');

// 2. Change left: 10 to left: 0 in all margins
code = code.replace(/margin=\{\{\s*top:\s*5,\s*right:\s*5,\s*left:\s*10,/g, "margin={{ top: 5, right: 5, left: 0,");
code = code.replace(/margin=\{\{\s*top:\s*10,\s*right:\s*10,\s*left:\s*10,/g, "margin={{ top: 10, right: 10, left: 0,");

fs.writeFileSync(path, code);
console.log('Successfully optimized chart margins and YAxis width!');
