import json
import os
import re

log_path = r"c:\Users\nikil\.gemini\antigravity-ide\brain\17663672-bd96-4dea-9a29-d254653ab606\.system_generated\logs\transcript.jsonl"
out_dir = r"c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app"

def clean_content(content):
    # Remove the <line_number>: prefix
    lines = content.split('\n')
    cleaned_lines = []
    start_parsing = False
    for line in lines:
        if line.startswith('1: '):
            start_parsing = True
        
        if start_parsing:
            # Match number: space
            match = re.match(r'^\d+:\s(.*)$', line)
            if match:
                cleaned_lines.append(match.group(1))
            else:
                if 'The above content does NOT show the entire file' in line:
                    break
                # some lines might be empty or wrapped? usually view_file gives perfect lines
                if re.match(r'^\d+:$', line):
                    cleaned_lines.append('')
    return '\n'.join(cleaned_lines)

login_content = ""
signup_content = ""

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'TOOL_RESPONSE' and data.get('content'):
                content = data['content']
                if 'login.tsx' in content and 'Total Lines: 324' in content:
                    login_content += clean_content(content) + "\n"
                if 'signup.tsx' in content and 'Total Lines: 390' in content:
                    signup_content += clean_content(content) + "\n"
        except Exception as e:
            pass

if login_content:
    with open(os.path.join(out_dir, "login.tsx"), "w", encoding='utf-8') as f:
        f.write(login_content)
    print("login.tsx recovered")
if signup_content:
    with open(os.path.join(out_dir, "signup.tsx"), "w", encoding='utf-8') as f:
        f.write(signup_content)
    print("signup.tsx recovered")

