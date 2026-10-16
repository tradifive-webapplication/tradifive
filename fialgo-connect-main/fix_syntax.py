import re

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix DropdownButton extra junk
bad_str = """} style={{ backgroundColor: isDark ? '#141414' : '#f8fafc', borderWidth: 1, borderColor: isDark ? '#222' : '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>{value}</Text>
      <Text style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>▼</Text>
    </TouchableOpacity>
  );
}"""
text = text.replace(bad_str, "")

# Fix Max Lot extra junk
bad_str2 = """
                      <TouchableOpacity onPress={() => setMaxLot(Math.min(10.0, maxLot + 0.1))} style={styles.plusMinusBtn}>
                        <Plus size={16} color={isDark ? '#fff' : '#000'} />
                      </TouchableOpacity>
                    </View>"""
text = text.replace(bad_str2, "")

# Fix the fact that No Averaging Down didn't get replaced properly
# I noticed line 434 still has `DropdownButton value="Strict Block" onPress={() => {}} />`
# which means my previous regex for No Averaging Down failed because it didn't match.
no_avg_regex = r'<View>\s*<Text[^>]*>MODE</Text>\s*<DropdownButton[^>]*/>\s*</View>\s*<View>\s*<Text[^>]*>SCOPE</Text>\s*<DropdownButton[^>]*/>\s*</View>'
no_avg_str = """                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>MODE</Text>
                      <DropdownButton value="Strict Block" options={['Strict Block', 'Warning Only']} onSelect={() => {}} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>SCOPE</Text>
                      <DropdownButton value="Same Symbol + Direction" options={['Same Symbol + Direction', 'Same Symbol', 'Global Account']} onSelect={() => {}} />
                    </View>"""
text = re.sub(no_avg_regex, no_avg_str, text, flags=re.DOTALL)


with open('mobile-app/app/(tabs)/risk-guard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

