const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const match = content.match(/activeTab === ["']language["']/);
console.log(match ? "Found language tab at index " + match.index : "Language tab NOT found in JSX!");
