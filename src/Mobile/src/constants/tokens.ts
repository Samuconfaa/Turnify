export interface ThemeTokens {
  primary: string;
  primaryLight: string;
  bg: string;
  surface: string;
  surfaceLow: string;
  text: string;
  textSecondary: string;
  border: string;
  borderSoft: string;
  successBg: string;
  successText: string;
  warningBg: string;
  warningText: string;
  errorBg: string;
  errorText: string;
  danger: string;
  kpiAmber: string;
  kpiBlue: string;
  kpiAmberBg: string;
  kpiBlueBg: string;
  kpiDangerBg: string;
  kpiPrimaryBg: string;
  skeleton: string;
  overlay: string;
}

export const TOKENS: { light: ThemeTokens; dark: ThemeTokens } = {
  light: {
    primary: '#006948',
    primaryLight: '#D1FAE5',
    bg: '#F5FBF5',
    surface: '#FFFFFF',
    surfaceLow: '#EFF5EF',
    text: '#171D19',
    textSecondary: '#3D4A42',
    border: '#BCCAC0',
    borderSoft: '#D6E0D9',
    successBg: '#D1FAE5',
    successText: '#005137',
    warningBg: '#FEF3C7',
    warningText: '#92400E',
    errorBg: '#FFDAD6',
    errorText: '#93000A',
    danger: '#BA1A1A',
    kpiAmber: '#F59E0B',
    kpiBlue: '#0284C7',
    kpiAmberBg: '#FEF3C7',
    kpiBlueBg: '#DBEAFE',
    kpiDangerBg: '#FFDAD6',
    kpiPrimaryBg: '#D1FAE5',
    skeleton: '#EFF5EF',
    overlay: 'rgba(23,29,25,0.06)',
  },
  dark: {
    primary: '#68DBA9',
    primaryLight: '#1F3329',
    bg: '#0D1510',
    surface: '#162019',
    surfaceLow: '#1B2620',
    text: '#E2F0E6',
    textSecondary: '#A3B5A8',
    border: '#3A4D41',
    borderSoft: '#2A382F',
    successBg: '#1F3329',
    successText: '#68DBA9',
    warningBg: '#3A2E13',
    warningText: '#FBBF24',
    errorBg: '#3A1814',
    errorText: '#FCA5A5',
    danger: '#FCA5A5',
    kpiAmber: '#F59E0B',
    kpiBlue: '#38BDF8',
    kpiAmberBg: '#3A2E13',
    kpiBlueBg: '#0F2A3A',
    kpiDangerBg: '#3A1814',
    kpiPrimaryBg: '#1F3329',
    skeleton: '#1B2620',
    overlay: 'rgba(0,0,0,0.3)',
  },
};

export function textOnPrimary(t: ThemeTokens): string {
  return t.primary === '#68DBA9' ? '#0D1510' : '#FFFFFF';
}

export const FONT_FAMILY = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semiBold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
} as const;
