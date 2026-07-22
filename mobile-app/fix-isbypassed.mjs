import fs from 'fs';

function replaceInFile(filepath, regex, replacement) {
  let content = fs.readFileSync(filepath, 'utf-8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(filepath, content);
}

const prefix = 'c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/';

// settings.tsx
let settingsContent = fs.readFileSync(prefix + 'app/(tabs)/settings.tsx', 'utf-8');
settingsContent = settingsContent.replace(/      const isBypassed = useStore\.getState\(\)\.isBypassed \|\| user\.id\.startsWith\('mock-user-id'\);\n      if \(!isBypassed\) \{\n/, '      {\n');
settingsContent = settingsContent.replace(/              const isBypassed = useStore\.getState\(\)\.isBypassed \|\| user\?\.id\?\.startsWith\('mock-user-id'\);\n              if \(!isBypassed\) \{\n/, '              {\n');
fs.writeFileSync(prefix + 'app/(tabs)/settings.tsx', settingsContent);

// user/[id].tsx
let userContent = fs.readFileSync(prefix + 'app/user/[id].tsx', 'utf-8');
userContent = userContent.replace(/  const isBypassed = useStore\(state => state\.isBypassed\);\n/, '');
userContent = userContent.replace(/      if \(isBypassed\) \{[\s\S]*?      \}\n/, '');
userContent = userContent.replace(/      if \(isBypassed\) \{[\s\S]*?      \}\n/, '');
fs.writeFileSync(prefix + 'app/user/[id].tsx', userContent);

// search.tsx
let searchContent = fs.readFileSync(prefix + 'app/search.tsx', 'utf-8');
searchContent = searchContent.replace(/  const isBypassed = useStore\(state => state\.isBypassed\);\n/, '');
searchContent = searchContent.replace(/      if \(isBypassed\) \{[\s\S]*?      \}\n/, '');
fs.writeFileSync(prefix + 'app/search.tsx', searchContent);

// profile.tsx
let profileContent = fs.readFileSync(prefix + 'app/profile.tsx', 'utf-8');
profileContent = profileContent.replace(/      const isBypassed = useStore\.getState\(\)\.isBypassed \|\| currentUser\.id\.startsWith\('mock-user-id'\);\n      if \(!isBypassed\) \{\n/, '      {\n');
fs.writeFileSync(prefix + 'app/profile.tsx', profileContent);

// signup.tsx
let signupContent = fs.readFileSync(prefix + 'app/signup.tsx', 'utf-8');
signupContent = signupContent.replace(/      AuthService\.isBypassed = false;\n      useStore\.setState\(\{ isBypassed: false \}\);\n/g, '');
fs.writeFileSync(prefix + 'app/signup.tsx', signupContent);

// auth.service.ts
let authContent = fs.readFileSync(prefix + 'app/services/auth.service.ts', 'utf-8');
authContent = authContent.replace(/  static isBypassed = false;\n/, '');
authContent = authContent.replace(/    const wasBypassed = AuthService\.isBypassed;\n    AuthService\.isBypassed = false;\n/, '');
authContent = authContent.replace(/        isBypassed: false, \n/, '');
authContent = authContent.replace(/    if \(AuthService\.isBypassed\) \{[\s\S]*?    \}\n/, '');
authContent = authContent.replace(/      if \(useStore\.getState\(\)\.isBypassed\) \{[\s\S]*?      \}\n/, '');
fs.writeFileSync(prefix + 'app/services/auth.service.ts', authContent);

console.log('done');
