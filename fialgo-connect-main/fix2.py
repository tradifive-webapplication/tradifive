import re

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix One Instrument Mode
text = re.sub(
    r'<DropdownButton value=\{allowedTicker\} onPress=\{.*?\} />',
    r'<DropdownButton value={allowedTicker} options={[\'XAUUSD\', \'EURUSD\', \'GBPUSD\', \'US30\', \'NAS100\']} onSelect={setAllowedTicker} />',
    text
)

# Fix Allowed Strategy Only
text = re.sub(
    r'<DropdownButton value=\{strategyName\} onPress=\{.*?\} />',
    r'<DropdownButton value={strategyName} options={[\'Breakout Pro\', \'Trend Follower\', \'Mean Reversion\', \'News Scalper\']} onSelect={setStrategyName} />',
    text
)

# Fix Session Sentinel onPress inside map
text = re.sub(
    r'<TouchableOpacity\s+key=\{city\}\s+onPress=\{.*?\}',
    r'<TouchableOpacity key={city} onPress={() => toggleSession(city)}',
    text
)

# Fix syntax errors in the file
# It seems there's a stray `</Animated.View>` or something around line 344.
# Wait, let me just fix the missing closing tags around Max Lot Size.
max_lot_bad = """                      <TouchableOpacity onPress={() => setMaxLot(Math.min(10.0, maxLot + 0.1))} style={styles.plusMinusBtn}>
                        <Plus size={16} color={isDark ? '#fff' : '#000'} />
                      </TouchableOpacity>
                    </View>
                    <CustomSlider label="" valuePct={(maxLot / 10.0) * 100} valueText="" onValueChange={(pct) => setMaxLot((pct / 100) * 10.0)} />
                  </>))}"""
max_lot_good = """                      <TouchableOpacity onPress={() => setMaxLot(Math.min(10.0, maxLot + 0.1))} style={styles.plusMinusBtn}>
                        <Plus size={16} color={isDark ? '#fff' : '#000'} />
                      </TouchableOpacity>
                    </View>
                    <CustomSlider label="" valuePct={(maxLot / 10.0) * 100} valueText="" onValueChange={(pct) => setMaxLot((pct / 100) * 10.0)} />
                  </>))}"""
# Actually, looking at the previous diff block:
# The `fix_syntax.py` removed `<TouchableOpacity ... <Plus /> ... </TouchableOpacity> </View>`
# Meaning line 412 is `</View>` which closes the `inputWrapperStyle` View, but NOT the `flexDirection: 'row'` View.
text = text.replace('                    <CustomSlider label="" valuePct={(maxLot / 10.0) * 100} valueText="" onValueChange={(pct) => setMaxLot((pct / 100) * 10.0)} />', 
                    '                    </View>\n                    <CustomSlider label="" valuePct={(maxLot / 10.0) * 100} valueText="" onValueChange={(pct) => setMaxLot((pct / 100) * 10.0)} />')


with open('mobile-app/app/(tabs)/risk-guard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

