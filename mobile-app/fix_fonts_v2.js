const fs = require('fs');

const files = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/channel.tsx',
  'app/(tabs)/journal.tsx',
  'app/(tabs)/risk-guard.tsx',
  'app/(tabs)/home.tsx'
];

function updateStyles(content) {
  // Regex to match the style object inside <Text style={{ ... }}> or similar
  return content.replace(/style=\{\{(.*?)\}\}/g, (match, styleContent) => {
    
    // Extract font size if it exists
    const sizeMatch = styleContent.match(/fontSize:\s*(\d+)/);
    if (!sizeMatch) return match;
    const size = parseInt(sizeMatch[1], 10);
    
    // Determine the desired font family and line height based on the scale
    let fontFamily = null;
    let lineHeight = null;
    let removeFontWeight = true; // We always remove fontWeight to use explicitly loaded Inter fonts
    
    if (size >= 32) {
      fontFamily = "'Inter_700Bold'";
      lineHeight = 38;
    } else if (size === 24 || size === 26 || size === 28) { // Screen titles or large metrics
      fontFamily = "'Inter_600SemiBold'";
      lineHeight = 30;
    } else if (size === 20 || size === 22) { // Section Titles
      fontFamily = "'Inter_600SemiBold'";
    } else if (size === 18) { // Card Titles
      fontFamily = "'Inter_500Medium'";
    } else if (size === 16 || size === 15) { // Body / Button
      // If it looks like a button (we'd have to guess, but default to Regular, maybe Button gets SemiBold manually)
      // Actually, many 16px texts are buttons or important labels. Let's make 16px Regular by default.
      fontFamily = "'Inter_400Regular'";
    } else if (size === 14 || size === 13) { // Secondary text
      fontFamily = "'Inter_400Regular'";
    } else if (size <= 12) { // Small labels
      fontFamily = "'Inter_500Medium'";
    }
    
    if (!fontFamily) return match;

    // Remove existing fontFamily and fontWeight
    let newStyle = styleContent
      .replace(/,\s*fontFamily:\s*'[^']+'/g, '')
      .replace(/fontFamily:\s*'[^']+'\s*,?/g, '')
      .replace(/,\s*fontWeight:\s*'[^']+'/g, '')
      .replace(/fontWeight:\s*'[^']+'\s*,?/g, '')
      .replace(/,\s*lineHeight:\s*\d+/g, '')
      .replace(/lineHeight:\s*\d+\s*,?/g, '');
      
    // Append the new fontFamily and lineHeight
    newStyle += ', fontFamily: ' + fontFamily;
    if (lineHeight) {
      newStyle += ', lineHeight: ' + lineHeight;
    }
    
    // Clean up trailing/leading commas or empty spaces
    newStyle = newStyle.replace(/^,\s*/, '').replace(/,\s*$/, '');
    
    return 'style={{ ' + newStyle + ' }}';
  });
}

files.forEach(file => {
  if(!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let newContent = updateStyles(content);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
  }
});
