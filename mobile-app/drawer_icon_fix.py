import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Eye to lucide-react-native imports
lucide_import_pattern = r"(import\s+\{[^}]*)(Plus)([^}]*\}\s+from\s+'lucide-react-native')"
if not re.search(r"\bEye\b", content[:2000]):
    # if Eye is not already imported, add it
    content = re.sub(lucide_import_pattern, r"\1\2, Eye\3", content)

# 2. Modify the Trigger Handle
trigger_start = content.find('{/* Side Handle Trigger (Instagram style) */}')
if trigger_start != -1:
    trigger_end = content.find('</Animated.View>', trigger_start) + len('</Animated.View>')
    trigger_jsx = content[trigger_start:trigger_end]
    
    # Replace Plus with Eye
    trigger_jsx = trigger_jsx.replace('<Plus size={20} color="#fff" />', '<Eye size={20} color="#fff" />')
    
    # Modify styling: "unique shape" + "make it little down"
    # Change width: 24 -> 48
    trigger_jsx = trigger_jsx.replace('width: 24,', 'width: 48,')
    # Change height: 48 -> 48 (no change)
    # Change borderTopLeftRadius: 24 -> borderRadius: 24
    trigger_jsx = trigger_jsx.replace('borderTopLeftRadius: 24,', 'borderRadius: 24,')
    trigger_jsx = trigger_jsx.replace('borderBottomLeftRadius: 24,', '')
    
    # Make it floating: right: 0 -> right: 12
    trigger_jsx = trigger_jsx.replace('right: 0,', 'right: -12,')
    
    # Change top: 228 -> top: 280
    trigger_jsx = trigger_jsx.replace('top: 228,', 'top: 280,')
    
    # Add a cool border/shadow color
    trigger_jsx = trigger_jsx.replace("backgroundColor: '#0f172a',", "backgroundColor: '#0f172a',\n                borderWidth: 2,\n                borderColor: '#6366f1',")

    # Replace in content
    content = content[:trigger_start] + trigger_jsx + content[trigger_end:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Trigger handle updated with Eye icon, unique shape, and moved down.")
else:
    print("Error: Could not find Trigger Handle.")
