const fs = require('fs');

const path = 'src/pages/Discover.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace all remaining UserPlus globally
code = code.replace(/<UserPlus size=\{11\} \/>/g, '<IconlyAddUser set="curved" primaryColor="currentColor" size={11} />');

// Replace all remaining Lock size={24} globally
code = code.replace(/<Lock size=\{24\} \/>/g, '<IconlyLock set="curved" primaryColor="currentColor" size={24} />');

fs.writeFileSync(path, code);
console.log('Successfully replaced remaining UserPlus and Lock icons!');
