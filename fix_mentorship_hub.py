# -*- coding: utf-8 -*-
import sys
import re

path = 'src/pages/MentorshipHub.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { useAuth } from '@/contexts/AuthContext';", "")
content = content.replace("const { user } = useAuth();", "const [user, setUser] = useState<any>(null);\n\n    useEffect(() => {\n      supabase.auth.getUser().then(({ data }) => setUser(data.user));\n    }, []);")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
