import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix PanResponder to allow scrolling
content = content.replace(
    'onStartShouldSetPanResponder: () => true,',
    'onStartShouldSetPanResponder: () => false,'
)
content = content.replace(
    'onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,',
    'onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),'
)

# 2. Change Drawer Background
# Find the exact drawer definition
drawer_start = content.find('{/* Slide-Out Profile Stats Drawer */}')
drawer_end = content.find('</Animated.View>', drawer_start)

drawer_html = content[drawer_start:drawer_end]
# Swap the colors inside drawer_html
drawer_html = drawer_html.replace("backgroundColor: '#ffffff',", "backgroundColor: '#f8fafc',")
drawer_html = drawer_html.replace("backgroundColor: '#f8fafc'", "backgroundColor: '#ffffff'")

# Also inside the Advanced Performance card there are inner blocks with backgroundColor: '#fff', let's leave them or make them something else?
# Actually `#fff` was already used for the inner small cards: `<View style={{ width: '47%', backgroundColor: '#fff', ... }}>`
# Replacing `#f8fafc` to `#ffffff` is safe because we only want to change the parent card backgrounds.

content = content[:drawer_start] + drawer_html + content[drawer_end:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied drawer scroll and color fix.")
