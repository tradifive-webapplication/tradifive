import json
import re

transcript_path = r"C:\Users\nikil\.gemini\antigravity-ide\brain\898bcc38-32e1-46bc-bc5b-44564346759c\.system_generated\logs\transcript.jsonl"
landing_lines = {}
css_lines = {}

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            step = json.loads(line)
            if step.get('type') == 'VIEW_FILE':
                content = step.get('content', '')
                if 'Showing lines' in content and 'Landing.tsx' in content:
                    for text_line in content.split('\n'):
                        match = re.match(r'^(\d+):\s(.*)$', text_line)
                        if match:
                            line_num = int(match.group(1))
                            if line_num not in landing_lines:
                                landing_lines[line_num] = match.group(2)
                elif 'Showing lines' in content and 'index.css' in content:
                    for text_line in content.split('\n'):
                        match = re.match(r'^(\d+):\s(.*)$', text_line)
                        if match:
                            line_num = int(match.group(1))
                            if line_num not in css_lines:
                                css_lines[line_num] = match.group(2)
        except Exception as e:
            pass

if landing_lines:
    max_line = max(landing_lines.keys())
    print("Found Landing.tsx lines up to:", max_line)
    missing = [i for i in range(1, max_line + 1) if i not in landing_lines]
    if missing:
        print("Missing Landing lines:", missing[:10], "...", len(missing), "total missing")
    else:
        with open('src/pages/Landing.tsx', 'w', encoding='utf-8') as out:
            for i in range(1, max_line + 1):
                out.write(landing_lines[i] + '\n')
        print("Restored Landing.tsx")

if css_lines:
    max_line = max(css_lines.keys())
    print("Found index.css lines up to:", max_line)
    missing = [i for i in range(1, max_line + 1) if i not in css_lines]
    if missing:
        print("Missing css lines:", missing[:10])
    else:
        with open('src/index.css', 'w', encoding='utf-8') as out:
            for i in range(1, max_line + 1):
                out.write(css_lines[i] + '\n')
        print("Restored index.css")
