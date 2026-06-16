import { createTheme, type Theme } from '@mui/material/styles';
import type { ThemeMode } from '../store/themeStore';

/**
 * Two minimalist themes as required by ui_requirements.md.
 *
 * Light: strictly black & white. Interactive elements fill with black on hover
 *        (text/icon invert to white).
 * Dark:  near-black background with dark-blue accents and a blue-black palette.
 */

const LIGHT = {
  bg: '#ffffff',
  paper: '#ffffff',
  text: '#000000',
  textSecondary: '#444444',
  border: '#000000',
  borderSubtle: '#e0e0e0',
  accent: '#000000',
  accentContrast: '#ffffff',
  hover: '#000000',
  hoverContrast: '#ffffff',
};

const DARK = {
  bg: '#0a0e17',
  paper: '#111725',
  text: '#e6ebf5',
  textSecondary: '#8b96ad',
  border: '#1e2740',
  borderSubtle: '#1a2236',
  accent: '#3b6fd4',
  accentContrast: '#ffffff',
  hover: '#16203a',
  hoverContrast: '#e6ebf5',
};

export function buildTheme(mode: ThemeMode): Theme {
  const c = mode === 'light' ? LIGHT : DARK;
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      background: { default: c.bg, paper: c.paper },
      text: { primary: c.text, secondary: c.textSecondary },
      primary: { main: c.accent, contrastText: c.accentContrast },
      divider: c.border,
      error: { main: isLight ? '#000000' : '#e5534b' },
      success: { main: isLight ? '#000000' : '#3fb950' },
      warning: { main: isLight ? '#000000' : '#d29922' },
      info: { main: isLight ? '#000000' : '#3b6fd4' },
    },
    shape: { borderRadius: isLight ? 0 : 6 },
    typography: {
      fontFamily:
        '"Inter", "Segoe UI", system-ui, -apple-system, Helvetica, Arial, sans-serif',
      h4: { fontWeight: 600, letterSpacing: '-0.02em' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: c.bg },
          '*::-webkit-scrollbar': { width: 10, height: 10 },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: c.border,
            borderRadius: 0,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${c.borderSubtle}`,
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'default' },
        styleOverrides: {
          root: {
            backgroundColor: c.paper,
            color: c.text,
            borderBottom: `1px solid ${c.border}`,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            transition: 'background-color 0.18s ease, color 0.18s ease',
          },
          outlined: {
            borderColor: c.border,
            color: c.text,
            '&:hover': {
              backgroundColor: c.hover,
              color: c.hoverContrast,
              borderColor: c.border,
            },
          },
          contained: {
            backgroundColor: c.accent,
            color: c.accentContrast,
            '&:hover': {
              backgroundColor: isLight ? '#222222' : '#4c81e6',
            },
          },
          text: {
            color: c.text,
            '&:hover': { backgroundColor: c.hover, color: c.hoverContrast },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: c.text,
            borderRadius: isLight ? 0 : 6,
            transition: 'background-color 0.18s ease, color 0.18s ease',
            '&:hover': { backgroundColor: c.hover, color: c.hoverContrast },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            transition: 'background-color 0.18s ease, color 0.18s ease',
            '&:hover': {
              backgroundColor: c.hover,
              color: c.hoverContrast,
              '& .MuiListItemIcon-root': { color: c.hoverContrast },
            },
            '&.Mui-selected': {
              backgroundColor: c.accent,
              color: c.accentContrast,
              '& .MuiListItemIcon-root': { color: c.accentContrast },
              '&:hover': { backgroundColor: c.accent, color: c.accentContrast },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: { root: { color: 'inherit', minWidth: 38 } },
      },
      MuiTableHead: {
        styleOverrides: {
          root: { '& .MuiTableCell-root': { fontWeight: 600 } },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': { backgroundColor: isLight ? '#f5f5f5' : c.hover },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: c.borderSubtle },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: isLight ? 0 : 4 },
          outlined: { borderColor: c.border },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: { borderColor: c.border },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: c.accent,
            color: c.accentContrast,
            fontSize: 12,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': { color: c.accent },
          },
        },
      },
    },
  });
}

export const themeColors = { light: LIGHT, dark: DARK };
