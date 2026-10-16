import json
import sys

path = 'package.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

data['main'] = 'dist-electron/main.js'

if 'scripts' not in data:
    data['scripts'] = {}

data['scripts']['dev:electron'] = 'set ELECTRON=true&& vite'
data['scripts']['build:electron'] = 'set ELECTRON=true&& vite build && electron-builder'

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
