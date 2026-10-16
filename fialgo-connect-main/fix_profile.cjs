const fs = require('fs');

const path = './src/pages/Profile.tsx';
let content = fs.readFileSync(path, 'utf8');

const startIndex = content.indexOf('  const fetchProfileAndData = async () => {');
if (startIndex === -1) { 
  console.log('Could not find start index'); 
  process.exit(1); 
}

const endMarker = '  const toggleFollowUser = async (targetUserId: string, targetName: string) => {';
const endIndex = content.indexOf(endMarker, startIndex);

if (endIndex === -1) {
  console.log("End marker not found.");
  process.exit(1);
}

const replacement = fs.readFileSync('replacement.txt', 'utf8');

const finalContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(path, finalContent, 'utf8');
console.log("Successfully replaced fetchProfileAndData!");
