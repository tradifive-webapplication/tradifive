const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles('app');

function updateStyles(content) {
  // We'll replace styles in Text components
  return content.replace(/style=\{\{(.*?)\}\}/gs, (match, styleContent) => {
    
    const sizeMatch = styleContent.match(/fontSize:\s*(\d+)/);
    if (!sizeMatch) return match;
    const size = parseInt(sizeMatch[1], 10);
    
    let fontFamily = null;
    let lineHeight = null;
    let fontWeight = null;

    // Based on user requirements
    if (size >= 32) {
      fontFamily = "'Inter_700Bold'";
      lineHeight = 38;
    } else if (size === 24 || size === 26 || size === 28 || size === 30) {
      fontFamily = "'Inter_600SemiBold'";
      lineHeight = 30;
    } else if (size === 20 || size === 22) {
      fontFamily = "'Inter_600SemiBold'";
    } else if (size === 18) {
      fontFamily = "'Inter_500Medium'";
    } else if (size === 16 || size === 15) {
      // Body Text: 16px Regular, Button Text: 16px SemiBold
      // It's hard to distinguish perfectly inside style={}, but if we find 'fontWeight: "600"' or "bold" previously we keep it
      // Let's default to Regular, but if the text was wrapped in a button maybe it has bold.
      // Wait, let's just make it Inter_400Regular unless we see something that hints it's a button.
      if (styleContent.includes('fontWeight:') && (styleContent.includes('600') || styleContent.includes('bold') || styleContent.includes('700'))) {
        fontFamily = "'Inter_600SemiBold'";
      } else {
        fontFamily = "'Inter_400Regular'";
      }
    } else if (size === 14 || size === 13) {
      fontFamily = "'Inter_400Regular'";
    } else if (size <= 12) {
      fontFamily = "'Inter_500Medium'";
    }

    if (!fontFamily) return match;

    // Add fontVariant tabular-nums if it contains currency symbols or numbers
    // But since we can't easily know the text content inside the regex for style={},
    // we can only keep existing fontVariant or rely on the other requirements.

    // Remove old font properties
    let newStyle = styleContent
      .replace(/,\s*fontFamily:\s*'[^']+'/g, '')
      .replace(/fontFamily:\s*'[^']+'\s*,?/g, '')
      .replace(/,\s*fontWeight:\s*['"]?[a-zA-Z0-9]+['"]?/g, '')
      .replace(/fontWeight:\s*['"]?[a-zA-Z0-9]+['"]?\s*,?/g, '')
      .replace(/,\s*lineHeight:\s*\d+/g, '')
      .replace(/lineHeight:\s*\d+\s*,?/g, '');

    // Add the new font family and line height
    newStyle += `, fontFamily: ${fontFamily}`;
    if (lineHeight) {
      newStyle += `, lineHeight: ${lineHeight}`;
    }

    // Clean up trailing/leading commas
    newStyle = newStyle.replace(/^,\s*/, '').replace(/,\s*$/, '');
    
    return `style={{ ${newStyle} }}`;
  });
}

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = updateStyles(content);
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
  }
});
