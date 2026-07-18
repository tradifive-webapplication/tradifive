const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/userSubscription === 'starter'/g, "['none', 'beginner', 'starter', 'standard'].includes(userSubscription)");
  content = content.replace(/userSubscription !== 'starter'/g, "!['none', 'beginner', 'starter', 'standard'].includes(userSubscription)");
  // and for useAICoachData/FloatingAICoach:
  content = content.replace(/userPlan === 'starter'/g, "['none', 'beginner', 'starter', 'standard'].includes(userPlan)");
  content = content.replace(/userPlan !== 'starter'/g, "!['none', 'beginner', 'starter', 'standard'].includes(userPlan)");
  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
}

const files = [
  'src/pages/Inbox.tsx',
  'src/pages/RiskGuard.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Channel.tsx',
  'src/components/journal/JournalSettingsBar.tsx',
  'src/components/journal/JournalMetrics.tsx',
  'src/components/journal/JournalCalendar.tsx',
  'src/hooks/useAICoachData.ts',
  'src/pages/TradifiveAI.tsx',
  'src/components/FloatingAICoach.tsx'
];

files.forEach(f => {
  const p = path.join('c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main', f);
  if(fs.existsSync(p)) {
      replaceInFile(p);
  } else {
      console.log('Not found:', p);
  }
});
