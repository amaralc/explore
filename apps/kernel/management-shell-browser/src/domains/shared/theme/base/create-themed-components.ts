import { backdropClasses } from '@mui/material/Backdrop';
import { filledInputClasses } from '@mui/material/FilledInput';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import { paperClasses } from '@mui/material/Paper';
import { tableCellClasses } from '@mui/material/TableCell';
import { common } from '@mui/material/colors';
import type { Components } from '@mui/material/styles/components';
import type { PaletteColor, PaletteOptions } from '@mui/material/styles/createPalette';
import { alpha } from '@mui/system/colorManipulator';

interface Config {
  palette: PaletteOptions;
  themeMode: 'light' | 'dark';
}

export const createThemedComponents = ({ palette, themeMode }: Config): Components => {
  return {
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: palette.neutral![themeMode === 'light' ? 200 : 300],
          color: common.black,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          [`&:not(.${backdropClasses.invisible})`]: {
            backgroundColor: alpha(
              themeMode === 'light' ? palette.neutral![900] : common.black,
              themeMode === 'light' ? 0.75 : 0.5,
            ),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          [`&.${paperClasses.elevation1}`]: {
            boxShadow:
              themeMode === 'light'
                ? '0px 5px 22px rgba(0, 0, 0, 0.04), 0px 0px 0px 0.5px rgba(0, 0, 0, 0.03)'
                : '0px 5px 22px rgba(0, 0, 0, 0.08), 0px 0px 0px 0.5px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        icon: {
          color: palette.action!.active,
        },
        root: {
          borderColor: palette.neutral![themeMode === 'light' ? 200 : 700],
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '#nprogress .bar': {
          backgroundColor: (palette.primary as PaletteColor).main,
        },
        '.slick-dots li button': {
          '&:before': {
            fontSize: 10,
            color: (palette.primary as PaletteColor).main,
          },
        },
        '.slick-dots li.slick-active button': {
          '&:before': {
            color: (palette.primary as PaletteColor).main,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&::placeholder': {
            color: palette.text!.secondary,
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderColor: themeMode === 'light' ? palette.neutral![200] : palette.divider,
          '&:hover': {
            backgroundColor: palette.action!.hover,
          },
          [`&.${filledInputClasses.disabled}`]: {
            backgroundColor: 'transparent',
          },
          [`&.${filledInputClasses.focused}`]: {
            backgroundColor: 'transparent',
            borderColor: (palette.primary as PaletteColor).main,
            boxShadow: `${(palette.primary as PaletteColor).main} 0 0 0 2px`,
          },
          [`&.${filledInputClasses.error}`]: {
            borderColor: (palette.error as PaletteColor).main,
            boxShadow: `${(palette.error as PaletteColor).main} 0 0 0 2px`,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: palette.action!.hover,
            [`& .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: themeMode === 'light' ? palette.neutral![200] : palette.divider,
            },
          },
          [`&.${outlinedInputClasses.focused}`]: {
            backgroundColor: 'transparent',
            [`& .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: (palette.primary as PaletteColor).main,
              borderWidth: '3px',
            },
          },
          [`&.${filledInputClasses.error}`]: {
            [`& .${outlinedInputClasses.notchedOutline}`]: {
              borderColor: (palette.error as PaletteColor).main,
              borderWidth: '3px',
            },
          },
        },
        notchedOutline: {
          borderColor: themeMode === 'light' ? palette.neutral![200] : palette.divider,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: palette.neutral![500],
        },
        track: {
          backgroundColor: palette.neutral![400],
          opacity: 1,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: palette.divider,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          [`& .${tableCellClasses.root}`]: {
            backgroundColor: themeMode === 'light' ? palette.neutral![50] : palette.neutral![800],
            color: themeMode === 'light' ? palette.neutral![700] : palette.neutral![400],
          },
        },
      },
    },
    // @ts-ignore
    MuiTimelineConnector: {
      styleOverrides: {
        root: {
          backgroundColor: palette.divider,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backdropFilter: 'blur(6px)',
          background: alpha(palette.neutral![900], 0.8),
        },
      },
    },
  };
};
