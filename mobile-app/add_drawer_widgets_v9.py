import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace LinearGradient with View
content = content.replace("<LinearGradient", "<View")
content = content.replace("</LinearGradient>", "</View>")
content = content.replace("colors={isDarkMode ? ['#141414', '#1A1A1C'] : ['#FAFBFD', '#FFFFFF']}", "style={[{ backgroundColor: isDarkMode ? '#1A1A1C' : '#FFFFFF' },")
content = content.replace("colors={isDarkMode ? ['#252528', '#1A1A1C'] : ['#F4F4F4', '#FFFFFF']}", "style={[{ backgroundColor: isDarkMode ? '#252528' : '#F4F4F4' },")
# Close the array in style tag correctly? Wait, it has `style={{` right after `colors=...`
# Ah, the original code had:
# colors={isDarkMode ? ['#141414', '#1A1A1C'] : ['#FAFBFD', '#FFFFFF']}
# style={{ padding: 24, borderRadius: 24, ... }}
# Let's just remove the `colors={...}` line and prepend `backgroundColor` to the `style` prop!
content = re.sub(
    r"colors=\{isDarkMode \? \['#141414', '#1A1A1C'\] : \['#FAFBFD', '#FFFFFF'\]\}\s*style=\{\{",
    "style={{ backgroundColor: isDarkMode ? '#1A1A1C' : '#FFFFFF',",
    content
)
content = re.sub(
    r"colors=\{isDarkMode \? \['#252528', '#1A1A1C'\] : \['#F4F4F4', '#FFFFFF'\]\}\s*style=\{\{",
    "style={{ backgroundColor: isDarkMode ? '#252528' : '#F4F4F4',",
    content
)
content = content.replace("import { LinearGradient } from 'expo-linear-gradient';\n", "")

# 2. Fix the CalendarIcon and ChevronDown import
if "Calendar as CalendarIcon" not in content and "ChevronDown" not in content:
    content = content.replace("import { Flame", "import { Flame, Calendar as CalendarIcon, ChevronDown")
elif "Calendar as CalendarIcon" not in content:
    content = content.replace("ChevronDown", "Calendar as CalendarIcon, ChevronDown")
elif "ChevronDown" not in content:
    content = content.replace("Calendar as CalendarIcon", "Calendar as CalendarIcon, ChevronDown")

# In case it missed from the last script, I'll forcefully search for 'Flame' and replace the whole block of import from lucide-react-native
content = re.sub(
    r"import \{([^}]+Flame[^}]+)\} from 'lucide-react-native';",
    lambda m: "import {" + m.group(1) + (", Calendar as CalendarIcon" if "Calendar" not in m.group(1) else "") + (", ChevronDown" if "ChevronDown" not in m.group(1) else "") + "} from 'lucide-react-native';",
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed LinearGradient and fixed lucide imports")
