const tokens = require('./src/shared/theme/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: tokens.fontFamily,
      fontSize: Object.fromEntries(
        Object.entries(tokens.fontSize).map(([key, value]) => [key, [`${value}px`, { lineHeight: `${Math.round(value * 1.35)}px` }]]),
      ),
      spacing: Object.fromEntries(Object.entries(tokens.spacing).map(([key, value]) => [key, `${value}px`])),
      borderRadius: Object.fromEntries(Object.entries(tokens.radius).map(([key, value]) => [key, `${value}px`])),
    },
  },
  plugins: [],
};
