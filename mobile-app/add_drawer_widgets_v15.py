import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new content for the drawer scrollview
new_drawer_content = """<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 30 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18 }}>📈</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: '#0f172a' }}>Analytics & Stats</Text>
                  <Text style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter_500Medium', marginTop: 2 }}>Your trading performance</Text>
                </View>
              </View>

              {/* Trading Streak Widget */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: 24,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: '#f1f5f9',
                  marginBottom: 16,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc', marginBottom: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Flame size={16} color="#f97316" />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Trading Streak</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#f97316' }}>{streakVal}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>Current Streak</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>Best: <Text style={{ color: '#0f172a', fontWeight: '800' }}>{bestStreak} Days</Text></Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 }}>
                  {streakDots.map((dot, idx) => (
                    <View 
                      key={idx}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: 'rgba(0,0,0,0.05)',
                        backgroundColor: dot.status === 'green' ? '#10b981' : (dot.status === 'red' ? '#ef4444' : '#e2e8f0')
                      }}
                    />
                  ))}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{streakDots.length > 0 ? new Date(streakDots[0].date).toLocaleDateString('en-US', {day: 'numeric', month: 'short'}) : ''}</Text>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Today</Text>
                </View>
              </View>

              {/* Advanced Metrics Widget */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: 24,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: '#f1f5f9',
                  marginBottom: 16,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Briefcase size={16} color="#8b5cf6" />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Advanced Metrics</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <View style={{ width: '48%', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, marginBottom: 8 }}>
                    <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '600', marginBottom: 4 }}>Win Rate</Text>
                    <Text style={{ fontSize: 18, color: '#0f172a', fontWeight: '800' }}>68%</Text>
                  </View>
                  <View style={{ width: '48%', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, marginBottom: 8 }}>
                    <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '600', marginBottom: 4 }}>Profit Factor</Text>
                    <Text style={{ fontSize: 18, color: '#0f172a', fontWeight: '800' }}>2.4</Text>
                  </View>
                  <View style={{ width: '48%', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12 }}>
                    <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '600', marginBottom: 4 }}>Avg Win</Text>
                    <Text style={{ fontSize: 18, color: '#10b981', fontWeight: '800' }}>$450</Text>
                  </View>
                  <View style={{ width: '48%', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12 }}>
                    <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '600', marginBottom: 4 }}>Avg Loss</Text>
                    <Text style={{ fontSize: 18, color: '#ef4444', fontWeight: '800' }}>$180</Text>
                  </View>
                </View>
              </View>

              {/* Achievements Widget */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: 24,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: '#f1f5f9',
                  marginBottom: 16,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Crown size={16} color="#eab308" />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Achievements</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#3b82f6', fontWeight: '600' }}>View All</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  <View style={{ alignItems: 'center', width: 70 }}>
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 2, borderColor: '#fde047' }}>
                      <Crown size={22} color="#ca8a04" />
                    </View>
                    <Text style={{ fontSize: 10, color: '#334155', fontWeight: '600', textAlign: 'center' }}>Pro Trader</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 70 }}>
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 2, borderColor: '#6ee7b7' }}>
                      <Check size={22} color="#059669" />
                    </View>
                    <Text style={{ fontSize: 10, color: '#334155', fontWeight: '600', textAlign: 'center' }}>100 Wins</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 70 }}>
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 2, borderColor: '#93c5fd' }}>
                      <Flame size={22} color="#2563eb" />
                    </View>
                    <Text style={{ fontSize: 10, color: '#334155', fontWeight: '600', textAlign: 'center' }}>Hot Streak</Text>
                  </View>
                  <View style={{ alignItems: 'center', width: 70 }}>
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'dashed' }}>
                      <Gift size={22} color="#94a3b8" />
                    </View>
                    <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '600', textAlign: 'center' }}>Locked</Text>
                  </View>
                </ScrollView>
              </View>

              {/* Performance Calendar Widget */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: 24,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: '#f1f5f9',
                  marginBottom: 40,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CalendarIcon size={15} color="#3b82f6" />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Calendar</Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TouchableOpacity 
                      onPress={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() - 1)))}
                      style={{ padding: 4 }}
                    >
                      <ChevronDown size={14} color="#94a3b8" style={{ transform: [{ rotate: '90deg' }] }} />
                    </TouchableOpacity>
                    
                    <View
                      style={{
                        backgroundColor: '#f8fafc',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 99,
                        borderWidth: 1,
                        borderColor: '#f1f5f9',
                        minWidth: 105,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ color: '#0f172a', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                        {calendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      onPress={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() + 1)))}
                      style={{ padding: 4 }}
                    >
                      <ChevronDown size={14} color="#94a3b8" style={{ transform: [{ rotate: '-90deg' }] }} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                      <Text key={d} style={{ width: '13%', textAlign: 'center', fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{d.substring(0,1)}</Text>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                    {generateCalendarCells()}
                  </View>
                </View>
              </View>
</ScrollView>"""

# Using regex to replace everything between `<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>` and `</ScrollView>` inside the drawer content.
# Wait, the drawer is the ONLY ScrollView with that exact style.
pattern = r"<ScrollView style=\{\{ flex: 1 \}\} contentContainerStyle=\{\{ padding: 20, paddingBottom: 100 \}\}>.*?</ScrollView>"
new_content = re.sub(pattern, new_drawer_content, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated drawer widgets with white theme, advanced metrics, and achievements")
