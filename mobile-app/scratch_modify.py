import re

with open('app/user/[id].tsx', 'r', encoding='utf-8') as f:
    old_id_code = f.read()

# Extract fetchUserData
match = re.search(r'(const fetchUserData = async \(\) => \{.*?\};\n\n    fetchUserData\(\);\n\n    // Real-time subscription for follows.*?return \(\) => \{ supabase\.removeChannel\(sub\); \};\n  \}, \[id\]\);)', old_id_code, re.DOTALL)
fetch_logic = match.group(1) if match else ''

# Extract Follow Logic
follow_logic = '''
  const isFollowing = typeof id === 'string' && followingIds.includes(id);
  const isOwnProfile = currentUser?.id === id;

  const handleFollowToggle = async () => {
    if (typeof id !== 'string') return;
    h();
    if (isFollowing) {
      await unfollowUser(id);
    } else {
      await followUser(id);
    }
  };
'''

with open('app/user/[id].tsx.temp', 'r', encoding='utf-8') as f:
    new_code = f.read()

# Replace the init useEffect with the fetchUserData useEffect
new_code = re.sub(r'useEffect\(\(\) => \{\n    const fetchProfile = async \(\) => \{.*?\}, \[\]\);', 'useEffect(() => {\n    if (!id) {\n      setLoading(false);\n      return;\n    }\n\n    ' + fetch_logic + '\n', new_code, flags=re.DOTALL)

# Insert follow logic
new_code = new_code.replace('const [calendarMonth, setCalendarMonth] = useState(new Date());', 'const [calendarMonth, setCalendarMonth] = useState(new Date());\n\n' + follow_logic)

# Replace the Edit Profile button with Follow button conditionally
edit_btn = '''<TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Pencil size={14} color={isDark ? theme.text : '#0f172a'} />
                  <Text style={{ color: isDark ? theme.text : '#0f172a', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>Edit Profile</Text>
                </TouchableOpacity>'''

follow_btn = '''{!isOwnProfile ? (
                  <TouchableOpacity 
                    onPress={handleFollowToggle}
                    style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: isFollowing ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : '#3b82f6', flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  >
                    {!isFollowing && <Plus size={14} color='#fff' />}
                    <Text style={{ color: isFollowing ? (isDark ? theme.text : '#0f172a') : '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Pencil size={14} color={isDark ? theme.text : '#0f172a'} />
                    <Text style={{ color: isDark ? theme.text : '#0f172a', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>Edit</Text>
                  </TouchableOpacity>
                )}'''

new_code = new_code.replace(edit_btn, follow_btn)

# Handle back button logic
new_code = new_code.replace('</TouchableOpacity>\n\n            <View style={{ flexDirection: \'row\', alignItems: \'center\', gap: 8 }}>', '</TouchableOpacity>\n\n            <View style={{ flexDirection: \'row\', alignItems: \'center\', gap: 8 }}>\n                <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: \'rgba(0,0,0,0.3)\', alignItems: \'center\', justifyContent: \'center\', marginRight: 8, marginLeft: -8 }}>\n                  <ChevronLeft size={24} color="#fff" />\n                </TouchableOpacity>')

with open('app/user/[id].tsx.final', 'w', encoding='utf-8') as f:
    f.write(new_code)
