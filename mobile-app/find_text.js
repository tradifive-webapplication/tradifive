const fs = require('fs');
const babel = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const files = ['app/profile-information.tsx', 'app/components/UsernameModal.tsx', 'app/verify-email.tsx'];
for (const file of files) {
  try {
    const code = fs.readFileSync(file, 'utf8');
    const ast = babel.parse(code, {sourceType: 'module', plugins: ['jsx', 'typescript']});
    traverse(ast, {
      JSXText(path) {
        if (path.node.value.trim() !== '') {
          let parent = path.parentPath;
          let inText = false;
          while (parent) {
            if (parent.node.type === 'JSXElement') {
              const nameNode = parent.node.openingElement.name;
              let name = '';
              if (nameNode.type === 'JSXIdentifier') {
                name = nameNode.name;
              } else if (nameNode.type === 'JSXMemberExpression') {
                name = nameNode.object.name + '.' + nameNode.property.name;
              }
              if (name === 'Text' || name === 'TextInput' || name === 'Animated.Text' || name === 'TSpan' || name === 'T') {
                inText = true;
                break;
              }
            }
            parent = parent.parentPath;
          }
          if (!inText) {
            console.log(file + ' has raw text at line ' + path.node.loc.start.line + ': ' + JSON.stringify(path.node.value));
          }
        }
      },
      JSXExpressionContainer(path) {
        if (path.node.expression.type === 'StringLiteral' && path.node.expression.value.trim() !== '') {
          let parent = path.parentPath;
          let inText = false;
          while (parent) {
            if (parent.node.type === 'JSXElement') {
              const nameNode = parent.node.openingElement.name;
              let name = '';
              if (nameNode.type === 'JSXIdentifier') {
                name = nameNode.name;
              } else if (nameNode.type === 'JSXMemberExpression') {
                name = nameNode.object.name + '.' + nameNode.property.name;
              }
              if (name === 'Text' || name === 'TextInput' || name === 'Animated.Text') {
                inText = true;
                break;
              }
            }
            parent = parent.parentPath;
          }
          if (!inText) {
             console.log(file + ' has raw expression text at line ' + path.node.loc.start.line + ': ' + JSON.stringify(path.node.expression.value));
          }
        }
      }
    });
  } catch(e) {
    console.log("Error in file", file, e);
  }
}
