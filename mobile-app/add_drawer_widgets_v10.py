import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove useColorScheme import
content = content.replace("import { useColorScheme } from 'react-native';\n", "")

# Remove colorScheme definition
content = content.replace("  const colorScheme = useColorScheme();\n  const isDarkMode = colorScheme === 'dark';", "")

# Replace isDarkMode with true in my injected widget code
content = content.replace("isDarkMode ?", "true ?")
content = content.replace("!isDarkMode ?", "false ?")
content = content.replace("isDarkMode", "true")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed useColorScheme and hardcoded isDarkMode to true")
