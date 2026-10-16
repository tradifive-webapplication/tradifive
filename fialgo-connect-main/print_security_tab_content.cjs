const fs = require('fs');

const data = JSON.parse(fs.readFileSync('candidate_83.json', 'utf8'));
const content = data.content;
const idx = content.indexOf('id: "security"');
if (idx !== -1) {
    console.log('Found "id: \\"security\\"" at index ' + idx);
    console.log(content.substring(idx - 100, idx + 1500));
} else {
    console.log('Not found');
}
