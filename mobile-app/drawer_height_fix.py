import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract the Drawer
start_trigger = content.find('{/* Side Handle Trigger (Instagram style) */}')
if start_trigger != -1:
    drawer_end = content.find('</Animated.View>', content.find('</ScrollView>', start_trigger)) + len('</Animated.View>')
    drawer_jsx = content[start_trigger:drawer_end]
    
    # Remove from current location
    content = content[:start_trigger] + content[drawer_end:]
    
    # 2. Modify Drawer JSX to fix top alignment and height
    # Change top: 176, \n bottom: 0, to top: 0, \n height: height,
    # Also fix the top: height * 0.3 for the trigger
    
    drawer_jsx = re.sub(r'top:\s*176,\s*bottom:\s*0,', "top: 0,\n              bottom: -height,", drawer_jsx)
    
    # Trigger handle needs to be relative to the card. Since the card is tall, top: 40 is fine.
    drawer_jsx = drawer_jsx.replace("top: height * 0.3,", "top: 60,")
    
    # 3. Find the end of the profileDetails container to insert it
    # The profile details is wrapped in a `<View style={{ position: 'relative', marginTop: -32, marginBottom: 10 }}>`
    # and ends with `pointerEvents={isDrawerOpen ? 'none' : 'auto'}>` ... `</Animated.View>`
    # We want to insert right after that `</Animated.View>`
    
    profile_details_marker = "pointerEvents={isDrawerOpen ? 'none' : 'auto'}>"
    marker_pos = content.find(profile_details_marker)
    if marker_pos != -1:
        # Find the closing </Animated.View> for this View
        closing_tag_pos = content.find('</Animated.View>', marker_pos)
        insert_pos = closing_tag_pos + len('</Animated.View>')
        
        content = content[:insert_pos] + '\n\n' + drawer_jsx + content[insert_pos:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Success: Drawer moved inside relative container with bottom: -height")
    else:
        print("Error: Could not find profile details container")
else:
    print("Error: Could not find drawer")
