import re

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

if 'BlurView' not in text:
    text = text.replace("import { View, Text", "import { BlurView } from 'expo-blur';\nimport { View, Text")

helper = """
  const renderCardContent = (active: boolean, children: any, gap?: number) => (
    <View style={{ position: 'relative', marginTop: 4, minHeight: active ? 80 : 0 }}>
      <View pointerEvents={active ? 'none' : 'auto'} style={{ opacity: active ? 0.3 : 1, gap: gap }}>
        {children}
      </View>
      {active && (
        <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: 12, overflow: 'hidden' }]}>
          <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          <View style={{ alignItems: 'center', padding: 8 }}>
            <Lock size={16} color={isDark ? "#94a3b8" : "#64748b"} style={{ marginBottom: 4 }} />
            <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: isDark ? "#94a3b8" : "#64748b", letterSpacing: 1 }}>PROTOCOL GUARD ACTIVE</Text>
            <Text style={{ fontSize: 9, fontFamily: 'Inter_500Medium', color: isDark ? "#64748b" : "#94a3b8", textAlign: 'center', marginTop: 2 }}>Configuration is locked.</Text>
          </View>
        </View>
      )}
    </View>
  );
"""

if 'renderCardContent' not in text:
    text = text.replace('const renderCardHeader = ', helper + '\n  const renderCardHeader = ')


lines = text.split('\n')
new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    match = re.search(r'<View style=\{\{\s*opacity:\s*([a-zA-Z0-9_]+)\s*\?\s*1\s*:\s*0\.5(?:,\s*gap:\s*(\d+))?\s*\}\}>', line)
    if match:
        state_var = match.group(1)
        gap = match.group(2)
        gap_str = f', {gap}' if gap else ''
        
        # Replace the opening tag
        prefix = line[:match.start()]
        new_lines.append(prefix + f'{{renderCardContent({state_var}, (')
        
        # Now find the matching closing tag
        view_depth = 1
        j = i + 1
        inner_lines = []
        while j < len(lines):
            # very naive view depth counting
            open_views = len(re.findall(r'<View', lines[j]))
            close_views = len(re.findall(r'</View>', lines[j]))
            
            # handle <View ... />
            self_closing = len(re.findall(r'<View[^>]*/>', lines[j]))
            open_views -= self_closing
            
            view_depth += (open_views - close_views)
            
            if view_depth == 0:
                # We found the closing tag
                # Replace it with ), gap_str)}
                closing_prefix = lines[j][:lines[j].find('</View>')]
                closing_suffix = lines[j][lines[j].find('</View>')+7:]
                inner_lines.append(closing_prefix + f'){gap_str})}}' + closing_suffix)
                break
            else:
                inner_lines.append(lines[j])
            j += 1
            
        new_lines.extend(inner_lines)
        i = j
    else:
        new_lines.append(line)
    i += 1

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))
print('Blur overlay added to all cards.')
