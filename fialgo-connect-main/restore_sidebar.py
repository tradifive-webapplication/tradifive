import json
import re

text = json.loads(open('latest_appsidebar_json.txt', 'r', encoding='utf-8').read())['content']
lines = text.split('\n')
code_lines = []

for line in lines:
    m = re.match(r'^\d+:\s(.*)$', line)
    if m:
        code_lines.append(m.group(1))

open('src/components/AppSidebar.tsx', 'w', encoding='utf-8').write('\n'.join(code_lines))
