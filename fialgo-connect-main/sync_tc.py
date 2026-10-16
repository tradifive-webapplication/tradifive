import re

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix Max Lot Size: Add a CustomSlider below the minus/plus block
max_lot_str = """                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <TouchableOpacity onPress={() => setMaxLot(Math.max(0.01, maxLot - 0.1))} style={styles.plusMinusBtn}>
                        <Minus size={16} color={isDark ? '#fff' : '#000'} />
                      </TouchableOpacity>
                      <View style={[styles.inputWrapperStyle, { flex: 1, marginHorizontal: 12, justifyContent: 'center' }]}>
                        <TextInput 
                          value={maxLot.toFixed(2)}
                          onChangeText={(val) => { const n = parseFloat(val); if (!isNaN(n)) setMaxLot(n); }}
                          keyboardType="numeric"
                          style={{ fontSize: 16, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a', textAlign: 'center' }}
                        />
                        <Text style={{ position: 'absolute', right: 12, fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#64748b' }}>Lots</Text>
                      </View>
                      <TouchableOpacity onPress={() => setMaxLot(Math.min(10.0, maxLot + 0.1))} style={styles.plusMinusBtn}>
                        <Plus size={16} color={isDark ? '#fff' : '#000'} />
                      </TouchableOpacity>
                    </View>
                    <CustomSlider label="" valuePct={(maxLot / 10.0) * 100} valueText="" onValueChange={(pct) => setMaxLot((pct / 100) * 10.0)} />
"""
text = re.sub(
    r'<View style=\{\{ flexDirection: \'row\', alignItems: \'center\', justifyContent: \'space-between\' \}\}>.*?</View>', 
    max_lot_str, 
    text, 
    flags=re.DOTALL, count=1
)

# 2. Fix No Averaging Down
no_avg_str = """                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>MODE</Text>
                      <DropdownButton value="Strict Block" options={['Strict Block', 'Warning Only']} onSelect={() => {}} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>SCOPE</Text>
                      <DropdownButton value="Same Symbol + Direction" options={['Same Symbol + Direction', 'Same Symbol', 'Global Account']} onSelect={() => {}} />
                    </View>"""
text = re.sub(
    r'<View>\s*<Text[^>]*>MODE</Text>\s*<DropdownButton[^>]*/>\s*</View>\s*<View>\s*<Text[^>]*>SCOPE</Text>\s*<DropdownButton[^>]*/>\s*</View>',
    no_avg_str,
    text
)

# 3. Fix Martingale Protection
martingale_str = """                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>TRIGGER MULTIPLIER</Text>
                    <View style={[styles.inputWrapperStyle, { justifyContent: 'center', marginBottom: 12 }]}>
                      <TextInput 
                          value={martingaleMultiplier.toFixed(1)}
                          onChangeText={(val) => { const n = parseFloat(val); if (!isNaN(n)) setMartingaleMultiplier(n); }}
                          keyboardType="numeric"
                          style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a', textAlign: 'center' }}
                      />
                      <Text style={{ position: 'absolute', right: 12, fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}>×</Text>
                    </View>
                    <CustomSlider label="" valuePct={((martingaleMultiplier - 1.1) / (5.0 - 1.1)) * 100} valueText="" onValueChange={(pct) => setMartingaleMultiplier(1.1 + (pct / 100) * (5.0 - 1.1))} />"""
text = re.sub(
    r'<Text[^>]*>TRIGGER MULTIPLIER</Text>\s*<View[^>]*>\s*<Text[^>]*>\{martingaleMultiplier\.toFixed\(1\)\}×</Text>\s*</View>',
    martingale_str,
    text
)

# 4. Fix One Instrument Mode
instrument_str = """                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>ALLOWED INSTRUMENT</Text>
                    <DropdownButton value={allowedTicker} options={['XAUUSD', 'EURUSD', 'GBPUSD', 'US30', 'NAS100']} onSelect={setAllowedTicker} />"""
text = re.sub(
    r'<Text[^>]*>ALLOWED INSTRUMENT</Text>\s*<DropdownButton[^>]*/>',
    instrument_str,
    text
)

# 5. Fix Allowed Strategy
strategy_str = """                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>ALLOWED STRATEGY</Text>
                    <DropdownButton value={strategyName} options={['Breakout Pro', 'Trend Follower', 'Mean Reversion', 'News Scalper']} onSelect={setStrategyName} />"""
text = re.sub(
    r'<Text[^>]*>ALLOWED STRATEGY</Text>\s*<DropdownButton[^>]*/>',
    strategy_str,
    text
)

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated Trading Control section")
