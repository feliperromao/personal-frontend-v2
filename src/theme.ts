import { alpha, createTheme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';
import { ptBR } from '@mui/x-data-grid/locales';

export const tokens = {
  color: {
    canvas: '#F8F8F8',
    surface: '#FFFFFF',
    ink: '#0B1226',
    muted: '#5D6475',
    line: '#D8DCE7',
    primary: '#5B21D1',
    primaryDark: '#4215A5',
    energy: '#D1DC27',
    success: '#477A19',
    info: '#2675D8',
    warning: '#B76500',
    error: '#B42318',
  },
  radius: { sm: 8, md: 12, lg: 16 },
  shadow: '0 12px 32px rgba(11, 18, 38, 0.10)',
} as const;

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.color.primary, dark: tokens.color.primaryDark, contrastText: '#FFFFFF' },
    secondary: { main: tokens.color.energy, contrastText: tokens.color.ink },
    success: { main: tokens.color.success },
    info: { main: tokens.color.info },
    warning: { main: tokens.color.warning },
    error: { main: tokens.color.error },
    background: { default: tokens.color.canvas, paper: tokens.color.surface },
    text: { primary: tokens.color.ink, secondary: tokens.color.muted },
    divider: tokens.color.line,
  },
  typography: {
    fontFamily: '"Archivo Narrow Variable", "Arial Narrow", Arial, sans-serif',
    h1: { fontSize: 'clamp(2.25rem, 8vw, 5rem)', lineHeight: 0.98, fontWeight: 780, letterSpacing: '-0.03em' },
    h2: { fontSize: 'clamp(1.75rem, 5vw, 3rem)', lineHeight: 1.05, fontWeight: 760, letterSpacing: '-0.025em' },
    h3: { fontSize: 'clamp(1.35rem, 3vw, 2rem)', lineHeight: 1.15, fontWeight: 740, letterSpacing: '-0.02em' },
    h4: { fontSize: '1.35rem', lineHeight: 1.2, fontWeight: 730 },
    h5: { fontSize: '1.15rem', lineHeight: 1.25, fontWeight: 700 },
    h6: { fontSize: '1rem', lineHeight: 1.3, fontWeight: 700 },
    body1: { fontSize: '1rem', lineHeight: 1.55 },
    body2: { fontSize: '0.9rem', lineHeight: 1.5 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: 0 },
  },
  shape: { borderRadius: tokens.radius.md },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '::selection': { background: alpha(tokens.color.primary, 0.22), color: tokens.color.ink },
        ':focus-visible': { outline: `3px solid ${alpha(tokens.color.info, 0.7)}`, outlineOffset: 3 },
        body: { scrollbarColor: `${tokens.color.primary} ${tokens.color.canvas}` },
        '*': { boxSizing: 'border-box' },
      },
    },
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 44, borderRadius: tokens.radius.sm, paddingInline: 18 },
        containedPrimary: {
          '&:hover': { backgroundColor: tokens.color.primaryDark },
        },
      },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
    MuiTextField: { defaultProps: { size: 'medium' } },
    MuiInputBase: { styleOverrides: { root: { minHeight: 44 } } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiCard: { styleOverrides: { root: { borderRadius: tokens.radius.lg } } },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: tokens.radius.lg, boxShadow: tokens.shadow },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: { border: 0, background: tokens.color.surface },
        columnHeaders: { backgroundColor: '#EEF0F6', color: tokens.color.ink },
        cell: { borderColor: tokens.color.line },
      },
    },
  },
}, ptBR);
