import re

file_path = r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\mobile-app\app\profile.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add missing imports
if 'CalendarIcon' not in content:
    content = content.replace("import { Flame", "import { Flame, Calendar as CalendarIcon, ChevronDown")
if 'LinearGradient' not in content:
    content = content.replace("import { View, Text", "import { View, Text") # Just finding a safe spot
    content = "import { LinearGradient } from 'expo-linear-gradient';\n" + content

# 2. Add state and mock data
state_insert_point = content.find('const [isGamificationModalVisible, setIsGamificationModalVisible] = useState(false);')
if state_insert_point != -1 and "generateCalendarCells" not in content:
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
    content = content[:state_insert_point] + state_vars + '\n  ' + content[state_insert_point:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated profile.tsx successfully with missing state vars and imports")
