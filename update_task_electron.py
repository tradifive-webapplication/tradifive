import sys

path = 'C:\\Users\\nikil\\.gemini\\antigravity-ide\\brain\\e64c6649-9725-4fec-a577-a5f9f125e04f\\task.md'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('- [ ] Install', '- [x] Install')
content = content.replace('- [ ] Create electron/main.ts', '- [x] Create electron/main.ts')
content = content.replace('- [ ] Update ite.config.ts', '- [x] Update ite.config.ts')
content = content.replace('- [ ] Update package.json', '- [x] Update package.json')
content = content.replace('- [ ] Test the desktop window', '- [x] Test the desktop window')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
