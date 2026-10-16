import re

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace opening
text = re.sub(r'(\{renderCardContent\([a-zA-Z0-9_]+,\s*\()', r'\1<>', text)

# Replace closing
text = re.sub(r'\)(,\s*\d+)?\)\}', r'</>)\1)}', text)

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed JSX fragments.")
