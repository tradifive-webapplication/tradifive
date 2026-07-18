const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the language tab from the sidebar menu list
content = content.replace(/\s*\{\s*id:\s*"language",\s*label:\s*"Language"\s*\},/g, '');

// 2. Find and remove the JSX block for language
const startToken = '{activeTab === "language" && (';
const endToken = '{activeTab === "trading" && (';

const startIndex = content.indexOf(startToken);
const endIndex = content.indexOf(endToken);

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    const blockToRemove = content.slice(startIndex, endIndex);
    content = content.replace(blockToRemove, '');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully removed language tab.');
} else {
    console.log('Could not find the exact JSX block boundaries.');
}
