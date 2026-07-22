const fs = require('fs');
const files = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/channel.tsx',
  'app/(tabs)/journal.tsx',
  'app/(tabs)/risk-guard.tsx',
  'app/(tabs)/home.tsx'
];

files.forEach(file => {
  if(!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/fontSize:\s*32,\s*(fontFamily|fontWeight):\s*'[^']+'/g, "fontSize: 32, fontFamily: 'Inter_700Bold', lineHeight: 38");
  content = content.replace(/fontSize:\s*24,\s*(fontFamily|fontWeight):\s*'[^']+'/g, "fontSize: 24, fontFamily: 'Inter_600SemiBold', lineHeight: 30");
  content = content.replace(/fontSize:\s*20,\s*(fontFamily|fontWeight):\s*'[^']+'/g, "fontSize: 20, fontFamily: 'Inter_600SemiBold'");
  content = content.replace(/fontSize:\s*18,\s*(fontFamily|fontWeight):\s*'[^']+'/g, "fontSize: 18, fontFamily: 'Inter_500Medium'");
  content = content.replace(/fontSize:\s*16,\s*(fontFamily|fontWeight):\s*'[^']+'/g, "fontSize: 16, fontFamily: 'Inter_400Regular'");
  content = content.replace(/fontSize:\s*14,\s*(fontFamily|fontWeight):\s*'[^']+'/g, "fontSize: 14, fontFamily: 'Inter_400Regular'");
  content = content.replace(/fontSize:\s*12,\s*(fontFamily|fontWeight):\s*'[^']+'/g, "fontSize: 12, fontFamily: 'Inter_500Medium'");
  
  // Custom replacements for standardizing lower values too
  content = content.replace(/fontSize:\s*11,\s*(fontFamily|fontWeight):\s*'[^']+'/g, "fontSize: 11, fontFamily: 'Inter_500Medium'");
  content = content.replace(/fontSize:\s*10,\s*(fontFamily|fontWeight):\s*'[^']+'/g, "fontSize: 10, fontFamily: 'Inter_500Medium'");
  content = content.replace(/fontSize:\s*9,\s*(fontFamily|fontWeight):\s*'[^']+'/g, "fontSize: 10, fontFamily: 'Inter_500Medium'");

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Done!');
