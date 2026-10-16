const fs = require('fs');
const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('mobile-app/app/profile-information.tsx', 'utf-8');

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

traverse(ast, {
  JSXText(path) {
    const text = path.node.value;
    if (text.trim().length > 0) {
      console.log(`Found JSXText at line ${path.node.loc.start.line}: "${text}"`);
      // check if parent is Text or not
      const parentName = path.parent.openingElement?.name?.name;
      if (parentName && parentName !== 'Text') {
         console.log(`  WARNING: Parent is ${parentName}`);
      }
    }
  },
  JSXExpressionContainer(path) {
    const parentName = path.parent.openingElement?.name?.name;
    if (parentName && parentName !== 'Text') {
      if (path.node.expression.type === 'StringLiteral') {
         console.log(`Found loose string expression at line ${path.node.loc.start.line}: "${path.node.expression.value}" inside ${parentName}`);
      }
    }
  }
});
