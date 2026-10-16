import re

with open('src/pages/RiskGuard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

if 'Connected Account' not in content:
    print('Connected Account is totally missing!')
else:
    print('Connected Account is present!')
