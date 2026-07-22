import re

with open('app/(tabs)/home.tsx', 'r') as f:
    content = f.read()

# Replace imports
import_str = "import { Home, Search, Category as LayoutGrid, User, User as Users, Chat as MessageCircle, Setting as Settings, Ticket as Gift, Game as Trophy, ShieldDone as ShieldCheck, Document as BookOpen } from '../../components/Iconly';"

# Remove them from lucide import
lucide_remove = ['Home,', 'Search,', 'LayoutGrid,', 'Users,', 'MessageCircle,', 'Settings,', 'Gift,', 'Trophy,', 'ShieldCheck,', 'BookOpen,']
for rem in lucide_remove:
    content = content.replace(f"  {rem}\n", "")

# Insert Iconly import after lucide
content = content.replace("from 'lucide-react-native';", f"from 'lucide-react-native';\n{import_str}")

with open('app/(tabs)/home.tsx', 'w') as f:
    f.write(content)
