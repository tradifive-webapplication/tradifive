import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. LinearGradient
if "import { LinearGradient } from 'expo-linear-gradient';" not in content:
    content = content.replace("import React, { useState, useRef, useEffect } from 'react';", "import React, { useState, useRef, useEffect } from 'react';\nimport { LinearGradient } from 'expo-linear-gradient';")

# 2. useColorScheme
if "import { useColorScheme } from 'react-native';" not in content:
    content = content.replace("import { LinearGradient } from 'expo-linear-gradient';", "import { LinearGradient } from 'expo-linear-gradient';\nimport { useColorScheme } from 'react-native';")

# 3. CalendarIcon and ChevronDown from lucide-react-native
if "Calendar as CalendarIcon" not in content:
    content = content.replace("import { Flame", "import { Flame, Calendar as CalendarIcon, ChevronDown")
elif "ChevronDown" not in content:
    content = content.replace("Calendar as CalendarIcon", "Calendar as CalendarIcon, ChevronDown")

# 4. isDarkMode inside ProfileScreen
if "const isDarkMode = colorScheme ===" not in content:
    content = content.replace(
        "export default function ProfileScreen() {",
        "export default function ProfileScreen() {\n  const colorScheme = useColorScheme();\n  const isDarkMode = colorScheme === 'dark';"
    )

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied imports and isDarkMode fix to profile.tsx")
