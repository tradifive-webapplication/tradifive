import json
import os
import re

log_path = r"c:\Users\nikil\.gemini\antigravity-ide\brain\17663672-bd96-4dea-9a29-d254653ab606\.system_generated\logs\transcript.jsonl"
out_dir = r"c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app"

def clean_content(content):
    lines = content.split('\n')
    cleaned_lines = []
    start_parsing = False
    for line in lines:
        if line.startswith('1: '):
            start_parsing = True
        
        if start_parsing:
            match = re.match(r'^\d+:\s(.*)$', line)
            if match:
                cleaned_lines.append(match.group(1))
            else:
                if 'The above content does NOT show the entire file' in line:
                    break
                if re.match(r'^\d+:$', line):
                    cleaned_lines.append('')
    return '\n'.join(cleaned_lines)

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'TOOL_RESPONSE' and data.get('content'):
                content = data['content']
                if 'File Path: `file:///c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/login.tsx`' in content:
                    print("Found login.tsx output chunk!")
                    extracted = clean_content(content)
                    if len(extracted) > 100:
                        with open("login_recovered.tsx", "w", encoding="utf-8") as out:
                            out.write(extracted)
                if 'File Path: `file:///c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/signup.tsx`' in content:
                    print("Found signup.tsx output chunk!")
                    extracted = clean_content(content)
                    if len(extracted) > 100:
                        with open("signup_recovered.tsx", "w", encoding="utf-8") as out:
                            out.write(extracted)
        except Exception as e:
            pass
