import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find Drawer Trigger and Drawer JSX
start_trigger = content.find('{/* Side Handle Trigger (Instagram style) */}')
if start_trigger != -1:
    drawer_end = content.find('</Animated.View>', content.find('</ScrollView>', start_trigger)) + len('</Animated.View>')
    drawer_jsx = content[start_trigger:drawer_end]
    
    # Remove from current location (inside profileDetails)
    content = content[:start_trigger] + content[drawer_end:]
    
    # Clean up any leftover empty lines
    content = content.replace('pointerEvents={isDrawerOpen ? \'none\' : \'auto\'}>\n\n\n      </Animated.View>', 'pointerEvents={isDrawerOpen ? \'none\' : \'auto\'}>\n      </Animated.View>')
    
    # Modify Drawer JSX to fix top alignment to 168 (cover image 200 - margin 32)
    # The current Drawer JSX has `top: 0,\n              bottom: -height,`
    drawer_jsx = re.sub(r'top:\s*0,\s*bottom:\s*-height,', "top: 168,\n              bottom: 0,", drawer_jsx)
    
    # The current Trigger has `top: 60,` (relative to card). Make it absolute to screen: `top: 168 + 60 = 228`
    drawer_jsx = drawer_jsx.replace("top: 60,", "top: 228,")
    
    # Insert Drawer JSX before {/* PINTEREST-STYLE MENU OVERLAY */}
    pinterest_idx = content.find('{/* PINTEREST-STYLE MENU OVERLAY */}')
    if pinterest_idx != -1:
        content = content[:pinterest_idx] + drawer_jsx + '\n\n      ' + content[pinterest_idx:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success: Drawer moved OUTSIDE scrollview and top aligned to 168.")
    else:
        print("Error: Could not find Pinterest Overlay.")
else:
    print("Error: Could not find Drawer Trigger.")
