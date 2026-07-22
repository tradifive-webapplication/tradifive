import fs from 'fs';

const filepath = 'c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/components/UsernameModal.tsx';
let content = fs.readFileSync(filepath, 'utf-8');

// Colors replacement mapping for dark theme
const replaceColor = (regex, replacement) => {
  content = content.replace(regex, replacement);
};

// 1. Sheet Background
replaceColor(/backgroundColor: '#ffffff',/g, "backgroundColor: '#090d16',");

// 2. Text colors
replaceColor(/color: '#000000'/g, "color: '#ffffff'");
replaceColor(/color: '#475569'/g, "color: '#94a3b8'");
replaceColor(/color: '#334155'/g, "color: '#f1f5f9'");
replaceColor(/color: '#0f172a'/g, "color: '#ffffff'");

// 3. Input styles
replaceColor(/backgroundColor: '#f8fafc',/g, "backgroundColor: '#1e293b',");
replaceColor(/borderColor: '#e2e8f0',/g, "borderColor: '#334155',");
replaceColor(/borderColor: '#cbd5e1',/g, "borderColor: '#334155',");

// 4. Icons
replaceColor(/color="#000000"/g, 'color="#ffffff"');

// 5. Badges & Chips
replaceColor(/backgroundColor: '#e2e8f0'/g, "backgroundColor: '#334155'");
replaceColor(/backgroundColor: '#e0f2fe',/g, "backgroundColor: '#0095f6',");
replaceColor(/buttonDisabled: {\n    backgroundColor: '#334155',\n    shadowOpacity: 0,\n    elevation: 0,\n  },/, "buttonDisabled: {\n    backgroundColor: '#1e293b',\n    shadowOpacity: 0,\n    elevation: 0,\n  },");

// The regex above will replace '#e2e8f0' to '#334155'. It will replace buttonDisabled background.
replaceColor(/buttonDisabled: \{\n    backgroundColor: '#334155',/g, "buttonDisabled: {\n    backgroundColor: '#1e293b',");

fs.writeFileSync(filepath, content);

console.log('Styles updated.');
