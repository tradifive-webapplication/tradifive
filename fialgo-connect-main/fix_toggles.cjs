const fs = require('fs');
let c = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

c = c.replace(/<ConsistencyToggleButton checked=\{globalOff\} onChange=\{handleGlobalOff\} \/>\s*<span[^>]*>Switch off all<\/span>/, '<ConsistencyToggleButton checked={globalOff} onChange={handleGlobalOff} label="Switch off all" icon={Power} />');
c = c.replace(/<ConsistencyToggleButton checked=\{globalEmailOnly\} onChange=\{handleEmailOnly\} \/>\s*<span[^>]*>Email only<\/span>/, '<ConsistencyToggleButton checked={globalEmailOnly} onChange={handleEmailOnly} label="Email only" icon={Mail} />');

fs.writeFileSync('src/pages/Settings.tsx', c, 'utf8');
console.log('Fixed toggle props');
