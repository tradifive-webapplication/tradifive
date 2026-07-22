import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the const bestStreak = 15;
content = content.replace("  const bestStreak = 15;\n", "")

# 2. Add imports
if "LinearGradient" not in content[:1000]:
    content = content.replace("import { View, Text", "import { LinearGradient } from 'expo-linear-gradient';\nimport { useColorScheme } from 'react-native';\nimport { View, Text")

# 3. Add isDarkMode inside ProfileScreen
if "const isDarkMode =" not in content:
    content = content.replace(
        "export default function ProfileScreen() {",
        "export default function ProfileScreen() {\n  const colorScheme = useColorScheme();\n  const isDarkMode = colorScheme === 'dark';"
    )

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied final fixes to profile.tsx")
