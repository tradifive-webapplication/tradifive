import React from 'react';
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
  style?: any;
}

const getStrokeWidth = (stroke: any) => {
    if (stroke === 'bold') return 2;
    if (stroke === 'light') return 1;
    return 1.5;
}

const getSize = (size: any) => {
    if (typeof size === 'number') return size;
    switch(size) {
        case 'small': return 16;
        case 'large': return 32;
        case 'xlarge': return 48;
        case 'medium':
        default: return 24;
    }
}

export const Activity = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M5.4,20a5.469,5.469,0,0,1-3.976-1.428A5.474,5.474,0,0,1,0,14.6V7.2A5.5,5.5,0,0,1,1.425,3.215,5.455,5.455,0,0,1,5.4,1.78H13.45a4.858,4.858,0,0,0-.059.75A4.069,4.069,0,0,0,17.45,6.6a4.668,4.668,0,0,0,.74-.068V14.6a5.47,5.47,0,0,1-1.425,3.973A5.466,5.466,0,0,1,12.79,20ZM7.19,8.96a.781.781,0,0,0-.5.3L3.731,13.11l-.061.09a.747.747,0,0,0,.21.95.832.832,0,0,0,.46.15h.026A.715.715,0,0,0,4.93,14l2.51-3.231,2.849,2.141.09.058a.749.749,0,0,0,.95-.21l2.89-3.729-.04.02A.75.75,0,0,0,14.26,8.3a.736.736,0,0,0-.608-.439c-.028,0-.056,0-.084,0a.768.768,0,0,0-.617.314L10.531,11.3,7.76,9.121a.783.783,0,0,0-.481-.165C7.25,8.956,7.22,8.958,7.19,8.96Zm7.99-6.55a2.41,2.41,0,1,1,2.41,2.41A2.411,2.411,0,0,1,15.18,2.41Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.45 2.35)"><Path d="M0,4.989,2.993,1.1,6.407,3.78,9.336,0" transform="translate(4.468 7.515)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M1.922,0A1.922,1.922,0,1,1,0,1.922,1.921,1.921,0,0,1,1.922,0Z" transform="translate(15.296 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M18.306,6.216A20.809,20.809,0,0,1,18.5,9.25c0,6.938-2.312,9.25-9.25,9.25S0,16.188,0,9.25,2.313,0,9.25,0a20.931,20.931,0,0,1,2.983.187" transform="translate(0 0.703)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const AddUser = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2.5)"><Path d="M0,15.746c0-2.585,3.454-3.231,7.5-3.231,4.067,0,7.5.669,7.5,3.253S11.545,19,7.5,19C3.434,19,0,18.329,0,15.746Zm16.1-5.658V8.911H14.9a.912.912,0,0,1,0-1.823h1.2V5.911a.9.9,0,1,1,1.8,0V7.088h1.2a.912.912,0,0,1,0,1.823H17.9v1.177a.9.9,0,1,1-1.8,0ZM2.537,5.027a4.963,4.963,0,1,1,9.925,0,4.963,4.963,0,1,1-9.925,0Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.85 2.15)"><Path d="M7.072,7.3C3.258,7.3,0,6.721,0,4.411S3.237,0,7.072,0c3.814,0,7.072,2.081,7.072,4.39S10.907,7.3,7.072,7.3Z" transform="translate(0 12.36)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.533,9.066a4.517,4.517,0,1,0-.032,0Z" transform="translate(2.539 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5,0V4.01" transform="translate(15.781 5.979)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.09.5H0" transform="translate(14.237 7.484)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ArrowDown = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(6 3)"><Path d="M4.87,17.625c-.059-.058-.305-.274-.51-.477A22.081,22.081,0,0,1,.336,11.257,4.815,4.815,0,0,1,0,10.058a2,2,0,0,1,.22-.91,1.883,1.883,0,0,1,.9-.808,9.781,9.781,0,0,1,1.065-.261,23.616,23.616,0,0,1,3.805-.244,27.187,27.187,0,0,1,3.688.216,8.15,8.15,0,0,1,1.328.347A1.815,1.815,0,0,1,12,10v.058a5.023,5.023,0,0,1-.408,1.343,22.023,22.023,0,0,1-3.966,5.761,5.686,5.686,0,0,1-.553.491A1.771,1.771,0,0,1,6.008,18,1.853,1.853,0,0,1,4.87,17.625ZM4.81,5.2,4.483,1.5a1.518,1.518,0,0,1,3.036,0L7.191,5.2a1.191,1.191,0,0,1-2.381,0Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(5.5 4)"><Path d="M.5,15V0" transform="translate(6.274 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M12.049,0S8.788,6.05,6.026,6.05,0,0,0,0" transform="translate(0.75 9.7)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ArrowDownSquare = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M14.33,20H5.66C2.275,20,0,17.621,0,14.08V5.91C0,2.375,2.275,0,5.66,0h8.67C17.721,0,20,2.375,20,5.91V14.08C20,17.621,17.721,20,14.33,20ZM6.25,9.57a.787.787,0,0,0-.529.22.753.753,0,0,0,0,1.06L9.47,14.62a.772.772,0,0,0,1.06,0l3.75-3.769a.751.751,0,0,0,0-1.06.767.767,0,0,0-1.07,0L10.75,12.27V5.92A.751.751,0,0,0,10,5.17a.742.742,0,0,0-.75.751v6.35L6.78,9.79A.763.763,0,0,0,6.25,9.57Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M.5,8.172V0" transform="translate(9.5 5.914)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M7.5,0S4.972,3.764,3.748,3.764,0,0,0,0" transform="translate(6.252 10.322)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ArrowLeft = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3 6)"><Path d="M7.942,12A5.023,5.023,0,0,1,6.6,11.592,22.626,22.626,0,0,1,1.006,7.8l-.379-.4a3.6,3.6,0,0,1-.281-.334A1.771,1.771,0,0,1,0,6.008,1.853,1.853,0,0,1,.375,4.87l.39-.42.087-.09A22.081,22.081,0,0,1,6.743.336L6.987.242A4.065,4.065,0,0,1,7.942,0a2,2,0,0,1,.91.22,1.883,1.883,0,0,1,.808.9,9.781,9.781,0,0,1,.261,1.065,22.351,22.351,0,0,1,.243,3.451v.354a27.187,27.187,0,0,1-.216,3.688l-.113.544a3.9,3.9,0,0,1-.233.784A1.815,1.815,0,0,1,8,12ZM12.8,7.191a1.191,1.191,0,0,1,0-2.381l3.7-.327a1.518,1.518,0,0,1,0,3.036Z" transform="translate(0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(20 5.5) rotate(90)"><Path d="M.5,15V0" transform="translate(6.274 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M12.049,0S8.788,6.05,6.026,6.05,0,0,0,0" transform="translate(0.75 9.7)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ArrowLeftSquare = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M14.09,20H5.92C2.379,20,0,17.721,0,14.33V5.66C0,2.275,2.379,0,5.92,0h8.17C17.625,0,20,2.275,20,5.66v8.67C20,17.721,17.625,20,14.09,20ZM9.68,5.5a.742.742,0,0,0-.53.218L5.38,9.47a.774.774,0,0,0,0,1.06l3.77,3.75a.754.754,0,0,0,1.059,0,.766.766,0,0,0,0-1.07L7.73,10.75h6.35A.751.751,0,0,0,14.83,10a.742.742,0,0,0-.751-.75H7.73L10.21,6.78a.763.763,0,0,0,.22-.53.787.787,0,0,0-.22-.529A.742.742,0,0,0,9.68,5.5Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(22 2) rotate(90)"><Path d="M.5,8.172V0" transform="translate(9.5 5.914)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M7.5,0S4.972,3.764,3.748,3.764,0,0,0,0" transform="translate(6.252 10.322)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ArrowRight = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3 6)"><Path d="M9.149,11.781a1.889,1.889,0,0,1-.808-.9,9.727,9.727,0,0,1-.261-1.064A22.373,22.373,0,0,1,7.836,6.36V6.007a27.187,27.187,0,0,1,.216-3.688l.113-.544A3.886,3.886,0,0,1,8.4.992,1.814,1.814,0,0,1,10,0h.058A5.023,5.023,0,0,1,11.4.408,22.606,22.606,0,0,1,16.994,4.2l.379.4a3.481,3.481,0,0,1,.281.334A1.766,1.766,0,0,1,18,5.992a1.853,1.853,0,0,1-.375,1.138l-.39.42-.087.09a22.081,22.081,0,0,1-5.891,4.024l-.244.094a4.065,4.065,0,0,1-.955.242A2.005,2.005,0,0,1,9.149,11.781ZM0,6A1.511,1.511,0,0,1,1.5,4.482l3.7.327a1.191,1.191,0,0,1,0,2.381l-3.7.328A1.511,1.511,0,0,1,0,6Z" transform="translate(0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(4 18.5) rotate(-90)"><Path d="M.5,15V0" transform="translate(6.274 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M12.049,0S8.788,6.05,6.026,6.05,0,0,0,0" transform="translate(0.75 9.7)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ArrowRightSquare = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M14.08,20H5.91C2.375,20,0,17.725,0,14.34V5.67C0,2.279,2.375,0,5.91,0H14.08C17.621,0,20,2.279,20,5.67v8.67C20,17.725,17.621,20,14.08,20ZM5.92,9.25A.751.751,0,0,0,5.17,10a.742.742,0,0,0,.751.75h6.35L9.79,13.22a.763.763,0,0,0-.22.53.792.792,0,0,0,.22.53.755.755,0,0,0,1.06,0l3.769-3.75a.772.772,0,0,0,0-1.06L10.85,5.72a.753.753,0,0,0-1.06,0,.766.766,0,0,0,0,1.069L12.27,9.25Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 22) rotate(-90)"><Path d="M.5,8.172V0" transform="translate(9.5 5.914)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M7.5,0S4.972,3.764,3.748,3.764,0,0,0,0" transform="translate(6.252 10.322)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ArrowUp = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(6 3)"><Path d="M4.482,16.5l.327-3.7a1.191,1.191,0,0,1,2.381,0l.328,3.7a1.518,1.518,0,0,1-3.036,0ZM2.318,9.949l-.544-.113A3.886,3.886,0,0,1,.992,9.6,1.814,1.814,0,0,1,0,8V7.942A5.023,5.023,0,0,1,.408,6.6,22.605,22.605,0,0,1,4.2,1.006l.4-.379A3.481,3.481,0,0,1,4.928.347,1.766,1.766,0,0,1,5.992,0,1.853,1.853,0,0,1,7.13.375l.42.39.09.087a22.081,22.081,0,0,1,4.024,5.891l.094.244A4.065,4.065,0,0,1,12,7.942a2.005,2.005,0,0,1-.219.91,1.889,1.889,0,0,1-.9.808,9.728,9.728,0,0,1-1.064.261,22.373,22.373,0,0,1-3.452.243H6.007A27.187,27.187,0,0,1,2.318,9.949Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(18.5 20) rotate(180)"><Path d="M.5,15V0" transform="translate(6.274 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M12.049,0S8.788,6.05,6.026,6.05,0,0,0,0" transform="translate(0.75 9.7)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ArrowUpSquare = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M14.34,20H5.67C2.279,20,0,17.625,0,14.09V5.92C0,2.379,2.279,0,5.67,0h8.67C17.725,0,20,2.379,20,5.92v8.17C20,17.625,17.725,20,14.34,20ZM9.25,7.73v6.35a.751.751,0,0,0,.75.751.742.742,0,0,0,.75-.751V7.73l2.47,2.479a.763.763,0,0,0,.53.22.792.792,0,0,0,.53-.22.75.75,0,0,0,0-1.059L10.53,5.38a.774.774,0,0,0-1.06,0L5.72,9.15a.752.752,0,0,0,0,1.059.764.764,0,0,0,1.069,0L9.248,7.732Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(22 22) rotate(180)"><Path d="M.5,8.172V0" transform="translate(9.5 5.914)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M7.5,0S4.972,3.764,3.748,3.764,0,0,0,0" transform="translate(6.252 10.322)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Bag = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3 2)"><Path d="M13.159,20H4.868c-1.88,0-3.175-.438-3.958-1.338C.091,17.72-.172,16.3.105,14.314L.883,8.12A4.081,4.081,0,0,1,2.076,5.708,2.736,2.736,0,0,1,3.932,5H4.01a.679.679,0,0,1,0-.226,5,5,0,0,1,9.991,0h-.026A.517.517,0,0,1,13.93,5h.157a2.668,2.668,0,0,1,1.827.731,4.388,4.388,0,0,1,1.23,2.389l.769,6.195a5.133,5.133,0,0,1-.906,4.23A4.914,4.914,0,0,1,13.159,20ZM11.885,8.33a.91.91,0,1,0,.884.909A.9.9,0,0,0,11.885,8.33ZM6.1,8.33a.91.91,0,1,0,.884.909A.9.9,0,0,0,6.1,8.33ZM8.966,1.3A3.482,3.482,0,0,0,5.482,4.774a.633.633,0,0,1,0,.226h7.011a.653.653,0,0,1-.043-.226A3.482,3.482,0,0,0,8.966,1.3Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.95 2.55)"><Path d="M8.659,4.32A4.33,4.33,0,0,0,0,4.3V4.32" transform="translate(4.755 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.523.5H.477" transform="translate(11.5 8.324)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.523.5H.477" transform="translate(5.669 8.324)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M9.084,14.934c-6.508,0-7.257-2.05-8.718-7.467C-1.1,2.033,1.841,0,9.084,0S19.268,2.033,17.8,7.467C16.341,12.884,15.592,14.934,9.084,14.934Z" transform="translate(0 4.006)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Bag2 = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2.5 2)"><Path d="M14.123,20H4.877A4.945,4.945,0,0,1,0,15V9.48A4.95,4.95,0,0,1,4.877,4.47h.2A4.577,4.577,0,0,1,6.388,1.31,4.44,4.44,0,0,1,9.509,0a4.324,4.324,0,0,1,3.1,1.309A4.56,4.56,0,0,1,13.918,4.47h.2A4.95,4.95,0,0,1,19,9.48V15A4.945,4.945,0,0,1,14.123,20ZM13.207,5.66a.742.742,0,0,0-.732.75V7.57a.732.732,0,1,0,1.463,0V6.41A.742.742,0,0,0,13.207,5.66Zm-7.5,0a.751.751,0,0,0-.732.75V7.57a.732.732,0,1,0,1.463,0V6.41A.742.742,0,0,0,5.706,5.66Zm3.8-4.16a2.979,2.979,0,0,0-2.1.879A3.092,3.092,0,0,0,6.545,4.47h5.91A3,3,0,0,0,9.509,1.5Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.95 2.65)"><Path d="M7.562,6.822V3.79A3.781,3.781,0,1,0,0,3.773V6.822" transform="translate(5.238 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,7.059C0,1.765,2.255,0,9.019,0s9.019,1.765,9.019,7.059-2.255,7.058-9.019,7.058S0,12.352,0,7.059Z" transform="translate(0 4.499)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Bookmark = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(4 2)"><Path d="M14.986,20a1.026,1.026,0,0,1-.515-.141L7.99,16.62,1.5,19.86a1.069,1.069,0,0,1-.491.13A1.016,1.016,0,0,1,0,18.97V3.79A3.316,3.316,0,0,1,1.437.875,6.154,6.154,0,0,1,4.9,0h6.17a6.181,6.181,0,0,1,3.47.875A3.362,3.362,0,0,1,16,3.79V18.97a1.022,1.022,0,0,1-.74.99A.933.933,0,0,1,14.986,20ZM4.22,6.04a.79.79,0,0,0,0,1.58h7.53a.79.79,0,0,0,0-1.58Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(4.5 2.5)"><Path d="M0,.5H6.855" transform="translate(4.042 6.218)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M7.47,0C1.083,0,0,.932,0,8.429,0,16.822-.153,19,1.443,19s4.2-3.684,6.027-3.684S11.9,19,13.5,19s1.439-2.178,1.439-10.571C14.936.932,13.857,0,7.47,0Z" transform="translate(0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Buy = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M15.149,18.459A1.514,1.514,0,1,1,16.668,20,1.535,1.535,0,0,1,15.149,18.459Zm-11.241,0A1.514,1.514,0,1,1,5.426,20,1.534,1.534,0,0,1,3.908,18.459Zm1.679-3.164a2.509,2.509,0,0,1-1.726-.689,2.616,2.616,0,0,1-.812-1.7L2.129,1.784.62,1.518A.766.766,0,0,1,.765,0,.817.817,0,0,1,.88.009L3.263.375a.768.768,0,0,1,.619.694l.19,2.286a.617.617,0,0,0,.609.572H18.176a1.689,1.689,0,0,1,1.409.684,2.251,2.251,0,0,1,.38,1.754l-.95,6.694a2.582,2.582,0,0,1-2.528,2.235Zm5.785-6.826a.758.758,0,0,0,.75.765h2.767a.758.758,0,0,0,.75-.765.75.75,0,0,0-.75-.766H12.121A.75.75,0,0,0,11.372,8.468Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.65 2.85)"><Path d="M2.044,3.58c9.848-1.337,12.187-.6,13.717,1.14s1.261,6.917-.528,8.516-9.553,1.751-12.013,0C.621,11.386,2.129,5.692,2.044,2.243,2.1.313,0,0,0,0" transform="translate(0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,.5H2.773" transform="translate(10.506 7.37)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.545,0A.545.545,0,1,1,0,.544.545.545,0,0,1,.545,0Z" transform="translate(3.069 17.277)" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.544,0A.545.545,0,1,1,0,.544.545.545,0,0,1,.544,0Z" transform="translate(13.401 17.277)" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Calendar = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3 2)"><Path d="M5.152,20H5.141A5.152,5.152,0,0,1,1.4,18.619,5.139,5.139,0,0,1,.011,14.88L0,6.553a5.089,5.089,0,0,1,1.219-3.5A4.939,4.939,0,0,1,4.506,1.53V.78a.773.773,0,0,1,.22-.553.766.766,0,0,1,1.3.552v.7l5.865-.008V.77a.77.77,0,0,1,.218-.552.766.766,0,0,1,1.3.55v.75a4.966,4.966,0,0,1,3.321,1.487A4.993,4.993,0,0,1,17.989,6.49L18,14.916c0,3.125-1.961,5.07-5.128,5.074Zm7.891-5.808a.833.833,0,0,0-.809.851.83.83,0,1,0,.819-.851Zm-8.126,0h0a.851.851,0,0,0-.808.86.823.823,0,0,0,.811.8h.039a.809.809,0,0,0,.565-.265.821.821,0,0,0,.215-.6.813.813,0,0,0-.819-.8Zm4.068-.005h0a.855.855,0,0,0-.808.861.823.823,0,0,0,.814.8h.036a.823.823,0,0,0,.779-.861.813.813,0,0,0-.819-.8ZM4.912,10.594h0a.851.851,0,0,0-.808.86.821.821,0,0,0,.812.8h.039a.806.806,0,0,0,.563-.265.823.823,0,0,0,.214-.6.812.812,0,0,0-.818-.8Zm4.069-.035h0a.851.851,0,0,0-.809.86.823.823,0,0,0,.815.8h.036a.825.825,0,0,0,.778-.861.813.813,0,0,0-.818-.8Zm4.07.006h0a.826.826,0,0,0-.808.839v.012a.813.813,0,0,0,.821.8h.019a.825.825,0,0,0-.028-1.649ZM4.508,3.058c-1.985.2-2.991,1.375-2.988,3.493l0,.311,14.948-.02v-.35C16.428,4.379,15.4,3.22,13.414,3.047v.77a.764.764,0,0,1-1.3.547.773.773,0,0,1-.217-.545V3.01l-5.865.008,0,.808a.765.765,0,0,1-1.3.547.773.773,0,0,1-.217-.546v-.77Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.75 2.05)"><Path d="M0,9.274C0,2.318,2.319,0,9.274,0s9.275,2.318,9.275,9.274-2.319,9.274-9.275,9.274S0,16.23,0,9.274Z" transform="translate(0 1.452)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,.5H18.008" transform="translate(0.275 6.774)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(13.183 10.711)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(8.784 10.711)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(4.376 10.711)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(13.183 14.563)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(8.784 14.563)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(4.376 14.563)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5,0V3.262" transform="translate(12.783 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5,0V3.262" transform="translate(4.775 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Call = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2.001)"><Path d="M16.167,12.379a2.279,2.279,0,0,0-1.674.44c-.482.281-1.4,1.024-1.923.834a11.932,11.932,0,0,1-6.313-6.16c-.193-.536.547-1.458.825-1.946a2.335,2.335,0,0,0,.436-1.685A13.7,13.7,0,0,0,5.189.615,1.912,1.912,0,0,0,4.021,0C2.52-.063.844,1.94.549,2.419-.187,3.441-.183,4.8.562,6.45c1.8,4.428,8.586,11.112,13.031,12.974A5.371,5.371,0,0,0,15.837,20a2.919,2.919,0,0,0,1.751-.549c.381-.219,2.466-1.979,2.411-3.521a1.941,1.941,0,0,0-.608-1.166,13.8,13.8,0,0,0-3.224-2.385" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.5 2.5)"><Path d="M5.7,13.3C-1.2,6.4-.217,3.241.511,2.223.6,2.059,2.906-1.388,5.375.634,11.5,5.679,3.745,4.966,8.889,10.111s4.432-2.611,9.476,3.514c2.022,2.469-1.425,4.772-1.588,4.864C15.76,19.217,12.6,20.2,5.7,13.3Z" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const CallMissed = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M13.3,19.439C8.949,17.623,2.306,11.109.549,6.791-.178,5.185-.184,3.86.537,2.864.825,2.4,2.466.445,3.934.506a1.884,1.884,0,0,1,1.143.6A13.314,13.314,0,0,1,7.356,4.27a2.269,2.269,0,0,1-.427,1.643c-.273.474-1,1.372-.807,1.9a11.651,11.651,0,0,0,6.176,6c.514.186,1.41-.538,1.881-.812a2.241,2.241,0,0,1,1.638-.429A13.523,13.523,0,0,1,18.971,14.9a1.878,1.878,0,0,1,.594,1.138c.054,1.5-1.986,3.218-2.359,3.432A2.861,2.861,0,0,1,15.494,20,5.276,5.276,0,0,1,13.3,19.439ZM18.492,7.584l-2.4-2.413-2.4,2.413a.9.9,0,0,1-1.248,0,.89.89,0,0,1,0-1.254l2.4-2.413L12.435,1.5a.89.89,0,0,1,0-1.254.9.9,0,0,1,1.248,0l2.4,2.413,2.4-2.413a.9.9,0,0,1,1.248,0,.888.888,0,0,1,0,1.254l-2.4,2.413,2.4,2.413a.888.888,0,0,1,0,1.254.879.879,0,0,1-1.248,0Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M6,0,0,6" transform="translate(13.328 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0,6,6" transform="translate(13.328 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M5.7,13.3C-1.2,6.4-.217,3.241.511,2.222.6,2.059,2.906-1.388,5.375.634,11.5,5.679,3.745,4.966,8.89,10.111s4.431-2.611,9.476,3.514c2.022,2.469-1.425,4.77-1.588,4.864C15.759,19.217,12.6,20.2,5.7,13.3Z" transform="translate(0 1)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const CallSilent = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 1.5)"><Path d="M.245,20.746a.9.9,0,0,1-.129-1.058l.03-.041a.518.518,0,0,1,.069-.091L18.176,1.13A.814.814,0,0,1,18.77.864a.853.853,0,0,1,.6.266.892.892,0,0,1,0,1.229V2.37L9.958,12.015l-.572.587.8-.82a11.186,11.186,0,0,0,2.626,1.566c.506.192,1.378-.54,1.844-.814a2.163,2.163,0,0,1,1.606-.427,13.159,13.159,0,0,1,3.1,2.327,1.978,1.978,0,0,1,.585,1.139C20,17.087,18,18.8,17.63,19.018a2.792,2.792,0,0,1-1.686.539A5.046,5.046,0,0,1,13.794,19,24.043,24.043,0,0,1,7.52,14.516l-6.075,6.23A.857.857,0,0,1,.85,21,.9.9,0,0,1,.245,20.746ZM1.275,6.3C.562,4.7.552,3.366,1.265,2.37,1.543,1.9,3.158-.059,4.6,0a1.78,1.78,0,0,1,1.12.6,13.472,13.472,0,0,1,2.24,3.171,2.315,2.315,0,0,1-.417,1.657c-.267.468-.981,1.372-.793,1.9A10.335,10.335,0,0,0,7.827,9.3L5.141,12.056A21.819,21.819,0,0,1,1.275,6.3Z" transform="translate(0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M3.609,11.058C-.977,5.7-.129,3.127.509,2.225c.1-.17,2.4-3.61,4.861-1.592,4.851,4,1,4.385,1.742,6.922" transform="translate(0 1)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M3.185,0c4.927,4.746,4.3-2.728,9.278,3.312C14.49,5.786,11.04,8.079,10.87,8.175,9.874,8.9,6.762,9.863,0,3.185" transform="translate(5.901 11.314)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,18.5,18.5,0" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Calling = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M13.12,19.446C8.83,17.655,2.275,11.231.543,6.974-.176,5.389-.182,4.082.531,3.1.815,2.639,2.433.713,3.882.774a1.863,1.863,0,0,1,1.128.59A13.212,13.212,0,0,1,7.258,4.486a2.233,2.233,0,0,1-.422,1.62c-.267.468-.982,1.354-.8,1.871a11.491,11.491,0,0,0,6.093,5.92c.506.184,1.391-.53,1.857-.8a2.211,2.211,0,0,1,1.616-.424,13.422,13.422,0,0,1,3.112,2.293,1.856,1.856,0,0,1,.585,1.121c.054,1.482-1.96,3.174-2.327,3.385a2.822,2.822,0,0,1-1.69.527A5.191,5.191,0,0,1,13.12,19.446ZM14.835,7.931h0a3.461,3.461,0,0,0-2.743-2.75.86.86,0,0,1,.327-1.689,5.175,5.175,0,0,1,4.1,4.11.865.865,0,0,1-.678,1.011.945.945,0,0,1-.166.015A.86.86,0,0,1,14.835,7.931Zm3.456-.075a6.912,6.912,0,0,0-6.126-6.138A.863.863,0,0,1,11.731.184a.818.818,0,0,1,.625-.176,8.617,8.617,0,0,1,7.638,7.656.857.857,0,0,1-.756.95.705.705,0,0,1-.1.006A.856.856,0,0,1,18.291,7.856Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M0,0A7.971,7.971,0,0,1,7.041,7.032" transform="translate(12.352 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0A4.426,4.426,0,0,1,3.5,3.5" transform="translate(12.352 4.293)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M5.7,13.3C-1.2,6.4-.217,3.241.511,2.223.6,2.059,2.906-1.388,5.375.634,11.5,5.679,3.745,4.966,8.889,10.111S13.32,7.5,18.366,13.625c2.022,2.469-1.425,4.772-1.588,4.864C15.76,19.217,12.6,20.2,5.7,13.3Z" transform="translate(0 1)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Camera = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 3)"><Path d="M15.64,18H4.36A4.362,4.362,0,0,1,0,13.645V7.711A4.362,4.362,0,0,1,4.36,3.356a.2.2,0,0,0,.191-.12l.059-.12.083-.175c.261-.55.557-1.173.737-1.533A2.433,2.433,0,0,1,7.64,0h4.71a2.44,2.44,0,0,1,2.22,1.408c.157.315.4.82.627,1.308l.142.3.1.22a.225.225,0,0,0,.2.12A4.362,4.362,0,0,1,20,7.711v5.934A4.362,4.362,0,0,1,15.64,18ZM10,6.4A3.922,3.922,0,0,0,7.21,7.562a3.867,3.867,0,0,0-1.14,2.767A3.924,3.924,0,0,0,10,14.254a3.9,3.9,0,0,0,2.77-1.148,3.915,3.915,0,0,0,.01-5.554A3.9,3.9,0,0,0,10,6.4Zm5.61-.239a.9.9,0,1,0,.911.909A.906.906,0,0,0,15.61,6.163ZM10,12.756a2.423,2.423,0,0,1-2.43-2.427v-.01a2.337,2.337,0,0,1,.7-1.7A2.43,2.43,0,1,1,10,12.756Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.5 3.042)"><Path d="M6.291,3.145A3.145,3.145,0,1,0,3.145,6.291,3.146,3.146,0,0,0,6.291,3.145Z" transform="translate(6.648 6.311)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M9,17.158c8.045,0,9-2.411,9-7.634,0-3.661-.484-5.62-3.534-6.462a1.927,1.927,0,0,1-.842-.534c-.406-.445-.7-1.813-1.684-2.226A14.475,14.475,0,0,0,6.06.3C5.1.7,4.782,2.083,4.376,2.529a1.921,1.921,0,0,1-.842.534C.484,3.9,0,5.863,0,9.525,0,14.748.958,17.158,9,17.158Z" transform="translate(0.789 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(14.209 5.458)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const CaretDown = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(6.5 3)"><Path d="M10.91,9.141a.715.715,0,0,0-.627-.38H6.217V.734a.717.717,0,1,0-1.435,0V8.762H.717a.712.712,0,0,0-.627.38.748.748,0,0,0,.02.746l4.783,7.77a.709.709,0,0,0,1.215,0l4.783-7.77a.748.748,0,0,0,.02-.746" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(6.5 3)"><Path d="M.5,8.95V0" transform="translate(4.894 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.65,7.654C5.906,7.654,9.921,1.29,9.2.568S.892-.223.1.568,3.395,7.654,4.65,7.654Z" transform="translate(0.75 9.7)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const CaretLeft = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3 6.5)"><Path d="M8.859,10.91a.715.715,0,0,0,.38-.627V6.217h8.027a.717.717,0,1,0,0-1.435H9.238V.717A.712.712,0,0,0,8.859.09a.748.748,0,0,0-.746.02L.343,4.893a.709.709,0,0,0,0,1.215l7.77,4.783a.748.748,0,0,0,.746.02" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(21 6.5) rotate(90)"><Path d="M.5,8.95V0" transform="translate(4.894 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.65,7.654C5.906,7.654,9.921,1.29,9.2.568S.892-.223.1.568,3.395,7.654,4.65,7.654Z" transform="translate(0.75 9.7)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const CaretRight = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3 6.5)"><Path d="M9.141.09a.715.715,0,0,0-.38.627V4.783H.734a.717.717,0,1,0,0,1.435H8.762v4.065a.712.712,0,0,0,.38.627.748.748,0,0,0,.746-.02l7.77-4.783a.709.709,0,0,0,0-1.215L9.888.11A.748.748,0,0,0,9.141.09" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3 17.5) rotate(-90)"><Path d="M.5,8.95V0" transform="translate(4.894 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.65,7.654C5.906,7.654,9.921,1.29,9.2.568S.892-.223.1.568,3.395,7.654,4.65,7.654Z" transform="translate(0.75 9.7)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const CaretUp = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(6.5 3)"><Path d="M.09,8.859a.715.715,0,0,0,.627.38H4.783v8.027a.717.717,0,1,0,1.435,0V9.238h4.065a.712.712,0,0,0,.627-.38.748.748,0,0,0-.02-.746L6.107.343a.709.709,0,0,0-1.215,0L.11,8.112a.748.748,0,0,0-.02.746" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(17.5 21) rotate(180)"><Path d="M.5,8.95V0" transform="translate(4.894 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.65,7.654C5.906,7.654,9.921,1.29,9.2.568S.892-.223.1.568,3.395,7.654,4.65,7.654Z" transform="translate(0.75 9.7)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Category = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M14.081,20a2.549,2.549,0,0,1-2.541-2.56V14.031a2.543,2.543,0,0,1,2.541-2.561h3.38A2.549,2.549,0,0,1,20,14.031v3.408A2.554,2.554,0,0,1,17.46,20ZM2.54,20A2.555,2.555,0,0,1,0,17.439V14.031A2.549,2.549,0,0,1,2.54,11.47H5.92a2.543,2.543,0,0,1,2.54,2.561v3.408A2.548,2.548,0,0,1,5.92,20ZM14.081,8.53A2.542,2.542,0,0,1,11.54,5.97V2.561A2.549,2.549,0,0,1,14.081,0h3.38A2.554,2.554,0,0,1,20,2.561V5.97a2.548,2.548,0,0,1-2.54,2.56ZM2.54,8.53A2.548,2.548,0,0,1,0,5.97V2.561A2.555,2.555,0,0,1,2.54,0H5.92A2.549,2.549,0,0,1,8.46,2.561V5.97A2.542,2.542,0,0,1,5.92,8.53Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3 3)"><Path d="M7.347,3.674A3.673,3.673,0,1,1,3.673,0,3.674,3.674,0,0,1,7.347,3.674Z" transform="translate(10.654 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M7.347,3.674A3.673,3.673,0,1,1,3.673,0,3.674,3.674,0,0,1,7.347,3.674Z" transform="translate(0 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M7.347,3.674A3.673,3.673,0,1,1,3.673,0,3.674,3.674,0,0,1,7.347,3.674Z" transform="translate(10.654 10.588)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M7.347,3.674A3.673,3.673,0,1,1,3.673,0,3.673,3.673,0,0,1,7.347,3.674Z" transform="translate(0 10.588)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Chart = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M14.669,20H5.33a5.352,5.352,0,0,1-3.94-1.39A5.353,5.353,0,0,1,0,14.67V5.33a5.353,5.353,0,0,1,1.389-3.94A5.353,5.353,0,0,1,5.33,0h9.339a5.345,5.345,0,0,1,3.937,1.389A5.38,5.38,0,0,1,20,5.33v9.34a5.352,5.352,0,0,1-1.39,3.94A5.354,5.354,0,0,1,14.669,20Zm-.02-9.087a.865.865,0,0,0-.449.128.807.807,0,0,0-.38.789v3.28a.826.826,0,0,0,.83.75.843.843,0,0,0,.83-.75V11.83a.839.839,0,0,0-.391-.789A.823.823,0,0,0,14.649,10.913ZM10.051,4a.823.823,0,0,0-.44.128.847.847,0,0,0-.392.79V15.11a.843.843,0,0,0,.831.75.827.827,0,0,0,.83-.75V4.92a.816.816,0,0,0-.379-.79A.872.872,0,0,0,10.051,4ZM5.39,7.282a.822.822,0,0,0-.44.128.843.843,0,0,0-.39.79v6.91a.834.834,0,0,0,1.659,0V8.2a.845.845,0,0,0-.389-.79A.825.825,0,0,0,5.39,7.282Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.3 2.3)"><Path d="M.526,0V6.694" transform="translate(4.657 7.961)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.526,0V9.9" transform="translate(9.211 4.757)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.526,0V3.157" transform="translate(13.689 11.498)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,9.737C0,2.435,2.435,0,9.737,0s9.737,2.435,9.737,9.737-2.435,9.737-9.737,9.737S0,17.039,0,9.737Z" transform="translate(0 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Chat = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M10,20a9.955,9.955,0,0,1-4.92-1.3,2.2,2.2,0,0,0-1.107-.424,1.213,1.213,0,0,0-.383.063l-2.02.6a.754.754,0,0,1-.226.036.62.62,0,0,1-.5-.239.647.647,0,0,1-.094-.578l.67-2.244a1.046,1.046,0,0,0-.07-.9,10.566,10.566,0,0,1-1.35-5A10.158,10.158,0,0,1,2.831,3.032,9.89,9.89,0,0,1,10.02,0a9.865,9.865,0,0,1,7.12,2.994,10.058,10.058,0,0,1,2.1,3.182A9.89,9.89,0,0,1,20,9.985a10.138,10.138,0,0,1-.865,4.172,9.6,9.6,0,0,1-2.275,3.153A10.245,10.245,0,0,1,10,20ZM14.59,8.743a1.282,1.282,0,1,0,1.28,1.282A1.282,1.282,0,0,0,14.59,8.743Zm-4.629,0A1.268,1.268,0,0,0,8.7,10.015,1.28,1.28,0,1,0,9.98,8.743H9.961Zm-4.591,0a1.282,1.282,0,1,0,1.28,1.282A1.283,1.283,0,0,0,5.37,8.743Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M.5.5H.5" transform="translate(13.444 9.913)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(9.435 9.913)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(5.426 9.913)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M17.071,17.07a10.006,10.006,0,0,1-11.285,2c-.547-.22-4.085.76-4.853-.007s.213-4.307-.007-4.854A10,10,0,1,1,17.071,17.07Z" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ChevronDown = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(6 7)"><Path d="M4.869,9.631c-.058-.057-.306-.27-.51-.469a21.69,21.69,0,0,1-4.024-5.8A4.617,4.617,0,0,1,0,2.188a1.933,1.933,0,0,1,.218-.9A1.874,1.874,0,0,1,1.122.5,9.84,9.84,0,0,1,2.186.242,23.979,23.979,0,0,1,5.992,0,27.724,27.724,0,0,1,9.681.213a8.495,8.495,0,0,1,1.327.341A1.785,1.785,0,0,1,12,2.132v.057a4.879,4.879,0,0,1-.409,1.321A21.69,21.69,0,0,1,7.625,9.177a5.66,5.66,0,0,1-.554.482A1.783,1.783,0,0,1,6.007,10a1.875,1.875,0,0,1-1.138-.369" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(5 8.5)"><Path d="M14,0S9.856,7,7,7,0,0,0,0" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ChevronDownCircle = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M10,20A10,10,0,1,1,20,10,10.011,10.011,0,0,1,10,20ZM6.525,7.8A.737.737,0,0,0,6,8.02a.75.75,0,0,0-.225.54A.727.727,0,0,0,6,9.08l3.47,3.49a.75.75,0,0,0,1.06,0L14,9.08a.7.7,0,0,0,.22-.52A.75.75,0,0,0,14,8.02a.76.76,0,0,0-.529-.216.733.733,0,0,0-.531.226L10,10.98,7.06,8.03A.737.737,0,0,0,6.525,7.8Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0S2.392,3.486,3.472,3.486,6.942,0,6.942,0" transform="translate(6.529 8.558)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ChevronLeft = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(7 6)"><Path d="M.369,4.869c.057-.058.27-.306.469-.51A21.69,21.69,0,0,1,6.633.335,4.617,4.617,0,0,1,7.812,0a1.933,1.933,0,0,1,.9.218,1.874,1.874,0,0,1,.795.9,9.84,9.84,0,0,1,.256,1.064A23.979,23.979,0,0,1,10,5.992a27.724,27.724,0,0,1-.213,3.689,8.495,8.495,0,0,1-.341,1.327A1.785,1.785,0,0,1,7.868,12H7.812a4.879,4.879,0,0,1-1.321-.409A21.69,21.69,0,0,1,.823,7.625a5.66,5.66,0,0,1-.482-.554A1.783,1.783,0,0,1,0,6.007,1.875,1.875,0,0,1,.369,4.869" transform="translate(0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(15.5 5) rotate(90)"><Path d="M14,0S9.856,7,7,7,0,0,0,0" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ChevronLeftCircle = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M10,20A10,10,0,1,1,10,0l.28,0A10,10,0,0,1,10,20ZM11.446,5.775A.728.728,0,0,0,10.92,6L7.43,9.47a.747.747,0,0,0,0,1.06L10.92,14a.7.7,0,0,0,.52.22.745.745,0,0,0,.53-1.28L9.02,10l2.95-2.94A.745.745,0,0,0,11.98,6,.75.75,0,0,0,11.446,5.775Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(22 2) rotate(90)"><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0S2.392,3.486,3.472,3.486,6.942,0,6.942,0" transform="translate(6.529 8.558)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ChevronRight = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(7 6)"><Path d="M9.631,7.131c-.057.058-.27.306-.469.51a21.69,21.69,0,0,1-5.8,4.024A4.617,4.617,0,0,1,2.188,12a1.933,1.933,0,0,1-.9-.218,1.874,1.874,0,0,1-.795-.9A9.84,9.84,0,0,1,.242,9.814,23.979,23.979,0,0,1,0,6.008,27.724,27.724,0,0,1,.213,2.319,8.495,8.495,0,0,1,.554.992,1.785,1.785,0,0,1,2.132,0h.057A4.879,4.879,0,0,1,3.509.409,21.69,21.69,0,0,1,9.177,4.375a5.66,5.66,0,0,1,.482.554A1.783,1.783,0,0,1,10,5.993a1.875,1.875,0,0,1-.369,1.138" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(8.5 19) rotate(-90)"><Path d="M14,0S9.856,7,7,7,0,0,0,0" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ChevronRightCircle = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M10,20l-.28,0A10.011,10.011,0,1,1,10,20ZM8.56,5.78a.745.745,0,0,0-.53,1.28L10.98,10,8.03,12.94A.746.746,0,0,0,8.02,14a.752.752,0,0,0,.534.225A.727.727,0,0,0,9.08,14l3.49-3.47a.75.75,0,0,0,0-1.06L9.08,6A.7.7,0,0,0,8.56,5.78Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 22) rotate(-90)"><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0S2.392,3.486,3.472,3.486,6.942,0,6.942,0" transform="translate(6.529 8.558)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ChevronUp = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(6 7)"><Path d="M7.131.369c.058.057.306.27.51.469a21.69,21.69,0,0,1,4.024,5.8A4.617,4.617,0,0,1,12,7.812a1.933,1.933,0,0,1-.218.9,1.874,1.874,0,0,1-.9.795,9.84,9.84,0,0,1-1.064.256A23.979,23.979,0,0,1,6.008,10a27.724,27.724,0,0,1-3.689-.213A8.495,8.495,0,0,1,.992,9.446,1.785,1.785,0,0,1,0,7.868V7.812A4.879,4.879,0,0,1,.409,6.491,21.69,21.69,0,0,1,4.375.823,5.66,5.66,0,0,1,4.929.341,1.783,1.783,0,0,1,5.993,0,1.875,1.875,0,0,1,7.131.369" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(19 15.5) rotate(180)"><Path d="M14,0S9.856,7,7,7,0,0,0,0" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ChevronUpCircle = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M10,20A10,10,0,1,1,20,10l0,.28A10,10,0,0,1,10,20ZM10,9.02h0l2.94,2.949a.746.746,0,0,0,1.06.01.751.751,0,0,0,.225-.539A.729.729,0,0,0,14,10.92L10.53,7.43a.747.747,0,0,0-1.06,0L6,10.92a.7.7,0,0,0-.22.52.747.747,0,0,0,.22.54.758.758,0,0,0,.529.216.733.733,0,0,0,.531-.226L10,9.021Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(22 22) rotate(180)"><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0S2.392,3.486,3.472,3.486,6.942,0,6.942,0" transform="translate(6.529 8.558)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const CloseSquare = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 1.999)"><Path d="M14.34,20H5.67C2.279,20,0,17.625,0,14.091V5.92C0,2.379,2.279,0,5.67,0h8.67C17.725,0,20,2.379,20,5.92v8.171C20,17.625,17.725,20,14.34,20ZM10,11.231h0L11.78,13a.815.815,0,0,0,.61.261A.873.873,0,0,0,13.01,13a.869.869,0,0,0,0-1.228l-1.78-1.78L13.01,8.21a.875.875,0,0,0-.616-1.494.89.89,0,0,0-.624.256L10,8.75,8.22,6.971A.89.89,0,0,0,7.6,6.716.876.876,0,0,0,6.98,8.21L8.76,9.991,6.98,11.761a.88.88,0,0,0,.619,1.5A.873.873,0,0,0,8.22,13L10,11.232Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M4.792,0,0,4.792" transform="translate(7.602 7.595)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.8,4.8,0,0" transform="translate(7.6 7.593)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Danger = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 3)"><Path d="M17.316,18H2.679a3.129,3.129,0,0,1-.91-.2A2.809,2.809,0,0,1,.218,16.275,2.747,2.747,0,0,1,.21,14.146L7.529,1.433a2.746,2.746,0,0,1,1.1-1.08A2.819,2.819,0,0,1,9.993,0a2.853,2.853,0,0,1,2.484,1.442l7.268,12.615a2.936,2.936,0,0,1,.25,1,2.753,2.753,0,0,1-.73,2.021A2.841,2.841,0,0,1,17.316,18ZM10,12.272a.873.873,0,1,0,0,1.745.877.877,0,0,0,.869-.883A.867.867,0,0,0,10,12.272ZM10,6.09a.872.872,0,0,0-.88.862v2.8a.888.888,0,0,0,.88.873.872.872,0,0,0,.869-.873v-2.8A.867.867,0,0,0,10,6.09Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M0,9.25C0,2.313,2.313,0,9.25,0S18.5,2.313,18.5,9.25,16.187,18.5,9.25,18.5,0,16.187,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5,0V3.895" transform="translate(9.5 6.105)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(9.5 13)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Delete = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3 2)"><Path d="M5.132,19.961A2.916,2.916,0,0,1,2.2,17.134c-.313-2.847-.836-9.577-.846-9.645a.791.791,0,0,1,.191-.558A.708.708,0,0,1,2.068,6.7H15.939a.724.724,0,0,1,.523.234.745.745,0,0,1,.181.558c0,.068-.533,6.809-.837,9.645a2.918,2.918,0,0,1-3,2.827C11.515,19.99,10.249,20,9,20,7.681,20,6.387,19.99,5.132,19.961ZM.714,5.091A.73.73,0,0,1,0,4.357v-.38a.724.724,0,0,1,.714-.734H3.63A1.282,1.282,0,0,0,4.871,2.228l.152-.682A1.989,1.989,0,0,1,6.935,0h4.129a1.987,1.987,0,0,1,1.9,1.5l.163.73a1.28,1.28,0,0,0,1.241,1.016h2.916A.723.723,0,0,1,18,3.977v.38a.73.73,0,0,1-.713.734Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.5 2)"><Path d="M13.26,0c0,8.019,1.154,11.644-6.61,11.644S.064,8.019.064,0" transform="translate(2.129 7.554)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M16.15.476H0" transform="translate(0.715 4.004)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M6.874,3.766A3.207,3.207,0,0,0,3.448,0,3.207,3.207,0,0,0,.024,3.766" transform="translate(5.341 0.714)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Discount = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2.001)"><Path d="M10.006,20a3.024,3.024,0,0,1-2.131-.868l-.73-.732a1.489,1.489,0,0,0-1.06-.438H5.054a3.015,3.015,0,0,1-3.011-3.011V13.917a1.538,1.538,0,0,0-.44-1.071l-.72-.71a3.021,3.021,0,0,1-.01-4.259l.73-.732a1.5,1.5,0,0,0,.44-1.07V5.055A3.013,3.013,0,0,1,5.054,2.047h1.03a1.511,1.511,0,0,0,1.06-.441l.72-.72A3.017,3.017,0,0,1,12.127.877l.731.729a1.49,1.49,0,0,0,1.06.441h1.03a3.013,3.013,0,0,1,3.011,3.009V6.087A1.485,1.485,0,0,0,18.4,7.145l.72.72a3.03,3.03,0,0,1,.02,4.251l-.02.02-.01.01-.71.71a1.488,1.488,0,0,0-.441,1.061v1.029a3.014,3.014,0,0,1-3.011,3.011h-1.03a1.489,1.489,0,0,0-1.06.438l-.721.72A2.986,2.986,0,0,1,10.006,20Zm2.571-8.3a.875.875,0,1,0,.87.87A.877.877,0,0,0,12.578,11.7Zm-.005-5.144a.866.866,0,0,0-.616.254l-5.142,5.14a.88.88,0,0,0,0,1.239.829.829,0,0,0,.61.26.837.837,0,0,0,.62-.26l5.143-5.139a.875.875,0,0,0-.616-1.495Zm-5.137,0a.875.875,0,1,0,.87.869A.876.876,0,0,0,7.435,6.556Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M0,9.25C0,2.313,2.313,0,9.25,0S18.5,2.313,18.5,9.25,16.187,18.5,9.25,18.5,0,16.187,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,5.14,5.14,0" transform="translate(7.43 7.43)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(12 12)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(7 7)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Discovery = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M10,20A10,10,0,0,1,2.926,2.93,10,10,0,1,1,17.07,17.074,9.936,9.936,0,0,1,10,20ZM13.428,6.118a.459.459,0,0,0-.137.021L8.17,7.74a.669.669,0,0,0-.44.44l-1.6,5.13a.435.435,0,0,0,.064.393.45.45,0,0,0,.361.188.437.437,0,0,0,.135-.022l5.1-1.6a.644.644,0,0,0,.44-.44L13.85,6.71a.454.454,0,0,0-.066-.409A.445.445,0,0,0,13.428,6.118Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,6.6l1.574-5.03L6.6,0,5.03,5.029Z" transform="translate(6.698 6.698)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Document = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3 2)"><Path d="M13.191,20H4.81C1.753,20,0,18.236,0,15.16V4.83A4.91,4.91,0,0,1,1.265,1.271,4.863,4.863,0,0,1,4.81,0h8.382C16.247,0,18,1.761,18,4.83V15.16a4.891,4.891,0,0,1-1.246,3.583A4.819,4.819,0,0,1,13.191,20ZM5,13.736a.78.78,0,0,0-.668.374.786.786,0,0,0,.653,1.206.7.7,0,0,0,.1-.006H12.92a.79.79,0,0,0,0-1.57H5.08A.8.8,0,0,0,5,13.736ZM5.08,9.179a.78.78,0,0,0,0,1.561H12.92a.78.78,0,0,0,0-1.561Zm0-4.529v.01h0a.779.779,0,0,0,0,1.559h2.99a.785.785,0,0,0,0-1.57Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.61 2.75)"><Path d="M7.22.5H0" transform="translate(4.766 12.446)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M7.22.5H0" transform="translate(4.766 8.686)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M2.755.5H0" transform="translate(4.766 4.927)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,9.25c0,6.937,2.1,9.25,8.391,9.25s8.391-2.313,8.391-9.25S14.685,0,8.391,0,0,2.313,0,9.25Z" transform="translate(0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Download = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2.5)"><Path d="M9.23,4.791V.782a.769.769,0,0,1,1.533-.1l.007.1V4.791h4.78A4.527,4.527,0,0,1,20,9.17l0,.216v5.039A4.53,4.53,0,0,1,15.768,19l-.208,0H4.44A4.511,4.511,0,0,1,0,14.621L0,14.4V9.376A4.532,4.532,0,0,1,4.222,4.8l.208-.005h4.8v6.4L7.63,9.541a.755.755,0,0,0-1.09,0,.835.835,0,0,0-.08,1.027l.08.1,2.91,3.015a.746.746,0,0,0,1.015.071l.075-.071,2.91-3.015a.816.816,0,0,0,0-1.126.755.755,0,0,0-1-.077l-.086.077-1.59,1.652v-6.4Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M.5,12.041V0" transform="translate(9.379 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M5.832,0,2.916,2.928,0,0" transform="translate(6.963 9.864)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M13.62,0C17.2.33,18.5,1.67,18.5,7c0,7.1-2.311,7.1-9.25,7.1S0,14.1,0,7C0,1.67,1.3.33,4.88,0" transform="translate(0.75 5.259)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Edit = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3 3)"><Path d="M11.28,18a1.023,1.023,0,0,1,0-2.047h5.71a1.023,1.023,0,0,1,0,2.047ZM.848,17.576l-.8-3.451a2.132,2.132,0,0,1,.4-1.8L6.684,4.268a.313.313,0,0,1,.424-.054L9.73,6.3a.846.846,0,0,0,.647.183.945.945,0,0,0,.817-1.043,1.053,1.053,0,0,0-.329-.635L8.319,2.763a.378.378,0,0,1-.064-.526L9.241.957A2.584,2.584,0,0,1,13.03.7l1.475,1.172a3.062,3.062,0,0,1,1.146,1.752,2.4,2.4,0,0,1-.488,2.042L6.377,17.028a2.105,2.105,0,0,1-1.634.817l-3.5.042A.4.4,0,0,1,.848,17.576Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.5 3.5)"><Path d="M0,.5H6.377" transform="translate(9.835 15.508)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M11.808.609h0a3.042,3.042,0,0,0-4.258.607l-6.752,9C-.941,12.529.7,15.4.7,15.4s3.244.746,4.958-1.539l6.752-8.995A3.042,3.042,0,0,0,11.808.609Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0,4.864,3.651" transform="translate(7.004 3.711)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const EditSquare = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M15,20c-.11,0-.222,0-.332-.01H5.335C5.225,20,5.112,20,5,20a5.321,5.321,0,0,1-3.6-1.4A5.371,5.371,0,0,1,.01,14.665V5.335A5.372,5.372,0,0,1,1.4,1.4,5.328,5.328,0,0,1,5,0c.11,0,.221,0,.331.01h9.33c.109-.007.219-.01.328-.01a5.317,5.317,0,0,1,3.6,1.4,5.416,5.416,0,0,1,1.4,3.937v9.33A5.4,5.4,0,0,1,18.6,18.6,5.323,5.323,0,0,1,15,20ZM10.38,6.464a.214.214,0,0,0-.15.059L5.465,11.289a1.8,1.8,0,0,0-.529,1.238L4.875,14.9a.467.467,0,0,0,.13.339.478.478,0,0,0,.34.14H7.692a1.84,1.84,0,0,0,1.289-.53L15.7,8.1a1.586,1.586,0,0,0,0-2.227l-1.3-1.3a1.58,1.58,0,0,0-2.237,0l-.67.68a.265.265,0,0,0,0,.369c.016.016,1.589,1.579,1.618,1.619a.678.678,0,0,1,.18.459.66.66,0,0,1-.659.66.626.626,0,0,1-.44-.18L10.529,6.523A.212.212,0,0,0,10.38,6.464Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M9.25,0C2.313,0,0,2.313,0,9.25S2.313,18.5,9.25,18.5s9.25-2.313,9.25-9.25" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M10.071.6h0A2.4,2.4,0,0,0,6.682.809S2.313,5.744.8,7.457s-.4,4.077-.4,4.077,2.5.793,4-.9l5.886-6.647A2.4,2.4,0,0,0,10.071.6Z" transform="translate(7.457 1.7)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0,3.6,3.183" transform="translate(13.009 3.801)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Filter = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 3)"><Path d="M13.122,14.4a3.439,3.439,0,1,1,3.439,3.379A3.41,3.41,0,0,1,13.122,14.4ZM1.508,15.921a1.482,1.482,0,1,1,0-2.963H8.083a1.482,1.482,0,1,1,0,2.963ZM0,3.379A3.409,3.409,0,0,1,3.439,0,3.409,3.409,0,0,1,6.878,3.379,3.409,3.409,0,0,1,3.439,6.758,3.41,3.41,0,0,1,0,3.379ZM11.918,4.86a1.481,1.481,0,1,1,0-2.962h6.575a1.481,1.481,0,1,1,0,2.962Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(4 4)"><Path d="M6.473.447H0" transform="translate(0.671 13.435)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,2.722C0,4.764.681,5.444,2.722,5.444s2.722-.68,2.722-2.722S4.763,0,2.722,0,0,.68,0,2.722Z" transform="translate(11.205 11.162)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,.447H6.472" transform="translate(10.177 2.947)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M5.444,2.722C5.444.681,4.764,0,2.723,0S0,.681,0,2.722.681,5.444,2.723,5.444,5.444,4.764,5.444,2.722Z" transform="translate(0.671 0.671)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Filter2 = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M7.085,19.874a.8.8,0,0,1-.356-.67V14.389a.558.558,0,0,1,.551-.565l4.855.015a.558.558,0,0,1,.548.565v2.731a.8.8,0,0,1-.454.724L7.823,19.929A.765.765,0,0,1,7.5,20,.754.754,0,0,1,7.085,19.874Zm5.35-7.83-5.447-.016a.591.591,0,0,1-.437-.2L.574,5.258A2.234,2.234,0,0,1,0,3.758V2.193A2.161,2.161,0,0,1,2.128,0H17.872A2.16,2.16,0,0,1,20,2.192V3.724a2.225,2.225,0,0,1-.637,1.563l-6.505,6.58a.582.582,0,0,1-.416.176Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3 3)"><Path d="M9,18c-2.011,0-2.02-2.006-2.02-5.4S0,6.827,0,3.1C0-.047,2.79,0,9,0s9-.047,9,3.1c0,3.726-6.983,6.1-6.983,9.5S11.014,18,9,18Z" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Folder = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M13.75,20H6.24C2.391,20,0,17.606,0,13.75V6.241C0,2.1,1.84,0,5.47,0H7.081A2.956,2.956,0,0,1,9.42,1.15L10.3,2.32a1.472,1.472,0,0,0,1.15.56h3.07a5.446,5.446,0,0,1,4,1.361A6.36,6.36,0,0,1,20,8.89v4.87a6.278,6.278,0,0,1-1.674,4.568A6.3,6.3,0,0,1,13.75,20ZM5.37,11.79a.743.743,0,0,0-.751.751.751.751,0,0,0,.751.75h9.26a.746.746,0,0,0,.74-.75.737.737,0,0,0-.74-.751Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.5 2.5)"><Path d="M0,.476H9.593" transform="translate(4.806 11.598)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,5.3C0,2.856,1.25.759,3.622.273a8.088,8.088,0,0,1,5.67.489c1.5.808,1.069,2,2.608,2.875s4.017-.44,5.635,1.306c1.694,1.828,1.685,4.633,1.685,6.422,0,6.8-3.807,7.335-9.61,7.335S0,18.229,0,11.364Z" transform="translate(0 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Game = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M10.01,20c-1.6,0-2.909-.012-4.122-.039A5.643,5.643,0,0,1,0,14.181V9.875A5.648,5.648,0,0,1,5.9,4.094C7.1,4.076,8.47,4.056,9.833,4.056V3.892a1.217,1.217,0,0,0-1.227-1.2H7.635A1.991,1.991,0,0,1,5.623.723.739.739,0,0,1,6.359,0,.73.73,0,0,1,7.1.723a.531.531,0,0,0,.539.52h.972a2.7,2.7,0,0,1,2.7,2.64v.183c.6,0,1.213.008,1.8.016l1,.012A5.644,5.644,0,0,1,20,9.875v4.307a5.643,5.643,0,0,1-5.888,5.78C12.9,19.987,11.6,20,10.01,20Zm-4.7-8.7a.739.739,0,0,0-.736.723.73.73,0,0,0,.736.723h1.04v1.021a.73.73,0,0,0,.736.722.738.738,0,0,0,.735-.722V12.746h1.03a.73.73,0,0,0,.736-.723.739.739,0,0,0-.736-.723H7.821V10.289a.736.736,0,0,0-1.472,0V11.3ZM14.7,12.986a.73.73,0,0,0-.736.723.722.722,0,0,0,.736.723h.1a.73.73,0,0,0,.736-.723.739.739,0,0,0-.736-.723ZM13.023,9.672a.73.73,0,0,0-.736.723.722.722,0,0,0,.736.723h.1a.723.723,0,1,0,0-1.445Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 1.977)"><Path d="M.477,0V3.575" transform="translate(6.777 10.085)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M3.648.477H0" transform="translate(5.432 11.395)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.528.477h-.1" transform="translate(12.949 9.716)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.528.477h-.1" transform="translate(14.68 13.128)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0H0A1.293,1.293,0,0,0,1.306,1.28H2.314a2.005,2.005,0,0,1,2.02,1.978V4.265" transform="translate(6.514 0.239)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M19.1,7.414C19.1,1.854,16.709,0,9.549,0S0,1.854,0,7.414s2.387,7.414,9.549,7.414S19.1,12.975,19.1,7.414Z" transform="translate(0.716 4.504)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Graph = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M1.088,15.514A8.2,8.2,0,0,1,.065,12.378,5.93,5.93,0,0,1,0,11.391,8.694,8.694,0,0,1,6.956,2.959a1.1,1.1,0,0,1,1.2.6,1.1,1.1,0,0,1,.127.257c.136,2.1.281,4.158.417,6.22a1.851,1.851,0,0,0,.1.63,1.023,1.023,0,0,0,1.005.631l6.656-.426.046.017a1.085,1.085,0,0,1,.756.322,1.048,1.048,0,0,1,.3.753A8.671,8.671,0,0,1,10.683,19.8a8.948,8.948,0,0,1-1.889.2A8.813,8.813,0,0,1,1.088,15.514Zm9.784-6.423a.88.88,0,0,1-.293-.658L10.062.889V.765A.793.793,0,0,1,10.327.21.823.823,0,0,1,10.913,0,9.422,9.422,0,0,1,20,7.89a.3.3,0,0,1,0,.08.786.786,0,0,1-.2.575.813.813,0,0,1-.555.269l-7.679.507q-.041,0-.082,0A.915.915,0,0,1,10.872,9.091Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.2 2)"><Path d="M.67.6C-.038,1.414-.32,6.539.5,7.363s5.768.406,6.956-.529C10.317,4.583,2.93-2,.67.6Z" transform="translate(10.809 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M15.188,7.984c1.084,1.084-1.79,7.264-7.486,7.264A7.7,7.7,0,0,1,0,7.547c0-5.3,5.229-8.69,6.728-7.191.863.863-.109,4.924,1.439,6.473S14.1,6.9,15.188,7.984Z" transform="translate(0.75 3.806)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Heart = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2.501)"><Path d="M10.236,19.838a38.535,38.535,0,0,1-6.656-5.21A13.333,13.333,0,0,1,.412,9.55C-.777,5.834.612,1.579,4.5.319a6.579,6.579,0,0,1,6,1.016h0a6.589,6.589,0,0,1,6-1.016c3.887,1.259,5.286,5.514,4.1,9.231a13.333,13.333,0,0,1-3.168,5.078,38.535,38.535,0,0,1-6.656,5.21l-.26.162Z" transform="translate(0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.55 3.55)"><Path d="M.372,8.9C-.7,5.546.554,1.381,4.071.249A4.869,4.869,0,0,1,9.5,1.939a4.73,4.73,0,0,1,5.42-1.69c3.516,1.132,4.778,5.3,3.706,8.647-1.67,5.31-7.5,8.076-9.126,8.076S2.1,14.268.372,8.9Z" transform="translate(0 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0A2.154,2.154,0,0,1,1.917,2.422" transform="translate(13.238 4.014)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Heart2 = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2.501)"><Path d="M10.03,19h0l-.259-.16A38.164,38.164,0,0,1,3.4,13.879,12.993,12.993,0,0,1,.39,9.08,7.744,7.744,0,0,1,.533,3.805,6.084,6.084,0,0,1,4.321.269,4.5,4.5,0,0,1,5.21.06h.12A5.7,5.7,0,0,1,6.17,0h.11A6.266,6.266,0,0,1,8.111.33H8.17A.331.331,0,0,1,8.26.39a3.375,3.375,0,0,1,.63.261L9.27.82a2.627,2.627,0,0,1,.285.19c.057.042.106.077.145.1l.041.024A2.435,2.435,0,0,1,10,1.3,6.224,6.224,0,0,1,13.806,0h.044a5.826,5.826,0,0,1,1.86.291,6.019,6.019,0,0,1,3.755,3.517A7.915,7.915,0,0,1,19.62,9.08a12.781,12.781,0,0,1-3.009,4.81,38.6,38.6,0,0,1-6.332,4.96l-.25.15ZM14.937,3.118a.809.809,0,0,0-.757.543.82.82,0,0,0,.5,1.029,1.676,1.676,0,0,1,1.07,1.57V6.29a.86.86,0,0,0,.19.62.841.841,0,0,0,.57.29.823.823,0,0,0,.79-.76V6.321A3.3,3.3,0,0,0,15.19,3.16.78.78,0,0,0,14.937,3.118Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.55 3.55)"><Path d="M.372,8.9C-.7,5.546.554,1.381,4.071.249A4.869,4.869,0,0,1,9.5,1.939a4.73,4.73,0,0,1,5.42-1.69c3.516,1.132,4.778,5.3,3.706,8.647-1.67,5.31-7.5,8.076-9.126,8.076S2.1,14.268.372,8.9Z" transform="translate(0 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Hide = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 3.5)"><Path d="M1.784,16.783a.738.738,0,0,1-.088-.925l.029-.04L16.156,1.257A.247.247,0,0,0,16.2,1.2a.327.327,0,0,0,.049-.059l.917-.925A.743.743,0,0,1,17.691,0a.723.723,0,0,1,.514.214.722.722,0,0,1,.219.522.722.722,0,0,1-.219.521L16.43,3.049a14.776,14.776,0,0,1,3.513,5.159.765.765,0,0,1,0,.581C17.851,13.7,14.135,16.626,10,16.626h-.01a9.091,9.091,0,0,1-5.279-1.752l-1.893,1.91A.728.728,0,0,1,2.3,17,.7.7,0,0,1,1.784,16.783ZM7.8,11.752A3.892,3.892,0,0,0,13.892,8.5a3.989,3.989,0,0,0-.673-2.216L12.155,7.362A2.481,2.481,0,0,1,12.429,8.5,2.444,2.444,0,0,1,10,10.955a2.409,2.409,0,0,1-1.132-.275ZM.059,8.793a.747.747,0,0,1,0-.58C2.147,3.309,5.864.385,9.992.385H10a8.851,8.851,0,0,1,4,.965L10.743,4.639A4.506,4.506,0,0,0,10,4.569,3.92,3.92,0,0,0,6.1,8.508a4.566,4.566,0,0,0,.068.748L2.556,12.9A15.833,15.833,0,0,1,.059,8.793Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 3.5)"><Path d="M3.67,12.89C1.44,11.43,0,9.23,0,7.3,0,4.02,4.14,0,9.25,0a10.118,10.118,0,0,1,5.59,1.71" transform="translate(0.75 1.34)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M10.48,0a5.9,5.9,0,0,1,1.41,3.53c0,3.28-4.15,7.3-9.26,7.3A9.888,9.888,0,0,1,0,10.47" transform="translate(7.37 5.11)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.925,5.4A3.12,3.12,0,0,1,0,3.166,3.16,3.16,0,0,1,5.394.925" transform="translate(6.841 5.472)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M2.537,0A3.158,3.158,0,0,1,0,2.542" transform="translate(10.573 9.199)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M15.774,0,0,15.774" transform="translate(2.118 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Home = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2.5 2)"><Path d="M6.635,18.773V15.716A1.419,1.419,0,0,1,8.058,14.3h2.874a1.429,1.429,0,0,1,1.007.414,1.408,1.408,0,0,1,.417,1v3.058a1.213,1.213,0,0,0,.356.867,1.231,1.231,0,0,0,.871.36h1.961a3.46,3.46,0,0,0,2.443-1A3.41,3.41,0,0,0,19,16.578V7.867a2.473,2.473,0,0,0-.9-1.9L11.434.676A3.1,3.1,0,0,0,7.485.747L.967,5.965A2.474,2.474,0,0,0,0,7.867v8.7A3.444,3.444,0,0,0,3.456,20H5.372a1.231,1.231,0,0,0,1.236-1.218Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.4 2)"><Path d="M0,.5H5.815" transform="translate(6.679 13.635)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,11.713c0-5.631.614-5.238,3.919-8.3C5.365,2.246,7.615,0,9.558,0s4.237,2.235,5.7,3.41c3.305,3.065,3.918,2.672,3.918,8.3C19.172,20,17.213,20,9.586,20S0,20,0,11.713Z" transform="translate(0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Image = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M14.332,20H5.666C2.277,20,0,17.622,0,14.083V5.917C0,2.378,2.277,0,5.666,0h8.667C17.723,0,20,2.378,20,5.917v8.167C20,17.622,17.722,20,14.332,20ZM6.307,13.241c-.5,0-1.018.383-1.724,1.279l-.038.048c-.45.569-.912,1.155-1.371,1.726a.8.8,0,0,0-.162.633.716.716,0,0,0,.328.5A4.112,4.112,0,0,0,5.529,18h8.428a4.524,4.524,0,0,0,1.407-.214,3.717,3.717,0,0,0,2.261-2.111,3.756,3.756,0,0,0,.2-2.741,2.263,2.263,0,0,0-.513-.784l0,0a10.811,10.811,0,0,0-1.868-1.6,1.429,1.429,0,0,0-.76-.235,1.874,1.874,0,0,0-1.363.806c-.177.238-.33.491-.492.759l-.1.171-.007.012a5.683,5.683,0,0,1-1.96,2.218,2.487,2.487,0,0,1-1.208.335,3.516,3.516,0,0,1-1.959-.785,5.491,5.491,0,0,0-.827-.49A1.12,1.12,0,0,0,6.307,13.241ZM6.5,4A2.5,2.5,0,1,0,9,6.5,2.5,2.5,0,0,0,6.5,4Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M0,3.71S.812,2.073,1.994,2.073,3.78,3.448,5.09,3.448,7.868,0,9.352,0,11.9,2.391,11.9,2.391" transform="translate(4.071 10.749)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M3.115,1.558A1.558,1.558,0,1,1,1.557,0,1.558,1.558,0,0,1,3.115,1.558Z" transform="translate(5.024 5.547)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Image2 = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(1.999 2)"><Path d="M5.638,20a6.641,6.641,0,0,1-1.082-.094L4.524,19.9a5.232,5.232,0,0,1-3.268-1.872c-.005,0-.007,0-.011-.009a.053.053,0,0,0-.007-.01A6.2,6.2,0,0,1,0,14.1V5.888C0,2.366,2.265,0,5.638,0h8.717C17.731,0,20,2.366,20,5.888V14.1a2.3,2.3,0,0,1-.019.256c-.006.058-.013.116-.016.176,0,.034,0,.068,0,.1,0,.05,0,.1-.007.153a.537.537,0,0,1-.009.055.393.393,0,0,0-.01.057,6.709,6.709,0,0,1-.155.9c-.014.059-.03.119-.045.175l-.015.054a6.059,6.059,0,0,1-.287.807c-.021.047-.043.092-.066.138-.014.026-.025.05-.037.075a5.376,5.376,0,0,1-.407.7c-.031.043-.062.084-.094.122l-.055.07a4.914,4.914,0,0,1-.513.581c-.037.035-.076.067-.115.1s-.053.042-.078.065a5.246,5.246,0,0,1-.608.461c-.047.029-.1.054-.146.078-.033.016-.066.032-.1.05a5.223,5.223,0,0,1-.687.333,1.848,1.848,0,0,1-.186.055c-.042.012-.086.023-.129.036l-.076.023a5.194,5.194,0,0,1-.657.172,3.755,3.755,0,0,1-.42.041l-.188.014c-.068,0-.135.014-.2.021a2.608,2.608,0,0,1-.32.026ZM1.4,5.888V14.1a5.328,5.328,0,0,0,.385,2.038l.358-.436c.563-.687,1.611-1.963,1.619-1.971A3.616,3.616,0,0,1,6.4,12.259a2.71,2.71,0,0,1,1.05.22,6.455,6.455,0,0,1,1.01.561l.09.058a2.329,2.329,0,0,0,1.186.537c.024,0,.049,0,.074,0a1.04,1.04,0,0,0,.41-.143,13.5,13.5,0,0,0,2.123-2.619c.057-.081.094-.134.107-.15a3.345,3.345,0,0,1,2.619-1.4,2.983,2.983,0,0,1,1.551.441c.194.116,1.535,1.052,1.981,1.431v-5.3c0-2.73-1.669-4.493-4.251-4.493H5.638C3.061,1.395,1.4,3.158,1.4,5.888ZM4.06,6.993A2.4,2.4,0,0,1,4,6.468a2.5,2.5,0,0,1,5,.046,2.495,2.495,0,0,1-4.941.479Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M3.522,1.761A1.761,1.761,0,1,1,1.761,0,1.76,1.76,0,0,1,3.522,1.761Z" transform="translate(5.077 5.023)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M16.654,2.737C15.773,1.831,14.527,0,12.238,0S9.9,4.038,7.563,4.038s-3.278-1.371-4.8-.655S0,6.944,0,6.944" transform="translate(2.466 9.93)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const InfoCircle = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 1.999)"><Path d="M10,20a10,10,0,1,1,7.074-2.929A10.011,10.011,0,0,1,10,20Zm0-7.069a.871.871,0,0,0-.87.869.875.875,0,1,0,.87-.869Zm0-7.6a.892.892,0,0,0-.88.88v4.42a.875.875,0,0,0,1.751,0V6.21A.876.876,0,0,0,10,5.33Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M0,9.25C0,2.313,2.313,0,9.25,0S18.5,2.313,18.5,9.25,16.187,18.5,9.25,18.5,0,16.187,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5,0V3.895" transform="translate(9.5 6.105)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(9.5 13)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const InfoSquare = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 1.999)"><Path d="M14.34,20H5.67C2.279,20,0,17.625,0,14.091V5.92C0,2.379,2.279,0,5.67,0h8.67C17.725,0,20,2.379,20,5.92v8.171C20,17.625,17.725,20,14.34,20ZM9.99,8.481a.876.876,0,0,0-.87.88v4.42a.875.875,0,0,0,1.751,0V9.361A.881.881,0,0,0,9.99,8.481Zm.02-3.17a.875.875,0,1,0,.87.88A.871.871,0,0,0,10.01,5.311Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.75 2.75)"><Path d="M0,9.25C0,2.313,2.313,0,9.25,0S18.5,2.313,18.5,9.25,16.187,18.5,9.25,18.5,0,16.187,0,9.25Z" transform="translate(18.5 18.5) rotate(180)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5,0V3.895" transform="translate(9.75 13.145) rotate(180)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(9.75 6.25) rotate(180)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Location = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3.5 2)"><Path d="M8.5,20a1.358,1.358,0,0,1-.734-.247,21.513,21.513,0,0,1-5.54-5.141A10.384,10.384,0,0,1,0,8.318,8.168,8.168,0,0,1,2.5,2.434,8.53,8.53,0,0,1,8.493,0,8.423,8.423,0,0,1,17,8.318a10.39,10.39,0,0,1-2.23,6.294,21.92,21.92,0,0,1-5.541,5.141A1.319,1.319,0,0,1,8.5,20ZM8.493,5.777a2.8,2.8,0,0,0-2.8,2.8,2.712,2.712,0,0,0,.821,1.954,2.823,2.823,0,0,0,4.79-1.954,2.824,2.824,0,0,0-2.813-2.8Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(4.5 3)"><Path d="M5,2.5A2.5,2.5,0,1,0,2.5,5,2.5,2.5,0,0,0,5,2.5Z" transform="translate(5.01 5.21)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M7.5,18C4.6,18,0,12.959,0,7.6A7.549,7.549,0,0,1,7.5,0,7.55,7.55,0,0,1,15,7.6C15,12.959,10.4,18,7.5,18Z" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Lock = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3.5 2)"><Path d="M12.732,20H4.269A4.227,4.227,0,0,1,0,15.826V10.888A4.165,4.165,0,0,1,2.977,6.929V5.4A5.472,5.472,0,0,1,8.485,0,5.576,5.576,0,0,1,12.4,1.58,5.3,5.3,0,0,1,14.023,5.4V6.929A4.165,4.165,0,0,1,17,10.888v4.937A4.227,4.227,0,0,1,12.732,20ZM8.5,11.384a.875.875,0,0,0-.884.865v2.206a.889.889,0,0,0,1.778,0V12.249A.881.881,0,0,0,8.5,11.384Zm.01-9.645A3.711,3.711,0,0,0,4.756,5.376V6.714h7.489V5.4A3.7,3.7,0,0,0,8.505,1.739Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.5 2)"><Path d="M9.121,6.653V4.5A4.561,4.561,0,0,0,0,4.484V6.653" transform="translate(3.85 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5,0V2.221" transform="translate(7.91 12.156)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M7.66,0C1.915,0,0,1.568,0,6.271s1.915,6.272,7.66,6.272,7.661-1.568,7.661-6.272S13.4,0,7.66,0Z" transform="translate(0.75 6.824)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Login = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2.5 2)"><Path d="M9.376,20a4.522,4.522,0,0,1-4.586-4.43v-4.8H.781a.77.77,0,1,1,0-1.541H4.791V4.45A4.534,4.534,0,0,1,9.386,0h5.039A4.521,4.521,0,0,1,19,4.44V15.56A4.519,4.519,0,0,1,14.4,20Zm1.817-9.229-1.652,1.6a.757.757,0,0,0,0,1.091.831.831,0,0,0,1.126,0l3.015-2.911a.744.744,0,0,0,0-1.09L10.667,6.55a.816.816,0,0,0-1.126,0,.756.756,0,0,0,0,1.09l1.652,1.59h-6.4v1.54Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M12.041.5H0" transform="translate(0.75 9.621)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0,2.928,2.916,0,5.832" transform="translate(9.864 7.205)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,4.88C.33,1.3,1.67,0,7,0c7.1,0,7.1,2.31,7.1,9.25s0,9.25-7.1,9.25c-5.33,0-6.67-1.3-7-4.88" transform="translate(5.259 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Logout = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M4.517,20A4.482,4.482,0,0,1,0,15.56V4.45A4.493,4.493,0,0,1,4.528,0H9.492A4.48,4.48,0,0,1,14,4.44V9.23H7.9a.77.77,0,1,0,0,1.54H14v4.78A4.493,4.493,0,0,1,9.472,20ZM16.54,13.451a.773.773,0,0,1,0-1.09l1.6-1.59H14V9.23h4.14l-1.6-1.59a.773.773,0,0,1,0-1.09.764.764,0,0,1,1.09-.01l2.92,2.91a.766.766,0,0,1,.229.55.741.741,0,0,1-.229.54l-2.92,2.911a.762.762,0,0,1-1.09,0Z" transform="translate(0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M12.041.5H0" transform="translate(7.75 9.621)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0,2.928,2.916,0,5.832" transform="translate(16.864 7.205)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,4.88C-.33,1.3-1.67,0-7,0c-7.1,0-7.1,2.31-7.1,9.25s0,9.25,7.1,9.25c5.33,0,6.67-1.3,7-4.88" transform="translate(14.36 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Message = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 3)"><Path d="M14.939,18H5.06A5.061,5.061,0,0,1,0,12.95V5.05A5.061,5.061,0,0,1,5.06,0h9.879a5.091,5.091,0,0,1,3.58,1.481A5.012,5.012,0,0,1,20,5.05v7.9A5.061,5.061,0,0,1,14.939,18ZM4.034,5.246A.733.733,0,0,0,3.5,5.47a.764.764,0,0,0-.071,1l.131.13L8.11,10.15a3.129,3.129,0,0,0,1.95.68,3.18,3.18,0,0,0,1.958-.68L16.53,6.54l.08-.08a.774.774,0,0,0-.012-1,.831.831,0,0,0-.528-.26h-.042a.76.76,0,0,0-.519.2L11,9a1.565,1.565,0,0,1-1,.36A1.592,1.592,0,0,1,9,9L4.5,5.4A.778.778,0,0,0,4.034,5.246Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.452 2.852)"><Path d="M11.151,0S7.941,3.853,5.593,3.853,0,0,0,0" transform="translate(3.942 6.167)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,9.117C0,2.279,2.381,0,9.524,0s9.524,2.279,9.524,9.117-2.381,9.117-9.524,9.117S0,15.954,0,9.117Z" transform="translate(0 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const MoreCircle = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M10,20A10,10,0,0,1,2.926,2.93,10,10,0,1,1,10,20ZM14.48,8.8A1.2,1.2,0,1,0,15.67,10,1.2,1.2,0,0,0,14.48,8.8ZM10,8.8A1.2,1.2,0,1,0,11.19,10,1.2,1.2,0,0,0,10,8.8Zm-4.48,0A1.2,1.2,0,1,0,6.71,10,1.2,1.2,0,0,0,5.52,8.8Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M0,9.25C0,2.313,2.313,0,9.25,0S18.5,2.313,18.5,9.25,16.187,18.5,9.25,18.5,0,16.187,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(12.709 11.4)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(9.709 7.4)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(6.7 11.4)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const MoreSquare = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M14.34,20H5.67C2.279,20,0,17.625,0,14.09V5.92C0,2.379,2.279,0,5.67,0h8.67C17.725,0,20,2.379,20,5.92v8.17C20,17.625,17.725,20,14.34,20Zm.14-11.2A1.2,1.2,0,1,0,15.67,10,1.2,1.2,0,0,0,14.48,8.8ZM10,8.8A1.2,1.2,0,1,0,11.2,10,1.2,1.2,0,0,0,10,8.8Zm-4.48,0A1.2,1.2,0,1,0,6.72,10,1.2,1.2,0,0,0,5.52,8.8Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M0,9.25C0,2.313,2.313,0,9.25,0S18.5,2.313,18.5,9.25,16.187,18.5,9.25,18.5,0,16.187,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(13.498 9.5)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(9.499 9.5)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5.5H.5" transform="translate(5.5 9.5)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Notification = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3.5 2)"><Path d="M7.983,19.967a3.619,3.619,0,0,1-1.714-.733,1.551,1.551,0,0,1-.7-1.173c0-.5.462-.734.889-.833a25.955,25.955,0,0,1,4.046,0c.427.1.889.329.889.833a1.553,1.553,0,0,1-.695,1.174,3.635,3.635,0,0,1-1.713.732A4,4,0,0,1,8.48,20,3.667,3.667,0,0,1,7.983,19.967ZM3.764,15.747a4.535,4.535,0,0,1-2.9-1.413A3.615,3.615,0,0,1,0,11.956a3.368,3.368,0,0,1,.731-2.31A3.8,3.8,0,0,0,1.794,6.8V6.37A5.625,5.625,0,0,1,3.077,2.512,7.073,7.073,0,0,1,8.456,0h.09a7.041,7.041,0,0,1,5.467,2.624,5.546,5.546,0,0,1,1.2,3.746V6.8a3.889,3.889,0,0,0,1.062,2.849A3.364,3.364,0,0,1,17,11.956a3.614,3.614,0,0,1-.863,2.379,4.539,4.539,0,0,1-2.9,1.413c-1.571.133-3.144.247-4.737.247A41.689,41.689,0,0,1,3.764,15.747Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(4.615 2.514)"><Path d="M7.382,0C2.947,0,1.021,4.015,1.021,6.67c0,1.984.288,1.4-.81,3.82-1.341,3.449,4.051,4.858,7.171,4.858s8.511-1.41,7.171-4.858c-1.1-2.42-.81-1.836-.81-3.82C13.743,4.015,11.815,0,7.382,0Z" transform="translate(0 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.62,0A2.992,2.992,0,0,1,0,0" transform="translate(5.071 17.998)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Paper = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3.5 2)"><Path d="M4.674,20A4.7,4.7,0,0,1,0,15.29V4.51A4.493,4.493,0,0,1,4.465,0H9.752a.458.458,0,0,1,.455.46V3.68a3.341,3.341,0,0,0,3.308,3.34c.423,0,.794,0,1.122.006.257,0,.481,0,.68,0,.141,0,.323,0,.521,0,.229,0,.486-.005.716-.005A.448.448,0,0,1,17,7.47v8.04A4.473,4.473,0,0,1,12.554,20Zm.01-6.359a.756.756,0,0,0,.743.75h5.386a.756.756,0,0,0,.743-.75.742.742,0,0,0-.743-.741H5.426A.742.742,0,0,0,4.684,13.64Zm0-4.99a.742.742,0,0,0,.743.74H8.772a.742.742,0,0,0,.743-.74.756.756,0,0,0-.743-.75H5.426A.756.756,0,0,0,4.684,8.65Zm8.964-3.091a2.018,2.018,0,0,1-2-2.017V.906a.473.473,0,0,1,.814-.334l3.986,4.187a.477.477,0,0,1-.34.806h-.691C14.793,5.567,14.149,5.564,13.648,5.559Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.65 2.75)"><Path d="M5.4.5H0" transform="translate(5.255 12.2)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M3.356.5H0" transform="translate(5.255 8.189)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M16.51,5.55,10.84.15A18.2,18.2,0,0,0,8.39,0C2.1,0,0,2.32,0,9.25S2.1,18.5,8.39,18.5s8.4-2.31,8.4-9.25A21.045,21.045,0,0,0,16.51,5.55Z" transform="translate(0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0V2.661A3.363,3.363,0,0,0,3.364,6.024H6.315" transform="translate(10.284 0.083)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const PaperDownload = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3.5 2)"><Path d="M4.674,20A4.7,4.7,0,0,1,0,15.29V4.51A4.493,4.493,0,0,1,4.465,0H9.752a.464.464,0,0,1,.455.46V3.68a3.341,3.341,0,0,0,3.308,3.34c.418,0,.79,0,1.119.006.256,0,.48,0,.673,0,.141,0,.323,0,.521,0,.229,0,.486-.005.716-.005A.448.448,0,0,1,17,7.47v8.04A4.478,4.478,0,0,1,12.544,20Zm.109-9.29a.755.755,0,0,0,0,1.06l2.831,2.87a.78.78,0,0,0,.238.159.7.7,0,0,0,.287.06.644.644,0,0,0,.277-.06.78.78,0,0,0,.238-.159l2.841-2.87a.747.747,0,0,0-.01-1.06.729.729,0,0,0-1.04,0l-1.574,1.6V7.49a.734.734,0,0,0-.733-.75.747.747,0,0,0-.743.75v4.82l-1.574-1.6a.729.729,0,0,0-1.04,0Zm8.86-5.151a2.017,2.017,0,0,1-2-2.017V.906a.472.472,0,0,1,.813-.334l3.987,4.187a.477.477,0,0,1-.34.807H15.46C14.819,5.568,14.156,5.565,13.642,5.559Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.65 2.75)"><Path d="M16.51,5.55,10.84.15A18.2,18.2,0,0,0,8.39,0C2.1,0,0,2.32,0,9.25S2.1,18.5,8.39,18.5s8.4-2.31,8.4-9.25A21.045,21.045,0,0,0,16.51,5.55Z" transform="translate(0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0V2.661A3.363,3.363,0,0,0,3.364,6.024H6.315" transform="translate(10.284 0.083)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5,6.041V0" transform="translate(7.51 7.226)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0,2.345,2.355,4.69,0" transform="translate(5.665 10.912)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const PaperFail = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3.5 2)"><Path d="M4.674,20A4.7,4.7,0,0,1,0,15.29V4.51A4.493,4.493,0,0,1,4.465,0H9.752a.464.464,0,0,1,.455.46V3.68a3.341,3.341,0,0,0,3.308,3.34c.418,0,.79,0,1.119.006.256,0,.48,0,.673,0,.142,0,.328,0,.528,0,.239,0,.485-.005.709-.005A.448.448,0,0,1,17,7.47v8.04A4.478,4.478,0,0,1,12.544,20ZM8.3,12.041,9.5,13.26a.735.735,0,0,0,1.049,0,.749.749,0,0,0,0-1.049L9.347,10.99l1.208-1.22a.75.75,0,0,0,0-1.05.724.724,0,0,0-1.049,0L8.3,9.94,7.089,8.72a.713.713,0,0,0-1.04,0,.75.75,0,0,0,0,1.05l1.208,1.22L6.05,12.21a.749.749,0,0,0,0,1.049.691.691,0,0,0,.515.22.711.711,0,0,0,.525-.22L8.3,12.041h0Zm5.345-6.482a2.017,2.017,0,0,1-2-2.017V.906a.472.472,0,0,1,.813-.334C13.531,1.7,15.4,3.661,16.447,4.759a.477.477,0,0,1-.341.807h-.645C14.82,5.568,14.157,5.565,13.643,5.559Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.65 2.75)"><Path d="M16.51,5.55,10.84.15A18.2,18.2,0,0,0,8.39,0C2.1,0,0,2.32,0,9.25S2.1,18.5,8.39,18.5s8.4-2.31,8.4-9.25A21.045,21.045,0,0,0,16.51,5.55Z" transform="translate(0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0V2.661A3.363,3.363,0,0,0,3.364,6.024H6.315" transform="translate(10.284 0.083)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M3.466,3.466,0,0" transform="translate(6.479 8.498)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,3.466,3.466,0" transform="translate(6.48 8.498)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const PaperNegative = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3.5 2)"><Path d="M4.674,20A4.7,4.7,0,0,1,0,15.29V4.51A4.493,4.493,0,0,1,4.465,0H9.752a.458.458,0,0,1,.455.46V3.68a3.341,3.341,0,0,0,3.308,3.34c.423,0,.794,0,1.122.006.257,0,.481,0,.68,0,.141,0,.323,0,.521,0,.229,0,.486-.005.716-.005A.448.448,0,0,1,17,7.47v8.04A4.478,4.478,0,0,1,12.544,20Zm.455-9.01a.742.742,0,0,0,.742.74h4.891a.745.745,0,0,0,0-1.49H5.872A.747.747,0,0,0,5.129,10.99Zm8.518-5.431a2.017,2.017,0,0,1-2-2.017V.906a.472.472,0,0,1,.814-.334l3.986,4.187a.477.477,0,0,1-.339.807h-.645C14.824,5.568,14.161,5.565,13.647,5.559Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.65 2.75)"><Path d="M16.51,5.55,10.84.15A18.2,18.2,0,0,0,8.39,0C2.1,0,0,2.32,0,9.25S2.1,18.5,8.39,18.5s8.4-2.31,8.4-9.25A21.045,21.045,0,0,0,16.51,5.55Z" transform="translate(0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0V2.661A3.363,3.363,0,0,0,3.364,6.024H6.315" transform="translate(10.284 0.083)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.9.5H0" transform="translate(5.762 9.731)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const PaperPlus = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3.5 2)"><Path d="M4.674,20A4.7,4.7,0,0,1,0,15.29V4.51A4.493,4.493,0,0,1,4.465,0H9.752a.458.458,0,0,1,.455.46V3.68a3.341,3.341,0,0,0,3.308,3.34c.423,0,.794,0,1.122.006.257,0,.481,0,.68,0,.141,0,.323,0,.521,0,.229,0,.486-.005.716-.005A.448.448,0,0,1,17,7.47v8.04A4.478,4.478,0,0,1,12.544,20Zm.455-9.01a.742.742,0,0,0,.742.74h1.7V13.46a.738.738,0,1,0,1.475,0V11.73h1.713a.745.745,0,0,0,0-1.49H9.05V8.51a.738.738,0,1,0-1.475,0v1.73h-1.7A.747.747,0,0,0,5.129,10.99Zm8.518-5.431a2.017,2.017,0,0,1-2-2.017V.906a.472.472,0,0,1,.814-.334l3.986,4.187a.477.477,0,0,1-.339.807h-.645C14.824,5.568,14.161,5.565,13.647,5.559Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.65 2.75)"><Path d="M16.51,5.55,10.84.15A18.2,18.2,0,0,0,8.39,0C2.1,0,0,2.32,0,9.25S2.1,18.5,8.39,18.5s8.4-2.31,8.4-9.25A21.045,21.045,0,0,0,16.51,5.55Z" transform="translate(0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0V2.661A3.363,3.363,0,0,0,3.364,6.024H6.315" transform="translate(10.284 0.083)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.9.5H0" transform="translate(5.762 9.731)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5,4.9V0" transform="translate(7.713 7.781)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const PaperUpload = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3.5 2)"><Path d="M4.674,20A4.7,4.7,0,0,1,0,15.29V4.51A4.493,4.493,0,0,1,4.465,0H9.752a.464.464,0,0,1,.455.46V3.68a3.341,3.341,0,0,0,3.308,3.34c.416,0,.785,0,1.11.005.256,0,.482,0,.682,0,.141,0,.323,0,.521,0,.229,0,.486-.005.716-.005A.453.453,0,0,1,17,7.47v8.04A4.478,4.478,0,0,1,12.544,20ZM7.4,9.293V14.12a.738.738,0,1,0,1.475,0V9.29l1.574,1.6a.731.731,0,0,0,1.04,0,.739.739,0,0,0,.01-1.05L8.654,6.96A.78.78,0,0,0,8.416,6.8a.644.644,0,0,0-.277-.06.7.7,0,0,0-.287.06.78.78,0,0,0-.238.159L4.783,9.84a.748.748,0,0,0,0,1.05.731.731,0,0,0,1.04,0l1.572-1.6,0,0Zm6.246-3.733a2.018,2.018,0,0,1-2-2.017V.906a.472.472,0,0,1,.813-.334C13.53,1.7,15.4,3.661,16.445,4.759a.477.477,0,0,1-.34.806h-.691C14.787,5.567,14.144,5.564,13.642,5.559Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.65 2.75)"><Path d="M16.51,5.55,10.84.15A18.2,18.2,0,0,0,8.39,0C2.1,0,0,2.32,0,9.25S2.1,18.5,8.39,18.5s8.4-2.31,8.4-9.25A21.045,21.045,0,0,0,16.51,5.55Z" transform="translate(0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0V2.661A3.363,3.363,0,0,0,3.364,6.024H6.315" transform="translate(10.284 0.083)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5,0V6.041" transform="translate(7.51 7.226)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.69,2.355,2.345,0,0,2.355" transform="translate(5.665 7.227)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Password = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 1.999)"><Path d="M5.666,20C2.277,20,0,17.623,0,14.084V5.917C0,2.378,2.277,0,5.666,0h8.669C17.724,0,20,2.378,20,5.917v8.168C20,17.623,17.723,20,14.334,20Zm7.266-9.25h1.329v1.1a.75.75,0,0,0,1.5,0V10a.751.751,0,0,0-.75-.75H9.319a2.6,2.6,0,1,0,0,1.5h2.112v1.1a.75.75,0,0,0,1.5,0v-1.1h0ZM5.739,10a1.1,1.1,0,1,1,1.1,1.1A1.1,1.1,0,0,1,5.739,10Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.75 2.75)"><Path d="M3.7,1.852A1.852,1.852,0,1,1,1.852,0h0A1.851,1.851,0,0,1,3.7,1.852Z" transform="translate(4.235 7.398)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0H6.318V1.852" transform="translate(7.942 9.25)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5,1.852V0" transform="translate(10.932 9.25)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,9.25C0,2.313,2.313,0,9.25,0S18.5,2.313,18.5,9.25,16.187,18.5,9.25,18.5,0,16.187,0,9.25Z" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const People = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(1 4)"><Path d="M4.588,13.28c0-2.177,2.911-2.741,6.361-2.741,3.431,0,6.36.544,6.36,2.721S14.4,16,10.949,16C7.518,16,4.588,15.456,4.588,13.28Zm14.5.4A4.453,4.453,0,0,0,16.431,9.3a.045.045,0,0,1-.029-.047.038.038,0,0,1,.032-.026,15.49,15.49,0,0,1,3.244.284,2.76,2.76,0,0,1,2.131,1.3,1.927,1.927,0,0,1,0,1.67c-.461,1-1.944,1.319-2.521,1.4l-.027,0A.183.183,0,0,1,19.086,13.684Zm-16.375.205c-.576-.083-2.06-.4-2.52-1.4a1.913,1.913,0,0,1,0-1.669,2.756,2.756,0,0,1,2.13-1.305,15.644,15.644,0,0,1,3.244-.283.037.037,0,0,1,.032.025.046.046,0,0,1-.028.048,4.449,4.449,0,0,0-2.656,4.38.182.182,0,0,1-.176.208ZM6.74,4.233a4.209,4.209,0,1,1,8.419,0,4.209,4.209,0,1,1-8.419,0Zm9.823,3.609a3.4,3.4,0,0,1-.483-.047.159.159,0,0,1-.106-.245A5.841,5.841,0,0,0,15.889.939a.106.106,0,0,1-.016-.111.13.13,0,0,1,.083-.049,3.507,3.507,0,0,1,.708-.073A3.576,3.576,0,0,1,20.088,5.22a3.51,3.51,0,0,1-3.429,2.623ZM1.912,5.22A3.576,3.576,0,0,1,5.336.706a3.53,3.53,0,0,1,.709.073.135.135,0,0,1,.082.049.1.1,0,0,1-.016.11A5.84,5.84,0,0,0,6.027,7.55a.159.159,0,0,1-.107.245,3.281,3.281,0,0,1-.483.047h-.1A3.512,3.512,0,0,1,1.912,5.22Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(1 3)"><Path d="M6.006,6.122C2.767,6.122,0,5.632,0,3.67S2.749,0,6.006,0c3.239,0,6.006,1.692,6.006,3.653S9.263,6.122,6.006,6.122Z" transform="translate(4.966 11.246)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M3.85,7.7a3.837,3.837,0,1,0-.027,0Z" transform="translate(7.122 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.166,5.643a2.9,2.9,0,0,0,2.149-2.8A2.9,2.9,0,0,0,0,0" transform="translate(17.196 1.749)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0C1.754,0,3.252,1.189,3.252,2.251a1.64,1.64,0,0,1-1.3,1.49" transform="translate(17.943 10.544)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M2.15,5.643A2.9,2.9,0,0,1,2.315,0" transform="translate(2.434 1.749)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M3.252,0C1.5,0,0,1.189,0,2.251a1.64,1.64,0,0,0,1.3,1.49" transform="translate(0.75 10.544)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Play = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M10,20a10,10,0,1,1,10-9.994A10.008,10.008,0,0,1,10,20ZM8.861,6.03a1.338,1.338,0,0,0-.608.145,1.252,1.252,0,0,0-.541.6,6.314,6.314,0,0,0-.174.7A15.391,15.391,0,0,0,7.375,10a17.717,17.717,0,0,0,.145,2.441,1.1,1.1,0,0,1,.024.11,3.911,3.911,0,0,0,.207.768,1.21,1.21,0,0,0,1.072.656h.039a3.188,3.188,0,0,0,.9-.27,14.727,14.727,0,0,0,3.851-2.624l.058-.058a3.94,3.94,0,0,0,.27-.309,1.161,1.161,0,0,0,.231-.7,1.217,1.217,0,0,0-.251-.754l-.063-.068c-.064-.07-.162-.176-.254-.269A14.777,14.777,0,0,0,9.662,6.251,3.356,3.356,0,0,0,8.861,6.03Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M5.513,3.338c0-.9-4.584-3.8-5.1-3.276s-.57,5.983,0,6.552S5.513,4.242,5.513,3.338Z" transform="translate(7.903 6.517)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Plus = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M14.67,20H5.33a5.349,5.349,0,0,1-3.944-1.394A5.356,5.356,0,0,1,0,14.67V5.33A5.358,5.358,0,0,1,1.386,1.386,5.358,5.358,0,0,1,5.33,0h9.33a5.372,5.372,0,0,1,3.945,1.386A5.345,5.345,0,0,1,20,5.33v9.34C20,18.057,18.057,20,14.67,20ZM6.33,9.16a.819.819,0,0,0-.83.83.839.839,0,0,0,.83.84H9.16V13.66a.83.83,0,1,0,1.66,0V10.83h2.84a.835.835,0,0,0,0-1.669H10.82V6.34a.83.83,0,1,0-1.66,0V9.16Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.3 2.3)"><Path d="M.526,0V7.148" transform="translate(9.211 6.163)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M7.156.526H0" transform="translate(6.159 9.211)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,9.737C0,2.435,2.435,0,9.737,0s9.737,2.435,9.737,9.737-2.435,9.737-9.737,9.737S0,17.039,0,9.737Z" transform="translate(0 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Scan = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(1 3)"><Path d="M14.6,18a.747.747,0,1,1,0-1.493h1.593a2.44,2.44,0,0,0,2.462-2.414v-3.56H16.032v.992a2.269,2.269,0,0,1-2.27,2.266H8.238a2.269,2.269,0,0,1-2.269-2.266v-.992H3.346V14.1A2.437,2.437,0,0,0,5.8,16.506H7.428a.747.747,0,1,1,0,1.493H5.8a3.946,3.946,0,0,1-3.974-3.9V10.534H.762a.746.746,0,1,1,0-1.492H21.239a.746.746,0,1,1,0,1.492H20.177v3.56A3.95,3.95,0,0,1,16.194,18ZM6.24,7.523a.278.278,0,0,1-.27-.269V6.008A2.268,2.268,0,0,1,8.239,3.743h5.524a2.26,2.26,0,0,1,2.27,2.265V7.254a.28.28,0,0,1-.273.269Zm12.415-1.76V3.906a2.44,2.44,0,0,0-2.461-2.413H14.6a.754.754,0,0,1-.761-.745A.755.755,0,0,1,14.6,0h1.593a3.948,3.948,0,0,1,3.983,3.906V5.763a.761.761,0,0,1-1.522,0Zm-16.831,0V3.9A3.945,3.945,0,0,1,5.8,0h1.63a.755.755,0,0,1,.761.747.753.753,0,0,1-.761.746H5.8A2.436,2.436,0,0,0,3.347,3.9V5.762a.762.762,0,0,1-1.524,0Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(1.45 2.95)"><Path d="M21.132.5H0" transform="translate(0 9.35)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,5.77C.57,2.29,2.29.57,5.77,0" transform="translate(1.546 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M5.981,8.186C2.5,7.606.781,5.9.211,2.416v0A17.035,17.035,0,0,1,0,0" transform="translate(1.335 9.854)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M5.979,0a17.183,17.183,0,0,1-.21,2.42l0,0C5.2,5.9,3.48,7.606,0,8.186" transform="translate(13.816 9.854)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0C3.48.57,5.2,2.29,5.77,5.77" transform="translate(13.816 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Search = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M17.741,19.608l-2.12-2.43a1.083,1.083,0,0,1,0-1.524.986.986,0,0,1,1.393,0l2.554,2.062h.045a1.348,1.348,0,0,1,0,1.892,1.315,1.315,0,0,1-1.872,0ZM0,8.67A8.624,8.624,0,0,1,8.578,0a8.531,8.531,0,0,1,6.065,2.54,8.716,8.716,0,0,1,2.512,6.13A8.624,8.624,0,0,1,8.578,17.34,8.624,8.624,0,0,1,0,8.67Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M8.561,0A8.561,8.561,0,1,1,0,8.561,8.561,8.561,0,0,1,8.561,0Z" transform="translate(0.714 0.714)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M1.411,0A1.411,1.411,0,1,1,0,1.41,1.411,1.411,0,0,1,1.411,0Z" transform="translate(16.488 16.488)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Send = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M19.435.582A1.933,1.933,0,0,0,17.5.079L1.408,4.76A1.919,1.919,0,0,0,.024,6.281a2.253,2.253,0,0,0,1,2.1L6.06,11.477a1.3,1.3,0,0,0,1.61-.193l5.763-5.8a.734.734,0,0,1,1.06,0,.763.763,0,0,1,0,1.067l-5.773,5.8a1.324,1.324,0,0,0-.193,1.619L11.6,19.054A1.91,1.91,0,0,0,13.263,20a2.078,2.078,0,0,0,.25-.01A1.95,1.95,0,0,0,15.144,18.6L19.916,2.525a1.964,1.964,0,0,0-.48-1.943" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.8 2.8)"><Path d="M8.693,9.638S-3.283,7.161.879,4.758C4.391,2.731,16.495-.755,18.186.146c.9,1.691-2.585,13.795-4.612,17.307C11.171,21.615,8.693,9.638,8.693,9.638Z" transform="translate(0 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,9.492,9.492,0" transform="translate(8.693 0.146)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Setting = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2.5 2)"><Path d="M10.2,20H8.807a2.066,2.066,0,0,1-2.125-2.05A1.9,1.9,0,0,0,4.8,16.13a1.58,1.58,0,0,0-.9.23,2.163,2.163,0,0,1-1.084.3A2.122,2.122,0,0,1,1,15.62l-.7-1.2a2,2,0,0,1-.021-2.05,2.108,2.108,0,0,1,.817-.789,1.653,1.653,0,0,0,.644-.64,1.782,1.782,0,0,0,.19-1.365A1.837,1.837,0,0,0,1.071,8.44,2.045,2.045,0,0,1,.314,5.61L1,4.43a2.123,2.123,0,0,1,2.882-.76,1.894,1.894,0,0,0,.9.224A1.959,1.959,0,0,0,6.446,2.98a1.538,1.538,0,0,0,.236-.88A1.788,1.788,0,0,1,6.968,1.04,2.2,2.2,0,0,1,8.776,0h1.441a2.154,2.154,0,0,1,1.82,1.04A1.781,1.781,0,0,1,12.312,2.1a1.545,1.545,0,0,0,.235.88,1.964,1.964,0,0,0,1.672.914,1.926,1.926,0,0,0,.9-.224,2.111,2.111,0,0,1,2.872.76l.684,1.18a2.027,2.027,0,0,1-.756,2.831,1.829,1.829,0,0,0-.853,1.138,1.771,1.771,0,0,0,.2,1.362,1.571,1.571,0,0,0,.634.64,2.307,2.307,0,0,1,.828.789,2.031,2.031,0,0,1-.02,2.05l-.715,1.2a2.1,2.1,0,0,1-2.893.74,1.621,1.621,0,0,0-.9-.23,1.9,1.9,0,0,0-1.891,1.82A2.061,2.061,0,0,1,10.2,20ZM9.512,7.18a2.87,2.87,0,0,0-2.9,2.83,2.763,2.763,0,0,0,.849,2,2.93,2.93,0,0,0,2.053.821A2.822,2.822,0,0,0,11.55,8.006,2.877,2.877,0,0,0,9.512,7.18Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.5 2.5)"><Path d="M2.5,0A2.5,2.5,0,1,1,0,2.5,2.5,2.5,0,0,1,2.5,0Z" transform="translate(6 7)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M16.668,4.75h0a2.464,2.464,0,0,0-3.379-.912,1.543,1.543,0,0,1-2.314-1.346A2.484,2.484,0,0,0,8.5,0h0A2.484,2.484,0,0,0,6.025,2.492,1.543,1.543,0,0,1,3.712,3.839a2.465,2.465,0,0,0-3.38.912,2.5,2.5,0,0,0,.906,3.4,1.56,1.56,0,0,1,0,2.692,2.5,2.5,0,0,0-.906,3.4,2.465,2.465,0,0,0,3.379.913h0a1.542,1.542,0,0,1,2.313,1.345h0A2.484,2.484,0,0,0,8.5,19h0a2.484,2.484,0,0,0,2.474-2.492h0a1.543,1.543,0,0,1,2.314-1.345,2.465,2.465,0,0,0,3.379-.913,2.5,2.5,0,0,0-.905-3.4h0a1.56,1.56,0,0,1,0-2.692A2.5,2.5,0,0,0,16.668,4.75Z" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ShieldDone = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3.5 2)"><Path d="M8.581,20a.759.759,0,0,1-.353-.086l-3.6-1.863a8.458,8.458,0,0,1-2.446-1.817A8.25,8.25,0,0,1,.042,10.759L0,4.124A1.813,1.813,0,0,1,1.229,2.413L7.841.106A1.889,1.889,0,0,1,9.071.1l6.637,2.227a1.81,1.81,0,0,1,1.249,1.7L17,10.662a8.241,8.241,0,0,1-2.065,5.5A8.448,8.448,0,0,1,12.513,18L8.945,19.91a.787.787,0,0,1-.358.09ZM5.9,9.007a.764.764,0,0,0-.539.219.722.722,0,0,0,.007,1.039l1.916,1.843a.758.758,0,0,0,.528.212h.007a.761.761,0,0,0,.533-.219l3.9-3.844a.722.722,0,0,0-.006-1.039.769.769,0,0,0-1.067.005L7.808,10.545,6.429,9.219A.76.76,0,0,0,5.9,9.007Z" transform="translate(0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.5 2)"><Path d="M7.735,18.855a8.4,8.4,0,0,0,7.672-8.727c0-6.4.278-6.905-.337-7.521A12.6,12.6,0,0,0,7.735,0,12.589,12.589,0,0,0,.4,2.607c-.616.616-.338,1.117-.338,7.521A8.4,8.4,0,0,0,7.735,18.855Z" transform="translate(0.75 0.751)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,2.005,1.892,3.9,5.79,0" transform="translate(5.886 7.87)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const ShieldFail = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3.5 2)"><Path d="M8.586,20a.78.78,0,0,1-.363-.088l-3.6-1.863a8.4,8.4,0,0,1-2.435-1.814A8.2,8.2,0,0,1,.04,10.763L0,4.123A1.8,1.8,0,0,1,1.228,2.416L7.841.1a1.838,1.838,0,0,1,.61-.1,1.9,1.9,0,0,1,.618.1L15.7,2.328a1.8,1.8,0,0,1,1.248,1.7L17,10.664a8.248,8.248,0,0,1-2.074,5.492A8.366,8.366,0,0,1,12.511,18L8.938,19.912A.747.747,0,0,1,8.586,20ZM8.5,10.763h0l1.358,1.323a.757.757,0,0,0,.533.214.74.74,0,0,0,.534-.214.727.727,0,0,0,0-1.04L9.562,9.723,10.921,8.4a.717.717,0,0,0,.219-.509.742.742,0,0,0-.219-.531.773.773,0,0,0-1.067,0L8.5,8.684,7.136,7.359a.753.753,0,0,0-.53-.213.78.78,0,0,0-.537.213.741.741,0,0,0-.219.531A.715.715,0,0,0,6.07,8.4L7.428,9.723,6.07,11.047a.725.725,0,0,0,0,1.04A.76.76,0,0,0,6.6,12.3a.718.718,0,0,0,.534-.214l1.358-1.323Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.5 2)"><Path d="M7.736,18.855a8.4,8.4,0,0,0,7.672-8.727c0-6.4.278-6.905-.338-7.521A12.592,12.592,0,0,0,7.736,0,12.6,12.6,0,0,0,.4,2.607c-.616.616-.338,1.117-.338,7.521A8.4,8.4,0,0,0,7.736,18.855Z" transform="translate(0.75 0.751)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M3.759,3.758,0,0" transform="translate(6.605 8.066)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,3.758,3.759,0" transform="translate(6.605 8.066)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Show = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 4)"><Path d="M9.99,16C5.861,16,2.148,13.115.059,8.281a.724.724,0,0,1,0-.571C2.146,2.882,5.858,0,9.99,0H10a9.306,9.306,0,0,1,5.737,2.046,14.235,14.235,0,0,1,4.2,5.664.725.725,0,0,1,0,.571C17.851,13.115,14.135,16,10,16ZM6.1,8A3.9,3.9,0,1,0,10,4.121,3.89,3.89,0,0,0,6.1,8ZM7.562,8a2.487,2.487,0,0,1,.049-.475H7.66a2,2,0,0,0,2-1.921A1.989,1.989,0,0,1,10,5.574,2.419,2.419,0,1,1,7.562,8Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 4)"><Path id="Stroke_1" data-name="Stroke 1" d="M6.324,3.162A3.162,3.162,0,1,1,3.162,0,3.162,3.162,0,0,1,6.324,3.162Z" transform="translate(6.84 4.89)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path id="Stroke_3" data-name="Stroke 3" d="M0,7.3c0,3.28,4.142,7.3,9.252,7.3S18.5,10.585,18.5,7.3,14.361,0,9.252,0,0,4.022,0,7.3Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Star = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2.5)"><Path d="M15.919,11.82a1.1,1.1,0,0,0-.319.97l.889,4.92a1.08,1.08,0,0,1-.45,1.08,1.1,1.1,0,0,1-1.17.08L10.44,16.56a1.131,1.131,0,0,0-.5-.131H9.669a.812.812,0,0,0-.27.09L4.969,18.84a1.168,1.168,0,0,1-.71.11,1.112,1.112,0,0,1-.89-1.271l.89-4.92a1.119,1.119,0,0,0-.319-.979L.329,8.28A1.08,1.08,0,0,1,.06,7.15,1.123,1.123,0,0,1,.949,6.4l4.97-.721A1.112,1.112,0,0,0,6.8,5.07L8.989.58a1.041,1.041,0,0,1,.2-.27l.09-.07A.671.671,0,0,1,9.44.11L9.549.07,9.719,0h.421a1.119,1.119,0,0,1,.88.6l2.219,4.47a1.111,1.111,0,0,0,.83.609l4.97.721a1.134,1.134,0,0,1,.91.75,1.086,1.086,0,0,1-.29,1.13Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3 3)"><Path d="M9,0C6.964,0,6.771,3.547,5.559,4.8S.578,4.62.055,6.844s2.868,2.98,3.286,4.889-1.651,4.591.119,5.926S7.134,15.975,9,15.975s3.771,3.019,5.541,1.685-.3-4.017.119-5.926,3.808-2.664,3.286-4.889-4.292-.791-5.5-2.044S11.036,0,9,0Z" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Swap = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 3)"><Path d="M14.454,17.721a4.445,4.445,0,0,1-.434-.394A17.665,17.665,0,0,1,10.909,12.7a4.061,4.061,0,0,1-.32-1.078V11.57a1.461,1.461,0,0,1,.779-1.288,6.515,6.515,0,0,1,1.04-.28A20.9,20.9,0,0,1,15.3,9.83a17.926,17.926,0,0,1,2.985.2,7.45,7.45,0,0,1,.835.209,1.5,1.5,0,0,1,.709.65,1.633,1.633,0,0,1,.171.732,3.875,3.875,0,0,1-.264.963,17.773,17.773,0,0,1-3.155,4.736c-.16.162-.355.337-.4.382a1.43,1.43,0,0,1-.891.3A1.363,1.363,0,0,1,14.454,17.721Zm-10.94-2.3.257-4.578a.934.934,0,1,1,1.867,0L5.9,15.417a1.191,1.191,0,1,1-2.381,0Zm-1.8-7.444A7.4,7.4,0,0,1,.88,7.764a1.491,1.491,0,0,1-.709-.65A1.62,1.62,0,0,1,0,6.384a3.943,3.943,0,0,1,.262-.963A17.762,17.762,0,0,1,3.418.685c.161-.162.355-.337.4-.383A1.433,1.433,0,0,1,4.712,0a1.368,1.368,0,0,1,.834.278,4.586,4.586,0,0,1,.435.4A17.751,17.751,0,0,1,9.091,5.3a4.108,4.108,0,0,1,.321,1.079v.047a1.464,1.464,0,0,1-.778,1.287A6.442,6.442,0,0,1,7.593,8,20.9,20.9,0,0,1,4.7,8.17,17.926,17.926,0,0,1,1.715,7.973Zm12.647-.811L14.1,2.583a1.191,1.191,0,1,1,2.381,0l-.257,4.579a.934.934,0,1,1-1.867,0Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.9 4.6)"><Path d="M.5,0V12.618" transform="translate(3.579 0.001)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,4.1S2.169,0,4.078,0,8.156,4.1,8.156,4.1" transform="translate(0 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5,12.618V0" transform="translate(13.506 2.21)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M8.156,0S5.986,4.1,4.078,4.1,0,0,0,0" transform="translate(9.929 10.728)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const TickSquare = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M14.34,20H5.67C2.279,20,0,17.625,0,14.091V5.92C0,2.379,2.279,0,5.67,0h8.67C17.725,0,20,2.379,20,5.92v8.171C20,17.625,17.725,20,14.34,20ZM6.44,9.125a.875.875,0,0,0-.62,1.5L8.2,12.99a.881.881,0,0,0,1.23,0L14.18,8.24A.877.877,0,0,0,12.94,7L8.81,11.13,7.06,9.38A.868.868,0,0,0,6.44,9.125Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M0,2.373,2.374,4.746,7.12,0" transform="translate(6.44 7.627)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Ticket = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 4)"><Path d="M16.219,16H13.066a.583.583,0,0,1-.59-.573V13.4a.708.708,0,0,0-.725-.7.716.716,0,0,0-.725.7v2.03a.582.582,0,0,1-.589.573H3.782A3.733,3.733,0,0,1,0,12.326V9.916a.693.693,0,0,1,.739-.661A1.283,1.283,0,0,0,2.021,8a1.212,1.212,0,0,0-1.3-1.174.734.734,0,0,1-.513-.207A.69.69,0,0,1,0,6.116V3.683A3.742,3.742,0,0,1,3.791,0h6.646a.582.582,0,0,1,.589.573v2.4a.725.725,0,0,0,.725.7.716.716,0,0,0,.725-.7V.573A.583.583,0,0,1,13.066,0h3.153A3.733,3.733,0,0,1,20,3.674V6.041a.694.694,0,0,1-.212.5.734.734,0,0,1-.513.206,1.255,1.255,0,1,0-.014,2.509A.693.693,0,0,1,20,9.916v2.41A3.733,3.733,0,0,1,16.219,16ZM11.75,5.7a.724.724,0,0,0-.725.7v3.758a.725.725,0,0,0,.725.7.716.716,0,0,0,.725-.7V6.407A.716.716,0,0,0,11.75,5.7Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.5 3)"><Path d="M.475,0V2.655" transform="translate(10.384 0.6)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.475,0V2.22" transform="translate(10.384 14.544)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.475,5.289V0" transform="translate(10.384 6.255)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M19,10.55a2.051,2.051,0,0,1,0-4.1C19,1.7,19,0,9.5,0S0,1.7,0,6.449a2.051,2.051,0,0,1,0,4.1C0,15.3,0,17,9.5,17S19,15.3,19,10.55Z" transform="translate(0 0.5)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const TicketStar = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 3)"><Path d="M15.858,18H4.143A4.128,4.128,0,0,1,0,13.9V11.219a.747.747,0,0,1,.75-.743A1.484,1.484,0,0,0,2.24,9,1.411,1.411,0,0,0,.75,7.612.748.748,0,0,1,0,6.869L0,4.1A4.128,4.128,0,0,1,4.144,0H15.856A4.129,4.129,0,0,1,20,4.1V6.782a.745.745,0,0,1-.75.743,1.475,1.475,0,1,0,0,2.95.747.747,0,0,1,.75.743V13.9A4.128,4.128,0,0,1,15.858,18ZM10,11.27h0l1.455.757a.751.751,0,0,0,.349.088.741.741,0,0,0,.726-.859l-.279-1.608L13.431,8.51a.72.72,0,0,0,.187-.753.729.729,0,0,0-.6-.5l-1.629-.236-.729-1.463a.743.743,0,0,0-1.327,0L8.608,7.025,6.982,7.26a.736.736,0,0,0-.6.5.723.723,0,0,0,.187.753L7.748,9.648,7.47,11.256a.727.727,0,0,0,.3.718.741.741,0,0,0,.777.055L10,11.27Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.65 3.411)"><Path d="M18.79,10.583c-2.661,0-2.661-4.114,0-4.114C18.79,1.7,18.79,0,9.4,0S0,1.7,0,6.469c2.661,0,2.661,4.114,0,4.114,0,4.768,0,6.47,9.4,6.47S18.79,15.351,18.79,10.583Z" transform="translate(0 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M3.018,0C2.335,0,2.27,1.089,1.864,1.475S.194,1.42.018,2.1s.962.916,1.1,1.5S.567,5.016,1.16,5.427s1.233-.518,1.858-.518,1.264.927,1.858.518-.1-1.235.039-1.822,1.278-.819,1.1-1.5S4.579,1.86,4.172,1.475,3.7,0,3.018,0Z" transform="translate(6.377 5.76)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const TimeCircle = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M10,20A10,10,0,1,1,10,0a10,10,0,0,1,7.074,17.074A9.936,9.936,0,0,1,10,20ZM9.65,4.93a.751.751,0,0,0-.75.75v5.05a.747.747,0,0,0,.37.64l3.92,2.34a.764.764,0,0,0,.39.111.746.746,0,0,0,.64-.371.756.756,0,0,0-.26-1.03L10.4,10.3V5.68A.751.751,0,0,0,9.65,4.93Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M18.5,9.25A9.25,9.25,0,1,1,9.25,0,9.25,9.25,0,0,1,18.5,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.53,4.921,0,4.847V0" transform="translate(9.661 5.846)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const TimeSquare = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M14.34,20H5.67C2.279,20,0,17.624,0,14.089V5.919C0,2.379,2.279,0,5.67,0h8.67C17.725,0,20,2.379,20,5.919v8.169C20,17.624,17.725,20,14.34,20ZM9.65,4.919a.76.76,0,0,0-.75.75V10.72a.733.733,0,0,0,.37.64l3.92,2.34a.7.7,0,0,0,.39.11.745.745,0,0,0,.64-.37.72.72,0,0,0,.09-.552.762.762,0,0,0-.35-.477L10.4,10.29V5.669A.751.751,0,0,0,9.65,4.919Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 2)"><Path d="M0,9.25c0,6.937,2.313,9.25,9.25,9.25s9.25-2.313,9.25-9.25S16.187,0,9.25,0,0,2.313,0,9.25Z" transform="translate(0.75 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M3.391,6.384,0,4.361V0" transform="translate(9.999 5.634)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const TwoUsers = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 3)"><Path d="M0,14.918c0-2.447,3.386-3.06,7.349-3.06,3.985,0,7.349.634,7.349,3.083S11.313,18,7.349,18C3.364,18,0,17.366,0,14.918Zm16.633.475c.341-3.112-2.366-4.588-3.067-4.927a.053.053,0,0,1-.033-.054.041.041,0,0,1,.037-.028,18.394,18.394,0,0,1,3.748.319,3.193,3.193,0,0,1,2.462,1.468,2.106,2.106,0,0,1,0,1.877c-.532,1.123-2.246,1.485-2.912,1.578l-.03,0A.208.208,0,0,1,16.633,15.393ZM2.487,4.763A4.8,4.8,0,0,1,7.349,0a4.8,4.8,0,0,1,4.863,4.763A4.8,4.8,0,0,1,7.349,9.525,4.8,4.8,0,0,1,2.487,4.763ZM13.719,8.822a4.069,4.069,0,0,1-.56-.052.177.177,0,0,1-.122-.274,6.432,6.432,0,0,0-.1-7.439.11.11,0,0,1-.018-.123.148.148,0,0,1,.095-.056A4.2,4.2,0,0,1,13.834.8a4.045,4.045,0,0,1,3.957,5.076A4.04,4.04,0,0,1,13.83,8.823Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.75 2.549)"><Path d="M6.809,7.007C3.137,7.007,0,6.452,0,4.228S3.117,0,6.809,0c3.672,0,6.808,1.985,6.808,4.208S10.5,7.007,6.809,7.007Z" transform="translate(0 11.9)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.364,8.728a4.349,4.349,0,1,0-.031,0Z" transform="translate(2.445 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.187,6.4A3.289,3.289,0,0,0,2.624,3.221,3.288,3.288,0,0,0,0,0" transform="translate(13.865 1.132)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0C1.988,0,3.686,1.348,3.686,2.551A1.814,1.814,0,0,1,2.211,4.2" transform="translate(14.711 11.104)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Unlock = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3.5 2)"><Path d="M12.731,20H4.268A4.227,4.227,0,0,1,0,15.825V10.886A4.038,4.038,0,0,1,.872,8.372,4.337,4.337,0,0,1,3.071,6.9l-.111.014V5.387A5.548,5.548,0,0,1,13.711,3.628a.838.838,0,0,1-.041.666.85.85,0,0,1-.509.438.887.887,0,0,1-.291.049.91.91,0,0,1-.847-.585A3.761,3.761,0,0,0,4.739,5.368V6.709l-.013,0h8.006A4.227,4.227,0,0,1,17,10.886v4.938A4.227,4.227,0,0,1,12.731,20ZM8.5,11.382a.875.875,0,0,0-.884.865v2.207a.889.889,0,0,0,1.778,0V12.247A.881.881,0,0,0,8.5,11.382Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(3.5 2)"><Path d="M8.927,3.237A4.562,4.562,0,0,0,0,4.484V6.653" transform="translate(3.849 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5,0V2.221" transform="translate(7.91 12.156)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M7.66,0C1.915,0,0,1.568,0,6.271s1.915,6.272,7.66,6.272,7.661-1.568,7.661-6.272S13.406,0,7.66,0Z" transform="translate(0.75 6.824)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Upload = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M4.45,20.78A4.489,4.489,0,0,1,0,16.465l0-.213V11.288a4.485,4.485,0,0,1,4.231-4.5l.209,0H9.23v6.1a.769.769,0,0,0,1.533.107l.007-.107v-6.1h4.78A4.489,4.489,0,0,1,20,11.094l0,.213v4.955a4.487,4.487,0,0,1-4.231,4.513l-.209,0Zm4.781-14V2.64L7.64,4.24a.773.773,0,0,1-1.09,0,.763.763,0,0,1-.085-1L6.54,3.15,9.45.23A.764.764,0,0,1,10,0a.754.754,0,0,1,.45.149l.09.082,2.911,2.92a.771.771,0,0,1-1,1.165l-.085-.075-1.59-1.6V6.78Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 22) rotate(-90)"><Path d="M12.041.5H0" transform="translate(7.75 9.621)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0,2.928,2.916,0,5.832" transform="translate(16.864 7.205)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,4.88C-.33,1.3-1.67,0-7,0c-7.1,0-7.1,2.31-7.1,9.25s0,9.25,7.1,9.25c5.33,0,6.67-1.3,7-4.88" transform="translate(14.36 0.75)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const User = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(4 2)"><Path d="M0,16.575c0-2.722,3.686-3.4,8-3.4,4.339,0,8,.7,8,3.424S12.315,20,8,20C3.662,20,0,19.3,0,16.575ZM2.706,5.291A5.294,5.294,0,1,1,8,10.583,5.274,5.274,0,0,1,2.706,5.291Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(5 2.4)"><Path d="M6.845,7.3C3.153,7.3,0,6.726,0,4.425S3.133,0,6.845,0c3.692,0,6.845,2.1,6.845,4.4S10.556,7.3,6.845,7.3Z" transform="translate(0 11.962)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.387,8.774a4.372,4.372,0,1,0-.031,0Z" transform="translate(2.45 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Video = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 4.5)"><Path d="M4.113,15A3.91,3.91,0,0,1,0,10.939V4.061A3.91,3.91,0,0,1,4.113,0H9.905a3.91,3.91,0,0,1,4.113,4.061v6.879A3.91,3.91,0,0,1,9.905,15Zm13.844-2.38-1.48-.747a1.624,1.624,0,0,1-.888-1.457V4.583a1.618,1.618,0,0,1,.888-1.455l1.481-.749a1.384,1.384,0,0,1,1.373.064A1.432,1.432,0,0,1,20,3.662v7.676a1.43,1.43,0,0,1-.669,1.219,1.4,1.4,0,0,1-.743.216A1.384,1.384,0,0,1,17.957,12.621Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.514 5.114)"><Path d="M0,2.466C1.838,1.009,4.3-.4,4.771.1c.771.829.7,8.714,0,9.467-.429.467-2.914-.943-4.771-2.39" transform="translate(13.637 2.092)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,6.923C0,1.73,1.725,0,6.9,0s6.9,1.73,6.9,6.923-1.725,6.923-6.9,6.923S0,12.114,0,6.923Z" transform="translate(0 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Voice = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3.5 2)"><Path d="M7.532,19.043V17.118A8.443,8.443,0,0,1,0,8.783a.962.962,0,0,1,.968-.957.963.963,0,0,1,.969.957,6.563,6.563,0,0,0,13.125,0,.969.969,0,0,1,1.938,0,8.443,8.443,0,0,1-7.531,8.335v1.925a.968.968,0,0,1-1.937,0Zm.793-5.826a4.326,4.326,0,0,1-4.351-4.3V4.3A4.324,4.324,0,0,1,8.325,0h.35a4.325,4.325,0,0,1,4.352,4.3V8.92a4.326,4.326,0,0,1-4.352,4.3Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(4.9 2.5)"><Path d="M0,0A5.669,5.669,0,0,0,5.669,5.669,5.669,5.669,0,0,0,11.339,0" transform="translate(1.465 11.178)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M11.339,7.923V5.669A5.669,5.669,0,0,0,0,5.669V7.923" transform="translate(1.465 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.5,2.152V0" transform="translate(6.634 16.848)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,.5H14.268" transform="translate(0 10.678)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Voice2 = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3.5 2)"><Path d="M7.532,19.043V17.118A8.443,8.443,0,0,1,0,8.783a.962.962,0,0,1,.968-.957.963.963,0,0,1,.969.957,6.563,6.563,0,0,0,13.125,0,.969.969,0,0,1,1.938,0,8.443,8.443,0,0,1-7.531,8.335v1.925a.968.968,0,0,1-1.937,0Zm.793-5.827a4.324,4.324,0,0,1-4.351-4.3V4.3A4.324,4.324,0,0,1,8.325,0h.35a4.345,4.345,0,0,1,4.189,3.131.388.388,0,0,1-.376.493H11.356a.616.616,0,0,0-.62.612h0a.616.616,0,0,0,.62.612H12.4a.618.618,0,1,1,0,1.236H11.356a.613.613,0,1,0,0,1.226H12.4a.618.618,0,1,1,0,1.236H11.356a.612.612,0,1,0,0,1.224h1.077a.387.387,0,0,1,.372.506,4.347,4.347,0,0,1-4.13,2.94Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(4.5 2.5)"><Path d="M0,0A5.386,5.386,0,0,0,5.386,5.386,5.385,5.385,0,0,0,10.772,0" transform="translate(2.104 11.332)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M10.772,7.527V5.386A5.386,5.386,0,0,0,0,5.386V7.527" transform="translate(2.104 0.713)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.475,2.044V0" transform="translate(7.015 16.718)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,.475H13.556" transform="translate(0.712 10.857)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,.475H2.985" transform="translate(5.997 7.477)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M1,.475H0" transform="translate(6.988 4.707)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const VolumeDown = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3 3)"><Path d="M9.689,18A2.694,2.694,0,0,1,8.1,17.323l-3.531-2.94H2.755A2.646,2.646,0,0,1,.145,11.8a27.888,27.888,0,0,1,0-5.677,2.7,2.7,0,0,1,2.61-2.51H4.568L8.032.719A3.022,3.022,0,0,1,9.769,0a2.548,2.548,0,0,1,2.37,1.956,10.116,10.116,0,0,1,.232,1.495l.048.442a96.7,96.7,0,0,1,0,10.216l-.048.458a9.034,9.034,0,0,1-.224,1.453A2.542,2.542,0,0,1,9.793,18Zm5.459-3.257a.955.955,0,0,1-.23-1.308A7.955,7.955,0,0,0,16.163,9a7.952,7.952,0,0,0-1.246-4.434.955.955,0,0,1,.23-1.308.91.91,0,0,1,1.278.237A9.869,9.869,0,0,1,18,9a9.869,9.869,0,0,1-1.574,5.505.914.914,0,0,1-.754.4A.9.9,0,0,1,15.148,14.742Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(4 5)"><Path d="M0,0A7.568,7.568,0,0,1,0,7.306" transform="translate(14.656 3.635)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,6.621c0,1.219,0,2.648,1.006,3.5s1.805.5,3.108.931,3.128,3.076,5.144,1.881c1.09-.774,1.6-2.236,1.6-6.314S10.371,1.1,9.258.307C7.242-.888,5.417,1.76,4.114,2.188s-2.1.076-3.108.931S0,5.4,0,6.621Z" transform="translate(0.667 0.666)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const VolumeOff = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(3 3)"><Path d="M.274,18.733a.929.929,0,0,1,0-1.314L3.1,14.593H3.068A2.637,2.637,0,0,1,.443,12.052a27.39,27.39,0,0,1,0-5.6A2.683,2.683,0,0,1,3.068,3.987H4.9L8.392,1.13A3.184,3.184,0,0,1,10.149.42a2.539,2.539,0,0,1,2.382,1.925,8.172,8.172,0,0,1,.234,1.472l.084.677c.014.1.026.2.037.309L17.42.271a.926.926,0,0,1,1.309,1.31L1.58,18.729A.947.947,0,0,1,.924,19,.964.964,0,0,1,.274,18.733Zm9.79-.572a2.746,2.746,0,0,1-1.6-.666l-1.3-1.006a.872.872,0,0,1-.071-1.294c.277-.338,4.648-4.322,4.792-4.463a.843.843,0,0,1,.607-.2c.389.1.464.656.458,1.094-.018,1.273-.06,2.157-.128,2.7l-.048.451a8.6,8.6,0,0,1-.228,1.432,2.546,2.546,0,0,1-2.372,1.952Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(4 4)"><Path d="M3.732,11.008c-1.083-.251-1.816-.054-2.72-.814C0,9.335-.008,7.895,0,6.669-.008,5.443,0,4,1.012,3.144s1.816-.51,3.132-.939,3.141-3.1,5.172-1.9c.823.582,1.306,1.53,1.5,3.615" transform="translate(0.671 1.545)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M4.509,0c-.116,3.006-.635,4.214-1.593,4.894A2.583,2.583,0,0,1,0,4.509" transform="translate(7.07 9.672)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M15.345,0,0,15.345" transform="translate(0.941 0.671)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const VolumeUp = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(1 3)"><Path d="M9.677,18a2.693,2.693,0,0,1-1.588-.676l-3.526-2.94H2.752A2.645,2.645,0,0,1,.145,11.8a27.953,27.953,0,0,1,0-5.677,2.7,2.7,0,0,1,2.607-2.51H4.563l3.46-2.9A3.014,3.014,0,0,1,9.758,0a2.548,2.548,0,0,1,2.368,1.956,10.232,10.232,0,0,1,.231,1.495l.048.442a96.7,96.7,0,0,1,0,10.216l-.048.458a9.034,9.034,0,0,1-.224,1.453A2.54,2.54,0,0,1,9.782,18Zm8.614-.22a.957.957,0,0,1-.23-1.308A13.405,13.405,0,0,0,20.165,9,13.4,13.4,0,0,0,18.06,1.529.958.958,0,0,1,18.29.221a.9.9,0,0,1,1.277.236A15.319,15.319,0,0,1,22,9a15.318,15.318,0,0,1-2.433,8.544.912.912,0,0,1-.753.4A.9.9,0,0,1,18.291,17.78Zm-3.162-3.038a.957.957,0,0,1-.23-1.308A7.957,7.957,0,0,0,16.143,9,7.955,7.955,0,0,0,14.9,4.566a.957.957,0,0,1,.229-1.308.907.907,0,0,1,1.279.237A9.878,9.878,0,0,1,17.978,9a9.878,9.878,0,0,1-1.571,5.505.9.9,0,0,1-1.278.237Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 4.5)"><Path d="M0,0A11.128,11.128,0,0,1,0,12.357" transform="translate(17.436 1.274)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,0A7.74,7.74,0,0,1,0,7.472" transform="translate(14.989 3.717)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,6.771c0,1.246,0,2.708,1.029,3.582s1.846.514,3.178.952,3.2,3.146,5.261,1.924c1.115-.792,1.64-2.286,1.64-6.457s-.5-5.649-1.64-6.457C7.407-.908,5.54,1.8,4.208,2.238s-2.148.078-3.178.952S0,5.525,0,6.771Z" transform="translate(0.682 0.682)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Wallet = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 3)"><Path d="M14.515,18H5.485a5.64,5.64,0,0,1-4.036-1.411A5.323,5.323,0,0,1,0,12.661V5.339A5.323,5.323,0,0,1,1.449,1.411,5.64,5.64,0,0,1,5.485,0h9.031a5.618,5.618,0,0,1,4.036,1.417A5.392,5.392,0,0,1,20,5.382H15.769v.034a3.583,3.583,0,0,0-2.513,1.017,3.4,3.4,0,0,0-1.043,2.449,3.516,3.516,0,0,0,3.556,3.467H20v.311a5.323,5.323,0,0,1-1.449,3.928A5.64,5.64,0,0,1,14.515,18ZM4.738,3.892a.757.757,0,0,0-.764.736.766.766,0,0,0,.764.754h5.645a.745.745,0,1,0,0-1.49Zm14.515,6.967H15.819A2.1,2.1,0,0,1,13.76,9.265a1.977,1.977,0,0,1,.433-1.652,2.089,2.089,0,0,1,1.576-.74h3.484A.739.739,0,0,1,20,7.6v2.531A.75.75,0,0,1,19.253,10.858ZM15.91,8.042a.757.757,0,0,0-.53.212.732.732,0,0,0-.225.524.766.766,0,0,0,.765.754h.329a.745.745,0,1,0,0-1.49H15.91Z" transform="translate(0 0)" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2 3)"><Path d="M6.45,5.127H2.563A2.563,2.563,0,0,1,2.563,0H6.419" transform="translate(12.722 6.549)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M.625.476h-.3" transform="translate(15.097 8.577)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,.476H4.06" transform="translate(5.606 4.668)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,8.539C0,2.134,2.325,0,9.3,0s9.3,2.134,9.3,8.539-2.325,8.539-9.3,8.539S0,14.943,0,8.539Z" transform="translate(0.714 0.714)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};
export const Work = ({ size = 24, primaryColor, color = 'currentColor', set = 'curved', stroke = 'bold', strokeWidth = 1.5 }: IconProps) => {
    const s = getSize(size);
    const strokeWidthOverride = getStrokeWidth(stroke);
    
    if (set === 'bold' || set === 'bulk') {
        return (
            <Svg width={s} height={s} viewBox="0 0 24 24">
                <G transform="translate(2 2)"><Path d="M3.972,20a3.829,3.829,0,0,1-3.8-3.847L.1,10.987a.211.211,0,0,1,.09-.172.128.128,0,0,1,.071-.02.207.207,0,0,1,.119.041,17.072,17.072,0,0,0,7,2.632.722.722,0,0,0,.1.006.753.753,0,0,0,.722-.554,1.824,1.824,0,0,1,1.78-1.377h.031a1.824,1.824,0,0,1,1.78,1.377.753.753,0,0,0,.723.554.718.718,0,0,0,.1-.006,17.072,17.072,0,0,0,7-2.632l.04-.021a.183.183,0,0,1,.08-.019.132.132,0,0,1,.07.019.211.211,0,0,1,.09.172l-.08,5.165A3.829,3.829,0,0,1,16.018,20Zm5.273-6.248v1.307a.755.755,0,0,0,.75.759.746.746,0,0,0,.751-.759V13.752a.756.756,0,0,0-.751-.76A.765.765,0,0,0,9.245,13.752Zm3.6-2.078A3.3,3.3,0,0,0,10,10.025a3.358,3.358,0,0,0-2.873,1.642.327.327,0,0,1-.276.166.286.286,0,0,1-.056-.005A15.524,15.524,0,0,1,1.171,9.56L.21,8.891a.289.289,0,0,1-.13-.243C.051,8.141,0,6.487,0,6.471A3.839,3.839,0,0,1,3.812,2.613H5.783A2.977,2.977,0,0,1,8.7,0h2.581a2.977,2.977,0,0,1,2.921,2.613h1.981A3.839,3.839,0,0,1,20,6.471c0,.009-.059.913-.08,2.154a.33.33,0,0,1-.129.256c-.471.347-.918.647-.961.669a15.328,15.328,0,0,1-5.647,2.288.3.3,0,0,1-.057.005A.325.325,0,0,1,12.848,11.674ZM7.3,2.613h5.383a1.447,1.447,0,0,0-1.4-1.093H8.7A1.448,1.448,0,0,0,7.3,2.613Z" fill={primaryColor || color}></Path></G>
            </Svg>
        );
    }
    
    return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
            <G transform="translate(2.75 2.45)"><Path d="M.5,2.628V0" transform="translate(8.711 11.439)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M18.257,0l-.029.021a17.52,17.52,0,0,1-9.1,2.393A17.48,17.48,0,0,1,.03.021L0,0" transform="translate(0.082 9.027)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M0,8.2C0,2.051,2.3,0,9.211,0s9.211,2.051,9.211,8.2-2.3,8.2-9.211,8.2S0,14.355,0,8.2Z" transform="translate(0 2.697)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path><Path d="M6.525,2.919v-.63A2.184,2.184,0,0,0,4.465,0H2.06A2.184,2.184,0,0,0,0,2.289v.63" transform="translate(5.949 0)" fill="none" stroke={primaryColor || color} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth={strokeWidthOverride}></Path></G>
        </Svg>
    );
};

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
