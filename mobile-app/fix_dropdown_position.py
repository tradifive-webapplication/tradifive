import re

with open('app/(tabs)/risk-guard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# I will replace the DropdownButton component completely.
new_dropdown = '''import { Modal, FlatList, TouchableWithoutFeedback, Dimensions } from 'react-native';

function DropdownButton({ value, options, onSelect }: { value: string, options?: string[], onSelect?: (val: string) => void }) {
  const { isDark } = useAppTheme();
  const [modalVisible, setModalVisible] = React.useState(false);
  const buttonRef = React.useRef<View>(null);
  const [dropdownCoords, setDropdownCoords] = React.useState({ x: 0, y: 0, width: 0, height: 0 });

  const openDropdown = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((fx, fy, width, height, px, py) => {
        setDropdownCoords({ x: px, y: py, width, height });
        setModalVisible(true);
      });
    }
  };

  return (
    <>
      <TouchableOpacity 
        ref={buttonRef}
        onPress={openDropdown}
        style={{ backgroundColor: isDark ? '#141414' : '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#2c2c2e' : '#e2e8f0' }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>{value}</Text>
          <ChevronDown size={14} color="#64748b" />
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="none">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={{ flex: 1 }}>
            <View style={{
              position: 'absolute',
              top: dropdownCoords.y + dropdownCoords.height + 4,
              left: dropdownCoords.x,
              width: dropdownCoords.width,
              backgroundColor: isDark ? '#1a1a1e' : '#ffffff',
              borderRadius: 8,
              maxHeight: 200,
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 5,
              borderWidth: 1,
              borderColor: isDark ? '#333' : '#e2e8f0',
              overflow: 'hidden'
            }}>
              <FlatList
                data={options || []}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: isDark ? '#2c2c2e' : '#f1f5f9' }}
                    onPress={() => {
                      if (onSelect) onSelect(item);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: isDark ? '#fff' : '#0f172a' }}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}'''

old_dropdown_regex = re.compile(r'import \{ Modal, FlatList.*?function DropdownButton.*?\n\}', re.DOTALL)
text = old_dropdown_regex.sub(new_dropdown, text, count=1)

with open('app/(tabs)/risk-guard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
