import re

with open('app/(tabs)/risk-guard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace DropdownButton implementation with one using Modal
new_dropdown = '''import { Modal, FlatList, TouchableWithoutFeedback } from 'react-native';

function DropdownButton({ value, options, onSelect }: { value: string, options?: string[], onSelect?: (val: string) => void }) {
  const { isDark } = useAppTheme();
  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        style={{ backgroundColor: isDark ? '#141414' : '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#2c2c2e' : '#e2e8f0' }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>{value}</Text>
          <ChevronDown size={14} color="#64748b" />
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: isDark ? '#1a1a1e' : '#ffffff', width: '80%', borderRadius: 12, maxHeight: '60%', padding: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 }}>
                <FlatList
                  data={options || []}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{ paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#2c2c2e' : '#f1f5f9' }}
                      onPress={() => {
                        if (onSelect) onSelect(item);
                        setModalVisible(false);
                      }}
                    >
                      <Text style={{ fontSize: 15, fontFamily: 'Inter_600SemiBold', color: isDark ? '#fff' : '#0f172a' }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}'''

old_dropdown_regex = re.compile(r'function DropdownButton.*?\n\}', re.DOTALL)
text = old_dropdown_regex.sub(new_dropdown, text, count=1)

# Ensure Modal, FlatList, TouchableWithoutFeedback are imported
if 'FlatList' not in text:
    text = text.replace('import { View', 'import { View, Modal, FlatList, TouchableWithoutFeedback')

with open('app/(tabs)/risk-guard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
