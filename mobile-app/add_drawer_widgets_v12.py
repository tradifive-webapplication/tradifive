import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("\n, ChevronDown} from 'lucide-react-native';", "\n  ChevronDown\n} from 'lucide-react-native';")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed line 59 in profile.tsx")
