import re

with open('app/(tabs)/_layout.tsx', 'r') as f:
    content = f.read()

# Replace imports
import_str = "import { Home, Search, Category as LayoutGrid, User, User as Users, Chat as MessageCircle, Setting as SettingsIcon, Ticket as Gift, Game as Trophy, ShieldDone as ShieldCheck, Document as BookOpen } from '../../components/Iconly';"

# Remove them from lucide import
lucide_remove = ['Home,', 'Search,', 'LayoutGrid,', 'Users,', 'MessageCircle,', 'Settings as SettingsIcon,', 'Gift,', 'Trophy,', 'ShieldCheck,', 'BookOpen,', 'User,']
for rem in lucide_remove:
    content = content.replace(f"  {rem}\n", "")

# Insert Iconly import after lucide
content = content.replace("from 'lucide-react-native';", f"from 'lucide-react-native';\n{import_str}")

with open('app/(tabs)/_layout.tsx', 'w') as f:
    f.write(content)
