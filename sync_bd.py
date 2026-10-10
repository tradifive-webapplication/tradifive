import re

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make sure state variables exist for missing things
states_to_add = """
  const [dailyTrades, setDailyTrades] = useState(5);
  const [waitPeriod, setWaitPeriod] = useState(15);
  const [sessions, setSessions] = useState(['London', 'New York']);
  const toggleSession = (city: string) => setSessions(prev => prev.includes(city) ? prev.filter(s => s !== city) : [...prev, city]);
  const [consecutiveWins, setConsecutiveWins] = useState(3);
  const [noTradingAfterTime, setNoTradingAfterTime] = useState("20:00");
  const [emotionSensitivity, setEmotionSensitivity] = useState(50);
  const [sleepTimeStart, setSleepTimeStart] = useState("23:00");
"""
if 'const [dailyTrades' not in text:
    text = text.replace('  // --- TRADING CONTROL STATES ---', states_to_add + '  // --- TRADING CONTROL STATES ---')


# 1. Fix Daily Trade Limit (is fine mostly)
# 2. Fix Loss Cooldown
lc_str = """                    <CustomSlider label="DURATION (MINUTES)" valuePct={(waitPeriod/120.0)*100} valueText={`${waitPeriod}M`} onValueChange={(pct) => setWaitPeriod(Math.round((pct/100)*120))} />
                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>TRIGGER</Text>
                      <DropdownButton value="After every losing trade" options={['After every losing trade', 'After consecutive losses']} onSelect={() => {}} />
                    </View>"""
text = re.sub(
    r'<CustomSlider label="DURATION \(MINUTES\)"[^>]+/>\s*<View>\s*<Text[^>]+>TRIGGER</Text>\s*<DropdownButton[^>]+/>\s*</View>',
    lc_str,
    text
)

# 3. Session Sentinel is fine (interactive touchable opacity).

# 4. Win Streak Cooldown
ws_str = """                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>ACTION</Text>
                        <DropdownButton value="Pause trading" options={['Pause trading', 'Confirm to continue']} onSelect={() => {}} />"""
text = re.sub(
    r'<Text[^>]+>ACTION</Text>\s*<DropdownButton[^>]+/>',
    ws_str,
    text,
    count=1
)

# 5. No Trading After Time
nt_str = """                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>CUTOFF TIME</Text>
                        <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8 }]}>
                          <TextInput 
                            value={noTradingAfterTime}
                            onChangeText={setNoTradingAfterTime}
                            style={{ width: '100%', fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a', textAlign: 'center' }}
                          />
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>ACTION</Text>
                        <DropdownButton value="Block new trades" options={['Block new trades', 'Close all positions']} onSelect={() => {}} />
                      </View>"""
text = re.sub(
    r'<View style=\{\{ flex: 1 \}\}>\s*<Text[^>]+>CUTOFF TIME</Text>.*?<DropdownButton[^>]+/>\s*</View>',
    nt_str,
    text,
    flags=re.DOTALL,
    count=1
)

# 6. Behavioural Risk Detector
brd_str = """                    <CustomSlider label="SENSITIVITY" valuePct={emotionSensitivity} valueText={`${Math.round(emotionSensitivity)}%`} onValueChange={(pct) => setEmotionSensitivity(pct)} />"""
text = re.sub(
    r'<CustomSlider label="SENSITIVITY"[^>]+/>',
    brd_str,
    text
)

# 7. News Filter
nf_str = """                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>IMPACT LEVEL</Text>
                      <DropdownButton value="High Only" options={['High Only', 'Medium & High']} onSelect={() => {}} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>BLOCK BFR.</Text>
                        <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8 }]}>
                          <TextInput 
                            defaultValue="30"
                            keyboardType="numeric"
                            style={{ flex: 1, fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a', textAlign: 'center' }}
                          />
                          <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8' }}>MIN</Text>
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>RESUME AFT.</Text>
                        <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8 }]}>
                          <TextInput 
                            defaultValue="15"
                            keyboardType="numeric"
                            style={{ flex: 1, fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a', textAlign: 'center' }}
                          />
                          <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8' }}>MIN</Text>
                        </View>
                      </View>
                    </View>"""
text = re.sub(
    r'<View>\s*<Text[^>]+>IMPACT LEVEL</Text>.*?<Text[^>]+>MIN</Text>\s*</View>\s*</View>\s*</View>',
    nf_str,
    text,
    flags=re.DOTALL,
    count=1
)

# 8. Sleep Protection
sp_str = """                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>LOCKOUT START</Text>
                        <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8 }]}>
                          <TextInput 
                            value={sleepTimeStart}
                            onChangeText={setSleepTimeStart}
                            style={{ width: '100%', fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a', textAlign: 'center' }}
                          />
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>LOCKOUT END</Text>
                        <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8 }]}>
                          <TextInput 
                            defaultValue="06:00"
                            style={{ width: '100%', fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a', textAlign: 'center' }}
                          />
                        </View>
                      </View>
                    </View>"""
text = re.sub(
    r'<View style=\{\{ flexDirection: \'row\', gap: 8 \}\}>\s*<View style=\{\{ flex: 1 \}\}>\s*<Text[^>]+>LOCKOUT START</Text>.*?LOCKOUT END</Text>.*?06:00</Text>\s*</View>\s*</View>\s*</View>',
    sp_str,
    text,
    flags=re.DOTALL
)

# 9. Pre-Trade Checklist
pt_str = """                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>CHECKLIST PRESET</Text>
                    <DropdownButton value="Standard Checklist" options={['Basic Checklist', 'Standard Checklist', 'Strict Checklist']} onSelect={() => {}} />"""
text = re.sub(
    r'<Text[^>]+>CHECKLIST PRESET</Text>\s*<DropdownButton[^>]+/>',
    pt_str,
    text
)

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated Behaviour section")
