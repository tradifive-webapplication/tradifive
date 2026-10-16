const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/setTerminalLogging/g, 'setDeveloperConsole');
content = content.replace(/terminalLogging/g, 'developerConsole');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed terminalLogging -> developerConsole');
