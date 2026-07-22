import { DeviceEventEmitter } from 'react-native';

export type HeaderStyle = 'top_glow' | 'normal' | 'simple';

let currentStyle: HeaderStyle = 'top_glow';

export const getHeaderStyle = (): HeaderStyle => {
  return currentStyle;
};

export const setHeaderStyle = (style: HeaderStyle) => {
  currentStyle = style;
  DeviceEventEmitter.emit('headerStyleChanged', style);
};
