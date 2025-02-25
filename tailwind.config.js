/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#070705',
        secondary: '#1c1c1c',
        accent: '#c4a47c',
        text: '#e4e4e4',
        muted: '#6f737e',
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      opacity: {
        '10': '0.1',
        '20': '0.2',
        '30': '0.3',
        '40': '0.4',
        '60': '0.6',
        '70': '0.7',
        '80': '0.8',
        '90': '0.9',
      },
      backgroundColor: {
        'accent/10': 'rgba(196, 164, 124, 0.1)',
        'accent/20': 'rgba(196, 164, 124, 0.2)',
        'accent/30': 'rgba(196, 164, 124, 0.3)',
      },
      borderColor: {
        'accent/10': 'rgba(196, 164, 124, 0.1)',
        'accent/20': 'rgba(196, 164, 124, 0.2)',
        'accent/30': 'rgba(196, 164, 124, 0.3)',
      }
    },
  },
  plugins: [],
};