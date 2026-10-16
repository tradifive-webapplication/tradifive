const fs = require('fs');
const path = require('path');

function extractTabJSX(filename, varName) {
    const filePath = path.join(__dirname, '..', filename);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find the declaration of the template literal
    const searchStr = `${varName} = \``;
    const startIndex = content.indexOf(searchStr);
    if (startIndex === -1) {
        throw new Error(`Could not find variable ${varName} declaration in ${filename}`);
    }
    
    const stringStart = startIndex + searchStr.length;
    
    // Find the closing backtick.
    // It's followed by a semicolon, then optional whitespace, and then either 'const', 'content =', or 'fs.'
    const closingRegex = /`\s*;\s*(?:const|content\s*=|fs\s*\.|console\s*\.)/g;
    closingRegex.lastIndex = stringStart;
    const match = closingRegex.exec(content);
    if (!match) {
        throw new Error(`Could not find closing backtick for ${varName} in ${filename}`);
    }
    
    const stringEnd = match.index;
    let rawStr = content.substring(stringStart, stringEnd);
    
    // Unescape the backticks and template expressions:
    // Replace \` with `
    // Replace \${ with ${
    // Replace \" with "
    // Replace \\ with \
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
