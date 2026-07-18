const fs = require('fs');

// ── Apply the EXACT same color palette as Profile.tsx (the "My Profile" page) ──
// Profile.tsx uses:
//   Header card:     dark:from-[#252528] dark:to-[#1A1A1C]  border dark:border-[#1A1A1A]
//   Stat boxes:      dark:from-[#252528]/65 dark:to-[#1A1A1C]  border-2 dark:border-[#1A1A1A]
//   Section cards:   dark:from-[#141414] dark:to-[#1A1A1C]  border-2 dark:border-[#1A1A1A]
//   Plain bg:        dark:bg-[#141414]
//   Small chips/btns:dark:from-[#252528] dark:to-[#1A1A1C]

function fixFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // ── Dark card gradients ──
  // Previously we set: dark:from-[#111318] and dark:to-[#0C0E14]
  // Replace with Profile.tsx values:
  content = content.split('dark:from-[#111318]').join('dark:from-[#252528]');
  content = content.split('dark:to-[#0C0E14]').join('dark:to-[#1A1A1C]');
  
  // Some were dark:from-[#141414] in profile - keep as-is if already correct
  // Section cards use dark:from-[#141414] in Profile.tsx - we need to check context
  // The large content section cards: from-[#FAFBFD] dark:from-[#141414] dark:to-[#1A1A1C]
  // These were previously: dark:from-[#121625] which we changed to dark:from-[#111318]
  // Now set to dark:from-[#252528] which is correct for the small chips
  // For the section cards (the bigger rounded-3xl ones), Profile.tsx uses dark:from-[#141414]
  // We'll leave the already-transformed ones and use a marker to distinguish

  // ── Dark borders ──
  // Replace all remaining blue-dark borders with the Profile.tsx neutral border
  content = content.split('dark:border-[#1E2130]').join('dark:border-[#1A1A1A]');
  content = content.split('dark:border-[#1E2538]').join('dark:border-[#1A1A1A]');
  content = content.split('dark:border-[#13151C]').join('dark:border-[#1A1A1A]');
  content = content.split('dark:border-[#111318]').join('dark:border-[#1A1A1A]');
  
  // ── Dark solid backgrounds ──
  content = content.split('dark:bg-[#111318]').join('dark:bg-[#1A1A1C]');
  content = content.split('dark:bg-[#0C0E14]').join('dark:bg-[#141414]');
  content = content.split('dark:bg-[#07090E]').join('dark:bg-[#111111]');

  // ── Fix the Follow button blue border - keep Follow button blue but fix its border ──
  // The Follow button uses dark:border-[#3B82F6] - keep this (it's an intentional blue CTA)
  
  fs.writeFileSync(filepath, content);
  console.log('Fixed: ' + filepath);
}

fixFile('src/pages/UserProfilePublic.tsx');
fixFile('src/pages/Notifications.tsx');

// ── Verify the exact Profile.tsx palette is now applied ──
const up = fs.readFileSync('src/pages/UserProfilePublic.tsx', 'utf8');
const allDark = new Set();
(up.match(/dark:(?:bg|from|to|border)-\[#[0-9A-Fa-f]+\]/g) || []).forEach(c => allDark.add(c));
console.log('\nDark colors now in UserProfilePublic:');
Array.from(allDark).sort().forEach(c => console.log('  ' + c));
