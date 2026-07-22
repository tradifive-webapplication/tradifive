import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace PanResponder and state
new_state = '''  // Side Drawer Slider State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerTranslateX = useRef(new Animated.Value(width)).current;
  
  const openDrawer = () => {
    setIsDrawerOpen(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(drawerTranslateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start();
  };

  const closeDrawer = () => {
    Keyboard.dismiss();
    Animated.spring(drawerTranslateX, {
      toValue: width,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start(() => setIsDrawerOpen(false));
  };

  const drawerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) { // Only allow sliding to the right (to close)
          drawerTranslateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50 || gestureState.vx > 0.5) {
          closeDrawer();
        } else {
          Animated.spring(drawerTranslateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11
          }).start();
        }
      }
    })
  ).current;'''

state_regex = re.compile(r'// Side Drawer Slider State.*?^\s*\)\.current;', re.DOTALL | re.MULTILINE)
content = state_regex.sub(new_state, content)


# Find the Profile Details start
profile_details_start = content.find('{/* Profile Details */}')
# Find the end of Profile Details (before {/* Tabs Bar */})
profile_details_end = content.find('{/* Tabs Bar */}', profile_details_start)

profile_details_html = content[profile_details_start:profile_details_end]

# Modify Profile Details to be wrapped in a container
# Replace '<Animated.View style={[styles.profileDetails, { opacity: activeCardId ? 0.15 : 1 }]}>'
new_profile_details_html = profile_details_html.replace(
    '<Animated.View style={[styles.profileDetails, { opacity: activeCardId ? 0.15 : 1 }]}>',
    '''<View style={{ position: 'relative', marginTop: -32, marginBottom: 10 }}>
          {/* Profile Details */}
          <Animated.View style={[styles.profileDetails, { marginTop: 0, marginBottom: 0, opacity: activeCardId ? 0.15 : 1 }]} pointerEvents={isDrawerOpen ? 'none' : 'auto'}>'''
)
# At the end of profile_details_html, we need to append the Drawer JSX and close the container View.
# profile_details_html ends with '</Animated.View>\n\n        '
drawer_jsx = '''

          {/* Side Handle Trigger (Instagram style) */}
          {!isDrawerOpen && (
            <Animated.View
              style={{
                position: 'absolute',
                right: 0,
                top: 40,
                width: 32,
                height: 80,
                backgroundColor: '#0f172a',
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: -2, height: 0 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 5,
                zIndex: 9000,
              }}
              {...drawerPanResponder.panHandlers}
            >
              <TouchableOpacity onPress={openDrawer} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Slide-Out Profile Stats Drawer */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: '90%',
              backgroundColor: '#ffffff',
              shadowColor: '#000',
              shadowOffset: { width: -5, height: 0 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 20,
              zIndex: 9999,
              transform: [{ translateX: drawerTranslateX }],
              borderRadius: 36,
              overflow: 'hidden',
            }}
            {...drawerPanResponder.panHandlers}
          >
            <View style={{ width: 4, height: 40, backgroundColor: '#cbd5e1', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 }} />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
              <Text style={{ fontSize: 22, fontFamily: 'Inter_800ExtraBold', color: '#0f172a', marginBottom: 24 }}>Trading Stats</Text>

              {/* Tradifive AI Analysis */}
              <View style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Sparkles size={18} color="#8b5cf6" />
                  <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Tradifive AI Analysis</Text>
                </View>
                <View style={{ gap: 12 }}>
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter_500Medium' }}>Emotional Discipline</Text>
                      <Text style={{ fontSize: 13, color: '#10b981', fontFamily: 'Inter_700Bold' }}>85%</Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: '#e2e8f0', borderRadius: 3 }}><View style={{ height: '100%', width: '85%', backgroundColor: '#10b981', borderRadius: 3 }} /></View>
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter_500Medium' }}>Revenge Trading Risk</Text>
                      <Text style={{ fontSize: 13, color: '#ef4444', fontFamily: 'Inter_700Bold' }}>Low</Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: '#e2e8f0', borderRadius: 3 }}><View style={{ height: '100%', width: '15%', backgroundColor: '#ef4444', borderRadius: 3 }} /></View>
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter_500Medium' }}>Confidence Score</Text>
                      <Text style={{ fontSize: 13, color: '#3b82f6', fontFamily: 'Inter_700Bold' }}>92%</Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: '#e2e8f0', borderRadius: 3 }}><View style={{ height: '100%', width: '92%', backgroundColor: '#3b82f6', borderRadius: 3 }} /></View>
                  </View>
                </View>
              </View>

              {/* Advanced Performance */}
              <View style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <View style={{ padding: 6, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 8 }}>
                    <Flame size={16} color="#3b82f6" />
                  </View>
                  <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Advanced Metrics</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  <View style={{ width: '47%', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' }}>
                    <Text style={{ fontSize: 11, color: '#64748b', fontFamily: 'Inter_600SemiBold' }}>Profit Factor</Text>
                    <Text style={{ fontSize: 16, color: '#0f172a', fontFamily: 'Inter_700Bold', marginTop: 4 }}>1.84</Text>
                  </View>
                  <View style={{ width: '47%', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' }}>
                    <Text style={{ fontSize: 11, color: '#64748b', fontFamily: 'Inter_600SemiBold' }}>Expectancy</Text>
                    <Text style={{ fontSize: 16, color: '#0f172a', fontFamily: 'Inter_700Bold', marginTop: 4 }}>0.45R</Text>
                  </View>
                  <View style={{ width: '47%', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' }}>
                    <Text style={{ fontSize: 11, color: '#64748b', fontFamily: 'Inter_600SemiBold' }}>Max Drawdown</Text>
                    <Text style={{ fontSize: 16, color: '#ef4444', fontFamily: 'Inter_700Bold', marginTop: 4 }}>-4.2%</Text>
                  </View>
                  <View style={{ width: '47%', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' }}>
                    <Text style={{ fontSize: 11, color: '#64748b', fontFamily: 'Inter_600SemiBold' }}>Consistency</Text>
                    <Text style={{ fontSize: 16, color: '#10b981', fontFamily: 'Inter_700Bold', marginTop: 4 }}>88%</Text>
                  </View>
                </View>
              </View>

              {/* Achievements */}
              <View style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Gift size={18} color="#f59e0b" />
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Achievements</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#3b82f6', fontFamily: 'Inter_600SemiBold' }}>View all</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, flex: 1, borderWidth: 1, borderColor: '#f1f5f9' }}>
                    <Diamond size={24} color="#3b82f6" />
                    <Text style={{ fontSize: 10, color: '#64748b', fontFamily: 'Inter_600SemiBold', textAlign: 'center', marginTop: 8 }}>100 Wins</Text>
                  </View>
                  <View style={{ alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, flex: 1, borderWidth: 1, borderColor: '#f1f5f9' }}>
                    <Flame size={24} color="#f97316" />
                    <Text style={{ fontSize: 10, color: '#64748b', fontFamily: 'Inter_600SemiBold', textAlign: 'center', marginTop: 8 }}>10d Streak</Text>
                  </View>
                  <View style={{ alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, flex: 1, borderWidth: 1, borderColor: '#f1f5f9' }}>
                    <Crown size={24} color="#8b5cf6" />
                    <Text style={{ fontSize: 10, color: '#64748b', fontFamily: 'Inter_600SemiBold', textAlign: 'center', marginTop: 8 }}>2K Trades</Text>
                  </View>
                </View>
              </View>

              {/* Mini Calendar Mock */}
              <View style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Calendar size={18} color="#0f172a" />
                  <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Trading Days</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                  {Array.from({ length: 30 }).map((_, i) => (
                    <View key={i} style={{ width: 32, height: 32, backgroundColor: Math.random() > 0.7 ? '#ef4444' : Math.random() > 0.2 ? '#10b981' : '#e2e8f0', borderRadius: 6 }} />
                  ))}
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>

        '''
new_profile_details_html = new_profile_details_html.replace('</Animated.View>\n\n        ', drawer_jsx)

content = content[:profile_details_start] + new_profile_details_html + content[profile_details_end:]

# Now we need to remove the old drawer JSX which is outside the ScrollView
# It starts around {/* Side Handle Trigger (Instagram style) */} and ends before {/* PINTEREST-STYLE MENU OVERLAY */}

old_drawer_start = content.find('{/* Side Handle Trigger (Instagram style) */}')
# Find the next one, since we just added one inside Profile Details!
# We want the LAST one, or the one that is outside.
# Let's just find the string between </Animated.ScrollView> and {/* PINTEREST-STYLE MENU OVERLAY */}

scrollview_end = content.find('</Animated.ScrollView>')
pinterest_start = content.find('{/* PINTEREST-STYLE MENU OVERLAY */}')

if scrollview_end != -1 and pinterest_start != -1:
    content = content[:scrollview_end + len('</Animated.ScrollView>')] + '\n\n      ' + content[pinterest_start:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
