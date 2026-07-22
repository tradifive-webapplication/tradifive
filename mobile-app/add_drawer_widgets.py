import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add CalendarIcon and ChevronDown to imports
if 'CalendarIcon' not in content:
    content = content.replace("import { Flame", "import { Flame, Calendar as CalendarIcon, ChevronDown")

# 2. Add state and mock data
state_insert_point = content.find('const [isGamificationModalVisible, setIsGamificationModalVisible] = useState(false);')
if state_insert_point != -1:
    state_vars = """
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  
  const streakVal = 10;
  const bestStreak = 15;
  const streakDots = [
    { date: '2023-10-01', status: 'green' }, { date: '2023-10-02', status: 'green' },
    { date: '2023-10-03', status: 'red' }, { date: '2023-10-04', status: 'green' },
    { date: '2023-10-05', status: 'green' }, { date: '2023-10-06', status: 'gray' },
    { date: '2023-10-07', status: 'gray' }, { date: '2023-10-08', status: 'green' },
    { date: '2023-10-09', status: 'green' }, { date: '2023-10-10', status: 'green' },
    { date: '2023-10-11', status: 'red' }, { date: '2023-10-12', status: 'green' },
    { date: '2023-10-13', status: 'green' }, { date: '2023-10-14', status: 'green' },
    { date: '2023-10-15', status: 'green' }
  ];
  
  const todayStr = (() => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`; })();
  
  const calendarDayMap: Record<string, 'green'|'red'|undefined> = {
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-02`]: 'green',
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-05`]: 'red',
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-08`]: 'green',
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-12`]: 'green',
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-14`]: 'red',
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-18`]: 'green',
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-22`]: 'green',
    [`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-27`]: 'red',
    [todayStr]: 'green'
  };

  const generateCalendarCells = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday=0
    const cells = [];
    
    for (let i = 0; i < startOffset; i++) {
      cells.push(<View key={`empty-${i}`} style={{ width: '13%', aspectRatio: 1, margin: '0.6%' }} />);
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const status = calendarDayMap[key];
      const isToday = key === todayStr;
      
      let bgColor = isDarkMode ? '#1A1A1A' : '#f1f5f9';
      let borderColor = isDarkMode ? '#262626' : '#e2e8f0';
      
      if (status === 'green') {
        bgColor = isDarkMode ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.5)';
        borderColor = 'transparent';
      } else if (status === 'red') {
        bgColor = isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.3)';
        borderColor = 'rgba(239, 68, 68, 0.2)';
      }
      
      cells.push(
        <View 
          key={key} 
          style={{
            width: '13%', 
            aspectRatio: 1, 
            margin: '0.6%',
            borderRadius: 4,
            backgroundColor: bgColor,
            borderWidth: status === 'red' ? 1 : (status === 'green' ? 0 : 1),
            borderColor: borderColor,
            ...(isToday ? { borderWidth: 2, borderColor: 'rgba(59, 130, 246, 0.5)' } : {})
          }}
        />
      );
    }
    return cells;
  };
"""
    # Insert safely only once
    if "generateCalendarCells" not in content:
        content = content[:state_insert_point] + state_vars + '\n  ' + content[state_insert_point:]

# 3. Replace Trading Days block with Trading Streak & Calendar
start_trading_days = content.find('{/* Trading Days (Dummy implementation to fill space) */}')
if start_trading_days != -1:
    end_trading_days = content.find('</LinearGradient>', start_trading_days) + len('</LinearGradient>')
    
    widgets_jsx = """
            {/* Trading Streak Widget */}
            <LinearGradient
              colors={isDarkMode ? ['#141414', '#1A1A1C'] : ['#FAFBFD', '#FFFFFF']}
              style={{
                padding: 24,
                borderRadius: 24,
                borderWidth: 2,
                borderColor: isDarkMode ? '#1A1A1A' : '#ffffff',
                marginBottom: 16,
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDarkMode ? 0.4 : 0.06,
                shadowRadius: 7,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: isDarkMode ? 'rgba(30,41,59,0.6)' : '#f1f5f9', marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Flame size={16} color="#f97316" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#fff' : '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Trading Streak</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#f97316' }}>{streakVal}</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>Current Streak</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b' }}>Best: <Text style={{ color: isDarkMode ? '#fff' : '#0f172a', fontWeight: '800' }}>{bestStreak} Days</Text></Text>
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
                      borderColor: 'rgba(255,255,255,0.05)',
                      backgroundColor: dot.status === 'green' ? '#10b981' : (dot.status === 'red' ? '#ef4444' : (isDarkMode ? '#141414' : '#e2e8f0'))
                    }}
                  />
                ))}
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ fontSize: 9, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{streakDots.length > 0 ? new Date(streakDots[0].date).toLocaleDateString('en-US', {day: 'numeric', month: 'short'}) : ''}</Text>
                <Text style={{ fontSize: 9, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Today</Text>
              </View>
            </LinearGradient>

            {/* Performance Calendar Widget */}
            <LinearGradient
              colors={isDarkMode ? ['#141414', '#1A1A1C'] : ['#FAFBFD', '#FFFFFF']}
              style={{
                padding: 24,
                borderRadius: 24,
                borderWidth: 2,
                borderColor: isDarkMode ? '#1A1A1A' : '#ffffff',
                marginBottom: 40,
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDarkMode ? 0.4 : 0.06,
                shadowRadius: 7,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: isDarkMode ? 'rgba(30,41,59,0.6)' : '#f1f5f9', marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CalendarIcon size={15} color="#3b82f6" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#fff' : '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Calendar</Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <TouchableOpacity 
                    onPress={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() - 1)))}
                    style={{ padding: 4 }}
                  >
                    <ChevronDown size={14} color="#94a3b8" style={{ transform: [{ rotate: '90deg' }] }} />
                  </TouchableOpacity>
                  
                  <LinearGradient
                    colors={isDarkMode ? ['#252528', '#1A1A1C'] : ['#F4F4F4', '#FFFFFF']}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 99,
                      borderWidth: 2,
                      borderColor: isDarkMode ? '#1A1A1A' : '#ffffff',
                      minWidth: 105,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ color: isDarkMode ? '#e2e8f0' : '#393939', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {calendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </Text>
                  </LinearGradient>
                  
                  <TouchableOpacity 
                    onPress={() => setCalendarMonth(new Date(calendarMonth.setMonth(calendarMonth.getMonth() + 1)))}
                    style={{ padding: 4 }}
                  >
                    <ChevronDown size={14} color="#94a3b8" style={{ transform: [{ rotate: '-90deg' }] }} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                    <Text key={d} style={{ width: '13%', textAlign: 'center', fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{d.substring(0,1)}</Text>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                  {generateCalendarCells()}
                </View>
              </View>
            </LinearGradient>"""
    
    content = content[:start_trading_days] + widgets_jsx.strip() + content[end_trading_days:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated profile.tsx successfully")
