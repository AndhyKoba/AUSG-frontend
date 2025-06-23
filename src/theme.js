// src/theme.js (or theme.jsx)
// Make sure you are extending the default Chakra UI theme if you want to use its base components
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({ // <-- Crucial: use extendTheme
  fonts: {
    heading: `'Chivo', sans-serif`, // Pour les titres et FormLabel
    body: `'Roboto', sans-serif`,   // Pour le texte courant (body)
  },

  colors: {
    cerulean: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#08365f',
    },
    brand : {
      50: '#fef2f2',
      100: '#fee5e6',
      200: '#fccfd2',
      300: '#f9a8ad',
      400: '#f57783',
      500: '#ec475a',
      600: '#d82643',
      700: '#b61a37',
      800: '#991835',
      900: '#831833',
      950: '#490816',
    },
    antiFlask : {
      50 : '#efefef',
      100 : '#e5e7eb',
      200 : '#d1d5db',
      300 : '#9ca3af',
      400 : '#6b7280',
      500 : '#4b5563',
      600 : '#374151',
      700 : '#1e293b',
      800 : '#0f172a',
      900 : '#071528',
      950 : '#041122',
    }
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

export default theme;