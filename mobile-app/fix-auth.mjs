import fs from 'fs';

// 1. Fix login.tsx
let login = fs.readFileSync('c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/login.tsx', 'utf-8');

// Remove handleBypassLogin
login = login.replace(/  const handleBypassLogin = async \(\) => \{[\s\S]*?  \};\n/, '');

// Remove Skip Login button
login = login.replace(/                <TouchableOpacity\n                  onPress=\{handleBypassLogin\}[\s\S]*?<\/TouchableOpacity>\n\n\n\n/, '');

// Remove AuthService.isBypassed = false;
login = login.replace(/      \/\/ Explicitly turn off bypassed mode\n      AuthService\.isBypassed = false;\n      useStore\.setState\(\{ isBypassed: false \}\);\n      \n/, '');

fs.writeFileSync('c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/login.tsx', login);

// 2. Fix auth.service.ts
let auth = fs.readFileSync('c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/services/auth.service.ts', 'utf-8');
auth = auth.replace(/  public static isBypassed = false;\n\n/, '');
auth = auth.replace(/    if \(AuthService\.isBypassed\) return true;\n/, '');
auth = auth.replace(/    if \(AuthService\.isBypassed\) return;\n/, '');
fs.writeFileSync('c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/services/auth.service.ts', auth);

// 3. Fix UsernameModal.tsx
let modal = fs.readFileSync('c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/components/UsernameModal.tsx', 'utf-8');
modal = modal.replace(/  const isBypassed = useStore\(state => state\.isBypassed\);\n/, '');
modal = modal.replace(/const visible = \(FORCE_SHOW_FOR_TESTING && testForceShow\) \|\| \(\!\!currentUser && \(hasRealSession \|\| isBypassed\) && \!currentUser\.has_chosen_username\);/, 'const visible = (FORCE_SHOW_FOR_TESTING && testForceShow) || (!!currentUser && hasRealSession && !currentUser.has_chosen_username);');
modal = modal.replace(/        const isBypassed = AuthService\.isBypassed \|\| useStore\.getState\(\)\.isBypassed \|\| currentUser\?\.id\?\.startsWith\('mock-user-id'\);\n        if \(isBypassed\) \{\n          setIsChecking\(false\);\n          setErrorMsg\(null\);\n          setIsAvailable\(true\);\n          return;\n        \}\n/, '');
fs.writeFileSync('c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/components/UsernameModal.tsx', modal);

// 4. Fix signup.tsx
let signup = fs.readFileSync('c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/signup.tsx', 'utf-8');
signup = signup.replace(/      \/\/ Explicitly turn off bypassed mode\n      AuthService\.isBypassed = false;\n      useStore\.setState\(\{ isBypassed: false \}\);\n      \n/, '');
fs.writeFileSync('c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/signup.tsx', signup);
