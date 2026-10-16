const fs = require('fs');

function searchFile(file) {
    console.log(`=== ${file} ===`);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
        if (line.includes('privacySettings') || line.includes('SettingsToggle') || line.includes('Toggle')) {
            if (line.includes('useState') || line.includes('const') || line.includes('function') || line.includes('class')) {
                console.log(`Line ${idx + 1}: ${line.trim()}`);
            }
        }
    });
}

searchFile('src/pages/Profile.tsx');
if (fs.existsSync('src/pages/Settings.tsx')) {
    searchFile('src/pages/Settings.tsx');
}
