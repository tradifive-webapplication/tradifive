import re

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix imports
if 'TextInput' not in text:
    text = text.replace("import { View, Text, StyleSheet", "import { View, Text, StyleSheet, TextInput, PanResponder")
elif 'import { View, Text, StyleSheet, TextInput, PanResponder' not in text:
    # Maybe it was already there but TextInput isn't?
    text = re.sub(r'import \{ (.*?) \} from \'react-native\';', lambda m: f'import {{ {m.group(1)}{", TextInput" if "TextInput" not in m.group(1) else ""}{", PanResponder" if "PanResponder" not in m.group(1) else ""} }} from \'react-native\';', text)

# Fix all DropdownButtons
def fix_dropdown(m):
    # m.group(0) is the full match, e.g. <DropdownButton value="Pause trading" onPress={() => {}} />
    # We want to replace onPress with onSelect={() => {}} and add options={['mock1', 'mock2']}
    val = m.group(1)
    return f'<DropdownButton value={{{val}}} options={{[{val}, "Option 2"]}} onSelect={{() => {{}}}} />'

# Find all remaining DropdownButtons with onPress
text = re.sub(r'<DropdownButton\s+value="([^"]+)"\s+onPress=\{.*?\}\s*/>', lambda m: f'<DropdownButton value="{m.group(1)}" options={{["{m.group(1)}", "Option B"]}} onSelect={{() => {{}}}} />', text)
text = re.sub(r'<DropdownButton\s+value=\{([^}]+)\}\s+onPress=\{.*?\}\s*/>', lambda m: f'<DropdownButton value={{{m.group(1)}}} options={{[{m.group(1)}, "Option B"]}} onSelect={{() => {{}}}} />', text)

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

