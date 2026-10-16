const fs = require('fs');
const path = require('path');

function findUnescapedBacktick(content, startIndex) {
    for (let i = startIndex; i < content.length; i++) {
        if (content[i] === '`') {
            let backslashCount = 0;
            let j = i - 1;
            while (j >= 0 && content[j] === '\\') {
                backslashCount++;
                j--;
            }
            if (backslashCount % 2 === 0) {
                return i;
            }
        }
    }
    return -1;
}

function extractTabJSX(filename, varName) {
    const filePath = path.join(__dirname, '..', filename);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find the declaration of the variable
    const varDecl = `${varName} =`;
    const varIndex = content.indexOf(varDecl);
    if (varIndex === -1) {
        throw new Error(`Could not find variable ${varName} in ${filename}`);
    }
    
    // Find the start backtick
    const startBacktick = findUnescapedBacktick(content, varIndex + varDecl.length);
    if (startBacktick === -1) {
        throw new Error(`Could not find start backtick for ${varName} in ${filename}`);
    }
    
    // Find the end backtick
    const endBacktick = findUnescapedBacktick(content, startBacktick + 1);
    if (endBacktick === -1) {
        throw new Error(`Could not find end backtick for ${varName} in ${filename}`);
    }
    
    let rawStr = content.substring(startBacktick + 1, endBacktick);
    
    // Unescape template elements
    let cleanStr = rawStr
        .replace(/\\`/g, '`')
        .replace(/\\\${/g, '${')
        .replace(/\\"/g, '"');
        
    return cleanStr;
}

try {
    const general = extractTabJSX('replace_general.cjs', 'replacement');
    const profiles = extractTabJSX('replace_profiles.cjs', 'replacement');
    const notifications = extractTabJSX('replace_notifications.cjs', 'newTab');
    const appearance = extractTabJSX('replace_appearance.cjs', 'replacement');
    
    fs.writeFileSync(path.join(__dirname, 'general.txt'), general, 'utf8');
    fs.writeFileSync(path.join(__dirname, 'profiles.txt'), profiles, 'utf8');
    fs.writeFileSync(path.join(__dirname, 'notifications.txt'), notifications, 'utf8');
    fs.writeFileSync(path.join(__dirname, 'appearance.txt'), appearance, 'utf8');
    
    console.log('Successfully extracted all tabs to scratch directory!');
} catch (err) {
    console.error('Error during extraction:', err);
}
