import re

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix Drawdown Guard
drawdown_str = """                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>LIMIT</Text>
                        <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8, justifyContent: 'center' }]}>
                          <TextInput 
                            value={maxDrawdown.toFixed(1)}
                            onChangeText={(val) => { const n = parseFloat(val); if (!isNaN(n)) setMaxDrawdown(n); }}
                            keyboardType="numeric"
                            style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a', textAlign: 'center' }}
                          />
                          <Text style={{ position: 'absolute', right: 8, fontSize: 13, fontFamily: 'Inter_700Bold', color: '#64748b' }}>%</Text>
                        </View>
                      </View>
                      <View style={{ flex: 1.5 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>BASIS</Text>
                        <DropdownButton value="Start-of-day balance" options={['Start-of-day balance', 'Start-of-day equity']} onSelect={() => {}} />
                      </View>
                    </View>
                    <CustomSlider label="" valuePct={(maxDrawdown / 20.0) * 100} valueText="" onValueChange={(pct) => setMaxDrawdown((pct / 100) * 20.0)} />"""
text = re.sub(
    r'<CustomSlider label="MAX DAILY DRAWDOWN"[^>]+/>\s*<CustomSlider label="MAX WEEKLY DRAWDOWN"[^>]+/>\s*<CustomSlider label="MAX MONTHLY DRAWDOWN"[^>]+/>',
    drawdown_str,
    text
)

# 2. Fix Daily Profit Target
dpt_str = """                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>TARGET AMOUNT</Text>
                      <View style={styles.inputWrapperStyle}>
                        <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#64748b' }}>$</Text>
                        <TextInput 
                          value={dailyProfitTarget.toString()}
                          onChangeText={(val) => { const n = parseFloat(val); if (!isNaN(n)) setDailyProfitTarget(n); }}
                          keyboardType="numeric"
                          style={{ flex: 1, marginLeft: 8, fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}
                        />
                        <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#64748b' }}>USD</Text>
                      </View>
                    </View>
                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>CALCULATION</Text>
                      <DropdownButton value="Closed P&L" options={['Closed P&L', 'Equity Profit']} onSelect={() => {}} />
                    </View>"""
text = re.sub(
    r'<View>\s*<Text[^>]+>TARGET AMOUNT</Text>.*?<Text[^>]+>CALCULATION</Text>\s*<DropdownButton[^>]+/>\s*</View>',
    dpt_str,
    text,
    flags=re.DOTALL
)

# 3. Fix Stop Loss Required
slr_str = """                    <View>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>ACTION</Text>
                      <DropdownButton value={stopLossAction === 'auto' ? "Auto add SL" : "Block trades without SL"} options={['Auto add SL', 'Block trades without SL']} onSelect={(val) => setStopLossAction(val === 'Auto add SL' ? 'auto' : 'block')} />
                    </View>
                    {stopLossAction === 'auto' && (
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>METHOD</Text>
                          <DropdownButton value={stopLossMethod === 'pips' ? "Pips" : "Percent"} options={['Pips', 'Percent']} onSelect={(val) => setStopLossMethod(val === 'Pips' ? 'pips' : 'percent')} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>VALUE</Text>
                          <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8 }]}>
                            <TextInput 
                              value={defaultStopLoss.toString()}
                              onChangeText={(val) => { const n = parseFloat(val); if (!isNaN(n)) setDefaultStopLoss(n); }}
                              keyboardType="numeric"
                              style={{ width: '100%', fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a', textAlign: 'center' }}
                            />
                          </View>
                        </View>
                      </View>
                    )}"""
text = re.sub(
    r'<View>\s*<Text[^>]+>ACTION</Text>.*?\{stopLossAction === \'auto\' && \([\s\S]*?</View>\s*\)\}',
    slr_str,
    text
)

# 4. Fix Min Risk/Reward
mrr_str = """                    <CustomSlider label="MINIMUM TARGET R:R" valuePct={(minRiskReward / 5.0) * 100} valueText={`1:${minRiskReward.toFixed(1)}`} onValueChange={(pct) => setMinRiskReward((pct / 100) * 5.0)} />"""
text = re.sub(
    r'<CustomSlider label="MINIMUM TARGET R:R"[^>]+/>',
    mrr_str,
    text
)

# 5. Fix Weekend Lock
wl_str = """                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>CLOSE TIME</Text>
                        <View style={[styles.inputWrapperStyle, { marginTop: 0, paddingVertical: 8 }]}>
                          <TextInput 
                            value={weekendCloseTime}
                            onChangeText={setWeekendCloseTime}
                            style={{ width: '100%', fontSize: 13, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a', textAlign: 'center' }}
                          />
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>ACTION</Text>
                        <DropdownButton value="Close & Block" options={['Close & Block', 'Close Only', 'Block Only']} onSelect={() => {}} />
                      </View>
                    </View>"""
text = re.sub(
    r'<View style=\{\{ flexDirection: \'row\', gap: 8 \}\}>\s*<View style=\{\{ flex: 1 \}\}>\s*<Text[^>]+>CLOSE TIME</Text>.*?<DropdownButton[^>]+/>\s*</View>\s*</View>',
    wl_str,
    text,
    flags=re.DOTALL
)

# 6. Fix Account Protection
ap_str = """                    <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>MINIMUM EQUITY LEVEL</Text>
                    <View style={[styles.inputWrapperStyle, { justifyContent: 'flex-start' }]}>
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#64748b', marginRight: 4 }}>$</Text>
                      <TextInput 
                        value={equityHardStop.toString()}
                        onChangeText={(val) => { const n = parseFloat(val); if (!isNaN(n)) setEquityHardStop(n); }}
                        keyboardType="numeric"
                        style={{ flex: 1, fontSize: 15, fontFamily: 'Inter_700Bold', color: isDark ? '#fff' : '#0f172a' }}
                      />
                      <Text style={{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#64748b' }}>USD</Text>
                    </View>"""
text = re.sub(
    r'<Text[^>]+>MINIMUM EQUITY LEVEL</Text>\s*<View[^>]+>\s*<Text[^>]+>\$</Text>\s*<Text[^>]+>\{equityHardStop\}</Text>\s*<View[^>]+/>\s*<Text[^>]+>USD</Text>\s*</View>',
    ap_str,
    text
)

with open('mobile-app/app/(tabs)/risk-guard.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated Risk Management section")
