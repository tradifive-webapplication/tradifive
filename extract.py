import json
import re

matches = []
with open(r'C:\Users\nikil\.gemini\antigravity\brain\a90080c4-3b7f-4784-8d6a-3d14f070d608\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        if 'The above content shows the entire, complete file contents of the requested file.' in line and 'src/components/AppSidebar.tsx' in line and '"type":"VIEW_FILE"' in line:
            matches.append(line)

if matches:
    text = json.loads(matches[-1])['content']
    lines = text.split('\n')
    code_lines = []
    for line in lines:
        m = re.match(r'^\d+:\s(.*)$', line)
        if m:
            code_lines.append(m.group(1))
    
    with open('src/components/AppSidebar.tsx', 'w', encoding='utf-8') as f:
        f.write('\n'.join(code_lines))
    print(f"Restored AppSidebar.tsx with {len(code_lines)} lines")
else:
    print("No matches found")
