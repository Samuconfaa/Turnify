import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export type IconName =
  | 'home' | 'cal' | 'users' | 'bell' | 'user' | 'palm'
  | 'check' | 'x' | 'plus' | 'minus' | 'chev-r' | 'chev-l' | 'chev-d'
  | 'search' | 'filter' | 'lock' | 'mail' | 'eye' | 'briefcase' | 'key'
  | 'shield' | 'clock' | 'download' | 'upload' | 'edit' | 'trash'
  | 'swap' | 'pin' | 'sparkle' | 'phone' | 'building' | 'doc'
  | 'logout' | 'bolt' | 'bar' | 'camera' | 'moon' | 'list' | 'grid'
  | 'flag' | 'pencil' | 'arrow-r' | 'arrow-l' | 'arrow-u' | 'arrow-d'
  | 'menu' | 'more' | 'sun' | 'globe';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.8 }: IconProps) {
  const p = { width: size, height: size, fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (name) {
    case 'home':
      return <Svg {...p}><Path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-4v-7h-8v7H4a1 1 0 01-1-1V11z" /></Svg>;
    case 'cal':
      return <Svg {...p}><Rect x="3" y="5" width="18" height="16" rx="2" /><Path d="M3 10h18M8 3v4M16 3v4" /></Svg>;
    case 'users':
      return <Svg {...p}><Circle cx="9" cy="8" r="3.5" /><Path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" /><Circle cx="17" cy="9" r="2.5" /><Path d="M21.5 17c0-2-1.6-3.5-4-3.5" /></Svg>;
    case 'bell':
      return <Svg {...p}><Path d="M6 8a6 6 0 1112 0c0 3 1.5 5 2 6H4c.5-1 2-3 2-6z" /><Path d="M10 19a2 2 0 004 0" /></Svg>;
    case 'user':
      return <Svg {...p}><Circle cx="12" cy="8" r="4" /><Path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></Svg>;
    case 'palm':
      return <Svg {...p}><Path d="M12 21V10" /><Path d="M12 10c-2-4-6-3-7-1M12 10c2-4 6-3 7-1M12 10c-1-3 1-6 4-6M12 10c1-3-1-6-4-6" /></Svg>;
    case 'check':
      return <Svg {...p}><Path d="M4 12l5 5L20 6" /></Svg>;
    case 'x':
      return <Svg {...p}><Path d="M6 6l12 12M18 6L6 18" /></Svg>;
    case 'plus':
      return <Svg {...p}><Path d="M12 5v14M5 12h14" /></Svg>;
    case 'minus':
      return <Svg {...p}><Path d="M5 12h14" /></Svg>;
    case 'chev-r':
      return <Svg {...p}><Path d="M9 6l6 6-6 6" /></Svg>;
    case 'chev-l':
      return <Svg {...p}><Path d="M15 6l-6 6 6 6" /></Svg>;
    case 'chev-d':
      return <Svg {...p}><Path d="M6 9l6 6 6-6" /></Svg>;
    case 'search':
      return <Svg {...p}><Circle cx="11" cy="11" r="7" /><Path d="M20 20l-3.5-3.5" /></Svg>;
    case 'filter':
      return <Svg {...p}><Path d="M4 5h16M7 12h10M10 19h4" /></Svg>;
    case 'lock':
      return <Svg {...p}><Rect x="5" y="11" width="14" height="10" rx="2" /><Path d="M8 11V7a4 4 0 118 0v4" /></Svg>;
    case 'mail':
      return <Svg {...p}><Rect x="3" y="5" width="18" height="14" rx="2" /><Path d="M3 7l9 7 9-7" /></Svg>;
    case 'eye':
      return <Svg {...p}><Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><Circle cx="12" cy="12" r="3" /></Svg>;
    case 'briefcase':
      return <Svg {...p}><Rect x="3" y="7" width="18" height="13" rx="2" /><Path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></Svg>;
    case 'key':
      return <Svg {...p}><Circle cx="8" cy="15" r="4" /><Path d="M11 12l9-9M16 7l3 3" /></Svg>;
    case 'shield':
      return <Svg {...p}><Path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" /></Svg>;
    case 'clock':
      return <Svg {...p}><Circle cx="12" cy="12" r="9" /><Path d="M12 7v5l3 2" /></Svg>;
    case 'download':
      return <Svg {...p}><Path d="M12 3v13M6 11l6 6 6-6M4 21h16" /></Svg>;
    case 'upload':
      return <Svg {...p}><Path d="M12 21V8M6 13l6-6 6 6M4 3h16" /></Svg>;
    case 'edit':
      return <Svg {...p}><Path d="M4 20h4l11-11-4-4L4 16v4z" /></Svg>;
    case 'trash':
      return <Svg {...p}><Path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" /></Svg>;
    case 'swap':
      return <Svg {...p}><Path d="M7 5h13l-4-4M7 5l4 4M17 19H4l4 4M17 19l-4-4" /></Svg>;
    case 'pin':
      return <Svg {...p}><Path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z" /><Circle cx="12" cy="9" r="2.5" /></Svg>;
    case 'sparkle':
      return <Svg {...p}><Path d="M12 3v6M12 15v6M3 12h6M15 12h6" /></Svg>;
    case 'phone':
      return <Svg {...p}><Path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></Svg>;
    case 'building':
      return <Svg {...p}><Rect x="4" y="3" width="16" height="18" rx="1" /><Path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2" /></Svg>;
    case 'doc':
      return <Svg {...p}><Path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" /><Path d="M14 3v5h5M9 13h6M9 17h4" /></Svg>;
    case 'logout':
      return <Svg {...p}><Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></Svg>;
    case 'bolt':
      return <Svg {...p}><Path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></Svg>;
    case 'bar':
      return <Svg {...p}><Path d="M4 21V10M10 21V5M16 21v-8M22 21H2" /></Svg>;
    case 'camera':
      return <Svg {...p}><Path d="M3 8h4l2-3h6l2 3h4v12H3V8z" /><Circle cx="12" cy="13" r="4" /></Svg>;
    case 'moon':
      return <Svg {...p}><Path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z" /></Svg>;
    case 'list':
      return <Svg {...p}><Path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Svg>;
    case 'grid':
      return <Svg {...p}><Rect x="3" y="3" width="7" height="7" /><Rect x="14" y="3" width="7" height="7" /><Rect x="3" y="14" width="7" height="7" /><Rect x="14" y="14" width="7" height="7" /></Svg>;
    case 'flag':
      return <Svg {...p}><Path d="M4 21V4l9 2 7-1v10l-7 1-9-2" /></Svg>;
    case 'pencil':
      return <Svg {...p}><Path d="M12 19l7-7 3 3-7 7H12v-3zM15 7l3 3M11 8l-7 7v3h3l7-7" /></Svg>;
    case 'arrow-r':
      return <Svg {...p}><Path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
    case 'arrow-l':
      return <Svg {...p}><Path d="M19 12H5M11 6l-6 6 6 6" /></Svg>;
    case 'arrow-u':
      return <Svg {...p}><Path d="M12 19V5M6 11l6-6 6 6" /></Svg>;
    case 'arrow-d':
      return <Svg {...p}><Path d="M12 5v14M6 13l6 6 6-6" /></Svg>;
    case 'menu':
      return <Svg {...p}><Path d="M4 12h16M4 6h16M4 18h16" /></Svg>;
    case 'more':
      return <Svg {...p}><Circle cx="6" cy="12" r="1.5" fill={color} stroke="none" /><Circle cx="12" cy="12" r="1.5" fill={color} stroke="none" /><Circle cx="18" cy="12" r="1.5" fill={color} stroke="none" /></Svg>;
    case 'sun':
      return <Svg {...p}><Circle cx="12" cy="12" r="4" /><Path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" /></Svg>;
    case 'globe':
      return <Svg {...p}><Circle cx="12" cy="12" r="9" /><Path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></Svg>;
    default:
      return <Svg {...p}><Circle cx="12" cy="12" r="3" /></Svg>;
  }
}
