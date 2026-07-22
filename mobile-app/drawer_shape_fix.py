import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Modify the Trigger Handle
trigger_start = content.find('{/* Side Handle Trigger (Instagram style) */}')
if trigger_start != -1:
    trigger_end = content.find('</Animated.View>', trigger_start) + len('</Animated.View>')
    trigger_jsx = content[trigger_start:trigger_end]
    
    # We want to replace the style object completely to match the image
    # Current style might have:
    # width: 48, height: 48, backgroundColor: '#0f172a', borderWidth: 2, borderColor: '#6366f1', borderRadius: 24, top: 280, right: -12, ...
    
    # Find the style object inside the Animated.View
    style_start = trigger_jsx.find('style={{') + len('style={{')
    style_end = trigger_jsx.find('}}', style_start)
    
    new_style = """
                position: 'absolute',
                right: 0,
                top: 250,
                width: 56,
                height: 110,
                backgroundColor: '#1e293b',
                borderTopLeftRadius: 40,
                borderBottomLeftRadius: 40,
                justifyContent: 'center',
                alignItems: 'flex-start',
                paddingLeft: 16,
                shadowColor: '#000',
                shadowOffset: { width: -2, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 10,
                zIndex: 9000,
              """
    
    trigger_jsx = trigger_jsx[:style_start] + new_style + trigger_jsx[style_end:]
    
    # Replace in content
    content = content[:trigger_start] + trigger_jsx + content[trigger_end:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Trigger handle updated to match the image style.")
else:
    print("Error: Could not find Trigger Handle.")
