import re

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if '<View style={styles.metricCard}>' in line:
        header_line = None
        for j in range(1, 3):
            if i+j < len(lines) and 'renderCardHeader' in lines[i+j]:
                header_line = lines[i+j]
                break
        
        if header_line:
            match = re.search(r'renderCardHeader\([^,]+,\s*"[^"]+",\s*"[^"]+",\s*([^,]+),', header_line)
            if match:
                var_name = match.group(1).strip()
                new_line = line.replace('<View style={styles.metricCard}>', f'<View style={{[styles.metricCard, {var_name} && styles.activeMetricCard]}}>')
                new_lines.append(new_line)
                continue
    
    new_lines.append(line)

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
