const fs = require('fs');
const content = fs.readFileSync('src/pages/UserProfilePublic.tsx', 'utf8');

// The corruption is: after handleStartConversation closes with '}; '
// the next chars are: 'from "@/utils/gamification";'
// This was caused by a bad splice that joined the end of handleStartConversation with the rest of the file content

// Strategy: The CLEAN first half ends right at the closing of handleStartConversation
// The CLEAN second half starts from 'export default function UserProfilePublic' (the second one)

const firstExport = content.indexOf('export default function UserProfilePublic');
const secondExport = content.indexOf('export default function UserProfilePublic', firstExport + 10);

if (secondExport === -1) {
  console.log('No duplicate found! File may already be clean.');
  process.exit(0);
}

console.log('First export at char:', firstExport);
console.log('Second export at char:', secondExport);

// The clean first half: everything up to the end of handleStartConversation
// The function ends with: '  };\n\n' before the corruption
// Find the corruption point - it's the '};' at end of handleStartConversation
// followed by garbage (imports of second copy)

// The corruption starts right before 'from "@/utils/gamification"'
const garbageMarker = ' from "@/utils/gamification";\r\n';
const garbageStart = content.indexOf(garbageMarker);
console.log('Garbage starts at char:', garbageStart);

// Clean first half = everything up to and including the '};' (2 chars before garbage)
const cleanFirstHalf = content.substring(0, garbageStart + 2); // +2 for '};'
console.log('Clean first half ends with:', JSON.stringify(cleanFirstHalf.slice(-30)));

// Clean second half = everything from the second 'export default function' onward
// But we need the IMPORTS section too - it's between garbageStart and secondExport
// Actually we need imports ONLY from the top of file (first half already has them)
// The second half that we need starts at the second export
const cleanSecondHalf = content.substring(secondExport);
console.log('Clean second half starts with:', cleanSecondHalf.substring(0, 50));

const cleanFile = cleanFirstHalf + '\n\n' + cleanSecondHalf;
fs.writeFileSync('src/pages/UserProfilePublic.tsx', cleanFile);
console.log('File repaired! New line count:', cleanFile.split('\n').length);
