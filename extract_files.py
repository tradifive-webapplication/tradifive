import json
import os

log_path = r"c:\Users\nikil\.gemini\antigravity-ide\brain\17663672-bd96-4dea-9a29-d254653ab606\.system_generated\logs\transcript.jsonl"
out_dir = r"c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app"

login_found = False
signup_found = False

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'TOOL_RESPONSE' and data.get('content'):
                content = data['content']
                if 'File Path: `file:///c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/login.tsx`' in content:
                    print("Found login.tsx!")
                    with open("extracted_login.txt", "w", encoding='utf-8') as out_f:
                        out_f.write(content)
                if 'File Path: `file:///c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/app/signup.tsx`' in content:
                    print("Found signup.tsx!")
                    with open("extracted_signup.txt", "w", encoding='utf-8') as out_f:
                        out_f.write(content)
        except Exception as e:
            pass
