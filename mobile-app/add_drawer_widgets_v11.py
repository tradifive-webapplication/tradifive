import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the double style attribute
content = content.replace(
    "style={[{ backgroundColor: true ? '#1A1A1C' : '#FFFFFF' },\n              style={{",
    "style={{\n                backgroundColor: true ? '#1A1A1C' : '#FFFFFF',"
)
content = content.replace(
    "style={[{ backgroundColor: true ? '#252528' : '#F4F4F4' },\n                    style={{",
    "style={{\n                      backgroundColor: true ? '#252528' : '#F4F4F4',"
)

# 2. Fix the Calendar as CalendarIcon, ChevronDown JSX elements
content = content.replace(
    "<Calendar as CalendarIcon, ChevronDown",
    "<ChevronDown"
)

# 3. Fix any missing imports if CalendarIcon or ChevronDown or Flame is missing at top
# We already did replace Flame -> Flame, Calendar as CalendarIcon, ChevronDown but it might have been messed up too.
# Let's check if the import line looks like import { Flame, Calendar as CalendarIcon, ChevronDown, Calendar as CalendarIcon, ChevronDown }
content = re.sub(r"import\s*\{\s*Flame,\s*Calendar\s*as\s*CalendarIcon,\s*ChevronDown,\s*Calendar\s*as\s*CalendarIcon,\s*ChevronDown\s*}\s*from\s*'lucide-react-native';", "import { Flame, Calendar as CalendarIcon, ChevronDown } from 'lucide-react-native';", content)
content = re.sub(r"import\s*\{\s*Flame,\s*Calendar\s*as\s*CalendarIcon,\s*ChevronDown\s*}\s*from\s*'lucide-react-native';", "import { Flame, Calendar as CalendarIcon, ChevronDown } from 'lucide-react-native';", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed syntax errors in profile.tsx")
