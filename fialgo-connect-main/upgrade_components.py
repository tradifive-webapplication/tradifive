import re

def rewrite_risk_guard():
    with open('mobile-app/app/(tabs)/risk-guard.tsx', 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Add PanResponder and TextInput to imports if missing
    if 'PanResponder' not in text:
        text = text.replace('import { View, Text, StyleSheet', 'import { View, Text, StyleSheet, PanResponder, TextInput')
    
    # 2. Replace CustomSlider with an interactive version
    slider_code = """
function CustomSlider({ label, valuePct, valueText, color = '#6366f1', onValueChange }: { label: string, valuePct: number, valueText: string, color?: string, onValueChange?: (pct: number) => void }) {
  const { isDark } = useAppTheme();
  
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // approximate width is screen width minus padding, let's say 300
        const newPct = Math.min(100, Math.max(0, valuePct + (gestureState.dx / 300) * 100));
        if (onValueChange) onValueChange(newPct);
      },
    })
  ).current;

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 10, fontFamily: 'Inter_700Bold', color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</Text>
        <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: isDark ? '#e8e8e8' : '#0f172a' }}>{valueText}</Text>
      </View>
      <View style={{ height: 30, justifyContent: 'center' }} {...panResponder.panHandlers}>
        <View style={{ height: 4, backgroundColor: isDark ? '#2a2a2e' : '#e2e8f0', borderRadius: 2, width: '100%', position: 'absolute' }} />
        <View style={{ height: 4, backgroundColor: color, borderRadius: 2, width: `${Math.min(100, Math.max(0, valuePct))}%`, position: 'absolute', pointerEvents: 'none' }} />
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: color, left: `${Math.min(100, Math.max(0, valuePct))}%`, marginLeft: -10, position: 'absolute', pointerEvents: 'none' }} />
      </View>
    </View>
  );
}
"""
    # Replace the old CustomSlider
    text = re.sub(r'function CustomSlider\(\{[^\}]+\}\s*:\s*\{[^\}]+\}\)\s*\{.*?(?=function DropdownButton)', slider_code, text, flags=re.DOTALL)
    
    # 3. Replace DropdownButton with a cyclic option selector
    dropdown_code = """
function DropdownButton({ value, options, onSelect }: { value: string, options?: string[], onSelect?: (val: string) => void }) {
  const { isDark } = useAppTheme();
  return (
    <TouchableOpacity 
      onPress={() => {
        if (options && options.length > 0 && onSelect) {
          const currentIndex = options.indexOf(value);
          const nextIndex = (currentIndex + 1) % options.length;
          onSelect(options[nextIndex]);
        }
      }}
      style={{ backgroundColor: isDark ? '#141414' : '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#2c2c2e' : '#e2e8f0' }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>{value}</Text>
        <ChevronDown size={14} color="#64748b" />
      </View>
    </TouchableOpacity>
  );
}
"""
    text = re.sub(r'function DropdownButton\(\{[^\}]+\}\s*:\s*\{[^\}]+\}\)\s*\{.*?return\s*\(.*?\);\s*\}', dropdown_code, text, flags=re.DOTALL)
    
    # 4. Tab Names
    text = text.replace("{ id: 'trading_control', label: 'Control' }", "{ id: 'trading_control', label: 'Trading Control' }")
    text = text.replace("{ id: 'risk_management', label: 'Risk Mgt' }", "{ id: 'risk_management', label: 'Risk Management' }")
    text = text.replace("{ id: 'behaviour', label: 'Behaviour' }", "{ id: 'behaviour', label: 'Behaviour & Discipline' }")
    
    # 5. Bottom padding for ScrollView
    # Find the main Animated.ScrollView and add paddingBottom: 120
    text = text.replace('contentContainerStyle={{ paddingTop: headerHeight + 16, paddingHorizontal: 16 }}', 'contentContainerStyle={{ paddingTop: headerHeight + 16, paddingHorizontal: 16, paddingBottom: 120 }}')

    with open('mobile-app/app/(tabs)/risk-guard.tsx', 'w', encoding='utf-8') as f:
        f.write(text)

rewrite_risk_guard()
print("Updated basic interactions and layout.")
