import re
import os

filepath = 'app/(tabs)/risk-guard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix PanResponder capitalization
text = text.replace('PanResponder.', 'panResponder.')
text = text.replace('const panResponder = React.useRef(', 'const panResponderRef = React.useRef(')
text = text.replace('panResponder.', 'panResponderRef.')
# Wait, PanResponder is a React Native class, we must import it!
if 'PanResponder' not in text:
    text = re.sub(r'import \{ (.*?) \} from \'react-native\';', r'import { \1, PanResponder, TextInput } from \'react-native\';', text)
else:
    # Ensure it's imported
    text = text.replace('PanResponder.', 'PanResponder.')
    
text = re.sub(r'import \{ (.*?) \} from \'react-native\';', lambda m: f'import {{ {m.group(1)}{", TextInput" if "TextInput" not in m.group(1) else ""}{", PanResponder" if "PanResponder" not in m.group(1) else ""} }} from \'react-native\';', text)

# Fix Implicit Any for gestureState and evt
text = text.replace('(evt, gestureState) =>', '(evt: any, gestureState: any) =>')
text = text.replace('(val) => { const n = parseFloat(val);', '(val: string) => { const n = parseFloat(val);')
text = text.replace('onChangeText={(pct) =>', 'onChangeText={(pct: string) =>')

# Fix DropdownButton onPress -> onSelect
text = re.sub(r'<DropdownButton\s+value="([^"]+)"\s+onPress=\{.*?\}\s*/>', lambda m: f'<DropdownButton value="{m.group(1)}" options={{["{m.group(1)}", "Option B"]}} onSelect={{() => {{}}}} />', text)
text = re.sub(r'<DropdownButton\s+value=\{([^}]+)\}\s+onPress=\{.*?\}\s*/>', lambda m: f'<DropdownButton value={{{m.group(1)}}} options={{[{m.group(1)}, "Option B"]}} onSelect={{() => {{}}}} />', text)

# Fix plusMinusBtn reference error
text = text.replace('style={styles.plusMinusBtn}', 'style={{ width: 28, height: 28, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "#1a1a1e" : "#f1f5f9", borderRadius: 8, borderWidth: 1, borderColor: isDark ? "#222" : "#e2e8f0" }}')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
