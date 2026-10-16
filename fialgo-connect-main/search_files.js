import fs from 'fs';
import path from 'path';

const searchDir = "c:\\Users\\nikil\\Downloads\\fialgo-connect-main\\fialgo-connect-main";
const query = "exec_sql";

const queries = ["postgres://", "service_role"];

function search(dir) {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    return;
  }
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === '.vercel' || file === '.claude') {
      continue;
    }
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch (e) {
      continue;
    }
    if (stat.isDirectory()) {
      search(fullPath);
    } else {
      if (file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.sql') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json') || file.endsWith('.toml') || file.endsWith('.env')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const query of queries) {
            if (content.toLowerCase().includes(query.toLowerCase())) {
              console.log(`Found "${query}" in: ${fullPath}`);
            }
          }
        } catch (e) {}
      }
    }
  }
}

search(searchDir);
