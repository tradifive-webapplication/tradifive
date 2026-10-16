const fs = require('fs');
const path = require('path');

const typesPath = path.resolve('src/integrations/supabase/types.ts');
const fileContent = fs.readFileSync(typesPath, 'utf8');

function printTableFields(tableName) {
  const regex = new RegExp(`${tableName}\\s*:\\s*\\{\\s*Row\\s*:\\s*\\{([^}]+)\\}`);
  const match = fileContent.match(regex);
  if (match) {
    console.log(`\nFields for ${tableName}:`);
    console.log(match[1].trim());
  } else {
    // Try wider match
    const startIndex = fileContent.indexOf(`${tableName}: {`);
    if (startIndex !== -1) {
      let openBraces = 0;
      let endIndex = -1;
      for (let i = startIndex; i < fileContent.length; i++) {
        if (fileContent[i] === '{') openBraces++;
        if (fileContent[i] === '}') {
          openBraces--;
          if (openBraces === 0) {
            endIndex = i;
            break;
          }
        }
      }
      if (endIndex !== -1) {
        console.log(`\nDefinition for ${tableName}:`);
        console.log(fileContent.substring(startIndex, endIndex + 1));
      }
    }
  }
}

printTableFields('payout_requests');
printTableFields('transactions');
