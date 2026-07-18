# -*- coding: utf-8 -*-
import sys
import re

path = 'src/pages/Referrals.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all relevant string literals and values
content = content.replace('xp: 5000,', 'xp: 500,')
content = content.replace('reward: "5,000 XP Boost",', 'reward: "500 XP Boost",')
content = content.replace('value="5,000"', 'value="500"')
content = content.replace('5,000 XP instantly', '500 XP instantly')
content = content.replace('xp: "5,000 XP"', 'xp: "500 XP"')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
