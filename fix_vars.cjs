const fs = require('fs');
let content = fs.readFileSync('src/pages/UserProfilePublic.tsx', 'utf8');

// Replace declarations
content = content.replace('const displayTradesCount = isLocked ? 0 : totalTradesCount;', 'const safeTradesCount = isLocked ? 0 : totalTradesCount;');
content = content.replace('const displayWinRate = isLocked ? "0%" : displayWinRate;', 'const safeWinRate = isLocked ? "0%" : displayWinRate;');
content = content.replace('const displayRoi = isLocked ? "0.00%" : displayRoi;', 'const safeRoi = isLocked ? "0.00%" : displayRoi;');
content = content.replace('const displayAvgRR = isLocked ? "1 : 0.0" : displayAvgRR;', 'const safeAvgRR = isLocked ? "1 : 0.0" : displayAvgRR;');
content = content.replace('const displayStreak = isLocked ? "0 Days" : displayStreak;', 'const safeStreak = isLocked ? "0 Days" : displayStreak;');
content = content.replace('const displayAdvMetrics = isLocked ? {', 'const safeAdvMetrics = isLocked ? {');

// Replace usages below line 600
const lines = content.split('\n');
for (let i = 600; i < lines.length; i++) {
    lines[i] = lines[i].replace(/displayTradesCount/g, 'safeTradesCount');
    lines[i] = lines[i].replace(/displayWinRate/g, 'safeWinRate');
    lines[i] = lines[i].replace(/displayRoi/g, 'safeRoi');
    lines[i] = lines[i].replace(/displayAvgRR/g, 'safeAvgRR');
    lines[i] = lines[i].replace(/displayStreak/g, 'safeStreak');
    lines[i] = lines[i].replace(/displayAdvMetrics/g, 'safeAdvMetrics');
}

fs.writeFileSync('src/pages/UserProfilePublic.tsx', lines.join('\n'));
console.log('Successfully fixed duplicate variable declarations in UserProfilePublic.tsx');
