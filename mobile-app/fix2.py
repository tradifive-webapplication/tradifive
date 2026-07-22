import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add missing </Animated.View>
# We know the error is at the end of the profileDetails section
content = content.replace('''          {/* Side Handle Trigger (Instagram style) */}
          {!isDrawerOpen && (''', '''          </Animated.View>

          {/* Side Handle Trigger (Instagram style) */}
          {!isDrawerOpen && (''')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed')
