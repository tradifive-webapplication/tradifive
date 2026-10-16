import json
import re

transcript_path = r"C:\Users\nikil\.gemini\antigravity-ide\brain\898bcc38-32e1-46bc-bc5b-44564346759c\.system_generated\logs\transcript.jsonl"
landing_lines = {}

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
        except Exception as e:
            pass

print("Lines available around Hero (900-1150):", sum(1 for i in range(900, 1150) if i in landing_lines))
print("Lines available around AppShowcase (1800-2050):", sum(1 for i in range(1800, 2050) if i in landing_lines))
print("Lines available around CommunityNetwork (2150-2400):", sum(1 for i in range(2150, 2400) if i in landing_lines))
