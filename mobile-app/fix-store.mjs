import fs from 'fs';

let content = fs.readFileSync('c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/store/index.ts', 'utf-8');

// 1. Remove interface properties
content = content.replace(/  isBypassed: boolean;\n  setBypassed: \(bypassed: boolean\) => void;\n/, '');

// 2. Remove initial state
content = content.replace(/  isBypassed: false,\n  setBypassed: \(bypassed\) => set\(\{ isBypassed: bypassed \}\),\n/, '');

// 3. updatePreferences
content = content.replace(/    const isMockBypass = get\(\)\.isBypassed \|\| user\.id\.startsWith\('mock-user-id'\);\n    if \(!isMockBypass\) \{\n/, '');
content = content.replace(/        \}\n      \} catch \(err\) \{\n        console\.error\('\[Store Preferences Sync Error\]:', err\);\n      \}\n    \}/, '        }\n      } catch (err) {\n        console.error(\'[Store Preferences Sync Error]:\', err);\n      }');

// 4. init bypass block
content = content.replace(/      const isMockBypass = get\(\)\.isBypassed \|\| get\(\)\.currentUser\?\.id\?\.startsWith\('mock-user-id'\);\n      if \(isMockBypass\) \{[\s\S]*?return;\n      \}\n/, '');

// 5. fetchFollowStats bypass block
content = content.replace(/    if \(get\(\)\.isBypassed\) \{[\s\S]*?return;\n    \}\n/, '');

// 6. followUser bypass block
content = content.replace(/    if \(get\(\)\.isBypassed\) \{[\s\S]*?return;\n    \}\n/, '');

// 7. unfollowUser bypass block
content = content.replace(/    if \(get\(\)\.isBypassed\) \{[\s\S]*?return;\n    \}\n/, '');

// 8. fetchNotifications
content = content.replace(/    if \(get\(\)\.isBypassed\) \{\n      set\(\{ notifications: \[\] \}\);\n      return;\n    \}\n/, '');

// 9. fetchChannels
content = content.replace(/    if \(get\(\)\.isBypassed\) \{\n      set\(\{ channels: \[\] \}\);\n      return;\n    \}\n/, '');

// 10. fetchTradingData
content = content.replace(/    if \(get\(\)\.isBypassed\) \{[\s\S]*?      return;\n    \}\n/, '');

// 11. toggleAlgoStatus
content = content.replace(/    if \(get\(\)\.isBypassed\) return;\n/, '');

// 12. fetchPosts
content = content.replace(/    if \(get\(\)\.isBypassed\) \{[\s\S]*?      return;\n    \}\n/, '');

// 13. createPost
content = content.replace(/    if \(get\(\)\.isBypassed\) \{[\s\S]*?      return;\n    \}\n/, '');

// 14. deletePost
content = content.replace(/    if \(get\(\)\.isBypassed\) return;\n/, '');

// 15. likePost
content = content.replace(/      if \(get\(\)\.isBypassed\) return;\n/g, '');

fs.writeFileSync('c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/store/index.ts', content);
