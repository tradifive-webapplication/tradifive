import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Drawer animations and add Haptics to closeDrawer
anim_pattern = re.compile(r'tension: 65,\s*friction: 11')
content = anim_pattern.sub('tension: 40, friction: 8', content)

# 2. Add Haptics to closeDrawer
close_drawer_pattern = re.compile(r'(const closeDrawer = \(\) => \{\s*Keyboard\.dismiss\(\);)')
content = close_drawer_pattern.sub(r'\1\n    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);', content)

# 3. Extract the Drawer JSX
start_trigger = content.find('{/* Side Handle Trigger (Instagram style) */}')
# Find the end of the drawer's Animated.View
# It has a ScrollView inside, then </ScrollView>, then </Animated.View>
scrollview_end = content.find('</ScrollView>', start_trigger)
drawer_end = content.find('</Animated.View>', scrollview_end) + len('</Animated.View>')

drawer_jsx_raw = content[start_trigger:drawer_end]

# 4. Remove drawer_jsx_raw from its current place
content = content[:start_trigger] + content[drawer_end:]

# 5. Modify drawer_jsx
drawer_jsx = drawer_jsx_raw

# Modify Trigger Handle
# Change width: 32 -> width: 24
drawer_jsx = drawer_jsx.replace('width: 32,', 'width: 24,')
# Change height: 80 -> height: 48
drawer_jsx = drawer_jsx.replace('height: 80,', 'height: 48,')
# Change borderTopLeftRadius: 16 -> borderTopLeftRadius: 24
drawer_jsx = drawer_jsx.replace('borderTopLeftRadius: 16,', 'borderTopLeftRadius: 24,')
# Change borderBottomLeftRadius: 16 -> borderBottomLeftRadius: 24
drawer_jsx = drawer_jsx.replace('borderBottomLeftRadius: 16,', 'borderBottomLeftRadius: 24,')
# Change top: 40 -> top: height * 0.3
drawer_jsx = drawer_jsx.replace("top: 40,", "top: height * 0.3,")

# Modify Drawer Container
# Change top: 0 to top: 176
drawer_jsx = re.sub(r"top:\s*0,\s*bottom:\s*0,", "top: 176,\n              bottom: 0,", drawer_jsx)

# Replace horizontal handle with vertical handle
drawer_jsx = drawer_jsx.replace(
    "<View style={{ width: 4, height: 40, backgroundColor: '#cbd5e1', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 }} />",
    "{/* Vertical Drag Handle */}\n            <View style={{ position: 'absolute', left: 6, top: '45%', width: 4, height: 40, backgroundColor: '#cbd5e1', borderRadius: 2 }} />"
)

# 6. Insert modified drawer_jsx right before {/* PINTEREST-STYLE MENU OVERLAY */}
pinterest_idx = content.find('{/* PINTEREST-STYLE MENU OVERLAY */}')
if pinterest_idx != -1:
    content = content[:pinterest_idx] + drawer_jsx + '\n\n      ' + content[pinterest_idx:]
else:
    print("Could not find Pinterest Overlay!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied drawer fix.")
