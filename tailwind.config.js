/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  darkMode: 'class', // or 'media' based on preference
  theme: {
    extend: {
      colors: {
        primary: '#5D5FEF',
        accent: '#20C997',
        darkBg: '#121212',
        lightBg: '#F9FAFB',
        lightText: '#1F2937',
        darkText: '#F1F5F9',
      },
    },
  },
  plugins: [],
}
