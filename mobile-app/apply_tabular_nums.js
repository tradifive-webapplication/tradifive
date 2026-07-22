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

function ensureTabularNums(content) {
  // Regex to find <Text ...>...</Text> blocks containing financial/numeric data 
  // like $, %, or numbers showing P&L (e.g., +150, +$54) and inject fontVariant: ['tabular-nums']
  
  // We'll match a generic <Text> tag and its content
  // Since JSX can be nested, regex isn't perfect, but we can look for basic text strings inside <Text style={{...}}>...</Text>
  const tagRegex = /<Text\s+([^>]*)>([^<]*)<\/Text>/gs;
  
  return content.replace(tagRegex, (match, props, innerText) => {
    // If the innerText looks like financial data (has $, %, or starts with +/-\d)
    const isFinancial = /(\$|\%|^\s*[+-]?\d+(\.\d+)?\s*$|^\s*[+-]?\$\d+(\.\d+)?\s*$)/.test(innerText);
    
    if (isFinancial && props.includes('style={{') && !props.includes('tabular-nums')) {
      // Inject fontVariant: ['tabular-nums'] into style object
      const newProps = props.replace(/style=\{\{\s*/, "style={{ fontVariant: ['tabular-nums'], ");
      return `<Text ${newProps}>${innerText}</Text>`;
    }
    
    return match;
  });
}

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = ensureTabularNums(content);
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Added tabular-nums in ' + file);
  }
});
