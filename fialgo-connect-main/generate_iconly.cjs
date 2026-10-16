const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const Iconly = require('react-iconly');
const fs = require('fs');
const path = require('path');

const ICON_NAMES = Object.keys(Iconly).filter(k => k !== 'Iconly' && k !== 'IconlyProvider' && k !== 'default');

function getPaths(html) {
    // Basic regex to find path tags and extract d="" attribute
    const paths = [];
    const regex = /<path[^>]*d="([^"]+)"[^>]*>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        paths.push(match[1]);
    }
    return paths;
}

let fileContent = `import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

export interface IconProps {
  size?: number | 'small' | 'medium' | 'large' | 'xlarge';
  primaryColor?: string;
  color?: string;
  set?: 'light' | 'bold' | 'two-tone' | 'bulk' | 'broken' | 'curved';
  strokeWidth?: number;
  stroke?: 'light' | 'regular' | 'bold';
  fill?: string;
  className?: string;
}

const getStrokeWidth = (stroke) => {
    if (stroke === 'bold') return 2;
    if (stroke === 'light') return 1;
    return 1.5;
}

const getSize = (size) => {
    if (typeof size === 'number') return size;
    switch(size) {
        case 'small': return 16;
        case 'large': return 32;
        case 'xlarge': return 48;
        case 'medium':
        default: return 24;
    }
}

`;

for (const name of ICON_NAMES) {
    const Component = Iconly[name];
    try {
        const curvedMarkup = renderToStaticMarkup(React.createElement(Component, { set: 'curved' }));
        const boldMarkup = renderToStaticMarkup(React.createElement(Component, { set: 'bold' }));
        
        // Extract paths for curved (which has stroke)
        // Extract paths for bold (which has fill)
        
        // Let's make it simpler, we just parse the innerHTML of the SVG and replace HTML attributes with JSX attributes.
        const extractInner = (svgHtml) => {
            let inner = svgHtml.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
            // Convert attributes to camelCase for React Native SVG
            inner = inner.replace(/stroke-width/g, 'strokeWidth');
            inner = inner.replace(/stroke-linecap/g, 'strokeLinecap');
            inner = inner.replace(/stroke-linejoin/g, 'strokeLinejoin');
            inner = inner.replace(/stroke-miterlimit/g, 'strokeMiterlimit');
            inner = inner.replace(/fill-rule/g, 'fillRule');
            inner = inner.replace(/clip-rule/g, 'clipRule');
            inner = inner.replace(/clip-path/g, 'clipPath');
            
            // Re-map colors to props
            // react-iconly usually outputs stroke="currentColor" or fill="currentColor"
            inner = inner.replace(/stroke="currentColor"/g, 'stroke={primaryColor || color}');
            inner = inner.replace(/fill="currentColor"/g, 'fill={primaryColor || color}');
            
            // Stroke width override
            inner = inner.replace(/strokeWidth="1.5px"/g, 'strokeWidth={strokeWidthOverride}');
            
            // Fix tags (path -> Path, g -> G, mask -> Mask)
            inner = inner.replace(/<path /g, '<Path ');
            inner = inner.replace(/<\/path>/g, '</Path>');
            inner = inner.replace(/<g /g, '<G ');
            inner = inner.replace(/<g>/g, '<G>');
            inner = inner.replace(/<\/g>/g, '</G>');
            inner = inner.replace(/<mask /g, '<Mask ');
            inner = inner.replace(/<\/mask>/g, '</Mask>');
            inner = inner.replace(/<rect /g, '<Rect ');
            inner = inner.replace(/<\/rect>/g, '</Rect>');
            
            return inner;
        };

        const curvedInner = extractInner(curvedMarkup);
        const boldInner = extractInner(boldMarkup);
        
        fileContent += `export const ${name} = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'regular', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                ${boldInner}
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            ${curvedInner}
        </Svg>
    );
};
`;
    } catch (e) {
        console.error("Failed for " + name, e);
    }
}

// Add the custom icons that don't exist in Iconly (so we don't break the app)
const customIcons = `
export const ShieldDoneIcon = ShieldDone;
export const LogOutIcon = Logout;
export const CameraIcon = Camera;
export const MailIcon = Message;
export const PhoneIcon = Call;
export const LocationIcon = Location;
export const CalendarIcon = Calendar;
export const KeyIcon = Password;
export const CrownIcon = TicketStar;
export const TrophyIcon = TicketStar;
export const WalletIcon = Wallet;
export const MessageIcon = Chat;
export const LinkIcon = Paper;
export const ActivityIcon = Activity;
export const UsersIcon = TwoUsers;
export const SparklesIcon = Discovery;
export const HelpIcon = InfoCircle;
export const AtSignIcon = Message;
`;

fileContent += customIcons;

const outPath = path.join(__dirname, 'mobile-app', 'components', 'Iconly.tsx');
fs.writeFileSync(outPath, fileContent);
console.log('Successfully generated Iconly.tsx with authentic SVG paths!');
