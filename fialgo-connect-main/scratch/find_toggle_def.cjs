const fs = require('fs');
const content = fs.readFileSync('replace_profiles.cjs', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('SettingsToggle')) {
        console.log(`Line ${idx + 1}: ${line}`);
    }
});
