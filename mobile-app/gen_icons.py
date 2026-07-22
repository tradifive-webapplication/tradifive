import json

with open('extracted_icons.json', 'r') as f:
    icons = json.load(f)

existing = {
    'Heart': {
        'transform': None,
        'paths': [
            "M11.9932 5.13581C9.9938 2.7984 6.65975 2.16964 4.15469 4.31001C1.64964 6.45038 1.29697 10.029 3.2642 12.5604C4.89982 14.6651 9.84977 19.1041 11.4721 20.5408C11.6536 20.7016 11.7444 20.7819 11.8502 20.8135C11.9426 20.8411 12.0437 20.8411 12.1361 20.8135C12.2419 20.7819 12.3327 20.7016 12.5142 20.5408C14.1365 19.1041 19.0865 14.6651 20.7221 12.5604C22.6893 10.029 22.3797 6.42787 19.8316 4.31001C17.2835 2.19216 13.9925 2.7984 11.9932 5.13581Z"
        ]
    },
    'Chat': {
        'transform': None,
        'paths': [
            "M17.071,17.07a10.006,10.006,0,0,1-11.285,2c-.547-.22-4.085.76-4.853-.007s.213-4.307-.007-4.854A10,10,0,1,1,17.071,17.07Z"
        ]
    },
    'Send': {
        'transform': None,
        'paths': [
            "M22 2L11 13",
            "M22 2L15 22L11 13L2 9L22 2Z"
        ]
    }
}

icons.update(existing)

out = """import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  primaryColor?: string;
  color?: string; // Support lucide-react-native style color
  set?: 'light' | 'bold';
  strokeWidth?: number;
}
"""

for name, data in icons.items():
    out += f"""
export const {name} = ({{ size = 24, primaryColor, color = 'currentColor', strokeWidth = 1.5 }}: IconProps) => (
  <Svg width={{size}} height={{size}} viewBox="0 0 24 24" fill="none">
"""
    if data['transform']:
        out += f'    <G transform="translate({data["transform"].replace(" ", ", ")})">\n'
    
    for p in data['paths']:
        out += f'      <Path d="{p}" stroke={{primaryColor || color}} strokeWidth={{strokeWidth}} strokeLinecap="round" strokeLinejoin="round" />\n'
    
    if data['transform']:
        out += f'    </G>\n'
    
    out += f"""  </Svg>
);
"""

with open('components/Iconly.tsx', 'w') as f:
    f.write(out)
