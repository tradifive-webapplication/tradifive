import json
import os
import re

log_path = r"c:\Users\nikil\.gemini\antigravity-ide\brain\17663672-bd96-4dea-9a29-d254653ab606\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'TOOL_RESPONSE' and data.get('content'):
                content = data['content']
                if 'login.tsx' in content and 'import { View, Text, TextInput' in content:
                    with open("login_dump.txt", "w", encoding="utf-8") as out:
                        out.write(content)
                    print("Dumped a match to login_dump.txt")
                    break
        except Exception as e:
            pass
