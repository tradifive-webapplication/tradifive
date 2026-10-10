import re

def extract_cards(path, is_web):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    cards = {}
    if is_web:
        matches = re.finditer(r'<RiskGuardCard\s+icon=\{[^\}]+\}\s+title="([^"]+)".*?>(.*?)</RiskGuardCard>', text, re.DOTALL)
    else:
        # Match from {renderCardHeader... to the ending of the component which is </>)} or something.
        matches = re.finditer(r'\{renderCardHeader\([^,]+,\s*"([^"]+)".*?\}(.*?)(?:</View>|</>)\s*\)\s*\)\}', text, re.DOTALL)
        
    for m in matches:
        title = m.group(1)
        content = m.group(2).strip()
        cards[title] = content
    return cards

web_cards = extract_cards('src/pages/RiskGuard.tsx', True)
mobile_cards = extract_cards('mobile-app/app/(tabs)/risk-guard.tsx', False)

for title in web_cards.keys():
    print(f'--- {title} ---')
    if title not in mobile_cards:
        print('MISSING IN MOBILE')
    else:
        # just print a summary of what's inside
        web_inputs = re.findall(r'<input[^>]*>|<Select[^>]*>', web_cards[title])
        mobile_inputs = re.findall(r'<TextInput[^>]*>|<CustomSlider[^>]*>|<DropdownButton[^>]*>|plusMinusBtn|Slider', mobile_cards[title])
        print(f'WEB: {len(web_inputs)} inputs {web_inputs}')
        print(f'MOBILE: {len(mobile_inputs)} inputs {mobile_inputs}')
