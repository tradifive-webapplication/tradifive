import json
import os

log_path = r"c:\Users\nikil\.gemini\antigravity-ide\brain\17663672-bd96-4dea-9a29-d254653ab606\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'TOOL_RESPONSE' and data.get('content'):
                content = data['content']
                if 'login.tsx' in content and 'File Path:' in content:
                    # extract the line containing File Path:
                    for l in content.split('\n'):
                        if 'File Path:' in l:
                            print(l)
                            break
        except Exception as e:
            pass
