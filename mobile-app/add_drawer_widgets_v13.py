import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("  ChevronDown\n} from 'lucide-react-native';", "  ChevronDown,\n  Calendar as CalendarIcon\n} from 'lucide-react-native';")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added CalendarIcon back to imports")
