import { createTheme } from '@mui/material/styles';

// Styled Components theme (passed via context to prop.theme)
export const styledComponentsTheme = {
  dark: false,
  // colors
  primary: '#4DCAF2',
  black: '#4A4A4A',
  gray: '#7F7F7F',
  beta: '#FF5939',
  // ui
  border: '#DADADA',
  lightBorder: '#ECECEC',
  // font
  fontFamily: `"Roboto", "Helvetica Neue", Arial, sans-serif`,
  // snooze panel


  snoozePanel: {
    bgColor: '#fff', //'#373533',//   // snooze panel
    border: '#e5e9e9', // '#4B4947',
    hoverColor: '#E0E0E0', //     hoverColor: '#403E3C',
    footerTextColor: '#888888',//     footerTextColor: '#f0f0f0',
    buttonTextColor: '#788284',//     buttonTextColor: '#f4f4f4',
    countBadgeColor: '#929292',//     countBadgeColor: '#f0f0f0',

    whiteIcons: false//     whiteIcons: true,

  },
};

// Material UI Theme
export const muiTheme = createTheme({
  palette: {
    primary: { main: '#21c1f4' }, // styledComponentsTheme.primary
    text: {
      primary: '#4A4A4A',   // styledComponentsTheme.black
      secondary: '#7F7F7F', // styledComponentsTheme.gray
    },
  },
  // Note: 'ripple' was removed from theme root in MUI v5
  // Ripple effects are now configured per-component
  typography: {
    htmlFontSize: 10,
    fontFamily: `"Roboto", "Helvetica Neue", Arial, sans-serif`,
  },
  components: { // 'overrides' was renamed to 'components' in MUI v5
    // Name of the component ⚛️ / style sheet
    MuiToolbar: {
      styleOverrides: {
        root: {
          height: 48,
          minHeight: '48px !important',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: 'white',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: 4,
          paddingBottom: 4,
          paddingLeft: 12,
          paddingRight: 12,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 36,
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          paddingLeft: 12,
          lineHeight: '32px',
        },
      },
    },
  },
});